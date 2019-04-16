import {GUI} from 'dat.gui';
import {Config, LightCfg} from 'Config';
import {MaterialComponent, Ecs} from 'ecs';
import {ENTITY_SINTEL, ENTITY_SINTEL_EYES} from 'webfx';

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


export class UISystem {

  private gui: GUI;

  constructor (
    private readonly cfg: Config,
  ) { }

  initialize (ecs: Ecs) {
    this.gui = new GUI();

    this.addMaterialFolder(this.gui, ecs, 'Sintel', ENTITY_SINTEL);
    this.addMaterialFolder(this.gui, ecs, 'Sintel_eyes', ENTITY_SINTEL_EYES);
    this.addAmbientLightFolder(this.gui);
    this.addLightFolder(this.gui, this.cfg.light0, 'Light 0');
    this.addLightFolder(this.gui, this.cfg.light1, 'Light 1');
    this.addLightFolder(this.gui, this.cfg.light2, 'Light 2');
    this.addShadowsFolder(this.gui);
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
    dir.open();

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
  }

  private addAmbientLightFolder (gui: GUI) {
    const dir = gui.addFolder('Ambient light');
    dir.open();

    this.addColorController(dir, this.cfg.lightAmbient, 'color', 'Color');
    dir.add(this.cfg.lightAmbient, 'energy', 0.0, 1.0).name('Energy');
  }

  private addLightFolder (gui: GUI, lightObj: LightCfg, name: string) {
    const dir = gui.addFolder(name);
    // dir.open();

    dir.add(lightObj, 'posPhi', -179, 179).step(1).name('Position phi');
    dir.add(lightObj, 'posTheta', 15, 85).step(1).name('Position th');
    dir.add(lightObj, 'posRadius', 0.0, 10.0).name('Position r');
    this.addColorController(dir, lightObj, 'color', 'Color');
    dir.add(lightObj, 'energy', 0.0, 1.0).name('Energy');
  }

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
