#version 300 es
precision highp float;
precision highp int;
precision highp usampler2D;
// precision highp sampler2D;

// uniform vec2 u_viewport;
// uniform vec3 u_cameraPosition;
uniform usampler2D u_albedoTexture;
// uniform sampler2D u_albedoTexture;

/** rgb - baseColor, a - packedRoughnessMetallic */
// uniform vec4 u_material;


in vec3 v_Position;
in vec3 v_Normal;
in vec2 v_UV;


layout(location = 0) out vec4 outColor1;


const vec3 LIGHT_POS = vec3(30.0, 30.0, 30.0);
const float LIGHT_FALLOFF = 1.5;
const vec3 AMBIENT = vec3(0.5);
const float GAMMA = 2.2;

vec2 fixOpenGLTextureCoords_AxisY(vec2 uv) {
  return vec2(uv.x, 1.0 - uv.y);
}

vec3 tonemapReinhard (vec3 color) {
  return color / (color + vec3(1.0));
}

vec3 gammaFix (vec3 color, float gamma) {
  return pow(color, vec3(1.0/gamma));
}

void main() {
  uvec3 albedoU = texture(u_albedoTexture, fixOpenGLTextureCoords_AxisY(v_UV)).rgb;
  vec3 albedo = vec3(albedoU) / 255.0;

  vec3 color;
  // float dd = dot(normalize(v_Normal), normalize(LIGHT_POS));
  // float phong = max(0.0, dd);
  // vec3 direct_light = vec3(phong) * LIGHT_FALLOFF;
  // color = AMBIENT + direct_light;

  color = albedo;

  // color = tonemapReinhard(color);
  // outColor1 = vec4(gammaFix(color, GAMMA), 1.0);
  outColor1 = vec4(color, 1.0);
}
