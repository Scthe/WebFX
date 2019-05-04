#version 300 es
precision highp float;
precision highp int;
precision highp usampler2D;


uniform sampler2D u_sourceTex;
uniform sampler2D u_linearDepthTex;
uniform float u_blurRadius;
uniform float u_depthMaxDist;
uniform vec2 u_direction;
// The sigma value for the gaussian function: higher value means more blur
// A good value for 9x9 is around 3 to 5
// A good value for 7x7 is around 2.5 to 4
// A good value for 5x5 is around 2 to 3.5
uniform float u_gaussSigma;


in vec2 v_position; // TexCoords

layout(location = 0) out vec4 outColor;


@import ./_utils;


/** @param offset - offset in pixels from center */
vec2 getSamplePointCoord (vec2 offset) {
  vec2 sourceSize = vec2(textureSize(u_sourceTex, 0));
  return (gl_FragCoord.xy + offset) / sourceSize;
}

/*
vec4 linearBlur() {
  float m = 1.0f / u_blurRadius;

  vec2 middleCoord = getSamplePointCoord(vec2(0.0, 0.0));
  vec4 sum = texture(u_sourceTex, middleCoord);
  float weightSum = 0.0;

  for (float i = 1.0; i <= u_blurRadius; i++) { // from 1 as 0 would be center pixel
    float weight =  1.0 - i * m; // linear
    vec2 sideNegCoord = getSamplePointCoord(-i * u_direction);
    vec2 sidePosCoord = getSamplePointCoord( i * u_direction);
    sum += texture(u_sourceTex, sideNegCoord) * weight;
    sum += texture(u_sourceTex, sidePosCoord) * weight;
    weightSum += 2.0 * weight;
  }

  return sum / weightSum;
}
*/


vec4 sampleWithDepthCompare (vec2 coord, float middleDepth, vec4 middleValue) {
  float sampleDepth = texture(u_linearDepthTex, coord).r;
  float dist = abs(sampleDepth - middleDepth);
  if (dist < u_depthMaxDist) {
    return texture(u_sourceTex, coord);
  } else {
    return middleValue;
  }
}

/** http://callumhay.blogspot.com/2010/09/gaussian-blur-shader-glsl.html
 *  https://github.com/genekogan/Processing-Shader-Examples/blob/master/TextureShaders/data/blur.glsl
 */
vec4 gaussianBlur() {
  vec3 incrementalGaussian;
  incrementalGaussian.x = 1.0 / (sqrt(2.0 * PI) * u_gaussSigma);
  incrementalGaussian.y = exp(-0.5 / (u_gaussSigma * u_gaussSigma));
  incrementalGaussian.z = incrementalGaussian.y * incrementalGaussian.y;

  vec4 sum = vec4(0.0, 0.0, 0.0, 0.0);
  float coefficientSum = 0.0;

  vec2 middleCoord = getSamplePointCoord(vec2(0.0, 0.0));
  float middleDepth = texture(u_linearDepthTex, middleCoord).r; // [near...far]
  vec4 middleValue = texture(u_sourceTex, middleCoord);
  sum += middleValue * incrementalGaussian.x;
  coefficientSum += incrementalGaussian.x;
  incrementalGaussian.xy *= incrementalGaussian.yz;

  for (float i = 1.0; i <= u_blurRadius; i++) { // from 1 as 0 would be center pixel
    vec2 sideNegCoord = getSamplePointCoord(-i * u_direction);
    vec2 sidePosCoord = getSamplePointCoord( i * u_direction);
    sum += sampleWithDepthCompare(sideNegCoord, middleDepth, middleValue) * incrementalGaussian.x;
    sum += sampleWithDepthCompare(sidePosCoord, middleDepth, middleValue) * incrementalGaussian.x;
    coefficientSum += 2.0 * incrementalGaussian.x;
    incrementalGaussian.xy *= incrementalGaussian.yz;
  }

  return sum / coefficientSum;
}



void main() {
  // outColor = linearBlur();
  outColor = gaussianBlur();
}
