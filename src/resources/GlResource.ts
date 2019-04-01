// we cannot validate types during calls, be we can validate resource isOk
export const verifyOk = <K, T extends GlResource<K>>(target: T, key: keyof T, descriptor: any) => {
  if (descriptor === undefined) {
    descriptor = Object.getOwnPropertyDescriptor(target, key);
  }
  const originalMethod = descriptor.value;

  descriptor.value = function () {
    const self = this as T; // better typecheck

    if (self.isOk) {
      return originalMethod.apply(self, Array.from(arguments));
    } else {
      throw `Tried to use invalid ${self.resourceType}`;
    }
  };

  // return edited descriptor as opposed to overwriting the descriptor
  return descriptor;
};

export abstract class GlResource<GlIdType> {
  private static nextUUid = 0;

  protected glId_: GlIdType = null;
  public readonly resourceType: string;
  public readonly uuid: number; // glId cannot be used as unique identifier as it's not castable to number

  constructor(glId: GlIdType, resTypeName: string) {
    this.glId_ = glId;
    this.resourceType = resTypeName;
    this.uuid = GlResource.nextUUid++;
  }

  get glId () { return this.glId_; }

  get isOk () { return this.glId_ !== null; }

  abstract destroy (gl: Webgl): void;

  // @verifyOk // just testing
  // bind(a: number) { console.log(a); }

}

/*
// test
class Aa extends GlResource<number> { destroy (gl: Webgl) {} }
const aa = new Aa(0, 'testAa');
aa.bind('asd');
*/
