import {mat4, create as Mat4, perspective} from 'gl-mat4';
import {toRadians} from 'gl-utils';

interface CameraSettings {
  fovDgr: number;
  zNear: number;
  zFar: number;
}


export class CameraComponent {

  public readonly perspectiveMatrix: mat4 = Mat4();

  constructor(
    public settings: CameraSettings,
  ) { }

  updateProjectionMatrix (viewportWidth: number, viewportHeight: number) {
    const {fovDgr, zNear, zFar} = this.settings;
    const aspectRatio = viewportWidth / viewportHeight;
    perspective(this.perspectiveMatrix, toRadians(fovDgr), aspectRatio, zNear, zFar);
  }

  destroy(_: Webgl) {}

}
