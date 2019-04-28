// http://developer.amd.com/wordpress/media/2012/10/Scheuermann_HairRendering.pdf
// http://www.cemyuksel.com/courses/conferences/siggraph2010-hair/S2010_HairCourseNotes-Chapter4.pdf

struct KajiyaKayParams {
  vec3 V; // viewDir
  vec3 T; // tangentDir
  vec3 N; // normalDir
  vec3 L; // lightDirection

  float shift; // specMap, [0..1], probably should be random
  float primaryShift;
  float secondaryShift;
  float specularPower1;
  float specularPower2;
};

vec3 shiftTangent(vec3 t, vec3 n, float shift) {
  // vec3 shiftedT = (u_primaryShift OR u_secondaryShift + shift) * params.N
  vec3 shiftedT = t + shift * n;
  return normalize(shiftedT);
}

float strandSpecular(vec3 H, vec3 T, float specularPower) {
  float dotTH = dot(T, H);
  float sinTH = sqrt(1.0 - dotTH * dotTH); // from `sin^2 + cos^2 = 1`
  float dirAtten = smoothstep(-1.0, 0.0, dotTH);
  return dirAtten * pow(sinTH, specularPower);
  // dbg:
  // return dirAtten;
  // return dotTH;
  // return abs(T.x);
  // return abs(T.y);
  // return abs(T.z);
  // return length(T) / 5.0;
  // return pow(length(T) / 5.0, 2.0);
}

vec2 kajiyakay(KajiyaKayParams params) {
  // using the binormal instead of Tangent since that goes root to tip
  vec3 binormalDir = normalize(cross(params.T, params.N));

  // shift the tangent via spec map
  // TODO use tangent or binormalDir?
  // vec3 tangent1 = shiftTangent(binormalDir, params.N, params.primaryShift + params.shift);
  // vec3 tangent2 = shiftTangent(binormalDir, params.N, params.secondaryShift + params.shift);
  vec3 tangent1 = shiftTangent(params.T, params.N, params.shift + params.primaryShift);
  vec3 tangent2 = shiftTangent(params.T, params.N, params.shift + params.secondaryShift);
  // vec3 tangent1 = params.T;
  // vec3 tangent2 = params.T;

  // 2 shifted specular terms, retuned as x,y components
  vec3 H = normalize(params.V + params.L);
  vec2 spec = vec2(0.0, 0.0);
  spec.x = strandSpecular(H, tangent1, params.specularPower1);
  spec.y = strandSpecular(H, tangent2, params.specularPower2);

  return saturate(spec);
}
