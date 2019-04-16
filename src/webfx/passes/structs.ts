import {mat4} from 'gl-mat4';
import {vec3} from 'gl-vec3';

import {Config} from 'Config';
import {Device} from 'Device';
import {WebFx} from 'webfx';
import {FrameResources} from '../FrameResources';
import { Dimensions } from 'gl-utils';

export interface FrameCamera {
  position: vec3;
  // viewMatrix: mat4;
  // projectionMatrix: mat4;
  // viewProjectionMatrix: mat4;
  getMVP: (modelMatrix: mat4) => mat4;
}

export interface PassExecuteParams {
  cfg: Config;
  device: Device;
  webFx: WebFx;
  frameRes: FrameResources;
  viewport: Dimensions;
  camera: FrameCamera;
}
