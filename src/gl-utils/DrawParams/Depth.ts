import STATIC_GL from 'gl-utils/gimme_gl';

export enum DepthTest {
  AlwaysFail = STATIC_GL.NEVER,
  AlwaysPass = STATIC_GL.ALWAYS,
  IfEqual = STATIC_GL.EQUAL,
  IfNotEqual = STATIC_GL.NOTEQUAL,
  IfMore = STATIC_GL.GREATER,
  IfMoreOrEqual = STATIC_GL.GEQUAL,
  IfLess = STATIC_GL.LESS,
  IfLessOrEqual = STATIC_GL.LEQUAL,
}

export class Depth {
  test: DepthTest = DepthTest.IfLess;
  write: boolean = true;
  // f32 range[2] = {0, 1};
  // DepthClamp clamp = DepthClamp::NoClamp;
}
