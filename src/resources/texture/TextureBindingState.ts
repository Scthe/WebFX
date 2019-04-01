import times from 'lodash-es/times';
import {getGlConstName} from 'gl-utils';
import {Texture} from 'resources';

// WebGLTexture => bindingIdx
interface UpdatedBindings { [glId: /*WebGLTexture*/number]: number; }


/** Webgl likes to complain a lot about mismatched types of textures,
 *  wrong sampler types etc. It's useful but iritating. This is CPU side
 *  cache to automatize binding process. We can also use it for debug
 */
export class TextureBindingState {
  private readonly bindings: WebGLTexture[] = [];
  /** Max textures of each type */
  public readonly maxTextures: number;

  constructor (gl: Webgl) {
    this.maxTextures = gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
    this.bindings = times(this.maxTextures, () => this.bindings.push(undefined));
  }

  getBindingIdx (texGlId: WebGLTexture): number {
    return this.bindings.findIndex(e => e === texGlId);
  }

  bindSingle (gl: Webgl, tex: Texture) {
    this.assign(gl, 0, tex);
  }

  isValidBindingIndex (bindIdx: number) {
    return bindIdx >= 0 && bindIdx < this.maxTextures;
  }

  replaceTextures (gl: Webgl, textures: Texture[]): UpdatedBindings {
    if (textures.length >= this.maxTextures) {
      throw `Tried to bind ${textures.length} textures, only ${this.maxTextures} are supported`;
    }

    const result = {} as UpdatedBindings;
    const notAssignedTex = [] as Texture[];
    textures.forEach(tex => {
      const idx = this.getBindingIdx(tex.glId);
      if (idx === -1) {
        notAssignedTex.push(tex);
      } else {
        result[tex.uuid] = idx;
      }
    });

    while (notAssignedTex.length > 0) {
      const tex = notAssignedTex.pop();
      const nextUnusedBindIdx = this.getNextUnusedBindingIdx(result);
      if (nextUnusedBindIdx === -1) {
        throw `Could not find free texture binding index. This should be impossible`;
      } else {
        this.assign(gl, nextUnusedBindIdx, tex);
        result[tex.uuid] = nextUnusedBindIdx;
      }
    }

    return result;
  }

  private getNextUnusedBindingIdx (bindings: UpdatedBindings) {
    const usedBindingIndices = Object.values(bindings) as number[];
    // instead of taking bindings sequentially (which would reuse only e.g. 4
    // bindings max), we should use as much bindings as possible.
    // Honestly, just shuffle the indices array
    for (let i = 0; i < this.maxTextures; i++) {
      if (!usedBindingIndices.includes(i)) {
        return i;
      }
    }
    return -1;
  }

  private assign (gl: Webgl, bindIdx: number, tex: Texture) {
    if (!this.isValidBindingIndex(bindIdx)) {
      throw `Tried to assign to binding [${bindIdx}], max is ${this.maxTextures}`;
    }
    if (!tex.isOk) {
      throw `Tried to bind not allocated texture (${getGlConstName(tex.type)})`;
    }
    gl.activeTexture(gl.TEXTURE0 + bindIdx);
    gl.bindTexture(tex.type, tex.glId);
    this.bindings[bindIdx] = tex.glId;
  }

}
