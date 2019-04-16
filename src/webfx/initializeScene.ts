import {fromValues as Vec3, set} from 'gl-vec3';
import {vec2, fromValues as Vec2} from 'gl-vec2';

import {Mesh} from 'webgl-obj-loader';
import {MeshComponent, MaterialComponent, TransformComponent} from '../ecs';
import {
  Vao, VaoAttrType,
  Buffer, BufferType, BufferUsage,
  Texture, TextureBindingState, TextureType, createTextureOpts,
  TextureFilterMin, TextureFilterMag
} from 'resources';
import {loadTexture} from 'gl-utils';
import {loadTfxFile} from './tfxParser';
import {prepareTfxData} from './tfxLoader';
import {Ecs} from 'ecs/Ecs';
import {NameComponent} from 'ecs/components/NameComponent';
import { Config } from 'Config';


const OBJ_FILES = {
  'sintel': require('../../assets/sintel_lite_v2_1/sintel.obj'),
  'sintel_eyeballs': require('../../assets/sintel_lite_v2_1/sintel_eyeballs.obj'),
};
const TEXTURE_FILES = {
  'sintel': require('../../assets/sintel_lite_v2_1/textures/sintel_skin_diff.jpg'),
  'sintel_eyeballs': require('../../assets/sintel_lite_v2_1/textures/sintel_eyeball_diff.jpg'),
};
const TFX_FILE = require('../../assets/sintel_lite_v2_1/GEO-sintel_hair_emit.002-sintel_hair.tfx');


export const ENTITY_SINTEL = 'sintel';
export const ENTITY_SINTEL_EYES = 'sintel_eyes';
export const ENTITY_TRESSFX = 'sintel_tfx';



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

const loadSintel = async (ecs: Ecs, gl: Webgl, tbs: TextureBindingState) => {
  const sintelTex = createAlbedoTex(gl, tbs, Vec2(2048, 1024));
  await loadTexture(gl, tbs, TEXTURE_FILES.sintel, sintelTex);

  const entity = ecs.createEnity();
  ecs.addComponent(entity, new MaterialComponent(sintelTex));
  ecs.addComponent(entity, shoveMeshIntoGpu(gl, await loadMesh(OBJ_FILES.sintel)));
  ecs.addComponent(entity, new NameComponent(ENTITY_SINTEL));
  return entity;
};

const loadSintelEyes = async (ecs: Ecs, gl: Webgl, tbs: TextureBindingState) => {
  const sintelEyeTex = createAlbedoTex(gl, tbs, Vec2(512, 512));
  await loadTexture(gl, tbs, TEXTURE_FILES.sintel_eyeballs, sintelEyeTex);

  const entity = ecs.createEnity();
  ecs.addComponent(entity, new MaterialComponent(sintelEyeTex));
  ecs.addComponent(entity, shoveMeshIntoGpu(gl, await loadMesh(OBJ_FILES.sintel_eyeballs)));
  ecs.addComponent(entity, new NameComponent(ENTITY_SINTEL_EYES));
  return entity;
};
// </editor-fold> // END: MESH


const loadTfxHair = async (ecs: Ecs, gl: Webgl, tbs: TextureBindingState) => {
  const tfxFile = await loadTfxFile(TFX_FILE);
  const tfxComponent = prepareTfxData(gl, tbs, tfxFile);

  const entity = ecs.createEnity();
  ecs.addComponent(entity, tfxComponent);
  ecs.addComponent(entity, new NameComponent(ENTITY_TRESSFX));
  return entity;
};


export const initializeScene = async (
  ecs: Ecs, cfg: Config, gl: Webgl, tbs: TextureBindingState
) => {

  const sintelE = await loadSintel(ecs, gl, tbs);
  const sintelEyesE = await loadSintelEyes(ecs, gl, tbs);
  const tfxE = await loadTfxHair(ecs, gl, tbs);

  const tfxComp = new TransformComponent();
  const s = cfg.sintel.modelScale;
  set(tfxComp.scale, s, s, s);
  tfxComp.updateModelMatrix();
  ecs.addComponent(sintelE, tfxComp);
  ecs.addComponent(sintelEyesE, tfxComp);
  ecs.addComponent(tfxE, tfxComp);
};
