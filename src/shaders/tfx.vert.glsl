#version 300 es
precision highp float;
precision highp int;

uniform mat4 u_mMat;
uniform mat4 u_vpMat;
uniform vec3 u_cameraPosition;
uniform vec2 u_viewportSize;
// data buffers
uniform sampler2D u_vertexPositionsBuffer;
uniform sampler2D u_vertexTangentsBuffer;
// tfx params
uniform int u_numVerticesPerStrand;
uniform float u_thinTip;
uniform float u_fiberRadius;
uniform uint u_followHairs;
uniform float u_followHairSpreadRoot;
uniform float u_followHairSpreadTip;

const float EXPAND_PIXELS_FACTOR = 0.71;

layout(location=0) in vec3 in_Position;

flat out int v_hairInstanceId;
out float v_vertexRootToTipFactor;


@import ./_utils;
@import ./_TressFXStrands;

TressFXParams createTfxParams() {
  TressFXParams params;
  params.vertexId = uint(gl_VertexID);
  params.instanceId = uint(gl_InstanceID);
  params.strandId = uint(gl_VertexID / 2 / u_numVerticesPerStrand);

  params.eye = u_cameraPosition;
  params.modelMat = u_mMat;
  params.viewProjMat = u_vpMat;
  params.viewportSize = u_viewportSize;

  params.thinTip = u_thinTip;
  params.fiberRadius = u_fiberRadius;
  params.followHairSpreadRoot = u_followHairSpreadRoot;
  params.followHairSpreadTip = u_followHairSpreadTip;

  return params;
}

void main() {
  TressFXParams tfxParams = createTfxParams();
  TressFXVertex tressfxVert = getExpandedTressFXVert(tfxParams);

  gl_Position = tressfxVert.position;

  v_hairInstanceId = gl_InstanceID;
  v_vertexRootToTipFactor = tressfxVert.vertexRootToTipFactor;
}
