'use strict'

class Game {
    constructor(options) {
        this.canvas = options.canvas;
        this.paused = false;

        this.board = new GameBoard({
            canvas: options.canvas,
            width: 300,
            height: 300,
            cellSize: 10
        });

        this.snake = new Snake({
            row: this.board.rows / 2,
            column: this.board.columns / 2
        });

        this.apple = {};
        this.board.placeAtRandomCell(this.apple);

        this._initUserInput();
        this.canvas.focus();
    }

    start() {
        let lastFrameTime = Date.now();
        window.requestAnimationFrame(gameLoop.bind(this));

        function gameLoop() {
            if (!this.paused) {
                let now = Date.now();
                let timeSinceLastFrame = now - lastFrameTime;
    
                if (timeSinceLastFrame > this.tickTime()) {
                    this.snake.move();
                    // is collision to self or border
                    // collision to self:
                        // head at the same location as one of it's body cells
                    if (this.collisionWithBody() || this.collisionWithBorder()) {
                        this.end();
                    }
    
                    let snakeAtApplePosition = 
                        this.snake.head.column === this.apple.column &&
                        this.snake.head.row === this.apple.row;
                    if (snakeAtApplePosition) {
                        this.snake.eatApple();
                        this.board.placeAtRandomCell(this.apple);
                    }
                    this.board.clear();
                    this.board.drawBorder();
                    this.board.drawSnake(this.snake);
                    this.board.drawApple(this.apple);
                    lastFrameTime = Date.now();
                }
                window.requestAnimationFrame(gameLoop.bind(this));
            }
        }
    }

    end() {
        this.paused = true;
        alert('You lost!');
    }

    collisionWithBorder() {
        let borderTop = 0;
        let borderLeft = 0;
        let borderBottom = this.board.rows;
        let borderRight = this.board.columns;

        return this.snake.head.row === borderTop ||
            this.snake.head.row === borderBottom ||
            this.snake.head.column === borderLeft ||
            this.snake.head.column === borderRight;
    }

    collisionWithBody() {
        let collision = false;
        this.snake.body.forEach((bodyCell, _) => {
            if (this.snake.head.row === bodyCell.row &&
                this.snake.head.column === bodyCell.column) {
                    collision = true;
                }
        })
        return collision;
    }

    tickTime() {
        // Game speed increases as snake grows.
        // var start = 925;
        // var end = 145;
        // var time = start + this.snake.length
        // * (end - start) / this.board.rows;
        return 300 - (this.snake.length * 20);
    }

    _initUserInput() {
        const arrowKeyCodes = {
            arrowUp: 38, arrowLeft: 37,
            arrowRight: 39, arrowDown: 40,
        };

        document.addEventListener('keydown', (evt) => {
            switch (evt.keyCode) {
                case arrowKeyCodes.arrowUp:
                    this.snake.direction = [0, -1];
                    break;
                case arrowKeyCodes.arrowDown:
                    this.snake.direction = [0, 1];
                    break;
                case arrowKeyCodes.arrowLeft:
                    this.snake.direction = [-1, 0];
                    break;
                case arrowKeyCodes.arrowRight:
                    this.snake.direction = [1, 0];
                    break;
                default:
                    break;
            }
        })
    }
}


class Snake {
    constructor(options) {
        this.direction = [0, -1];
        this._moveSpeed = 1;
        this.length = 1;
        this.head = { column: options.column, row: options.row };
        this.body = [];
    }

    eatApple() {
        // insert a new cell into body
        this.body.unshift({ row: this.head.row, column: this.head.column });

        // advance head by 1 cell
        this.head.column += this.direction[0];
        this.head.row += this.direction[1];

        this.length++;
        console.log('snake eats apple');
    }

    move() {
        // advance each body cell starting from the tail
        for (let i = this.body.length; i > 0; i--) {
            const bodyCell = this.body[i - 1];
            const nextBodyCell = i - 2 < 0 ? this.head
                : this.body[i - 2];

            bodyCell.row = nextBodyCell.row;
            bodyCell.column = nextBodyCell.column;
        }

        // move the head
        this.head.column += this.direction[0];
        this.head.row += this.direction[1];
    }
}

/*
    The game board is implemented as grid
    with cells, rows and columns
*/
class GameBoard {
    constructor(options) {
        this.canvas = options.canvas;
        this.canvas.width = options.width;
        this.canvas.height = options.height;
        this.context = this.canvas.getContext('2d');
        this.cellSize = options.cellSize;
        this.columns = this.canvas.width / this.cellSize;
        this.rows = this.canvas.height / this.cellSize;
        this.backgroundColor = 'gainsboro';
        this.snakeColor = 'gray';
        this.drawBorder();
    }

    drawBorder() {
        var margin = 1;
        var numBlocks = this.canvas.width / (this.cellSize + margin);
        var blockSpace = (this.cellSize + margin);
        var canvasBottom = this.canvas.height - this.cellSize;
        var canvasTopRight = this.canvas.width - this.cellSize;

        this.context.fillStyle = 'gray';
        this.context.fillRect(0, 0, this.cellSize, this.cellSize);
        this.context.fillRect(0, canvasBottom, this.cellSize, this.cellSize);
        for (let i = 1; i < numBlocks; i++) {
            this.context.fillRect(i * (blockSpace + 1), 0, this.cellSize, this.cellSize);
            this.context.fillRect(i * (blockSpace + 1), canvasBottom, this.cellSize, this.cellSize);
            this.context.fillRect(0, i * (blockSpace + 1), this.cellSize, this.cellSize);
            this.context.fillRect(canvasTopRight, i * (blockSpace + 1), this.cellSize, this.cellSize);
        }
    }

    drawSnake(snake) {
        // draw head
        this.context.fillStyle = 'snow';
        this.context.fillRect(snake.head.column * this.cellSize,
            snake.head.row * this.cellSize, this.cellSize, this.cellSize);
        this.context.fillStyle = this.snakeColor;
        // draw body
        snake.body.forEach((bodyCell, i) => {
            this.context.fillRect(bodyCell.column * this.cellSize,
                bodyCell.row * this.cellSize, this.cellSize, this.cellSize);
        })
    }

    drawApple(apple) {
        this.context.fillStyle = 'green';
        this.context.fillRect(apple.column * this.cellSize,
            apple.row * this.cellSize, this.cellSize, this.cellSize);
    }

    /** @param {Object} object object that has row and column properties  */
    placeAtRandomCell(object) {
        object.row = Math.round(Math.random() * ((this.columns - 2) - 1) + 1);
        object.column = Math.round(Math.random() * ((this.rows - 2) - 1) + 1)
    }

    clear() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}
