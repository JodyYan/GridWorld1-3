let currentSize = 5;
let walls = [];
let policyData = [];
let valueData = [];
let pathData = [];

document.getElementById('generate-btn').addEventListener('click', () => {
    const sizeInput = document.getElementById('grid-size').value;
    let newSize = parseInt(sizeInput);
    if (newSize >= 3 && newSize <= 10) {
        currentSize = newSize;
        walls = []; // Reset walls on resize
        document.getElementById('grid-title').innerText = `${currentSize} x ${currentSize} Grid:`;
        fetchData();
    } else {
        alert("Size must be between 3 and 10.");
    }
});

function isWall(r, c) {
    return walls.some(w => w[0] === r && w[1] === c);
}

function toggleWall(r, c) {
    if ((r === 0 && c === 0) || (r === currentSize - 1 && c === currentSize - 1)) {
        return; // Don't allow walls on start and end
    }

    const wallIndex = walls.findIndex(w => w[0] === r && w[1] === c);
    if (wallIndex === -1) {
        walls.push([r, c]);
    } else {
        walls.splice(wallIndex, 1);
    }
    fetchData();
}

function fetchData() {
    // Perform Value Iteration locally instead of hitting API
    const gamma = 0.9;
    const reward_goal = 100.0;
    const reward_wall = -10.0;
    const reward_step = -0.1;
    const theta = 1e-4;

    const end_state = [currentSize - 1, currentSize - 1];

    let V = Array(currentSize).fill(0).map(() => Array(currentSize).fill(0));
    let policy = Array(currentSize).fill(0).map(() => Array(currentSize).fill('right'));

    const actions = {
        'up': [-1, 0],
        'down': [1, 0],
        'left': [0, -1],
        'right': [0, 1]
    };
    const action_keys = ['up', 'down', 'left', 'right'];

    function step(r, c, action_key) {
        if (r === end_state[0] && c === end_state[1]) return { nr: r, nc: c, reward: 0.0, terminal: true };
        if (isWall(r, c)) return { nr: r, nc: c, reward: reward_wall, terminal: false };

        let dr = actions[action_key][0];
        let dc = actions[action_key][1];
        let nr = r + dr, nc = c + dc;

        if (nr < 0 || nr >= currentSize || nc < 0 || nc >= currentSize) return { nr: r, nc: c, reward: reward_step, terminal: false };
        if (isWall(nr, nc)) return { nr: r, nc: c, reward: reward_wall, terminal: false };
        if (nr === end_state[0] && nc === end_state[1]) return { nr: nr, nc: nc, reward: reward_goal, terminal: true };

        return { nr: nr, nc: nc, reward: reward_step, terminal: false };
    }

    // Value Iteration
    while (true) {
        let delta = 0;
        let new_V = V.map(row => [...row]);

        for (let r = 0; r < currentSize; r++) {
            for (let c = 0; c < currentSize; c++) {
                if (r === end_state[0] && c === end_state[1]) {
                    new_V[r][c] = 0.0;
                    continue;
                }
                if (isWall(r, c)) {
                    new_V[r][c] = 0.0;
                    continue;
                }

                let action_values = [];
                for (let a of action_keys) {
                    let res = step(r, c, a);
                    let val = res.reward + gamma * V[res.nr][res.nc];
                    action_values.push(val);
                }

                let best_action_val = Math.max(...action_values);
                delta = Math.max(delta, Math.abs(best_action_val - V[r][c]));
                new_V[r][c] = best_action_val;
            }
        }
        V = new_V;
        if (delta < theta) break;
    }

    // Extract Policy
    for (let r = 0; r < currentSize; r++) {
        for (let c = 0; c < currentSize; c++) {
            if (r === end_state[0] && c === end_state[1]) {
                policy[r][c] = 'end';
                continue;
            }
            if (isWall(r, c)) {
                policy[r][c] = 'wall';
                continue;
            }

            let best_val = -Infinity;
            let best_action = 'up';
            for (let a of action_keys) {
                let res = step(r, c, a);
                let val = res.reward + gamma * V[res.nr][res.nc];
                if (val > best_val) {
                    best_val = val;
                    best_action = a;
                }
            }
            policy[r][c] = best_action;
        }
    }

    // Extract Path
    let path = [[0, 0]];
    let curr = [0, 0];
    let visited = new Set(['0,0']);
    while (curr[0] !== end_state[0] || curr[1] !== end_state[1]) {
        let r = curr[0], c = curr[1];
        let action = policy[r][c];
        if (action === 'end' || action === 'wall') break;

        let dr = actions[action][0];
        let dc = actions[action][1];
        let nr = r + dr, nc = c + dc;

        if (visited.has(`${nr},${nc}`) || nr < 0 || nr >= currentSize || nc < 0 || nc >= currentSize || isWall(nr, nc)) break;
        curr = [nr, nc];
        path.push(curr);
        visited.add(`${nr},${nc}`);
    }

    policyData = policy;
    valueData = V;
    pathData = path;
    renderGrids();
}

function isPath(r, c) {
    return pathData.some(p => p[0] === r && p[1] === c);
}

function getArrow(action) {
    switch (action) {
        case 'up': return '↑';
        case 'down': return '↓';
        case 'left': return '←';
        case 'right': return '→';
        case 'end': return 'end';
        case 'wall': return '';
        default: return '';
    }
}

function renderGrids() {
    const policyGrid = document.getElementById('policy-grid');
    const valueGrid = document.getElementById('value-grid');
    policyGrid.innerHTML = '';
    valueGrid.innerHTML = '';

    for (let i = 0; i < currentSize; i++) {
        const pRow = document.createElement('div');
        pRow.className = 'grid-row';
        const vRow = document.createElement('div');
        vRow.className = 'grid-row';

        for (let j = 0; j < currentSize; j++) {
            // Policy Cell
            const pCell = document.createElement('div');
            pCell.className = 'grid-cell';
            const action = policyData[i][j];

            if (isWall(i, j)) {
                pCell.classList.add('bg-gray');
                pCell.innerText = '';
            } else {
                pCell.innerText = getArrow(action);
                if (isPath(i, j)) {
                    pCell.classList.add('bg-yellow');
                } else if (i === currentSize - 1 && j === currentSize - 1) {
                    pCell.classList.add('bg-yellow');
                } else {
                    pCell.classList.add('bg-white');
                }
            }

            pCell.addEventListener('click', () => toggleWall(i, j));
            pRow.appendChild(pCell);

            // Value Cell
            const vCell = document.createElement('div');
            vCell.className = 'grid-cell value-cell';
            const val = parseFloat(valueData[i][j]).toFixed(2);

            if (isWall(i, j)) {
                vCell.classList.add('bg-gray');
                vCell.innerText = val;
            } else if (i === currentSize - 1 && j === currentSize - 1) {
                vCell.classList.add('bg-red');
                vCell.innerText = "0.00";
            } else if (i === 0 && j === 0) {
                vCell.classList.add('bg-green');
                vCell.innerText = val;
            } else {
                if (parseFloat(val) > 16.0) {
                    vCell.classList.add('bg-blue');
                } else {
                    vCell.classList.add('bg-white');
                }
                vCell.innerText = val;
            }
            vRow.appendChild(vCell);
        }
        policyGrid.appendChild(pRow);
        valueGrid.appendChild(vRow);
    }
}

// Initial fetch
fetchData();
