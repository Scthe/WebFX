import {DrawParams, DepthTest, CullingMode, StencilOperation} from 'gl-utils/DrawParams';

import {FboBindType} from 'resources';
import {PassExecuteParams} from './structs';
import {TransformComponent, TfxComponent} from 'ecs';
import {setUniforms} from 'gl-utils';


export class TfxPass {

  execute (params: PassExecuteParams) {
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

    ecs.forEachEntity((_entityId, tfx, transform) => {
      setUniforms(device, shader, {
        'u_displayMode': tfx.displayMode,
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
