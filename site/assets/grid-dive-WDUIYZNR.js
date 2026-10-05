const R=`#version 300 es
in vec2 p;
void main() { gl_Position = vec4(p, 0., 1.); }`,p=`#version 300 es
precision highp float;
uniform vec2 uRes;
uniform float uHorizon;   // fraction of the height, from the bottom
uniform float uOffset;    // distance travelled, in cells
uniform float uBlur;      // 0..1 motion streak on the cross lines
uniform float uFloor;     // opacity of the floor
uniform float uGlow;      // horizon glow
uniform float uFlash;     // white core of the horizon
out vec4 color;

const vec3 RED = vec3(1., .169, .169);

float line(float v, float width) {
  float d = abs(fract(v - .5) - .5) / max(fwidth(v), 1e-4);
  return 1. - smoothstep(0., width, d);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  float aspect = uRes.x / uRes.y;
  float d = uHorizon - uv.y;
  float centre = exp(-abs(uv.x - .5) * 1.6);

  vec3 c = vec3(0.);
  float a = 0.;
  if (d > 0.) {
    float z = .35 / d;
    float x = (uv.x - .5) * aspect * z * 4.;
    float depth = z * 4. + uOffset;
    float rails = line(x, 1.1);
    // Cross lines smear along the direction of travel as speed builds.
    float ties = line(depth, 1.1 + uBlur * 6.) * (1. - uBlur * .7);
    float fog = exp(-z * .09);
    float lattice = max(rails, ties) * fog;
    c = RED * lattice * (.55 + .45 * centre);
    a = uFloor;
    c *= uFloor;
  }
  float halo = exp(-abs(d) * 34.) * centre * uGlow;
  float core = exp(-abs(d) * uRes.y * .55) * (.35 + .65 * centre) * uFlash;
  c += RED * halo + vec3(1., .82, .82) * core;
  a = max(a, clamp(halo + core, 0., 1.));
  color = vec4(c, a);
}`;function g(i){const o=i.getContext("webgl2",{premultipliedAlpha:!0,antialias:!1});if(!o)return null;const f=(e,a)=>{const t=o.createShader(e);return o.shaderSource(t,a),o.compileShader(t),t},r=o.createProgram();if(o.attachShader(r,f(o.VERTEX_SHADER,R)),o.attachShader(r,f(o.FRAGMENT_SHADER,p)),o.linkProgram(r),!o.getProgramParameter(r,o.LINK_STATUS))return null;o.useProgram(r);const n=o.createBuffer();o.bindBuffer(o.ARRAY_BUFFER,n),o.bufferData(o.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),o.STATIC_DRAW);const u=o.getAttribLocation(r,"p");o.enableVertexAttribArray(u),o.vertexAttribPointer(u,2,o.FLOAT,!1,0,0);const s=e=>o.getUniformLocation(r,e),l=Object.fromEntries(["uRes","uHorizon","uOffset","uBlur","uFloor","uGlow","uFlash"].map(e=>[e,s(e)])),c=()=>{const e=Math.min(devicePixelRatio||1,2),a=Math.round(i.clientWidth*e),t=Math.round(i.clientHeight*e);(i.width!==a||i.height!==t)&&(i.width=a,i.height=t),o.viewport(0,0,a,t),o.uniform2f(l.uRes,a,t)};return{draw({horizon:e,offset:a,blur:t,floor:h,glow:d,flash:m}){c(),o.uniform1f(l.uHorizon,e),o.uniform1f(l.uOffset,a),o.uniform1f(l.uBlur,t),o.uniform1f(l.uFloor,h),o.uniform1f(l.uGlow,d),o.uniform1f(l.uFlash,m),o.clearColor(0,0,0,0),o.clear(o.COLOR_BUFFER_BIT),o.drawArrays(o.TRIANGLES,0,3)},destroy(){o.deleteBuffer(n),o.deleteProgram(r),o.getExtension("WEBGL_lose_context")?.loseContext()}}}export{g as createGridDive};
