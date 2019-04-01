import {fromValues as Vec3} from 'gl-vec3';
import {create as Mat4, lookAt} from 'gl-mat4';
import STATIC_GL from 'gl-utils/gimme_gl';
import {CubemapSide} from './Texture';

export const getMipmapSize = (size0: number, mipmapLvl: number) =>
  size0 * Math.pow(0.5, mipmapLvl);


export const isSizedTextureFormatInteger = (sizedPixelFormat: GLenum) => {
  switch (sizedPixelFormat) {
    case STATIC_GL.RGBA32I:
    case STATIC_GL.RGBA32UI:
    case STATIC_GL.RGBA16I:
    case STATIC_GL.RGBA16UI:
    case STATIC_GL.RGBA8I:
    case STATIC_GL.RGBA8UI:
    case STATIC_GL.RGB10_A2UI:
    case STATIC_GL.RG32I:
    case STATIC_GL.RG32UI:
    case STATIC_GL.RG16I:
    case STATIC_GL.RG16UI:
    case STATIC_GL.RG8I:
    case STATIC_GL.RG8UI:
    case STATIC_GL.R32I:
    case STATIC_GL.R32UI:
    case STATIC_GL.R16I:
    case STATIC_GL.R16UI:
    case STATIC_GL.R8I:
    case STATIC_GL.R8UI:
    case STATIC_GL.RGB32I:
    case STATIC_GL.RGB32UI:
    case STATIC_GL.RGB16I:
    case STATIC_GL.RGB16UI:
    case STATIC_GL.RGB8I:
    case STATIC_GL.RGB8UI:
      return true;
    default:
      return false;
  }
};


const targetVectors = [
  Vec3( 1.0,  0.0,  0.0),
  Vec3(-1.0,  0.0,  0.0),
  Vec3( 0.0,  1.0,  0.0),
  Vec3( 0.0, -1.0,  0.0),
  Vec3( 0.0,  0.0,  1.0),
  Vec3( 0.0,  0.0, -1.0),
];
const upVectors = [
  Vec3(0.0, -1.0,  0.0),
  Vec3(0.0, -1.0,  0.0),
  Vec3(0.0,  0.0,  1.0),
  Vec3(0.0,  0.0, -1.0),
  Vec3(0.0, -1.0,  0.0),
  Vec3(0.0, -1.0,  0.0),
];

export const cubemapSideToIdx = (side: CubemapSide) => side - STATIC_GL.TEXTURE_CUBE_MAP_POSITIVE_X;

export const getCubemapSideViewMatrix = (side: CubemapSide) => {
  const idx = cubemapSideToIdx(side);
  return lookAt(Mat4(), Vec3(0, 0, 0), targetVectors[idx], upVectors[idx]);
};
