import random
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
import time
from rest_framework.response import Response
from .ai import check_winner, best_move_custom
from django.contrib.auth.models import User
from rest_framework import status
from .serializers import RegisterSerializer,GameHistorySerializer,ProfileSerializer
from django.contrib.auth import authenticate
from aiapp.models import GameHistory
from django.db import models
from django.views.decorators.csrf import csrf_exempt
from aiapp.models import*
from aiapp.q_learning import QLearningAI
from django.utils import timezone



# Global score tracker
SCORES = {'X': 0, 'O': 0, 'draw': 0}

@csrf_exempt
@permission_classes([IsAuthenticated])
@api_view(['POST'])
def ai_move(request):
    """
    Gameplay AI uses minimax for moves.
      - easy: random
      - medium: 50% random / 50% minimax
      - hard: minimax (optimal)
    Q-learning is NOT used in gameplay (Q-learning remains only for hints/training).
    """
    global SCORES

    board = request.data.get('board', [])
    player_symbol = request.data.get('player_symbol', 'X')
    ai_symbol = 'O' if player_symbol == 'X' else 'X'
    difficulty = request.data.get('difficulty', 'hard')

    if not board or len(board) != 9:
        return Response({'error': 'Invalid board'}, status=400)

    # Pre-check winner
    winner = check_winner(board)
    if winner is None and '' not in board:
        winner = 'draw'

    if winner:
        if winner in ['X', 'O']:
            SCORES[winner] += 1
        else:
            SCORES['draw'] += 1
        board = [''] * 9
        return Response({'winner': winner, 'move': None, 'board': board, 'scores': SCORES})

    empty_cells = [i for i, cell in enumerate(board) if cell == '']
    if not empty_cells:
        return Response({'move': None, 'board': board, 'winner': None, 'scores': SCORES})

    move = None
    if difficulty == 'easy':
        move = random.choice(empty_cells)
    elif difficulty == 'medium':
        if random.random() < 0.5:
            move = random.choice(empty_cells)
        else:
            move = best_move_custom(board, ai_symbol, player_symbol)
    else:  # hard: deterministic minimax
        move = best_move_custom(board, ai_symbol, player_symbol)

    if move is not None:
        board[move] = ai_symbol

    # Post-check winner
    winner_after = check_winner(board)
    if winner_after is None and '' not in board:
        winner_after = 'draw'

    if winner_after:
        if winner_after in ['X', 'O']:
            SCORES[winner_after] += 1
        else:
            SCORES['draw'] += 1
        board = [''] * 9  # reset after game ends

    return Response({
        'move': move,
        'board': board,
        'winner': winner_after,
        'scores': SCORES
    })

    
    
@api_view(['POST'])
def register(request):
   serializer=RegisterSerializer(data=request.data)
   if serializer.is_valid():
        serializer.save()
        return Response(serializer.data,status=status.HTTP_201_CREATED)
    
    
@api_view(['POST'])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)

    if user:
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'username': user.username
        }, status=status.HTTP_200_OK)
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_game_result(request):
    user = request.user
    result = request.data.get('result')
    player_symbol = request.data.get('player_symbol', 'X')
    ai_symbol = request.data.get('ai_symbol', 'O')
    moves_count = request.data.get('moves_count', 0)
    duration = request.data.get('duration', 0.0)

    game = GameHistory.objects.create(
        user=user,
        result=result,
        player_symbol=player_symbol,
        ai_symbol=ai_symbol,
        moves_count=moves_count,
        duration=duration
    )

    # (Optional future enhancement)
    # reward = 1 if result == 'Win' else -1 if result == 'Loss' else 0
    # ai = QLearningAI()
    # ai.update_q_value(prev_state, action, reward, next_state)

    return Response({'message': 'Game saved!', 'id': game.id})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_stats(request):
    user = request.user
    games = GameHistory.objects.filter(user=user)

    total = games.count()
    wins = games.filter(result='Win').count()
    losses = games.filter(result='Loss').count()
    draws = games.filter(result='Draw').count()

    avg_moves = games.aggregate(models.Avg('moves_count'))['moves_count__avg'] or 0
    avg_time = games.aggregate(models.Avg('duration'))['duration__avg'] or 0

    return Response({
        'total_games': total,
        'wins': wins,
        'losses': losses,
        'draws': draws,
        'win_rate': round((wins / total) * 100, 2) if total > 0 else 0,
        'avg_moves': round(avg_moves, 2),
        'avg_duration': round(avg_time, 2),
    })
    
    
@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def profile_view(request):
    user = request.user
    profile, _ = Profile.objects.get_or_create(user=user)  # ensures profile always exists

    if request.method == "GET":
        # compute stats from GameHistory
        games = GameHistory.objects.filter(user=user).order_by('created_at')

        total = games.count()
        wins = games.filter(result='Win').count()
        losses = games.filter(result='Loss').count()
        draws = games.filter(result='Draw').count()

        # compute streaks (consecutive wins)
        best_streak = 0
        streak = 0
        for g in games.order_by('-created_at'):
            if g.result == 'Win':
                streak += 1
                best_streak = max(best_streak, streak)
            else:
                streak = 0

        # compute current streak
        cur = 0
        for g in games.order_by('-created_at'):
            if g.result == 'Win':
                cur += 1
            else:
                break

        # serialize profile
        profile_data = ProfileSerializer(profile).data

        # merge computed stats
        profile_data.update({
            'total_games': total,
            'wins': wins,
            'losses': losses,
            'draws': draws,
            'win_rate': round((wins / total) * 100, 2) if total > 0 else 0,
            'avg_moves': round(games.aggregate(models.Avg('moves_count'))['moves_count__avg'] or 0, 2),
            'avg_duration': round(games.aggregate(models.Avg('duration'))['duration__avg'] or 0, 2),
            'current_streak': cur,
            'best_streak': best_streak,
        })

        return Response(profile_data)

    # PUT — allow updating avatar, username, email
    if request.method == "PUT":
        serializer = ProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()  # ✅ remove user=request.user
            return Response(serializer.data, status=200)
        return Response(serializer.errors, status=400)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def hint_move(request):
    user = request.user
    board = request.data.get('board', [])
    player_symbol = request.data.get('player_symbol', 'X')
    ai_symbol = 'O' if player_symbol == 'X' else 'X'

    if not board or len(board) != 9:
        return Response({'error': 'Invalid board'}, status=400)

    # Check or create daily usage
    today = timezone.now().date()
    usage, _ = DailyHintUsage.objects.get_or_create(user=user, date=today)
    if usage.count >= 3:
        return Response({'error': 'Daily hint limit reached'}, status=403)

    # Generate hint (always best according to Q-learning)
    ai = QLearningAI()
    move = ai.choose_best_action(board, ai_symbol)

    # Increment usage
    usage.count += 1
    usage.save()

    return Response({'hint_move': move, 'remaining': 3 - usage.count})
