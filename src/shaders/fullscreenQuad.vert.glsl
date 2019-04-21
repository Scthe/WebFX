#version 300 es
precision highp float;
precision highp int;

@import ./_fullscreenQuad;

out vec2 v_position;

void main() {
  vec2 pos = getFullscreenPositionFromVertexId();
  gl_Position = vec4(pos, 0.0f, 1.0f);
  v_position = pos;
}
