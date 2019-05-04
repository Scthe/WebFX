import {fromValues as Vec2} from 'gl-vec2';
import {Texture, FboBindType, Fbo} from 'resources';
import {setUniforms} from 'gl-utils';
import {DrawParams, DepthTest, CullingMode} from 'gl-utils/DrawParams';
import {PassExecuteParams} from './structs';


interface BlurPassData {
  fbo: Fbo;
  sourceTexture: Texture;
  depthTexture: Texture; // for depth-aware blur
  isFirstPass: boolean;
}

const DIRECTION_HORIZONTAL = Vec2(1, 0);
const DIRECTION_VERTICAL = Vec2(0, 1);


/** Blurs to the same texture. Uses intermediate ping-pong buffer */
export class BlurPass {

  constructor(
    private readonly blurRadius: number,
    private readonly gaussSigma: number,
    private readonly blurMaxDepthDistance: number,
  ) { }

  execute (params: PassExecuteParams, data: BlurPassData) {
    const {device, frameRes} = params;
    const {gl} = device;
    const {fbo, isFirstPass} = data;

    const shader = frameRes.blurShader;
    shader.use(gl);

    const dp = new DrawParams();
    dp.depth.write = false;
    dp.depth.test = DepthTest.AlwaysPass;
    dp.culling = CullingMode.None;
    device.setState(dp);

    fbo.bind(gl, FboBindType.Draw, true);
    gl.viewport(0.0, 0.0, fbo.dimensions[0], fbo.dimensions[1]);
    if (isFirstPass) {
      gl.clear(gl.COLOR_BUFFER_BIT); // clear last frame ping-pong texture. prob. not needed, will override anyway
    }

    setUniforms(device, shader, {
      'u_sourceTex': data.sourceTexture,
      'u_linearDepthTex': data.depthTexture,
      'u_direction': this.getDirection(isFirstPass),
      'u_blurRadius': this.blurRadius,
      'u_gaussSigma': this.gaussSigma,
      'u_depthMaxDist': this.blurMaxDepthDistance,
    }, true);

    device.renderFullscreenQuad();
  }

  private getDirection(isFirstPass: boolean) {
    return isFirstPass ? DIRECTION_HORIZONTAL : DIRECTION_VERTICAL;
  }

}
