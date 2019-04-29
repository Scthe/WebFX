import {Component, ComponentType} from '../Component';
import {Texture} from 'resources';

export class MaterialComponent extends Component<ComponentType.Material> {

  // ambientCol: [206, 230, 255],
  public isMetallic = false;
  public specular = 0.7;
  public specularMul = 1.0; // not PBR, but needed for eyes

  public fresnelExponent = 11.8;
  public fresnelMultiplier = 17.5;
  public fresnelColor = [145, 27, 56]; // TODO no, use vec3 here!
  // SSS forward (transluency)
  public sssTransluency = 0.5;
  public sssWidth = 60.0;
  public sssBias = 0.022;
  public sssGain = 0.0;
  public sssStrength = 5.0;

  constructor(
    /* albedo for dielectrics, F0 for metalics*/
    public albedoTex: Texture,
    /* the usual specular texture */
    public specularTex: Texture,
    /* special texture for this demo */
    public hairShadowTex: Texture = null,
  ) {
    super();
  }

  destroy(_: Webgl) {}

  public static TYPE = ComponentType.Material;
}
