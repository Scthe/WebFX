import {GUI} from 'dat.gui';
import {Config} from 'Config';

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

  initialize () {
    this.gui = new GUI();

    const f = this.gui.addFolder('tmp');
    f.open();
    f.add(this.cfg.camera.settings, 'fovDgr', 60, 120);
  }

}
