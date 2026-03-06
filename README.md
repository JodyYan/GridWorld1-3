# RL Gridworld Visualizer (Value Iteration)

This project is an interactive Gridworld visualization application that implements the **Value Iteration** algorithm. Built using Flask for the backend and HTML/CSS/JS for the frontend.

## Features
- **Dynamic Grid Size**: Adjust the grid size from 3x3 up to 10x10.
- **Interactive Obstacles**: Click on any grid cell to toggle a wall/obstacle. The policy and value functions update dynamically.
- **Value Iteration Visualization**:
  - Displays the optimal policy (arrows mapping the optimal path).
  - Displays the Value Function for each state to two decimal places.

## Setup Instructions

1. Ensure you have Python installed.
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the Flask application:
   ```bash
   python app.py
   ```
4. Open your browser and navigate to `http://127.0.0.1:5000/`.
