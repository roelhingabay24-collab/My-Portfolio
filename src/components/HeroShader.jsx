import { useEffect, useRef } from 'react';

const VERTEX = `
attribute vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }
`;

// Three slow, drifting colour fields blended into a soft aurora. Alpha falls
// off with field strength, so the page background shows through everywhere.
const FRAGMENT = `
precision mediump float;
uniform vec2 uRes;
uniform float uTime;
uniform vec3 uA;
uniform vec3 uB;
uniform float uAlpha;

float field(vec2 p, vec2 c, float r) {
  return r / (dot(p - c, p - c) + r);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 p = uv * 2.0 - 1.0;
  p.x *= uRes.x / uRes.y;
  float t = uTime * 0.12;

  // Weighted toward the right, behind the profile card.
  vec2 c1 = vec2(0.9 + 0.35 * sin(t * 1.3), 0.25 + 0.3 * cos(t * 1.1));
  vec2 c2 = vec2(0.4 + 0.45 * cos(t * 0.9 + 1.7), -0.2 + 0.35 * sin(t * 1.4 + 0.6));
  vec2 c3 = vec2(1.3 + 0.3 * sin(t * 0.7 + 3.1), -0.45 + 0.25 * cos(t * 1.2 + 2.2));

  float f1 = field(p, c1, 0.22);
  float f2 = field(p, c2, 0.16);
  float f3 = field(p, c3, 0.14);

  vec3 color = (uA * (f1 + f3 * 0.6) + uB * f2) / max(f1 + f2 + f3 * 0.6, 0.001);
  float strength = smoothstep(0.12, 1.15, f1 + f2 + f3);
  gl_FragColor = vec4(color * strength * uAlpha, strength * uAlpha);
}
`;

const FRAME_MS = 1000 / 30;
const RENDER_SCALE = 0.5; // soft gradients survive being upscaled, and it quarters the pixel cost

function parseColor(value) {
  const probe = document.createElement('span');
  probe.style.color = value;
  document.body.appendChild(probe);
  const rgb = getComputedStyle(probe).color.match(/\d+(\.\d+)?/g) || ['99', '102', '241'];
  probe.remove();
  return rgb.slice(0, 3).map((channel) => Number(channel) / 255);
}

function compile(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
}

export default function HeroShader({ reduceMotion }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas?.getContext('webgl', { premultipliedAlpha: true, antialias: false, alpha: true });
    if (!gl) return undefined;

    const vs = compile(gl, gl.VERTEX_SHADER, VERTEX);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
    if (!vs || !fs) return undefined;
    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return undefined;
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'p');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const uniforms = {
      res: gl.getUniformLocation(program, 'uRes'),
      time: gl.getUniformLocation(program, 'uTime'),
      a: gl.getUniformLocation(program, 'uA'),
      b: gl.getUniformLocation(program, 'uB'),
      alpha: gl.getUniformLocation(program, 'uAlpha'),
    };

    // Colours follow the theme tokens, so the aurora re-tints on theme change.
    const applyTheme = () => {
      const styles = getComputedStyle(document.documentElement);
      const dark = document.documentElement.dataset.theme === 'dark';
      gl.uniform3fv(uniforms.a, parseColor(styles.getPropertyValue('--accent').trim()));
      gl.uniform3fv(uniforms.b, parseColor(dark ? '#0891b2' : '#22d3ee'));
      gl.uniform1f(uniforms.alpha, dark ? 0.7 : 0.55);
    };

    const resize = () => {
      const width = Math.max(1, Math.round(canvas.clientWidth * RENDER_SCALE));
      const height = Math.max(1, Math.round(canvas.clientHeight * RENDER_SCALE));
      if (canvas.width === width && canvas.height === height) return;
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
      gl.uniform2f(uniforms.res, width, height);
    };

    let frame = 0;
    let last = 0;
    let visible = true;
    const start = performance.now();

    const draw = (now) => {
      gl.uniform1f(uniforms.time, (now - start) / 1000 + 12);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const loop = (now) => {
      frame = requestAnimationFrame(loop);
      if (now - last < FRAME_MS) return;
      last = now;
      draw(now);
    };

    const run = () => {
      cancelAnimationFrame(frame);
      if (reduceMotion) {
        draw(performance.now());
        return;
      }
      if (visible && document.visibilityState === 'visible') frame = requestAnimationFrame(loop);
    };

    applyTheme();
    resize();
    run();

    const resizeObserver = new ResizeObserver(() => { resize(); if (reduceMotion) run(); });
    resizeObserver.observe(canvas);
    const viewObserver = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; run(); });
    viewObserver.observe(canvas);
    const themeObserver = new MutationObserver(() => { applyTheme(); if (reduceMotion) run(); });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    document.addEventListener('visibilitychange', run);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      viewObserver.disconnect();
      themeObserver.disconnect();
      document.removeEventListener('visibilitychange', run);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, [reduceMotion]);

  return <canvas className="hero-shader" ref={canvasRef} aria-hidden="true" />;
}
