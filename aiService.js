import { GameConfig } from './config.js';

export class AiService {
    constructor(board, gameLogic) {
        this.board = board;
        this.gameLogic = gameLogic;
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
        const row = Math.floor(pos / GameConfig.BOARD_SIZE);
        const col = pos % GameConfig.BOARD_SIZE;
        let score = 0;

        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue;

                let playerCount = 0;
                let aiCount = 0;

                for (let step = 1; step < 3; step++) {
                    const newRow = row + i * step;
                    const newCol = col + j * step;

                    if (!this.board.isValidPosition(newRow, newCol)) break;

                    const cell = this.board.getCell(newRow, newCol);
                    if (cell === GameConfig.PLAYER) playerCount++;
                    else if (cell === GameConfig.AI) aiCount++;
                }

                score += this._evaluateLineScore(playerCount, aiCount);
            }
        }

        // 额外考虑中心位置的权重
        if (this._isNearCenter(row, col)) {
            score += 2;
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

    _evaluateLineScore(playerCount, aiCount) {
        if (playerCount && aiCount) return 1;  // 双方都有子
        if (playerCount) return playerCount * 2;  // 只有玩家的子
        if (aiCount) return aiCount * 3;  // 只有 AiService 的子
        return 1;  // 空线
    }

    _isNearCenter(row, col) {
        const center = Math.floor(GameConfig.BOARD_SIZE / 2);
        return Math.abs(row - center) <= 2 && Math.abs(col - center) <= 2;
    }
} 