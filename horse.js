const n = 200;

var formKey = (x, y) => `${x}${y}`;

var countSteps = (start, finish, N, launchAsync) => {

  return new Promise((resolve, reject) => {

    const maze = new Array(N);

    for (let i = N; i--;) {
      maze[i] = new Array(N);
    }
    const t = Date.now();
    const twoMovesDist = 2 * Math.sqrt(5)// 2^2 + 1^2 - one horse move

    const [xf, yf] = finish;

    const createCoord = (x, y, prev) => ({
      dist: Math.sqrt(Math.pow(xf - x, 2) + Math.pow(yf - y, 2)),
      prev: prev,
      value: [x, y]
    });

    let found = false;
    let count = 0;

    const visitNeighbours = (array, step) => {

      const neighbours = array.reduce((map, coords) => {
        const [px, py] = coords.value;

        const key1 = formKey(px - 2, py - 1);
        const key2 = formKey(px - 2, py + 1);
        const key3 = formKey(px - 1, py - 2);
        const key4 = formKey(px - 1, py + 2);
        const key5 = formKey(px + 1, py - 2);
        const key6 = formKey(px + 1, py + 2);
        const key7 = formKey(px + 2, py - 1);
        const key8 = formKey(px + 2, py + 1);


        map.set(key1, createCoord(px - 2, py - 1, coords.value));
        map.set(key2, createCoord(px - 2, py + 1, coords.value));
        map.set(key3, createCoord(px - 1, py - 2, coords.value));
        map.set(key4, createCoord(px - 1, py + 2, coords.value));
        map.set(key5, createCoord(px + 1, py - 2, coords.value));
        map.set(key6, createCoord(px + 1, py + 2, coords.value));
        map.set(key7, createCoord(px + 2, py - 1, coords.value));
        map.set(key8, createCoord(px + 2, py + 1, coords.value));

        return map;
      }, new Map());

      const result = [];

      const sortedInsert = (coord) => {
        if (coord.dist >= twoMovesDist) {
          result[0] = result[0] ? (result[0].dist > coord.dist ? coord : result[0]) : coord;
        } else {
          result.push(coord);
        }
      };

      neighbours.forEach((coords) => {
        const [px, py] = coords.value;
        if (px < 0 || py < 0 || px >= N || py >= N) return false;

        const cell = maze[px][py];

        const value = cell && cell.value;

        if (!value || ((step + 1) < value)) {
          maze[px][py] = {
            prev: coords.prev,
            value: step + 1
          };

          if (px === xf && py === yf) {
            found = true;
          }

          sortedInsert(coords);

          return true;
        } else {
          return false
        }
      });
      return result;
    };


    let nextSteps = [{value: start}];


    const fn = () => {
      nextSteps = visitNeighbours(nextSteps, count);
      count++;
    };

    const syncFn = () => {

      while (!found) {
        fn()
      }
      resolve(maze);
    };

    const asyncFn = () => {
      if (found) {
        console.log(`${((Date.now() - t) / 1000).toFixed(3)} s`);
        resolve(maze);
      } else {
        fn();

        context.globalAlpha = 0.6;
        context.fillStyle = "#000000";
        nextSteps.forEach(coords => drawVisited(coords.value));
        context.globalAlpha = 1;

        setTimeout(asyncFn, 10);
      }
    };
    return launchAsync ? asyncFn() : syncFn();
  })

};


const N = (n || 10) * 10;
const canvas = document.getElementById("canv");
const context = canvas.getContext("2d");

const horseImage = new Image();
horseImage.src = './horse.png';

canvas.width = N;
canvas.height = N;

const m = new Map();


const drawCanvas = () => {
  m.clear();
  document.getElementById('start').value = `[]`;
  document.getElementById('end').value = `[]`;
  const context = canvas.getContext('2d');
  context.clearRect(0, 0, N * 10, N * 10);
  for (let i = 0; i < N; i += 10) {
    for (let j = 0; j < N; j += 10) {
      (((i + j) % 20) === 0 ) ?
        context.fillStyle = "#462506" :
        context.fillStyle = "#F2C661";
      context.fillRect(i, j, 10, 10);
    }
  }
};

drawCanvas();

const drawVisited = (point) => {
  const x = point[0] * 10;
  const y = point[1] * 10;
  context.fillRect(x, y, 10, 10);
};

const drawHorse = (point) => {
  const x = point[0] * 10;
  const y = point[1] * 10;
  context.fillStyle = "#ffffff";
  context.globalAlpha = 1;
  context.drawImage(horseImage, x, y, 10, 10);
};

const drawPath = (end, board, start) => {
  const [xf, yf] = end;
  let { prev } = board[xf][yf];
  prev = prev || start;
  const [xs, ys] = prev;

  context.moveTo(10 * xs + 5, 10 * ys + 5);
  context.lineTo(10 * xf + 5, 10 * ys + 5);
  context.moveTo(10 * xf + 5, 10 * ys + 5);
  context.lineTo(10 * xf + 5, 10 * yf + 5);

  return ((xs === start[0]) && (ys === start[1])) ? null : drawPath(prev, board, start);
};

const clickHandler = (e) => {

  const { offsetX, offsetY } = e;

  const key = m.size ? 2 : 1;

  const xf = Math.floor(offsetX / 10);
  const yf = Math.floor(offsetY / 10);

  if (!m.size) {
    drawCanvas();
    drawHorse([xf, yf]);
    m.set(`${key}x`, xf);
    m.set(`${key}y`, yf);
    document.getElementById('start').value = `[${xf}, ${yf}]`;
    return;
  }

  drawHorse([xf, yf]);

  const xs = m.get('1x');
  const ys = m.get('1y');
  document.getElementById('end').value = `[${xf}, ${yf}]`;

  canvas.removeEventListener('click', clickHandler);

  const timer = Date.now();
  countSteps([xs, ys], [xf, yf], n, true)
    .then((result) => {
      const { value } = result[xf][yf];

      document.getElementById('result').value = `${((Date.now() - timer) / 1000).toFixed(3)} s`;
      document.getElementById('way').value = (value);

      context.strokeStyle = "#fff";
      context.beginPath();
      drawPath([xf, yf], result, [xs, ys]);
      context.stroke();
      context.closePath();

      drawHorse([xs, ys]);
      drawHorse([xf, yf]);

      context.stroke();
      canvas.addEventListener('click', clickHandler);
      m.clear();
    });
};


canvas.addEventListener('click', clickHandler);
