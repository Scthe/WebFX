#version 300 es
precision highp float;
precision highp int;
precision highp usampler2D;

uniform float u_gamma;
uniform vec2 u_viewport;
uniform vec2 u_nearAndFar;
uniform int u_displayMode;
uniform sampler2D u_tonemappedTex;
uniform sampler2D u_linearDepthTex;
uniform sampler2D u_normalsTex;
uniform sampler2D u_ssaoTex;
// FXAA
uniform float u_subpixel;
uniform float u_edgeThreshold;
uniform float u_edgeThresholdMin;


in vec2 v_position;

layout(location = 0) out vec4 color1;


@import ./_utils;
@import ./_fxaa;


const int DISPLAY_MODE_FINAL = 0;
const int DISPLAY_MODE_LINEAR_DEPTH = 1;
const int DISPLAY_MODE_NORMALS = 2;
const int DISPLAY_MODE_SSAO = 3;


vec3 doFxaa (vec2 uv) {
  vec4 color;

  if (u_edgeThreshold == 0.0) {
    color = texture(u_tonemappedTex, uv);
  } else {
    color = FxaaPixelShader(
      uv, // in [0-1]
      u_tonemappedTex,
      u_tonemappedTex,
      vec2(1.0) / u_viewport,
      u_subpixel,
      u_edgeThreshold,
      u_edgeThresholdMin
    );
  }

  return color.rgb;
}




void main() {
  vec2 uv = to_0_1(v_position);
  vec3 result;

  switch(u_displayMode) {
    case DISPLAY_MODE_LINEAR_DEPTH: {
      float depth = texture(u_linearDepthTex, uv).r;
      float d = u_nearAndFar.y - u_nearAndFar.x;
      result = vec3(depth / d);
      break;
    }

    case DISPLAY_MODE_NORMALS: {
      vec3 normal = texture(u_normalsTex, uv).xyz;
      result = abs(to_neg1_1(normal));
      break;
    }

    case DISPLAY_MODE_SSAO: {
      float ssao = texture(u_ssaoTex, uv).r;
      result = vec3(ssao);
      break;
    }

    default:
    case DISPLAY_MODE_FINAL: {
      vec3 tex = doFxaa(uv);
      result = doGamma(tex, u_gamma);
      break;
    }
  }

  color1 = vec4(result, 1.0f);
}
