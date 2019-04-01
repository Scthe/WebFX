import {Vao, Buffer} from 'resources';

export class MeshComponent {
  constructor(
    public readonly vao: Vao,
    public readonly indexGlType: GLenum, // e.g. gl.UNSIGNED_SHORT
    public readonly indexBuffer: Buffer,
    public readonly triangleCnt: number,
  ) { }

  destroy(gl: Webgl) {
    this.vao.destroy(gl);
    this.indexBuffer.destroy(gl);
  }
}
