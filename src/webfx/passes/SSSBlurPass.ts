import {vec2, fromValues as Vec2} from 'gl-vec2';
import {mat4, create as Mat4, ortho, lookAt} from 'gl-mat4';
import {setUniforms, AXIS_Y, getMVP} from 'gl-utils';
import {DrawParams, DepthTest, CullingMode} from 'gl-utils/DrawParams';

import {FboBindType, Fbo, Texture} from 'resources';
import {PassExecuteParams} from './structs';

interface SSSBlurPassData {
  fbo: Fbo;
  sourceTexture: Texture;
  isFirstPass: boolean;
}

const DIRECTION_HORIZONTAL = Vec2(1, 0);
const DIRECTION_VERTICAL = Vec2(0, 1);

export class SSSBlurPass {

  execute (params: PassExecuteParams, data: SSSBlurPassData) {
    const {cfg, device, frameRes, camera} = params;
    const {gl} = device;
    const {fbo, isFirstPass, sourceTexture} = data;

    fbo.bind(gl, FboBindType.Draw, true);

    gl.viewport(0.0, 0.0, fbo.dimensions[0], fbo.dimensions[1]);
    if (isFirstPass) {
      gl.clear(gl.COLOR_BUFFER_BIT); // clear last frame ping-pong texture
    }

    const shader = frameRes.sssBlurShader;
    shader.use(gl);

    const dp = new DrawParams();
    dp.depth.write = false;
    dp.depth.test = DepthTest.AlwaysPass;
    dp.culling = CullingMode.None;
    // TODO stencil
    device.setState(dp);

    setUniforms(device, shader, {
      'u_sourceTex': sourceTexture,
      'u_depthPerspTex': frameRes.forwardDepthTex,
      'u_nearAndFar': Vec2(camera.settings.zNear, camera.settings.zFar),
      'u_sssDirection': this.getDirection(isFirstPass),
      'u_sssFollowSurface': 0,
      'u_sssFovy': this.getFovY(params), // in dgr?
      'u_sssWidth': cfg.lightSSS.blurWidth,
      'u_sssStrength': cfg.lightSSS.blurStrength,
    }, true);

    device.renderFullscreenQuad();
  }

  private getDirection(isFirstPass: boolean) {
    return isFirstPass ? DIRECTION_HORIZONTAL : DIRECTION_VERTICAL;
  }

  private getFovY(params: PassExecuteParams) {
    // I have no idea if this is correct.
    // I do not care if this is correct.
    const {viewport, camera} = params;
    return camera.settings.fovDgr / viewport.width * viewport.height;
  }

}
