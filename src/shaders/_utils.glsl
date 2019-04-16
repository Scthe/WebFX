vec2 fixOpenGLTextureCoords_AxisY(vec2 uv) {
  return vec2(uv.x, 1.0 - uv.y);
}

vec3 tonemapReinhard (vec3 color) {
  return color / (color + vec3(1.0));
}

vec3 gammaFix (vec3 color, float gamma) {
  return pow(color, vec3(1.0/gamma));
}


float dotMax0 (vec3 n, vec3 toEye){
  return max(0.0, dot(n, toEye));
}

bool outOfScreen (vec2 coord) {
  return coord.x < 0.0 ||
         coord.x > 1.0 ||
         coord.y < 0.0 ||
         coord.y > 1.0;
}


// [0..1] -> [-1..1]
float to_neg1_1 (float v) { return 2.0 * v - 1.0; }
vec2  to_neg1_1 (vec2  v) { return 2.0 * v - 1.0; }
vec3  to_neg1_1 (vec3  v) { return 2.0 * v - 1.0; }
vec4  to_neg1_1 (vec4  v) { return 2.0 * v - 1.0; }

// [-1..1] -> [0..1]
float to_0_1 (float v) { return 0.5 * v + 0.5; }
vec2 to_0_1  (vec2  v) { return 0.5 * v + 0.5; }
vec3 to_0_1  (vec3  v) { return 0.5 * v + 0.5; }
vec4 to_0_1  (vec4  v) { return 0.5 * v + 0.5; }

// [-1..1] -> [0..1]
float saturate (float v) { return clamp(v, 0.0, 1.0); }
vec2  saturate (vec2  v) { return clamp(v, vec2(0.0, 0.0), vec2(1.0, 1.0)); }
vec3  saturate (vec3  v) { return clamp(v, vec3(0.0, 0.0, 0.0), vec3(1.0, 1.0, 1.0)); }
vec4  saturate (vec4  v) { return clamp(v, vec4(0.0, 0.0, 0.0, 0.0), vec4(1.0, 1.0, 1.0, 1.0)); }
