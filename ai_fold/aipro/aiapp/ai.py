import random

def check_winner(board):
    winning_condition = [
        [0,1,2],[3,4,5],[6,7,8],
        [0,3,6],[1,4,7],[2,5,8],
        [0,4,8],[2,4,6]
    ]
    for a,b,c in winning_condition:
        if board[a] == board[b] == board[c] and board[a] != '':
            return board[a]
    return None

# Original minimax & best_move (leave as-is)
def minimax(board, is_maximizing):
    winner = check_winner(board)
    if winner == 'O': return 1
    if winner == 'X': return -1
    if '' not in board: return 0

    if is_maximizing:
        best_score = -float('inf')
        for i in range(9):
            if board[i] == '':
                board[i] = 'O'
                score = minimax(board, False)
                board[i] = ''
                best_score = max(score, best_score)
        return best_score
    else:
        best_score = float('inf')
        for i in range(9):
            if board[i] == '':
                board[i] = 'X'
                score = minimax(board, True)
                board[i] = ''
                best_score = min(score, best_score)
        return best_score

def best_move(board):
    best_score = -float('inf')
    move = None
    for i in range(9):
        if board[i] == '':
            board[i] = 'O'
            score = minimax(board, False)
            board[i] = ''
            if score > best_score:
                best_score = score
                move = i
    return move

# ===== Add this for difficulty support =====
def minimax_custom(board, is_maximizing, ai_symbol, player_symbol):
    winner = check_winner(board)
    if winner == ai_symbol: return 1
    if winner == player_symbol: return -1
    if '' not in board: return 0

    if is_maximizing:
        best_score = -float('inf')
        for i in range(9):
            if board[i] == '':
                board[i] = ai_symbol
                score = minimax_custom(board, False, ai_symbol, player_symbol)
                board[i] = ''
                best_score = max(score, best_score)
        return best_score
    else:
        best_score = float('inf')
        for i in range(9):
            if board[i] == '':
                board[i] = player_symbol
                score = minimax_custom(board, True, ai_symbol, player_symbol)
                board[i] = ''
                best_score = min(score, best_score)
        return best_score

def best_move_custom(board, ai_symbol='O', player_symbol='X'):
    best_score = -float('inf')
    move = None
    for i in range(9):
        if board[i] == '':
            board[i] = ai_symbol
            score = minimax_custom(board, False, ai_symbol, player_symbol)
            board[i] = ''
            if score > best_score:
                best_score = score
                move = i
    return move
