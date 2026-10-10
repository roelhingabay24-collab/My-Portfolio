import{i as e,n as t,t as n}from"./jsx-runtime-Cltr0gcK.js";var r=e(t(),1),i=n(),a=`
attribute vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }
`,o=`
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
`,s=1e3/30,c=.5;function l(e){let t=document.createElement(`span`);t.style.color=e,document.body.appendChild(t);let n=getComputedStyle(t).color.match(/\d+(\.\d+)?/g)||[`99`,`102`,`241`];return t.remove(),n.slice(0,3).map(e=>Number(e)/255)}function u(e,t,n){let r=e.createShader(t);return e.shaderSource(r,n),e.compileShader(r),e.getShaderParameter(r,e.COMPILE_STATUS)?r:null}function d({reduceMotion:e}){let t=(0,r.useRef)(null);return(0,r.useEffect)(()=>{let n=t.current,r=n?.getContext(`webgl`,{premultipliedAlpha:!0,antialias:!1,alpha:!0});if(!r)return;let i=u(r,r.VERTEX_SHADER,a),d=u(r,r.FRAGMENT_SHADER,o);if(!i||!d)return;let f=r.createProgram();if(r.attachShader(f,i),r.attachShader(f,d),r.linkProgram(f),!r.getProgramParameter(f,r.LINK_STATUS))return;r.useProgram(f);let p=r.createBuffer();r.bindBuffer(r.ARRAY_BUFFER,p),r.bufferData(r.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),r.STATIC_DRAW);let m=r.getAttribLocation(f,`p`);r.enableVertexAttribArray(m),r.vertexAttribPointer(m,2,r.FLOAT,!1,0,0);let h={res:r.getUniformLocation(f,`uRes`),time:r.getUniformLocation(f,`uTime`),a:r.getUniformLocation(f,`uA`),b:r.getUniformLocation(f,`uB`),alpha:r.getUniformLocation(f,`uAlpha`)},g=()=>{let e=getComputedStyle(document.documentElement),t=document.documentElement.dataset.theme===`dark`;r.uniform3fv(h.a,l(e.getPropertyValue(`--accent`).trim())),r.uniform3fv(h.b,l(t?`#0891b2`:`#22d3ee`)),r.uniform1f(h.alpha,t?.7:.55)},_=()=>{let e=Math.max(1,Math.round(n.clientWidth*c)),t=Math.max(1,Math.round(n.clientHeight*c));(n.width!==e||n.height!==t)&&(n.width=e,n.height=t,r.viewport(0,0,e,t),r.uniform2f(h.res,e,t))},v=0,y=0,b=!0,x=performance.now(),S=e=>{r.uniform1f(h.time,(e-x)/1e3+12),r.clearColor(0,0,0,0),r.clear(r.COLOR_BUFFER_BIT),r.drawArrays(r.TRIANGLES,0,3)},C=e=>{v=requestAnimationFrame(C),!(e-y<s)&&(y=e,S(e))},w=()=>{if(cancelAnimationFrame(v),e){S(performance.now());return}b&&document.visibilityState===`visible`&&(v=requestAnimationFrame(C))};g(),_(),w();let T=new ResizeObserver(()=>{_(),e&&w()});T.observe(n);let E=new IntersectionObserver(([e])=>{b=e.isIntersecting,w()});E.observe(n);let D=new MutationObserver(()=>{g(),e&&w()});return D.observe(document.documentElement,{attributes:!0,attributeFilter:[`data-theme`]}),document.addEventListener(`visibilitychange`,w),()=>{cancelAnimationFrame(v),T.disconnect(),E.disconnect(),D.disconnect(),document.removeEventListener(`visibilitychange`,w),r.getExtension(`WEBGL_lose_context`)?.loseContext()}},[e]),(0,i.jsx)(`canvas`,{className:`hero-shader`,ref:t,"aria-hidden":`true`})}export{d as default};