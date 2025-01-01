export const GameConfig = {
    BOARD_SIZE: 15,
    WIN_COUNT: 5,
    PLAYER: 'X',
    AI: 'O',
    DIRECTIONS: [
        [1, 0],   // 水平
        [0, 1],   // 垂直
        [1, 1],   // 右下对角
        [1, -1]   // 右上对角
    ],
    DIFFICULTY: {
        NORMAL: 'normal',
        HARD: 'hard'
    }
}; 