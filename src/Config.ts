import {fromValues as Vec2} from 'gl-vec2';
import {vec3, fromValues as Vec3} from 'gl-vec3';
import {hexToVec3} from 'gl-utils';

export class Config {

  public readonly clearColor: vec3 = hexToVec3('#555056');
  public readonly clearDepth: number = 1.0;
  public readonly resizeUpdateFreq: number = 1000; // ms

  public readonly sintelScale = 0.1;

  // <editor-fold> CAMERA
  public readonly camera = {
    position: Vec3(0, 2.5, 5),
    rotation: Vec2(0, 0), // radians
    settings: {
      fovDgr: 75,
      zNear: 0.1,
      zFar: 100,
    },
  };
  // </editor-fold> // END: CAMERA

}
