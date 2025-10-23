import itertools
from aiapp.models import QLearningState
from aiapp.q_learning import QLearningAI

def all_boards():
    """Generate all possible board states recursively"""
    states = []

    def generate(board):
        if len(board) == 9:
            states.append(board)
            return
        for c in ['X', 'O', '']:
            generate(board + [c])

    generate([])
    return states

def reward(board, ai_symbol, player_symbol):
    """Return reward from AI perspective"""
    # simple winning check
    wins = [
        [0,1,2],[3,4,5],[6,7,8],  # rows
        [0,3,6],[1,4,7],[2,5,8],  # cols
        [0,4,8],[2,4,6]           # diagonals
    ]
    for line in wins:
        cells = [board[i] for i in line]
        if all(c == ai_symbol for c in cells):
            return 1  # AI wins
        if all(c == player_symbol for c in cells):
            return -1  # AI loses
    if '' not in board:
        return 0  # draw
    return None  # ongoing

def pretrain(ai_symbol='O', player_symbol='X'):
    ai = QLearningAI(alpha=0.5, gamma=0.8, epsilon=0)
    boards = all_boards()
    for board in boards:
        empty = [i for i, c in enumerate(board) if c == '']
        if not empty:
            continue
        for action in empty:
            r = reward(board, ai_symbol, player_symbol)
            if r is not None:
                # terminal states
                ai.set_q_value(','.join(board), action, r)
            else:
                # intermediate states → max Q of next possible states
                next_board = board.copy()
                next_board[action] = ai_symbol
                next_empty = [i for i, c in enumerate(next_board) if c == '']
                max_next_q = 0
                for next_action in next_empty:
                    q = ai.get_q_value(','.join(next_board), next_action)
                    if q > max_next_q:
                        max_next_q = q
                ai.set_q_value(','.join(board), action, max_next_q)

    print("Pre-training complete! Q-table populated with optimal moves.")

if __name__ == "__main__":
    pretrain()
