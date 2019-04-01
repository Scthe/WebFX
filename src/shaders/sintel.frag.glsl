#version 300 es
precision highp float;
precision highp int;

// uniform vec2 u_viewport;
// uniform vec3 u_cameraPosition;

/** rgb - baseColor, a - packedRoughnessMetallic */
// uniform vec4 u_material;


in vec3 v_Position;
in vec3 v_Normal;

layout(location = 0) out vec4 outColor1;


const vec3 LIGHT_POS = vec3(30.0, 30.0, 30.0);
const float LIGHT_FALLOFF = 1.5;
const vec3 AMBIENT = vec3(0.5);
const float GAMMA = 2.2;

vec3 tonemapReinhard (vec3 color) {
  return color / (color + vec3(1.0));
}

vec3 gammaFix (vec3 color, float gamma) {
  return pow(color, vec3(1.0/gamma));
}

void main() {
  // outColor1 = vec4(0.5, 0.5, 0.5, 1);

  float dd = dot(normalize(v_Normal), normalize(LIGHT_POS));
  float phong = max(0.0, dd);
  vec3 direct_light = vec3(phong) * LIGHT_FALLOFF;
  vec3 color = AMBIENT + direct_light;

  color = tonemapReinhard(color);
  outColor1 = vec4(gammaFix(color, GAMMA), 1.0);
}
