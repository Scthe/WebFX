import {fromValues as Vec2} from 'gl-vec2';
import {vec3, fromValues as Vec3, scale} from 'gl-vec3';
import {hexToVec3, sphericalToCartesian, arrayToVec3} from 'gl-utils';


export interface LightCfg {
  posPhi: number; // horizontal [dgr]
  posTheta: number; // verical [dgr]
  posRadius: number;
  color: vec3;
  energy: number;
}


export class Config {

  // 43a7a9
  public readonly clearColor: vec3 = hexToVec3('#a0a0a0');
  public readonly clearDepth: number = 1.0;
  public readonly resizeUpdateFreq: number = 1000; // ms

  // public readonly gamma = 2.2;


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


  // <editor-fold> SHADOWS
  public readonly shadows = {
    shadowmapSize: 1024,
    usePCSS: false,
    blurRadius: 4, // in pixels
    bias: 0.050,
    strength: 0.2,
    directionalLight: {
      posPhi: 140, // horizontal [dgr]
      posTheta: 45, // verical [dgr]
      posRadius: 10, // verify with projection box below!!!
      target: Vec3(0, 0, 0),
      projection: {
        left: -10, right: 10,
        top: 10, bottom: -10,
        near: 0.1, far: 20,
      },
    },
  };

  /** Convert spherical->cartesian */
  public getLightShadowPosition() {
    const sph = this.shadows.directionalLight;
    const pos = sphericalToCartesian(sph.posPhi, sph.posTheta, true);
    return scale(pos, pos, sph.posRadius);
  }
  // </editor-fold> // END: SHADOWS


  // <editor-fold> LIGHTS
  public readonly lightAmbient = {
    color: hexToVec3('#a0a0a0'),
    energy: 0.15,
  };
  public readonly light0 = {
    posPhi: 125, // horizontal [dgr]
    posTheta: 45, // verical [dgr]
    posRadius: 10,
    color: arrayToVec3([214, 197, 208], true), // hexToVec3('#cacaca'),
    energy: 1.0,
  };
  public readonly light1 = {
    posPhi: 45, // horizontal [dgr]
    posTheta: 82, // verical [dgr]
    posRadius: 10,
    color: arrayToVec3([214, 166, 166], true), // hexToVec3('#a0a0a0'),
    energy: 0.80,
  };
  public readonly light2 = {
    posPhi: -105, // horizontal [dgr]
    posTheta: 55, // verical [dgr]
    posRadius: 10,
    color: arrayToVec3([133, 171, 169], true),
    energy: 0.55,
  };
  // </editor-fold> // END: LIGHTS


  // <editor-fold> SINTEL
  public readonly sintel = {
    fresnelExponent: 18, // 11.8,
    fresnelMultiplier: 12, // 17.5,
    fresnelColor: Vec3(0.57, 0.105, 0.218),
    ssColor1: Vec3(0.146, 0.53, 0.178),
    ssColor2: Vec3(0.685, 0.273, 0.158),
    modelScale: 0.1,
  };
  // </editor-fold> // END: SINTEL

}
