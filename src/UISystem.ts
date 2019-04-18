import {GUI} from 'dat.gui';
import {Config, LightCfg, ColorGradingProp, ColorGradingPerRangeSettings} from 'Config';
import {MaterialComponent, Ecs} from 'ecs';
import {ENTITY_SINTEL, ENTITY_SINTEL_EYES} from 'webfx';
import {TonemappingModesList, TonemappingMode} from 'webfx/passes/TonemappingPass';

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



export class UISystem {

  private gui: GUI;

  constructor (
    private readonly cfg: Config,
  ) { }

  initialize (ecs: Ecs) {
    this.gui = new GUI();
    const colorGrading = this.cfg.postfx.colorGrading;

    this.addColorController(this.gui, this.cfg, 'clearColor', 'Bg color');

    this.addMaterialFolder(this.gui, ecs, 'Sintel', ENTITY_SINTEL);
    this.addMaterialFolder(this.gui, ecs, 'Sintel_eyes', ENTITY_SINTEL_EYES);
    this.addAmbientLightFolder(this.gui);
    this.addLightFolder(this.gui, this.cfg.light0, 'Light 0');
    this.addLightFolder(this.gui, this.cfg.light1, 'Light 1');
    this.addLightFolder(this.gui, this.cfg.light2, 'Light 2');
    this.addShadowsFolder(this.gui);
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

    dir.add(mat, 'fresnelExponent', 0.0, 20.0).name('Fresnel exp');
    dir.add(mat, 'fresnelMultiplier', 0.0, 20.0).name('Fresnel mul');
    dir.addColor(mat, 'fresnelColor').name('Fresnel color');
    dir.addColor(mat, 'ssColor1').name('SSS color 1');
    dir.addColor(mat, 'ssColor2').name('SSS color 2');
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
    dir.add(this.cfg.shadows, 'bias', 0.01, 0.1).name('Bias');

    dir.add(this.cfg.shadows.directionalLight, 'posPhi', -179, 179).step(1).name('Position phi');
    dir.add(this.cfg.shadows.directionalLight, 'posTheta', 15, 85).step(1).name('Position th');
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
    dir.add(lightObj, 'posTheta', 15, 85).step(1).name('Position th');
    dir.add(lightObj, 'posRadius', 0.0, 10.0).name('Position r');
    this.addColorController(dir, lightObj, 'color', 'Color');
    dir.add(lightObj, 'energy', 0.0, 2.0).name('Energy');
  }

  private addPostFx (gui: GUI) {
    const dir = gui.addFolder('Post FX');
    // dir.open();

    // gamma
    dir.add(this.cfg.postfx, 'gamma', 1.0, 3.0).name('Gamma');

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
