#version 300 es
precision highp float;
precision highp int;

uniform vec3 u_color;

layout(location = 0) out vec4 outColor1;


void main() {
  outColor1 = vec4(u_color, 1.0);
}
