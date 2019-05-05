import {GUI} from 'dat.gui';
import {Config, LightCfg, ColorGradingProp, ColorGradingPerRangeSettings} from 'Config';
import {MaterialComponent, Ecs, TfxComponent} from 'ecs';
import {ENTITY_SINTEL, ENTITY_SINTEL_EYES, ENTITY_TRESSFX} from 'webfx';
import {TonemappingModesList, TonemappingMode} from 'webfx/passes/TonemappingPass';
import {SSAOPass} from 'webfx/passes';

interface UiOpts<T> {
  label: string;
  value: T;
}

const createDummy = <V extends Object, K extends keyof V>(
  obj: V, key: K, opts: UiOpts<V[K]>[]
) => {
  const dummy = {
    values: opts.map(o => o.label),
  };

  Object.defineProperty(dummy, key, {
    enumerable: true,
    get: () => {
      const v = obj[key];
      const opt = opts.find(e => e.value === v) || opts[0];
      return opt.label;
    },
    set: (selectedLabel: string) => {
      const opt = opts.find(e => e.label === selectedLabel) || opts[0];
      obj[key] = opt.value;
    },
  });

  return dummy;
};


interface ColorGradingUIOpts {
  tint?: boolean;
  shadowMax?: boolean;
  highlightsMin?: boolean;
}

type MSAAListener = () => void;


export class UISystem {

  private gui: GUI;

  constructor (
    private readonly cfg: Config,
  ) { }

  initialize (ecs: Ecs, msaaListener: MSAAListener) {
    this.gui = new GUI();
    const colorGrading = this.cfg.postfx.colorGrading;

    // github
    const ghDummy = {
      openGithub: () => {
        window.location.href = this.cfg.githubRepoLink;
      }
    };
    this.gui.add(ghDummy, 'openGithub').name('GITHUB');

    // display mode
    const displayModeDummy = createDummy(this.cfg, 'displayMode', [
      { label: 'Final', value: 0, },
      { label: 'Linear Depth', value: 1, },
      { label: 'Normals', value: 2, },
      { label: 'SSAO', value: 3, },
    ]);
    this.gui.add(displayModeDummy, 'displayMode', displayModeDummy.values).name('Display mode');
    // other general stuff
    this.addColorController(this.gui, this.cfg, 'clearColor', 'Bg color');
    this.gui.add(this.cfg, 'showDebugPositions').name('Show positions');
    this.gui.add(this.cfg, 'useMSAA').name('Use MSAA').onFinishChange(msaaListener);

    this.addMaterialFolder(this.gui, ecs, 'Sintel', ENTITY_SINTEL);
    this.addMaterialFolder(this.gui, ecs, 'Sintel_eyes', ENTITY_SINTEL_EYES);
    this.addSSS_General(this.gui);
    this.addTfxFolder(this.gui, ecs, 'TressFX Hair', ENTITY_TRESSFX);
    this.addAmbientLightFolder(this.gui);
    this.addLightFolder(this.gui, this.cfg.light0, 'Light 0');
    this.addLightFolder(this.gui, this.cfg.light1, 'Light 1');
    this.addLightFolder(this.gui, this.cfg.light2, 'Light 2');
    this.addShadowsFolder(this.gui);
    this.addSSAO(this.gui);
    this.addPostFx(this.gui);
    this.addColorGrading(this.gui, colorGrading.global, 'Color grading - general', {tint: true});
    this.addColorGrading(this.gui, colorGrading.shadows, 'Color grading - shadows', {shadowMax: true});
    this.addColorGrading(this.gui, colorGrading.midtones, 'Color grading - midtones', {});
    this.addColorGrading(this.gui, colorGrading.highlights, 'Color grading - highlights', {highlightsMin: true});
    this.addFxaa(this.gui);
  }

  private addMaterialFolder (gui: GUI, ecs: Ecs, folderName: string, entityName: string) {
    const entity = ecs.getByName(entityName);
    if (entity === undefined) { throw `Did not found entity '${entityName}'`; }
    const mat = ecs.getComponent(entity, MaterialComponent);

    const dir = gui.addFolder(folderName);
    // dir.open();

    if (!mat.specularTex) {
      // may be easier to understand this than pbr's 'roughness' (microfacets etc.)
      dir.add(mat, 'specular', 0.0, 1.0, 0.01).name('Specular');
    }
    dir.add(mat, 'specularMul', 0.0, 6.0, 0.1).name('Specular mul');

    dir.add(mat, 'sssTransluency', 0.0, 1.0).name('SSS transluency');
    dir.add(mat, 'sssWidth', 0, 100).name('SSS width');
    dir.add(mat, 'sssBias', 0.0, 0.1).name('SSS bias');
    dir.add(mat, 'sssGain', 0.0, 1.0).name('SSS gain');
    dir.add(mat, 'sssStrength', 0.0, 10.0).name('SSS strength');
  }

  private addSSS_General (gui: GUI) {
    const dir = gui.addFolder('SSS general / blur');
    // dir.open();

    dir.add(this.cfg.lightSSS, 'posPhi', -179, 179).step(1).name('Position phi');
    dir.add(this.cfg.lightSSS, 'posTheta', 15, 165).step(1).name('Position th');
    dir.add(this.cfg.lightSSS, 'blurWidth', 1, 100).name('Blur width');
    dir.add(this.cfg.lightSSS, 'blurStrength', 0.0, 1.0).name('Blur strength');
    dir.add(this.cfg.lightSSS, 'blurFollowSurface').name('Blur follow surface');
  }

  private addTfxFolder (gui: GUI, ecs: Ecs, folderName: string, entityName: string) {
    const entity = ecs.getByName(entityName);
    if (entity === undefined) { throw `Did not found entity '${entityName}'`; }
    const tfxComp = ecs.getComponent(entity, TfxComponent);

    const dir = gui.addFolder(folderName);
    // dir.open();

    const displayModeDummy = createDummy(tfxComp, 'displayMode', [
      { label: 'Final', value: 0, },
      { label: 'Flat', value: 1, },
      { label: 'Follow gr.', value: 2, },
      { label: 'Root-tip %', value: 3, },
      { label: 'Shadow', value: 4, },
    ]);
    dir.add(displayModeDummy, 'displayMode', displayModeDummy.values).name('Display mode');
    dir.add(tfxComp, 'fiberRadius', 0.001, 0.015).name('Radius');
    dir.add(tfxComp, 'thinTip', 0.0, 1.0, 0.01).name('Thin tip');
    dir.add(tfxComp, 'followHairs', 1, TfxComponent.MAX_FOLLOW_HAIRS_PER_GUIDE, 1).name('Follow hairs');
    dir.add(tfxComp, 'followHairSpreadRoot', 0.0, 0.4).name('Spread root');
    dir.add(tfxComp, 'followHairSpreadTip',  0.0, 0.4).name('Spread tip');

    // material
    const matRanges = { maxSpec: 500.0, minShift: -0.1, maxShift: 0.1, dShift: 0.001 };
    const mat = tfxComp.material;
    this.addColorController(dir, mat, 'albedo', 'Diffuse');

    this.addColorController(dir, mat, 'specularColor1', 'Spec 1');
    dir.add(mat, 'specularPower1',  0.0, matRanges.maxSpec).name('Spec exp 1');
    dir.add(mat, 'specularStrength1',  0.0, 1.0).name('Spec str 1');
    dir.add(mat, 'primaryShift',  matRanges.minShift, matRanges.maxShift, matRanges.dShift).name('Spec shift 1');

    this.addColorController(dir, mat, 'specularColor2', 'Spec 2');
    dir.add(mat, 'specularPower2',  0.0, matRanges.maxSpec).name('Spec exp 2');
    dir.add(mat, 'specularStrength2',  0.0, 1.0).name('Spec str 2');
    dir.add(mat, 'secondaryShift',  matRanges.minShift, matRanges.maxShift, matRanges.dShift).name('Spec shift 2');

    dir.add(mat, 'aoStrength', 0, 1, 0.01).name('AO strength');
    dir.add(mat, 'aoExp', 0, 5, 0.1).name('AO exp');
  }

  private addShadowsFolder (gui: GUI) {
    const dir = gui.addFolder('Shadows');
    // dir.open();

    dir.add(this.cfg.shadows, 'showDebugView').name('Show dbg');
    const techniqueDummy = createDummy(this.cfg.shadows, 'usePCSS', [
      { label: 'PCF', value: false, },
      { label: 'PCSS', value: true, },
    ]);
    dir.add(techniqueDummy, 'usePCSS', techniqueDummy.values).name('Technique');
    dir.add(this.cfg.shadows, 'strength', 0.0, 1.0).name('Strength');
    dir.add(this.cfg.shadows, 'blurRadius', [0, 1, 2, 3, 4]).name('Blur radius');
    dir.add(this.cfg.shadows, 'bias', 0.001, 0.01).name('Bias');
    dir.add(this.cfg.shadows, 'blurRadiusTfx', [0, 1, 2, 3, 4]).name('HAIR Blur radius');
    dir.add(this.cfg.shadows, 'biasHairTfx', 0.001, 0.01).name('HAIR Bias');
    dir.add(this.cfg.shadows, 'hairTfxRadiusMultipler', 0.5, 3.0).name('HAIR Radius mul');

    dir.add(this.cfg.shadows.directionalLight, 'posPhi', -179, 179).step(1).name('Position phi');
    dir.add(this.cfg.shadows.directionalLight, 'posTheta', 15, 165).step(1).name('Position th');
    // dir.add(this.cfg.shadows.directionalLight, 'posRadius', 1, 10).step(0.1).name('Position r');
  }

  private addAmbientLightFolder (gui: GUI) {
    const dir = gui.addFolder('Ambient light');
    // dir.open();

    this.addColorController(dir, this.cfg.lightAmbient, 'color', 'Color');
    dir.add(this.cfg.lightAmbient, 'energy', 0.0, 0.2, 0.01).name('Energy');
  }

  private addLightFolder (gui: GUI, lightObj: LightCfg, name: string) {
    const dir = gui.addFolder(name);
    // dir.open();

    dir.add(lightObj, 'posPhi', -179, 179).step(1).name('Position phi');
    dir.add(lightObj, 'posTheta', 15, 165).step(1).name('Position th');
    dir.add(lightObj, 'posRadius', 0.0, 10.0).name('Position r');
    this.addColorController(dir, lightObj, 'color', 'Color');
    dir.add(lightObj, 'energy', 0.0, 2.0).name('Energy');
  }

  private addSSAO(gui: GUI) {
    const dir = gui.addFolder('SSAO');
    // dir.open();

    const ssaoCfg = this.cfg.ssao;
    dir.add(ssaoCfg, 'kernelSize', 1, SSAOPass.MAX_KERNEL_VALUES, 1).name('Kernel size');
    dir.add(ssaoCfg, 'radius', 0.1, 3.0).name('Radius');
    dir.add(ssaoCfg, 'bias', 0.0, 0.1).name('Bias');
    dir.add(ssaoCfg, 'blurRadius', 0, 9, 1).name('Blur radius');
    dir.add(ssaoCfg, 'blurGaussSigma', 1.0, 6.0, 0.1).name('Blur gauss sigma');
    dir.add(ssaoCfg, 'blurMaxDepthDistance', 0.01, 0.4).name('Blur depth diff');
    dir.add(ssaoCfg, 'aoStrength', 0, 1, 0.01).name('AO strength');
    dir.add(ssaoCfg, 'aoExp', 0, 5, 0.1).name('AO exp');
  }

  private addPostFx (gui: GUI) {
    const dir = gui.addFolder('Post FX');
    // dir.open();

    // general
    dir.add(this.cfg.postfx, 'gamma', 1.0, 3.0).name('Gamma');
    dir.add(this.cfg.postfx, 'ditherStrength', 0.0, 2.0, 0.01).name('Dither');

    // tonemapping
    // just please, for the love of God and all that is holy use ACES
    const tonemapDummy = createDummy(
      this.cfg.postfx, 'tonemappingOp',
      TonemappingModesList.map(k => ({
        label: k, value: TonemappingMode[k]
      }))
    );
    dir.add(tonemapDummy, 'tonemappingOp', tonemapDummy.values).name('Tonemap op');
    dir.add(this.cfg.postfx, 'acesC', 0.5, 1.5).name('ACES C');
    dir.add(this.cfg.postfx, 'acesS', 0.0, 2.0).name('ACES S');
    dir.add(this.cfg.postfx, 'exposure', 0.5, 2.0).name('Exposure');
    dir.add(this.cfg.postfx, 'whitePoint', 0.5, 2.0).name('White point');
  }

  private addFxaa(gui: GUI) {
    const dir = gui.addFolder('FXAA');
    // dir.open();

    dir.add(this.cfg.postfx, 'useFxaa').name('Use FXAA');
    dir.add(this.cfg.postfx, 'subpixel', 0.0, 1.0).name('Subpixel aa');
    dir.add(this.cfg.postfx, 'edgeThreshold', 0.063, 0.333).name('Contrast Treshold');
    dir.add(this.cfg.postfx, 'edgeThresholdMin', 0.0, 0.0833).name('Edge Treshold');
  }

  private addColorGrading(
    gui: GUI, obj: ColorGradingPerRangeSettings, name: string, opts: ColorGradingUIOpts
  ) {
    const dir = gui.addFolder(name);
    // dir.open();

    this.addColorGradingProp(dir, obj.saturation, 'Saturation');
    this.addColorGradingProp(dir, obj.contrast, 'Contrast');
    this.addColorGradingProp(dir, obj.gamma, 'Gamma');
    this.addColorGradingProp(dir, obj.gain, 'Gain');
    this.addColorGradingProp(dir, obj.offset, 'Offset', -1, 1);

    if (opts.tint) {
      // this.addColorGradingProp(dir, (obj as any).tint, 'Tint');
    }
    if (opts.shadowMax) {
      dir.add(obj, 'shadowsMax', 0.0, 1.0).name('shadowsMax');
    }
    if (opts.highlightsMin) {
      dir.add(obj, 'highlightsMin', 0.0, 1.0).name('highlightsMin');
    }
  }

  private addColorGradingProp(
    dir: GUI, obj: ColorGradingProp, name: string,
    vMin: number = 0, vMax: number = 2
  ) {
    this.addColorController(dir, obj, 'color', `${name} color`);
    dir.add(obj, 'value', vMin, vMax, 0.01).name(name);
  }


  ////////
  // Utils
  ////////

  private addColorController<T extends object> (
    gui: GUI, obj: T, prop: keyof T, name: string
  ) {
    const dummy = {
      value: [] as number[],
    };

    Object.defineProperty(dummy, 'value', {
      enumerable: true,
      get: () => {
        const v = obj[prop] as any;
        return [v[0] * 255, v[1] * 255, v[2] * 255];
      },
      set: (v: number[]) => {
        const a = obj[prop] as any as number[];
        a[0] = v[0] / 255;
        a[1] = v[1] / 255;
        a[2] = v[2] / 255;
      },
    });

    gui.addColor(dummy, 'value').name(name);
  }
}
