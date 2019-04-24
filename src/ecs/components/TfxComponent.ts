import {Component, ComponentType} from '../Component';
import {Texture} from 'resources';
import {IndexBuffer} from './MeshComponent';

export class TfxComponent extends Component<ComponentType.Tfx> {

  public fiberRadius = 0.02;
  public thinTip = 0.5;

  constructor(
    public readonly numHairStrands: number,
    public readonly numVerticesPerStrand: number,
    public readonly positionsTexture: Texture,
    public readonly tangentsTexture: Texture,
    public readonly indices: IndexBuffer,
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
