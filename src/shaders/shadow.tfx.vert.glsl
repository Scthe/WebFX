#version 300 es
precision highp float;
precision highp int;


layout(location=0) in vec3 in_Position;

@import ./_utils;
@import ./_TressFXStrands;


void main() {
  TressFXParams tfxParams = createTfxParams();
  TressFXVertex tressfxVert = getExpandedTressFXVert(tfxParams);

  gl_Position = tressfxVert.position;
}
