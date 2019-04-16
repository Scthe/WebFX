import {mat4, create as Mat4, scale} from 'gl-mat4';
import {vec3, fromValues as Vec3} from 'gl-vec3';
import {fromValues as Vec2} from 'gl-vec2';
import get from 'lodash-es/get';

import {Dimensions, setUniforms, arrayToVec3} from 'gl-utils';
import {DrawParams, DepthTest, CullingMode} from 'gl-utils/DrawParams';
import {Shader} from 'resources';
import {Config} from 'Config';
import {Device} from 'Device';
import {MeshComponent, MaterialComponent, TfxComponent} from 'components';


export enum MaterialModel { Sintel = 0, SintelEyes = 1 }

interface FrameCamera {
  position: vec3;
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
    public readonly objects: Object3d[],
    private readonly meshShader: Shader,
    private readonly tfxComponent: TfxComponent,
    private readonly tfxShader: Shader,
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
        'u_cameraPosition': camera.position,
        'u_gamma': 2.2,
        // skin:
        'u_albedoTexture': obj.material.albedoTex,
        'u_fresnelExponent': obj.material.fresnelExponent,
        'u_fresnelMultiplier': obj.material.fresnelMultiplier,
        'u_fresnelColor': arrayToVec3(obj.material.fresnelColor, true),
        'u_ssColor1': arrayToVec3(obj.material.ssColor1, true),
        'u_ssColor2': arrayToVec3(obj.material.ssColor2, true),
      }, false);

      device.renderMesh(obj.mesh);
    });
  }

  renderHair (params: WebFxDrawParams) {
    const {gl, device, cfg, camera, viewport} = params;

    const dp = new DrawParams();
    dp.depth.test = DepthTest.IfLess;
    dp.culling = CullingMode.None;
    device.setState(dp);

    this.tfxShader.use(gl);

    const modelMatrix = this.getModelMatrix(cfg);

    device.renderTressFx(this.tfxComponent, this.tfxShader, {
      mvp: camera.getMVP(modelMatrix),
      cameraPosition: camera.position,
      viewport,
    });
  }

  private getModelMatrix(cfg: Config) {
    const s = cfg.sintelScale;
    return scale(Mat4(), Mat4(), Vec3(s, s, s));
  }

  public getMaterial (mat: MaterialModel) {
    return get(this.objects[mat], 'material');
  }

}
