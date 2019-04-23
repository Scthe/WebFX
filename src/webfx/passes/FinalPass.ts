import {fromValues as Vec2} from 'gl-vec2';
import {create as Mat4} from 'gl-mat4';
import {setUniforms, hexToVec3} from 'gl-utils';
import {DrawParams, DepthTest, CullingMode} from 'gl-utils/DrawParams';
import {PassExecuteParams} from './structs';


export class FinalPass {

  execute (params: PassExecuteParams) {
    const {cfg, device, frameRes, viewport} = params;
    const {gl} = device;

    const shader = frameRes.finalShader;
    shader.use(gl);

    const dp = new DrawParams();
    dp.depth.test = DepthTest.AlwaysPass;
    dp.depth.write = false;
    dp.culling = CullingMode.None;
    device.setState(dp);

    device.setBackbufferAsRenderTarget();
    gl.viewport(0.0, 0.0, viewport.width, viewport.height);

    setUniforms(device, shader, {
      'u_viewport': Vec2(viewport.width, viewport.height),
      // textures:
      'u_tonemapped': frameRes.tonemappingResultTex,
      'u_gamma': cfg.postfx.gamma,
      // fxaa
      'u_subpixel': cfg.postfx.subpixel,
      'u_edgeThreshold': cfg.postfx.useFxaa ? cfg.postfx.edgeThreshold : 0.0,
      'u_edgeThresholdMin': cfg.postfx.edgeThresholdMin,
    }, true);

    device.renderFullscreenQuad();

    if (cfg.showDebugPositions) {
      this.debugPositions(params);
    }

    if (cfg.shadows.showDebugView) {
      this.debugShadowDepths(params);
    }
  }

  private debugShadowDepths (params: PassExecuteParams) {
    const {device, frameRes, viewport} = params;
    const {gl} = device;
    const MAX_WIDTH = 200, PADDING = 5;
    const dbgSingleViewDim = Math.floor(Math.min(viewport.width / 3, MAX_WIDTH));

    const shader = frameRes.dbgShadowsShader;
    shader.use(gl);

    const dp = new DrawParams();
    dp.depth.test = DepthTest.AlwaysPass;
    dp.depth.write = false;
    dp.culling = CullingMode.None;
    device.setState(dp);

    const depthTex = [
      frameRes.shadowDepthTex,
      frameRes.sssDepthTex,
    ];

    depthTex.forEach((tex, i) => {
      gl.viewport(
        i * dbgSingleViewDim + i * PADDING, 0,
        dbgSingleViewDim, dbgSingleViewDim
      );

      setUniforms(device, shader, {
        'u_depthTex': tex,
      }, true);

      device.renderFullscreenQuad(true);
    });
  }

  private debugPositions (params: PassExecuteParams) {
    const {cfg, device, frameRes, camera} = params;
    const {gl} = device;

    const shader = frameRes.dbgSphereShader;
    shader.use(gl);

    const dp = new DrawParams();
    dp.depth.test = DepthTest.AlwaysPass;
    dp.depth.write = false;
    dp.culling = CullingMode.None;
    device.setState(dp);

    const spheres = [
      {position: cfg.sphericalToCartesian(cfg.light0), color: cfg.light0.color},
      {position: cfg.sphericalToCartesian(cfg.light1), color: cfg.light1.color},
      {position: cfg.sphericalToCartesian(cfg.light2), color: cfg.light2.color},
      {position: cfg.sphericalToCartesian(cfg.shadows.directionalLight), color: hexToVec3('#404040')},
      {position: cfg.sphericalToCartesian(cfg.lightSSS), color: hexToVec3('#de875d')},
    ];

    const vp = camera.getMVP(Mat4());

    spheres.forEach(sphereDef => {
      setUniforms(device, shader, {
        'u_position': sphereDef.position,
        'u_scale': 1.0,
        'u_color': sphereDef.color,
        'u_VP': vp,
      }, true);

      device.renderDebugSphere();
    });
  }

}
