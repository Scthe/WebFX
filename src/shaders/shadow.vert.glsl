#version 300 es
precision highp float;
precision highp int;

uniform mat4 u_MVP;

layout(location=0) in vec3 position;

void main() {
  gl_Position = u_MVP * vec4(position, 1.0f);
}
