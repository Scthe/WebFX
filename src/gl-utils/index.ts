export * from './createContext';
export * from './matrices';
export * from './uniforms';

///////////////////////////////

import {
  vec3, fromValues as Vec3, create as vec3_0,
  normalize, subtract
} from 'gl-vec3';
import STATIC_GL from './gimme_gl';
import {TextureBindingState, Texture} from 'resources';


export type ArrayBufferView =
  Int8Array | Int16Array | Int32Array |
  Uint8Array | Uint16Array | Uint32Array |
  Uint8ClampedArray |
  Float32Array | Float64Array; // | DataView | ArrayBuffer | null;

export type ArrayBufferViewConstructor<T> = {
  new(...rest: any[]): T;
};


export const AXIS_Y = Vec3(0, 1, 0);

export const toRadians = (degrees: number) => degrees * Math.PI / 180;
export const toDegrees = (radians: number) => radians / Math.PI * 180;

export const sphericalToCartesian = (phi: number, theta: number, autoConvertToRad = false) => {
  if (autoConvertToRad) {
    phi = toRadians(phi);
    theta = toRadians(theta);
  }
  const pos = vec3_0();
  pos[0] = Math.cos(phi) * Math.sin(theta);
  pos[1] = Math.cos(theta);
  pos[2] = Math.sin(phi) * Math.sin(theta);
  return pos;
};

export const miliSecToSec = (ms: number) => ms / 1000;

export const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max);
};

export const lerp = (a: number, b: number, mod: number) => {
  mod = clamp(mod, 0, 1);
  return a * (1 - mod) + b * mod;
};

export const numberToString = (a: number, precision: number = 3) => Number(a).toFixed(precision);

export interface Dimensions { width: number; height: number; }

export const getGlConstName = (value: number): string => {
  const keys = Object.keys(STATIC_GL).filter(k => (STATIC_GL as any)[k] === value);
  return keys.join(' ');
};


// <editor-fold> VECTOR

export const hexToVec3 = (hex: number | string) => {
  if (typeof hex === 'string') {
    const hexStr = hex[0] === '#' ? hex.substr(1) : hex;
    hex = parseInt(hexStr, 16);
  }

  // const a = (hex >> 24) & 0xff;
  const r = (hex >> 16) & 0xff;
  const g = (hex >>  8) & 0xff;
  const b = (hex      ) & 0xff;
  return Vec3(r / 255, g / 255, b / 255);
};

export const subtractNorm = (a: vec3, b: vec3) => {
  const c = subtract(vec3_0(), a, b);
  return normalize(c, c);
};

export const vec3ToString = (v: vec3, precision: number = 3) => {
  const pv = (idx: number) => numberToString(v[idx], precision);
  return `[${pv(0)}, ${pv(1)}, ${pv(2)}]`;
};

// </editor-fold> // END: VECTOR


// https://stackoverflow.com/questions/39419170/how-do-i-check-that-a-switch-block-is-exhaustive-in-typescript
// does not work for enums that assign value for each member
export function assertUnreachable(_x?: never): never {
  throw new Error('Didn\'t expect to get here');
}

export type ValueOf<T> = T[keyof T];

export const IN_DEV_MODE = (f: Function) => {
  if (process.env.DEBUG) {
    f();
  }
};

export const loadTexture = (
  gl: Webgl, tbs: TextureBindingState, path: string, texture: Texture
) => {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.addEventListener('load', () => {
      const writePoint = {
        start: Vec3(0, 0, 0),
        dimensions: texture.dimensions,
      };
      const writeSource = {
        unsizedPixelFormat: gl.RGB_INTEGER,
        perChannelType: gl.UNSIGNED_BYTE,
        data: img,
      };
      texture.write(gl, tbs, 0, writePoint, writeSource);

      resolve(texture);
    });

    img.addEventListener('error', reject);

    img.src = path;
  });
};
