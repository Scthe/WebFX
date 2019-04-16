import {vec3, fromValues as Vec3, copy as copyV3} from 'gl-vec3';
import {quat, create as Quat, copy as copyQuat} from 'gl-quat';
import {createModelMatrix} from 'gl-utils';

export interface Transform {
  position: vec3;
  rotation: quat;
  scale: vec3;
}

export const createInitTransform = (): Transform => ({
  position: Vec3(0, 0, 0),
  rotation: Quat(),
  scale: Vec3(1, 1, 1),
});

export const TRANSFORM_0 = createInitTransform();
Object.freeze(TRANSFORM_0);

// NOTE: we can't freeze TypedArrays, cause they can be slices
export const POSITION_0 = TRANSFORM_0.position;
export const ROTATION_0 = TRANSFORM_0.rotation;
export const SCALE_0 = TRANSFORM_0.scale;

/// OPS:

export const convertTransformToMatrix = (transform: Transform) => {
  const {position, rotation, scale} = transform;
  return createModelMatrix(position, rotation, scale);
};

export const copyTransform = (target: Transform, source: Transform) => {
  copyV3(target.position, source.position);
  copyQuat(target.rotation, source.rotation);
  copyV3(target.scale, source.scale);
};

export const resetTransform = (transform: Transform) => {
  copyTransform(transform, TRANSFORM_0);
};
