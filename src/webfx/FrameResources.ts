import {fromValues as Vec3} from 'gl-vec3';
import {
  Fbo, Shader,
  TextureType, Texture, createTextureOpts,
  TextureOpts, TextureFilterMin, TextureWrap, TextureFilterMag, isSizedTextureFormatInteger
} from 'resources';
import {Config} from 'Config';
import {Device} from 'Device';
import {Dimensions} from 'gl-utils';


const DEFAULT_RENDER_TARGET_TEXTURE_OPTS: TextureOpts = createTextureOpts({
  filterMin: TextureFilterMin.Linear,
  filterMag: TextureFilterMag.Linear,
  wrap: [TextureWrap.UseEdgePixel, TextureWrap.UseEdgePixel, TextureWrap.UseEdgePixel],
});


export class FrameResources {

  // shadows
  public shadowDepthTex: Texture;
  public shadowDepthFbo: Fbo;
  public shadowShader: Shader;
  public shadowTfxShader: Shader;
  // SSS - forward scattering
  public sssDepthTex: Texture; // actually, why not put this in alpha of forwardColor? just mask color write channels
  public sssDepthFbo: Fbo;
  // linear depth - will allow to use normal depth texture as stencil fbo attachment
  public linearDepthShader: Shader;
  public linearDepthTex: Texture;
  public linearDepthFbo: Fbo;
  // forward
  public meshShader: Shader;
  public forwardDepthTex: Texture;
  public forwardColorTex: Texture;
  public forwardFbo: Fbo;
  // TressFX
  public tfxShader: Shader;
  // SSS
  public sssBlurShader: Shader;
  public sssBlurPingPongTex: Texture;
  public sssBlurPingPongFbo: Fbo;
  // tonemapping
  public tonemappingShader: Shader;
  public tonemappingResultTex: Texture; // [rgb, luma]
  public tonemappingFbo: Fbo;
  // final
  public finalShader: Shader;
  public dbgShadowsShader: Shader;
  public dbgSphereShader: Shader;

  constructor (
    private cfg: Config
  ) {}

  public initialize (device: Device) {
    this.initializeShaders(device.gl);

    const shadowRes = this.initializeShadowResources(device, this.cfg.shadows.shadowmapSize);
    this.shadowDepthTex = shadowRes.texture;
    this.shadowDepthFbo = shadowRes.fbo;

    const sssRes = this.initializeShadowResources(device, this.cfg.lightSSS.depthmapSize);
    this.sssDepthTex = sssRes.texture;
    this.sssDepthFbo = sssRes.fbo;
  }

  onResize (device: Device, d: Dimensions) {
    this.destroyResizableResources(device.gl);

    this.initializeForwardPassResources(device, d);
    this.initializeLinearDepthPassResources(device, d);
    this.initializeTonemappingPassResources(device, d);
  }

  private initializeShaders (gl: Webgl) {
    this.shadowShader = new Shader(gl,
      require('shaders/shadow.vert.glsl'),
      require('shaders/shadow.frag.glsl'),
    );
    this.shadowTfxShader = new Shader(gl,
      require('shaders/shadow.tfx.vert.glsl'),
      require('shaders/shadow.frag.glsl'),
    );
    this.meshShader = new Shader(gl,
      require('shaders/sintel.vert.glsl'),
      require('shaders/sintel.frag.glsl'),
    );
    this.finalShader = new Shader(gl,
      require('shaders/fullscreenQuad.vert.glsl'),
      require('shaders/final.frag.glsl'),
    );
    this.dbgShadowsShader = new Shader(gl,
      require('shaders/fullscreenQuad.vert.glsl'),
      require('shaders/final.dbgShadows.frag.glsl'),
    );
    this.dbgSphereShader = new Shader(gl,
      require('shaders/final.dbgSphere.vert.glsl'),
      require('shaders/final.dbgSphere.frag.glsl'),
    );
    this.tonemappingShader = new Shader(gl,
      require('shaders/fullscreenQuad.vert.glsl'),
      require('shaders/tonemapping.frag.glsl'),
    );
    this.sssBlurShader = new Shader(gl,
      require('shaders/fullscreenQuad.vert.glsl'),
      require('shaders/sssBlur.frag.glsl'),
    );
    this.linearDepthShader = new Shader(gl,
      require('shaders/fullscreenQuad.vert.glsl'),
      require('shaders/linearDepth.frag.glsl'),
    );
    this.tfxShader = new Shader(gl,
      require('shaders/tfx.vert.glsl'),
      require('shaders/tfx.frag.glsl'),
    );
  }

  private initializeForwardPassResources (device: Device, d: Dimensions) {
    const {gl} = device;
    d = this.getFullscreenDimensions(d);

    this.forwardDepthTex = this.createTexture(
      device,
      gl.DEPTH24_STENCIL8, d,
      this.createTextureOpts(gl, gl.DEPTH24_STENCIL8)
    );
    this.forwardColorTex = this.createTexture(
      device,
      gl.RGBA32F, d,
      this.createTextureOpts(gl, gl.RGBA32F)
    );
    this.forwardFbo = new Fbo(gl, [
      this.forwardDepthTex,
      this.forwardColorTex,
    ]);

    // also SSS here, cause needs to be EXACT same
    this.sssBlurPingPongTex = this.createTexture(
      device,
      gl.RGBA32F, d,
      this.createTextureOpts(gl, gl.RGBA32F)
    );
    this.sssBlurPingPongFbo = new Fbo(gl, [
      this.forwardDepthTex, // used to get stencil values, we will read depth from linear depth texture
      this.sssBlurPingPongTex,
    ]);
  }

  private initializeLinearDepthPassResources (device: Device, d: Dimensions) {
    const {gl} = device;
    d = this.getFullscreenDimensions(d);

    this.linearDepthTex = this.createTexture(
      device,
      gl.R32F, d,
      this.createTextureOpts(gl, gl.R32F)
    );
    this.linearDepthFbo = new Fbo(gl, [
      this.linearDepthTex,
    ]);
  }

  private initializeTonemappingPassResources (device: Device, d: Dimensions) {
    const {gl} = device;
    d = this.getFullscreenDimensions(d);

    this.tonemappingResultTex = this.createTexture(
      device,
      gl.RGBA8, d,
      this.createTextureOpts(gl, gl.RGBA8)
    );
    this.tonemappingFbo = new Fbo(gl, [
      this.tonemappingResultTex,
    ]);
  }

  private initializeShadowResources (device: Device, size: number) {
    const {gl} = device;

    const texture = this.createTexture(
      device,
      gl.DEPTH_COMPONENT16,
      {width: size, height: size},
      this.createTextureOpts(gl, gl.DEPTH_COMPONENT16)
    );
    const fbo = new Fbo(gl, [texture]);

    return {texture, fbo};
  }

  private getFullscreenDimensions(d: Dimensions): Dimensions {
    if (this.cfg.useMSAA) {
      return { width: d.width * 2, height: d.height * 2 };
    }
    return d;
  }

  private createTexture (
    device: Device,
    sizedFormat: number, d: Dimensions, opts: TextureOpts
  ) {
    const {gl, textureBindingState} = device;
    return new Texture(
      gl, textureBindingState,
      TextureType.Texture2d,
      Vec3(d.width, d.height, 1),
      0,
      sizedFormat,
      opts
    );
  }

  private createTextureOpts(gl: Webgl, sizedPixelFormat: number) {
    const opts = { ...DEFAULT_RENDER_TARGET_TEXTURE_OPTS, };

    if (isSizedTextureFormatInteger(sizedPixelFormat)) {
      opts.filterMin = TextureFilterMin.Nearest;
      opts.filterMag = TextureFilterMag.Nearest;
    }

    const depthFormats = [gl.DEPTH_COMPONENT16, gl.DEPTH24_STENCIL8];
    if (depthFormats.includes(sizedPixelFormat)) {
      opts.filterMin = TextureFilterMin.Nearest;
      opts.filterMag = TextureFilterMag.Nearest;
      opts.wrap[0] = TextureWrap.UseEdgePixel;
      opts.wrap[1] = TextureWrap.UseEdgePixel;
    }

    return opts;
  }

  private destroyResizableResources(gl: Webgl) {
    if (this.forwardFbo) { this.forwardFbo.destroy(gl); }
    if (this.forwardDepthTex) { this.forwardDepthTex.destroy(gl); }
    if (this.forwardColorTex) { this.forwardColorTex.destroy(gl); }

    if (this.linearDepthFbo) { this.linearDepthFbo.destroy(gl); }
    if (this.linearDepthTex) { this.linearDepthTex.destroy(gl); }

    if (this.sssBlurPingPongFbo) { this.sssBlurPingPongFbo.destroy(gl); }
    if (this.sssBlurPingPongTex) { this.sssBlurPingPongTex.destroy(gl); }

    if (this.tonemappingFbo) { this.tonemappingFbo.destroy(gl); }
    if (this.tonemappingResultTex) { this.tonemappingResultTex.destroy(gl); }
  }

}
