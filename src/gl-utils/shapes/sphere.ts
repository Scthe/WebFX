import range from 'lodash-es/range';
import flatten from 'lodash-es/flatten';
import flatMap from 'lodash-es/flatMap';
import {scale} from 'gl-vec3';
import {Shape} from './index';
import {
  Vertex, vert,
  generateCircle, generateCircleFaces, generateConeFaces,
  addHeight, assert, absShapeDims
} from './_utils';

type SphereShapeDesc = {
  radius: number;
  segments: number; // like in torus
  rings: number; // rings placed across the height
};


const constructUnitSphere = (segments: number, rings: number): Shape => {
  const UNIT_RAD = 1.0;
  const TOTAL_HEIGHT = UNIT_RAD * 2;
  const dH = TOTAL_HEIGHT / (rings + 1);

  const vertRings = flatMap(range(rings), i => {
    const hFromBottom = (i + 1) * dH; // from bottom of the sphere
    const hFromCenter = hFromBottom - UNIT_RAD; // sign does not matter
    const sinA = hFromCenter / UNIT_RAD;
    const cosA = Math.sqrt(1 - (sinA * sinA)); // sin^2 + cos^2 = 1
    const r = cosA * UNIT_RAD;

    // also, move sphere center to (0,0,0)
    return generateCircle(r, segments).map(addHeight(hFromBottom - UNIT_RAD));
  });
  const vertices: Vertex[] = flatten(vertRings);

  const indices = flatMap(range(rings - 1), i =>
    generateCircleFaces(segments, segments * i, segments * (i + 1))
  );

  // add caps
  vertices.push(vert(0, UNIT_RAD, 0));
  indices.push(...generateConeFaces(segments, (rings - 1) * segments, vertices.length - 1));
  vertices.push(vert(0, -UNIT_RAD, 0));
  indices.push(...generateConeFaces(segments, 0, vertices.length - 1));

  return {
    vertices,
    indices: [...indices],
  };
};

export const generateSphere = (desc: SphereShapeDesc): Shape => {
  const {radius, rings, segments} = absShapeDims(desc);
  assert(segments >= 3, `Sphere segments should be 3 or more, was ${segments}`);
  assert(rings >= 2, `Sphere rings should be 2 or more, was ${rings}`);

  const sphereShape = constructUnitSphere(segments, rings);
  sphereShape.vertices.forEach(vert => {
    scale(vert, vert, radius);
  });
  return sphereShape;
};
