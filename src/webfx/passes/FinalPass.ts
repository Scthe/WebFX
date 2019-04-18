import {fromValues as Vec2} from 'gl-vec2';
import {setUniforms} from 'gl-utils';
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

    if (cfg.shadows.showDebugView) {
      this.debugShadowDepths(params);
    }
  }

  private debugShadowDepths (params: PassExecuteParams) {
    const {device, frameRes, viewport} = params;
    const {gl} = device;
    const MAX_WIDTH = 200;
    const dims = Math.floor(Math.min(viewport.width, MAX_WIDTH));

    const shader = frameRes.dbgShadowsShader;
    shader.use(gl);

    gl.viewport(
      0, 0, // x, y
      dims, dims // w,h
    );

    setUniforms(device, shader, {
      'u_depthTex': frameRes.shadowDepthTex,
    }, true);

    device.renderFullscreenQuad();
  }

}
