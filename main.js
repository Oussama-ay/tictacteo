let board = [['_','_','_'],['_','_','_'],['_','_','_']];
let playerTurn = true; // true = human (X), false = AI (O)
let wasmReady = false;
let gameOver = false;

window.Module = window.Module || {};
window.Module.onRuntimeInitialized = () => {
    wasmReady = true;
    setStatus('Your turn');
};

function setStatus(message) {
    const statusEl = document.getElementById('status');
    if (statusEl) statusEl.textContent = message;
}

function renderBoard() {
    const boardDiv = document.getElementById('game-board');
    boardDiv.innerHTML = '';
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = i;
            cell.dataset.col = j;
            cell.textContent = board[i][j] === '_' ? '' : board[i][j];
            cell.onclick = () => handleCellClick(i, j);
            boardDiv.appendChild(cell);
        }
    }
}

function checkWinner() {
    const lines = [
        // Rows
        [[0, 0], [0, 1], [0, 2]],
        [[1, 0], [1, 1], [1, 2]],
        [[2, 0], [2, 1], [2, 2]],
        // Columns
        [[0, 0], [1, 0], [2, 0]],
        [[0, 1], [1, 1], [2, 1]],
        [[0, 2], [1, 2], [2, 2]],
        // Diagonals
        [[0, 0], [1, 1], [2, 2]],
        [[0, 2], [1, 1], [2, 0]]
    ];
    for (const line of lines) {
        const [a, b, c] = line;
        const v1 = board[a[0]][a[1]];
        const v2 = board[b[0]][b[1]];
        const v3 = board[c[0]][c[1]];
        if (v1 !== '_' && v1 === v2 && v2 === v3) {
            return v1;
        }
    }
    return null;
}

function isDraw() {
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (board[i][j] === '_') return false;
        }
    }
    return true;
}

function handleCellClick(i, j) {
    if (gameOver || !playerTurn || board[i][j] !== '_') return;
    board[i][j] = 'x';
    playerTurn = false;
    setStatus('AI thinking...');
    renderBoard();
    const winner = checkWinner();
    if (winner) {
        gameOver = true;
        setStatus(winner === 'x' ? 'You win!' : 'AI wins!');
        return;
    }
    if (isDraw()) {
        gameOver = true;
        setStatus('Draw');
        return;
    }
    setTimeout(aiMove, 200);
}

function aiMove() {
    if (gameOver) return;
    if (!wasmReady || typeof Module === 'undefined' || !Module._find_best_move) {
        setStatus('Loading AI...');
        setTimeout(aiMove, 100);
        return;
    }
    const heap = Module.HEAPU8 || (typeof HEAPU8 !== 'undefined' ? HEAPU8 : null);
    const malloc = Module._malloc || (typeof _malloc !== 'undefined' ? _malloc : null);
    const free = Module._free || (typeof _free !== 'undefined' ? _free : null);
    if (!heap || !malloc || !free) {
        setStatus('Loading AI...');
        setTimeout(aiMove, 100);
        return;
    }
    // Flatten board to string for WASM
    let boardStr = board.flat().join('');
    let ptr = malloc(9);
    for (let k = 0; k < 9; k++) {
        heap[ptr + k] = boardStr.charCodeAt(k);
    }
    let move = Module._find_best_move(ptr);
    let row = (move >> 8) & 0xFF;
    let col = move & 0xFF;
    free(ptr);
    if (row >= 0 && col >= 0 && board[row][col] === '_') {
        board[row][col] = 'o';
    }
    playerTurn = true;
    const winner = checkWinner();
    if (winner) {
        gameOver = true;
        setStatus(winner === 'x' ? 'You win!' : 'AI wins!');
    } else if (isDraw()) {
        gameOver = true;
        setStatus('Draw');
    } else {
        setStatus('Your turn');
    }
    renderBoard();
}

document.getElementById('restart').onclick = () => {
    board = [['_','_','_'],['_','_','_'],['_','_','_']];
    playerTurn = true;
    gameOver = false;
    setStatus(wasmReady ? 'Your turn' : 'Loading AI...');
    renderBoard();
};

window.onload = () => {
    setStatus('Loading AI...');
    renderBoard();
};
