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
  // forward
  public meshShader: Shader;
  public forwardDepthTex: Texture;
  public forwardColorTex: Texture;
  public forwardFbo: Fbo;
  // tonemapping
  public tonemappingShader: Shader;
  public tonemappingResultTex: Texture; // [rgb, luma]
  public tonemappingFbo: Fbo;
  // final
  public finalShader: Shader;
  public dbgShadowsShader: Shader;


  public initialize (cfg: Config, device: Device) {
    this.initializeShaders(device.gl);
    this.initializeShadowResources(cfg, device);
  }

  onResize (device: Device, d: Dimensions) {
    this.destroyResizableResources(device.gl);

    this.initializeForwardPassResources(device, d);
    this.initializeTonemappingPassResources(device, d);
  }

  private initializeShaders (gl: Webgl) {
    this.shadowShader = new Shader(gl,
      require('shaders/shadow.vert.glsl'),
      require('shaders/shadow.frag.glsl'),
    );
    this.meshShader = new Shader(gl,
      require('shaders/sintel.vert.glsl'),
      require('shaders/sintel.frag.glsl'),
    );
    this.finalShader = new Shader(gl,
      require('shaders/final.vert.glsl'),
      require('shaders/final.frag.glsl'),
    );
    this.dbgShadowsShader = new Shader(gl,
      require('shaders/final.vert.glsl'), // just reuse simple fullscreen quad vertex shader
      require('shaders/final.dbgShadows.glsl'),
    );
    this.tonemappingShader = new Shader(gl,
      require('shaders/final.vert.glsl'), // just reuse simple fullscreen quad vertex shader
      require('shaders/tonemapping.frag.glsl'),
    );
  }

  private initializeForwardPassResources (device: Device, d: Dimensions) {
    const {gl} = device;

    this.forwardDepthTex = this.createTexture(
      device,
      gl.DEPTH_COMPONENT16, d,
      this.createTextureOpts(gl, gl.DEPTH_COMPONENT16)
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
  }

  private initializeTonemappingPassResources (device: Device, d: Dimensions) {
    const {gl} = device;

    this.tonemappingResultTex = this.createTexture(
      device,
      gl.RGBA8, d,
      this.createTextureOpts(gl, gl.RGBA8)
    );
    this.tonemappingFbo = new Fbo(gl, [
      this.tonemappingResultTex,
    ]);
  }

  private initializeShadowResources (cfg: Config, device: Device) {
    const {gl} = device;
    const {shadows: shadowCfg} = cfg;

    this.shadowDepthTex = this.createTexture(
      device,
      gl.DEPTH_COMPONENT16,
      {width: shadowCfg.shadowmapSize, height: shadowCfg.shadowmapSize},
      this.createTextureOpts(gl, gl.DEPTH_COMPONENT16)
    );
    this.shadowDepthFbo = new Fbo(gl, [
      this.shadowDepthTex
    ]);
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

    if (this.tonemappingFbo) { this.tonemappingFbo.destroy(gl); }
    if (this.tonemappingResultTex) { this.tonemappingResultTex.destroy(gl); }
  }

}
