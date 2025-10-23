import random
from aiapp.models import QLearningState

class QLearningAI:
    def __init__(self, alpha=0.5, gamma=0.8, epsilon=0.2):
        self.alpha = alpha   # learning rate
        self.gamma = gamma   # discount factor
        self.epsilon = epsilon  # exploration rate

    def encode_state(self, board):
        """Turn list ['X','','O',...] → single string for DB key"""
        return ",".join(board)

    def get_q_value(self, state, action):
        """Fetch Q-value from DB or initialize if missing"""
        obj, _ = QLearningState.objects.get_or_create(state=state, action=action)
        return obj.q_value

    def set_q_value(self, state, action, value):
        """Save new Q-value to DB"""
        obj, _ = QLearningState.objects.get_or_create(state=state, action=action)
        obj.q_value = value
        obj.save()

    def choose_action(self, board, ai_symbol):
        """Epsilon-greedy move choice"""
        state = self.encode_state(board)
        empty = [i for i, c in enumerate(board) if c == '']
        if not empty:
            return None

        if random.random() < self.epsilon:
            # random exploration
            return random.choice(empty)

        # exploitation → best known Q
        q_values = [(a, self.get_q_value(state, a)) for a in empty]
        max_q = max(q_values, key=lambda x: x[1])[1]
        best_actions = [a for a, q in q_values if q == max_q]
        return random.choice(best_actions)

    def update_q_value(self, prev_board, action, reward, next_board):
        """Update Q(state,action) after seeing reward"""
        prev_state = self.encode_state(prev_board)
        next_state = self.encode_state(next_board)
        current_q = self.get_q_value(prev_state, action)
        # max future Q
        next_qs = QLearningState.objects.filter(state=next_state)
        max_next_q = max([q.q_value for q in next_qs], default=0)
        new_q = current_q + self.alpha * (reward + self.gamma * max_next_q - current_q)
        self.set_q_value(prev_state, action, new_q)
    
    
    def choose_best_action(self, board, ai_symbol):
        state = self.encode_state(board)
        empty = [i for i, c in enumerate(board) if c == '']
        if not empty:
            return None

        q_values = [(a, self.get_q_value(state, a)) for a in empty]
        max_q = max(q_values, key=lambda x: x[1])[1]
        best_actions = [a for a, q in q_values if q == max_q]
        # If multiple actions have same Q, pick randomly among them
        return random.choice(best_actions)