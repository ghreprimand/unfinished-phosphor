/* SPDX-License-Identifier: GPL-3.0-only
 * Copyright (C) 2026 Unfinished Works
 */
import { rgb } from './palettes.js';
const instances = new WeakMap();
const vertex = `attribute vec2 position; varying vec2 uv; void main(){uv=position*.5+.5;gl_Position=vec4(position,0.,1.);}`;
const fragment = `
precision mediump float;
varying vec2 uv;
uniform vec3 tint;
uniform vec3 cold;
uniform vec2 pointer;
uniform float charge;
uniform float aspect;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
void main(){
 vec2 p=(uv-vec2(.38,.42))*vec2(1.,1.2);
 float fog=exp(-dot(p,p)*7.);
 vec2 m=(uv-pointer)*vec2(aspect,1.);
 float beam=exp(-dot(m,m)*18.)*charge;
 float cool=exp(-dot(uv-vec2(.75,.28),uv-vec2(.75,.28))*9.);
 vec3 light=tint*(fog*.035+beam*.025)+cold*cool*.016;
 // Fixed grain in the final gradient. No time uniform, sweep, or pulse.
 light+=(hash(gl_FragCoord.xy)-.5)*min(vec3(3./255.),light*2.);
 gl_FragColor=vec4(max(light,0.),1.);
}`;

/** Optional WebGL light pass. CSS remains the fallback; zero scheduled frames at idle. */
export function mountAmbient(root) {
  if (!root?.hasAttribute('data-phosphor')) throw new TypeError('Mount Phosphor before ambient rendering');
  if (instances.has(root)) return instances.get(root);
  const doc = root.ownerDocument, win = doc.defaultView;
  const reduced = win.matchMedia('(prefers-reduced-motion: reduce)');
  const coarse = win.matchMedia('(hover: none), (pointer: coarse)');
  const contrast = win.matchMedia('(prefers-contrast: more), (forced-colors: active)');
  const canvas = doc.createElement('canvas');
  canvas.className = 'ph-ambient'; canvas.setAttribute('aria-hidden','true');
  canvas.style.mixBlendMode = 'screen';
  root.prepend(canvas);
  let gl, program, buffer, uniforms, timer = 0, destroyed = false, lost = false, failed = false, visible = true;
  let x = .5, y = .5, targetX = .5, targetY = .5, charge = 0, moved = -Infinity, last = 0;
  const stats = { context: 'static', frames: 0, running: false, width: 0, height: 0 };
  const listeners = [];
  function listen(target, event, fn, options) { target.addEventListener(event, fn, options); listeners.push(() => target.removeEventListener(event, fn, options)); }
  function stop() { win.clearTimeout(timer); timer = 0; stats.running = false; }
  function permitted() { return !destroyed && !lost && !failed && visible && root.isConnected && !doc.hidden && !reduced.matches && !coarse.matches && !contrast.matches && root.dataset.phEffects === 'on'; }
  function release() {
    if (gl && !lost) { if (buffer) gl.deleteBuffer(buffer); if (program) gl.deleteProgram(program); }
    buffer = program = uniforms = null;
  }
  function setup() {
    const shaders = [];
    try {
      gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: 'low-power' });
      if (!gl) throw new Error('No WebGL');
      function compile(type, source) {
        const shader = gl.createShader(type); shaders.push(shader);
        gl.shaderSource(shader, source); gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error('Shader unavailable');
        return shader;
      }
      program = gl.createProgram();
      gl.attachShader(program, compile(gl.VERTEX_SHADER, vertex)); gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragment));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Program unavailable');
      gl.useProgram(program);
      buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,3,-1,-1,3]), gl.STATIC_DRAW);
      const position = gl.getAttribLocation(program, 'position');
      gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
      uniforms = Object.fromEntries(['tint','cold','pointer','charge','aspect'].map(name => [name, gl.getUniformLocation(program,name)]));
      stats.context = 'webgl'; return true;
    } catch {
      release(); failed = true; stats.context = 'fallback'; return false;
    } finally { shaders.forEach(shader => gl?.deleteShader(shader)); }
  }
  function paint() {
    if (!permitted()) return;
    if (!program && !setup()) { canvas.hidden = true; return; }
    const { width, height } = root.getBoundingClientRect();
    if (!width || !height) return;
    const ratio = Math.min(win.devicePixelRatio || 1, 1.5, 900 / Math.max(width,height));
    const w = Math.max(1, Math.round(width * ratio)), h = Math.max(1, Math.round(height * ratio));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    stats.width = w; stats.height = h;
    gl.viewport(0,0,w,h); gl.useProgram(program);
    const style = win.getComputedStyle(root);
    const color = (name, fallback) => { try { return rgb(style.getPropertyValue(name).trim()).map(n => n / 255); } catch { return rgb(fallback).map(n => n / 255); } };
    gl.uniform3fv(uniforms.tint, color('--ph-emission','#00ffaa')); gl.uniform3fv(uniforms.cold, color('--ph-info','#71d9eb'));
    gl.uniform2f(uniforms.pointer,x,y); gl.uniform1f(uniforms.charge,charge); gl.uniform1f(uniforms.aspect,width/height);
    gl.drawArrays(gl.TRIANGLES,0,3); stats.frames++;
  }
  function frame() {
    timer = 0;
    if (!permitted()) { stop(); return; }
    const now = win.performance.now(); const dt = Math.min(.1,(now-last)/1000 || .033); last = now;
    x += (targetX-x)*Math.min(1,dt*7); y += (targetY-y)*Math.min(1,dt*7);
    const target = now-moved < 180 ? 1 : 0;
    charge += (target-charge)*Math.min(1,dt*(target ? 8 : 3));
    if (charge < .005 && !target) charge = 0;
    paint();
    if (charge || target) schedule(); else stop();
  }
  function schedule() { if (!timer && permitted()) { stats.running = true; timer = win.setTimeout(frame,34); } }
  function update() {
    if (destroyed) return;
    stop(); charge = 0; canvas.hidden = !permitted();
    if (permitted()) paint();
  }
  listen(root,'pointermove', event => {
    if (!permitted()) return;
    const box = root.getBoundingClientRect();
    targetX = (event.clientX-box.left)/box.width; targetY = 1-(event.clientY-box.top)/box.height;
    moved = win.performance.now(); schedule();
  }, { passive: true });
  listen(root,'pointerleave', () => { moved = -Infinity; });
  listen(root,'phosphorchange',update);
  listen(doc,'visibilitychange',update);
  listen(win,'resize',update,{passive:true});
  for (const media of [reduced,coarse,contrast]) listen(media,'change',update);
  listen(canvas,'webglcontextlost',event => { event.preventDefault(); lost = true; stop(); release(); canvas.hidden = true; stats.context = 'lost'; });
  listen(canvas,'webglcontextrestored',() => { lost = false; failed = false; update(); });
  const resize = new win.ResizeObserver(update); resize.observe(root);
  const intersection = new win.IntersectionObserver(entries => { visible = entries[0].isIntersecting; update(); }); intersection.observe(root);
  // CSS-only consumers can control attributes directly.
  const observer = new win.MutationObserver(update); observer.observe(root,{attributes:true,attributeFilter:['data-ph-effects','data-ph-preset','style']});
  const api = {
    update,
    get stats() { return Object.freeze({ ...stats }); },
    destroy() {
      if (destroyed) return;
      destroyed = true; stop(); resize.disconnect(); intersection.disconnect(); observer.disconnect(); listeners.forEach(dispose => dispose());
      release(); gl?.getExtension('WEBGL_lose_context')?.loseContext(); canvas.remove(); instances.delete(root); stats.context = 'destroyed';
    },
  };
  listen(root,'phosphordestroy',api.destroy);
  instances.set(root,api); update();
  return api;
}
