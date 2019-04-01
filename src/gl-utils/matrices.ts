import {vec4, fromValues as Vec4, dot as dot4} from 'gl-vec4';
import {vec3} from 'gl-vec3';
import {quat} from 'gl-quat';
import {
  mat4, create as Mat4,
  multiply,
  fromRotationTranslation, fromTranslation, fromScaling
} from 'gl-mat4';

export const transformPointByMat4 = (out: vec4, p: vec3, m: mat4): vec4 => {
  const col1 = Vec4(m[0], m[4], m[8] , m[12]);
  const col2 = Vec4(m[1], m[5], m[9] , m[13]);
  const col3 = Vec4(m[2], m[6], m[10], m[14]);
  const col4 = Vec4(m[3], m[7], m[11], m[15]);

  const in_ = Vec4(p[0], p[1], p[2], 1);
  out[0] = dot4(in_, col1);
  out[1] = dot4(in_, col2);
  out[2] = dot4(in_, col3);
  out[3] = dot4(in_, col4);
  return out;
};

// TODO this should take 'out' as 1st arg. Fix in gl-utils, compiler will mark other spots
export const createModelMatrix = (pos: vec3, rotation: quat | mat4, scale: vec3) => {
  let rotationMoveMat = Mat4();

  if (rotation.length === 4) { // if is quat, not mat4
    fromRotationTranslation(rotationMoveMat, rotation, pos);
  } else {
    const moveMat = Mat4();
    fromTranslation(moveMat, pos);
    multiply(rotationMoveMat, moveMat, rotation);
  }

  const scaleMat = fromScaling(Mat4(), scale);

  return multiply(Mat4(), rotationMoveMat, scaleMat);
};

export const getMVP = (m: mat4, v: mat4, p: mat4) => {
  const vp = getVP(v, p);
  return multiply(Mat4(), vp, m);
};

export const getMV = (m: mat4, v: mat4) => {
  return multiply(Mat4(), v, m);
};

export const getVP = (v: mat4, p: mat4) => {
  return multiply(Mat4(), p, v);
};
