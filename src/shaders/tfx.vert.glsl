#version 300 es
precision highp float;
precision highp int;

uniform mat4 u_mMat;
uniform mat4 u_vpMat;
uniform vec3 u_cameraPosition;
uniform int u_numVerticesPerStrand;
uniform vec2 u_viewportSize;
uniform float u_fiberRadius;
uniform sampler2D u_vertexPositionsBuffer;
uniform sampler2D u_vertexTangentsBuffer;
uniform float u_thinTip;

const float EXPAND_PIXELS_FACTOR = 0.71;

layout(location=0) in vec3 in_Position;


@import ./_TressFXStrands;


void main() {
  TressFXVertex tressfxVert = getExpandedTressFXVert(
    uint(gl_VertexID), u_cameraPosition, u_mMat, u_vpMat
  );
  gl_Position = tressfxVert.position;
}
