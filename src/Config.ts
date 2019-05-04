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

interface SphericalToCarthesian {
  posPhi: number;
  posTheta: number;
  posRadius: number;
}


const SHADOWS_ORTHO_SIZE = 5;


export class Config {

  public readonly clearColor: vec3 = hexToVec3('#5d5d5d'); // [43a7a9, a0a0a0] // TODO final value
  public readonly clearDepth: number = 1.0;
  public readonly clearStencil: number = 0;
  public readonly resizeUpdateFreq: number = 1000; // ms
  public readonly showDebugPositions = false;
  public readonly useMSAA = true; // ok, technically it's brute force supersampling, but who cares?
  public readonly displayMode: number = 0; // debug display mode, see UISystem for modes


  public readonly stencilConsts = {
    skin: 1 << 0,
    hair: 1 << 1,
  };

  /** Convert spherical->cartesian */
  public sphericalToCartesian(sphericalCoords: SphericalToCarthesian) {
    const pos = sphericalToCartesian(sphericalCoords.posPhi, sphericalCoords.posTheta, true);
    return scale(pos, pos, sphericalCoords.posRadius);
  }

  // <editor-fold> CAMERA
  public readonly camera = {
    position: Vec3(0, 2.5, 5),
    // position: Vec3(0, 3.5, 2), // closeup on hair
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
    shadowmapSize: 1024 * 2,
    usePCSS: false,
    blurRadius: 4, // in pixels
    bias: 0.005,
    blurRadiusTfx: 1, // in pixels
    biasHairTfx: 0.050,
    hairTfxRadiusMultipler: 1.1,
    strength: 0.7,
    directionalLight: {
      posPhi: 105, // horizontal [dgr]
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
  public readonly lightSSS = {
    // forward scatter
    depthmapSize: 1024,
    posPhi: -93, // horizontal [dgr]
    posTheta: 55, // verical [dgr]
    posRadius: SHADOWS_ORTHO_SIZE,
    // SSS blur pass
    blurWidth: 25.0,
    blurStrength: 0.35,
    blurFollowSurface: false, // slight changes for incident angles ~90dgr
    // will reuse target & projection settings from shadows - safer this way..
  };
  // </editor-fold> // END: LIGHTS


  // <editor-fold> SSAO
  public readonly ssao = {
    textureSizeMul: 0.5, // half/quater-res, wrt. MSAA
    kernelSize: 64,
    radius: 0.5,
    bias: 0.025,
    blurRadius: 7.0,
    blurGaussSigma: 3.0,
    blurMaxDepthDistance: 0.06,
    aoStrength: 0.3, // only meshes
    aoExp: 3, // only meshes
  };
  // </editor-fold> // END: SSAO


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
    centerOfGravity: Vec3(0, 3.0, 0), // used for calulating hair normals (remember, no cards!)
  };
  // </editor-fold> // END: SINTEL

}
