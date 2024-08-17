const cells = document.querySelectorAll('.cell');
const resetButton = document.getElementById('reset-btn');
const showTreeButton = document.getElementById('show-tree-btn');
const treeView = document.getElementById('tree-view');

let currentPlayer = 'X';
let board = Array(9).fill(null);
let treeRoot = null;
let gameOver = false;

class Node {
    constructor(board, isMaximizingPlayer) {
        this.board = board;
        this.isMaximizingPlayer = isMaximizingPlayer;
        this.children = [];
    }
}

const checkWinner = (board) => {
    const winningCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Linhas horizontais
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Linhas verticais
        [0, 4, 8], [2, 4, 6] // Diagonais
    ];

    for (let combo of winningCombinations) {
        const [a, b, c] = combo;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    return null;
};

const isFull = (board) => board.every(cell => cell !== null);

const expand = (node) => {
    const currentPlayer = node.isMaximizingPlayer ? 'X' : 'O';

    for (let i = 0; i < 9; i++) {
        if (!node.board[i]) {
            const newBoard = [...node.board];
            newBoard[i] = currentPlayer;

            const winner = checkWinner(newBoard);
            const isTerminal = winner || isFull(newBoard);

            if (isTerminal) {
                const childNode = new Node(newBoard, !node.isMaximizingPlayer);
                node.children.push(childNode);
            } else {
                const childNode = new Node(newBoard, !node.isMaximizingPlayer);
                node.children.push(childNode);
                expand(childNode);
            }
        }
    }
};

const buildTree = (board, depth, isMaximizingPlayer = true) => {
    const root = new Node(board, isMaximizingPlayer);
    expand(root);
    return root;
};

const evaluateNode = (node) => {
    const winner = checkWinner(node.board);
    if (winner === 'X') return 1;
    if (winner === 'O') return -1;
    return 0;
};

const findBestWinningPath = (node) => {
    const evalValue = evaluateNode(node);

    if (node.children.length === 0 || evalValue !== 0) {
        return { value: evalValue, path: [node] };
    }

    let bestValue = node.isMaximizingPlayer ? -Infinity : Infinity;
    let bestPath = [];

    for (let child of node.children) {
        const result = findBestWinningPath(child);
        const value = result.value;

        if (node.isMaximizingPlayer) {
            if (value > bestValue) {
                bestValue = value;
                bestPath = result.path;
            }
        } else {
            if (value < bestValue) {
                bestValue = value;
                bestPath = result.path;
            }
        }
    }

    return { value: bestValue, path: [node, ...bestPath] };
};

const findBestWinningSequence = (root) => {
    const result = findBestWinningPath(root);
    return result.path;
};

const createBoardHTML = (board) => {
    return board.map(cell => `<div class="cell ${cell || ''}">${cell || ''}</div>`).join('');
};

const printTree = (nodes) => {
    if (nodes.length === 0) return '';

    return nodes.map(node => {
        return `<div class="tree-node">
            ${createBoardHTML(node.board)}
        </div>`;
    }).join('');
};

const renderTree = (nodes) => {
    treeView.innerHTML = printTree(nodes);
};

const handleClick = (event) => {
    if (gameOver) return;

    const cell = event.target;
    const index = cell.dataset.index;

    if (board[index] || checkWinner(board)) return;

    board[index] = currentPlayer;
    cell.textContent = currentPlayer;
    cell.classList.add(currentPlayer.toLowerCase());

    const winner = checkWinner(board);
    if (winner) {
        alert(`${winner} venceu!`);
        gameOver = true;
        return;
    } else if (isFull(board)) {
        alert("Empate!");
        gameOver = true;
        return;
    }

    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    
    treeRoot = buildTree(board, 9, currentPlayer === 'X');
};

const showTree = () => {
    if (treeRoot) {
        const bestSequence = findRandomWinningSequence(treeRoot);
        if (bestSequence) {
            renderTree(bestSequence);
        }
    }
};

showTreeButton.addEventListener('click', showTree);


const resetGame = () => {
    board = Array(9).fill(null);
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('x', 'o');
    });
    currentPlayer = 'X';
    gameOver = false;

    treeView.innerHTML = '';
};

cells.forEach((cell, index) => {
    cell.dataset.index = index;
    cell.addEventListener('click', handleClick);
});
resetButton.addEventListener('click', resetGame);
showTreeButton.addEventListener('click', () => {
    if (treeRoot) {
        const bestSequence = findBestWinningSequence(treeRoot);
        renderTree(bestSequence);
    }
});
