import {Component, ComponentType} from '../Component';
import {Texture} from 'resources';
import {IndexBuffer} from './MeshComponent';
import {arrayToVec3} from 'gl-utils';

class TfxMaterial {
  public albedo = arrayToVec3([31, 26, 24], true);
  public aoStrength = 1.0;
  public aoExp = 3.1;

  public specularColor1 = arrayToVec3([87, 43, 24], true);
  public specularPower1 = 160;
  public specularStrength1 = 0.27;
  public primaryShift = 0.005;

  public specularColor2 = arrayToVec3([138, 129, 111], true);
  public specularPower2 = 400;
  public specularStrength2 = 0.07;
  public secondaryShift = -0.06;
}


export class TfxComponent extends Component<ComponentType.Tfx> {

  static MAX_FOLLOW_HAIRS_PER_GUIDE = 15;

  // radius of each strand
  public fiberRadius = 0.01;
  // make strand tip thinner than the root by a factor e.g. half as thick
  public thinTip = 0.9;
  // generate virtual/follow hairs based on each original/guide hair.
  // Essentially, render each guide hair `followHairs` times with some displacement
  public followHairs = 10;
  // displacement of follow hair at the root
  public followHairSpreadRoot = 0.14;
  // displacement of follow hair at the tip
  public followHairSpreadTip = 0.09;
  // debug display mode, see UISystem for modes
  public displayMode = 0;
  // material
  public material = new TfxMaterial();

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
