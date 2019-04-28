#version 300 es
precision highp float;
precision highp int;


uniform mat4 u_directionalShadowMatrix_VP;

layout(location=0) in vec3 in_Position;

flat out int v_hairInstanceId;
out float v_vertexRootToTipFactor;
out vec3 v_position;
out vec3 v_normal;
out vec3 v_tangent;
out vec4 v_positionLightShadowSpace;


@import ./_utils;
@import ./_TressFXStrands;



void main() {
  TressFXParams tfxParams = createTfxParams();
  TressFXVertex tressfxVert = getExpandedTressFXVert(tfxParams);

  gl_Position = tressfxVert.position;

  v_hairInstanceId = gl_InstanceID;
  v_vertexRootToTipFactor = tressfxVert.vertexRootToTipFactor;
  v_positionLightShadowSpace = u_directionalShadowMatrix_VP * tressfxVert.positionWorldSpace;
  v_position = tressfxVert.positionWorldSpace.xyz;
  v_normal = tressfxVert.normal;
  v_tangent = tressfxVert.tangent;
}
