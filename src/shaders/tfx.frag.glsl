#version 300 es
precision highp float;
precision highp int;
precision highp usampler2D;
// precision highp sampler2D;

uniform int u_displayMode;


flat in int v_hairInstanceId;
in float v_vertexRootToTipFactor;

layout(location = 0) out vec4 outColor1;

const int DISPLAY_MODE_FINAL = 0;
const int DISPLAY_MODE_FLAT = 1;
const int DISPLAY_MODE_FOLLOW_GROUPS = 2;
const int DISPLAY_MODE_ROOT_TIP_PERCENTAGE = 3;


vec3 getColorFromInstance (int instanceId) {
  switch (instanceId) {
    case 1: return vec3(0.0, 1.0, 0.0);
    case 2: return vec3(0.0, 0.0, 1.0);
    case 3: return vec3(1.0, 1.0, 0.0);
    case 4: return vec3(0.0, 1.0, 1.0);
    case 5: return vec3(1.0, 0.0, 1.0);
    default:
    case 0: return vec3(1.0, 0.0, 0.0);
  }
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

    default:
    case DISPLAY_MODE_FINAL:
    case DISPLAY_MODE_FLAT: {
      result = vec3(0.8);
      break;
    }
  }

  outColor1 = vec4(result, 1.0);
}
