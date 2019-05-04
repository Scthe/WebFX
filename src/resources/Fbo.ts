import every from 'lodash-es/every';
import {vec2, fromValues as Vec2} from 'gl-vec2';
import STATIC_GL from 'gl-utils/gimme_gl';
import {GlResource, verifyOk} from './GlResource';
import {Texture} from './texture/Texture';
import {getGlConstName} from 'gl-utils';


export enum FboBindType {
  All = STATIC_GL.FRAMEBUFFER,
  Read = STATIC_GL.READ_FRAMEBUFFER, // only for copy between fbos?
  Draw = STATIC_GL.DRAW_FRAMEBUFFER,
}

interface AttachmentInfo {
  glId: WebGLTexture;
  /** e.g.
    *  - gl.COLOR_ATTACHMENT0 + i,
    *  - DEPTH_ATTACHMENT,
    *  - DEPTH_STENCIL_ATTACHMENT
    *  - STENCIL_ATTACHMENT (should not be possible to create)
    */
  attachmentId: GLenum;
}
const isDepthAttachment = (att: AttachmentInfo) => {
  const depthFormats = [STATIC_GL.DEPTH_ATTACHMENT, STATIC_GL.DEPTH_STENCIL_ATTACHMENT];
  return depthFormats.includes(att.attachmentId);
};


const texturesSameSize = (attachments: Texture[]) => {
  const w = attachments[0].width;
  const h = attachments[0].height;
  return every(attachments, a => a.width === w && a.height === h);
};

const validateAttachments = (attachments: Texture[]) => {
  if (attachments.length === 0) {
    throw `Tried to create Fbo with 0 attachments`;
  }

  if (!texturesSameSize(attachments)) {
    const sizeArrStr = attachments.map(a => `(${a.width}x${a.height})`).join(', ');
    throw `Tried to create Fbo with attachments of different size: ${sizeArrStr}`;
  }

  const depthTex = attachments.filter(t => t.isDepth); // lodash/partition has weird typings?!
  const colorTex = attachments.filter(t => !t.isDepth);
  if (depthTex.length > 1) {
    throw `Tried to create Fbo with ${depthTex.length} depth/stencil attachments. Use at most 1`;
  }

  const attachmentInfos: AttachmentInfo[] = [];
  if (depthTex[0]) {
    const d = depthTex[0];
    attachmentInfos.push({
      glId: d.glId,
      // no standalone STENCIL_ATTACHMENT?
      attachmentId: d.isDepthStencil ? STATIC_GL.DEPTH_STENCIL_ATTACHMENT : STATIC_GL.DEPTH_ATTACHMENT,
    });
  }

  colorTex.forEach((tex: Texture, i: number) => {
    attachmentInfos.push({
      glId: tex.glId,
      attachmentId: STATIC_GL.COLOR_ATTACHMENT0 + i,
    });
  });

  return attachmentInfos;
};


export class Fbo extends GlResource<WebGLFramebuffer> {

  public readonly dimensions: vec2;
  public readonly attachments: AttachmentInfo[];

  constructor (gl: Webgl, attachments: Texture[]) {
    super(gl.createFramebuffer(), 'Fbo');
    this.attachments = validateAttachments(attachments);
    this.dimensions = Vec2(attachments[0].width, attachments[0].height);

    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, this.glId);
    this.attachments.forEach(a =>
      gl.framebufferTexture2D(gl.DRAW_FRAMEBUFFER, a.attachmentId, gl.TEXTURE_2D, a.glId, 0)
    );

    this.bindAsDrawTarget(gl);

    const status = gl.checkFramebufferStatus(gl.DRAW_FRAMEBUFFER);
    if (status !== gl.FRAMEBUFFER_COMPLETE) {
      this.destroy(gl);
      throw `Fbo create error, checkFramebufferStatus: ${getGlConstName(status)}(${status.toString(16)})`;
    }
  }

  get width()  { return this.dimensions[0]; }
  get height() { return this.dimensions[1]; }

  @verifyOk
  bind (gl: Webgl, bindType: FboBindType, asRenderTarget = false) {
    gl.bindFramebuffer(bindType, this.glId);
    if (asRenderTarget) {
      this.bindAsDrawTarget(gl);
    }
  }

  private bindAsDrawTarget (gl: Webgl) {
    if (this.isOk) {
      const attIds = this.colorAttachments.map(a => a.attachmentId);
      gl.drawBuffers(attIds.length === 0 ? [gl.NONE] : attIds);
    } else {
      throw `Tried to use invalid Fbo`;
    }
  }

  get colorAttachments() {
    return this.attachments.filter(a => !isDepthAttachment(a));
  }

  destroy (gl: Webgl) {
    if (this.isOk) {
      gl.deleteFramebuffer(this.glId);
      this.glId_ = null;
    }
  }

}
