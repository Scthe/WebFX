// based on https://80.lv/articles/secrets-of-human-shaders-in-ue4/

struct SkinParams {
  float fresnelExponent;
  float fresnelMultiplier;
  vec3 fresnelColor;
  vec3 ssColor1;
  vec3 ssColor2;
};

// I'm just guessing here
float ue4_fresnel (Material mat, SkinParams params) {
  return pow(1.0 - mat.fresnel, params.fresnelExponent);
}

float skinFresnelMask (Material mat, SkinParams params) {
  float f = ue4_fresnel(mat, params);
  return clamp(f * params.fresnelMultiplier, 0.0, 1.0);
}

vec3 skinDiffuseOutput (Material mat, SkinParams params) {
  vec3 skinFresnelCol = params.fresnelColor * mat.albedo;
  float a = skinFresnelMask(mat, params);
  return mix(mat.albedo, skinFresnelCol, a);
  // return vec3(a);
  // return skinFresnelCol;
}


vec3 subsurfaceColor (Material mat, SkinParams params) {
  vec3 c = mix(params.ssColor1, params.ssColor2, 1.0 - mat.fresnel);
  return mat.albedo * c;
}



vec3 skinShader (Material mat, SkinParams params) {
  vec3 diffuse = skinDiffuseOutput(mat, params);
  // vec3 subsurface = subsurfaceColor(mat, params);
  return diffuse;
}
