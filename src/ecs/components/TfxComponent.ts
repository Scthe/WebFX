import {Component, ComponentType} from '../Component';
import {Texture} from 'resources';
import {IndexBuffer} from './MeshComponent';

export class TfxComponent extends Component<ComponentType.Tfx> {

  static MAX_FOLLOW_HAIRS_PER_GUIDE = 15;

  // radius of each strand
  public fiberRadius = 0.005;
  // make strand tip thinner than the root by a factor e.g. half as thick
  public thinTip = 0.8;
  // generate virtual/follow hairs based on each original/guide hair.
  // Essentially, render each guide hair `followHairs` times with some displacement
  public followHairs = 8;
  // displacement of follow hair at the root
  public followHairSpreadRoot = 0.28;
  // displacement of follow hair at the tip
  public followHairSpreadTip = 0.18;
  // debug display mode, see UISystem for modes
  public displayMode = 0;

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
