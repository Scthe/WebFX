import {vec3, fromValues as vec3_Create} from 'gl-vec3';

export type Vertex = vec3;

export interface TriangleIndices {
  a: number;
  b: number;
  c: number;
}

export const assert = (cond: any, msg: string) => {
  if (!cond) { throw msg; }
};

// alias for nicer semantic
export const vert = (x: number, y: number, z: number) => vec3_Create(x, y, z) as Vertex;

type ShapeDesc = { [dimension: string]: number };

// Math.abs on all props
// It's important that all 'XxxShapeDesc' are `type XxxShapeDesc = {...}`,
// not a interface. Otherwise, works as expected, especially with obj. deconstruction
// @see https://github.com/Microsoft/TypeScript/issues/15300
export const absShapeDims = <T extends ShapeDesc> (ddesc: T): T => {
  const desc = ddesc as ShapeDesc;
  const ks = Object.keys(desc) as (keyof ShapeDesc)[];
  ks.forEach(k => {
    desc[k] = Math.abs(desc[k]);
  });
  return desc as T;
};

export const generateCircle = (radius: number, segments: number) => {
  const verts = [] as Vertex[];

  for (let i = 0; i < segments; i++) {
    const u = i / segments;
    const theta = u * (Math.PI * 2);
    const sinTheta = Math.sin(theta);
    const cosTheta = Math.cos(theta);
    verts.push(vert(radius * sinTheta, 0, radius * cosTheta));
  }

  return verts;
};

const wrapProto = (segments: number) => (o: number) => o % segments;

export const generateCircleFaces = (segments: number, offsetA: number, offsetB: number) => {
  const idxs = [] as TriangleIndices[];
  const wrap = (o: number) => o % segments;

  for (let i = 0; i < segments; i++ ) {
    idxs.push({
      a: offsetA + i,
      b: offsetA + wrap(i + 1),
      c: offsetB + i,
    });
    idxs.push({
      a: offsetB + wrap(i + 1),
      b: offsetB + i,
      c: offsetA + wrap(i + 1),
    });
  }

  return idxs;
};

export const generateConeFaces = (segments: number, cicleIdxOffset: number, capIdx: number) => {
  const wrap = wrapProto(segments);
  const idxs = [] as TriangleIndices[];

  for (let i = 0; i < segments; i++) {
    idxs.push({
      a: cicleIdxOffset + i,
      b: cicleIdxOffset + wrap(i + 1),
      c: capIdx, // tip
    });
  }

  return idxs;
};

export const addHeight = (height: number) => (v: Vertex) => vert(v[0], v[1] + height, v[2]);
