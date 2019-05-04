import {create as Mat4, invert} from 'gl-mat4';
import {create as Vec3, normalize, scale} from 'gl-vec3';
import {fromValues as Vec2} from 'gl-vec2';
import {setUniforms, lerp} from 'gl-utils';

import {FboBindType} from 'resources';
import {PassExecuteParams} from './structs';


const generateKernelSamples = (kernelSize: number) => {
  const data = new Float32Array(kernelSize * 3);
  const tmp = Vec3();

  for (let i = 0; i < kernelSize; i++) {
    tmp[0] = Math.random() * 2 - 1;
    tmp[1] = Math.random() * 2 - 1;
    tmp[2] = Math.random(); // HEMIsphere, not full sphere
    normalize(tmp, tmp);

    // ATM points lie on edge of sphere, randomize then inside
    // scale(tmp, tmp, Math.random()); // lineary distributed
    let scaleFac = i / kernelSize;
    scaleFac = lerp(0.1, 1.0, scaleFac * scaleFac);
    scale(tmp, tmp, scaleFac);

    data[i * 3    ] = tmp[0];
    data[i * 3 + 1] = tmp[1];
    data[i * 3 + 2] = tmp[2];
  }

  return data;
};


export class SSAOPass {

  public static MAX_KERNEL_VALUES = 256;
  private static kernelValues: Float32Array;

  private static lazyInitKernelValues () {
    if (!SSAOPass.kernelValues) {
      SSAOPass.kernelValues = generateKernelSamples(SSAOPass.MAX_KERNEL_VALUES);
    }
  }

  constructor() {
    SSAOPass.lazyInitKernelValues();
  }

  execute (params: PassExecuteParams) {
    const {cfg, device, frameRes, camera} = params;
    const {gl} = device;

    const fbo = frameRes.ssaoFbo;
    fbo.bind(gl, FboBindType.Draw, true);
    gl.viewport(0.0, 0.0, fbo.dimensions[0], fbo.dimensions[1]);

    const shader = frameRes.ssaoShader;
    shader.use(gl);

    const depthTex = frameRes.forwardDepthTex;
    const rngTex = frameRes.ssaoRngTex;

    setUniforms(device, shader, {
      'u_sceneDepthTex': depthTex,
      'u_normalTex': frameRes.forwardNormalsTex,
      'u_noiseTex': frameRes.ssaoRngTex,
      'u_noiseScale': Vec2(
        fbo.dimensions[0] / rngTex.dimensions[0],
        fbo.dimensions[1] / rngTex.dimensions[1]
      ),
      'u_invProjectionMat': invert(Mat4(), camera.projectionMatrix),
      'u_viewMat': camera.viewMatrix,
      'u_projection': camera.projectionMatrix,
      'u_kernelSize': cfg.ssao.kernelSize,
      'u_radius': cfg.ssao.radius,
      'u_bias': cfg.ssao.bias,
    }, true);

    const kernelUni = shader.getUniform('u_kernel[0]');
    if (!kernelUni) { throw 'SSAO could not find \'u_kernel[0]\' uniform'; }
    gl.uniform3fv(kernelUni.location, SSAOPass.kernelValues);

    device.renderFullscreenQuad(true);
  }

}
