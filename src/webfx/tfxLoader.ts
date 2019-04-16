import {fromValues as Vec3, vec3} from 'gl-vec3';

import {TfxComponent, IndexBuffer} from 'ecs';
import {
  Buffer, BufferType, BufferUsage,
  Texture, TextureBindingState, TextureType, createTextureOpts,
  TextureFilterMin, TextureFilterMag
} from 'resources';
import {getSizeOfBufferAsTexture, subtractNorm, addNorm} from 'gl-utils';
import {TfxFileData, TfxFileHeader} from './tfxParser';


const writeTexture = (
  gl: Webgl, tbs: TextureBindingState,
  texture: Texture, data: Float32Array
) => {
  const writePoint = {
    start: Vec3(0, 0, 0),
    dimensions: texture.dimensions,
  };
  const writeSource = {
    unsizedPixelFormat: gl.RGBA,
    perChannelType: gl.FLOAT,
    data: data,
  };
  texture.write(gl, tbs, 0, writePoint, writeSource);
};

/** see TressFXAsset::FillTriangleIndexArray */
const createIndexBuffer = (gl: Webgl, tfxHeader: TfxFileHeader): IndexBuffer => {
  const idxElements = tfxHeader.numHairStrands * tfxHeader.numVerticesPerStrand;
  const idxCpu = Array(idxElements * 6).fill(0);

  let id = 0;
  let iCount = 0;

  for (let i = 0; i < tfxHeader.numHairStrands; i++) {
    for (let j = 0; j < tfxHeader.numVerticesPerStrand - 1; j++) {
      idxCpu[iCount++] = 2 * id;
      idxCpu[iCount++] = 2 * id + 1;
      idxCpu[iCount++] = 2 * id + 2;
      idxCpu[iCount++] = 2 * id + 2;
      idxCpu[iCount++] = 2 * id + 1;
      idxCpu[iCount++] = 2 * id + 3;
      id++;
    }
    id++;
  }
  const idxData = Uint32Array.from(idxCpu);
  const indexBuffer = Buffer.fromData(gl,
    BufferType.IndexBuffer, BufferUsage.STATIC_DRAW,
    idxData
  );
  indexBuffer.bind(gl);

  return {
    indexBuffer,
    indexGlType: gl.UNSIGNED_INT,
    triangleCnt: Math.floor(iCount / 3),
  };
};

const writePerVertexDataToTexture = (
  gl: Webgl, tbs: TextureBindingState, tfxFile: TfxFileData,
  data: Float32Array
) => {
  const {totalVertices} = tfxFile;
  // each texture channel RGBA holds XYZW of the vertex
  const texSize = getSizeOfBufferAsTexture(gl, totalVertices);

  const texture = new Texture(
    gl, tbs,
    TextureType.Texture2d,
    Vec3(texSize.width, texSize.height, 0),
    0,
    gl.RGBA32F,
    createTextureOpts({
      filterMin: TextureFilterMin.Nearest,
      filterMag: TextureFilterMag.Nearest,
    }),
  );

  writeTexture(gl, tbs, texture, data);

  return texture;
};

const writeTangentsToTexture = (
  gl: Webgl, tbs: TextureBindingState, tfxFile: TfxFileData
) => {
  const {
    vertexPositionsBuffer,
    header: {numHairStrands, numVerticesPerStrand}
  } = tfxFile;

  // NOTE: positions are in XYZW, so 4 components
  const tangents = new Float32Array(vertexPositionsBuffer.length);

  const getVertexPos = (idx: number) => Vec3(
    vertexPositionsBuffer[idx * 4],
    vertexPositionsBuffer[idx * 4 + 1],
    vertexPositionsBuffer[idx * 4 + 2]
  );
  const setTangent = (idx: number, t: vec3) => {
    tangents[idx * 4] = t[0];
    tangents[idx * 4 + 1] = t[1];
    tangents[idx * 4 + 2] = t[2];
  };

  for (let iStrand = 0; iStrand < numHairStrands; ++iStrand) {
    const indexRootVertMaster = iStrand * numVerticesPerStrand;

    // vertex 0
    const vert_0 = getVertexPos(indexRootVertMaster);
    const vert_1 = getVertexPos(indexRootVertMaster + 1);

    const tangent = subtractNorm(vert_1, vert_0);
    setTangent(indexRootVertMaster, tangent);

    // vertex 1 through n-1
    for (let i = 1; i < numVerticesPerStrand - 1; i++) {
      const vert_i_minus_1 = getVertexPos(indexRootVertMaster + i - 1);
      const vert_i         = getVertexPos(indexRootVertMaster + i);
      const vert_i_plus_1  = getVertexPos(indexRootVertMaster + i + 1);

      const tangent_pre = subtractNorm(vert_i, vert_i_minus_1);
      const tangent_next = subtractNorm(vert_i_plus_1, vert_i);
      const tangent = addNorm(tangent_pre, tangent_next);

      setTangent(indexRootVertMaster + i, tangent);
    }
  }

  //
  return writePerVertexDataToTexture(gl, tbs, tfxFile, tangents);
};



export const prepareTfxData = (
  gl: Webgl, tbs: TextureBindingState, tfxFile: TfxFileData
): TfxComponent => {
  const {header} = tfxFile;

  const positionsTexture = writePerVertexDataToTexture(
    gl, tbs, tfxFile, tfxFile.vertexPositionsBuffer
  );
  const tangentsTexture = writeTangentsToTexture(gl, tbs, tfxFile);

  const indexBuffer = createIndexBuffer(gl, tfxFile.header);

  return new TfxComponent(
    header.numHairStrands,
    header.numVerticesPerStrand,
    positionsTexture,
    tangentsTexture,
    indexBuffer,
  );
};
