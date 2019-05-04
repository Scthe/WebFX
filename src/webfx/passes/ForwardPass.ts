import {mat4} from 'gl-mat4';
import {scale as scaleV3, vec3} from 'gl-vec3';
import {setUniforms, sphericalToCartesian} from 'gl-utils';
import {DrawParams, DepthTest, CullingMode, StencilOperation} from 'gl-utils/DrawParams';

import {LightCfg} from 'Config';
import {FboBindType} from 'resources';
import {PassExecuteParams} from './structs';
import {MaterialComponent, TransformComponent, MeshComponent} from 'ecs';


const FLAG_IS_METALIC = 1;
const FLAG_USE_SPECULAR_TEXTURE = 2;
const FLAG_USE_HAIR_SHADOW_TEXTURE = 4;


interface ForwardPassData {
  getLightShadowMvp: (modelMat: mat4) => mat4;
  getSSS_VP: () => mat4;
  shadowLightPosition: vec3;
  sssPosition: vec3;
}


export class ForwardPass {

  execute (params: PassExecuteParams, passData: ForwardPassData) {
    const {cfg, device, frameRes, camera, ecs} = params;
    const {gl} = device;

    const shader = frameRes.meshShader;
    shader.use(gl);

    const fbo = frameRes.forwardFbo;
    fbo.bind(gl, FboBindType.Draw, true);
    gl.viewport(0.0, 0.0, fbo.dimensions[0], fbo.dimensions[1]);

    // prepare for clear - reset all write masks etc.
    const dpClearAll = new DrawParams();
    device.setState(dpClearAll);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);

    const dp = new DrawParams();
    dp.depth.test = DepthTest.IfLessOrEqual;
    dp.culling = CullingMode.None;
    dp.stencil.referenceValue = cfg.stencilConsts.skin;
    dp.stencil.writeBytes = cfg.stencilConsts.skin;
    dp.stencil.front.opPass = StencilOperation.Replace;
    dp.stencil.back.opPass = StencilOperation.Replace;
    device.setState(dp);

    ecs.forEachEntity((_entityId, material, tfx, mesh) => {
      const modelMatrix = tfx.modelMatrix;

      setUniforms(device, shader, {
        'u_M': modelMatrix,
        'u_MVP': camera.getMVP(modelMatrix),
        'u_cameraPosition': camera.position,
        'u_viewport': fbo.dimensions,
        // ao:
        'u_aoTex': frameRes.ssaoTex,
        'u_aoStrength': cfg.ssao.aoStrength,
        'u_aoExp': cfg.ssao.aoExp,
        // shadows:
        'u_directionalShadowMatrix_MVP': passData.getLightShadowMvp(modelMatrix),
        'u_directionalShadowDepthTex': frameRes.shadowDepthTex,
        'u_maxShadowContribution': cfg.shadows.strength,
        'u_directionalShadowSampleRadius': Math.floor(cfg.shadows.blurRadius),
        'u_directionalShadowCasterPosition': Float32Array.from([
          passData.shadowLightPosition[0],
          passData.shadowLightPosition[1],
          passData.shadowLightPosition[2],
          cfg.shadows.bias * (cfg.shadows.usePCSS ? -1 : 1),
        ]),
        // material:
        'u_albedoTexture': material.albedoTex,
        'u_specularTexture': material.specularTex ? material.specularTex : material.albedoTex, // may be ignored using flags
        'u_hairShadowTexture': material.hairShadowTex ? material.hairShadowTex : material.albedoTex, // may be ignored using flags
        'u_specular': material.specular,
        'u_specularMul': material.specularMul,
        'u_materialFlags': this.createMaterialFlags(material),
        'u_sssTransluency': material.sssTransluency,
        'u_sssWidth': material.sssWidth,
        'u_sssBias': material.sssBias,
        'u_sssGain': material.sssGain,
        'u_sssStrength': material.sssStrength,
        'u_sssFarPlane': cfg.shadows.directionalLight.projection.far,  // both shadows and SSS reuse this
        'u_sssDepthTex': frameRes.sssDepthTex,
        'u_sssPosition': passData.sssPosition,
        'u_sssMatrix_VP': passData.getSSS_VP(),
        // lights:
        'u_lightAmbient': Float32Array.from([
          cfg.lightAmbient.color[0],
          cfg.lightAmbient.color[1],
          cfg.lightAmbient.color[2],
          cfg.lightAmbient.energy,
        ]),
        ...ForwardPass.lightUniforms('light0', cfg.light0),
        ...ForwardPass.lightUniforms('light1', cfg.light1),
        ...ForwardPass.lightUniforms('light2', cfg.light2),
      }, true);

      device.renderMesh(mesh);
    }, MaterialComponent, TransformComponent, MeshComponent);
  }

  private createMaterialFlags (material: MaterialComponent) {
    let flags = 0;
    const addFlag = (cond: boolean, bit: number) => {
      flags |= cond ? bit : 0;
    };

    addFlag(material.isMetallic, FLAG_IS_METALIC);
    addFlag(Boolean(material.specularTex), FLAG_USE_SPECULAR_TEXTURE);
    addFlag(Boolean(material.hairShadowTex), FLAG_USE_HAIR_SHADOW_TEXTURE);

    return flags;
  }

  public static lightUniforms (prefix: string, lightCfg: LightCfg) {
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
