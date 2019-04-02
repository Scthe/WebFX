import {Component, ComponentType} from './_Component';
import {Texture} from 'resources';

export class TfxComponent extends Component<ComponentType.Tfx> {
  constructor(
    public readonly numHairStrands: number,
    public readonly numVerticesPerStrand: number,
    public readonly positionsTexture: Texture,
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
