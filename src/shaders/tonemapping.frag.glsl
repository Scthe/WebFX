#version 300 es
precision highp float;
precision highp int;
precision highp usampler2D;

uniform sampler2D u_source;
uniform float u_gamma;
uniform float u_exposure;
uniform float u_whitePoint;
uniform float u_acesC;
uniform float u_acesS;
uniform int u_tonemappingMode;
uniform float u_ditherStrength;


in vec2 v_position; // TexCoords

layout(location = 0) out vec4 outColor;


@import ./_utils;
@import ./_dither;
@import ./_tonemappers;
@import ./_colorGrading;

const int TONEMAP_LINEAR = 0;
const int TONEMAP_REINHARD = 1;
const int TONEMAP_U2 = 2;
const int TONEMAP_PHOTOGRAPHIC = 3;
const int TONEMAP_ACES = 4;


vec3 doTonemapping(int tonemapMode, vec3 hdrColor) {
  switch (tonemapMode) {
    case TONEMAP_U2: return Uncharted2Tonemap(hdrColor);
    case TONEMAP_LINEAR: return tonemapLinear(hdrColor);
    case TONEMAP_PHOTOGRAPHIC: return tonemapPhotographic(hdrColor);
    case TONEMAP_REINHARD: return tonemapReinhard(hdrColor);
    default:
    case TONEMAP_ACES: return tonemapACES(hdrColor);
  }
}


void main() {
  vec2 pixelTS = to_0_1(v_position);
  vec3 colorHDR = texture(u_source, pixelTS).rgb;

  // do dithering to break up banding
  colorHDR = doDither(colorHDR, u_ditherStrength);

  // color grade raw HDR
  // In old days we used LUTs for this, but LUTs require conversion to LDR.
  // Since HDR displays are now available, we do color grading in HDR,
  // skipping LDR conversion. This, and also cause we can.
  vec3 colorAfterColorGrading = colorCorrectAll(colorHDR);

  outColor.rgb = saturate(
    doTonemapping(u_tonemappingMode, colorAfterColorGrading)
  );

  float luma = toLuma_fromLinear(outColor.rgb);
  // just SOME gamma, does not matter exact. We need to convert into SOME perceptual space
  outColor.a = doGamma(luma, u_gamma);
}
