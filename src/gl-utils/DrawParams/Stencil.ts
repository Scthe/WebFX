import STATIC_GL from 'gl-utils/gimme_gl';

export enum StencilTest {
  AlwaysPass = STATIC_GL.ALWAYS,
  AlwaysFail = STATIC_GL.NEVER,
  IfRefIsLessThenCurrent = STATIC_GL.LESS,      // write if this->reference_value < current_stencil_value
  IfRefIsLessOrEqualCurrent = STATIC_GL.LEQUAL,
  IfRefIsMoreThenCurrent = STATIC_GL.GREATER,   // write if this->reference_value > current_stencil_value
  IfRefIsMoreOrEqualCurrent = STATIC_GL.GEQUAL,
  IfRefIsEqualCurrent = STATIC_GL.EQUAL,        // write if this->reference_value == current_stencil_value
  IfRefIsNotEqualCurrent = STATIC_GL.NOTEQUAL, // write if this->reference_value != current_stencil_value
}

export enum StencilOperation {
  Keep = STATIC_GL.KEEP,          // keep current value
  Zero = STATIC_GL.ZERO,          // write zero
  Replace = STATIC_GL.REPLACE,    // write reference value
  Increment = STATIC_GL.INCR,     // min(current_value + 1, MAX_INT)
  IncrementWrap = STATIC_GL.INCR_WRAP, // let next = current_value + 1; return next == MAX_INT ? 0 : next
  Decrement = STATIC_GL.DECR,     // max(current_value - 1, MIN_INT)
  DecrementWrap = STATIC_GL.DECR_WRAP, // let next = current_value - 1; return current_value == 0 ? MAX_INT : next
  Invert = STATIC_GL.INVERT,      // invert bits
}

export class StencilPerSide {
  /** Comparison against the existing value in the stencil buffer. */
  test: StencilTest = StencilTest.AlwaysPass;
  /** Specifies the operation to do when a fragment fails the stencil test. */
  opStencilFail: StencilOperation = StencilOperation.Keep;
  /** Specifies the operation to do when a fragment passes the stencil test but fails the depth test.*/
  opstencilPassDepthFail: StencilOperation = StencilOperation.Keep;
  /** Specifies the operation to do when a fragment passes both the stencil and depth tests. */
  opPass: StencilOperation = StencilOperation.Keep;
}

export class Stencil {
  /**
   * Reference value, can be used to:
   *   * compare to in stencil test
   *   * write to stencil buffer (StencilOperation.Replace)
   */
  referenceValue: GLint = 0;
  /** used for compare, see last arg to glStencilFunc. Also known as ReadMask */
  compareMask: GLuint = 0xffffffff;
  /** Allows specifying a mask when writing data on the stencil buffer. Also known as WriteMask */
  writeBytes: GLuint = 0xffffffff;
  front: StencilPerSide = new StencilPerSide();
  back: StencilPerSide = new StencilPerSide();
}
