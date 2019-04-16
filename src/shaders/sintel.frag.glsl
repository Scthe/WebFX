#version 300 es
precision highp float;
precision highp int;
precision highp usampler2D;
// precision highp sampler2D;

// uniform vec2 u_viewport;
uniform vec3 u_cameraPosition;
uniform usampler2D u_albedoTexture;
uniform float u_gamma;
uniform float u_fresnelExponent;
uniform float u_fresnelMultiplier;
uniform vec3 u_fresnelColor;
uniform vec3 u_ssColor1;
uniform vec3 u_ssColor2;
// Shadow
uniform sampler2D u_directionalShadowDepthTex;
uniform vec4 u_directionalShadowCasterPosition; // [position.xyz, bias (negative if pcss)]
uniform int u_directionalShadowSampleRadius;
uniform float u_maxShadowContribution;
#define BIAS_FROM_UI (u_directionalShadowCasterPosition.w)
#define USE_PCSS_SHADOWS (u_directionalShadowCasterPosition.w < 0.0f)
// Lights
uniform vec4 u_lightAmbient;
uniform vec3 u_light0_Position;
uniform vec4 u_light0_Color;
uniform vec3 u_light1_Position;
uniform vec4 u_light1_Color;
uniform vec3 u_light2_Position;
uniform vec4 u_light2_Color;

/** rgb - baseColor, a - packedRoughnessMetallic */
// uniform vec4 u_material;


in vec3 v_Position;
in vec3 v_Normal;
in vec2 v_UV;
in vec4 v_PositionLightShadowSpace;


layout(location = 0) out vec4 outColor1;


@import ./_utils;
@import ./_material;
@import ./_skin;
// @i mport ./_pbr;
@import ./_shadows;


Material createMaterial() {
  // as uint [0-255]
  uvec3 albedoU = texture(u_albedoTexture, fixOpenGLTextureCoords_AxisY(v_UV)).rgb;

  Material material;
  material.normal = v_Normal;
  material.toEye = normalize(u_cameraPosition - v_Position);
  material.fresnel = dotMax0(material.normal, material.toEye);
  material.albedo = vec3(albedoU) / 255.0;
  material.positionWS = v_Position;

  vec3 toCaster = normalize(u_directionalShadowCasterPosition.xyz - v_Position);
  material.shadow = 1.0 - calculateDirectionalShadow(
    v_PositionLightShadowSpace, material.normal, toCaster
  );

  return material;
}

SkinParams createSkinParams() {
  SkinParams skinParams;
  skinParams.fresnelExponent = u_fresnelExponent;
  skinParams.fresnelMultiplier = u_fresnelMultiplier;
  skinParams.fresnelColor = u_fresnelColor;
  skinParams.ssColor1 = u_ssColor1;
  skinParams.ssColor2 = u_ssColor2;
  return skinParams;
}


vec3 doShading(Material material, Light lights[3]) {
  vec3 result = u_lightAmbient.rgb * u_lightAmbient.a;

  for (uint i = 0u; i < 3u; i++) {
    Light light = lights[i];

    // result += pbr(material, light) * (1.0f - material.shadow);

    vec3 L = normalize(light.position - material.positionWS); // wi in integral
    float NdotL = dotMax0(material.normal, L);
    vec3 radiance = light.color * light.intensity; // incoming color from light

    vec3 contrib = material.albedo * radiance * NdotL;
    contrib *= clamp(material.shadow, 1.0 - u_maxShadowContribution, 1.0);
    result += contrib;
  }

  return result;
}


void main() {
  Light lights[3];
  lights[0] = unpackLight(u_light0_Position, u_light0_Color);
  lights[1] = unpackLight(u_light1_Position, u_light1_Color);
  lights[2] = unpackLight(u_light2_Position, u_light2_Color);

  vec3 color;
  Material material = createMaterial();
  SkinParams skinParams = createSkinParams();
  material.skin = skinShader(material, skinParams);
  color = doShading(material, lights);

  // color = tonemapReinhard(color);
  // outColor1 = vec4(gammaFix(color, u_gamma), 1.0);
  outColor1 = vec4(color, 1.0);
}
