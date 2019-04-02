#version 300 es
precision highp float;
precision highp int;

// TODO make billboard-like

uniform mat4 u_MVP;
uniform vec3 u_cameraPosition;
uniform int u_numVerticesPerStrand;
uniform vec2 u_viewportSize;
uniform float u_fiberRadius;
uniform sampler2D u_vertexPositionsBuffer;

const float EXPAND_PIXELS_FACTOR = 0.71;


@import ./TressFXStrands;


void main() {
  // ivec2 positionSampleCoord = getVertexPositionCoords(gl_VertexID);
  // vec3 position = texelFetch(u_vertexPositionsBuffer, positionSampleCoord, 0).xyz;
  // gl_Position = u_MVP * vec4(position, 1.0f);

  TressFXVertex tressfxVert = getExpandedTressFXVert(
    uint(gl_VertexID), u_cameraPosition, u_MVP
  );
  gl_Position = tressfxVert.position;
}
