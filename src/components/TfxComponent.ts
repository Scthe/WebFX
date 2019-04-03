import {Component, ComponentType} from './_Component';
import {Texture, Vao} from 'resources';
import {IndexBuffer} from './MeshComponent';

export class TfxComponent extends Component<ComponentType.Tfx> {
  constructor(
    public readonly numHairStrands: number,
    public readonly numVerticesPerStrand: number,
    public readonly positionsTexture: Texture,
    public readonly indices: IndexBuffer,
    public readonly _vao: Vao,
  ) {
    super();
  }

  destroy(gl: Webgl) {
    this.positionsTexture.destroy(gl);
  }

  get totalVertices() {
    return this.numHairStrands * this.numVerticesPerStrand;
  }

  public static TYPE = ComponentType.Tfx;
}
