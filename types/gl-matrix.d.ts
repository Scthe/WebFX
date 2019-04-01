// types for gl-vec3, gl-mat3 etc.
// very naive, but works for me ./shrug
//
// based Type definitions for gl-matrix 2.4 with following preambule:
//
// Type definitions for gl-matrix 2.4
// Project: https://github.com/toji/gl-matrix
// Definitions by: Mattijs Kneppers <https://github.com/mattijskneppers>, based on definitions by Tat <https://github.com/tatchx>
//                 Nikolay Babanov <https://github.com/nbabanov>
//                 Austin Martin <https://github.com/auzmartist>
//                 Wayne Langman <https://github.com/surtr-isaz>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

declare module 'gl-vec2' {
    import { vec3 } from 'gl-vec3';
    import { mat2 } from 'gl-mat2';
    import { mat3 } from 'gl-mat3';
    import { mat4 } from 'gl-mat4';
    import { mat2d } from 'gl-mat2d';

    export type vec2 = Float32Array;
    export function create(): vec2;
    export function clone(a: vec2 | number[]): vec2;
    export function fromValues(x: number, y: number): vec2;
    export function copy(out: vec2, a: vec2 | number[]): vec2;
    export function set(out: vec2, x: number, y: number): vec2;
    export function add(out: vec2, a: vec2 | number[], b: vec2 | number[]): vec2;
    export function subtract(out: vec2, a: vec2 | number[], b: vec2 | number[]): vec2;
    export function sub(out: vec2, a: vec2 | number[], b: vec2 | number[]): vec2;
    export function multiply(out: vec2, a: vec2 | number[], b: vec2 | number[]): vec2;
    export function mul(out: vec2, a: vec2 | number[], b: vec2 | number[]): vec2;
    export function divide(out: vec2, a: vec2 | number[], b: vec2 | number[]): vec2;
    export function div(out: vec2, a: vec2 | number[], b: vec2 | number[]): vec2;
    export function ceil(out: vec2, a: vec2 | number[]): vec2;
    export function floor (out: vec2, a: vec2 | number[]): vec2;
    export function min(out: vec2, a: vec2 | number[], b: vec2 | number[]): vec2;
    export function max(out: vec2, a: vec2 | number[], b: vec2 | number[]): vec2;
    export function round(out: vec2, a: vec2 | number[]): vec2;
    export function scale(out: vec2, a: vec2 | number[], b: number): vec2;
    export function scaleAndAdd(out: vec2, a: vec2 | number[], b: vec2 | number[], scale: number): vec2;
    export function distance(a: vec2 | number[], b: vec2 | number[]): number;
    export function dist(a: vec2 | number[], b: vec2 | number[]): number;
    export function squaredDistance(a: vec2 | number[], b: vec2 | number[]): number;
    export function sqrDist(a: vec2 | number[], b: vec2 | number[]): number;
    export function length(a: vec2 | number[]): number;
    export function len(a: vec2 | number[]): number;
    export function squaredLength(a: vec2 | number[]): number;
    export function sqrLen(a: vec2 | number[]): number;
    export function negate(out: vec2, a: vec2 | number[]): vec2;
    export function inverse(out: vec2, a: vec2 | number[]): vec2;
    export function normalize(out: vec2, a: vec2 | number[]): vec2;
    export function dot(a: vec2 | number[], b: vec2 | number[]): number;
    export function cross(out: vec3, a: vec2 | number[], b: vec2 | number[]): vec2;
    export function lerp(out: vec2, a: vec2 | number[], b: vec2 | number[], t: number): vec2;
    export function random(out: vec2): vec2;
    export function random(out: vec2, scale: number): vec2;
    export function transformMat2(out: vec2, a: vec2 | number[], m: mat2): vec2;
    export function transformMat2d(out: vec2, a: vec2 | number[], m: mat2d): vec2;
    export function transformMat3(out: vec2, a: vec2 | number[], m: mat3): vec2;
    export function transformMat4(out: vec2, a: vec2 | number[], m: mat4): vec2;
    export function forEach(a: Float32Array, stride: number, offset: number, count: number,
                          fn: (a: vec2 | number[], b: vec2 | number[], arg: any) => void, arg: any): Float32Array;
    export function angle(a: vec2 | number[], b: vec2 | number[]): number;
    export function forEach(a: Float32Array, stride: number, offset: number, count: number,
                          fn: (a: vec2 | number[], b: vec2 | number[]) => void): Float32Array;
    export function str(a: vec2 | number[]): string;
    export function exactEquals (a: vec2 | number[], b: vec2 | number[]): boolean;
    export function equals (a: vec2 | number[], b: vec2 | number[]): boolean;
}

declare module 'gl-vec3' {
    import { mat3 } from 'gl-mat3';
    import { mat4 } from 'gl-mat4';
    import { quat } from 'gl-quat';

    export type vec3 = Float32Array;
    export function create(): vec3;
    export function clone(a: vec3 | number[]): vec3;
    export function fromValues(x: number, y: number, z: number): vec3;
    export function copy(out: vec3, a: vec3 | number[]): vec3;
    export function set(out: vec3, x: number, y: number, z: number): vec3;
    export function add(out: vec3, a: vec3 | number[], b: vec3 | number[]): vec3;
    export function subtract(out: vec3, a: vec3 | number[], b: vec3 | number[]): vec3;
    export function sub(out: vec3, a: vec3 | number[], b: vec3 | number[]): vec3
    export function multiply(out: vec3, a: vec3 | number[], b: vec3 | number[]): vec3;
    export function mul(out: vec3, a: vec3 | number[], b: vec3 | number[]): vec3;
    export function divide(out: vec3, a: vec3 | number[], b: vec3 | number[]): vec3;
    export function div(out: vec3, a: vec3 | number[], b: vec3 | number[]): vec3;
    export function ceil (out: vec3, a: vec3 | number[]): vec3;
    export function floor (out: vec3, a: vec3 | number[]): vec3;
    export function min(out: vec3, a: vec3 | number[], b: vec3 | number[]): vec3;
    export function max(out: vec3, a: vec3 | number[], b: vec3 | number[]): vec3;
    export function round (out: vec3, a: vec3 | number[]): vec3
    export function scale(out: vec3, a: vec3 | number[], b: number): vec3;
    export function scaleAndAdd(out: vec3, a: vec3 | number[], b: vec3 | number[], scale: number): vec3;
    export function distance(a: vec3 | number[], b: vec3 | number[]): number;
    export function dist(a: vec3 | number[], b: vec3 | number[]): number;
    export function squaredDistance(a: vec3 | number[], b: vec3 | number[]): number;
    export function sqrDist(a: vec3 | number[], b: vec3 | number[]): number;
    export function length(a: vec3 | number[]): number;
    export function len(a: vec3 | number[]): number;
    export function squaredLength(a: vec3 | number[]): number;
    export function sqrLen(a: vec3 | number[]): number;
    export function negate(out: vec3, a: vec3 | number[]): vec3;
    export function inverse(out: vec3, a: vec3 | number[]): vec3;
    export function normalize(out: vec3, a: vec3 | number[]): vec3;
    export function dot(a: vec3 | number[], b: vec3 | number[]): number;
    export function cross(out: vec3, a: vec3 | number[], b: vec3 | number[]): vec3;
    export function lerp(out: vec3, a: vec3 | number[], b: vec3 | number[], t: number): vec3;
    export function hermite (out: vec3, a: vec3 | number[], b: vec3 | number[], c: vec3 | number[], d: vec3 | number[], t: number): vec3;
    export function bezier (out: vec3, a: vec3 | number[], b: vec3 | number[], c: vec3 | number[], d: vec3 | number[], t: number): vec3;
    export function random(out: vec3): vec3;
    export function random(out: vec3, scale: number): vec3;
    export function transformMat3(out: vec3, a: vec3 | number[], m: mat3): vec3;
    export function transformMat4(out: vec3, a: vec3 | number[], m: mat4): vec3;
    export function transformQuat(out: vec3, a: vec3 | number[], q: quat): vec3;
    export function rotateX(out: vec3, a: vec3 | number[], b: vec3 | number[], c: number): vec3;
    export function rotateY(out: vec3, a: vec3 | number[], b: vec3 | number[], c: number): vec3;
    export function rotateZ(out: vec3, a: vec3 | number[], b: vec3 | number[], c: number): vec3;
    export function forEach(a: Float32Array, stride: number, offset: number, count: number,
                          fn: (a: vec3 | number[], b: vec3 | number[], arg: any) => void, arg: any): Float32Array;
    export function forEach(a: Float32Array, stride: number, offset: number, count: number,
                          fn: (a: vec3 | number[], b: vec3 | number[]) => void): Float32Array;
    export function angle(a: vec3 | number[], b: vec3 | number[]): number;
    export function str(a: vec3 | number[]): string;
    export function exactEquals (a: vec3 | number[], b: vec3 | number[]): boolean
    export function equals (a: vec3 | number[], b: vec3 | number[]): boolean
}

declare module 'gl-vec4' {
    import { quat } from 'gl-quat';
    import { mat4 } from 'gl-mat4';

    export type vec4 = Float32Array;
    export function create(): vec4;
    export function clone(a: vec4 | number[]): vec4;
    export function fromValues(x: number, y: number, z: number, w: number): vec4;
    export function copy(out: vec4, a: vec4 | number[]): vec4;
    export function set(out: vec4, x: number, y: number, z: number, w: number): vec4;
    export function add(out: vec4, a: vec4 | number[], b: vec4 | number[]): vec4;
    export function subtract(out: vec4, a: vec4 | number[], b: vec4 | number[]): vec4;
    export function sub(out: vec4, a: vec4 | number[], b: vec4 | number[]): vec4;
    export function multiply(out: vec4, a: vec4 | number[], b: vec4 | number[]): vec4;
    export function mul(out: vec4, a: vec4 | number[], b: vec4 | number[]): vec4;
    export function divide(out: vec4, a: vec4 | number[], b: vec4 | number[]): vec4;
    export function div(out: vec4, a: vec4 | number[], b: vec4 | number[]): vec4;
    export function ceil (out: vec4, a: vec4 | number[]): vec4;
    export function floor (out: vec4, a: vec4 | number[]): vec4;
    export function min(out: vec4, a: vec4 | number[], b: vec4 | number[]): vec4;
    export function max(out: vec4, a: vec4 | number[], b: vec4 | number[]): vec4;
    export function round (out: vec4, a: vec4 | number[]): vec4;
    export function scale(out: vec4, a: vec4 | number[], b: number): vec4;
    export function scaleAndAdd(out: vec4, a: vec4 | number[], b: vec4 | number[], scale: number): vec4;
    export function distance(a: vec4 | number[], b: vec4 | number[]): number;
    export function dist(a: vec4 | number[], b: vec4 | number[]): number;
    export function squaredDistance(a: vec4 | number[], b: vec4 | number[]): number;
    export function sqrDist(a: vec4 | number[], b: vec4 | number[]): number;
    export function length(a: vec4 | number[]): number;
    export function len(a: vec4 | number[]): number;
    export function squaredLength(a: vec4 | number[]): number;
    export function sqrLen(a: vec4 | number[]): number;
    export function negate(out: vec4, a: vec4 | number[]): vec4;
    export function inverse(out: vec4, a: vec4 | number[]): vec4;
    export function normalize(out: vec4, a: vec4 | number[]): vec4;
    export function dot(a: vec4 | number[], b: vec4 | number[]): number;
    export function lerp(out: vec4, a: vec4 | number[], b: vec4 | number[], t: number): vec4;
    export function random(out: vec4): vec4;
    export function random(out: vec4, scale: number): vec4;
    export function transformMat4(out: vec4, a: vec4 | number[], m: mat4): vec4;
    export function transformQuat(out: vec4, a: vec4 | number[], q: quat): vec4;
    export function forEach(a: Float32Array, stride: number, offset: number, count: number,
                          fn: (a: vec4 | number[], b: vec4 | number[], arg: any) => void, arg: any): Float32Array;
    export function forEach(a: Float32Array, stride: number, offset: number, count: number,
                          fn: (a: vec4 | number[], b: vec4 | number[]) => void): Float32Array;
    export function str(a: vec4 | number[]): string;
    export function exactEquals (a: vec4 | number[], b: vec4 | number[]): boolean;
    export function equals (a: vec4 | number[], b: vec4 | number[]): boolean;
}

declare module 'gl-mat2' {
    import { vec2 } from 'gl-vec2';

    export type mat2 = Float32Array;
    export function create(): mat2;
    export function clone(a: mat2): mat2;
    export function copy(out: mat2, a: mat2): mat2;
    export function identity(out: mat2): mat2;
    export function fromValues(m00: number, m01: number, m10: number, m11: number): mat2;
    export function set(out: mat2, m00: number, m01: number, m10: number, m11: number): mat2;
    export function transpose(out: mat2, a: mat2): mat2;
    export function invert(out: mat2, a: mat2): mat2 | null;
    export function adjoint(out: mat2, a: mat2): mat2;
    export function determinant(a: mat2): number;
    export function multiply(out: mat2, a: mat2, b: mat2): mat2;
    export function mul(out: mat2, a: mat2, b: mat2): mat2;
    export function rotate(out: mat2, a: mat2, rad: number): mat2;
    export function scale(out: mat2, a: mat2, v: vec2 | number[]): mat2;
    export function fromRotation(out: mat2, rad: number): mat2;
    export function fromScaling(out: mat2, v: vec2 | number[]): mat2;
    export function str(a: mat2): string;
    export function frob(a: mat2): number;
    export function LDU(L: mat2, D: mat2, U: mat2, a: mat2): mat2;
    export function add(out: mat2, a: mat2, b: mat2): mat2;
    export function subtract (out: mat2, a: mat2, b: mat2): mat2;
    export function sub (out: mat2, a: mat2, b: mat2): mat2;
    export function exactEquals (a: mat2, b: mat2): boolean;
    export function equals (a: mat2, b: mat2): boolean;
    export function multiplyScalar (out: mat2, a: mat2, b: number): mat2
    export function multiplyScalarAndAdd (out: mat2, a: mat2, b: mat2, scale: number): mat2
}

declare module 'gl-mat2d' {
    import { vec2 } from 'gl-vec2';

    export type mat2d = Float32Array;
    export function create(): mat2d;
    export function clone(a: mat2d): mat2d;
    export function copy(out: mat2d, a: mat2d): mat2d;
    export function identity(out: mat2d): mat2d;
    export function fromValues (a: number, b: number, c: number, d: number, tx: number, ty: number): mat2d
    export function set (out: mat2d, a: number, b: number, c: number, d: number, tx: number, ty: number): mat2d
    export function invert(out: mat2d, a: mat2d): mat2d | null;
    export function determinant(a: mat2d): number;
    export function multiply(out: mat2d, a: mat2d, b: mat2d): mat2d;
    export function mul(out: mat2d, a: mat2d, b: mat2d): mat2d;
    export function rotate(out: mat2d, a: mat2d, rad: number): mat2d;
    export function scale(out: mat2d, a: mat2d, v: vec2 | number[]): mat2d;
    export function translate(out: mat2d, a: mat2d, v: vec2 | number[]): mat2d;
    export function fromRotation (out: mat2d, rad: number): mat2d;
    export function fromScaling (out: mat2d, v: vec2 | number[]): mat2d;
    export function fromTranslation (out: mat2d, v: vec2 | number[]): mat2d
    export function str(a: mat2d): string;
    export function frob(a: mat2d): number;
    export function add (out: mat2d, a: mat2d, b: mat2d): mat2d
    export function subtract(out: mat2d, a: mat2d, b: mat2d): mat2d
    export function sub(out: mat2d, a: mat2d, b: mat2d): mat2d
    export function multiplyScalar (out: mat2d, a: mat2d, b: number): mat2d;
    export function multiplyScalarAndAdd (out: mat2d, a: mat2d, b: mat2d, scale: number): mat2d
    export function exactEquals (a: mat2d, b: mat2d): boolean;
    export function equals (a: mat2d, b: mat2d): boolean
}

declare module 'gl-mat3' {
    import { mat2d } from 'gl-mat2d';
    import { mat4 } from 'gl-mat4';
    import { quat } from 'gl-quat';
    import { vec2 } from 'gl-vec2';
    import { vec3 } from 'gl-vec3';

    export type mat3 = Float32Array;
    export function create(): mat3;
    export function fromMat4(out: mat3, a: mat4): mat3
    export function clone(a: mat3): mat3;
    export function copy(out: mat3, a: mat3): mat3;
    export function fromValues(m00: number, m01: number, m02: number, m10: number, m11: number, m12: number, m20: number, m21: number, m22: number): mat3;
    export function set(out: mat3, m00: number, m01: number, m02: number, m10: number, m11: number, m12: number, m20: number, m21: number, m22: number): mat3
    export function identity(out: mat3): mat3;
    export function transpose(out: mat3, a: mat3): mat3;
    export function projection(out: mat3, width: number, height: number): mat3;
    export function invert(out: mat3, a: mat3): mat3 | null;
    export function adjoint(out: mat3, a: mat3): mat3;
    export function determinant(a: mat3): number;
    export function multiply(out: mat3, a: mat3, b: mat3): mat3;
    export function mul(out: mat3, a: mat3, b: mat3): mat3;
    export function translate(out: mat3, a: mat3, v: vec3 | number[]): mat3;
    export function rotate(out: mat3, a: mat3, rad: number): mat3;
    export function scale(out: mat3, a: mat3, v: vec2 | number[]): mat3;
    export function fromTranslation(out: mat3, v: vec2 | number[]): mat3
    export function fromRotation(out: mat3, rad: number): mat3
    export function fromScaling(out: mat3, v: vec2 | number[]): mat3
    export function fromMat2d(out: mat3, a: mat2d): mat3;
    export function fromQuat(out: mat3, q: quat): mat3;
    export function normalFromMat4(out: mat3, a: mat4): mat3 | null;
    export function str(mat: mat3): string;
    export function frob(a: mat3): number;
    export function add(out: mat3, a: mat3, b: mat3): mat3
    export function subtract(out: mat3, a: mat3, b: mat3): mat3
    export function sub(out: mat3, a: mat3, b: mat3): mat3
    export function multiplyScalar(out: mat3, a: mat3, b: number): mat3
    export function multiplyScalarAndAdd(out: mat3, a: mat3, b: mat3, scale: number): mat3
    export function exactEquals(a: mat3, b: mat3): boolean;
    export function equals(a: mat3, b: mat3): boolean
}

declare module 'gl-mat4' {
    import { vec3 } from 'gl-vec3';
    import { quat } from 'gl-quat';

    export type mat4 = Float32Array;
    export function create(): mat4;
    export function clone(a: mat4): mat4;
    export function copy(out: mat4, a: mat4): mat4;
    export function fromValues(m00: number, m01: number, m02: number, m03: number, m10: number, m11: number, m12: number, m13: number, m20: number, m21: number, m22: number, m23: number, m30: number, m31: number, m32: number, m33: number): mat4;
    export function set(out: mat4, m00: number, m01: number, m02: number, m03: number, m10: number, m11: number, m12: number, m13: number, m20: number, m21: number, m22: number, m23: number, m30: number, m31: number, m32: number, m33: number): mat4;
    export function identity(out: mat4): mat4;
    export function transpose(out: mat4, a: mat4): mat4;
    export function invert(out: mat4, a: mat4): mat4 | null;
    export function adjoint(out: mat4, a: mat4): mat4;
    export function determinant(a: mat4): number;
    export function multiply(out: mat4, a: mat4, b: mat4): mat4;
    export function mul(out: mat4, a: mat4, b: mat4): mat4;
    export function translate(out: mat4, a: mat4, v: vec3 | number[]): mat4;
    export function scale(out: mat4, a: mat4, v: vec3 | number[]): mat4;
    export function rotate(out: mat4, a: mat4, rad: number, axis: vec3 | number[]): mat4;
    export function rotateX(out: mat4, a: mat4, rad: number): mat4;
    export function rotateY(out: mat4, a: mat4, rad: number): mat4;
    export function rotateZ(out: mat4, a: mat4, rad: number): mat4;
    export function fromTranslation(out: mat4, v: vec3 | number[]): mat4
    export function fromScaling(out: mat4, v: vec3 | number[]): mat4
    export function fromRotation(out: mat4, rad: number, axis: vec3 | number[]): mat4
    export function fromXRotation(out: mat4, rad: number): mat4
    export function fromYRotation(out: mat4, rad: number): mat4
    export function fromZRotation(out: mat4, rad: number): mat4
    export function fromRotationTranslation(out: mat4, q: quat, v: vec3 | number[]): mat4;
    export function getTranslation(out: vec3, mat: mat4): vec3;
    export function getScaling(out: vec3, mat: mat4): vec3;
    export function getRotation(out: quat, mat: mat4): quat;
    export function fromRotationTranslationScale(out: mat4, q: quat, v: vec3 | number[], s: vec3 | number[]): mat4;
    export function fromRotationTranslationScaleOrigin(out: mat4, q: quat, v: vec3 | number[], s: vec3 | number[], o: vec3 | number[]): mat4
    export function fromQuat(out: mat4, q: quat): mat4
    export function frustum(out: mat4, left: number, right: number,
                          bottom: number, top: number, near: number, far: number): mat4;
    export function perspective(out: mat4, fovy: number, aspect: number,
                              near: number, far: number): mat4;
    export function perspectiveFromFieldOfView(out: mat4,
                                             fov:{upDegrees: number, downDegrees: number, leftDegrees: number, rightDegrees: number},
                                             near: number, far: number): mat4
    export function ortho(out: mat4, left: number, right: number,
                        bottom: number, top: number, near: number, far: number): mat4;
    export function lookAt(out: mat4, eye: vec3 | number[], center: vec3 | number[], up: vec3 | number[]): mat4;
    export function str(mat: mat4): string;
    export function frob(a: mat4): number;
    export function add(out: mat4, a: mat4, b: mat4): mat4
    export function subtract(out: mat4, a: mat4, b: mat4): mat4
    export function sub(out: mat4, a: mat4, b: mat4): mat4
    export function multiplyScalar(out: mat4, a: mat4, b: number): mat4
    export function multiplyScalarAndAdd (out: mat4, a: mat4, b: mat4, scale: number): mat4
    export function exactEquals (a: mat4, b: mat4): boolean
    export function equals (a: mat4, b: mat4): boolean
}

declare module 'gl-quat' {
    import { vec3 } from 'gl-vec3';
    import { mat3 } from 'gl-mat3';

    export type quat = Float32Array;
    export function create(): quat;
    export function clone(a: quat): quat;
    export function fromValues(x: number, y: number, z: number, w: number): quat;
    export function copy(out: quat, a: quat): quat;
    export function set(out: quat, x: number, y: number, z: number, w: number): quat;
    export function identity(out: quat): quat;
    export function rotationTo (out: quat, a: vec3 | number[], b: vec3 | number[]): quat;
    export function setAxes (out: quat, view: vec3 | number[], right: vec3 | number[], up: vec3 | number[]): quat
    export function setAxisAngle(out: quat, axis: vec3 | number[], rad: number): quat;
    export function getAxisAngle (out_axis: vec3 | number[], q: quat): number
    export function add(out: quat, a: quat, b: quat): quat;
    export function multiply(out: quat, a: quat, b: quat): quat;
    export function mul(out: quat, a: quat, b: quat): quat;
    export function scale(out: quat, a: quat, b: number): quat;
    export function length(a: quat): number;
    export function len(a: quat): number;
    export function squaredLength(a: quat): number;
    export function sqrLen(a: quat): number;
    export function normalize(out: quat, a: quat): quat;
    export function dot(a: quat, b: quat): number;
    export function fromEuler(out: quat, x: number, y: number, z: number): quat;
    export function lerp(out: quat, a: quat, b: quat, t: number): quat;
    export function slerp(out: quat, a: quat, b: quat, t: number): quat;
    export function sqlerp(out: quat, a: quat, b: quat, c: quat, d: quat, t: number): quat;
    export function invert(out: quat, a: quat): quat;
    export function conjugate(out: quat, a: quat): quat;
    export function str(a: quat): string;
    export function rotateX(out: quat, a: quat, rad: number): quat;
    export function rotateY(out: quat, a: quat, rad: number): quat;
    export function rotateZ(out: quat, a: quat, rad: number): quat;
    export function fromMat3(out: quat, m: mat3): quat;
    export function setAxes(out: quat, view: vec3 | number[], right: vec3 | number[], up: vec3 | number[]): quat;
    export function rotationTo(out: quat, a: vec3 | number[], b: vec3 | number[]): quat;
    export function calculateW(out: quat, a: quat): quat;
    export function exactEquals (a: quat, b: quat): boolean;
    export function equals (a: quat, b: quat): boolean;
}


/*
declare module 'gl-vec2' {
    import { vec2 } from 'gl-matrix';
    export = vec2;
}
declare module 'gl-vec3' {
    import { vec3 } from 'gl-matrix';
    export = vec3;
}
declare module 'gl-vec4' {
    import { vec4 } from 'gl-matrix';
    export = vec4;
}
declare module 'gl-mat2' {
    import { mat2 } from 'gl-matrix';
    export = mat2;
}
declare module 'gl-mat2d' {
    import { mat2d } from 'gl-matrix';
    export = mat2d;
}
declare module 'gl-mat3' {
    import { mat3 } from 'gl-matrix';
    export = mat3;
}
declare module 'gl-mat4' {
    // import { mat4 } from 'gl-matrix';
    // export = mat4;
  type mat4 = Float32Array;
  export function perspective(out: mat4, fovy: number, aspect: number,
                            near: number, far: number): mat4;
}
*/
/*
declare module 'gl-quat' {
    import { quat } from 'gl-matrix';
    export = quat;
}
*/
