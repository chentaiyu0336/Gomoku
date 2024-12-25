import { GameConfig } from './config.js';

export class GameLogic {
    constructor(board) {
        this.board = board;
    }

    checkActualWin(player, lastMove) {
        const row = Math.floor(lastMove / GameConfig.BOARD_SIZE);
        const col = lastMove % GameConfig.BOARD_SIZE;

        return GameConfig.DIRECTIONS.some(([dx, dy]) => 
            this._checkDirection(player, row, col, dx, dy));
    }

    _checkDirection(player, row, col, dx, dy) {
        let count = 1;

        // 正向检查
        count += this._countInDirection(player, row, col, dx, dy);
        // 反向检查
        count += this._countInDirection(player, row, col, -dx, -dy);

        return count >= GameConfig.WIN_COUNT;
    }

    _countInDirection(player, row, col, dx, dy) {
        let count = 0;
        for (let i = 1; i < GameConfig.WIN_COUNT; i++) {
            const newRow = row + dx * i;
            const newCol = col + dy * i;
            
            if (!this.board.isValidPosition(newRow, newCol) || 
                this.board.getCell(newRow, newCol) !== player) {
                break;
            }
            count++;
        }
        return count;
    }

    checkMayBeWin(player, lastMove, winCount) {
        const row = Math.floor(lastMove / GameConfig.BOARD_SIZE);
        const col = lastMove % GameConfig.BOARD_SIZE;
        let count = 1;
        let canWin = false;
        let cellBeforeFirst; // 检查连子前一个棋格子
        let cellAfterLast; // 检查连子后一个棋格子
    
        GameConfig.DIRECTIONS.some(([dx, dy]) => {
            count = 1;
            cellBeforeFirst = null;
            cellAfterLast = null;
    
            for (let i = 1; i < winCount; i++) {
                const newRow = row + dx * i;
                const newCol = col + dy * i;
                if (!this.board.isValidPosition(newRow, newCol)) {
                    break;
                }
                if (this.board.getCell(newRow, newCol) !== player) {
                    cellAfterLast = this.board.getCell(newRow, newCol);
                    break;
                }
                count++;
            }
    
            for (let i = 1; i < winCount; i++) {
                const newRow = row - dx * i;
                const newCol = col - dy * i;
                if (!this.board.isValidPosition(newRow, newCol)) {
                    break;
                }
                if (this.board.getCell(newRow, newCol) !== player) {
                    cellBeforeFirst = this.board.getCell(newRow, newCol);
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
} 