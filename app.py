from flask import Flask, render_template, request, jsonify
from solver import GridWorld

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/solve', methods=['POST'])
def solve():
    data = request.json
    if not data:
        return jsonify({'error': 'Invalid data'}), 400
        
    size = int(data.get('size', 5))
    walls_list = data.get('walls', [])
    walls = [tuple(w) for w in walls_list]
    
    # Initialize solver with size and walls
    gw = GridWorld(size=size, walls=walls)
    gw.value_iteration()
    
    # Needs to match the format for JS
    return jsonify({
        'values': gw.V.tolist(),
        'policy': gw.policy.tolist(),
        'path': gw.get_optimal_path()
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
