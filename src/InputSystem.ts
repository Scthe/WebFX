import {fromValues as Vec2} from 'gl-vec2';
import {FpsController} from 'components/FpsController';


const MOUSE_LEFT_BTN = 0; // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button


export class KeyboardState {
  private pressedKeys: boolean[] = new Array(128); // keycode => bool

  constructor() {
    window.addEventListener('keydown', this.onKeyDown, false);
    window.addEventListener('keyup', this.onKeyUp, false);
  }

  dispose () {
    window.removeEventListener('keydown', this.onKeyDown, false);
    window.removeEventListener('keyup', this.onKeyUp, false);
  }

  private onKeyDown = (event: KeyboardEvent) => {
    this.pressedKeys[event.keyCode] = true;
  }

  private onKeyUp = (event: KeyboardEvent) => {
    this.pressedKeys[event.keyCode] = false;
  }

  isPressed = (keyCode: number) => this.pressedKeys[keyCode];
}


export class InputSystem {

  private keyboardState: KeyboardState;

  private isDragging = false;

  constructor (
    private element: HTMLElement,
    private fpsController: FpsController,
  ) {
    this.element.addEventListener('mousedown', this.onMouseDown, false);
    this.element.addEventListener('mousemove', this.onMouseMove, false);
    this.element.addEventListener('mouseup', this.onMouseUp, false);
    this.element.addEventListener('mouseleave', this.onMouseUp, false);
    this.element.addEventListener('wheel', this.onMouseWheel, false);

    this.keyboardState = new KeyboardState();
  }

  dispose () {
    this.element.removeEventListener('mousedown', this.onMouseDown, false);
    this.element.removeEventListener('mousemove', this.onMouseMove, false);
    this.element.removeEventListener('mouseup', this.onMouseUp, false);
    this.element.removeEventListener('mouseleave', this.onMouseUp, false);
    this.element.removeEventListener('wheel', this.onMouseWheel, false);

    this.keyboardState.dispose();
  }

  update (deltaTime: number) {
    this.fpsController.update(deltaTime, this.keyboardState);
  }

  // <editor-fold> MOUSE ROTATE

  private onMouseMove = (event: MouseEvent) => {
    if (!this.isDragging) { return; }

    const movement = this.getMovement(event);
    this.fpsController.onMouseDrag(movement);
  }

  private onMouseDown = (event: MouseEvent) => {
    if (event.button === MOUSE_LEFT_BTN) {
      this.isDragging = true;
    }
  }

  private onMouseUp = (event: MouseEvent) => {
    if (event.button === MOUSE_LEFT_BTN) {
      this.isDragging = false;
    }
  }

  private getMovement = (event: any) => Vec2(
    (event.movementX || event.mozMovementX || event.webkitMovementX || 0) as number,
    (event.movementY || event.mozMovementY || event.webkitMovementY || 0) as number,
  )

  // </editor-fold> // END: MOUSE ROTATE

  private onMouseWheel = (e: WheelEvent) => {
    this.fpsController.onMouseWheel(e.deltaY);
  }

}
