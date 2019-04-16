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


  public initialize (cfg: Config, device: Device) {
    this.initializeShaders(device.gl);
    this.initializeShadowResources(cfg, device);
  }

  onResize (device: Device, d: Dimensions) {
    const {gl} = device;

    this.destroy(gl);
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
  }

  private initializeShadowResources (cfg: Config, device: Device) {
    const {gl, textureBindingState} = device;
    const {shadows: shadowCfg} = cfg;

    this.shadowDepthTex = new Texture(
      gl, textureBindingState,
      TextureType.Texture2d,
      Vec3(shadowCfg.shadowmapSize, shadowCfg.shadowmapSize, 1),
      0,
      gl.DEPTH_COMPONENT16,
      this.createTextureOpts(gl, gl.DEPTH_COMPONENT16)
    );
    this.shadowDepthFbo = new Fbo(gl, [
      this.shadowDepthTex
    ]);
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

  private destroy(gl: Webgl) {
    /*
    if (!this.fbo) {
      return;
    }

    this.fbo.attachments.forEach(a => gl.deleteTexture(a.glId));
    this.fbo.destroy(gl);
    this.fbo = null;
    */
  }

}
