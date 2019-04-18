#version 300 es
precision highp float;
precision highp int;
precision highp usampler2D;

uniform sampler2D u_depthTex;

in vec2 v_position;

layout(location = 0) out vec4 color1;

@import ./_utils;

void main() {
  vec2 posTextureSpace = to_0_1(v_position);
  float depth = texture(u_depthTex, posTextureSpace).r;
  color1 = vec4(depth, depth, depth, 1.0f);
}
