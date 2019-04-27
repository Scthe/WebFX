#version 300 es
precision highp float;
precision highp int;
precision highp usampler2D;
// precision highp sampler2D;

uniform vec3 u_cameraPosition;
// material
uniform usampler2D u_albedoTexture;
uniform float u_sssTransluency;
uniform float u_sssWidth;
uniform float u_sssBias;
uniform float u_sssGain;
uniform float u_sssStrength;
uniform sampler2D u_sssDepthTex;
uniform vec3 u_sssPosition;
// Shadow
uniform sampler2D u_directionalShadowDepthTex;
uniform vec4 u_directionalShadowCasterPosition; // [position.xyz, bias (negative if pcss)]
uniform int u_directionalShadowSampleRadius;
uniform float u_maxShadowContribution;
#define BIAS_FROM_UI (u_directionalShadowCasterPosition.w)
#define USE_PCSS_SHADOWS (u_directionalShadowCasterPosition.w < 0.0f)
// sss
uniform float u_sssFarPlane;
uniform mat4 u_sssMatrix_VP;
// Lights
uniform vec4 u_lightAmbient;
uniform vec3 u_light0_Position;
uniform vec4 u_light0_Color;
uniform vec3 u_light1_Position;
uniform vec4 u_light1_Color;
uniform vec3 u_light2_Position;
uniform vec4 u_light2_Color;


in vec3 v_Position;
in vec3 v_Normal;
in vec2 v_UV;
in vec4 v_PositionLightShadowSpace;


layout(location = 0) out vec4 outColor1;


// required by SSSSS import, but not used here (used in SSS blur)
float SSSSS_sampleDepthLinear (sampler2D depthTex, vec2 texcoord) {
  return 0.0;
}



@import ./_utils;
@import ./_material;
// @i mport ./_skin;
// @i mport ./_pbr;
@import ./_shadows;
#define SSSS_GLSL_3 1
@import ./_separableSSSSS;


Material createMaterial() {
  // as uint [0-255]
  uvec3 albedoU = texture(u_albedoTexture, fixOpenGLTextureCoords_AxisY(v_UV)).rgb;

  Material material;
  material.normal = v_Normal;
  material.toEye = normalize(u_cameraPosition - v_Position);
  material.fresnel = dotMax0(material.normal, material.toEye);
  material.albedo = vec3(albedoU) / 255.0;
  material.albedo = sRGBtoLinear(material.albedo, 2.4);
  material.positionWS = v_Position;

  vec3 toCaster = normalize(u_directionalShadowCasterPosition.xyz - v_Position);
  material.shadow = 1.0 - calculateDirectionalShadow(
    v_PositionLightShadowSpace, material.normal, toCaster
  );

  return material;
}

/*
SkinParams createSkinParams() {
  SkinParams skinParams;
  skinParams.fresnelExponent = u_fresnelExponent;
  skinParams.fresnelMultiplier = u_fresnelMultiplier;
  skinParams.fresnelColor = u_fresnelColor;
  skinParams.ssColor1 = u_ssColor1;
  skinParams.ssColor2 = u_ssColor2;
  return skinParams;
}
*/


vec3 doShading(Material material, Light lights[3]) {
  vec3 ambient = u_lightAmbient.rgb * u_lightAmbient.a;
  vec3 radianceSum = vec3(0.0);

  for (uint i = 0u; i < 3u; i++) {
    Light light = lights[i];

    // ambient += pbr(material, light) * (1.0f - material.shadow);

    vec3 L = normalize(light.position - material.positionWS); // wi in integral
    float NdotL = dotMax0(material.normal, L);
    vec3 radiance = light.color * light.intensity; // incoming color from light

    vec3 contrib = material.albedo * radiance * NdotL;
    radianceSum += contrib;
  }

  // add SSSSS forward scattering - transluency
  vec3 sssL = normalize(u_sssPosition - material.positionWS);
  vec3 contribSSS = SSSSTransmittance(
    u_sssTransluency, // float translucency,
    u_sssWidth, // float sssWidth,
    material.positionWS, // float3 worldPosition,
    material.normal, // float3 worldNormal,
    sssL, // float3 light,
    u_sssDepthTex, // SSSSTexture2D shadowMap,
    u_sssMatrix_VP, // float4x4 lightViewProjection,
    u_sssFarPlane, // float lightFarPlane
    u_sssBias, u_sssGain
  );
  contribSSS = contribSSS * radianceSum * u_sssStrength;

  radianceSum = radianceSum * clamp(material.shadow, 1.0 - u_maxShadowContribution, 1.0);
  return ambient + radianceSum + contribSSS;
  // return contribSSS;
}


void main() {
  Light lights[3];
  lights[0] = unpackLight(u_light0_Position, u_light0_Color);
  lights[1] = unpackLight(u_light1_Position, u_light1_Color);
  lights[2] = unpackLight(u_light2_Position, u_light2_Color);

  vec3 color;
  Material material = createMaterial();
  // SkinParams skinParams = createSkinParams();
  // material.skin = skinShader(material, skinParams);
  color = doShading(material, lights);

  outColor1 = vec4(color, 1.0);
}
