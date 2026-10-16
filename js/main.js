// Cosine palettes: colour = a + b*cos(2π(c*t + d))
const PALS = [
  {n:'Opal',  a:[.55,.55,.6], b:[.45,.4,.4],  c:[1,1,1],    d:[0,.33,.67],   base:[.01,.015,.04]},
  {n:'Dusk',  a:[.55,.38,.4], b:[.45,.4,.35], c:[1,.9,.8],  d:[.05,.2,.55],  base:[.04,.008,.03]},
  {n:'Aurora',a:[.35,.55,.55],b:[.4,.45,.4],  c:[1,1,.9],   d:[.45,.6,.8],   base:[.005,.03,.03]}
];
const SYM = [6, 8, 12, 5];   // fold counts, cycled on click

const cv = document.getElementById('c');
const gl = cv.getContext('webgl', {preserveDrawingBuffer:true, antialias:false});

if (!gl) {
  document.getElementById('err').style.display = 'grid';
} else {
  const compile = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(s));
    return s;
  };
  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, VS));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FS));
  gl.linkProgram(prog); gl.useProgram(prog);

  // One oversized triangle covers the whole screen.
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const U = {};
  ['uRes','uC0','uT','uN','uTw','uPulse','uR','uA','uB','uC','uD','uBase']
    .forEach(k => U[k] = gl.getUniformLocation(prog, k));

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let pi = 0, si = 0, W, H, T = 0, last = performance.now()/1000, pulseAt = -10, lastMove = -10;
  const tgt = {x:0, y:0}, cur = {x:0, y:0};

  function resize() {
    const d = Math.min(devicePixelRatio || 1, 1.5);   // cap for performance
    W = innerWidth; H = innerHeight;
    cv.width = Math.round(W*d); cv.height = Math.round(H*d);
    gl.viewport(0, 0, cv.width, cv.height);
  }
  function setPalette() {
    const P = PALS[pi];
    gl.uniform3fv(U.uA, P.a); gl.uniform3fv(U.uB, P.b); gl.uniform3fv(U.uC, P.c);
    gl.uniform3fv(U.uD, P.d); gl.uniform3fv(U.uBase, P.base);
    document.documentElement.style.setProperty('--bg', 'rgb(' + P.base.map(v => Math.round(v*255)).join(',') + ')');
  }
  const pulse = () => pulseAt = performance.now()/1000;
  const move = e => {
    tgt.x = (e.clientX/W)*2 - 1;
    tgt.y = 1 - (e.clientY/H)*2;
    lastMove = performance.now()/1000;
  };

  cv.addEventListener('pointermove', move);
  cv.addEventListener('pointerdown', e => { move(e); si = (si+1) % SYM.length; pulse(); });
  document.getElementById('pal').onclick = () => { pi = (pi+1) % PALS.length; setPalette(); pulse(); };
  document.getElementById('save').onclick = () => {
    render();
    const a = document.createElement('a');
    a.download = 'reverie.png'; a.href = cv.toDataURL('image/png'); a.click();
  };
  addEventListener('resize', resize);

  function render() {
    const now = performance.now()/1000, dt = Math.min(now - last, .05); last = now;
    const idle = now - lastMove > 3;                       // autopilot when untouched
    const tx = idle ? Math.sin(now*.17)*.6 : tgt.x;
    const ty = idle ? Math.cos(now*.13)*.5 : tgt.y;
    cur.x += (tx - cur.x)*.05; cur.y += (ty - cur.y)*.05;
    T += dt*(reduce ? .02 : (.65 + cur.y*.45));            // zoom speed
    gl.uniform2f(U.uRes, cv.width, cv.height);
    gl.uniform2f(U.uC0, cur.x*.09, cur.y*.06);
    gl.uniform1f(U.uT, T);
    gl.uniform1f(U.uN, SYM[si]);
    gl.uniform1f(U.uTw, cur.x*.42);
    gl.uniform1f(U.uPulse, Math.exp(-(now - pulseAt)*2.4));
    gl.uniform1f(U.uR, now);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  resize(); setPalette();
  (function loop() { render(); requestAnimationFrame(loop); })();
}
