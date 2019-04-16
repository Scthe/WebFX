import {fromValues as Vec3} from 'gl-vec3';
import {vec2, fromValues as Vec2} from 'gl-vec2';

import {Mesh} from 'webgl-obj-loader';
import {WebFx} from './WebFx';
import {MeshComponent, MaterialComponent} from 'components';
import {
  Vao, VaoAttrType,
  Buffer, BufferType, BufferUsage,
  Shader,
  Texture, TextureBindingState, TextureType, createTextureOpts,
  TextureFilterMin, TextureFilterMag
} from 'resources';
import {loadTexture} from 'gl-utils';
import {loadTfxFile} from './tfxParser';
import {prepareTfxData} from './tfxLoader';


const OBJ_FILES = {
  'sintel': require('../../assets/sintel_lite_v2_1/sintel.obj'),
  'sintel_eyeballs': require('../../assets/sintel_lite_v2_1/sintel_eyeballs.obj'),
};
const TEXTURE_FILES = {
  'sintel': require('../../assets/sintel_lite_v2_1/textures/sintel_skin_diff.jpg'),
  'sintel_eyeballs': require('../../assets/sintel_lite_v2_1/textures/sintel_eyeball_diff.jpg'),
};
const TFX_FILE = require('../../assets/sintel_lite_v2_1/GEO-sintel_hair_emit.002-sintel_hair.tfx');



// <editor-fold> MESH
const loadMesh = async (path: string) => {
  const objFileResp = await fetch(path);
  if (!objFileResp.ok) {
    throw `Could not download mesh file '${path}'`;
  }
  const fileStr = await objFileResp.text();
  return new Mesh(fileStr);
};

const shoveMeshIntoGpu = (gl: Webgl, mesh: Mesh): MeshComponent => {
  const vertBuf = Float32Array.from(mesh.vertices);
  const normBuf = Float32Array.from(mesh.vertexNormals);
  const uvBuf = Float32Array.from(mesh.textures);

  const vao = new Vao(gl, [
    {
      name: 'position',
      stride: 0,
      offset: 0,
      type: VaoAttrType.FLOAT_VEC3,
      rawData: vertBuf,
    },
    {
      name: 'normals',
      stride: 0,
      offset: 0,
      type: VaoAttrType.FLOAT_VEC3,
      rawData: normBuf,
    },
    {
      name: 'uv',
      stride: 0,
      offset: 0,
      type: VaoAttrType.FLOAT_VEC2,
      rawData: uvBuf,
    }
  ]);

  // indices
  const idxData = Uint16Array.from(mesh.indices);
  const idxBuf = Buffer.fromData(gl, BufferType.IndexBuffer, BufferUsage.STATIC_DRAW, idxData);

  // so it happens this matches MeshComponent
  return new MeshComponent(
    vao,
    {
      indexBuffer: idxBuf,
      indexGlType: gl.UNSIGNED_SHORT,
      triangleCnt: idxData.length / 3,
    }
  );
};

const createAlbedoTex = (gl: Webgl, tbs: TextureBindingState, size: vec2) => {
  return new Texture(
    gl, tbs,
    TextureType.Texture2d,
    Vec3(size[0], size[1], 0),
    0,
    gl.RGB8UI,
    createTextureOpts({
      filterMin: TextureFilterMin.Nearest,
      filterMag: TextureFilterMag.Nearest,
    }),
  );
};

const loadSintel = async (gl: Webgl, tbs: TextureBindingState) => {
  const sintelTex = createAlbedoTex(gl, tbs, Vec2(2048, 1024));
  await loadTexture(gl, tbs, TEXTURE_FILES.sintel, sintelTex);
  const sintelObj = {
    mesh: shoveMeshIntoGpu(gl, await loadMesh(OBJ_FILES.sintel)),
    material: new MaterialComponent(sintelTex),
  };

  const sintelEyeTex = createAlbedoTex(gl, tbs, Vec2(512, 512));
  await loadTexture(gl, tbs, TEXTURE_FILES.sintel_eyeballs, sintelEyeTex);
  const sintelEyesObj = {
    mesh: shoveMeshIntoGpu(gl, await loadMesh(OBJ_FILES.sintel_eyeballs)),
    material: new MaterialComponent(sintelEyeTex),
  };

  return [sintelObj, sintelEyesObj];
};
// </editor-fold> // END: MESH


export const initalizeWebFx = async (
  gl: Webgl, tbs: TextureBindingState
): Promise<WebFx> => {
  const meshes = await loadSintel(gl, tbs);
  const meshShader = new Shader(gl,
    require('shaders/sintel.vert.glsl'),
    require('shaders/sintel.frag.glsl'),
  );

  const tfxFile = await loadTfxFile(TFX_FILE);
  const tfxComp = prepareTfxData(gl, tbs, tfxFile);
  const tfxShader = new Shader(gl,
    require('shaders/tfx.vert.glsl'),
    require('shaders/tfx.frag.glsl'),
  );

  return new WebFx(
    meshes, meshShader,
    tfxComp, tfxShader,
  );
};
