var formKey = (x, y) => `${x}${y}`;

var countSteps = (start, finish, N = 1000) => {

  const maze = new Array(N);

  for (let i = N; i--;) {
    maze[i] = new Array(N);
  }


  const t = Date.now();

  const [xf, yf] = finish;

  const createCoord = (x, y, prev) => ({
    dist: Math.abs((xf - x) + (yf - y)),
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


      map.set(key1, createCoord(px-2, py-1, coords.value));
      map.set(key2, createCoord(px-2, py+1, coords.value));
      map.set(key3, createCoord(px-1, py-2, coords.value));
      map.set(key4, createCoord(px-1, py+2, coords.value));
      map.set(key5, createCoord(px+1, py-2, coords.value));
      map.set(key6, createCoord(px+1, py+2, coords.value));
      map.set(key7, createCoord(px+2, py-1, coords.value));
      map.set(key8, createCoord(px+2, py+1, coords.value));

      return map;
    }, new Map())
      //.sort((a, b) => {
      //  return (finish[0] - a.value[0] + (finish[1] - a.value[1])) - (finish[0] - b.value[0] + (finish[1] - b.value[1]))
      //});
//console.log(neighbours)
    const result = [];

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

        if (px === finish[0] && py === finish[1]) {
          found = true;
        }
        result.push(coords);
        return true;
      } else {
        return false
      }
    });
    return result;
  };

  let iterations = 0;

  let nextSteps = [{value: start}];
  while (!found) {
      nextSteps = visitNeighbours(nextSteps, count);
      count++;
    iterations++;

    if (iterations > 1000) {
      console.error('Recursion Error!');
      found = true;
    }
  }

  console.log(`${((Date.now() - t) / 1000).toFixed(3)} s`);
  return maze[finish[0]][finish[1]];
};
