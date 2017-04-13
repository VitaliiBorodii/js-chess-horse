
const N = 100;
const a_canvas = document.getElementById("canv");
const context = a_canvas.getContext("2d");

a_canvas.width = N;
a_canvas.height = N;

for ( let i=0; i < N; i += 10) {
  for (let j = 0; j < N; j += 10) {
    (((i + j) % 20) ===0 ) ?
    context.fillStyle = "#462506" :
    context.fillStyle = "#F2C661";
    context.fillRect(i, j, 10, 10);
  };
};


let m = [];

const chess = new Array(N);

for (let i = N; i--;) {
  chess[i] = new Array(N);
};


a_canvas.onclick = (e) => {

 m.push( e.offsetX == undefined ? e.layerX : e.offsetX);
 m[m.length-1] = Math.floor((m[m.length-1]) / 10);

 m.push( e.offsetY == undefined ? e.layerY : e.offsetY);
 m[m.length-1]=Math.floor(m[m.length-1] / 10);

 if (m.length === 2) {
   context.fillStyle = "#00ff00";
   context.fillRect(m[m.length-2] * 10, m[m.length-1] * 10, 10, 10);
 } else if (m.length === 4) {
   console.log(m)
   context.fillStyle = "#ff0000";
   context.fillRect(m[m.length-2] * 10, m[m.length-1] * 10, 10, 10);

 var timer = Date.now();
 let xs = m[0];
 let ys = m[1];
 let xf = m[2];
 let yf = m[3];

const path = [];
let count = 0;
let steps;
const pathsteps = [];

const potentialMoves = (xs, ys) => {
  const trash = [];
  const moves = [
    [xs+2, ys+1],
    [xs+2, ys-1],
    [xs+1, ys+2],
    [xs+1, ys-2],
    [xs-1, ys+2],
    [xs-1, ys-2],
    [xs-2, ys+1],
    [xs-2, ys-1]
    ];
            for (var j=moves.length; j--;) {
        if((moves[j][0]>=0) && (moves[j][0]<N) && (moves[j][1]>=0) && (moves[j][1]<N)) trash.push(moves[j]);
            };
        for (j=trash.length; j--;) {
       {if (!chess[trash[j][0]][trash[j][1]]) {
           chess[trash[j][0]][trash[j][1]] = count+1;
           pathsteps.push([trash[j][0],trash[j][1]]);
       };
       };
        };
};

potentialMoves(xs, ys);

console.log({
  chess, xf, yf, m
})

while (!chess[xf][yf]) {
count += 1;
var j = pathsteps.length;
for (var i=j; i--;) {
    potentialMoves(pathsteps[i][0], pathsteps[i][1]);
};
pathsteps.splice(0,j);
};
steps = chess[xf][yf];
path.push([xs,ys]);
path[steps] = ([xf,yf]);
   while (steps !=1) {
 steps-=1;
    var trash=[];
    var    moves = [
        [xf+2, yf+1],
        [xf+2, yf-1],
        [xf+1, yf+2],
        [xf+1, yf-2],
        [xf-1, yf+2],
        [xf-1, yf-2],
        [xf-2, yf+1],
        [xf-2, yf-1]
    ];
       for (var j=moves.length; j--;) {
        if((moves[j][0]>=0) && (moves[j][0]<N) && (moves[j][1]>=0) && (moves[j][1]<N)) trash.push(moves[j]);
            };
        for (j=trash.length; j--;) {
         if(chess[trash[j][0]][trash[j][1]] === steps) {
       path[steps]=[trash[j][0],trash[j][1]];
           xf = trash[j][0];
           yf = trash[j][1];};
       };
        };
timer = (Date.now() - timer)/1000;
document.getElementById('result').value = timer + " с";
document.getElementById('way').value = (path.length-1);
context.strokeStyle = "#fff";
for (i=path.length; i-=1;) {
xs=path[i][0];
ys=path[i][1];
xf=path[i-1][0];
yf=path[i-1][1];
context.moveTo(10*xs+5,10*ys+5);
context.lineTo(10*xf+5,10*ys+5);
context.moveTo(10*xf+5,10*ys+5);
context.lineTo(10*xf+5,10*yf+5);
context.stroke();
};
context.stroke();
m=[];
                  };
                };
