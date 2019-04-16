import {mat4, create as Mat4, ortho, lookAt, scale} from 'gl-mat4';
import {fromValues as Vec3} from 'gl-vec3';
import {setUniforms, AXIS_Y, getMVP} from 'gl-utils';
import {DrawParams, DepthTest, CullingMode} from 'gl-utils/DrawParams';

import {FboBindType} from 'resources';
import {Config} from 'Config';
import {PassExecuteParams} from './structs';


export class ShadowPass {

  execute (params: PassExecuteParams) {
    const {cfg, device, webFx, frameRes} = params;
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

    const modelMatrix = this.getModelMatrix(cfg);
    setUniforms(device, shader, {
      'u_MVP': this.getLightShadowMvp(cfg, modelMatrix),
    }, true);

    webFx.objects.forEach(obj => {
      device.renderMesh(obj.mesh);
    });
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

  private getModelMatrix(cfg: Config) {
    const s = cfg.sintelScale;
    return scale(Mat4(), Mat4(), Vec3(s, s, s));
  }

}
