import {vec3} from 'gl-vec3';
import STATIC_GL from 'gl-utils/gimme_gl';
import {assertUnreachable, getGlConstName} from 'gl-utils';
import {GlResource, verifyOk} from '../GlResource';
import {TextureOpts} from './TextureOpts';
import {TextureBindingState} from './TextureBindingState';
import {isSizedTextureFormatInteger} from './utils';


export enum TextureType {
  Texture2d      = STATIC_GL.TEXTURE_2D,
  TextureCubemap = STATIC_GL.TEXTURE_CUBE_MAP,
  Texture3d      = STATIC_GL.TEXTURE_3D,
  Texture2dArray = STATIC_GL.TEXTURE_2D_ARRAY,
}
export const TextureTypeArray = [
  TextureType.Texture2d, TextureType.TextureCubemap,
  TextureType.Texture3d, TextureType.Texture2dArray,
];

export enum CubemapSide {
  Positive_x = STATIC_GL.TEXTURE_CUBE_MAP_POSITIVE_X,
  Negative_x = STATIC_GL.TEXTURE_CUBE_MAP_NEGATIVE_X,
  Positive_y = STATIC_GL.TEXTURE_CUBE_MAP_POSITIVE_Y,
  Negative_y = STATIC_GL.TEXTURE_CUBE_MAP_NEGATIVE_Y,
  Positive_z = STATIC_GL.TEXTURE_CUBE_MAP_POSITIVE_Z,
  Negative_z = STATIC_GL.TEXTURE_CUBE_MAP_NEGATIVE_Z,
}
export const CubemapSideArray = [
  CubemapSide.Positive_x, CubemapSide.Negative_x,
  CubemapSide.Positive_y, CubemapSide.Negative_y,
  CubemapSide.Positive_z, CubemapSide.Negative_z,
];


export const NO_MIPMAPS = 0;
const BORDER_ALWAYS_0 = 0; // required by webgl

type TexturePoint = vec3;
type TextureDimensions = vec3;
interface TextureBox {
  start: TexturePoint;
  dimensions: TextureDimensions;
}

interface WriteSource {
  unsizedPixelFormat: number; // GL_R, GL_RG, GL_RGB, GL_RGBA etc. - channels only
  perChannelType: number;
  data: any;
  cubemapSide?: CubemapSide;
}

const getDepthStencilGlTexImageParams = (gl: Webgl, type: GLenum) => {
  switch (type) {
    case gl.DEPTH_COMPONENT16:
      return {
        internalformat: gl.DEPTH_COMPONENT16,
        format: gl.DEPTH_COMPONENT,
        type: gl.UNSIGNED_SHORT
      };
    case gl.DEPTH24_STENCIL8:
      return {
        internalformat: gl.DEPTH24_STENCIL8,
        format: gl.DEPTH_STENCIL,
        type: gl.UNSIGNED_INT_24_8
      };
    case gl.DEPTH_COMPONENT:
    case gl.DEPTH_STENCIL:
    case gl.UNSIGNED_INT_24_8:
    case gl.UNSIGNED_SHORT:
    // default: // this will not execute due too 'if (this.isDepth)' in allocate()
      throw [
        'Invalid texture sizedPixelFormat. You probably wanted to create depth buffer.',
        'In that case, use one of [gl.DEPTH_COMPONENT16, gl.DEPTH24_STENCIL8]',
        `Provided '${type}', which is on the blacklist as invalid depth format`,
      ].join('');
    default:
      return null;
  }
};


/*
 *
 * Unsized vs Sized and format vs internal format (in normalized environment)
 *
 * INTERNAL FORMAT is how memory will be allocated on GPU. It is expressed
 * in 'SIZED' GLenum e.g. GL_RGBA8 (4 channels of unsigned byte each).
 *
 * On the other hand, when WRITING/READING we usually provide 3 arguments
 *    (GLenum format, GLenum type, GLvoid * pixels), where
 *    * 'format' is 'UNSIZED' info about channels (e.g. GL_R, GL_RG, GL_RGB, GL_RGBA),
 *    * 'type' is type in each channel
 *    * 'pixels' is data.
 * UNSIZED are used to describe data that we provide so it can be written
 * or texture format that we want to read.
 *
 * level:
 *  - lvl0 - original,
 *  - lvl1 - 1st mipmap (each dimension halfed)
 *  - lvl2 - 2st mipmap (each dimension is quater of original) etc.
 *
 */
export class Texture extends GlResource<WebGLTexture> {

  constructor (
    gl: Webgl,
    bindings: TextureBindingState,
    public readonly type: TextureType,
    public readonly dimensions: vec3,
    public readonly mipmapLevels: number, // use 0 for no mipmaps (or just NO_MIPMAPS const)
    public readonly sizedPixelFormat: number, // GL_R8 / GL_RGBA8 / GL_RGBA32F / GL_DEPTH_COMPONENT16 / GL_DEPTH24_STENCIL8 etc.
    public readonly opts: TextureOpts,
  ) {
    super(gl.createTexture(), 'Texture');
    this.applyOptions(gl, bindings, this.opts);
    this.allocate(gl);
  }

  private allocate (gl: Webgl): void {
    // this.bindAsActive(gl); already done
    this.checkAllocationSize(gl);

    switch (this.type) {
      case TextureType.Texture2d:
        this.allocateTeture2d(gl, this.type);
        return;
      case TextureType.Texture3d:
      case TextureType.Texture2dArray:
        gl.texStorage3D(
          this.type,
          this.mipmapLevels + 1,
          this.sizedPixelFormat,
          this.width, this.height, this.depth
        );
        return;
      case TextureType.TextureCubemap:
        this.allocateTeture2d(gl, this.type);
        return;
      default:
        assertUnreachable();
    }
  }

  private allocateTeture2d (gl: Webgl, type: TextureType): void {
    const depthOpts = getDepthStencilGlTexImageParams(gl, this.sizedPixelFormat);
    if (depthOpts) {
      gl.texImage2D(
        type,
        0,  // mipmapLevels 0 cause this is depth
        depthOpts.internalformat,
        this.width, this.height, BORDER_ALWAYS_0,
        depthOpts.format, depthOpts.type,
        null
      );
    } else {
      gl.texStorage2D(
        type,
        this.mipmapLevels + 1,
        this.sizedPixelFormat,
        this.width, this.height
      );
    }
  }

  private checkAllocationSize (gl: Webgl) {
    const check = (ds: number[], maxSize: number) => {
      if (!ds.every(d => d <= maxSize)) {
        console.warn(`Tried to allocate texture of size [${ds.join(', ')}]px, while max for single dimension is ${maxSize}px. This will not work correctly`);
      }
    };

    switch (this.type) {
      case TextureType.Texture2d:
      case TextureType.TextureCubemap: // I guess?
        check([this.width, this.height], gl.getParameter(gl.MAX_TEXTURE_SIZE));
        break;
      case TextureType.Texture3d:
        check([this.width, this.height, this.depth], gl.getParameter(gl.MAX_3D_TEXTURE_SIZE));
        break;
      case TextureType.Texture2dArray:
        check([this.width, this.height], gl.getParameter(gl.MAX_TEXTURE_SIZE));
        check([this.depth], gl.getParameter(gl.MAX_ARRAY_TEXTURE_LAYERS));
        break;
    }
  }

  private checkIntegerWrite(unsizedPixelFormat: GLenum) {
    const isSizedAnIntegerTex = isSizedTextureFormatInteger(this.sizedPixelFormat); // getGlConstName(this.sizedPixelFormat).endsWith('I'); // *UI or *I
    const isUnsiedAnIntegerTex = getGlConstName(unsizedPixelFormat).endsWith('_INTEGER');
    if (isSizedAnIntegerTex && !isUnsiedAnIntegerTex) {
      console.warn('Texture.write: Tried to write non _INTEGER texture data into texture that uses internally integers');
    }
  }

  @verifyOk
  write (gl: Webgl, bindings: TextureBindingState, mipmapLevel: number, targetPos: TextureBox, source: WriteSource) {
    if (this.isDepth) {
      throw `Tried to write into depth texture. What?`;
    }
    this.checkIntegerWrite(source.unsizedPixelFormat);

    this.bindAsActive(gl, bindings);

    const {start, dimensions} = targetPos;
    const {
      unsizedPixelFormat: format,
      perChannelType: type,
      data
    } = source;

    switch (this.type) {
      case TextureType.Texture2d:
        gl.texSubImage2D(
          this.type,
          mipmapLevel,
          start[0], start[1],
          dimensions[0], dimensions[1],
          format, type, data
        );
        return;
      case TextureType.Texture3d:
      case TextureType.Texture2dArray:
        gl.texSubImage3D(
          this.type,
          mipmapLevel,
          start[0], start[1], start[2],
          dimensions[0], dimensions[1], dimensions[2],
          format, type, data
        );
        return;
      case TextureType.TextureCubemap:
        gl.texSubImage2D(
          source.cubemapSide,
          mipmapLevel,
          start[0], start[1],
          dimensions[0], dimensions[1],
          format, type, data
        );
        return;
      default:
        assertUnreachable();
        return;
    }
  }

  get width()  { return this.dimensions[0]; }
  get height() { return this.dimensions[1]; }
  get depth()  { return this.dimensions[2]; } // also array size

  get isDepth() {
    const depthFormats = [STATIC_GL.DEPTH_COMPONENT16, STATIC_GL.DEPTH24_STENCIL8];
    return depthFormats.includes(this.sizedPixelFormat);
  }

  get isDepthStencil() {
    const depthFormats = [STATIC_GL.DEPTH24_STENCIL8];
    return depthFormats.includes(this.sizedPixelFormat);
  }

  @verifyOk
  bindAsActive (gl: Webgl, bindings: TextureBindingState) {
    bindings.bindSingle(gl, this);
  }

  destroy (gl: Webgl) {
    if (this.isOk) {
      gl.deleteTexture(this.glId);
      this.glId_ = null;
    }
  }

  @verifyOk
  generateMipmaps (gl: Webgl, bindings: TextureBindingState) {
    this.bindAsActive(gl, bindings);
    gl.generateMipmap(this.type);
  }

  @verifyOk
  applyOptions (gl: Webgl, bindings: TextureBindingState, opts: TextureOpts) {
    this.bindAsActive(gl, bindings);
    // docs as helpful as always...
    // https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texParameter
    gl.texParameteri(this.type, gl.TEXTURE_BASE_LEVEL, opts.mipmapBaseLevel);
    gl.texParameteri(this.type, gl.TEXTURE_MAX_LEVEL, opts.mipmapMaxLevel);
    gl.texParameteri(this.type, gl.TEXTURE_MIN_LOD, opts.lodMin);
    gl.texParameteri(this.type, gl.TEXTURE_MAX_LOD, opts.lodMax);
    gl.texParameteri(this.type, gl.TEXTURE_MIN_FILTER, opts.filterMin);
    gl.texParameteri(this.type, gl.TEXTURE_MAG_FILTER, opts.filterMag);
    gl.texParameteri(this.type, gl.TEXTURE_WRAP_R, opts.wrap[0]);
    gl.texParameteri(this.type, gl.TEXTURE_WRAP_S, opts.wrap[1]);
    gl.texParameteri(this.type, gl.TEXTURE_WRAP_T, opts.wrap[2]);
  }

}
