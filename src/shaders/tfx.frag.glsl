#version 300 es
precision highp float;
precision highp int;
precision highp usampler2D;
// precision highp sampler2D;

layout(location = 0) out vec4 outColor1;

void main() {
  outColor1 = vec4(1.0, 0.0, 0.0, 1.0);
}
