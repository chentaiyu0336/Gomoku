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

    checkSpecialPatterns(player, lastMove) {
        const row = Math.floor(lastMove / GameConfig.BOARD_SIZE);
        const col = lastMove % GameConfig.BOARD_SIZE;
        
        return {
            liveFour: this._checkLiveFour(player, row, col),
            deadFour: this._checkDeadFour(player, row, col),
            liveThree: this._checkLiveThree(player, row, col)
        };
    }

    _checkLiveFour(player, row, col) {
        let liveFourCount = 0;
        
        GameConfig.DIRECTIONS.forEach(([dx, dy]) => {
            const pattern = this._getLinePattern(player, row, col, dx, dy, GameConfig.WIN_COUNT);
            // 活四模式: _XXXX_ (其中X是玩家棋子，_是空位)
            if (pattern.beforeFirst === '' && pattern.count === (GameConfig.WIN_COUNT - 1) && pattern.afterLast === '') {
                liveFourCount++;
            }
        });
        
        return liveFourCount;
    }

    _checkDeadFour(player, row, col) {
        let deadFourCount = 0;
        
        GameConfig.DIRECTIONS.forEach(([dx, dy]) => {
            const pattern = this._getLinePattern(player, row, col, dx, dy, GameConfig.WIN_COUNT);
            // 冲四模式: XXXX_ 或 _XXXX (其中一端被封)
            if ((pattern.count === (GameConfig.WIN_COUNT - 1) && 
                (pattern.beforeFirst === '' || pattern.afterLast === '') &&
                !(pattern.beforeFirst === '' && pattern.afterLast === ''))) {
                deadFourCount++;
            }
        });
        
        return deadFourCount;
    }

    _checkLiveThree(player, row, col) {
        let liveThreeCount = 0;
        
        GameConfig.DIRECTIONS.forEach(([dx, dy]) => {
            const pattern = this._getLinePattern(player, row, col, dx, dy, GameConfig.WIN_COUNT);
            // 活三模式: __XXX__ (可以形成活四的三连子)
            if (pattern.beforeFirst === '' && pattern.count === (GameConfig.WIN_COUNT - 2) && pattern.afterLast === '') {
                liveThreeCount++;
            }
        });
        
        return liveThreeCount;
    }

    _getLinePattern(player, row, col, dx, dy, length) {
        // 获取一条线上的棋型
        let beforeFirst = null;
        let afterLast = null;
        let count = 1;
        
        // 向前检查
        for (let i = 1; i < length; i++) {
            const newRow = row - dx * i;
            const newCol = col - dy * i;
            
            if (!this.board.isValidPosition(newRow, newCol)) {
                beforeFirst = 'edge';
                break;
            }
            
            const cell = this.board.getCell(newRow, newCol);
            if (cell !== player) {
                beforeFirst = cell;
                break;
            }
            count++;
        }
        
        // 向后检查
        for (let i = 1; i < length; i++) {
            const newRow = row + dx * i;
            const newCol = col + dy * i;
            
            if (!this.board.isValidPosition(newRow, newCol)) {
                afterLast = 'edge';
                break;
            }
            
            const cell = this.board.getCell(newRow, newCol);
            if (cell !== player) {
                afterLast = cell;
                break;
            }
            count++;
        }
        
        return { count, beforeFirst, afterLast };
    }

    getWinningCells(player, lastMove) {
        const row = Math.floor(lastMove / GameConfig.BOARD_SIZE);
        const col = lastMove % GameConfig.BOARD_SIZE;
        
        for (const [dx, dy] of GameConfig.DIRECTIONS) {
            const winningCells = this._getWinningCellsInDirection(player, row, col, dx, dy);
            if (winningCells.length >= GameConfig.WIN_COUNT) {
                return winningCells;
            }
        }
        return [];
    }

    _getWinningCellsInDirection(player, row, col, dx, dy) {
        const winningCells = [row * GameConfig.BOARD_SIZE + col];
        
        // 正向检查
        for (let i = 1; i < GameConfig.WIN_COUNT; i++) {
            const newRow = row + dx * i;
            const newCol = col + dy * i;
            
            if (!this.board.isValidPosition(newRow, newCol) || 
                this.board.getCell(newRow, newCol) !== player) {
                break;
            }
            winningCells.push(newRow * GameConfig.BOARD_SIZE + newCol);
        }
        
        // 反向检查
        for (let i = 1; i < GameConfig.WIN_COUNT; i++) {
            const newRow = row - dx * i;
            const newCol = col - dy * i;
            
            if (!this.board.isValidPosition(newRow, newCol) || 
                this.board.getCell(newRow, newCol) !== player) {
                break;
            }
            winningCells.push(newRow * GameConfig.BOARD_SIZE + newCol);
        }
        
        return winningCells;
    }
} 