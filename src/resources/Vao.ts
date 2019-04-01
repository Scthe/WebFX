import STATIC_GL from 'gl-utils/gimme_gl';
import {ArrayBufferView} from 'gl-utils';
import {GlResource, verifyOk} from './GlResource';
import {Buffer, BufferUsage, BufferType} from './Buffer';

export enum VaoAttrType {
  FLOAT      = STATIC_GL.FLOAT,
  FLOAT_VEC2 = STATIC_GL.FLOAT_VEC2,
  FLOAT_VEC3 = STATIC_GL.FLOAT_VEC3,
  FLOAT_VEC4 = STATIC_GL.FLOAT_VEC4,
}

interface VaoAttrInfo {
  name: string;
  glBuffer: Buffer;
  location: GLint;
  type: VaoAttrType;
  stride: number;
  offset: number;
}

export interface VaoAttrInit {
  name: string;
  stride: number;
  offset: number;
  type: VaoAttrType;
  rawData: ArrayBufferView;
}

const deconstructAttrType = (gl: Webgl, type: VaoAttrType) => {
  switch (type) {
    case VaoAttrType.FLOAT:      return [gl.FLOAT, 1];
    case VaoAttrType.FLOAT_VEC2: return [gl.FLOAT, 2];
    case VaoAttrType.FLOAT_VEC3: return [gl.FLOAT, 3];
    case VaoAttrType.FLOAT_VEC4: return [gl.FLOAT, 4];
    default: throw `Unsupported vertex attribute type: ${type}`;
  }
};

const loadAttrToGpuBuffer = (gl: Webgl, location: number, attr: VaoAttrInit): VaoAttrInfo => {
  const {name, rawData, offset, stride, type} = attr;

  // create glBuffer and write
  // TODO optimize - this produces fragmented memory. Tho, should we care with VAO?
  const [baseType, elCount] = deconstructAttrType(gl, attr.type);
  const glBuffer = Buffer.fromData(gl, BufferType.VertexBuffer, BufferUsage.STATIC_DRAW, rawData);
  glBuffer.bind(gl);
  // connect buffer->attribute
  gl.vertexAttribPointer(location, elCount, baseType, false, stride, offset);
  gl.enableVertexAttribArray(location);

  return {
    name,
    glBuffer,
    location,
    type,
    stride,
    offset
  };
};

export class Vao extends GlResource<WebGLVertexArrayObject> {

  public readonly attrs: VaoAttrInfo[] = [];

  constructor(gl: Webgl, attrs: VaoAttrInit[]) {
    super(gl.createVertexArray(), 'Vao');
    gl.bindVertexArray(this.glId);
    attrs.forEach(this.initAttribute(gl));
    gl.bindVertexArray(null);

    // check if all were assigned sucesfully
    if (attrs.length !== this.attrs.length) {
      this.destroy(gl);
    }
  }

  private initAttribute = (gl: Webgl) => (attr: VaoAttrInit, location: number) => {
    const assignedAttr = loadAttrToGpuBuffer(gl, location, attr);
    if (assignedAttr) {
      this.attrs.push(assignedAttr);
    } else {
      console.error(`Vertex attribute ${attr.name} not found. ` +
        'This attribute may simply be not used, so it is not critical. ' +
        'Vao may not work as expected');
    }
  }

  @verifyOk
  bind (gl: Webgl) {
    gl.bindVertexArray(this.glId);
  }

  destroy (gl: Webgl) {
    if (this.isOk) {
      this.attrs.forEach(a => a.glBuffer.destroy(gl));
      gl.deleteVertexArray(this.glId);
      this.glId_ = null;
    }
  }

}
