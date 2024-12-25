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

    checkMayBeWin(player, lastMove, winCount) {
        const row = Math.floor(lastMove / GameConfig.BOARD_SIZE);
        const col = lastMove % GameConfig.BOARD_SIZE;
        let count = 1;
        let canWin = false;

        GameConfig.DIRECTIONS.some(([dx, dy]) => {
            count = 1;
            const lineResult = this._checkLineInDirection(player, row, col, dx, dy, winCount);
            count = lineResult.count;
            
            canWin = count >= winCount || 
                (count === (winCount - 1) && lineResult.beforeFirst === '' && lineResult.afterLast === '');

            return canWin;
        });

        return {
            canWin,
            count: count
        };
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

    _checkLineInDirection(player, row, col, dx, dy, winCount) {
        let count = 1;
        let beforeFirst = null; // 检查连子前一个棋格子
        let afterLast = null; // 检查连子后一个棋格子

        // 检查正向
        const forwardResult = this._countAndCheckEnd(player, row, col, dx, dy, winCount);
        count += forwardResult.count;
        afterLast = forwardResult.endCell;

        // 检查反向
        const backwardResult = this._countAndCheckEnd(player, row, col, -dx, -dy, winCount);
        count += backwardResult.count;
        beforeFirst = backwardResult.endCell;

        return {
            count,
            beforeFirst,
            afterLast
        };
    }

    _countAndCheckEnd(player, startRow, startCol, dx, dy, maxCount) {
        let count = 0;
        let endCell = null;

        for (let i = 1; i < maxCount; i++) {
            const newRow = startRow + dx * i;
            const newCol = startCol + dy * i;

            if (!this.board.isValidPosition(newRow, newCol)) {
                break;
            }

            const cell = this.board.getCell(newRow, newCol);
            if (cell !== player) {
                endCell = cell;
                break;
            }

            count++;
        }

        return { count, endCell };
    }

} 