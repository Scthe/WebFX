#version 300 es
precision highp float;
precision highp int;
precision highp usampler2D;
// precision highp sampler2D;

uniform int u_displayMode;
// Shadow
uniform sampler2D u_directionalShadowDepthTex;
uniform vec4 u_directionalShadowCasterPosition; // [position.xyz, bias (negative if pcss)]
uniform int u_directionalShadowSampleRadius;
uniform float u_maxShadowContribution;
#define BIAS_FROM_UI (u_directionalShadowCasterPosition.w)
#define USE_PCSS_SHADOWS (u_directionalShadowCasterPosition.w < 0.0f)


flat in int v_hairInstanceId;
in float v_vertexRootToTipFactor;
in vec3 v_position;
in vec3 v_normal;
in vec4 v_positionLightShadowSpace;

layout(location = 0) out vec4 outColor1;


@import ./_utils;
@import ./_shadows;


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
  vec3 normal = v_normal;
  return 1.0 - calculateDirectionalShadow(
    v_positionLightShadowSpace, normal, toCaster
  );
}


void main() {
  vec3 result;

  switch (u_displayMode) {
    case DISPLAY_MODE_FOLLOW_GROUPS:
      result = getColorFromInstance(v_hairInstanceId);
      break;

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

    default:
    case DISPLAY_MODE_FINAL:
    case DISPLAY_MODE_FLAT: {
      result = vec3(0.8);
      break;
    }
  }

  outColor1 = vec4(result, 1.0);
}
