import {Dimensions} from 'gl-utils';
import {DrawParams, applyDrawParams, DepthTest} from 'gl-utils/DrawParams';
import {TextureBindingState} from 'resources';
import {MeshComponent} from 'components';


export class Device {

  private drawParams = new DrawParams();
  private readonly backbufferFboId: any;
  private readonly _surfaceSize: Dimensions;
  public readonly textureBindingState: TextureBindingState;

  constructor (
    public readonly gl: Webgl,
  ) {
    this.backbufferFboId = gl.getParameter(gl.FRAMEBUFFER_BINDING);
    applyDrawParams(gl, this.drawParams, null, true);

    this._surfaceSize = { width: 0, height: 0, };

    this.textureBindingState = new TextureBindingState(gl);
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

  set surfaceSize (d: Dimensions) {
    this._surfaceSize.width = d.width;
    this._surfaceSize.height = d.height;
  }

  get surfaceSize (): Dimensions {
    return this._surfaceSize;
  }

}
