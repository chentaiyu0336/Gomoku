import { GameConfig } from './config.js';
import { Board } from './board.js';
import { GameLogic } from './gameLogic.js';
import { AiService } from './aiService.js';
import { UIController } from './UIController.js';

export class Game {
    constructor() {
        this.board = new Board();
        this.gameLogic = new GameLogic(this.board);
        this.ai = new AiService(this.board, this.gameLogic);
        this.ui = new UIController();
        this.gameOver = false;
        this.currentMode = null;

        this.init();
    }

    init() {
        this.ui.initializeBoard(this.handleCellClick.bind(this));
    }

    startGame(mode) {
        this.currentMode = mode;
        this.ui.hideStartScreen();
        this.ui.showGameContainer();
        this.restartGame();
    }

    restartGame() {
        this.board.reset();
        this.gameOver = false;
        this.ui.resetBoard();

        if (this.currentMode === 'ai') {
            const centerCellIndex = Math.floor(GameConfig.BOARD_SIZE * GameConfig.BOARD_SIZE / 2);
            setTimeout(() => {
                this.makeMove(centerCellIndex, GameConfig.AI);
                this.ui.setNoticeMessage('可以开始啦');
            }, 500);
        }
    }

    handleCellClick(e) {
        const index = parseInt(e.target.getAttribute('data-index'));
        
        if (!this.board.isEmpty(index) || this.gameOver) {
            this.ui.setNoticeMessage("这个地方已经下过啦!请重新在空白格子落子!");
            return;
        }

        this.makePlayerMove(index);
        
        if (!this.gameOver) {
            this.continueAIResponse();
        }
    }

    makePlayerMove(index) {
        if (!this.board.isEmpty(index) || this.gameOver) return;

        this.makeMove(index, GameConfig.PLAYER);

        if (this.gameLogic.checkActualWin(GameConfig.PLAYER, index)) {
            this.ui.setNoticeMessage('你赢啦！');
            this.gameOver = true;
        }
    }

    makeMove(index, player) {
        this.board.setCell(index, player);
        this.ui.updateCell(index, player);
    }

    continueAIResponse() {
        if (!this.board.isFull()) {
            this.ui.setNoticeMessage("AI 思考中...");
            setTimeout(() => this.makeAIMove(), 500);
        } else {
            this.ui.setNoticeMessage("平局！");
            this.gameOver = true;
        }
    }

    makeAIMove() {
        const bestMove = this.ai.findBestMove();
        this.makeMove(bestMove, GameConfig.AI);

        if (this.gameLogic.checkActualWin(GameConfig.AI, bestMove)) {
            this.ui.setNoticeMessage("AI 获胜！下次加油咯");
            this.gameOver = true;
            return;
        }

        this.switchToPlayerRound();
    }

    switchToPlayerRound() {
        if (!this.board.isFull()) {
            this.ui.setNoticeMessage("轮到你了");
        } else {
            this.ui.setNoticeMessage("平局！");
            this.gameOver = true;
        }
    }

    returnToSelectGameMode() {
        this.ui.showStartScreen();
        this.ui.hideGameContainer();
    }
}
