import { GameConfig } from './config.js';

export class AiService {
    constructor(board, gameLogic) {
        this.board = board;
        this.gameLogic = gameLogic;
    }

    findBestMove() {
        for (let length = GameConfig.WIN_COUNT; length >= 3; length--) {
            const potentialWin = this._findBestPotentialWinMove(length);
            if (potentialWin !== null) {
                console.log('has potentialWin: ', JSON.stringify(potentialWin));
                return potentialWin.moveIndex;
            }
        }

        return this._findStrategicMove();
    }

    _findBestPotentialWinMove(winCount) {
        let winMove = this._findWinningMove(GameConfig.AI, winCount);
        let blockMove = this._findWinningMove(GameConfig.PLAYER, winCount);
        
        if (winMove && blockMove) {
            console.log('>>> winMove: ', JSON.stringify(winMove));
            console.log('>>> blockMove: ', JSON.stringify(blockMove));
            return winMove.count >= blockMove.count ? winMove : blockMove;
        }
    
        if (winMove) {
            console.log('>>> winMove: ', JSON.stringify(winMove));
            return winMove;
        }
    
        if (blockMove) {
            console.log('>>> blockMove: ', JSON.stringify(blockMove));
            return blockMove;
        }

        return null;
    }

    _findWinningMove(player, winCount) {
        let winMove = null;
        for (let i = 0; i < this.board.cells.length; i++) {
            if (this.board.isEmpty(i)) {
                this.board.setCell(i, player);
                let { canWin, count } = this.gameLogic.checkMayBeWin(player, i, winCount);
                if (winCount !== GameConfig.WIN_COUNT && this._checkMoveInEdge(i)) {
                    canWin = false;
                }
                if (canWin && (!winMove || winMove.count < count)) {
                    winMove = { moveIndex: i, count: count };
                }
                this.board.setCell(i, '');
            }
        }
        return winMove;
    }

    _findStrategicMove() {
        console.log('in findStrategicMove');
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

    _checkMoveInEdge(index) {
        const row = Math.floor(index / GameConfig.BOARD_SIZE);
        const col = index % GameConfig.BOARD_SIZE;
        return row === 0 || row === GameConfig.BOARD_SIZE - 1 || col === 0 || col === GameConfig.BOARD_SIZE - 1;
    }
} 