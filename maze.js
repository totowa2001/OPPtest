class MazeGenerator {
    constructor(height, width) {
        if (height < 5 || width < 5) {
            throw new Error("Maze dimensions must be at least 5x5");
        }
        if (height % 2 === 0 || width % 2 === 0) {
            throw new Error("Maze dimensions must be odd numbers");
        }

        this.height = height;
        this.width = width;
        this.maze = Array(height).fill().map(() => Array(width).fill('#'));
        this.dx = [0, 1, 0, -1];  // Direction vectors
        this.dy = [1, 0, -1, 0];
    }

    isValid(x, y) {
        return x >= 0 && x < this.height && y >= 0 && y < this.width;
    }

    canCarve(x, y) {
        if (!this.isValid(x, y) || this.maze[x][y] === ' ') {
            return false;
        }

        let walls = 0;
        for (let i = 0; i < 4; i++) {
            const newX = x + this.dx[i];
            const newY = y + this.dy[i];
            if (!this.isValid(newX, newY) || this.maze[newX][newY] === '#') {
                walls++;
            }
        }
        return walls >= 3;
    }

    generateMazeDFS(x, y) {
        this.maze[x][y] = ' ';

        let directions = [0, 1, 2, 3];
        for (let i = directions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [directions[i], directions[j]] = [directions[j], directions[i]];
        }

        for (const dir of directions) {
            const nextX = x + this.dx[dir] * 2;
            const nextY = y + this.dy[dir] * 2;

            if (this.canCarve(nextX, nextY)) {
                this.maze[x + this.dx[dir]][y + this.dy[dir]] = ' ';
                this.generateMazeDFS(nextX, nextY);
            }
        }
    }

    generate() {
        this.generateMazeDFS(1, 1);
        this.maze[0][1] = ' ';  // Entrance
        this.maze[this.height-2][this.width-1] = ' ';  // Path to exit
        this.maze[this.height-1][this.width-1] = ' ';  // Exit
        return this.maze;
    }
}

let maze = [];
let playerPos = { x: 0, y: 1 };
let endPos = { x: 0, y: 0 };

function generateMaze(customDimensions = false) {
    try {
        const width = customDimensions ? parseInt(document.getElementById('mazeWidth').value) : 21;
        const height = customDimensions ? parseInt(document.getElementById('mazeHeight').value) : 15;

        // Ensure dimensions are odd numbers >= 5
        const adjustedWidth = Math.max(5, width + (width % 2 === 0 ? 1 : 0));
        const adjustedHeight = Math.max(5, height + (height % 2 === 0 ? 1 : 0));

        const mazeGen = new MazeGenerator(adjustedHeight, adjustedWidth);
        maze = mazeGen.generate();
        playerPos = { x: 0, y: 1 };
        endPos = { x: mazeGen.height - 1, y: mazeGen.width - 1 };
        renderMaze();
    } catch (error) {
        console.error('Error:', error);
        alert(error.message || 'Failed to generate maze. Please try again.');
    }
}

function renderMaze() {
    const mazeElement = document.getElementById('maze');
    mazeElement.innerHTML = '';

    for (let i = 0; i < maze.length; i++) {
        const row = document.createElement('div');
        row.className = 'maze-row';

        for (let j = 0; j < maze[i].length; j++) {
            const cell = document.createElement('div');
            cell.className = 'maze-cell';

            if (i === playerPos.x && j === playerPos.y) {
                cell.className += ' player';
                cell.textContent = 'P';
            } else if (i === endPos.x && j === endPos.y) {
                cell.className += ' end';
            } else if (maze[i][j] === '#') {
                cell.className += ' wall';
            } else {
                cell.className += ' path';
            }

            row.appendChild(cell);
        }
        mazeElement.appendChild(row);
    }
}

function isWall(x, y) {
    return !maze[x]?.[y] || maze[x][y] === '#';
}

function movePlayer(dx, dy) {
    const newX = playerPos.x + dx;
    const newY = playerPos.y + dy;

    if (!isWall(newX, newY)) {
        playerPos.x = newX;
        playerPos.y = newY;
        renderMaze();

        if (newX === endPos.x && newY === endPos.y) {
            setTimeout(() => {
                alert('Congratulations! You\'ve won!');
                generateMaze();
            }, 100);
        }
    }
}

document.addEventListener('keydown', (event) => {
    switch(event.key) {
        case 'w':
        case 'W':
        case 'ArrowUp':
            movePlayer(-1, 0);
            break;
        case 's':
        case 'S':
        case 'ArrowDown':
            movePlayer(1, 0);
            break;
        case 'a':
        case 'A':
        case 'ArrowLeft':
            movePlayer(0, -1);
            break;
        case 'd':
        case 'D':
        case 'ArrowRight':
            movePlayer(0, 1);
            break;
        case 'r':
        case 'R':
            generateMaze();
            break;
    }
});

document.getElementById('restart').addEventListener('click', () => generateMaze());
document.getElementById('generateCustom').addEventListener('click', () => generateMaze(true));

generateMaze();
