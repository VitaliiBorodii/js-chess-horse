module.exports.canPass = (start, finish, maze) => {
  const visited = {};
  const y = maze.length;
  const x = maze[0].length;

  const formKey = (x, y) => `${x}${y}`;

  const visitNeighbours = (px, py) => {
    const neighbours = [
      [px - 1, py - 1],
      [px, py - 1],
      [px + 1, py - 1],
      [px - 1, py],
      [px + 1, py],
      [px - 1, py + 1],
      [px, py + 1],
      [px + 1, py + 1]
    ];

    const key = formKey(px, py);
    visited[key] = 1;

    neighbours.forEach((coords) => {
      const [px, py] = coords;
      if (px < 0 || py < 0 || px >= x || py >= y) return;
      const key = formKey(px, py);
      if (visited.hasOwnProperty(key)) return;

      (maze[py][px] === 0) ? visitNeighbours(px, py) : (visited[key] = 0);

    });

  };

  visitNeighbours(start[0], start[1]);

  return !!visited[formKey(finish[0], finish[1])];
};