export enum ComponentType {
  Camera,
  FpsController,
  Material,
  Mesh,
}


export type ComponentConstructor<T> = {
  new(...rest: any[]): T;
  TYPE: ComponentType;
};


export abstract class Component<T extends ComponentType> {
  public abstract destroy(gl: Webgl): void;

  get type(): ComponentType {
    const Klass = <ComponentConstructor<T>>this.constructor;
    return Klass.TYPE; // not sure how to make this compile time
  }

  public static TYPE: ComponentType = '[ERROR] Please override me!' as any;
}
