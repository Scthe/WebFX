#version 300 es
precision highp float;
precision highp int;

uniform mat4 u_M;
uniform mat4 u_MVP;

layout(location=0) in vec3 in_Position;
layout(location=1) in vec3 in_Normal;

out vec3 v_Position;
out vec3 v_Normal;

void main() {
  gl_Position = u_MVP * vec4(in_Position, 1.0f);
  v_Position = (u_M * vec4(in_Position, 1.0f)).xyz;
  v_Normal = in_Normal;
}
