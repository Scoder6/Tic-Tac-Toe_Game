// Game Variables
let turn = "X";
let isGameOver = false;
let scores = { X: 0, O: 0 };
let vsAI = false;
let gameMode = "player";

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
const imgBox = document.querySelector('.imgbox img');

// Audio Elements - using relative paths for GitHub Pages
const clickSound = new Audio("./click.wav");
const winSound = new Audio("./GameOver.wav");

// Initialize the game
function initGame() {
    // Set player names
    updatePlayerNames();

    // Update scores display
    updateScores();

    // Set initial turn display
    updateTurnDisplay();

    // Add event listeners
    addEventListeners();

    // Ensure audio can play
    preloadAudio();
}

function addEventListeners() {
    addBoxEventListeners();
    resetButton.addEventListener('click', resetGame);
    playerXInput.addEventListener('input', updatePlayerNames);
    playerOInput.addEventListener('input', updatePlayerNames);
    aiToggle.addEventListener('change', toggleAIMode);

    themeButtons.forEach(button => {
        button.addEventListener('click', () => {
            document.documentElement.setAttribute('data-theme', button.dataset.theme);
        });
    });
}

function preloadAudio() {
    // This helps with audio playback on mobile devices
    clickSound.load();
    winSound.load();
}

function addBoxEventListeners() {
    Array.from(boxes).forEach(box => {
        box.addEventListener('click', handleBoxClick);
    });
}

function handleBoxClick(e) {
    if (isGameOver) return;

    const boxText = e.target.querySelector('.boxText') || e.target;

    if (boxText.innerText === '') {
        if ((turn === 'X') || (turn === 'O' && !vsAI)) {
            makeMove(boxText);

            if (vsAI && !isGameOver && turn === 'O') {
                setTimeout(makeAIMove, 500);
            }
        }
    }
}

function makeMove(boxText) {
    boxText.innerText = turn;
    playSound(clickSound);

    if (checkWin()) {
        handleWin();
    } else if (checkDraw()) {
        handleDraw();
    } else {
        changeTurn();
        updateTurnDisplay();
    }
}

function playSound(sound) {
    sound.currentTime = 0;
    sound.play().catch(e => console.log("Audio play failed:", e));
}

function changeTurn() {
    turn = turn === "X" ? "O" : "X";
}

function updateTurnDisplay() {
    currentPlayerDisplay.textContent = turn;
    const playerName = turn === 'X' ? playerXName.textContent : playerOName.textContent;
    infoDisplay.textContent = `Turn for ${playerName}`;
}

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

function drawWinningLine(pattern) {
    const line = document.querySelector('.line');
    const container = document.querySelector('.container');

    const firstBox = boxes[pattern[0]].getBoundingClientRect();
    const lastBox = boxes[pattern[2]].getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    const x1 = firstBox.left + firstBox.width/2 - containerRect.left;
    const y1 = firstBox.top + firstBox.height/2 - containerRect.top;
    const x2 = lastBox.left + lastBox.width/2 - containerRect.left;
    const y2 = lastBox.top + lastBox.height/2 - containerRect.top;

    const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;

    line.style.width = `${length}px`;
    line.style.transform = `translate(${x1}px, ${y1}px) rotate(${angle}deg)`;
    line.style.opacity = '1';
}

function handleWin() {
    isGameOver = true;
    playSound(winSound);

    // Update score
    scores[turn]++;
    updateScores();

    // Update info display
    const winnerName = turn === 'X' ? playerXName.textContent : playerOName.textContent;
    infoDisplay.textContent = `${winnerName} wins!`;

    // Show celebration image
    imgBox.style.width = "200px";
}

function updateScores() {
    document.querySelector('.x-player .score').textContent = scores.X;
    document.querySelector('.o-player .score').textContent = scores.O;
}

function checkDraw() {
    const boxTexts = document.querySelectorAll('.boxText');
    return Array.from(boxTexts).every(box => box.innerText !== '');
}

function handleDraw() {
    isGameOver = true;
    infoDisplay.textContent = "It's a draw!";
}

function makeAIMove() {
    if (!isGameOver && turn === 'O' && vsAI) {
        const move = findBestMove();
        if (move) {
            const boxText = move.querySelector('.boxText');
            makeMove(boxText);
        }
    }
}

function findBestMove() {
    const boxTexts = document.querySelectorAll('.boxText');
    const emptyBoxes = Array.from(boxes).filter((_, index) => boxTexts[index].innerText === '');

    // Try to win
    let move = findWinningMove('O');
    if (!move) {
        // Block opponent
        move = findWinningMove('X');
        if (!move) {
            // Center first, then corners, then edges
            const center = boxes[4];
            if (boxTexts[4].innerText === '') return center;

            const corners = [0, 2, 6, 8].filter(i => boxTexts[i].innerText === '');
            if (corners.length > 0) {
                return boxes[corners[Math.floor(Math.random() * corners.length)]];
            }

            const edges = [1, 3, 5, 7].filter(i => boxTexts[i].innerText === '');
            if (edges.length > 0) {
                return boxes[edges[Math.floor(Math.random() * edges.length)]];
            }
        }
    }
    return move;
}

function findWinningMove(player) {
    const boxTexts = document.querySelectorAll('.boxText');
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    for (const pattern of winPatterns) {
        const [a, b, c] = pattern;
        const values = [boxTexts[a].innerText, boxTexts[b].innerText, boxTexts[c].innerText];
        const playerCount = values.filter(v => v === player).length;
        const emptyCount = values.filter(v => v === '').length;

        if (playerCount === 2 && emptyCount === 1) {
            const emptyIndex = values.indexOf('');
            return boxes[pattern[emptyIndex]];
        }
    }
    return null;
}

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
    imgBox.style.width = '0';
}

function toggleAIMode() {
    vsAI = aiToggle.checked;
    playerOInput.disabled = vsAI;
    updatePlayerNames();
    resetGame();
}

function updatePlayerNames() {
    const playerX = playerXInput.value.trim() || "Player X";
    const playerO = vsAI ? "Computer" : (playerOInput.value.trim() || "Player O");

    playerXName.textContent = playerX;
    playerOName.textContent = playerO;
    updateTurnDisplay();
}

// Initialize the game when DOM is fully loaded
document.addEventListener('DOMContentLoaded', initGame);