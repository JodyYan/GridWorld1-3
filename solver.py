import numpy as np

class GridWorld:
    def __init__(self, size=5, walls=None, end_state=None):
        self.size = size
        self.walls = set(walls) if walls else set()
        self.end_state = end_state if end_state else (size - 1, size - 1)
        self.start_state = (0, 0)
        
        # Hyperparameters
        self.gamma = 0.9
        self.reward_goal = 100.0
        self.reward_wall = -10.0
        self.reward_step = -0.1
        self.theta = 1e-4 # convergence threshold

        self.actions = {
            'up': (-1, 0),
            'down': (1, 0),
            'left': (0, -1),
            'right': (0, 1)
        }
        self.action_keys = ['up', 'down', 'left', 'right']

        self.V = np.zeros((self.size, self.size))
        self.policy = np.full((self.size, self.size), 'right', dtype=object)

    def is_valid(self, r, c):
        return 0 <= r < self.size and 0 <= c < self.size

    def step(self, r, c, action_key):
        if (r, c) == self.end_state:
            return r, c, 0.0, True # Terminal
        if (r, c) in self.walls:
            return r, c, self.reward_wall, False # Stuck in wall or terminal? Let's say it's just a state with negative reward

        dr, dc = self.actions[action_key]
        nr, nc = r + dr, c + dc

        if not self.is_valid(nr, nc):
            return r, c, self.reward_step, False
        if (nr, nc) in self.walls:
            return r, c, self.reward_wall, False
        if (nr, nc) == self.end_state:
            return nr, nc, self.reward_goal, True
        
        return nr, nc, self.reward_step, False

    def value_iteration(self):
        # Initialize Values
        self.V = np.zeros((self.size, self.size))
        
        while True:
            delta = 0
            new_V = np.copy(self.V)
            
            for r in range(self.size):
                for c in range(self.size):
                    if (r, c) == self.end_state:
                        new_V[r, c] = 0.0 # Terminal state value is 0
                        continue
                    if (r, c) in self.walls:
                        new_V[r, c] = 0.0 # Walls have no value to compute, or negative
                        continue
                        
                    action_values = []
                    for a in self.action_keys:
                        nr, nc, reward, is_terminal = self.step(r, c, a)
                        val = reward + self.gamma * self.V[nr, nc]
                        action_values.append(val)
                    
                    best_action_val = max(action_values)
                    delta = max(delta, abs(best_action_val - self.V[r, c]))
                    new_V[r, c] = best_action_val
            
            self.V = new_V
            if delta < self.theta:
                break
                
        self.extract_policy()
        return self.V.tolist(), self.policy.tolist()

    def extract_policy(self):
        for r in range(self.size):
            for c in range(self.size):
                if (r, c) == self.end_state:
                    self.policy[r, c] = 'end'
                    continue
                if (r, c) in self.walls:
                    self.policy[r, c] = 'wall'
                    continue
                
                best_val = -float('inf')
                best_action = 'up'
                for a in self.action_keys:
                    nr, nc, reward, is_terminal = self.step(r, c, a)
                    val = reward + self.gamma * self.V[nr, nc]
                    if val > best_val:
                        best_val = val
                        best_action = a
                self.policy[r, c] = best_action
                
    def get_optimal_path(self):
        curr = self.start_state
        path = [curr]
        visited = set([curr])
        while curr != self.end_state:
            r, c = curr
            action = self.policy[r, c]
            if action in ['end', 'wall']:
                break
            
            dr, dc = self.actions[action]
            nr, nc = r + dr, c + dc
            if (nr, nc) in visited or not self.is_valid(nr, nc) or (nr, nc) in self.walls:
                break # Loop or stuck
            curr = (nr, nc)
            path.append(curr)
            visited.add(curr)
        return path
