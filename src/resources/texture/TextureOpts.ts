import STATIC_GL from 'gl-utils/gimme_gl';

export enum TextureFilterMin {
  Nearest = STATIC_GL.NEAREST,
  Linear = STATIC_GL.LINEAR,
  NearestMipmapNearest = STATIC_GL.NEAREST_MIPMAP_NEAREST,
  LinearMipmapNearest = STATIC_GL.LINEAR_MIPMAP_NEAREST,
  NearestMipmapLinear = STATIC_GL.NEAREST_MIPMAP_LINEAR,
  LinearMipmapLinear = STATIC_GL.LINEAR_MIPMAP_LINEAR,
}

export enum TextureFilterMag {
  Nearest = STATIC_GL.NEAREST,
  Linear = STATIC_GL.LINEAR,
}

/*
export enum TextureSwizzle {
  Red = STATIC_GL.RED,
  Green = STATIC_GL.GREEN,
  Blue = STATIC_GL.BLUE,
  Alpha = STATIC_GL.ALPHA,
  Zero = STATIC_GL.ZERO,
  One = STATIC_GL.ONE,
};*/

export enum TextureWrap {
  UseEdgePixel = STATIC_GL.CLAMP_TO_EDGE,
  // UseBorderColor = STATIC_GL.CLAMP_TO_BORDER,
  MirroredRepeat = STATIC_GL.MIRRORED_REPEAT,
  Repeat = STATIC_GL.REPEAT,
  // MirrorThenUseEdgePixel = STATIC_GL.MIRROR_CLAMP_TO_EDGE,
}


/**
 * @see http://docs.gl/gl4/glTexParameter#Description
 */
export interface TextureOpts {
  /** GL_TEXTURE_BASE_LEVEL */
  mipmapBaseLevel: number;
  /** GL_TEXTURE_MAX_LEVEL */
  mipmapMaxLevel: number;
  /** GL_TEXTURE_BORDER_COLOR, order: RGBA */
  // u32 borderColor[4] = {0,0,0,0}; //
  /** GL_TEXTURE_MIN_FILTER */
  filterMin: TextureFilterMin;
  /** GL_TEXTURE_MAG_FILTER */
  filterMag: TextureFilterMag;
  /** GL_TEXTURE_MIN_LOD, */
  lodMin: number;
  /** GL_TEXTURE_MAX_LOD, */
  lodMax: number;
  /** GL_TEXTURE_LOD_BIAS, must be < GL_MAX_TEXTURE_LOD_BIAS */
  // lodBias: number;

  /** GL_TEXTURE_SWIZZLE_RGBA, GL_TEXTURE_SWIZZLE_R, GL_TEXTURE_SWIZZLE_G, GL_TEXTURE_SWIZZLE_B, GL_TEXTURE_SWIZZLE_A, */
  /*TextureSwizzle_ swizzle[4] = {
    TextureSwizzle::Red,
    TextureSwizzle::Green,
    TextureSwizzle::Blue,
    TextureSwizzle::Alpha
  };*/

  /** GL_TEXTURE_WRAP_S, GL_TEXTURE_WRAP_T, GL_TEXTURE_WRAP_R. */
  wrap: TextureWrap[];
}

const DEFAULT_TEXTURE_OPTS: TextureOpts = {
  mipmapBaseLevel: 0,
  mipmapMaxLevel: 1000,
  // borderColor: [0, 0, 0, 0],
  filterMin: TextureFilterMin.Linear,
  filterMag: TextureFilterMag.Linear,
  lodMin: -1000,
  lodMax: 1000,
  // lodBias: 0.0,
  wrap: [TextureWrap.UseEdgePixel, TextureWrap.UseEdgePixel, TextureWrap.UseEdgePixel],
};

export const createTextureOpts = (base: Partial<TextureOpts>) => ({
  ...DEFAULT_TEXTURE_OPTS,
  ...base,
});
