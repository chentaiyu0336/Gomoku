const BOARD_SIZE = 15; // 棋盘大小
const WIN_COUNT = 5;   // 连子数
const PLAYER = 'X';
const AI = 'O';
let gameBoard = Array(BOARD_SIZE * BOARD_SIZE).fill('');
let gameOver = false;

// 检查是否获胜的方向
const DIRECTIONS = [
    [1, 0],   // 水平
    [0, 1],   // 垂直
    [1, 1],   // 右下对角
    [1, -1]   // 右上对角
];

function initializeBoard() {
    const board = document.getElementById('board');
    for (let i = 0; i < BOARD_SIZE * BOARD_SIZE; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.setAttribute('data-index', i);
        cell.addEventListener('click', handleCellClick);
        board.appendChild(cell);
    }
}

// 可能获胜检查逻辑
function checkMayBeWin(player, lastMove, winCount) {
    const row = Math.floor(lastMove / BOARD_SIZE);
    const col = lastMove % BOARD_SIZE;
    let count = 1;
    let canWin = false;
    let cellBeforeFirst; // 检查连子前一个棋格子
    let cellAfterLast; // 检查连子后一个棋格子
    
    DIRECTIONS.some(([dx, dy]) => {
        count = 1;
        cellBeforeFirst = null; // 检查连子前一个棋格子
        cellAfterLast = null; // 检查连子后一个棋格子
        
        // 正向检查
        for (let i = 1; i < winCount; i++) {
            const newRow = row + dx * i;
            const newCol = col + dy * i;
            if (!isValidPosition(newRow, newCol)) {
                break;
            }
            if (getCell(newRow, newCol) !== player) {
                cellAfterLast = getCell(newRow, newCol);
                break;
            }   
            count++;
        }

        // 反向检查
        for (let i = 1; i < winCount; i++) {
            const newRow = row - dx * i;
            const newCol = col - dy * i;
            if (!isValidPosition(newRow, newCol)) {
                break;
            }
            if (getCell(newRow, newCol) !== player) {
                cellBeforeFirst = getCell(newRow, newCol);
                break;
            }
            count++;
        }
        canWin = count >= winCount || (count === (winCount - 1) && cellBeforeFirst === '' && cellAfterLast === '');
        return canWin === true;
    });

    return {
        canWin: canWin,
        count: count
    }
}

// 实际获胜检查逻辑
function checkActualWin(player, lastMove) {
    const row = Math.floor(lastMove / BOARD_SIZE);
    const col = lastMove % BOARD_SIZE;
    
    return DIRECTIONS.some(([dx, dy]) => {
        let count = 1;
        
        // 正向检查
        for (let i = 1; i < WIN_COUNT; i++) {
            const newRow = row + dx * i;
            const newCol = col + dy * i;
            if (!isValidPosition(newRow, newCol)) {
                break;
            }
            if (getCell(newRow, newCol) !== player) {
                break;
            }   
            count++;
        }

        // 反向检查
        for (let i = 1; i < WIN_COUNT; i++) {
            const newRow = row - dx * i;
            const newCol = col - dy * i;
            if (!isValidPosition(newRow, newCol)) {
                break;
            }
            if (getCell(newRow, newCol) !== player) {
                break;
            }
            count++;
        }
        return count >= WIN_COUNT;
    });
}

function isValidPosition(row, col) {
    return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
}

function getCell(row, col) {
    return gameBoard[row * BOARD_SIZE + col];
}

function findBestMove() {
    // 1. 检查AI能否直接获胜
    let winMove = findWinningMove(AI, WIN_COUNT);
    
    // 2. 阻止玩家获胜
    let blockMove = findWinningMove(PLAYER, WIN_COUNT);

    // 如果AI和玩家都能获胜，则选择AI获胜的步数最多的位置
    if (winMove !== null && blockMove !== null) {
        return winMove.count >= blockMove.count ? winMove.moveIndex : blockMove.moveIndex;
    }

    if (winMove !== null) {
        return winMove.moveIndex;
    }

    if (blockMove !== null) {
        return blockMove.moveIndex;
    }

    let winMoveBefore1 = findWinningMove(AI, 4);
    if (winMoveBefore1 !== null) {
        return winMoveBefore1.moveIndex;
    } 
    
    let winMoveBefore2 = findWinningMove(AI, 3);
    if (winMoveBefore2 !== null) {
        return winMoveBefore2.moveIndex;
    }
    
    // 3. 寻找最有价值的位置
    return findStrategicMove();
}

function findStrategicMove() {
    let bestScore = -1;
    let bestMove = null;
    
    for (let i = 0; i < gameBoard.length; i++) {
        if (!gameBoard[i]) {
            let score = evaluatePosition(i);
            if (score > bestScore) {
                bestScore = score;
                bestMove = i;
            }
        }
    }
    return bestMove || gameBoard.findIndex(cell => !cell);
}

function evaluatePosition(pos) {
    const row = Math.floor(pos / BOARD_SIZE);
    const col = pos % BOARD_SIZE;
    let score = 0;
    
    // 评估周围8个方向的棋子分布
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue;
            
            let playerCount = 0;
            let aiCount = 0;
            
            // 检查连续4个位置
            for (let step = 1; step < 5; step++) {
                const newRow = row + i * step;
                const newCol = col + j * step;
                
                if (!isValidPosition(newRow, newCol)) break;
                
                const cell = getCell(newRow, newCol);
                if (cell === PLAYER) playerCount++;
                else if (cell === AI) aiCount++;
            }
            
            score += evaluateLineScore(playerCount, aiCount);
        }
    }
    
    return score;
}

function evaluateLineScore(playerCount, aiCount) {
    if (playerCount === 0 && aiCount > 0) return aiCount * 2;
    if (aiCount === 0 && playerCount > 0) return playerCount * 3;
    return 0;
}

function makePlayerMove(index) {
    if (gameBoard[index] || gameOver) return;
    
    // 玩家移动
    confirmMoveAction(index, PLAYER);
    
    // 检查玩家是否获胜
    if (checkActualWin(PLAYER, index)) {
        document.getElementById('status').textContent = `你赢啦！`;
        gameOver = true;
    }
}

function continueAIResponse() {
    if (gameOver) {
        return;
    }
    if (gameBoard.includes('')) {
        // 切换到 AI 移动
        document.getElementById('status').textContent = "AI 思考中...";

        // 延迟一下让 AI 移动看起来更自然
        setTimeout(makeAIMove, 500);
    } else {
        document.getElementById('status').textContent = "平局！";
        gameOver = true;
    }
}

function makeAIMove() {
    let bestMove = findBestMove();
    
    // AI 执行移动
    confirmMoveAction(bestMove, AI);
    
    // 检查 AI 是否获胜
    if (checkActualWin(AI, bestMove)) {
        document.getElementById('status').textContent = "AI 获胜！下次加油咯";
        gameOver = true;
        return;
    }
    
    // 切换回玩家回合
    if (gameBoard.includes('')) {
        document.getElementById('status').textContent = "轮到你了";
    } else {
        document.getElementById('status').textContent = "平局！";
        gameOver = true;
    }
}

function findWinningMove(player, winCount) {
    for (let i = 0; i < gameBoard.length; i++) {
        if (!gameBoard[i]) {
            gameBoard[i] = player;
            let { canWin, count } = checkMayBeWin(player, i, winCount);
            if (winCount != WIN_COUNT && checkMoveInEdge(i)) {
                canWin = false;
            }   
            if (canWin) {
                gameBoard[i] = '';
                return { moveIndex: i, count: count };
            }
            gameBoard[i] = '';
        }
    }
    return null;
}

function checkMoveInEdge(index) {
    const row = Math.floor(index / BOARD_SIZE);
    const col = index % BOARD_SIZE;
    return row === 0 || row === BOARD_SIZE - 1 || col === 0 || col === BOARD_SIZE - 1;
}

function confirmMoveAction(index, player) {
    gameBoard[index] = player;
    const cell = document.querySelectorAll('.cell')[index];
    cell.classList.add(player); // 添加类名实现棋子样式
}

function restartGame() {
    gameBoard = Array(BOARD_SIZE * BOARD_SIZE).fill('');
    gameOver = false;
    document.getElementById('status').textContent = `可以开始啦`;
    document.querySelectorAll('.cell').forEach(cell => {
        cell.className = 'cell'; // 清除棋子样式
    });
}

function handleCellClick(e) {
    const index = e.target.getAttribute('data-index');
    makePlayerMove(index);
    continueAIResponse();
}

initializeBoard(); 