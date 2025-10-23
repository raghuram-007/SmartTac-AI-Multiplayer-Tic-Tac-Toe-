import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .ai import check_winner

class GameConsumer(AsyncWebsocketConsumer):
    # Track players per room: { room_name: [ {channel, symbol} ] }
    players = {}

    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'game_{self.room_name}'

        # Join room group
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

        # Get requested symbol from URL kwargs (optional)
        chosen_symbol = self.scope['url_route']['kwargs'].get('player_symbol', None)

        room_players = GameConsumer.players.get(self.room_name, [])

        # If room full, reject connection
        if len(room_players) >= 2:
            await self.close()
            return

        # Assign symbol
        if chosen_symbol in ['X', 'O']:
            # If chosen symbol already taken, reject
            if any(p['symbol'] == chosen_symbol for p in room_players):
                await self.close()
                return
            symbol = chosen_symbol
        else:
            # Auto-assign if no symbol chosen
            symbol = 'X' if len(room_players) == 0 else 'O'

        # Add player to room
        room_players.append({'channel': self.channel_name, 'symbol': symbol})
        GameConsumer.players[self.room_name] = room_players

        # Notify both players
        for p in room_players:
            await self.channel_layer.send(
                p['channel'],
                {
                    'type': 'player_info',
                    'symbol': p['symbol'],
                    'opponent_joined': len(room_players) == 2
                }
            )

    async def disconnect(self, close_code):
        # Remove player from tracking
        room_players = GameConsumer.players.get(self.room_name, [])
        room_players = [p for p in room_players if p['channel'] != self.channel_name]

        if room_players:
            GameConsumer.players[self.room_name] = room_players
        else:
            GameConsumer.players.pop(self.room_name, None)

        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        action = data.get('action')
        board = data.get('board', [])
        player = data.get('player')

        # --- Handle game moves ---
        if action == 'move':
            from django.contrib.auth.models import User
            from aiapp.models import GameHistory

            move_index = data.get('move')
            board[move_index] = player
            winner = check_winner(board)

            if winner or '' not in board:
                # Game over
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'game_over',
                        'winner': winner or 'draw',
                        'board': board
                    }
                )
            else:
                # Update board
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'update_board',
                        'board': board,
                        'player': player
                    }
                )

        # --- Handle continue / exit ---
        elif action == 'continue':
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'player_continue',
                    'player': player
                }
            )

        elif action == 'exit':
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'player_exit',
                    'player': player
                }
            )

        # --- Handle chat messages ---
        elif action == 'chat':
            message = data.get('message', {})
            if message and 'player' in message and 'text' in message:
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'broadcast_chat',
                        'player': message['player'],
                        'text': message['text']
                    }
                )

    # --- Send board updates to client ---
    async def update_board(self, event):
        await self.send(text_data=json.dumps({
            'type': 'update_board',
            'board': event['board'],
            'player': event['player']
        }))

    # --- Send game over info to client ---
    async def game_over(self, event):
        await self.send(text_data=json.dumps({
            'type': 'game_over',
            'winner': event['winner'],
            'board': event['board']
        }))

    # --- Send player info (symbol + opponent joined) ---
    async def player_info(self, event):
        await self.send(text_data=json.dumps({
            'type': 'connected',
            'player_symbol': event['symbol'],
            'opponentJoined': event['opponent_joined']
        }))

    # --- Notify when a player wants to continue ---
    async def player_continue(self, event):
        await self.send(text_data=json.dumps({
            'type': 'player_continue',
            'player': event['player']
        }))

    # --- Notify when a player exits ---
    async def player_exit(self, event):
        await self.send(text_data=json.dumps({
            'type': 'player_exit',
            'player': event['player']
        }))

    # --- Broadcast chat messages to clients ---
    async def broadcast_chat(self, event):
        await self.send(text_data=json.dumps({
            'type': 'chat',  # <-- matches React component
            'message': {
                'player': event['player'],
                'text': event['text']
            }
        }))
