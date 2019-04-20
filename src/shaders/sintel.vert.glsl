#version 300 es
precision highp float;
precision highp int;

uniform mat4 u_M;
uniform mat4 u_MVP;
uniform mat4 u_directionalShadowMatrix_MVP;

layout(location=0) in vec3 in_Position;
layout(location=1) in vec3 in_Normal;
layout(location=2) in vec2 in_UV;

out vec3 v_Position;
out vec3 v_Normal;
out vec2 v_UV;
out vec4 v_PositionLightShadowSpace;

void main() {
  gl_Position = u_MVP * vec4(in_Position, 1.0f);
  v_Position = (u_M * vec4(in_Position, 1.0f)).xyz;
  v_PositionLightShadowSpace = u_directionalShadowMatrix_MVP * vec4(in_Position, 1.0);
  v_Normal = in_Normal;
  v_UV = in_UV;
}
