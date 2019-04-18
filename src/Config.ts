import {fromValues as Vec2} from 'gl-vec2';
import {vec3, fromValues as Vec3, scale} from 'gl-vec3';
import {hexToVec3, sphericalToCartesian, arrayToVec3} from 'gl-utils';
import {TonemappingMode} from 'webfx/passes/TonemappingPass';


export interface LightCfg {
  posPhi: number; // horizontal [dgr]
  posTheta: number; // verical [dgr]
  posRadius: number;
  color: vec3;
  energy: number;
}

export interface ColorGradingProp {
  color: vec3;
  value: number;
}
const createColorGradingProp = (color: vec3, value: number) =>
  ({ color, value });

export interface ColorGradingPerRangeSettings {
  saturation: ColorGradingProp;
  contrast: ColorGradingProp;
  gamma: ColorGradingProp;
  gain: ColorGradingProp;
  offset: ColorGradingProp;
}


const SHADOWS_ORTHO_SIZE = 5;


export class Config {

  public readonly clearColor: vec3 = hexToVec3('#a0a0a0'); // 43a7a9 // TODO final value
  public readonly clearDepth: number = 1.0;
  public readonly resizeUpdateFreq: number = 1000; // ms


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
      posRadius: SHADOWS_ORTHO_SIZE, // verify with projection box below!!!
      target: Vec3(0, 2, 0),
      projection: {
        left: -SHADOWS_ORTHO_SIZE, right: SHADOWS_ORTHO_SIZE,
        top: SHADOWS_ORTHO_SIZE, bottom: -SHADOWS_ORTHO_SIZE,
        near: 0.1, far: 20,
      },
    },
    showDebugView: false,
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
    energy: 0.02,
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


  // <editor-fold> POSTFX
  public readonly postfx = {
    gamma: 2.2,
    // tonemapping
    tonemappingOp: TonemappingMode.ACES_UE4, // TODO
    exposure: 1.0, // or calc automatically?
    whitePoint: 1.0,
    acesC: 0.8,
    acesS: 1.0,
    // fxaa
    useFxaa: true,
    subpixel: 0.75,
    edgeThreshold: 0.125,
    edgeThresholdMin: 0.0625,
    // color grading
    // @see https://docs.unrealengine.com/en-us/Engine/Rendering/PostProcessEffects/ColorGrading
    colorGrading: {
      global: {
        saturation: createColorGradingProp(Vec3(1, 1, 1), 1),
        contrast: createColorGradingProp(Vec3(1, 1, 1), 1),
        gamma: createColorGradingProp(Vec3(1, 1, 1), 1),
        gain: createColorGradingProp(Vec3(1, 1, 1), 1),
        offset: createColorGradingProp(Vec3(0, 0, 0), 0),
        // tint: createColorGradingProp(Vec3(0, 0, 0), 0),
      },
      shadows: {
        saturation: createColorGradingProp(Vec3(1, 1, 1), 1),
        contrast: createColorGradingProp(Vec3(1, 1, 1), 1),
        gamma: createColorGradingProp(Vec3(1, 1, 1), 1),
        gain: createColorGradingProp(Vec3(1, 1, 1), 1),
        offset: createColorGradingProp(Vec3(0, 0, 0), 0),
        shadowsMax: 0.09,
      },
      midtones: {
        saturation: createColorGradingProp(Vec3(1, 1, 1), 1),
        contrast: createColorGradingProp(Vec3(1, 1, 1), 1),
        gamma: createColorGradingProp(Vec3(1, 1, 1), 1),
        gain: createColorGradingProp(Vec3(1, 1, 1), 1),
        offset: createColorGradingProp(Vec3(0, 0, 0), 0),
      },
      highlights: {
        saturation: createColorGradingProp(Vec3(1, 1, 1), 1),
        contrast: createColorGradingProp(Vec3(1, 1, 1), 1),
        gamma: createColorGradingProp(Vec3(1, 1, 1), 1),
        gain: createColorGradingProp(Vec3(1, 1, 1), 1),
        offset: createColorGradingProp(Vec3(0, 0, 0), 0),
        highlightsMin: 0.5,
      },
    },
  };
  // </editor-fold> // END: POSTFX


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
