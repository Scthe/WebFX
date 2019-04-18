import {mat4} from 'gl-mat4';
import {copy as copyV3} from 'gl-vec3';
import {copy as copyV2} from 'gl-vec2';
import {createWebGl2Context, Dimensions, getMVP} from 'gl-utils';

import {Config} from 'Config';
import {Device} from 'Device';
import {
  Ecs,
  FpsController, CameraComponent
} from 'ecs';

import {ResizeSystem} from 'ResizeSystem';
import {InputSystem} from 'InputSystem';
import {TimingSystem} from 'TimingSystem';
import {StatsSystem} from 'StatsSystem';
import {UISystem} from 'UISystem';
import {initializeScene, FrameResources} from 'webfx';
import {
  PassExecuteParams,
  ShadowPass,
  ForwardPass,
  FinalPass,
  TonemappingPass,
} from 'webfx/passes';


interface GlobalVariables {
  gl: Webgl;
  config: Config;
  canvas: HTMLCanvasElement;
  ecs: Ecs;
  resizeSystem: ResizeSystem;
  device: Device;
  camera: {
    controller: FpsController,
    camera: CameraComponent,
  };
  inputSystem: InputSystem;
  timingSystem: TimingSystem;
  statsSystem: StatsSystem;
  uISystem: UISystem;
  frameResources: FrameResources;
}


const initialize = async (): Promise<GlobalVariables> => {
  const globals: Partial<GlobalVariables> = {};

  globals.config = new Config();
  const cfg = globals.config;

  // initialize Webgl2
  globals.canvas = document.getElementById('viewport-canvas') as HTMLCanvasElement;
  globals.gl = createWebGl2Context(globals.canvas, {
    alpha: false,
    antialias: false,
    depth: true,
    failIfMajorPerformanceCaveat: true,
    powerPreference: 'high-performance',
    stencil: true,
  }, [
    'EXT_color_buffer_float',
    'OES_texture_float_linear',
  ]);
  globals.gl.clearDepth(cfg.clearDepth);
  globals.device = new Device(globals.gl);

  globals.ecs = new Ecs();
  globals.timingSystem = new TimingSystem();
  globals.frameResources = new FrameResources();
  globals.frameResources.initialize(globals.config, globals.device);

  // screen/window resize handle
  globals.resizeSystem = new ResizeSystem(globals.gl, cfg.resizeUpdateFreq);
  globals.resizeSystem.addHandler((d: Dimensions) => {
    globals.camera.camera.updateProjectionMatrix(d.width, d.height);
    globals.frameResources.onResize(globals.device, d);
    globals.device.surfaceSize = d;
  });

  // camera
  globals.camera = {
    controller: new FpsController(),
    camera: new CameraComponent(globals.config.camera.settings),
  };
  copyV3(globals.camera.controller.position, cfg.camera.position);
  copyV2(globals.camera.controller.angles, cfg.camera.rotation);
  globals.inputSystem = new InputSystem(globals.canvas, globals.camera.controller);

  //
  await initializeScene(
    globals.ecs, globals.config,
    globals.gl, globals.device.textureBindingState
  );

  // misc
  globals.statsSystem = new StatsSystem();
  globals.uISystem = new UISystem(cfg);
  globals.uISystem.initialize(globals.ecs);

  //
  globals.resizeSystem.forceRecalc();

  return globals as GlobalVariables;
};



const createRenderParams = (globals: GlobalVariables): PassExecuteParams => {
  const {controller, camera} = globals.camera;
  return {
    cfg: globals.config,
    device: globals.device,
    ecs: globals.ecs,
    frameRes: globals.frameResources,
    viewport: globals.device.surfaceSize,
    camera: {
      getMVP: (modelMatrix: mat4) => getMVP(
        modelMatrix,
        controller.viewMatrix,
        camera.perspectiveMatrix
      ),
      position: controller.position,
    }
  };
};

const renderScene = (globals: GlobalVariables) => {
  const params = createRenderParams(globals);

  const clearColor = globals.config.clearColor;
  globals.gl.clearColor(clearColor[0], clearColor[1], clearColor[2], 1.0);

  const shadowPass = new ShadowPass();
  shadowPass.execute(params);

  const forwardPass = new ForwardPass();
  forwardPass.execute(params, {
    getLightShadowMvp: (modelMat: mat4) => shadowPass.getLightShadowMvp(globals.config, modelMat),
    shadowDepthTexture: globals.frameResources.shadowDepthTex,
  });

  // const drawParams = createWebFxDrawParams(globals);
  // globals.webfx.beginScene(drawParams);
  // globals.webfx.renderMeshes(drawParams);
  // globals.webfx.renderHair(drawParams);


  const tonemappingPass = new TonemappingPass();
  tonemappingPass.execute(params);

  const finalPass = new FinalPass();
  finalPass.execute(params);
};


const runMain = (globals: GlobalVariables) => (timeMs: number = 0) => {
  globals.statsSystem.frameBegin();

  globals.timingSystem.update(timeMs);
  const {frameTimings} = globals.timingSystem;

  globals.inputSystem.update(frameTimings.deltaTimeMs);

  renderScene(globals);

  // TODO move this at the beginning of the frame,
  // but this would always schedule, so can't crash nicely
  requestAnimationFrame(runMain(globals));

  globals.statsSystem.frameEnd();
};


initialize()
  .then(globals => {
    console.log('--- Init done ---');
    runMain(globals)();
  });


if (module.hot) {
  /*
  module.hot.accept('./scene', () => {
    const {ecs, gl} = GLOBALS;
    const sceneObjects = ecs.getAllIds({
      includes: [ComponentType.SceneObjectTag],
    });
    ecs.removeAll(sceneObjects, gl);
    createScene(GLOBALS);
  });
  */

  /*
  // Hot reload debugging:
  module.hot.addStatusHandler(status => {
    console.log(`Status handler:`, status);
    if (status === 'ready') {
      module.hot.apply({
        onAccepted: (info: any) => {
          console.log(info);
        }
      } as any);
    }
  });
  */
}
