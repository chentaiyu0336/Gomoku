import { GameConfig } from './config.js';

export class UIController {
    constructor() {
        this.boardElement = document.getElementById('board');
        this.statusElement = document.getElementById('status');
        this.startScreen = document.getElementById('startScreen');
        this.gameContainer = document.getElementById('gameContainer');
        this.cells = [];
        this.lastHighlightedCell = null;
        this.isDisabled = false;
    }

    initializeBoard(clickHandler) {
        // 清空现有棋盘
        this.boardElement.innerHTML = '';
        this.cells = [];

        // 添加上边框线
        const topBorder = document.createElement('div');
        topBorder.className = 'top-border';
        this.boardElement.appendChild(topBorder);

        // 创建棋盘格子
        for (let i = 0; i < GameConfig.BOARD_SIZE * GameConfig.BOARD_SIZE; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.setAttribute('data-index', i);
            cell.addEventListener('click', clickHandler);
            this.boardElement.appendChild(cell);
            this.cells.push(cell);
        }

        // 修改棋盘网格样式
        this.boardElement.style.gridTemplateColumns = 
            `repeat(${GameConfig.BOARD_SIZE}, 40px)`;
    }

    updateCell(index, player) {
        if (index < 0 || index >= this.cells.length) return;
        
        // 清除之前的高亮
        if (this.lastHighlightedCell) {
            this.lastHighlightedCell.classList.remove('latest');
        }
        
        const cell = this.cells[index];
        // 移除可能存在的其他棋子类
        cell.classList.remove(GameConfig.PLAYER, GameConfig.AI);
        // 添加新的棋子类
        cell.classList.add(player);
        // 添加高亮效果
        cell.classList.add('latest');
        // 更新最后高亮的格子
        this.lastHighlightedCell = cell;
    }

    resetBoard() {
        // 清除所有棋子和高亮
        this.cells.forEach(cell => {
            cell.classList.remove(GameConfig.PLAYER, GameConfig.AI, 'latest');
        });
        this.lastHighlightedCell = null;  // 重置最后高亮的格子
        this.enableBoard();
        this.setNoticeMessage('游戏开始！');
    }

    setNoticeMessage(message) {
        if (!this.statusElement) return;
        
        // 添加淡入动画效果
        this.statusElement.style.opacity = '0';
        setTimeout(() => {
            this.statusElement.textContent = message;
            this.statusElement.style.opacity = '1';
        }, 200);
    }

    showStartScreen() {
        if (this.startScreen) {
            this.startScreen.style.display = 'flex';
            setTimeout(() => {
                this.startScreen.style.opacity = '1';
            }, 200);
        }
    }

    hideStartScreen() {
        if (this.startScreen) {
            this.startScreen.style.display = 'none';
            setTimeout(() => {
                this.startScreen.style.opacity = '0';
            }, 0);
        }
    }

    showGameContainer() {
        if (this.gameContainer) {
            this.gameContainer.style.display = 'block';
            setTimeout(() => {
                this.gameContainer.style.opacity = '1';
            }, 200);
        }
    }

    hideGameContainer() {
        if (this.gameContainer) {
            this.gameContainer.style.display = 'none';
            setTimeout(() => {
                this.gameContainer.style.opacity = '0';
            }, 0);
        }
    }

    // 高亮显示获胜路径
    highlightWinningCells(winningCells) {
        winningCells.forEach(index => {
            const cell = this.cells[index];
            if (cell) {
                cell.classList.add('winning');
            }
        });
    }

    // 添加棋子放置动画
    addPlacementAnimation(index) {
        const cell = this.cells[index];
        if (cell) {
            cell.classList.add('place-animation');
            setTimeout(() => {
                cell.classList.remove('place-animation');
            }, 500);
        }
    }

    // 显示提示标记
    showHint(index) {
        const cell = this.cells[index];
        if (cell && !cell.classList.contains(GameConfig.PLAYER) && 
            !cell.classList.contains(GameConfig.AI)) {
            cell.classList.add('hint');
        }
    }

    // 清除提示标记
    clearHint() {
        this.cells.forEach(cell => {
            cell.classList.remove('hint');
        });
    }

    // 更新游戏统计信息
    updateStats(stats) {
        if (document.getElementById('gameStats')) {
            document.getElementById('gameStats').innerHTML = `
                胜局: ${stats.wins} | 
                负局: ${stats.losses} | 
                平局: ${stats.draws}
            `;
        }
    }

    // 添加禁用棋盘的方法
    disableBoard() {
        this.isDisabled = true;
        this.boardElement.classList.add('disabled');
    }

    // 添加启用棋盘的方法
    enableBoard() {
        this.isDisabled = false;
        this.boardElement.classList.remove('disabled');
    }

    // 修改现有的handleCellClick方法
    handleCellClick(clickHandler) {
        return (e) => {
            if (this.isDisabled) {
                return; // 如果棋盘被禁用，直接返回
            }
            clickHandler(e);
        };
    }
} 