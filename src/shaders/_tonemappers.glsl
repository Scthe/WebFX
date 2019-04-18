
vec3 tonemapLinear(vec3 hdrColor) {
  return u_exposure * hdrColor;
}

vec3 tonemapReinhard(vec3 hdrColor) {
  hdrColor *= u_exposure;
  return hdrColor / (hdrColor + vec3(1.0));
}

float A = 0.15;
float B = 0.50;
float C = 0.10;
float D = 0.20;
float E = 0.02;
float F = 0.30;
float W = 11.2;
vec3 Uncharted2Tonemap(vec3 x) {
  return max(
    ((x * (A * x + C * B) + D * E) / (x * (A * x + B) + D * F)) - E / F,
    vec3(0.0)
  );
}

vec3 tonemapUncharted2(vec3 hdrColor) {
	hdrColor *= u_exposure;
  vec3 denom = Uncharted2Tonemap(vec3(u_whitePoint));
	return Uncharted2Tonemap(hdrColor) / denom;
}

vec3 tonemapPhotographic(vec3 hdrColor) {
  float Lm = 0.5 * (max3(hdrColor) + min3(hdrColor));
  float mod1 = Lm / (1.0 + Lm);
  float mod2 = 1.0 + Lm / (u_whitePoint * u_whitePoint);
  return hdrColor / Lm * mod1 * mod2;
}

vec3 tonemapACES(vec3 hdrColor) {
  // https://www.desmos.com/calculator/h8rbdpawxj
  // https://knarkowicz.wordpress.com/2016/01/06/aces-filmic-tone-mapping-curve/
  // https://www.youtube.com/watch?v=A-wectYNfRQ
  // https://github.com/EpicGames/UnrealEngine/blob/release/Engine/Shaders/Private/ACES.ush , tho not that useful
  float a = 2.51f;
  float b = 0.03f;
  float c = 2.43f;
  float d = 0.59f;
  float e = 0.14f;
  vec3 x = hdrColor * u_acesC;

  vec3 nom = x * (a * x + b);
  vec3 denom = x * (c * x + d) + e;
  vec3 aces = nom / denom;

  return aces * u_acesS;
}
