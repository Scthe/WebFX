#version 300 es
precision highp float;
precision highp int;

uniform vec3 u_position;
uniform float u_scale;
uniform mat4 u_VP;

layout(location=0) in vec3 in_Position;

void main() {
  vec3 pos = in_Position * u_scale;
  gl_Position = u_VP * vec4(u_position + pos, 1.0f);
}
