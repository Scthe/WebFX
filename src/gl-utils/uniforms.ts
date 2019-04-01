import {getGlConstName} from 'gl-utils';
import {Device} from 'Device';
import {Shader, Texture} from 'resources';

// https://github.com/greggman/twgl.js/blob/master/src/programs.js#L316
// https://github.com/floooh/altai/blob/master/src/altai.ts#L557


type UniformValueType =
  Float32Array | Int32Array | Uint32Array |
  Texture | number;

type UniformValues = {[name: string]: UniformValueType};

interface TextureUniform { name: string; texture: Texture; }


const unknownUniform = (name: string) =>
  `Uniform '${name}' was not found, all uniforms ` +
  'for this call of setUniforms have forced validation ON';

const unrecognisedType = (name: string, type: GLenum) =>
  `Uniform '${name}' has not recognised type ${type}(${getGlConstName(type)}), ` +
  'all uniforms for this call of setUniforms have forced validation ON';


type UniformSetter = (gl: Webgl, location: GLint, value: UniformValueType) => void;

const createVectorSetter = (fnName: string) => (gl: Webgl, location: GLint, value: UniformValueType) => {
  (gl as any)[fnName](location, value); // TODO use .apply, TS can now validate these calls
};

const createMatrixSetter = (fnName: string) => (gl: Webgl, location: GLint, value: UniformValueType) => {
  (gl as any)[fnName](location, false, value);
};


const getUniformSetter = (gl: Webgl, type: GLenum): UniformSetter => {
  switch (type) {
    case gl.FLOAT:      return createVectorSetter('uniform1f');
    case gl.FLOAT_VEC2: return createVectorSetter('uniform2fv'); // Float32Array
    case gl.FLOAT_VEC3: return createVectorSetter('uniform3fv');
    case gl.FLOAT_VEC4: return createVectorSetter('uniform4fv');
    case gl.INT:      return createVectorSetter('uniform1i');
    case gl.INT_VEC2: return createVectorSetter('uniform2iv'); // Int32Array
    case gl.INT_VEC3: return createVectorSetter('uniform3iv');
    case gl.INT_VEC4: return createVectorSetter('uniform4iv');
    case gl.UNSIGNED_INT:      return createVectorSetter('uniform1ui');
    case gl.UNSIGNED_INT_VEC2: return createVectorSetter('uniform2uiv'); // Int32Array
    case gl.UNSIGNED_INT_VEC3: return createVectorSetter('uniform3uiv');
    case gl.UNSIGNED_INT_VEC4: return createVectorSetter('uniform4uiv');
    case gl.FLOAT_MAT2: return createMatrixSetter('uniformMatrix2fv');
    case gl.FLOAT_MAT3: return createMatrixSetter('uniformMatrix3fv');
    case gl.FLOAT_MAT4: return createMatrixSetter('uniformMatrix4fv');
  }
  return null; // this may be legal during development
};

const isSamplerUniform = (gl: Webgl, type: GLenum) => {
  const samplerUniforms = [
    gl.SAMPLER_2D,
    gl.INT_SAMPLER_2D,
    gl.UNSIGNED_INT_SAMPLER_2D,
    gl.SAMPLER_2D_SHADOW,
    gl.SAMPLER_CUBE,
    gl.UNSIGNED_INT_SAMPLER_CUBE,
  ];
  return samplerUniforms.includes(type);
};

const getFromShader = (shader: Shader, name: string, forceAll: boolean) => {
  const shaderUniform = shader.getUniform(name);
  if (!shaderUniform) {
    if (forceAll) { throw unknownUniform(name); }
    return null;
  }
  return shaderUniform;
};


export const setUniforms = (
  device: Device,
  shader: Shader,
  uniforms: UniformValues,
  forceAll = false
) => {
  const {gl, textureBindingState} = device;
  const textureUniforms = [] as TextureUniform[];

  // set simple uniforms, extract textures
  Object.keys(uniforms).forEach(name => {
    const value = uniforms[name];

    if (value === null || value === undefined) {
      throw `Uniform '${name}' cannot be set to invalid value '${value}'`;

    } else if (value instanceof Texture) {
      textureUniforms.push({ name, texture: value });

    } else {
      const shaderUniform = getFromShader(shader, name, forceAll);
      if (shaderUniform) {
        const setter = getUniformSetter(gl, shaderUniform.type);
        if (setter) {
          setter(gl, shaderUniform.location, value);
        } else if (forceAll) {
          throw unrecognisedType(name, shaderUniform.type);
        }
      }
    }
  });

  // set textures, while minimizing texture rebinding
  const bindingIndicesMap = textureBindingState.replaceTextures(
    gl, textureUniforms.map(e => e.texture)
  );
  textureUniforms.forEach(textureUni => {
    const {name, texture} = textureUni;
    const shaderUniform = getFromShader(shader, name, forceAll);
    if (!shaderUniform) { return; } // not used?
    if (!isSamplerUniform(gl, shaderUniform.type)) {
      throw `Uniform '${name}' of type ${getGlConstName(shaderUniform.type)} cannot be assigned texture`;
    }

    // Textures use intermediate step:
    // 1. bind this texture to right 'slot' in texture slots array (using gl.activeTexture and gl.bindTexture)
    // 2. connect the uniform to the same 'slot'
    const bindingIdx = bindingIndicesMap[texture.uuid];
    if (!textureBindingState.isValidBindingIndex(bindingIdx)) {
      throw (
        `Error binding texture for shader. Returned invalid binding index ${bindingIdx},`
        + ` only ${textureBindingState.maxTextures} are supported`
      );
    }
    // console.log(`${getGlConstName(shaderUniform.type)}.${name} = ${getGlConstName(texture.sizedPixelFormat)}@${bindingIdx}`);
    gl.uniform1i(shaderUniform.location, bindingIdx);
  });
};
