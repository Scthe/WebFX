import STATIC_GL from 'gl-utils/gimme_gl';
import {ArrayBufferView} from 'gl-utils';
import {GlResource, verifyOk} from './GlResource';

export enum BufferType {
  /// geometry related
  VertexBuffer = STATIC_GL.ARRAY_BUFFER,
  IndexBuffer = STATIC_GL.ELEMENT_ARRAY_BUFFER,

  /// Every function that performs a pixel transfer operation can use buffer objects
  /// instead of client memory. Functions that perform:
  /// * upload operation (a pixel unpack) can use GL_PIXEL_UNPACK_BUFFER f.e. glDrawPixels, glTexImage2D, glTexSubImage2D
  /// * download operation (a pixel pack) can use GL_PIXEL_PACK_BUFFER f.e. glReadPixels, glGetTexImage
  ///
  /// Example usage: when want to copy buffer->texture or texture->buffer. Since we can
  /// easily manipulate buffers (at least easier then textures) this is quite helpful.
  /// For example it was only way to read only part of texture before
  /// opengl 4.5 (glGetTextureSubImage). It also helps with sync/async stalls.
  ///
  /// @see https://www.khronos.org/opengl/wiki/Pixel_Buffer_Object
  /// @see http://www.songho.ca/opengl/gl_pbo.html
  ReadFromTextureBuffer = STATIC_GL.PIXEL_PACK_BUFFER,
  WriteIntoTextureBuffer = STATIC_GL.PIXEL_UNPACK_BUFFER,

  /// Helper buffer targets when we need to copy between 2 buffers in old opengl (no dsa).
  /// We would bind source to GL_COPY_READ_BUFFER and target to GL_COPY_WRITE_BUFFER
  /// and initiate copy operation between them
  CopyReadBuffer = STATIC_GL.COPY_READ_BUFFER,
  CopyWriteBuffer = STATIC_GL.COPY_WRITE_BUFFER,

  /// Accessible from shaders. Each represents quite different feature, so best to read about them one by one
  UniformBuffer = STATIC_GL.UNIFORM_BUFFER,
  TransformFeedbackBuffer = STATIC_GL.TRANSFORM_FEEDBACK_BUFFER,
}


export enum BufferUsage {
  STREAM_DRAW = STATIC_GL.STREAM_DRAW,
  STREAM_READ = STATIC_GL.STREAM_READ,
  STREAM_COPY = STATIC_GL.STREAM_COPY,
  // Default:
  STATIC_DRAW = STATIC_GL.STATIC_DRAW,
  STATIC_READ = STATIC_GL.STATIC_READ,
  STATIC_COPY = STATIC_GL.STATIC_COPY,
  // When buffer's content is modified multiple times per frame
  DYNAMIC_DRAW = STATIC_GL.DYNAMIC_DRAW,
  DYNAMIC_READ = STATIC_GL.DYNAMIC_READ,
  DYNAMIC_COPY = STATIC_GL.DYNAMIC_COPY,
}


/** All in elements, not bytes for some reason? */
interface BufferRange {
  offset: number; size: number;
}
const brStart = (b: BufferRange) => b.offset;
// const brEnd = (b: BufferRange) => b.offset + b.size;
const brSize = (b: BufferRange) => b.size;


export class Buffer extends GlResource<WebGLBuffer> {

  private constructor (
    glId_: WebGLBuffer,
    public readonly type: BufferType, // in Webgl, we cannot change type of bind after first gl.bindBuffer was called
    public readonly usage: BufferUsage,
    public readonly bytes: number,
  ) {
    super(glId_, 'Buffer');
  }

  static fromData (gl: Webgl, type: BufferType, usage: BufferUsage, data: ArrayBufferView, dataOffset?: BufferRange): Buffer {
    if (!dataOffset) {
      dataOffset = { offset: 0, size: data.length, }; // why not .byteLength?!
    }

    const buf = new Buffer(gl.createBuffer(), type, usage, brSize(dataOffset));
    gl.bindBuffer(type, buf.glId);
    gl.bufferData(type, data, buf.usage, brStart(dataOffset), brSize(dataOffset));
    return buf;
  }

  static fromSize (gl: Webgl, type: BufferType, usage: BufferUsage, sizeBytes: number): Buffer {
    const buf = new Buffer(gl.createBuffer(), type, usage, sizeBytes);
    gl.bindBuffer(type, buf.glId);
    gl.bufferData(type, buf.bytes, buf.usage);
    return buf;
  }

  @verifyOk
  bind (gl: Webgl) {
    gl.bindBuffer(this.type, this.glId); // fun fact: this function has :any as 2nd arg
  }

  // TODO write() <- use bufferSubData
  // TODO copy() <- use copyBufferSubData

  rangeBytes = (): BufferRange => ({ offset: 0, size: this.bytes, });

  destroy (gl: Webgl) {
    if (this.isOk) {
      gl.deleteBuffer(this.glId);
      this.glId_ = null;
    }
  }

}
