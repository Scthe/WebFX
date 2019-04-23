#version 300 es
precision highp float;
precision highp int;
precision highp sampler2D;

// depth in perspective projection, will be converted to linear later
uniform sampler2D u_depthPerspTex;
uniform vec2 u_nearAndFar;


in vec2 v_position;

layout(location = 0) out vec4 outColor1;


@import ./_utils;


void main() {
  vec2 texcoord = to_0_1(v_position.xy);
  float depth = texture(u_depthPerspTex, texcoord).r;
  float linearDepth = linearizeDepth(depth, u_nearAndFar);
  outColor1 = vec4(vec3(linearDepth), 1.0);
}
