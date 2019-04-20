import {Component, ComponentType} from '../Component';
import {Texture} from 'resources';

export class MaterialComponent extends Component<ComponentType.Material> {

  // ambientCol: [206, 230, 255],
  public isMetallic = false;
  public roughness = 0.7;

  public fresnelExponent = 11.8;
  public fresnelMultiplier = 17.5;
  public fresnelColor = [145, 27, 56]; // TODO no, use vec3 here!
  public sssTransluency = 0.5;
  public sssWidth = 60.0;
  public sssBias = 0.022;
  public sssGain = 0.0;
  public sssStrength = 5.0;
  // public ssColor1 = [37, 135, 45];
  // public ssColor2 = [175, 70, 40];

  constructor(
    /* albedo for dielectrics, F0 for metalics*/
    public albedoTex: Texture,
  ) {
    super();
  }

  get packedRoughnessMetallic () {
    return this.isMetallic ? this.roughness : -this.roughness;
  }

  destroy(_: Webgl) {}

  public static TYPE = ComponentType.Material;
}
