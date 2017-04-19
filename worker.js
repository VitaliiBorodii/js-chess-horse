const formKey = (x, y) => `${x}${y}`;

onmessage = ({data : {start, finish, N, optimize}}) => {
  console.info('Worker:', {start, finish, N, optimize})
  const time = Date.now();
  const maze = new Array(N);
  let iterations = 0;
  let found = false;
  let count = 0;

  for (let i = N; i--;) {
    maze[i] = new Array(N);
  }

  const twoMovesDist = 2 * Math.sqrt(5);// 2^2 + 1^2 - one horse move
  const [xf, yf] = finish;

  const createCoord = (x, y, prev) => ({
    dist: Math.sqrt(Math.pow(xf - x, 2) + Math.pow(yf - y, 2)),
    prev: prev,
    value: [x, y]
  });

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
      const nextStepValue = step + 1;

      if (!value || (nextStepValue < value)) {
        iterations++;

        maze[px][py] = {
          prev: coords.prev,
          value: nextStepValue
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

  while (!found) {
    nextSteps = visitNeighbours(nextSteps, count);
    count++;
  }

  postMessage({
    time: Date.now() - time,
    maze,
    iterations
  });
};