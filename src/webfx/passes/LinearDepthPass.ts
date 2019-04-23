import {fromValues as Vec2} from 'gl-vec2';
import {setUniforms} from 'gl-utils';

import {FboBindType} from 'resources';
import {PassExecuteParams} from './structs';

export class LinearDepthPass {

  execute (params: PassExecuteParams) {
    const {device, frameRes, camera} = params;
    const {gl} = device;

    const fbo = frameRes.linearDepthFbo;
    fbo.bind(gl, FboBindType.Draw, true);
    gl.viewport(0.0, 0.0, fbo.dimensions[0], fbo.dimensions[1]);

    const shader = frameRes.linearDepthShader;
    shader.use(gl);

    setUniforms(device, shader, {
      'u_depthPerspTex': frameRes.forwardDepthTex,
      'u_nearAndFar': Vec2(camera.settings.zNear, camera.settings.zFar),
    }, true);

    device.renderFullscreenQuad(true);
  }

}
