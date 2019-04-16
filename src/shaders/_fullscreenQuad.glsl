vec2 getFullscreenPositionFromVertexId () {
  vec2 pos;
  pos.x = -1.0 + float((gl_VertexID & 1) << 2);
  pos.y = -1.0 + float((gl_VertexID & 2) << 1);
  return pos;
}
