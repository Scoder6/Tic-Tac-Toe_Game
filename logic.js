// Game Variables
let turn = "X";
let isGameOver = false;
let scores = { X: 0, O: 0 };
let vsAI = false;
let gameMode = "player"; // 'player' or 'ai'

// DOM Elements
const boxes = document.getElementsByClassName("box");
const infoDisplay = document.querySelector('.info');
const resetButton = document.getElementById('reset');
const playerXInput = document.getElementById('playerX');
const playerOInput = document.getElementById('playerO');
const playerXName = document.getElementById('playerXName');
const playerOName = document.getElementById('playerOName');
const currentPlayerDisplay = document.getElementById('currentPlayer');
const aiToggle = document.getElementById('aiToggle');
const themeButtons = document.querySelectorAll('.theme-selector button');

// Audio Elements
const clickSound = new Audio("click.wav");
const winSound = new Audio("GameOver.wav");

// Initialize the game
function initGame() {
    // Set player names
    playerXName.textContent = playerXInput.value || "Player X";
    playerOName.textContent = playerOInput.value || "Player O";

    // Update scores display
    document.querySelector('.x-player .score').textContent = scores.X;
    document.querySelector('.o-player .score').textContent = scores.O;

    // Set initial turn display
    currentPlayerDisplay.textContent = turn;
    infoDisplay.textContent = `Turn for ${turn === 'X' ? playerXName.textContent : playerOName.textContent}`;

    // Add event listeners
    addBoxEventListeners();
    resetButton.addEventListener('click', resetGame);
    playerXInput.addEventListener('change', updatePlayerNames);
    playerOInput.addEventListener('change', updatePlayerNames);
    aiToggle.addEventListener('change', toggleAIMode);
    themeButtons.forEach(button => {
        button.addEventListener('click', () => {
            document.documentElement.setAttribute('data-theme', button.dataset.theme);
        });
    });
}

// Add click event listeners to all boxes
function addBoxEventListeners() {
    Array.from(boxes).forEach(box => {
        box.addEventListener('click', handleBoxClick);
    });
}

// Handle box click
function handleBoxClick(e) {
    const boxText = e.target.querySelector('.boxText') || e.target;

    if (boxText.innerText === '' && !isGameOver) {
        // Human player move
        if ((turn === 'X' || (turn === 'O' && !vsAI))) {
            makeMove(boxText);

            // If playing against AI and game isn't over, make AI move
            if (vsAI && !isGameOver && turn === 'O') {
                setTimeout(makeAIMove, 500);
            }
        }
    }
}

// Make a move
function makeMove(boxText) {
    boxText.innerText = turn;
    clickSound.play();

    if (checkWin()) {
        handleWin();
    } else if (checkDraw()) {
        handleDraw();
    } else {
        changeTurn();
        updateTurnDisplay();
    }
}

// Change turn
function changeTurn() {
    turn = turn === "X" ? "O" : "X";
}

// Update turn display
function updateTurnDisplay() {
    currentPlayerDisplay.textContent = turn;
    const playerName = turn === 'X' ? playerXName.textContent : playerOName.textContent;
    infoDisplay.textContent = `Turn for ${playerName}`;
}

// Check for win
function checkWin() {
    const boxTexts = document.querySelectorAll('.boxText');
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6]             // diagonals
    ];

    return winPatterns.some(pattern => {
        const [a, b, c] = pattern;
        if (boxTexts[a].innerText &&
            boxTexts[a].innerText === boxTexts[b].innerText &&
            boxTexts[a].innerText === boxTexts[c].innerText) {

            drawWinningLine(pattern);
            return true;
        }
        return false;
    });
}

// Draw winning line
function drawWinningLine(pattern) {
    const line = document.querySelector('.line');
    const container = document.querySelector('.container');
    const boxSize = container.offsetWidth / 3;

    const firstBox = boxes[pattern[0]].getBoundingClientRect();
    const lastBox = boxes[pattern[2]].getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    // Calculate line parameters
    const x1 = firstBox.left + firstBox.width/2 - containerRect.left;
    const y1 = firstBox.top + firstBox.height/2 - containerRect.top;
    const x2 = lastBox.left + lastBox.width/2 - containerRect.left;
    const y2 = lastBox.top + lastBox.height/2 - containerRect.top;

    const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;

    // Apply styles
    line.style.width = `${length}px`;
    line.style.transform = `translate(${x1}px, ${y1}px) rotate(${angle}deg)`;
    line.style.opacity = '1';
}

// Handle win
function handleWin() {
    isGameOver = true;
    winSound.play();

    // Update score
    scores[turn]++;
    const scoreElement = turn === 'X'
        ? document.querySelector('.x-player .score')
        : document.querySelector('.o-player .score');
    scoreElement.textContent = scores[turn];

    // Update info display
    const winnerName = turn === 'X' ? playerXName.textContent : playerOName.textContent;
    infoDisplay.textContent = `${winnerName} wins!`;

    // Show celebration image
    document.querySelector('.imgbox img').style.width = "200px";
}

// Check for draw
function checkDraw() {
    const boxTexts = document.querySelectorAll('.boxText');
    return Array.from(boxTexts).every(box => box.innerText !== '');
}

// Handle draw
function handleDraw() {
    isGameOver = true;
    infoDisplay.textContent = "It's a draw!";
}

// AI Move
function makeAIMove() {
    if (!isGameOver && turn === 'O' && vsAI) {
        // Simple AI - first tries to win, then blocks, then random
        const boxTexts = document.querySelectorAll('.boxText');
        const emptyBoxes = Array.from(boxes).filter((box, index) => boxTexts[index].innerText === '');

        if (emptyBoxes.length > 0) {
            // Try to find winning move
            let move = findWinningMove('O');
            if (move === null) {
                // Block opponent's winning move
                move = findWinningMove('X');
                if (move === null) {
                    // Random move
                    move = emptyBoxes[Math.floor(Math.random() * emptyBoxes.length)];
                }
            }

            const boxText = move.querySelector('.boxText');
            makeMove(boxText);
        }
    }
}

// Find winning move for a player
function findWinningMove(player) {
    const boxTexts = document.querySelectorAll('.boxText');
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6]             // diagonals
    ];

    for (const pattern of winPatterns) {
        const [a, b, c] = pattern;
        const boxesInPattern = [boxTexts[a], boxTexts[b], boxTexts[c]];

        // Count player marks and empty boxes in this pattern
        const playerCount = boxesInPattern.filter(box => box.innerText === player).length;
        const emptyBoxes = boxesInPattern.filter(box => box.innerText === '');

        if (playerCount === 2 && emptyBoxes.length === 1) {
            // Found a winning move
            const emptyIndex = boxesInPattern.indexOf(emptyBoxes[0]);
            return boxes[pattern[emptyIndex]];
        }
    }

    return null;
}

// Reset game
function resetGame() {
    // Clear board
    document.querySelectorAll('.boxText').forEach(box => {
        box.innerText = '';
    });

    // Reset game state
    isGameOver = false;
    turn = 'X';
    updateTurnDisplay();

    // Hide winning line and celebration image
    document.querySelector('.line').style.opacity = '0';
    document.querySelector('.imgbox img').style.width = '0';
}

// Toggle AI mode
function toggleAIMode() {
    vsAI = aiToggle.checked;
    if (vsAI) {
        playerOInput.value = "Computer";
        playerOName.textContent = "Computer";
        playerOInput.disabled = true;
    } else {
        playerOInput.disabled = false;
        playerOInput.value = "Player O";
        playerOName.textContent = playerOInput.value || "Player O";
    }
    resetGame();
}

// Update player names
function updatePlayerNames() {
    playerXName.textContent = playerXInput.value || "Player X";
    playerOName.textContent = playerOInput.value || "Player O";
    updateTurnDisplay();
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', initGame);