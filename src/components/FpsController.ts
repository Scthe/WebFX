import {
  mat4,
  create as Mat4,
  transpose,
  translate,
  rotateX,
  rotateY,
} from 'gl-mat4';
import {vec2, fromValues as Vec2} from 'gl-vec2';
import {vec3, fromValues as Vec3, add as addV3} from 'gl-vec3';
import {create as Vec4} from 'gl-vec4';
import {transformPointByMat4, clamp} from 'gl-utils';

import {Component, ComponentType} from './_Component';
import {KeyboardState} from '../InputSystem';


const Key = {
  CAMERA_FORWARD: 'W',
  CAMERA_BACK:    'S',
  CAMERA_LEFT:    'A',
  CAMERA_RIGHT:   'D',
  CAMERA_UP:      ' ',
  CAMERA_DOWN:    'Z',
};

const PI_2 = Math.PI / 2;
const ANGLE_UP_DOWN = 0; // pitch
const ANGLE_LEFT_RIGHT = 1; // yaw


/** We could use TransformComponent, but Fps camera is so unusual,
  * it's easier to create new component.
  * E.g. it has reversed rotation-transform order when calculating view matrix
  */
export class FpsController extends Component<ComponentType.FpsController> {

  public rotateSensitivity = 0.002;
  public moveSensitivity = 0.005;
  public wheelSensitivity = 0.5;
  private readonly viewMatrix_: mat4 = Mat4();
  private readonly angles_ = Vec2(0, 0); // angles like in polar coords
  private readonly position_ = Vec3(0, 0, 0);

  get position (): vec3 { return this.position_; }
  get angles (): vec2 { return this.angles_; }

  onMouseDrag = (movement: vec2) => {
    this.angles[ANGLE_LEFT_RIGHT] += movement[0] * this.rotateSensitivity;
    this.angles[ANGLE_UP_DOWN] += movement[1] * this.rotateSensitivity;
    const safePI = PI_2 * 0.95; // no extremes pls!
    this.angles[ANGLE_UP_DOWN] = clamp(this.angles[ANGLE_UP_DOWN], -safePI, safePI);
  }

  onMouseWheel = (deltaY: number) => {
    const delta = Math.sign(deltaY) * this.wheelSensitivity;
    this.applyMove(Vec3(0, 0, delta));
  }

  update = (deltaTime: number, keyboardState: KeyboardState) => {
    const speed = this.moveSensitivity * deltaTime;
    const moveDir = this.calculateMovementDirectionFromKeys(keyboardState, speed);
    this.applyMove(moveDir);
  }

  private calculateMovementDirectionFromKeys (keyboardState: KeyboardState, speed: number) {
    const isPressed = (key: string) => keyboardState.isPressed(key.charCodeAt(0));

    let moveDir = Vec3(0, 0, 0);
    if (isPressed(Key.CAMERA_FORWARD)) { moveDir[2] -= speed; } // z-axis
    if (isPressed(Key.CAMERA_BACK))    { moveDir[2] += speed; }
    if (isPressed(Key.CAMERA_LEFT))    { moveDir[0] -= speed; } // x-axis
    if (isPressed(Key.CAMERA_RIGHT))   { moveDir[0] += speed; }
    if (isPressed(Key.CAMERA_UP))      { moveDir[1] += speed; } // y-axis
    if (isPressed(Key.CAMERA_DOWN))    { moveDir[1] -= speed; }
    return moveDir;
  }

  private applyMove (moveDir: vec3) {
    if (moveDir[0] !== 0 || moveDir[1] !== 0 || moveDir[2] !== 0) {
      const rotationMat = transpose(Mat4(), this.getRotationMat());
      const moveDirCamSpace = Vec4();
      const moveDirLocal = transformPointByMat4(moveDirCamSpace, moveDir, rotationMat);
      addV3(this.position, this.position, moveDirLocal);
    }
  }

  private getRotationMat () {
    const angles = this.angles;
    const result = Mat4();
    rotateX(result, result, angles[ANGLE_UP_DOWN]); // up-down
    rotateY(result, result, angles[ANGLE_LEFT_RIGHT]); // left-right
    return result;
  }

  get viewMatrix () {
    const rotMat = this.getRotationMat();
    const pos = this.position;

    // we have to reverse position, as moving camera X units
    // moves scene -X units
    return translate(this.viewMatrix_, rotMat, [-pos[0], -pos[1], -pos[2]]);
  }

  destroy(_: Webgl) {}

  public static TYPE = ComponentType.FpsController;

}
