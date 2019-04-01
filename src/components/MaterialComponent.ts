import {Component, ComponentType} from './_Component';
import { Texture } from 'resources';

export class MaterialComponent extends Component<ComponentType.Material> {

  public isMetallic = false;
  public roughness = 0.7;
  public shadowCaster = true;

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
