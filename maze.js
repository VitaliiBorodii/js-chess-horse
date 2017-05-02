let getTrace;
(() => {

  const rectSize = 10;

  const formKey = (x, y) => `${x}${y}`;


  const drawPath = (end, board, start) => {
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');

    const [xf, yf] = end;
    let { prev } = board[formKey(xf, yf)];
    prev = prev || start;
    const {x, y} = prev;
    const half = Math.round(rectSize / 2);

    context.moveTo(rectSize * x + half, rectSize * y + half);
    context.lineTo(rectSize * xf + half, rectSize * y + half);
    context.moveTo(rectSize * xf + half, rectSize * y + half);
    context.lineTo(rectSize * xf + half, rectSize * yf + half);

    return ((x === start[0]) && (y === start[1])) ? null : drawPath([prev.x, prev.y], board, start);
  };


  const drawWay = (finish, maze, start) => {
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');

    context.strokeStyle = "#00F";
    context.beginPath();
    context.globalAlpha = 1;
    drawPath(finish, maze, start);
    context.stroke();
    context.closePath();

  };

  const drawMaze = (start, finish, maze) => {
    const [sx, sy] = start;
    const [fx, fy] = finish;
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');
    const y = maze.length;
    const x = maze[0].length;
    canvas.height = y * rectSize;
    canvas.width = x * rectSize;

    maze.forEach((row, i) => {
      row.forEach((cell, j) => {
        context.fillStyle = cell ? '#000' : '#FFF';
        if (i === sy && j === sx) {
          context.fillStyle = '#F00';
        } else if (i === fy && j === fx) {
          context.fillStyle = '#0F0';
        }
        context.fillRect(j * rectSize, i * rectSize, rectSize, rectSize);
      })
    })
  };


  const getOut = (start, finish, maze, trace) => {
    trace && drawMaze(start, finish, maze);
    const visited = {};
    const y = maze.length;
    const x = maze[0].length;

    const visitNeighbours = (px, py, prev) => {

      const neighbours = [
        [px - 1, py],
        [px + 1, py],
        [px, py - 1],
        [px, py + 1]
      ];

      const key = formKey(px, py);
      visited[key] = {
        prev,
        reachable: true
      };

      const nextPrev = {x: px, y: py};

      neighbours.forEach((coords) => {
        const [px, py] = coords;
        if (px < 0 || py < 0 || px >= x || py >= y) return;
        const key = formKey(px, py);
        if (visited.hasOwnProperty(key)) return;

        (maze[py][px] === 0) ? visitNeighbours(px, py, nextPrev) : (visited[key] = {
          prev,
          reachable: false
        });

      });

    };

    visitNeighbours(start[0], start[1], null);

    const key = formKey(finish[0], finish[1]);

    return trace ? visited : !!(visited[key] && visited[key].reachable);
  };

  const canPass = (start, finish, maze) => getOut(start, finish, maze, false);
  getTrace = (start, finish, size) => {
    const maze =  new Array(size);
    for (let i = 0; i < size; i++) {
      maze[i] = new Array(size);
      for (let j = 0; j < size; j++) {
        maze[i][j] = Math.round(Math.random());
      }
    }
    maze[start[1]][start[0]] = 0;
    maze[finish[1]][finish[0]] = 0;

    const board = getOut(start, finish, maze, true);
    const result = board[formKey(finish[0], finish[1])];

    if (result) {
      drawWay(finish, board, start);
    }

    return result;

  };

  try {
    module.exports.canPass = canPass;
  } catch (err) {
    console.error(err);
  }
})();
