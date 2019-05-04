#version 300 es
precision highp float;
precision highp int;
precision highp usampler2D;
// precision highp sampler2D;

uniform int u_displayMode;
uniform vec3 u_cameraPosition;
uniform vec2 u_viewportSize;
// ao
uniform sampler2D u_aoTex;
uniform float u_aoStrength;
uniform float u_aoExp;
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
// material
uniform vec3 u_specularColor1;
uniform vec3 u_specularColor2;
uniform vec3 u_albedo;
uniform float u_primaryShift;
uniform float u_secondaryShift;
uniform float u_specularPower1;
uniform float u_specularPower2;
uniform float u_specularStrength1;
uniform float u_specularStrength2;


flat in int v_hairInstanceId;
in float v_vertexRootToTipFactor;
in vec3 v_position;
in vec3 v_normal;
in vec3 v_tangent;
in vec4 v_positionLightShadowSpace;

layout(location = 0) out vec4 outColor1;
layout(location = 1) out vec4 outColor2;


@import ./_utils;
@import ./_material; // for light struct
@import ./_shadows;
@import ./_kajiyakay;


const int DISPLAY_MODE_FINAL = 0;
const int DISPLAY_MODE_FLAT = 1;
const int DISPLAY_MODE_FOLLOW_GROUPS = 2;
const int DISPLAY_MODE_ROOT_TIP_PERCENTAGE = 3;
const int DISPLAY_MODE_SHADOW = 4;


vec3 getColorFromInstance (int instanceId) {
  switch (instanceId) {
    case 1: return vec3(0.0, 1.0, 0.0);
    case 2: return vec3(0.0, 0.0, 1.0);
    case 3: return vec3(1.0, 1.0, 0.0);
    case 4: return vec3(0.0, 1.0, 1.0);
    case 5: return vec3(1.0, 0.0, 1.0);
    case 6: return vec3(1.0, 1.0, 1.0);
    case 7: return vec3(0.0, 0.0, 0.0);
    case 8: return vec3(0.0, 0.5, 0.0);
    case 9: return vec3(0.5, 0.5, 0.5);
    case 10: return vec3(0.0, 0.0, 0.5);
    case 11: return vec3(0.5, 0.5, 0.0);
    case 12: return vec3(0.0, 0.5, 0.5);
    case 13: return vec3(0.5, 0.0, 0.5);

    default:
    case 0: return vec3(1.0, 0.0, 0.0);
  }
}

float calculateShadow () {
  vec3 toCaster = normalize(u_directionalShadowCasterPosition.xyz - v_position);
  vec3 normal = normalize(v_normal); // TODO use tangent per http://developer.amd.com/wordpress/media/2012/10/Scheuermann_HairRendering.pdf s7?
  return 1.0 - calculateDirectionalShadow(
    v_positionLightShadowSpace, normal, toCaster
  );
}


KajiyaKayParams createKajiyakayParams() {
  KajiyaKayParams params;
  params.V = normalize(u_cameraPosition - v_position); // viewDir
  params.T = normalize(v_tangent); // tangentDir
  params.N = normalize(v_normal); // normalDir
  // params.L // filled later

  params.shift = 0.0; // TODO
  params.primaryShift = u_primaryShift;
  params.secondaryShift = u_secondaryShift;
  params.specularPower1 = u_specularPower1;
  params.specularPower2 = u_specularPower2;
  return params;
}


vec3 doShading(Light lights[3]) {
  vec3 ambient = u_lightAmbient.rgb * u_lightAmbient.a;
  vec3 radianceSum = vec3(0.0);
  KajiyaKayParams params = createKajiyakayParams();

  for (uint i = 0u; i < 3u; i++) {
    Light light = lights[i];
    vec3 L = normalize(light.position - v_position); // wi in integral
    // float NdotL = dotMax0(v_normal, L); // no, cause it's hair
    float NdotL = dotMax0(v_tangent, L);
    vec3 radiance = light.color * light.intensity; // incoming color from light

    // specular
    params.L = L;
    vec2 specularHighlight = kajiyakay(params);
    vec3 specular1 = specularHighlight.x * u_specularColor1 * u_specularStrength1;
    vec3 specular2 = specularHighlight.y * u_specularColor2 * u_specularStrength2;

    // combine
    vec3 fr = u_albedo * NdotL + specular1 + specular2;
    radianceSum += fr * radiance;

    // debug:
    // radianceSum += u_albedo * NdotL * radiance;
    // radianceSum += NdotL;
    // radianceSum += specularHighlight.x;
    // radianceSum += specularHighlight.y;
    // radianceSum += specular1;
    // radianceSum += specular2;
    // radianceSum += specular1 + specular2;
  }

  // ambient occlusion
  float ao = texture(u_aoTex, gl_FragCoord.xy / u_viewportSize).r;
  ao = getCustom_AO(ao, u_aoStrength, u_aoExp);
  radianceSum *= ao;
  ambient *= ao;

  float shadow = calculateShadow();
  radianceSum = radianceSum * clamp(shadow, 1.0 - u_maxShadowContribution, 1.0);
  return ambient + radianceSum;
}


void main() {
  Light lights[3];
  lights[0] = unpackLight(u_light0_Position, u_light0_Color);
  lights[1] = unpackLight(u_light1_Position, u_light1_Color);
  lights[2] = unpackLight(u_light2_Position, u_light2_Color);

  vec3 result;

  switch (u_displayMode) {
    case DISPLAY_MODE_FOLLOW_GROUPS: {
      result = getColorFromInstance(v_hairInstanceId);
      break;
    }

    case DISPLAY_MODE_ROOT_TIP_PERCENTAGE: {
      result = vec3(v_vertexRootToTipFactor);
      // result = mix(vec3(0.0, 1.0, 1.0), vec3(0.0, 1.0, 0.0), v_vertexRootToTipFactor);
      // result += getColorFromInstance(v_hairInstanceId);
      break;
    }

    case DISPLAY_MODE_SHADOW: {
      float shadow = calculateShadow();
      result = vec3(shadow);
      break;
    }

    case DISPLAY_MODE_FLAT: {
      result = vec3(0.8);
      break;
    }

    default:
    case DISPLAY_MODE_FINAL: {
      result = doShading(lights);
      break;
    }
  }

  outColor1 = vec4(result, 1.0);
  outColor2 = vec4(to_0_1(normalize(v_normal)), 1.0);
}
