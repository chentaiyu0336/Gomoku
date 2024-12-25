import { GameConfig } from './config.js';

export class Board {
    constructor() {
        this.cells = Array(GameConfig.BOARD_SIZE * GameConfig.BOARD_SIZE).fill('');
    }

    getCell(row, col) {
        return this.cells[row * GameConfig.BOARD_SIZE + col];
    }

    setCell(index, value) {
        this.cells[index] = value;
    }

    isEmpty(index) {
        return this.cells[index] === '';
    }

    isValidPosition(row, col) {
        return row >= 0 && row < GameConfig.BOARD_SIZE && 
               col >= 0 && col < GameConfig.BOARD_SIZE;
    }

    reset() {
        this.cells = Array(GameConfig.BOARD_SIZE * GameConfig.BOARD_SIZE).fill('');
    }

    isFull() {
        return !this.cells.includes('');
    }
} 