import { GameConfig } from './config.js';

export class AiService {
    constructor(board, gameLogic) {
        this.board = board;
        this.gameLogic = gameLogic;
        this.difficulty = GameConfig.DIFFICULTY.NORMAL; // 默认普通难度
    }

    setDifficulty(difficulty) {
        this.difficulty = difficulty;
    }

    findBestMove() {
        const winMove = this._findWinMove(GameConfig.AI);
        if (winMove) {
            return winMove;
        }

        const blockMove = this._findWinMove(GameConfig.PLAYER);
        if (blockMove) {
            return blockMove;
        }

        return this._findStrategicMove();
    }

    _findWinMove(player) {
        for (let i = 0; i < this.board.cells.length; i++) {
            if (this.board.isEmpty(i)) {
                this.board.setCell(i, player);
                let canWin = this.gameLogic.checkActualWin(player, i);
                this.board.setCell(i, '');
                if (canWin) {
                    return i;
                }
            }
        }
        return null;
    }

    _findStrategicMove() {
        let bestScore = -1;
        let bestMove = null;

        for (let i = 0; i < this.board.cells.length; i++) {
            if (this.board.isEmpty(i)) {
                const score = this._evaluatePosition(i);
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            }
        }

        return bestMove || this.board.cells.findIndex(cell => cell === '');
    }

    _evaluatePosition(pos) {
        switch(this.difficulty) {
            case GameConfig.DIFFICULTY.EASY:
                return this._evaluatePositionEasy(pos);
            case GameConfig.DIFFICULTY.HARD:
                return this._evaluatePositionHard(pos);
            default:
                return this._evaluatePositionNormal(pos);
        }
    }

    // 弱智模式评估算法
    _evaluatePositionEasy(pos) {
        const row = Math.floor(pos / GameConfig.BOARD_SIZE);
        const col = pos % GameConfig.BOARD_SIZE;
        const center = Math.floor(GameConfig.BOARD_SIZE / 2);
        const distanceToCenter = Math.max(Math.abs(row - center), Math.abs(col - center));
        
        let score = 5 - distanceToCenter;

        // 随机因素，让AI偶尔做出"错误"的选择
        if (Math.random() < 0.3) {  // 30%的概率做出随机选择
            score += Math.random() * 100;
        }

        const opponentPatterns = this.gameLogic.checkSpecialPatterns(GameConfig.PLAYER, pos);
        if (opponentPatterns.liveFour) {
            score += 50;  // 降低防守权重
        }
        if (opponentPatterns.deadFour || opponentPatterns.liveThree) {
            score += 30;  // 降低防守权重
        }

        return score;
    }

    // 普通模式评估算法
    _evaluatePositionNormal(pos) {
        let score = 0;
        const row = Math.floor(pos / GameConfig.BOARD_SIZE);
        const col = pos % GameConfig.BOARD_SIZE;
        const center = Math.floor(GameConfig.BOARD_SIZE / 2);
        const distanceToCenter = Math.max(Math.abs(row - center), Math.abs(col - center));

        score += Math.max(0, 5 - distanceToCenter);

        // 检查特殊棋型
        const patterns = this.gameLogic.checkSpecialPatterns(GameConfig.AI, pos);
        if (patterns.liveFour) score += 1000;
        if (patterns.deadFour) score += 500;
        if (patterns.liveThree) score += 200;
        
        const opponentPatterns = this.gameLogic.checkSpecialPatterns(GameConfig.PLAYER, pos);
        if (opponentPatterns.liveFour) score += 900;
        if (opponentPatterns.deadFour) score += 400;
        if (opponentPatterns.liveThree) score += 150;

        return score;
    }

    // 大师模式评估算法
    _evaluatePositionHard(pos) {
        const row = Math.floor(pos / GameConfig.BOARD_SIZE);
        const col = pos % GameConfig.BOARD_SIZE;
        let score = 0;

        const center = Math.floor(GameConfig.BOARD_SIZE / 2);
        const distanceToCenter = Math.max(Math.abs(row - center), Math.abs(col - center));
        
        score += Math.max(0, 5 - distanceToCenter);
        
        if (this.moveHistory && this.moveHistory.length < 4) {
            if (row === 0 || row === GameConfig.BOARD_SIZE - 1 || 
                col === 0 || col === GameConfig.BOARD_SIZE - 1) {
                score -= 10;
            }
        }

        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue;

                let playerCount = 0;
                let aiCount = 0;
                let emptyBefore = false;
                let emptyAfter = false;

                if (this.board.isValidPosition(row - i, col - j) && 
                    this.board.getCell(row - i, col - j) === '') {
                    emptyBefore = true;
                }

                for (let step = 0; step < 4; step++) {
                    const newRow = row + i * step;
                    const newCol = col + j * step;

                    if (!this.board.isValidPosition(newRow, newCol)) break;

                    const cell = this.board.getCell(newRow, newCol);
                    if (cell === GameConfig.PLAYER) playerCount++;
                    else if (cell === GameConfig.AI) aiCount++;
                    else break;
                }

                if (this.board.isValidPosition(row + i * 4, col + j * 4) && 
                    this.board.getCell(row + i * 4, col + j * 4) === '') {
                    emptyAfter = true;
                }

                if (emptyBefore && emptyAfter) {
                    if (aiCount > 0) score += aiCount * 4;
                    if (playerCount > 0) score += playerCount * 3;
                }
            }
        }

        // 添加特殊棋型的评分
        const patterns = this.gameLogic.checkSpecialPatterns(GameConfig.AI, pos);
        if (patterns.liveFour) score += 1000;
        if (patterns.deadFour) score += 500;
        if (patterns.liveThree) score += 200;
        
        // 检查是否需要防守对手的特殊棋型
        const opponentPatterns = this.gameLogic.checkSpecialPatterns(GameConfig.PLAYER, pos);
        if (opponentPatterns.liveFour) score += 900;
        if (opponentPatterns.deadFour) score += 400;
        if (opponentPatterns.liveThree) score += 150;
        
        return score;
    }
} 