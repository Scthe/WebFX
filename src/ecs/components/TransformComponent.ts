import {mat4, create as Mat4, copy as copyM4} from 'gl-mat4';
import {Component, ComponentType} from '../Component';
import {Transform, convertTransformToMatrix, createInitTransform} from 'gl-utils/Transform';

export class TransformComponent extends Component<ComponentType.Transform> {
  public readonly modelMatrix: mat4 = Mat4();

  constructor(
    private tfx: Transform = createInitTransform(),
  ) {
    super();
    this.updateModelMatrix();
  }

  get position () { return this.tfx.position; }
  get rotation () { return this.tfx.rotation; }
  get scale () { return this.tfx.scale; }

  updateModelMatrix () {
    const m = convertTransformToMatrix(this.tfx);
    copyM4(this.modelMatrix, m);
  }

  destroy(_: Webgl) {}

  public static TYPE = ComponentType.Transform;
}
