#version 300 es
precision highp float;
precision highp int;
precision highp usampler2D;

uniform float u_gamma;
uniform vec2 u_viewport;
uniform sampler2D u_tonemapped;
// FXAA
uniform float u_subpixel;
uniform float u_edgeThreshold;
uniform float u_edgeThresholdMin;


in vec2 v_position;

layout(location = 0) out vec4 color1;


@import ./_utils;
@import ./_fxaa;


struct PixelInfo {
  vec2 posTextureSpace; // [0-1] x [0-1]
  uvec2 posPixelSpace; // [0-viewport.x] x [0-viewport.y]
};

PixelInfo createPixelInfo () {
  PixelInfo info;
  info.posTextureSpace = to_0_1(v_position);
  info.posPixelSpace = uvec2(info.posTextureSpace * u_viewport);
  return info;
}



vec3 doFxaa (PixelInfo pixelInfo) {
  vec4 color;

  if (u_edgeThreshold == 0.0) {
    color = texture(u_tonemapped, pixelInfo.posTextureSpace);
  } else {
    color = FxaaPixelShader(
      pixelInfo.posTextureSpace, // in [0-1]
      u_tonemapped,
      u_tonemapped,
      vec2(1.0) / u_viewport,
      u_subpixel,
      u_edgeThreshold,
      u_edgeThresholdMin
    );
  }

  return color.rgb;
}




void main() {
  color1 = vec4(1.0f, 0, 1.0f, 1.0f);
  PixelInfo pixelInfo = createPixelInfo();

  vec3 tex = doFxaa(pixelInfo);
  color1 = vec4(doGamma(tex, u_gamma), 1.0f);
}
