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

function fetchData() {
    fetch('/api/solve', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            size: currentSize,
            walls: walls
        })
    })
        .then(response => response.json())
        .then(data => {
            policyData = data.policy;
            valueData = data.values;
            pathData = data.path;
            renderGrids();
        });
}

function isPath(r, c) {
    return pathData.some(p => p[0] === r && p[1] === c);
}

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
                    // Always color the path yellow in policy grid
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
                vCell.innerText = val; // value will be hidden by css color
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
