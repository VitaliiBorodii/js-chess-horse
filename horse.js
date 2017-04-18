(() => {
  let squareSize;
  let n;
  let N;

  let searching = false;

  const setStart = (x, y) => {
    document.getElementById('start-x').value = x;
    document.getElementById('start-y').value = y;
    (x !== undefined) && (y !== undefined) && drawHorse([x, y]);
  };

  const setEnd = (x, y) => {
    document.getElementById('end-x').value = x;
    document.getElementById('end-y').value = y;
    (x !== undefined) && (y !== undefined) && drawHorse([x, y]);
  };

  const setIterations = (iterations) => {
    document.getElementById('iterations').value = iterations;
  };

  const manualSearch = (e) => {
    e.preventDefault();
    let xs = Number(document.getElementById('start-x').value);
    let ys = Number(document.getElementById('start-y').value);

    let xf = Number(document.getElementById('end-x').value);
    let yf = Number(document.getElementById('end-y').value);

    xs = xs < 0 ? 0 : xs;
    ys = ys < 0 ? 0 : ys;
    xf = xf < 0 ? 0 : xf;
    yf = yf < 0 ? 0 : yf;

    xs = xs >= n ? n-1 : xs;
    ys = ys >= n ? n-1 : ys;
    xf = xf >= n ? n-1 : xf;
    yf = yf >= n ? n-1 : yf;


    if ((xs !== undefined) && (ys !== undefined) && (xf !== undefined) && (yf !== undefined)) {
      drawCanvas();
      setStart(xs, ys);
      setEnd(xf, yf);

      m.set('1x', xs);
      m.set('1y', ys);
      m.set('2x', xf);
      m.set('2y', yf);


      launch([xs, ys], [xf, yf]);

    }
  };

  const setCellSize = () => {
    const size = +document.getElementById('cell_size').value;
    squareSize = size;
    setCanvasSize();
  };

  const setCanvasSize = () => {
    const size = +document.getElementById('canvas_size').value;
    n = size;
    N = n * squareSize;
    canvas.width = N;
    canvas.height = N;

    document.getElementById('start-x').setAttribute('max', n - 1);
    document.getElementById('start-y').setAttribute('max', n - 1);
    document.getElementById('end-x').setAttribute('max', n - 1);
    document.getElementById('end-y').setAttribute('max', n - 1);

    drawCanvas();
  };

  const formKey = (x, y) => `${x}${y}`;

  const countSteps = (start, finish) => {
    const t1 = Date.now();

    const launchAsync = !!document.getElementById('async').checked;
    const N = n;

    return new Promise((resolve, reject) => {

      const maze = new Array(N);

      let iterations = 0;
      let time = 0;

      const optimize = document.getElementById('optimize').checked;

      for (let i = N; i--;) {
        maze[i] = new Array(N);
      }
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
          if (!optimize) {
            return result.push(coord);
          }
          if (coord.dist > twoMovesDist) {
            result[0] = result[0] ? (result[0].dist >= coord.dist ? coord : result[0]) : coord;
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
            iterations++;

            maze[px][py] = {
              prev: coords.prev,
              value: step + 1
            };

            if (px === xf && py === yf) {
              return found = true;
            }

            sortedInsert(coords);

          }
        });
        return result;
      };


      let nextSteps = [{value: start}];


      const fn = () => {
        const t1 = Date.now();
        nextSteps = visitNeighbours(nextSteps, count);
        count++;
        time += (Date.now() - t1);
      };

      const syncFn = () => {

        while (!found) {
          fn()
        }
        resolve({
          time,
          maze,
          iterations
        });
      };

      const asyncFn = () => {
        if (found) {
          resolve({
            time,
            maze,
            iterations
          });

        } else {
          fn();

          context.globalAlpha = 0.6;
          context.fillStyle = "#000000";
          nextSteps.forEach(coords => drawVisited(coords.value));
          context.globalAlpha = 1;

          setTimeout(asyncFn, 10);
        }
      };
      time += Date.now() - t1;
      return launchAsync ? asyncFn() : syncFn();
    })

  };


  const canvas = document.getElementById("canv");
  const context = canvas.getContext("2d");

  const horseImage = new Image();
  horseImage.src = './horse.png';

  const m = new Map();


  const drawCanvas = () => {
    m.clear();
    setStart();
    setEnd();
    document.getElementById('result').value = `-`;
    document.getElementById('way').value = '-';
    setIterations('-');
    const context = canvas.getContext('2d');

    context.clearRect(0, 0, N * squareSize, N * squareSize);
    const dil = squareSize * 2;
    for (let i = 0; i < N; i += squareSize) {
      for (let j = 0; j < N; j += squareSize) {
        context.fillStyle = (((i + j) % dil)) ? '#F2C661' : '#462506';
        context.fillRect(i, j, squareSize, squareSize);
      }
    }
  };

  const drawVisited = (point) => {
    const x = point[0] * squareSize;
    const y = point[1] * squareSize;
    context.fillRect(x, y, squareSize, squareSize);
  };

  const drawHorse = (point) => {
    const x = point[0] * squareSize;
    const y = point[1] * squareSize;
    context.fillStyle = "#ffffff";
    context.globalAlpha = 1;
    context.drawImage(horseImage, x, y, squareSize, squareSize);
  };

  const eraseHorse = (point) => {
    const [xs, ys] = point;
    const dil = squareSize * 2;

    context.fillStyle = (((xs + ys) % dil)) ? '#F2C661' : '#462506';
    drawVisited(point);

  };

  const drawPath = (end, board, start) => {
    const [xf, yf] = end;
    let { prev } = board[xf][yf];
    prev = prev || start;
    const [xs, ys] = prev;
    const half = Math.round(squareSize / 2);

    context.moveTo(squareSize * xs + half, squareSize * ys + half);
    context.lineTo(squareSize * xf + half, squareSize * ys + half);
    context.moveTo(squareSize * xf + half, squareSize * ys + half);
    context.lineTo(squareSize * xf + half, squareSize * yf + half);

    return ((xs === start[0]) && (ys === start[1])) ? null : drawPath(prev, board, start);
  };

  const clickHandler = (e) => {

    if (m.size === 4) {

      drawCanvas();

      m.clear();

    }

    const { offsetX, offsetY } = e;

    const key = m.size ? 2 : 1;

    const xf = Math.floor(offsetX / squareSize);
    const yf = Math.floor(offsetY / squareSize);

    if (xf < 0 || yf < 0 || xf >= n || yf >= n) return;

    m.set(`${key}x`, xf);
    m.set(`${key}y`, yf);

    if (m.size === 2) {
      setStart(xf, yf);
      return;
    }

    const xs = m.get('1x');
    const ys = m.get('1y');

    setEnd(xf, yf);


    launch([xs, ys], [xf, yf]);
  };

  const launch = (start, finish) => {
    const [xs, ys] = start;
    const [xf, yf] = finish;
    if (searching) return;
    searching = true;
    countSteps([xs, ys], [xf, yf])
      .then(({time , iterations, maze}) => {
        const { value } = maze[xf][yf];

        document.getElementById('result').value = `${(time / 1000).toFixed(3)} s`;
        document.getElementById('way').value = (value);
        setIterations(iterations);

        context.strokeStyle = "#fff";
        context.beginPath();
        context.globalAlpha = 1;
        drawPath([xf, yf], maze, [xs, ys]);
        context.stroke();
        context.closePath();

        drawHorse([xs, ys]);
        drawHorse([xf, yf]);

        context.stroke();
        searching = false;
      });
  };

  canvas.addEventListener('click', clickHandler);
  document.getElementById('canvas_size').addEventListener('change', setCanvasSize);
  document.getElementById('cell_size').addEventListener('change', setCellSize);
  document.getElementById('manual-search').addEventListener('submit', manualSearch);
  document.getElementById('clear-button').addEventListener('click', drawCanvas);
  setCellSize();

})();
