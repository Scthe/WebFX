import {mat4, create as Mat4, ortho, lookAt} from 'gl-mat4';
import {setUniforms, AXIS_Y, getMVP} from 'gl-utils';
import {DrawParams, DepthTest, CullingMode} from 'gl-utils/DrawParams';

import {FboBindType} from 'resources';
import {Config} from 'Config';
import {PassExecuteParams} from './structs';
import { MaterialComponent, TransformComponent, MeshComponent } from 'ecs';


export class ShadowPass {

  execute (params: PassExecuteParams) {
    const {cfg, device, ecs, frameRes} = params;
    const {shadows: shadowsCfg} = cfg;
    const {gl} = device;

    frameRes.shadowDepthFbo.bind(gl, FboBindType.Draw, true);

    gl.clear(gl.DEPTH_BUFFER_BIT);
    gl.viewport(0.0, 0.0, shadowsCfg.shadowmapSize, shadowsCfg.shadowmapSize);

    const shader = frameRes.shadowShader;
    shader.use(gl);

    const dp = new DrawParams();
    dp.depth.write = true; // most important line
    dp.depth.test = DepthTest.IfLessOrEqual;
    dp.culling = CullingMode.None; // see https://docs.microsoft.com/en-us/windows/desktop/DxTechArts/common-techniques-to-improve-shadow-depth-maps#back-face-and-front-face
    dp.colorWrite = [false, false, false, false]; // no RT anyway, just skip PS, pretty please!
    device.setState(dp);

    ecs.forEachEntity((_entityId, _material, tfx, mesh) => {
      const modelMatrix = tfx.modelMatrix;

      setUniforms(device, shader, {
        'u_MVP': this.getLightShadowMvp(cfg, modelMatrix),
      }, true);

      device.renderMesh(mesh);
    }, MaterialComponent, TransformComponent, MeshComponent);
  }

  public getLightShadowMvp = (cfg: Config, modelMatrix: mat4) => {
    const vMat = this.getDepthViewMatrix(cfg);
    const pMat = this.getDepthProjectionMatrix(cfg);
    return getMVP(modelMatrix, vMat, pMat);
  }

  private getDepthViewMatrix(cfg: Config) {
    const dl = cfg.shadows.directionalLight;
    const pos = cfg.getLightShadowPosition();
    return lookAt(Mat4(), pos, dl.target, AXIS_Y);
  }

  private getDepthProjectionMatrix(cfg: Config) {
    // this is for directional light, all rays are parallel
    const dpm = cfg.shadows.directionalLight.projection;
    return ortho(Mat4(),
      dpm.left, dpm.right,
      dpm.bottom, dpm.top,
      dpm.near, dpm.far
    );
  }

}
