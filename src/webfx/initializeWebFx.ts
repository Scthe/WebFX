import {Mesh} from 'webgl-obj-loader';
import {WebFx} from './WebFx';
import {MeshComponent} from 'components';
import {
  Vao, VaoAttrType,
  Buffer, BufferType, BufferUsage,
  Shader
} from 'resources';

// import sintelObj from 'assets/sintel_lite_v2_1/sintel.obj';
// import sintelObj from 'file-loader!../../assets/sintel_lite_v2_1/sintel.obj'

const OBJ_FILES = {
  'sintel': require('../../assets/sintel_lite_v2_1/sintel.obj'),
  'sintel_eyeballs': require('../../assets/sintel_lite_v2_1/sintel_eyeballs.obj'),
};

const loadMesh = async (path: string) => {
  const objFileResp = await fetch(path);
  if (!objFileResp.ok) {
    throw `Could not download file '${path}'`;
  }
  const fileStr = await objFileResp.text();
  return new Mesh(fileStr);
};


const shoveMeshIntoGpu = (gl: Webgl, mesh: Mesh): MeshComponent => {
  const vertBuf = Float32Array.from(mesh.vertices);
  const normBuf = Float32Array.from(mesh.vertexNormals);

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
    }
  ]);

  // indices
  const idxData = Uint16Array.from(mesh.indices);
  const idxBuf = Buffer.fromData(gl, BufferType.IndexBuffer, BufferUsage.STATIC_DRAW, idxData);

  // so it happens this matches MeshComponent
  return new MeshComponent(
    vao,
    gl.UNSIGNED_SHORT,
    idxBuf,
    idxData.length / 3,
  );
};

const loadSintel = async (gl: Webgl): Promise<MeshComponent[]> => {
  return [
    shoveMeshIntoGpu(gl, await loadMesh(OBJ_FILES.sintel)),
    shoveMeshIntoGpu(gl, await loadMesh(OBJ_FILES.sintel_eyeballs)),
  ];
};

export const initalizeWebFx = async (gl: Webgl): Promise<WebFx> => {
  const meshes = await loadSintel(gl);
  const meshShader = new Shader(gl,
    require('shaders/sintel.vert.glsl'),
    require('shaders/sintel.frag.glsl'),
  );

  return new WebFx(
    meshes,
    meshShader
  );
};
