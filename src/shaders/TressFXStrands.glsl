#define TRESSFX_FLOAT_EPSILON 1e-7


ivec2 getVertexPositionCoords(uint offset) {
  uvec2 texSize = uvec2(textureSize(u_vertexPositionsBuffer, 0));
  return ivec2(offset % texSize.x, offset / texSize.x);
}

// vec4  GetPosition (uint index) { return g_GuideHairVertexPositions_[index]; }
// vec4  GetTangent  (uint index) { return g_GuideHairVertexTangents_[index]; }
// float GetThickness(uint index) { return g_HairThicknessCoeffs_[index]; }

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
  // vec4 tangent;
  // vec4 p0p1;
  // vec4 strandColor;
};


TressFXVertex getExpandedTressFXVert(uint vertexId, vec3 eye, mat4 viewProj) {
  // Access the current line segment
  // (We will move vertices left or right by hair thickness, while odd vertices are moved left, even are moved right.
  // And by 'left' and 'right' we mean according to normal&tangent.
  // And by normal we mean hair_pos - camera_pos)
  uint index = vertexId / 2u;  // vertexId is actually the indexed vertex id when indexed triangles are used

  // Get updated positions and tangents from simulation result
  ivec2 positionSampleCoord = getVertexPositionCoords(index);
  vec3 v = texelFetch(u_vertexPositionsBuffer, positionSampleCoord, 0).xyz;
  // vec3 t = GetTangent(index).xyz;
  vec3 t = vec3(0.0, 1.0, 0.0); // TODO

  // Get hair strand thickness
  float vertex_position = getVertexInStrandPercentage(index);
  float ratio = 1.0; // float ratio = mix(g_Ratio, 1.0, g_bThinTip > 0 ? vertex_position : 1.0);

  // Calculate right and projected right vectors
  vec3 towardsCamera = safeNormalize(v - eye);
  vec3 right = safeNormalize(cross(t, towardsCamera)); // TODO verify is ok

  // Calculate the negative and positive offset screenspace positions
  vec4 hairEdgePositions[2]; // 0 is for odd vertexId, 1 is positive even vertexId
  vec3 thicknessVector = right * ratio * u_fiberRadius;
  hairEdgePositions[0] = vec4(v - thicknessVector, 1.0); // position 'left'
  hairEdgePositions[1] = vec4(v + thicknessVector, 1.0); // position 'right'
  hairEdgePositions[0] = viewProj * hairEdgePositions[0];
  hairEdgePositions[1] = viewProj * hairEdgePositions[1];

  // Write output data
  TressFXVertex result;
	bool isOdd = (vertexId & 0x01u) > 0u;
  result.position = (isOdd ? hairEdgePositions[0] : hairEdgePositions[1]);
  {
    vec2 proj_right = (viewProj * vec4(right, 0)).xy;
    proj_right = safeNormalize(proj_right);

    float fDirIndex = isOdd ? -1.0 : 1.0;
    vec4 tmp = vec4(proj_right * EXPAND_PIXELS_FACTOR / u_viewportSize.y, 0.0f, 0.0f);
    float w = isOdd ? hairEdgePositions[0].w : hairEdgePositions[1].w;
    result.position += fDirIndex * tmp * w;
  }
  // result.tangent = vec4(t, ratio); // pack tangent + ThinTipRatio
  // result.p0p1 = vec4(
    // hairEdgePositions[0].xy / max(hairEdgePositions[0].w, TRESSFX_FLOAT_EPSILON),
    // hairEdgePositions[1].xy / max(hairEdgePositions[1].w, TRESSFX_FLOAT_EPSILON)
  // );
  // result.strandColor = GetStrandColor(index, vertex_position);
  // result.PosCheck = MatrixMult(g_mView, vec4(v,1));

  return result;
}

// END TressFXStrands.glsl
