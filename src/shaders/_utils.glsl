const float PI = 3.14159265359;

vec2 fixOpenGLTextureCoords_AxisY(vec2 uv) {
  return vec2(uv.x, 1.0 - uv.y);
}

float doGamma (float color, float gammaValue) {
  return pow(color, 1.0 / gammaValue);
}
vec3 doGamma (vec3 color, float gammaValue) {
  return pow(color, vec3(1.0 / gammaValue));
}
float sRGBtoLinear (float color, float gammaValue) {
  // http://renderwonk.com/blog/index.php/archive/adventures-with-gamma-correct-rendering/
  if (color > 0.04045) {
    float n = color + 0.055;
    return pow(n / 1.055, gammaValue);
  }
  return color / 12.92;
}
vec3 sRGBtoLinear (vec3 color, float gammaValue) {
  return vec3(
    sRGBtoLinear(color.r, gammaValue),
    sRGBtoLinear(color.g, gammaValue),
    sRGBtoLinear(color.b, gammaValue)
  );
}
/*
// OR: https://github.com/EpicGames/UnrealEngine/blob/release/Engine/Shaders/Private/GammaCorrectionCommon.ush
half3 sRGBToLinear( half3 Color ) {
	Color = max(6.10352e-5, Color); // minimum positive non-denormal (fixes black problem on DX11 AMD and NV)
	return Color > 0.04045 ? pow( Color * (1.0 / 1.055) + 0.0521327, 2.4 ) : Color * (1.0 / 12.92);
}*/


float toLuma_fromGamma (vec3 rgbCol) {
  vec3 toLumaCoef = vec3(0.299f, 0.587f, 0.114f);
  return dot(toLumaCoef, rgbCol);
}

float toLuma_fromLinear(vec3 rgbCol) {
  vec3 toLumaCoef = vec3(0.2126729f,  0.7151522f, 0.0721750f);
  return dot(toLumaCoef, rgbCol);
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

/** https://learnopengl.com/Advanced-OpenGL/Depth-testing */
float linearizeDepth(float depth, vec2 nearAndFar) {
  float near = nearAndFar.x;
  float far = nearAndFar.y;
  float z = depth * 2.0 - 1.0; // back to NDC
  return (2.0 * near * far) / (far + near - z * (far - near));
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

float max3(vec3 v){ return max(v.x, max(v.y, v.z)); }
float max4(vec4 v){ return max(v.w, max3(v.xyz)); }

float min3(vec3 v){ return min(v.x, min(v.y, v.z)); }
float min4(vec4 v){ return min(v.w, min3(v.xyz)); }

/** returns something random */
vec3 hash(vec3 a) {
  a = fract(a * vec3(.8, .8, .8));
  a += dot(a, a.yxz + 19.19);
  return fract((a.xxy + a.yxx) * a.zyx);
}


/**
 * Example usage:
 * uniform int u_optionFlags;
 * const int FLAG_USE_GAUSS = 1;
 * const int FLAG_USE_ROUGHNESS = 2;
 * ...
 * isFlag(u_optionFlags, FLAG_USE_ROUGHNESS) ? .. : ..;
*/
//
bool isFlag(int flags, int flagValue) {
  return (flags & flagValue) > 0;
}
