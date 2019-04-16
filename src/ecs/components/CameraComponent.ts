import {mat4, create as Mat4, perspective} from 'gl-mat4';
import {toRadians} from 'gl-utils';
import {Component, ComponentType} from '../Component';

interface CameraSettings {
  fovDgr: number;
  zNear: number;
  zFar: number;
}


export class CameraComponent extends Component<ComponentType.Camera> {

  public readonly perspectiveMatrix: mat4 = Mat4();

  constructor(
    public settings: CameraSettings,
  ) {
    super();
  }

  updateProjectionMatrix (viewportWidth: number, viewportHeight: number) {
    const {fovDgr, zNear, zFar} = this.settings;
    const aspectRatio = viewportWidth / viewportHeight;
    perspective(this.perspectiveMatrix, toRadians(fovDgr), aspectRatio, zNear, zFar);
  }

  destroy(_: Webgl) {}

  public static TYPE = ComponentType.Camera;

}
