struct Material {
  vec3 positionWS;
  vec3 normal;
  vec3 toEye;
  // pbr
  vec3 albedo;
  float roughness;
  float specularMul; // needed for eyes. Normally You create separate mesh etc, but I'm too lazy
  float isMetallic;
  float ao;
  // shadow
  float shadow; // 0.0 - in shadow, 1.0 - in light
  float hairShadow; // 0.0 - in shadow, 1.0 - in light. This is special Sintel texture!!!
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


/// utils:

/* Some custom AO handling - specific to this demo */
float getCustom_AO(float ao, float aoStrength, float aoExp) {
  ao = 1.0 - pow(1.0 - ao, aoExp);
  return mix(ao, 1.0, 1.0 - aoStrength);
}
