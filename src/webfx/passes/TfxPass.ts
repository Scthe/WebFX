import {vec3} from 'gl-vec3';
import {mat4, create as Mat4} from 'gl-mat4';
import {DrawParams, DepthTest, CullingMode, StencilOperation} from 'gl-utils/DrawParams';
import {setUniforms} from 'gl-utils';

import {FboBindType} from 'resources';
import {PassExecuteParams} from './structs';
import {TransformComponent, TfxComponent} from 'ecs';
import {ForwardPass} from '.';

interface TfxPassData {
  getLightShadowMvp: (modelMat: mat4) => mat4;
  shadowLightPosition: vec3;
}


export class TfxPass {

  execute (params: PassExecuteParams, passData: TfxPassData) {
    const {cfg, device, frameRes, camera, ecs} = params;
    const {gl} = device;

    const shader = frameRes.tfxShader;
    shader.use(gl);

    const dp = new DrawParams();
    dp.depth.test = DepthTest.IfLessOrEqual;
    dp.culling = CullingMode.None;
    dp.stencil.referenceValue = cfg.stencilConsts.hair;
    dp.stencil.writeBytes = cfg.stencilConsts.hair;
    dp.stencil.front.opPass = StencilOperation.Replace;
    dp.stencil.back.opPass = StencilOperation.Replace;
    device.setState(dp);

    const fbo = frameRes.forwardFbo;
    fbo.bind(gl, FboBindType.Draw, true);
    gl.viewport(0.0, 0.0, fbo.dimensions[0], fbo.dimensions[1]);

    const shadowVP = passData.getLightShadowMvp(Mat4());

    ecs.forEachEntity((_entityId, tfx, transform) => {
      setUniforms(device, shader, {
        // NOTE: see Device class for rest of uniforms - not all are required for just rendering
        'u_displayMode': tfx.displayMode,
        // material:
        'u_albedo': tfx.material.albedo,
        'u_specularColor1': tfx.material.specularColor1,
        'u_specularColor2': tfx.material.specularColor2,
        'u_primaryShift': tfx.material.primaryShift,
        'u_secondaryShift': tfx.material.secondaryShift,
        'u_specularPower1': tfx.material.specularPower1,
        'u_specularPower2': tfx.material.specularPower2,
        'u_specularStrength1': tfx.material.specularStrength1,
        'u_specularStrength2': tfx.material.specularStrength2,
        // ao:
        'u_aoTex': frameRes.ssaoTex,
        'u_aoStrength': tfx.material.aoStrength,
        'u_aoExp': tfx.material.aoExp,
        // shadows:
        'u_directionalShadowMatrix_VP': shadowVP,
        'u_directionalShadowDepthTex': frameRes.shadowDepthTex,
        'u_maxShadowContribution': cfg.shadows.strength,
        'u_directionalShadowSampleRadius': Math.floor(cfg.shadows.blurRadiusTfx),
        'u_directionalShadowCasterPosition': Float32Array.from([
          passData.shadowLightPosition[0],
          passData.shadowLightPosition[1],
          passData.shadowLightPosition[2],
          cfg.shadows.biasHairTfx * (cfg.shadows.usePCSS ? -1 : 1),
        ]),
        // lights:
        'u_lightAmbient': Float32Array.from([
          cfg.lightAmbient.color[0],
          cfg.lightAmbient.color[1],
          cfg.lightAmbient.color[2],
          // cfg.lightAmbient.energy,
          0.0, // TODO restore
        ]),
        ...ForwardPass.lightUniforms('light0', cfg.light0),
        ...ForwardPass.lightUniforms('light1', cfg.light1),
        ...ForwardPass.lightUniforms('light2', cfg.light2),
      }, true);

      device.renderTressFx(tfx, shader, {
        modelMat: transform.modelMatrix,
        viewProjectionMat: camera.viewProjectionMatrix,
        cameraPosition: camera.position,
        viewport: { width: fbo.dimensions[0], height: fbo.dimensions[1] },
        cfg,
        radiusMultiplier: 1.0,
      });
    }, TfxComponent, TransformComponent);
  }

}
