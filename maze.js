const rectSize = 6;
const squareSize = rectSize;

const formKey = (x, y) => `${x}-${y}`;
const unformKey = (str) => str.split('-').map(Number);

const isEqual = (a, b) => {
  let equal = true;
  Object.keys(a).forEach(key => {
    if (a[key] !== b[key]) {
      equal = false
    }
  });
  if (!equal) return equal;
  Object.keys(b).forEach(key => {
    if (a[key] !== b[key]) {
      equal = false
    }
  });
  return equal;
};

let universe = [];
let size = 200;
let interval;
let timeout = 500;
let cells = {};
let counter = 0;

const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

canvas.width = size * rectSize;
canvas.height = size * rectSize;

const createNeighboursArray = (x, y) => [
  [x - 1, y - 1],
  [x, y - 1],
  [x + 1, y - 1],
  [x - 1, y],
  [x + 1, y],
  [x - 1, y + 1],
  [x, y + 1],
  [x + 1, y + 1]
].filter(coord => {
  const [x, y] = coord;
  return !(x < 0 || y < 0 || x >= size || y >= size );
});


const draw = () => {

  universe = new Array(size);

  context.strokeStyle = "#eee";
  context.beginPath();
  context.globalAlpha = 1;

  for (let i = size; i--;) {
    universe[i] = new Array(size);

    //horizontal lines
    context.moveTo(0, squareSize * i);
    context.lineTo(squareSize * size, squareSize * i);

    //vertical lines
    context.moveTo(squareSize * i, 0);
    context.lineTo(squareSize * i, squareSize * size);


  }

  context.lineWidth = 1;
  context.stroke();
  context.closePath();
};

const addCells = (pattern) => {
  stop();

  pattern = pattern.split('\n');

  const height = pattern.length;
  let width = 0;

  pattern.forEach(row => {
    if (row.length > width) {
      width = row.length
    }
  });

  const startY = Math.ceil((size - height) / 2);
  const startX = Math.ceil((size - width) / 2);

  pattern.forEach((row, j) => {
    row
      .split('')
      .forEach((cell, i) => {
        const x = startX + i;
        const y = startY + j;
        cells[formKey(x, y)] = cell === '*';
      });
  });
  drawNewState();
  interval = tick();
};

const drawNewState = () => {
  Object.keys(cells).forEach((key) => {
    const [x, y] = unformKey(key);
    const cell = cells[key];
    context.fillStyle = cell ? '#000' : '#FFF';
    context.fillRect(x * rectSize + 1, y * rectSize + 1, squareSize - 1, squareSize - 1);
  });
};

const tick = () => {

  counter++;

  const newGeneration = Object.assign({}, cells);

  Object.keys(cells).forEach((key) => {
    const [x, y] = unformKey(key);
    const cell = cells[key];

    let aliveNeighbours = 0;

    createNeighboursArray(x, y)
      .forEach(neighbour => {
        const [x, y] = neighbour;

        const cell = cells[formKey(x, y)];

        if (cell) {
          aliveNeighbours++
        }
      });

    if (cell) {
      if (aliveNeighbours <= 1) {
        //console.warn(`Cell ${key} dies from loneliness`);
        newGeneration[key] = false;
      } else if (aliveNeighbours > 1 && aliveNeighbours < 4) {
        //console.log(`Cell ${key} continue to live`);
      } else if (aliveNeighbours >= 4) {
        //console.warn(`Cell ${key} dies from overpopulation`);
        newGeneration[key] = false;
      }
    } else if (aliveNeighbours === 3) {
      //console.info(`Cell ${key} births`);
      newGeneration[key] = true;
    }

  });

  if (isEqual(cells, newGeneration)) {
    console.error(`Life is Stopped!! It has been existed for ${counter} moves!!`);
    return stop();
  }
  cells = newGeneration;

  drawNewState();

  interval = setTimeout(tick, timeout);

};

draw();

const stop = () => clearInterval(interval);
const resume = () => stop() || tick();

const clickHandler = (e) => {
  const x = Math.floor(e.offsetX / rectSize);
  const y = Math.floor(e.offsetY / rectSize);
  const key = formKey(x, y);
  cells[key] = !cells[key];
  drawNewState();
};

canvas.addEventListener('click', clickHandler);

document.getElementById('stop').addEventListener('click', stop);
document.getElementById('resume').addEventListener('click', resume);

const displayTimeout = () => {
  document.getElementById('timeout-output').value = `${Math.round(60000/timeout)} turns per minute`;
};

document.getElementById('timeout').value = timeout;
displayTimeout();

document.getElementById('timeout').addEventListener('change', (e) => {
  timeout =  Number(e.target.value) || timeout;
  displayTimeout();
});

const form = document.getElementById('form');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const pattern = form.pattern.value;
  addCells(pattern);
  form.pattern.value = '';
});


