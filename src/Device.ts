import {mat4} from 'gl-mat4';
import {vec3} from 'gl-vec3';
import {fromValues as Vec2} from 'gl-vec2';

import {Dimensions, setUniforms} from 'gl-utils';
import {DrawParams, applyDrawParams, DepthTest} from 'gl-utils/DrawParams';
import {TextureBindingState, Shader} from 'resources';
import {MeshComponent, TfxComponent} from 'ecs';
import { generateSphere, createGpuShape } from 'gl-utils/shapes';


interface TfxRenderParams {
  mvp: mat4;
  cameraPosition: vec3;
  viewport: Dimensions;
}


export class Device {

  private drawParams = new DrawParams();
  private readonly backbufferFboId: any;
  private readonly debugSphereMesh: MeshComponent;
  private readonly _surfaceSize: Dimensions;
  public readonly textureBindingState: TextureBindingState;

  constructor (
    public readonly gl: Webgl,
  ) {
    this.backbufferFboId = gl.getParameter(gl.FRAMEBUFFER_BINDING);
    applyDrawParams(gl, this.drawParams, null, true);

    this._surfaceSize = { width: 0, height: 0, };
    this.debugSphereMesh = this.createDebugSphere(gl);

    this.textureBindingState = new TextureBindingState(gl);
  }

  private createDebugSphere (gl: Webgl): MeshComponent {
    const ballShape = generateSphere({
      radius: 1.0,
      segments: 12,
      rings: 12,
    });

    return createGpuShape(gl, ballShape, 'position');
  }

  setState (newState: DrawParams): void {
    // TODO add viewport and blends
    const gl = this.gl;
    applyDrawParams(gl, newState, this.drawParams);
    this.drawParams = newState;
  }

  setBackbufferAsRenderTarget () {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.backbufferFboId);
    // gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, this.backbufferFboId);
    gl.drawBuffers([gl.BACK]);
  }

  renderMesh = (mesh: MeshComponent) => {
    const gl = this.gl;
    const {
      vao,
      indices: {indexGlType, indexBuffer, triangleCnt}
    } = mesh;

    vao.bind(gl);
    indexBuffer.bind(gl);
    gl.drawElements(gl.TRIANGLES, triangleCnt * 3, indexGlType, 0);
  }

  renderTressFx = (tfx: TfxComponent, shader: Shader, params: TfxRenderParams) => {
    const gl = this.gl;

    setUniforms(this, shader, {
      'u_MVP': params.mvp,
      'u_cameraPosition': params.cameraPosition,
      'u_viewportSize': Vec2(params.viewport.width, params.viewport.height),
      'u_numVerticesPerStrand': tfx.numVerticesPerStrand,
      'u_vertexPositionsBuffer': tfx.positionsTexture,
      'u_fiberRadius': 0.2,
      'u_thinTip': 0.5,
    }, false);

    // const totalVertices = this.tfxComponent.totalVertices;
    // gl.drawArrays(gl.TRIANGLES, 0, totalVertices);

    const {indexGlType, indexBuffer, triangleCnt} = tfx.indices;
    indexBuffer.bind(gl);
    gl.drawElements(gl.TRIANGLES, triangleCnt * 3, indexGlType, 0);
  }

  renderFullscreenQuad (autoSetDrawParams = true): void {
    const gl = this.gl;

    if (autoSetDrawParams) {
      const dp = new DrawParams();
      dp.depth.test = DepthTest.AlwaysPass;
      this.setState(dp);
    }

    // we don't have to bind anything. Or rather, we use what was bound prevoiusly.
    // Wonder if it's stanadarized?
    const triCnt = 1;
    gl.drawArrays(gl.TRIANGLES, 0, triCnt * 3);
  }

  renderDebugSphere () {
    this.renderMesh(this.debugSphereMesh);
  }

  set surfaceSize (d: Dimensions) {
    this._surfaceSize.width = d.width;
    this._surfaceSize.height = d.height;
  }

  get surfaceSize (): Dimensions {
    return this._surfaceSize;
  }

}
