/* Painted Prologue v2
   Animates sampled pixels of the original high-detail WebP illustration.
   The original unmodified background remains underneath as a fallback.
   No separate vector replacement scene is introduced. */
(() => {
  'use strict';
  const art = document.getElementById('sceneArt');
  const storyScreen = document.getElementById('storyScreen');
  if (!art || !storyScreen) return;
  const sceneSrc = 'assets/shore-scene.webp';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const canvas = document.createElement('canvas');
  canvas.className = 'painted-motion-layer';
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:0;';
  art.insertBefore(canvas, art.firstChild);
  const gl = canvas.getContext('webgl', {alpha:false, antialias:false, depth:false, stencil:false, preserveDrawingBuffer:false, powerPreference:'low-power'});
  if (!gl) {
    canvas.remove();
    return; // Preserve existing illustrated game and ambient character animation.
  }
  const vert = [
    'attribute vec2 a_position;',
    'varying vec2 v_screen;',
    'void main(){',
    'v_screen = a_position * 0.5 + 0.5;',
    'gl_Position = vec4(a_position,0.0,1.0);',
    '}'
  ].join('\n');
  const frag = [
    'precision highp float;',
    'uniform sampler2D u_painting;',
    'uniform vec2 u_cover;',
    'uniform float u_time;',
    'uniform float u_surge;',
    'varying vec2 v_screen;',
    'float oval(vec2 p, vec2 c, vec2 r){',
    '  float d=length((p-c)/r);',
    '  return 1.0-smoothstep(0.72,1.0,d);',
    '}',
    'void main(){',
    '  vec2 p=vec2(0.5+(v_screen.x-0.5)*u_cover.x,',
    '    0.5+((1.0-v_screen.y)-0.5)*u_cover.y);',
    '  float t=u_time;',
    '  // Water masks follow visible seawater and avoid ships, figures and foreground rock.',
    '  float water=0.0;',
    '  water=max(water,oval(p,vec2(0.355,0.386),vec2(0.107,0.065)));',
    '  water=max(water,oval(p,vec2(0.510,0.384),vec2(0.16,0.064)));',
    '  water=max(water,oval(p,vec2(0.645,0.435),vec2(0.18,0.055)));',
    '  water=max(water,oval(p,vec2(0.835,0.490),vec2(0.21,0.085)));',
    '  water=max(water,oval(p,vec2(0.943,0.586),vec2(0.085,0.09)));',
    '  water=max(water,oval(p,vec2(0.683,0.643),vec2(0.102,0.027))*0.74);',
    '  // Protect the separate silhouettes of the fisherman and stranded traveler.',
    '  water *= 1.0-oval(p,vec2(0.478,0.545),vec2(0.073,0.176));',
    '  water *= 1.0-oval(p,vec2(0.255,0.733),vec2(0.182,0.17));',
    '  // Protect the larger rocks and fishing vessels from the water displacement.',
    '  water *= 1.0-oval(p,vec2(0.612,0.530),vec2(0.082,0.057))*0.92;',
    '  water *= 1.0-oval(p,vec2(0.730,0.571),vec2(0.105,0.066))*0.92;',
    '  water *= 1.0-oval(p,vec2(0.663,0.368),vec2(0.111,0.083))*0.95;',
    '  water *= 1.0-oval(p,vec2(0.790,0.386),vec2(0.130,0.078))*0.96;',
    '  float small=sin(p.x*132.0-t*2.3+p.y*28.0);',
    '  float roll=sin(p.x*44.0 +p.y*20.0-t*1.12);',
    '  float cross=sin(p.x*81.0-p.y*35.0+t*1.76);',
    '  vec2 drift=vec2(0.0038*roll+0.0015*cross,',
    '    0.0030*small+0.0028*roll);',
    '  drift *= water*(1.0+0.65*u_surge);',
    '  // Cloud textures slowly migrate, independent of the mountains.',
    '  float clouds=oval(p,vec2(0.37,0.115),vec2(0.285,0.12));',
    '  clouds=max(clouds,oval(p,vec2(0.60,0.089),vec2(0.22,0.065)));',
    '  drift.x += clouds*(0.0015*sin(t*0.21)+0.0012*sin(p.y*26.0+t*.18));',
    '  // Gentle, local breathing in the already painted shoreline figure.',
    '  float person=oval(p,vec2(0.483,0.535),vec2(0.032,0.102));',
    '  drift.y += person*0.00085*sin(t*1.9);',
    '  // Tattered sail reacts to the wind without moving the wreck frame.',
    '  float cloth=oval(p,vec2(0.177,0.153),vec2(0.064,0.137));',
    '  drift.x+=cloth*0.0010*sin(t*1.32+p.y*48.0);',
    '  vec2 sampleAt=clamp(p+drift,vec2(.001),vec2(.999));',
    '  vec4 painting=texture2D(u_painting,vec2(sampleAt.x,1.0-sampleAt.y));',
    '  // Existing reflected daylight gently brightens/dims in the water.',
    '  float reflected=oval(p,vec2(0.426,0.43),vec2(0.056,0.16))*water;',
    '  painting.rgb *= 1.0+reflected*(0.045+0.022*sin(t*1.8+p.y*30.0));',
    '  gl_FragColor=vec4(painting.rgb,1.0);',
    '}'
  ].join('\n');
  function compile(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader,source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader,gl.COMPILE_STATUS)) {
      console.warn('Painted illustration animation shader:',gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }
  const vs=compile(gl.VERTEX_SHADER,vert);
  const fs=compile(gl.FRAGMENT_SHADER,frag);
  if (!vs || !fs) { canvas.remove(); return; }
  const program=gl.createProgram();
  gl.attachShader(program,vs); gl.attachShader(program,fs); gl.linkProgram(program);
  if (!gl.getProgramParameter(program,gl.LINK_STATUS)) {
    console.warn('Painted illustration animation:',gl.getProgramInfoLog(program));
    canvas.remove(); return;
  }
  gl.useProgram(program);
  const vertex=gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER,vertex);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]),gl.STATIC_DRAW);
  const location=gl.getAttribLocation(program,'a_position');
  gl.enableVertexAttribArray(location);
  gl.vertexAttribPointer(location,2,gl.FLOAT,false,0,0);
  const uniforms={
    cover:gl.getUniformLocation(program,'u_cover'),
    time:gl.getUniformLocation(program,'u_time'),
    surge:gl.getUniformLocation(program,'u_surge'),
    painting:gl.getUniformLocation(program,'u_painting')
  };
  const texture=gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D,texture);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
  gl.uniform1i(uniforms.painting,0);
  const painting=new Image();
  painting.decoding='async';
  let ready=false, lastWidth=0,lastHeight=0, start=0, lastDraw=0, surgeStart=-10;
  let activeScene='shore';
  function isMotionEnabled() {
    return !reduced.matches && !document.documentElement.classList.contains('motion-off');
  }
  function resize() {
    const rect=art.getBoundingClientRect();
    const dpr=Math.min(window.devicePixelRatio||1,1.5);
    const width=Math.max(1,Math.round(rect.width*dpr));
    const height=Math.max(1,Math.round(rect.height*dpr));
    if(width===lastWidth && height===lastHeight)return;
    canvas.width=lastWidth=width;
    canvas.height=lastHeight=height;
    gl.viewport(0,0,width,height);
    const fit=Math.max(rect.width/painting.naturalWidth,rect.height/painting.naturalHeight);
    gl.uniform2f(uniforms.cover,
      rect.width/(painting.naturalWidth*fit),
      rect.height/(painting.naturalHeight*fit));
  }
  function draw(timeSeconds,amplitude) {
    if(!ready) return;
    resize();
    gl.uniform1f(uniforms.time,timeSeconds);
    gl.uniform1f(uniforms.surge,amplitude);
    gl.drawArrays(gl.TRIANGLES,0,6);
  }
  function sceneSync(){
    const bg=art.style.backgroundImage;
    activeScene=bg.includes('hearth-scene')?'house':'shore';
    canvas.style.display=activeScene==='shore'?'block':'none';
  }
  new MutationObserver(sceneSync).observe(art,{attributes:true,attributeFilter:['style']});
  sceneSync();
  const text=document.getElementById('dialogueText');
  if(text){
    new MutationObserver(()=>{
      if(activeScene==='shore' &&
         (text.textContent.includes('The air tastes of salt') ||
          text.textContent.includes('The waters stretch'))) surgeStart=performance.now()/1000;
    }).observe(text,{childList:true,characterData:true,subtree:true});
  }
  function loop(now){
    requestAnimationFrame(loop);
    if (!ready || activeScene!=='shore' ||
        storyScreen.classList.contains('hidden') || document.hidden)return;
    // Throttle to ~30fps on mobile; canvas work is deferred while the story is hidden.
    if (now-lastDraw<32)return;
    lastDraw=now;
    if (!start)start=now;
    let t=(now-start)/1000;
    if (!isMotionEnabled())t=0;
    const burst=isMotionEnabled()?Math.max(0,1-((now/1000-surgeStart)/2.8)):0;
    draw(t,burst);
  }
  painting.onload=()=>{
    try {
      gl.bindTexture(gl.TEXTURE_2D,texture);
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,painting);
      ready=true;
      draw(0,0);
    } catch(error) {
      console.warn('Painted motion: original image unavailable to renderer',error);
      canvas.remove();
    }
  };
  painting.onerror=()=>{canvas.remove();};
  painting.src=sceneSrc;
  window.addEventListener('resize',()=>{if(ready)draw(isMotionEnabled()?(performance.now()-start)/1000:0,0);},{passive:true});
  art.addEventListener('click',(event)=>{
    if(event.target.closest('.hotspot')?.getAttribute('aria-label')==='Look toward sea')
      surgeStart=performance.now()/1000;
  });
  requestAnimationFrame(loop);
})();
