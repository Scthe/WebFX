import isEqual from 'lodash-es/isEqual';
// import {vec4} from 'gl-vec4';
// import {Blend, BlendingMode, BlendingFunction, BlendingFactor} from './Blend';
import {Depth, DepthTest} from './Depth';
import {StencilPerSide, StencilTest, StencilOperation, Stencil} from './Stencil';
import {CullingMode, DrawParams} from './index';


const setStateBool = (gl: Webgl, name: GLenum, value: boolean) => {
  if (value) {
    gl.enable(name);
  } else {
    gl.disable(name);
  }
};

const syncDepth = (gl: Webgl, depth: Depth, oldDepth: Depth, force: boolean) => {
  const doSync = force || !isEqual(depth, oldDepth);
  if (!doSync) { return; }

  setStateBool(gl, gl.DEPTH_TEST, depth.test !== DepthTest.AlwaysPass || depth.write);
  gl.depthFunc(depth.test);
  gl.depthMask(depth.write);
};

// <editor-fold> STENCIL

const isStencilNoop = (settings: StencilPerSide) => {
  const all_noop = settings.opStencilFail === StencilOperation.Keep
               && settings.opstencilPassDepthFail === StencilOperation.Keep
               && settings.opPass === StencilOperation.Keep;
  return all_noop && settings.test === StencilTest.AlwaysPass;
};

const isSameStencilOps = (front: StencilPerSide, back: StencilPerSide) => {
  return front.opStencilFail === back.opStencilFail
      && front.opstencilPassDepthFail === back.opstencilPassDepthFail
      && front.opPass === back.opPass;
};

const syncStencil = (gl: Webgl, newStencil: Stencil, oldStencil: Stencil, force: boolean) => {
  const doSync = force || !isEqual(newStencil, oldStencil);
  if (!doSync) { return; }

  const front = newStencil.front;
  const back = newStencil.back;
  const refValue = newStencil.referenceValue;
  const compareMask = newStencil.compareMask;

  setStateBool(gl, gl.STENCIL_TEST, !isStencilNoop(front) || !isStencilNoop(back));

  // sync test
  if (front.test === back.test) {
    gl.stencilFunc(front.test, refValue, compareMask);
  } else {
    gl.stencilFuncSeparate(gl.FRONT, front.test, refValue, compareMask);
    gl.stencilFuncSeparate(gl.BACK, back.test, refValue, compareMask);
  }

  // sync write mask
  gl.stencilMask(newStencil.writeBytes);

  // sync ops
  if (isSameStencilOps(front, back)) {
    gl.stencilOp(
      front.opStencilFail,
      front.opstencilPassDepthFail,
      front.opPass);
  } else {
    gl.stencilOpSeparate(gl.FRONT,
      front.opStencilFail,
      front.opstencilPassDepthFail,
      front.opPass);
    gl.stencilOpSeparate(gl.BACK,
      back.opStencilFail,
      back.opstencilPassDepthFail,
      back.opPass);
  }
};

// </editor-fold> // END: STENCIL

// <editor-fold> BLEND

/*
const evalBlendMode = (src: BlendingMode): BlendingMode => {
  if (src.func = BlendingFunction.AlwaysReplace) {
    return new BlendingMode(
      BlendingFunction.Addition,
      BlendingFactor.Zero,
      BlendingFactor.One
    );
  }
  return src;
};

const shouldUseBlend = (newParams: Blend) => {
  const justReplaceCol = newParams.color.func === BlendingFunction.AlwaysReplace;
  const justReplaceAlpha = newParams.alpha.func === BlendingFunction.AlwaysReplace;
  return !justReplaceCol || !justReplaceAlpha;
};

/*const isBlendingModeEq = (a: BlendingMode, a: BlendingMode) => (
  a.func === b.func &&
  a.newValueFactor === b.newValueFactor &&
  a.currentValueFactor === b.currentValueFactor &&
);
* /

const isVec4Equal = (a: vec4, b: vec4) => (
  a[0] === b[0] &&
  a[1] === b[1] &&
  a[2] === b[2] &&
  a[3] === b[3]
);

const isBlendEq = (a: Blend, b: Blend) => (
  a && b &&
  isEqual(a.color, b.color) &&
  isEqual(a.alpha, b.alpha) &&
  isVec4Equal(a.constantValue, b.constantValue)
);

// TODO expose, since multiple textures in fbo are possible. Tho vary of glEnable
const syncBlend = (gl: Webgl, newParams: Blend, oldState: Blend, force: boolean) => {
  if (isBlendEq(newParams, oldState) && !force) {
    return;
  }

  setStateBool(gl, gl.BLEND, shouldUseBlend(newParams));

  gl.blendColor(
    newParams.constantValue[0],
    newParams.constantValue[1],
    newParams.constantValue[2],
    newParams.constantValue[3]
  );

  // handle AlwaysReplace artificial mode
  const color = evalBlendMode(newParams.color);
  const alpha = evalBlendMode(newParams.alpha);

  gl.blendEquationSeparate(color.func, alpha.func);

  gl.blendFuncSeparate(
    color.newValueFactor,
    color.currentValueFactor,
    alpha.newValueFactor,
    alpha.currentValueFactor
  );
};
*/

// </editor-fold> // END: BLEND

export const applyDrawParams = (gl: Webgl, dp: DrawParams, oldDP?: DrawParams, force: boolean = false) => {
  syncDepth(gl, dp.depth, oldDP ? oldDP.depth : undefined, force);
  syncStencil(gl, dp.stencil, oldDP ? oldDP.stencil : undefined, force);
  // syncBlend(gl, dp.blend, oldDP ? oldDP.blend : undefined, force);

  if (force || dp.dithering !== oldDP.dithering) {
    setStateBool(gl, gl.DITHER, dp.dithering);
  }

  if (force || dp.culling !== oldDP.culling) {
    if (dp.culling === CullingMode.None) { // no, there is no leak here
      setStateBool(gl, gl.CULL_FACE, false);
    } else {
      setStateBool(gl, gl.CULL_FACE, true);
      gl.cullFace(dp.culling);
    }
  }

  // color write
  const colorWriteChanged =
    force ||
    oldDP.colorWrite[0] !== dp.colorWrite[0] ||
    oldDP.colorWrite[1] !== dp.colorWrite[1] ||
    oldDP.colorWrite[2] !== dp.colorWrite[2] ||
    oldDP.colorWrite[3] !== dp.colorWrite[3];
  if (colorWriteChanged) {
    const mask = dp.colorWrite;
    gl.colorMask(mask[0], mask[1], mask[2], mask[3]);
  }
};
