// just give me global gl object
// used only for consts declaration,
// normally we use gl from canvas.
// (hopefully this is the last time I use export default)

const gl = (window as any).WebGL2RenderingContext as WebGL2RenderingContext;
export default gl;
