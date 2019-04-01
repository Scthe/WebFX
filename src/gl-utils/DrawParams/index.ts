export * from './applyDrawParams';
export * from './Blend';
export * from './Depth';
export * from './Stencil';

import STATIC_GL from 'gl-utils/gimme_gl';
// import {Blend} from './Blend';
import {Depth} from './Depth';
import {Stencil} from './Stencil';

/*
 * Following features are not available in webgl:
 *   - lineWidth (https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/lineWidth)
 *   - pointSize
 *   - polygonMode (use GL_LINES during draw?)
 */

export enum CullingMode {
  None = STATIC_GL.NONE, // show all
  CullFront = STATIC_GL.FRONT, // CCW, hides front-facing faces
  CullBack = STATIC_GL.BACK, // CW, hides back-facing faces
}

export class DrawParams {
  depth: Depth = new Depth();
  stencil: Stencil = new Stencil();
  // blend: Blend = new Blend();

  dithering: boolean = false; // smoothen transition between colors
  culling: CullingMode = CullingMode.CullBack;

  // It also affects glClear!
  colorWrite = [true, true, true, true]; // RGBA
}
