import GlobalWebGl2Context from 'gl-utils/gimme_gl';

// https://github.com/Microsoft/TypeScript/issues/14733

// should be: WebGLContextCreationAttirbutes, but not defined
// https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext
type WebGLContextOpts = object;

const GET_A_WEBGL_BROWSER = '' +
  'This page requires a browser that supports WebGL 2.0.<br/>' +
  '<a href="http://get.webgl.org">Click here to upgrade your browser.</a>';

const OTHER_PROBLEM = '' +
  'It doesn\'t appear your computer can support WebGL 2.0.<br/>' +
  '<a href="http://get.webgl.org/troubleshooting/">Click here for more information.</a>';

const makeFailHTML = function(msg: string) {
  return '' +
    '<table style="background-color: #8CE; width: 100%; height: 100%;"><tr>' +
    '<td align="center">' +
    '<div style="display: table-cell; vertical-align: middle;">' +
    '<br/><br/>' +
    '<div style="">Status: ' + msg + '</div>' +
    '</div>' +
    '</td></tr></table>';
};

const renderCreationError = (canvas: HTMLCanvasElement, msg: string) => {
  const container = canvas.parentNode;
  if (container) {
    (container as any).innerHTML = makeFailHTML(msg);
  }
};

const isValidContext = (context: any) =>
  context && context instanceof WebGL2RenderingContext;

const create3DContext = (canvas: HTMLCanvasElement, optAttribs: WebGLContextOpts) => {
  const context = canvas.getContext('webgl2', optAttribs); // may throw by itself
  if (!isValidContext(context)) {
    throw !GlobalWebGl2Context ? GET_A_WEBGL_BROWSER : OTHER_PROBLEM;
  }
  return context as Webgl;
};

const declareExtensions = (gl: Webgl, extensions: string[]) => {
  // console.log(context.getSupportedExtensions());
  extensions.forEach(extensionName => {
    if (!gl.getExtension(extensionName)) {
      throw `Your browser does not support '${extensionName}' extension`;
    }
  });
};

export const createWebGl2Context = (
  canvas: HTMLCanvasElement,
  optAttribs: WebGLContextOpts,
  extensions: string[]
): Webgl => {
  if (canvas.addEventListener) {
    canvas.addEventListener(
      'webglcontextcreationerror',
      (event: any) => renderCreationError(canvas, event.statusMessage),
      false
    );
  }

  let context: Webgl;
  try {
    context = create3DContext(canvas, optAttribs);
    declareExtensions(context, extensions);
  } catch (e) {
    renderCreationError(canvas, e.statusMessage || e);
    throw e;
  }

  return context;
};
