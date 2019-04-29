struct Material {
  vec3 positionWS;
  vec3 normal;
  vec3 toEye;
  float fresnel;
  vec3 albedo;
  float roughness;
  float specularMul; // needed for eyes. Normally You create separate mesh etc, but I'm too lazy
  float shadow; // 0.0 - in shadow, 1.0 - in light
  float hairShadow; // 0.0 - in shadow, 1.0 - in light. This is special Sintel texture!!!
  float isMetallic;
};

struct Light {
  vec3 position;
  vec3 color;
  float intensity;
};

Light unpackLight(vec3 pos, vec4 color) {
  Light light;
  light.position = pos;
  light.color = color.rgb;
  light.intensity = color.a;
  return light;
}
