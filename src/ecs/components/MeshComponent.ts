import {Component, ComponentType} from '../Component';
import {Vao, Buffer} from 'resources';

export interface IndexBuffer {
  readonly indexGlType: GLenum; // e.g. gl.UNSIGNED_SHORT
  readonly indexBuffer: Buffer;
  readonly triangleCnt: number;
}

export class MeshComponent extends Component<ComponentType.Mesh> {
  constructor(
    public readonly vao: Vao,
    public readonly indices: IndexBuffer,
  ) {
    super();
  }

  destroy(gl: Webgl) {
    this.vao.destroy(gl);
    this.indices.indexBuffer.destroy(gl);
  }

  public static TYPE = ComponentType.Mesh;
}
