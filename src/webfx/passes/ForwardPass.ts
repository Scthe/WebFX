import {mat4, create as Mat4} from 'gl-mat4';
import {scale as scaleV3, vec3} from 'gl-vec3';
import {setUniforms, sphericalToCartesian} from 'gl-utils';
import {DrawParams, DepthTest, CullingMode} from 'gl-utils/DrawParams';

import {LightCfg} from 'Config';
import {FboBindType} from 'resources';
import {PassExecuteParams} from './structs';
import {MaterialComponent, TransformComponent, MeshComponent} from 'ecs';


interface ForwardPassData {
  getLightShadowMvp: (modelMat: mat4) => mat4;
  getSSS_VP: () => mat4,
  shadowLightPosition: vec3;
  sssPosition: vec3;
}


export class ForwardPass {

  execute (params: PassExecuteParams, passData: ForwardPassData) {
    const {cfg, device, frameRes, viewport, camera, ecs} = params;
    const {gl} = device;

    const shader = frameRes.meshShader;
    shader.use(gl);

    const dp = new DrawParams();
    dp.depth.test = DepthTest.IfLessOrEqual;
    dp.culling = CullingMode.None;
    device.setState(dp);

    frameRes.forwardFbo.bind(gl, FboBindType.Draw, true);
    gl.viewport(0.0, 0.0, viewport.width, viewport.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    ecs.forEachEntity((_entityId, material, tfx, mesh) => {
      const modelMatrix = tfx.modelMatrix;

      setUniforms(device, shader, {
        'u_M': modelMatrix,
        'u_MVP': camera.getMVP(modelMatrix),
        'u_cameraPosition': camera.position,
        // shadows:
        'u_directionalShadowMatrix_MVP': passData.getLightShadowMvp(modelMatrix),
        'u_directionalShadowDepthTex': frameRes.shadowDepthTex,
        'u_maxShadowContribution': cfg.shadows.strength,
        'u_directionalShadowCasterPosition': Float32Array.from([
          passData.shadowLightPosition[0],
          passData.shadowLightPosition[1],
          passData.shadowLightPosition[2],
          cfg.shadows.bias * (cfg.shadows.usePCSS ? -1 : 1),
        ]),
        'u_directionalShadowSampleRadius': Math.floor(cfg.shadows.blurRadius),
        // material:
        'u_albedoTexture': material.albedoTex,
        'u_sssTransluency': material.sssTransluency,
        'u_sssWidth': material.sssWidth,
        'u_sssBias': material.sssBias,
        'u_sssGain': material.sssGain,
        'u_sssStrength': material.sssStrength,
        'u_sssFarPlane': cfg.shadows.directionalLight.projection.far,  // both shadows and SSS reuse this
        'u_sssDepthTex': frameRes.sssDepthTex,
        'u_sssPosition': passData.sssPosition,
        'u_sssMatrix_VP': passData.getSSS_VP(),
        'u_sssLightColor': cfg.lightSSS.color,
        // 'u_fresnelExponent': material.fresnelExponent,
        // 'u_fresnelMultiplier': material.fresnelMultiplier,
        // 'u_fresnelColor': arrayToVec3(material.fresnelColor, true),
        // 'u_ssColor1': arrayToVec3(material.ssColor1, true),
        // 'u_ssColor2': arrayToVec3(material.ssColor2, true),
        // lights:
        u_lightAmbient: Float32Array.from([
          cfg.lightAmbient.color[0],
          cfg.lightAmbient.color[1],
          cfg.lightAmbient.color[2],
          cfg.lightAmbient.energy,
        ]),
        ...this.lightUniforms('light0', cfg.light0),
        ...this.lightUniforms('light1', cfg.light1),
        ...this.lightUniforms('light2', cfg.light2),
      }, false);

      device.renderMesh(mesh);
    }, MaterialComponent, TransformComponent, MeshComponent);
  }

  private lightUniforms (prefix: string, lightCfg: LightCfg) {
    const pos = sphericalToCartesian(lightCfg.posPhi, lightCfg.posTheta, true);
    scaleV3(pos, pos, lightCfg.posRadius);

    return {
      [`u_${prefix}_Position`]: pos, // vec3
      [`u_${prefix}_Color`]: Float32Array.from([
        lightCfg.color[0],
        lightCfg.color[1],
        lightCfg.color[2],
        lightCfg.energy,
      ]),
    };
  }

}
