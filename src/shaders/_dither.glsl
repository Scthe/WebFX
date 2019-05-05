// usual 8x8 Bayer matrix dithering


const float DITHER_ELEMENT_RANGE = 64.0;
const float DITHER_LINEAR_COLORSPACE_COLORS = 256.0;


/* returns 0-1 dithered value */
float getDitherMatrixMod() {
  const int DITHER_MATRIX[64] = int[](
     0, 32,  8, 40,  2, 34, 10, 42,
    48, 16, 56, 24, 50, 18, 58, 26,
    12, 44,  4, 36, 14, 46,  6, 38,
    60, 28, 52, 20, 62, 30, 54, 22,
     3, 35, 11, 43,  1, 33,  9, 41,
    51, 19, 59, 27, 49, 17, 57, 25,
    15, 47,  7, 39, 13, 45,  5, 37,
    63, 31, 55, 23, 61, 29, 53, 21
  );

  ivec2 pxPos = ivec2(
    mod(gl_FragCoord.x, 8.0),
    mod(gl_FragCoord.y, 8.0)
  );
  int idx = pxPos.y * 8 + pxPos.x;
  int matValue = DITHER_MATRIX[idx] + 1; // [1-64]
  return float(matValue) / DITHER_ELEMENT_RANGE / DITHER_LINEAR_COLORSPACE_COLORS;
}

/**
 * Add some random value to each pixel,
 * hoping it would make it different than neighbours
 */
vec3 doDither (vec3 originalColor, float strength) {
  float ditherMod = getDitherMatrixMod() * strength;
  return originalColor + ditherMod;
}
