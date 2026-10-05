const dt=Math.PI*2,D=8,vt=550,gt=1200*800,Ct=7,pt=`
precision highp float;
attribute vec2 aGrid;
attribute vec2 aSeed;
uniform vec2  uRes;
uniform float uFocal;
uniform float uTime;
uniform float uAmp;
uniform float uScatter;
uniform float uFreq;
uniform vec2  uDir;
uniform float uFlow;
uniform float uDepth;
uniform float uCamY;
uniform float uCamZ;
uniform float uPitch;
uniform float uDot;
uniform float uColorCount;
uniform vec2  uJit;
uniform vec3  uColors[8];
uniform vec3  uCursor;
uniform float uCurR;
uniform float uCurS;
uniform float uHover;
varying vec3  vCol;
varying float vA;
varying float vHot;
vec3 pickColor(float sel) {
  float idx = floor(sel * uColorCount);
  vec3 c = uColors[0];
  for (int i = 1; i < 8; i++) {
    if (float(i) >= uColorCount) break;
    if (float(i) == idx) c = uColors[i];
  }
  return c;
}
float surf(vec2 q) {
  return sin(q.x) * 0.55 + sin(q.x * 0.55 + q.y * 1.15) * 0.30 + sin(q.y * 0.75) * 0.22;
}
void main() {
  vec2 w = aGrid + (aSeed - 0.5) * uJit;
  w.y = uCamZ + mod(w.y - uFlow - uCamZ, uDepth);
  float h3 = fract(sin(dot(aSeed, vec2(91.37, 47.13))) * 12345.678);
  float h = surf(w * uFreq - uDir * uTime) * uAmp + (h3 - 0.5) * uScatter;
  float cd = length(w - uCursor.xy);
  float g = exp(-(cd * cd) / (uCurR * uCurR)) * uCursor.z;
  h += g * uCurS;
  float g2 = g * g; g2 = g2 * g2; g2 = g2 * g2;
  vec3 p = vec3(w.x, h - uCamY, w.y - uCamZ);
  float c = cos(uPitch);
  float s = sin(uPitch);
  float ry = p.y * c + p.z * s;
  float rz = -p.y * s + p.z * c;
  if (rz < 40.0) {
    gl_Position = vec4(2.0, 2.0, 0.0, 1.0);
    gl_PointSize = 0.0;
    vCol = uColors[0];
    vA = 0.0;
    vHot = 0.0;
    return;
  }
  float sx = p.x * uFocal / rz;
  float sy = ry * uFocal / rz;
  gl_Position = vec4(sx / (uRes.x * 0.5), sy / (uRes.y * 0.5), 0.0, 1.0);
  float rad = max(uDot * uFocal / rz, 0.55);
  gl_PointSize = clamp(rad * 2.0 * (1.0 + g2 * uHover * 0.20), 1.0, 220.0);
  float bri = 0.28 + h3 * 0.72;
  vec2 bq = w * vec2(0.0040, 0.0032) - uDir * uTime * 0.30;
  float band = sin(bq.x) + sin(bq.y);
  float sel = fract((band + 2.0) * 0.25 + (aSeed.y - 0.5) * 0.55);
  vCol = pickColor(sel);
  float lum = dot(vCol, vec3(0.299, 0.587, 0.114));
  vHot = (0.25 + 0.75 * lum) * bri * bri * 0.7 + g2 * uHover * 0.55;
  float fog = (1.0 - smoothstep(2800.0, 6400.0, rz)) * smoothstep(70.0, 240.0, rz);
  vA = bri * fog * (1.0 + g2 * uHover * 0.55);
}
`,At=`
precision highp float;
varying vec3  vCol;
varying float vA;
varying float vHot;
void main() {
  float d = length(gl_PointCoord - 0.5) * 2.0;
  if (d > 1.0) discard;
  float a = (1.0 - smoothstep(0.90, 1.0, d)) * vA;
  vec3 col = vCol + vec3(1.0) * pow(1.0 - d, 10.0) * vHot * 0.9;
  gl_FragColor = vec4(col * a, a);
}
`;function Ft(e){const a=parseInt(e.replace("#","").slice(0,6),16);return[(a>>16&255)/255,(a>>8&255)/255,(a&255)/255]}function xt(e){return function(){e|=0,e=e+1831565813|0;let a=Math.imul(e^e>>>15,1|e);return a=a+Math.imul(a^a>>>7,61|a)^a,((a^a>>>14)>>>0)/4294967296}}function ot(e,a,C){const l=e.createShader(a);return e.shaderSource(l,C),e.compileShader(l),e.getShaderParameter(l,e.COMPILE_STATUS)?l:(console.warn("WaveField shader:",e.getShaderInfoLog(l)),null)}function Mt(e,a={}){const{colors:C=["#ff2b2b","#f2f2f2"],density:l=145,dotSize:rt=2,scatter:nt=108,cameraHeight:it=50,waveHeight:at=200,waveLength:ut=2070,waveSpeed:L=250,tilt:lt=12,cursorRadius:ft=25,cursorLift:P=45}=a,st=L*(260/160),ct=Math.min(400,Math.abs(P)*(100/45)),t=e.getContext("webgl",{alpha:!0,antialias:!1,premultipliedAlpha:!0,depth:!1});if(!t)return null;const T=ot(t,t.VERTEX_SHADER,pt),I=ot(t,t.FRAGMENT_SHADER,At);if(!T||!I)return null;const u=t.createProgram();if(t.attachShader(u,T),t.attachShader(u,I),t.linkProgram(u),!t.getProgramParameter(u,t.LINK_STATUS))return null;t.useProgram(u);const z=t.getAttribLocation(u,"aGrid"),B=t.getAttribLocation(u,"aSeed"),r=o=>t.getUniformLocation(u,o),y=Math.max(8,Math.round(l)),R=Math.max(8,Math.round(l*2)),b=y*R,H=3600/(y-1),O=7e3/(R-1),_=new Float32Array(b*2),w=new Float32Array(b*2),q=xt(24301);for(let o=0,n=0;o<R;o++)for(let f=0;f<y;f++,n++)_[n*2]=-3600/2+(f+.5)*H,_[n*2+1]=o*O,w[n*2]=q(),w[n*2+1]=q();const U=t.createBuffer();t.bindBuffer(t.ARRAY_BUFFER,U),t.bufferData(t.ARRAY_BUFFER,_,t.STATIC_DRAW),t.enableVertexAttribArray(z),t.vertexAttribPointer(z,2,t.FLOAT,!1,0,0);const W=t.createBuffer();t.bindBuffer(t.ARRAY_BUFFER,W),t.bufferData(t.ARRAY_BUFFER,w,t.STATIC_DRAW),t.enableVertexAttribArray(B),t.vertexAttribPointer(B,2,t.FLOAT,!1,0,0);const Y=new Float32Array(D*3);C.slice(0,D).forEach((o,n)=>Y.set(Ft(o),n*3)),t.uniform3fv(r("uColors[0]"),Y),t.uniform1f(r("uColorCount"),Math.min(C.length,D)),t.uniform1f(r("uAmp"),at),t.uniform1f(r("uScatter"),nt),t.uniform1f(r("uFreq"),dt/Math.max(50,ut)),t.uniform2f(r("uDir"),0,-1),t.uniform1f(r("uDepth"),7e3),t.uniform1f(r("uCamZ"),700),t.uniform1f(r("uDot"),rt),t.uniform2f(r("uJit"),H*.25,O*.7),t.uniform1f(r("uCurR"),Math.max(1,ft/100*(3600/2))),t.uniform1f(r("uCurS"),P),t.uniform1f(r("uHover"),ct/100),t.disable(t.DEPTH_TEST),t.enable(t.BLEND),t.blendFunc(t.ONE,t.ONE);let h=0,d=0,v=1,Z=1;const G=()=>{v=Math.min(window.devicePixelRatio||1,1.5),h=e.clientWidth,d=e.clientHeight,Z=h>0&&d>0?Math.min(2.5,Math.max(.5,Math.sqrt(h*d/gt))):1,e.width=Math.max(1,Math.round(h*v)),e.height=Math.max(1,Math.round(d*v)),t.viewport(0,0,e.width,e.height)};G();const N=new ResizeObserver(G);N.observe(e);const i={x:0,y:0,sx:0,sy:0,active:0,target:0},V=o=>{const n=e.getBoundingClientRect();i.x=o.clientX-n.left,i.y=o.clientY-n.top,i.target=i.y>=0&&i.y<=n.height?1:0},k=()=>i.target=0;window.addEventListener("pointermove",V,{passive:!0}),document.documentElement.addEventListener("pointerleave",k);const mt=(o,n,f)=>{const F=i.sx*v-e.width/2,x=-(i.sy*v-e.height/2),M=F/o,g=x/o,m=Math.cos(n),$=Math.sin(n),tt=g*m-$,ht=g*$+m;if(tt>-1e-4)return null;const et=-f/tt;return{x:M*et,z:700+ht*et}};let s=0,p=0,X=0,S=0,c=0,E=0,A=4,J=lt,K=0,j=-1e6;const Q=o=>{s=requestAnimationFrame(Q);const n=p?Math.min((o-p)/1e3,.05):1/60;if(p=o,h<=0||d<=0)return;i.active+=(i.target-i.active)*(1-Math.exp(-n*8));const f=1-Math.exp(-n*Ct);i.sx+=(i.x-i.sx)*f,i.sy+=(i.y-i.sy)*f,c+=(E-c)*(1-Math.exp(-n*A)),A!==4&&Math.abs(c-E)<.05&&(A=4);const F=1+c;X+=n*(L/100)*F,S=(S+n*st*F)%7e3;const x=J*Math.PI/180,M=Math.min(100,Math.max(0,it))/100*vt*Z,g=e.height/(2*Math.tan(60/2*Math.PI/180));if(i.active>.001){const m=mt(g,x,M);m&&(K=m.x,j=m.z)}t.uniform2f(r("uRes"),e.width,e.height),t.uniform1f(r("uFocal"),g),t.uniform1f(r("uTime"),X),t.uniform1f(r("uFlow"),S),t.uniform1f(r("uCamY"),M),t.uniform1f(r("uPitch"),x),t.uniform3f(r("uCursor"),K,j,i.active),t.clearColor(0,0,0,0),t.clear(t.COLOR_BUFFER_BIT),t.drawArrays(t.POINTS,0,b)};return{start(){s||(p=0,s=requestAnimationFrame(Q))},stop(){cancelAnimationFrame(s),s=0},setBoost(o){E=o},surge(o){c=Math.max(c,o),A=1.4},setTilt(o){J=o},destroy(){cancelAnimationFrame(s),s=0,N.disconnect(),window.removeEventListener("pointermove",V),document.documentElement.removeEventListener("pointerleave",k),t.deleteBuffer(U),t.deleteBuffer(W),t.deleteProgram(u),t.getExtension("WEBGL_lose_context")?.loseContext()}}}export{Mt as createWaveField};
