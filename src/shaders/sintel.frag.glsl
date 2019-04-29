#version 300 es
precision highp float;
precision highp int;
precision highp usampler2D;
// precision highp sampler2D;

uniform vec3 u_cameraPosition;
// material
uniform usampler2D u_albedoTexture;
uniform usampler2D u_specularTexture;
uniform usampler2D u_hairShadowTexture;
uniform float u_specular;
uniform float u_specularMul;
uniform int u_materialFlags;
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
@import ./_pbr;
@import ./_shadows;
#define SSSS_GLSL_3 1
@import ./_separableSSSSS;


const int FLAG_IS_METALIC = 1;
const int FLAG_USE_SPECULAR_TEXTURE = 2;
const int FLAG_USE_HAIR_SHADOW_TEXTURE = 4;


vec3 readModelTexture_RGB8UI(usampler2D tex, vec2 coords, bool reverseGamma) {
  coords = fixOpenGLTextureCoords_AxisY(coords);
  uvec3 texAsUint = texture(tex, coords).rgb; // as uint [0-255]
  vec3 texAsFloat = vec3(texAsUint) / 255.0;
  if (reverseGamma) {
    texAsFloat = sRGBtoLinear(texAsFloat, 2.4);
  }
  return texAsFloat;
}

float readSpecular() {
  // we are going to pretend that specular is same as smoothness. Probably is not, but..
  if (isFlag(u_materialFlags, FLAG_USE_SPECULAR_TEXTURE)) {
    return readModelTexture_RGB8UI(u_specularTexture, v_UV, false).r;
  } else {
    return u_specular;
  }
}

float readHairShadow() {
  if (isFlag(u_materialFlags, FLAG_USE_HAIR_SHADOW_TEXTURE)) {
    // special code for this demo
    // the texture is square, so we have toadjust UVs
    vec2 adjustedUV = vec2(v_UV.x * 2.0 - 1.0, v_UV.y);
    if (outOfScreen(adjustedUV)) {
      return NOT_IN_SHADOW;
    }
    float hairShadowVal = readModelTexture_RGB8UI(u_hairShadowTexture, adjustedUV, false).r;
    return hairShadowVal;
  } else {
    return NOT_IN_SHADOW;
  }
}


Material createMaterial() {
  Material material;
  material.normal = v_Normal;
  material.toEye = normalize(u_cameraPosition - v_Position);
  material.fresnel = dotMax0(material.normal, material.toEye);
  material.albedo = readModelTexture_RGB8UI(u_albedoTexture, v_UV, true);
  material.positionWS = v_Position;
  material.isMetallic = isFlag(u_materialFlags, FLAG_IS_METALIC) ? 1.0 : 0.0;
  material.specularMul = u_specularMul;
  // convert specular/smoothness -> roughness
  material.roughness = 1.0 - readSpecular();

  vec3 toCaster = normalize(u_directionalShadowCasterPosition.xyz - v_Position);
  material.shadow = 1.0 - calculateDirectionalShadow(
    v_PositionLightShadowSpace, material.normal, toCaster
  );
  material.hairShadow = 1.0 - readHairShadow();

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

    vec3 contrib = pbr(material, light);

    /* // OR instead of PBR:
    vec3 L = normalize(light.position - material.positionWS); // wi in integral
    float NdotL = dotMax0(material.normal, L);
    vec3 radiance = light.color * light.intensity; // incoming color from light
    vec3 contrib = material.albedo * radiance * NdotL;
    */

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

  float shadow = min(material.shadow, material.hairShadow);
  radianceSum = radianceSum * clamp(shadow, 1.0 - u_maxShadowContribution, 1.0);
  return ambient + radianceSum + contribSSS;
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
