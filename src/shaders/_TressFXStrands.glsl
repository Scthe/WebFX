// https://github.com/Scthe/TressFX-OpenGL/blob/master/src/shaders/gl-tfx/lib/TressFXStrands.glsl

#define TRESSFX_FLOAT_EPSILON 1e-7


///////// uniforms

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


///////// END: uniforms


ivec2 getVertexPositionCoords(uint offset) {
  uvec2 texSize = uvec2(textureSize(u_vertexPositionsBuffer, 0));
  return ivec2(offset % texSize.x, offset / texSize.x);
}

vec2 safeNormalize(vec2 vec) {
  float len = length(vec);
  return len >= TRESSFX_FLOAT_EPSILON ? normalize(vec) : vec2(0, 0);
}

vec3 safeNormalize(vec3 vec) {
  float len = length(vec);
  return len >= TRESSFX_FLOAT_EPSILON ? normalize(vec) : vec3(0, 0, 0);
}

/** Returns 1.0 for root vertex, 0.0 for last vertex in strand and values betweeen for others */
float getVertexInStrandPercentage (uint index) {
  uint vertexId = index % uint(u_numVerticesPerStrand); // [0-32]
  return 1.0 - (float(vertexId) / float(u_numVerticesPerStrand)); // [0-1]
}


struct TressFXVertex {
  vec4 position;
  vec4 tangent;
  vec3 normal;
  vec4 positionWorldSpace;
  float vertexRootToTipFactor; // 1 := root, 0: = tip
  // vec4 p0p1;
  // vec4 strandColor;
};

struct TressFXParams {
  uint vertexId;
  uint instanceId;
  uint strandId;

  vec3 eye;
  mat4 modelMat;
  mat4 viewProjMat;
  vec2 viewportSize;

  float thinTip;
  float fiberRadius;
  float followHairSpreadRoot;
  float followHairSpreadTip;
};

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


vec3 randomizeStrandPos(uint instanceId, uint strandId, uint rngFac) {
  vec3 seed = vec3(
    float(instanceId),
    float(strandId),
    float(rngFac)
  );
  vec3 v = hash(seed);
  return to_neg1_1(normalize(v));
}

vec3 getFollowHairDisplacement (
  TressFXParams params, float vertex_position, vec3 tangent
) {
  if (params.instanceId == 0u) {
    // not required, but why not? It should stick in the middle of follow-hair group
    return vec3(0.0);
  }

  vec3 rootOffset = randomizeStrandPos(params.instanceId, params.strandId, 0u);
  vec3 tipOffset = randomizeStrandPos(params.instanceId, params.strandId, 1u);
  rootOffset *= params.followHairSpreadRoot;
  tipOffset *= params.followHairSpreadTip;
  return mix(tipOffset, rootOffset, vertex_position);

  /*
  // TODO make this around normal, so the hair does stay near skull
  vec3 offset = mix(tipOffset, rootOffset, vertex_position);
  vec3 normal   = normalize(offset - tangent * dot(offset, tangent));
  vec3 bitangent = cross(normal, tangent);

  float offsetMod = mix(params.followHairSpreadTip, params.followHairSpreadRoot, vertex_position);
  return bitangent * offsetMod;
  // return bitangent * params.followHairSpreadRoot;
  // return rootOffset * params.followHairSpreadRoot;
  */
}


TressFXVertex getExpandedTressFXVert(TressFXParams params) {
  // Access the current line segment
  // We will move vertices left or right by hair thickness:
  //   - odd vertices are moved left,
  //   - even are moved right.
  // And by 'left' and 'right' we mean according to normal&tangent.
  // And by normal we mean (hair_pos - camera_pos)
  uint index = params.vertexId / 2u;  // vertexId is actually the indexed vertex id when indexed triangles are used

  // Get updated positions and tangents from simulation result
  ivec2 vertexSamplePos = getVertexPositionCoords(index);
  vec3 v = texelFetch(u_vertexPositionsBuffer, vertexSamplePos, 0).xyz;
  vec3 t = texelFetch(u_vertexTangentsBuffer, vertexSamplePos, 0).xyz;
  v = (params.modelMat * vec4(v, 1.0)).xyz; // transform to world space
  t = normalize(t); // not needed for cross, but useful for debugging

  // Get hair strand thickness
  float vertex_position = getVertexInStrandPercentage(index); // 1 := root, 0 := tip
  float ratio = mix(params.thinTip, 1.0, vertex_position);

  v += getFollowHairDisplacement(params, vertex_position, t);

  // Calculate right and projected right vectors
  vec3 towardsCamera = safeNormalize(v - params.eye);
  vec3 right = safeNormalize(cross(t, towardsCamera));

  // debug
  // v = v + t * (params.thinTip * 0.1);
  // v = v + towardsCamera * (params.thinTip * 0.1);
  // v = v + right * (params.thinTip * 0.1);

  // Calculate the negative and positive offset screenspace positions
  vec4 hairEdgePositions[2]; // 0 is for odd vertexId, 1 is positive even vertexId
  vec3 thicknessVector = right * ratio * params.fiberRadius;
  hairEdgePositions[0] = vec4(v - thicknessVector, 1.0); // position 'left'
  hairEdgePositions[1] = vec4(v + thicknessVector, 1.0); // position 'right'

  // Write output data
  TressFXVertex result;
	bool isOdd = (params.vertexId & 0x01u) > 0u;
  result.positionWorldSpace = (isOdd ? hairEdgePositions[0] : hairEdgePositions[1]); // may not be 100% accurate with fixes below
  result.position = params.viewProjMat * result.positionWorldSpace;
  result.tangent = vec4(t, ratio); // pack tangent + ThinTipRatio
  result.vertexRootToTipFactor = vertex_position;
  result.normal = towardsCamera; // ?! might as well

  // some additional fixing
  {
    vec2 proj_right = (params.viewProjMat * vec4(right, 0)).xy;
    proj_right = safeNormalize(proj_right);

    float fDirIndex = isOdd ? -1.0 : 1.0;
    vec4 tmp = vec4(proj_right * EXPAND_PIXELS_FACTOR / params.viewportSize.y, 0.0f, 0.0f);
    float w = isOdd ? hairEdgePositions[0].w : hairEdgePositions[1].w;
    result.position += fDirIndex * tmp * w;
  }

  return result;
}

// END TressFXStrands.glsl
