import {fromValues as Vec4} from 'gl-vec4';
import {setUniforms} from 'gl-utils';
import {PassExecuteParams} from './structs';
import {FboBindType} from 'resources';
import {ColorGradingPerRangeSettings, ColorGradingProp} from 'Config';


export enum TonemappingMode {
  Linear = 0, Reinhard = 1, Uncharted2 = 2, Photographic = 3, ACES_UE4 = 4,
}
type TonemappingModeKey = keyof typeof TonemappingMode;
export const TonemappingModesList = [
  'Linear', 'Reinhard', 'Uncharted2', 'Photographic', 'ACES_UE4'
] as TonemappingModeKey[];


/**
 * FXAA needs data after tonemapping, so we need separate pass
 * - tonemapping
 * - color grading - LUTs do not work on HDR displays,
 *                   so industry moved to film-like color grading tools
 *                   (https://docs.unrealengine.com/en-us/Engine/Rendering/PostProcessEffects/ColorGrading)
 */
export class TonemappingPass {

  execute (params: PassExecuteParams) {
    const {cfg, device, frameRes, viewport} = params;
    const {gl} = device;

    const shader = frameRes.tonemappingShader;
    shader.use(gl);

    frameRes.tonemappingFbo.bind(gl, FboBindType.Draw, true);
    gl.viewport(0.0, 0.0, viewport.width, viewport.height);

    const colorGradCfg = cfg.postfx.colorGrading;

    setUniforms(device, shader, {
      'u_source': frameRes.forwardColorTex,
      'u_gamma': cfg.postfx.gamma, // needed for luma, not actuall gamm (this will be after AA)
      // color grading
      ...this.prepareColorGradingParams('', colorGradCfg.global),
      ...this.prepareColorGradingParams('Shadows', colorGradCfg.shadows),
      ...this.prepareColorGradingParams('Midtones', colorGradCfg.midtones),
      ...this.prepareColorGradingParams('Highlights', colorGradCfg.highlights),
      'u_colorCorrectionShadowsMax': colorGradCfg.shadows.shadowsMax,
      'u_colorCorrectionHighlightsMin': colorGradCfg.highlights.highlightsMin,
      // tonemapping
      'u_exposure': cfg.postfx.exposure,
      'u_whitePoint': cfg.postfx.whitePoint,
      'u_tonemappingMode': cfg.postfx.tonemappingOp,
      'u_acesC': cfg.postfx.acesC,
      'u_acesS': cfg.postfx.acesS,
    }, true);

    device.renderFullscreenQuad();
  }

  private prepareColorGradingParams(uSufix: string, obj: ColorGradingPerRangeSettings) {
    const toVec4 = (cgp: ColorGradingProp) => Vec4(
      cgp.color[0], cgp.color[1], cgp.color[2], cgp.value
    );
    return {
      [`u_colorSaturation${uSufix}`]: toVec4(obj.saturation),
      [`u_colorContrast${uSufix}`]: toVec4(obj.contrast),
      [`u_colorGamma${uSufix}`]: toVec4(obj.gamma),
      [`u_colorGain${uSufix}`]: toVec4(obj.gain),
      [`u_colorOffset${uSufix}`]: toVec4(obj.offset),
    };
  }

}
