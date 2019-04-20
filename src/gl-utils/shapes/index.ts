export * from './sphere';

import {Vao, Buffer, BufferUsage, BufferType, VaoAttrType} from 'resources';
import {Vertex, TriangleIndices} from './_utils';
import {MeshComponent} from 'ecs';


export interface Shape {
  vertices: Vertex[];
  indices: TriangleIndices[];
}


export const createGpuShape = (gl: Webgl, shape: Shape, attrName: string): MeshComponent => {
  const {vertices, indices} = shape;

  // vertices
  const vertBuf = new Float32Array(vertices.length * 3);
  vertices.forEach((v: Vertex, i: number) => {
    vertBuf[i * 3 + 0] = v[0];
    vertBuf[i * 3 + 1] = v[1];
    vertBuf[i * 3 + 2] = v[2];
  });
  const vao = new Vao(gl, [{
    name: attrName,
    stride: 0,
    offset: 0,
    type: VaoAttrType.FLOAT_VEC3,
    rawData: vertBuf,
  }]);

  // indices
  const idxData = new Uint16Array(indices.length * 3);
  indices.forEach((idx: TriangleIndices, i: number) => {
    idxData[i * 3 + 0] = idx.a;
    idxData[i * 3 + 1] = idx.b;
    idxData[i * 3 + 2] = idx.c;
  });
  const idxBuf = Buffer.fromData(gl, BufferType.IndexBuffer, BufferUsage.STATIC_DRAW, idxData);

  return new MeshComponent(
    vao,
    {
      indexGlType: gl.UNSIGNED_SHORT,
      indexBuffer: idxBuf,
      triangleCnt: indices.length,
    },
  );
};
