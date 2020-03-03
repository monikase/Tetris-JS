const cvs = document.getElementById("tetris");
const ctx = cvs.getContext("2d");
const scoreElement = document.getElementById("score");

const ROW = 20; // Squares per height
const COL = (COLUMN = 10); // Squares per lenght
const SQ = (squareSize = 20); // Size of Square
const VACANT = "WHITE"; // Color of an empty square

// Draw a square

function drawSquare(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x * SQ, y * SQ, SQ, SQ);

  ctx.strokeStyle = "BLACK";
  ctx.strokeRect(x * SQ, y * SQ, SQ, SQ);
}

// Create Board

let board = [];
for (r = 0; r < ROW; r++) {
  board[r] = [];
  for (c = 0; c < COL; c++) {
    board[r][c] = VACANT;
  }
}

// Draw the board to the canvas

function drawBoard() {
  for (r = 0; r < ROW; r++) {
    for (c = 0; c < COL; c++) {
      drawSquare(c, r, board[r][c]);
    }
  }
}

drawBoard();

// The Pieces and their Colors

const PIECES = [
  [Z, "red"],
  [S, "green"],
  [T, "yellow"],
  [O, "blue"],
  [L, "purple"],
  [I, "cyan"],
  [J, "orange"]
];

// Generate random pieces

function randomPiece() {
  let r = (randomN = Math.floor(Math.random() * PIECES.length)); // 0 -> 6
  return new Piece(PIECES[r][0], PIECES[r][1]);
}

let p = randomPiece();

// Initiate a piece

// let p = new Piece(PIECES[0][0], PIECES[0][1]);

// The Object Piece();

function Piece(tetromino, color) {
  this.tetromino = tetromino;
  this.color = color;

  this.tetrominoN = 0; // We start from the first pattern
  this.activeTetromino = this.tetromino[this.tetrominoN];

  // We need to control the pieces
  this.x = 3;
  this.y = -2;
}

// Fill Function

Piece.prototype.fill = function(color) {
  for (r = 0; r < this.activeTetromino.length; r++) {
    for (c = 0; c < this.activeTetromino.length; c++) {
      // We draw only occupied squares
      if (this.activeTetromino[r][c]) {
        drawSquare(this.x + c, this.y + r, color);
      }
    }
  }
};

// Draw a piece to the board

Piece.prototype.draw = function() {
  this.fill(this.color);
};

// Undraw a piece

Piece.prototype.unDraw = function() {
  this.fill(VACANT);
};

// Move Down the Piece

Piece.prototype.moveDown = function() {
  if (!this.collision(0, 1, this.activeTetromino)) {
    this.unDraw();
    this.y++;
    this.draw();
  } else {
    // We lock the piece and generate a new one
    this.lock();
    p = randomPiece();
  }
};

// Move Right the Piece

Piece.prototype.moveRight = function() {
  if (!this.collision(1, 0, this.activeTetromino)) {
    this.unDraw();
    this.x++;
    this.draw();
  }
};

// Move Left the Piece

Piece.prototype.moveLeft = function() {
  if (!this.collision(-1, 0, this.activeTetromino)) {
    this.unDraw();
    this.x--;
    this.draw();
  }
};

// Rotate the Piece

Piece.prototype.rotate = function() {
  let nextPattern = this.tetromino[
    (this.tetrominoN + 1) % this.tetromino.length
  ];
  let kick = 0;

  if (this.collision(0, 0, nextPattern)) {
    if (this.x > COL / 2) {
      // It's the right wall
      kick = -1; // We need to move the piece to the left
    } else {
      // It's the left wall
      kick = 1; // We need to move the piece to the right
    }
  }

  if (!this.collision(kick, 0, nextPattern)) {
    this.unDraw();
    this.x += kick;
    this.tetrominoN = (this.tetrominoN + 1) % this.tetromino.length; // (0+1)%4 => 1
    this.activeTetromino = this.tetromino[this.tetrominoN];
    this.draw();
  }
};

// Lock the Piece

let score = 0;
Piece.prototype.lock = function() {
  for (r = 0; r < this.activeTetromino.length; r++) {
    for (c = 0; c < this.activeTetromino.length; c++) {
      // We skip the vacant squares
      if (!this.activeTetromino[r][c]) {
        continue;
      }
      // Pieces to lock on top = game over
      if (this.y + r < 0) {
        alert("Eik suvalgyk Kebaba");
        // Stop request animation frame
        gameOver = true;
        break;
      }
      // We lock the piece
      board[this.y + r][this.x + c] = this.color;
    }
  }
  // Remove Full Rows
  for (r = 0; r < ROW; r++) {
    let isRowFull = true;
    for (c = 0; c < COLUMN; c++) {
      isRowFull = isRowFull && board[r][c] != VACANT;
    }
    if (isRowFull) {
      // If the row is full we move down all the rows above it
      for (y = r; y > 1; y--) {
        for (c = 0; c < COLUMN; c++) {
          board[y][c] = board[y - 1][c];
        }
      }
      // The top row board [0] [..] has no row above it
      for (c = 0; c < COLUMN; c++) {
        board[0][c] = VACANT;
      }
      // Increment the score
      score += 10;
    }
  }
  // Update the board
  drawBoard();

  // Update the score
  scoreElement.innerHTML = score;
};

// Collision Function

Piece.prototype.collision = function(x, y, piece) {
  for (r = 0; r < piece.length; r++) {
    for (c = 0; c < piece.length; c++) {
      // Check if the square is VACANT or (EMPTY => we skip it)
      if (!piece[r][c]) {
        continue;
      }
      // Coordinates of the piece after movement
      let newX = this.x + c + x;
      let newY = this.y + r + y;

      // Conditions
      if (newX < 0 || newX >= COLUMN || newY >= ROW) {
        return true;
      }
      // Skip newY < 0; board[-1] will crush the game
      if (newY < 0) {
        continue;
      }
      // Check if there is a locked piece already in place
      if (board[newY][newX] != VACANT) {
        return true;
      }
    }
  }
  return false;
};

// CONTROL the piece

document.addEventListener("keydown", CONTROL);

function CONTROL(event) {
  if (event.keyCode === 37) {
    p.moveLeft();
    dropStart = Date.now();
  } else if (event.keyCode === 38) {
    p.rotate();
    dropStart = Date.now();
  } else if (event.keyCode === 39) {
    p.moveRight();
    dropStart = Date.now();
  } else if (event.keyCode === 40) {
    p.moveDown();
  }
}

// Drop the piece every 1 second

let dropStart = Date.now();
let gameOver = false;
function drop() {
  let now = Date.now();
  let delta = now - dropStart;
  if (delta > 1000) {
    p.moveDown();
    dropStart = Date.now();
  }
  if (!gameOver) {
    requestAnimationFrame(drop);
  }
}

drop();
