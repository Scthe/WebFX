import {fromValues as Vec4} from 'gl-vec4';
import STATIC_GL from 'gl-utils/gimme_gl';

/** @see https://github.com/glium/glium/blob/cd1bab4f6b7c3b48391289b3a10be115f660b252/src/draw_parameters/blend.rs#L123 for good overview */
export enum BlendingFactor {
    Zero                      = STATIC_GL.ZERO, // nope
    One                       = STATIC_GL.ONE, // replace
    // SourceAlphaSaturate       = STATIC_GL.SRC_ALPHA_SATURATE, // use STATIC_GL.SRC_ALPHA_SATURATE instead of BlendingFactor::_

    SourceColor               = STATIC_GL.SRC_COLOR, // src
    OneMinusSourceColor       = STATIC_GL.ONE_MINUS_SRC_COLOR, // 1-src
    DestinationColor          = STATIC_GL.DST_COLOR, // dest
    OneMinusDestinationColor  = STATIC_GL.ONE_MINUS_DST_COLOR, // 1-dest
    ConstantColor             = STATIC_GL.CONSTANT_COLOR, // C
    OneMinusConstantColor     = STATIC_GL.ONE_MINUS_CONSTANT_COLOR, // 1-C

    SourceAlpha               = STATIC_GL.SRC_ALPHA, // Alpha: src
    OneMinusSourceAlpha       = STATIC_GL.ONE_MINUS_SRC_ALPHA, // Alpha: 1-src
    DestinationAlpha          = STATIC_GL.DST_ALPHA, // Alpha: dest
    OneMinusDestinationAlpha  = STATIC_GL.ONE_MINUS_DST_ALPHA, // Alpha: 1-dest
    ConstantAlpha             = STATIC_GL.CONSTANT_ALPHA, // Alpha: C
    OneMinusConstantAlpha     = STATIC_GL.ONE_MINUS_CONSTANT_ALPHA, // Alpha: 1-C
}

/** @see https://github.com/glium/glium/blob/cd1bab4f6b7c3b48391289b3a10be115f660b252/src/draw_parameters/blend.rs#L55 for good overview */
export enum BlendingFunction {
  AlwaysReplace = STATIC_GL.NONE, // dummy value that does not exist in OpenGL, will be handled manually
  Min = STATIC_GL.MIN,
  Max = STATIC_GL.MAX,
  Addition = STATIC_GL.FUNC_ADD,
  Subtraction = STATIC_GL.FUNC_SUBTRACT,
  ReverseSubtraction = STATIC_GL.FUNC_REVERSE_SUBTRACT,
}

export class BlendingMode {
  constructor (
    public func: BlendingFunction = BlendingFunction.AlwaysReplace,

    /** destination color (the one that is already on texture) */
    public currentValueFactor: BlendingFactor = BlendingFactor.Zero,

    /** source color (the one from pixel shader) */
    public newValueFactor: BlendingFactor = BlendingFactor.One,
  ) {}
}

export class Blend {
  constructor (
    public color: BlendingMode = new BlendingMode(),
    public alpha: BlendingMode = new BlendingMode(),
    public readonly constantValue = Vec4(1.0, 1.0, 1.0, 1.0),
  ) {}
}
