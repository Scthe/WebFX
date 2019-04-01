import {mat4, create as Mat4, scale} from 'gl-mat4';
import {fromValues as Vec3} from 'gl-vec3';
import {Dimensions, setUniforms} from 'gl-utils';
import {DrawParams, DepthTest, CullingMode} from 'gl-utils/DrawParams';
import {Shader} from 'resources';
import {Config} from 'Config';
import {Device} from 'Device';
import {MeshComponent, MaterialComponent} from 'components';


export interface FrameCamera {
  // position: vec3;
  // viewMatrix: mat4;
  // projectionMatrix: mat4;
  // viewProjectionMatrix: mat4;
  getMVP: (modelMatrix: mat4) => mat4;
}

export interface WebFxDrawParams {
  gl: Webgl;
  device: Device;
  cfg: Config;
  viewport: Dimensions;
  camera: FrameCamera;
}

interface Object3d {
  mesh: MeshComponent;
  material: MaterialComponent;
}


export class WebFx {
  constructor(
    private readonly objects: Object3d[],
    private readonly meshShader: Shader,
  ) {}

  beginScene(params: WebFxDrawParams) {
    const {gl, viewport} = params;
    gl.viewport(0.0, 0.0, viewport.width, viewport.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  }

  renderMeshes (params: WebFxDrawParams) {
    const {gl, device, cfg, camera} = params;

    const dp = new DrawParams();
    dp.depth.test = DepthTest.IfLessOrEqual;
    dp.culling = CullingMode.None;
    device.setState(dp);

    this.meshShader.use(gl);

    const modelMatrix = this.getModelMatrix(cfg);

    this.objects.forEach(obj => {
      setUniforms(device, this.meshShader, {
        'u_M': modelMatrix,
        'u_MVP': camera.getMVP(modelMatrix),
        'u_albedoTexture': obj.material.albedoTex,
      }, true);

      device.renderMesh(obj.mesh);
    });
  }

  private getModelMatrix(cfg: Config) {
    const s = cfg.sintelScale;
    return scale(Mat4(), Mat4(), Vec3(s, s, s));
  }

}
