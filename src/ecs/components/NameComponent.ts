import {Component, ComponentType} from '../Component';


export class NameComponent extends Component<ComponentType.Name> {
  constructor(
    public readonly name: string,
  ) {
    super();
  }

  destroy(_: Webgl) {
  }

  public static TYPE = ComponentType.Name;
}
