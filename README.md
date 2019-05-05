## WebFX - online TressFX model viewer ([Demo](http://scthe.github.io/WebFX/dist) - Chrome recommended, see FAQ below)

This is a web viewer for .tfx [AMD TressFX](https://gpuopen.com/gaming-product/tressfx/) hair/fur file format. It also features a lot of modern rendering effects, so be sure to check out the code!

![webfx-github-showcase]



## What is this?

[A few months ago](https://github.com/Scthe/TressFX-OpenGL) I've ported [AMD's TressFX](https://github.com/GPUOpen-Effects/TressFX/) hair rendering/simulation library to OpenGL. Turns out that WebGL 2.0 offers enough capabilities to display .tfx file in the browser. This, combined with some modern rendering techniques like SSSSS, PBR, HDR makes for quite interesting demo project.

Use the `[W, S, A, D]` keys to move and `[Z, SPACEBAR]` to fly up or down. Click and drag to rotate the camera (be careful around the UI). All materials, effects and rendering techniques are configurable using the UI on the right side of the screen.


## Usage

1. `yarn install`
2. `yarn start` <- dev server
3. go to `localhost:9000`

Alternatively, `yarn build` for production build, outputs will be in `dist` folder.



## FAQ

**Q: Which effects are implemented?**

- TressFX model loading - only simple rendering, no PPLL, alpha, [simulation](https://youtu.be/CfbCLwNlGwU?t=28) or other techniques
- Kajiya-Kay hair shading (with small custom modifications) [Kajiya89](https://www.cs.drexel.edu/~david/Classes/CS586/Papers/p271-kajiya.pdf), [Scheuermann04](http://web.engr.oregonstate.edu/~mjb/cs519/Projects/Papers/HairRendering.pdf)
- PBR materials (small modifications to AO term to highlight details like collarbones, similar to micro shadow hack in [Uncharted4](http://advances.realtimerendering.com/other/2016/naughty_dog/NaughtyDog_TechArt_Final.pdf)) [Burley12](https://disney-animation.s3.amazonaws.com/library/s2012_pbs_disney_brdf_notes_v2.pdf), [Karis13](https://cdn2.unrealengine.com/Resources/files/2013SiggraphPresentationsNotes-26915738.pdf), [Lagarde+2014](https://seblagarde.files.wordpress.com/2015/07/course_notes_moving_frostbite_to_pbr_v32.pdf), [in OpenGL](https://learnopengl.com/PBR/Theory)
    - Cook-Torrance model
    - Diffuse: Lambert
    - **F** Fresnel term: Schlick
    - **D** Normal distribution function: GGX
    - **G** Self-shadowing: GGX-Smith
- SSSSS - both forward scattering (remember [Nathan Drake in Uncharted 4?](https://www.reddit.com/r/gaming/comments/4jc38z/til_in_uncharted_4_under_certain_lighting_drakes/)) and the blur. [Jimenez+15](http://iryoku.com/separable-sss/) with [github](https://github.com/iryoku/separable-sss)
- Shadow Mapping - both [Percentage Closer Filter (PCF)](https://en.wikipedia.org/wiki/Texture_filtering#Percentage_Closer_filtering) and [Percentage-Closer Soft Shadows (PCSS)](http://developer.download.nvidia.com/shaderlibrary/docs/shadow_PCSS.pdf)
- HDR + Tonemapping (just please use ACES) [UE4 docs](https://docs.unrealengine.com/en-us/Engine/Rendering/PostProcessEffects/ColorGrading), [UE4 Feature Highlight video](https://www.youtube.com/watch?v=A-wectYNfRQ), [Wronski16](https://bartwronski.com/2016/08/29/localized-tonemapping/), [Hable10](http://filmicworlds.com/blog/filmic-tonemapping-operators/), [Nvidia - preparing for real HDR](https://developer.nvidia.com/preparing-real-hdr)
- Color Grading - based closely on Unreal Engine 4 implementation. [UE4 docs](https://docs.unrealengine.com/en-us/Engine/Rendering/PostProcessEffects/ColorGrading#colorcorrection), [Fry17](https://www.slideshare.net/DICEStudio/high-dynamic-range-color-grading-and-display-in-frostbite), [Hable17](http://filmicworlds.com/blog/minimal-color-grading-tools/)
- GPU dithering - [8x8 Bayer matrix dithering](https://en.wikipedia.org/wiki/Ordered_dithering)
- SSAO - [John Chapman's blog post](http://john-chapman-graphics.blogspot.com/2013/01/ssao-tutorial.html), [in OpenGL](https://learnopengl.com/Advanced-Lighting/SSAO)
- [FXAA](https://en.wikipedia.org/wiki/Fast_approximate_anti-aliasing) - [Lottes2009](http://developer.download.nvidia.com/assets/gamedev/files/sdk/11/FXAA_WhitePaper.pdf)
- MSAA - ok, it's actually just render target upscaling
- [Entity component system (ECS)](https://www.youtube.com/watch?v=z9WE3fwre-k) - actually, just a typescript exercise. No need for optimizations and complex data management in demo as simple as this


**Q: What to do if it does not work?**

This demo uses a lot of different rendering techniques and sometimes WebGL does not keep up. If the scene renders incorrectly (e.g. no hair on firefox) there is nothing I can do. Baseline is support for WebGL 2.0, which has [55% adoption rate](https://webglstats.com/webgl2). All we really need are features like:

  * texture sampling in vertex shader,
  * multiple render targets (it was possible in WebGl 1.0, but I'd rather have full support),
  * `texelFetch`,
  * more flexible texture formats,
  * non power of 2 textures,
  * better depth textures,
  * for-loops in shaders,
  * build-in gl_VertexID and gl_InstanceID.

See also last question about my hardware config.


**Q: Shadow controls stopped working?**

This sometimes happens, but I don't think it's related to my code. For some reason, shadow depth map is rendered incorrectly/does not update. Checking *'Show dbg'* in *'Shadow'* section on UI fixes the problem (even though all it does is renders debug view on top of final image). BTW. debug depth map on the right is for SSSSS.


**Q: How can I improve performance?**

Uncheck `Use MSAA`. You can also play with SSAO settings, but the gains are limited. I did not focus much on performance, works 60fps for me (unless super close-up).


**Q: That's a lot of code**

Most of the code comes from other project I'm working on. Interesting snippets:
  - [main.ts](src/main.ts), see `renderScene()` function
  - [global resources](src/webfx/FrameResources.ts)
  - [render passes](src/webfx/passes)
  - [shaders](src/shaders)
  - [Tfx file loader](src/webfx/tfxLoader.ts), also [Tfx header parser](src/webfx/tfxParser.ts)
  - [ECS](src/ecs/Ecs.ts) and [Component](src/ecs/Component.ts)


**Q: Why Sintel?**

If You know me, You probably know why I like [Sintel](https://durian.blender.org/) so much.


**Q: Your PC?**

GTX 1050 Ti, Driver 398.36, Windows 10, Chrome 74.0.3729.13



## Honorable mentions and other 3rd party stuff

* AMD for TressFX
* [dat.gui](https://github.com/dataarts/dat.gui)
* [stats.js](https://github.com/mrdoob/stats.js/)
* [gl-mat4](https://github.com/stackgl/gl-mat4) and other `gl-*` math libs
* [lodash](https://lodash.com/)
* [typescript](https://www.typescriptlang.org/) <3
* [webpack](https://webpack.js.org/)
* [Blender](https://www.blender.org/), [Blender Institute](https://www.blender.org/institute/) <3
    Sintel's model under [CC 3.0](https://durian.blender.org/sharing/), character was simplified into bust. © copyright Blender Foundation | durian.blender.org


[webfx-github-showcase]:assets/gh-screens/webfx-github-showcase.jpg
