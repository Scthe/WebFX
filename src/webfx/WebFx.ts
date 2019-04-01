import {mat4, create as Mat4, scale} from 'gl-mat4';
import {fromValues as Vec3} from 'gl-vec3';
import {Dimensions, setUniforms} from 'gl-utils';
import {DrawParams, DepthTest, CullingMode} from 'gl-utils/DrawParams';
import {Shader} from 'resources';
import {Config} from 'Config';
import {Device} from 'Device';
import {MeshComponent} from 'components';


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


export class WebFx {
  constructor(
    private readonly meshes: MeshComponent[],
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

    setUniforms(device, this.meshShader, {
      'u_M': modelMatrix,
      'u_MVP': camera.getMVP(modelMatrix),
      // 'u_viewport': Vec2(viewport.width, viewport.height),
      // 'u_cameraPosition': camera.position,
      // 'u_ambientLight': Float32Array.from([...cfg.lighting.ambientCol, cfg.lighting.ambientStr]),
      // 'u_tiles': Int32Array.from([
        // cfg.tiles.tileSizeX, cfg.tiles.tileSizeY,
        // tilesCount[0], tilesCount[1]
      // ]),
    }, true);

    this.meshes.forEach(device.renderMesh);
  }

  private getModelMatrix(cfg: Config) {
    const s = cfg.sintelScale;
    return scale(Mat4(), Mat4(), Vec3(s, s, s));
  }

}
