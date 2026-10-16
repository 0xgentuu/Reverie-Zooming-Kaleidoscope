// GLSL sources. Tweak the numbers in pat() to reshape the tunnel.
const VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';

const FS = `precision highp float;
uniform vec2 uRes,uC0;uniform float uT,uN,uTw,uPulse,uR;
uniform vec3 uA,uB,uC,uD,uBase;
const float PI=3.14159265;
float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}

// Returns (colour phase, line brightness) for one point on screen.
vec2 pat(vec2 p){
 float r=length(p)+1e-4;
 float a=atan(p.y,p.x);
 float seg=PI/uN;
 a=abs(mod(a,2.*seg)-seg);          // kaleidoscope fold
 float z=log(r)*1.6-uT*.35;         // log-polar depth = endless zoom
 a+=z*uTw;                          // spiral twist
 vec2 q=vec2(a*uN*1.2,z*2.2);
 for(int i=0;i<4;i++){              // domain warp
  q+=.55*vec2(sin(q.y*1.4+uT*.25+float(i)*1.7),cos(q.x*1.3-uT*.2+float(i)*2.3));
 }
 float v=sin(q.y*2.+sin(q.x*1.3)*1.2)*sin(q.x*2.-q.y*.8);
 float line=pow(1.-abs(v),6.);
 return vec2(q.y*.15+q.x*.1+v*.25,line*.9+(.5+.5*v)*.25);
}

void main(){
 vec2 uv=(gl_FragCoord.xy-.5*uRes)/uRes.y-uC0;
 // three samples at slightly different depths = chromatic fringing
 vec2 s0=pat(uv),s1=pat(uv*1.06),s2=pat(uv*1.12);
 vec3 ph=vec3(s0.x,s1.x,s2.x),rd=vec3(s0.y,s1.y,s2.y);
 vec3 col=(uA+uB*cos(6.28318*(uC*ph+uD)))*rd;
 float r=length(uv);
 col*=mix(.12,1.,smoothstep(0.,.55,r));
 vec3 core=uA+uB*cos(6.28318*(uC*(uT*.05)+uD));
 col+=core*exp(-r*6.)*(.55+uPulse);
 col*=1.+uPulse*.7;
 col*=1.-.6*dot(uv,uv)*.8;
 col+=uBase;
 col=1.-exp(-col*1.5);              // soft filmic roll-off
 col+=(hash(gl_FragCoord.xy+uR)-.5)*.025;
 gl_FragColor=vec4(pow(max(col,0.),vec3(.92)),1.);
}`;
