import debounce from 'lodash-es/debounce';
import {Dimensions} from './gl-utils';

type ResizeHandler = (d: Dimensions) => void;

/** Actually kinda crucial */
export class ResizeSystem {

  private debouncedHandleResize: () => void = null;
  private readonly handlers = [] as ResizeHandler[];
  private readonly nextScreen: Dimensions;

  constructor (
    private readonly gl: Webgl,
    debounceMs: number
  ) {
    this.nextScreen = this.getScreenSize();
    this.debouncedHandleResize = debounce(this.handleResize, debounceMs);

    window.addEventListener('resize', this.onResize, false);
  }

  addHandler (h: ResizeHandler) { this.handlers.push(h); }

  /** https://webglfundamentals.org/webgl/lessons/webgl-resizing-the-canvas.html */
  onResize = () => {
    const screen = this.getScreenSize();

    if (this.nextScreen.width !== screen.width ||
        this.nextScreen.height !== screen.height) {
      this.nextScreen.width  = screen.width;
      this.nextScreen.height  = screen.height;
      this.debouncedHandleResize();
    }
  }

  private getScreenSize (): Dimensions {
    const gl = this.gl;
    const realToCSSPixels = window.devicePixelRatio;
    return {
      width: Math.floor(gl.canvas.clientWidth  * realToCSSPixels),
      height: Math.floor(gl.canvas.clientHeight * realToCSSPixels),
    };
  }

  forceRecalc () { this.handleResize(); }

  private handleResize = () => {
    const {width, height} = this.nextScreen;
    console.log(`Detected viewport (${width}x${height})`);

    const gl = this.gl;
    gl.canvas.width  = width;
    gl.canvas.height = height;

    this.handlers.forEach(h => h(this.nextScreen));
  }

}
