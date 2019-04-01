import {Component, ComponentType} from './_Component';
import {Vao, Buffer} from 'resources';

export class MeshComponent extends Component<ComponentType.Mesh> {
  constructor(
    public readonly vao: Vao,
    public readonly indexGlType: GLenum, // e.g. gl.UNSIGNED_SHORT
    public readonly indexBuffer: Buffer,
    public readonly triangleCnt: number,
  ) {
    super();
  }

  destroy(gl: Webgl) {
    this.vao.destroy(gl);
    this.indexBuffer.destroy(gl);
  }

  public static TYPE = ComponentType.Mesh;
}
