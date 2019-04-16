struct Material {
  vec3 positionWS;
  vec3 normal;
  vec3 toEye;
  float fresnel;
  vec3 albedo;
  vec3 skin; // tmp result
  float shadow; // 0.0 - in shadow, 1.0 - in light
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
