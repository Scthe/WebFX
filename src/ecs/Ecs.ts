import intersection from 'lodash-es/intersection';
import {Component, ComponentType, ComponentConstructor} from './Component';
import {NameComponent} from './components/NameComponent';

export type Entity = number;

type ComponentsList <T extends ComponentType> = {
  [id: /*Entity*/ number]: Component<T>
};

type ComponentsMap = {
  [K in ComponentType]: ComponentsList<K>
};

interface EntityQuery {
  includes: ComponentType[];
}

type EntityCb <A, B, C, D> = (entity: Entity, a: A, b: B, c: C, d: D) => void;

type ComponentConstructorList <A, B, C, D> = [
   ComponentConstructor<A>,
   ComponentConstructor<B>?,
   ComponentConstructor<C>?,
   ComponentConstructor<D>?
];


export class Ecs {

  private nextEntityId = 0;
  private components: ComponentsMap;

  constructor() {
    const comMap: any = {};
    Object.keys(ComponentType).forEach(typ => comMap[typ] = []);
    this.components = comMap;
  }

  createEnity(): Entity { return this.nextEntityId++; }

  addComponent<T extends ComponentType>(entity: Entity, component: Component<T>): void {
    const list = this.getComponents(component.type);
    list[entity] = component;
  }

  getComponent<T extends ComponentType, K extends Component<T>>(
    entity: Entity, ComponentKlass: ComponentConstructor<K>
  ): K | null {
    const type: ComponentType = ComponentKlass.TYPE;
    const list = this.getComponents(type);
    return list[entity] as K;
  }

  getAllIds(q: EntityQuery): Entity[] {
    const entitiesPerType = q.includes.map(typ => {
      const list = this.getComponents(typ);
      return Object.entries(list).reduce((acc, e) => {
        const [entity, comp] = e;
        if (!!comp) {
          acc.push(entity);
        }
        return acc;
      }, []);
    });
    return intersection(...entitiesPerType);
  }

  forEachEntity<
    TT extends Component<ComponentType>,
    SS extends Component<ComponentType>,
    UU extends Component<ComponentType>,
    VV extends Component<ComponentType>,
  >(
     f: EntityCb<TT, SS, UU, VV>,
     ...args: ComponentConstructorList<TT, SS, UU, VV>
   ): void {
    const cx0 = this.getComponents(args[0].TYPE);
    const callbackArgs = [null, null, null, null, null] as Component<any>[];

    Object.entries(cx0).forEach(entry => {
      const entityId = entry[0] as any as Entity;
      const c0 = entry[1] as Component<any>;
      callbackArgs[0] = entityId as any;
      callbackArgs[1] = c0;

      let hasAll = true;
      for (let i = 1; i < args.length; i++) {
        const argsV = args[i] as ComponentConstructor<any>;
        const comp = this.getComponent(entityId, argsV) as Component<any>;
        callbackArgs[i + 1] = comp;
        hasAll = hasAll && !!comp;
      }
      if (hasAll) {
        f.apply(null, callbackArgs);
      }
    });
  }

  removeAll (entities: Entity[], gl: Webgl) {
    Object.keys(ComponentType).forEach(typ_ => {
      const typ = typ_ as any as ComponentType;
      const list = this.getComponents(typ);
      Object.entries(list).forEach(e => {
        const [entity, comp] = e;
        if (entities.includes(entity as any) && !!comp) {
          comp.destroy(gl);
          delete list[entity as any];
        }
      });
    });
  }

  getByName(name: string): Entity {
   const list = this.getComponents(ComponentType.Name);
   let result = undefined as Entity;

   Object.entries(list).forEach(e => {
     const [entity, comp] = e;
     if ((comp as NameComponent).name === name) {
       result = parseInt(entity, 10); // ugh, object_key->number conversion..
     }
   });

   return result;
  }

  private getComponents<T extends ComponentType>(type: T): ComponentsList<T> {
    return this.components[type];
  }

}
