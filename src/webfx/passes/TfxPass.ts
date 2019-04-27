import {vec3} from 'gl-vec3';
import {mat4, create as Mat4} from 'gl-mat4';
import {DrawParams, DepthTest, CullingMode, StencilOperation} from 'gl-utils/DrawParams';

import {FboBindType} from 'resources';
import {PassExecuteParams} from './structs';
import {TransformComponent, TfxComponent} from 'ecs';
import {setUniforms} from 'gl-utils';

interface TfxPassData {
  getLightShadowMvp: (modelMat: mat4) => mat4;
  shadowLightPosition: vec3;
}


export class TfxPass {

  execute (params: PassExecuteParams, passData: TfxPassData) {
    const {cfg, device, frameRes, viewport, camera, ecs} = params;
    const {gl} = device;

    const shader = frameRes.tfxShader;
    shader.use(gl);

    const dp = new DrawParams();
    dp.depth.test = DepthTest.IfLessOrEqual;
    dp.culling = CullingMode.None;
    dp.stencil.referenceValue = cfg.stencilConsts.hair;
    dp.stencil.writeBytes = cfg.stencilConsts.hair;
    dp.stencil.front.opPass = StencilOperation.Replace;
    dp.stencil.back.opPass = StencilOperation.Replace;
    device.setState(dp);

    const fbo = frameRes.forwardFbo;
    fbo.bind(gl, FboBindType.Draw, true);
    gl.viewport(0.0, 0.0, viewport.width, viewport.height);

    const shadowVP = passData.getLightShadowMvp(Mat4());

    ecs.forEachEntity((_entityId, tfx, transform) => {
      setUniforms(device, shader, {
        'u_displayMode': tfx.displayMode,
        // shadows:
        'u_directionalShadowMatrix_VP': shadowVP,
        'u_directionalShadowDepthTex': frameRes.shadowDepthTex,
        // 'u_maxShadowContribution': cfg.shadows.strength,
        'u_directionalShadowSampleRadius': Math.floor(cfg.shadows.blurRadiusTfx),
        'u_directionalShadowCasterPosition': Float32Array.from([
          passData.shadowLightPosition[0],
          passData.shadowLightPosition[1],
          passData.shadowLightPosition[2],
          cfg.shadows.biasHairTfx * (cfg.shadows.usePCSS ? -1 : 1),
        ]),
      }, true);

      device.renderTressFx(tfx, shader, {
        modelMat: transform.modelMatrix,
        viewProjectionMat: camera.viewProjectionMatrix,
        cameraPosition: camera.position,
        viewport,
      });
    }, TfxComponent, TransformComponent);
  }

}
