/*
  Don't ask me what is going on in this file. Copied straight from UE4.
  I probably better get some book on the subject. Any recommendations?
  Honeslty, I'm not even sure everythin is 100% in the right color space.

  @see vec3 ColorCorrectAll( vec3 WorkingColor )
    in Engine\Shaders\Private\PostProcessCombineLUTs.usf
    in release-4.22.0 #7d9919ac7bfd80b7483012eab342cb427d60e8c9
*/


// const defined in:
// Engine\Shaders\Private\ACES.ush
const vec3 AP1_RGB2Y = vec3(
	0.2722287168,
	0.6740817658,
	0.0536895174
);


uniform vec4 u_colorSaturation;
uniform vec4 u_colorContrast;
uniform vec4 u_colorGamma;
uniform vec4 u_colorGain;
uniform vec4 u_colorOffset;

uniform vec4 u_colorSaturationShadows;
uniform vec4 u_colorContrastShadows;
uniform vec4 u_colorGammaShadows;
uniform vec4 u_colorGainShadows;
uniform vec4 u_colorOffsetShadows;

uniform vec4 u_colorSaturationMidtones;
uniform vec4 u_colorContrastMidtones;
uniform vec4 u_colorGammaMidtones;
uniform vec4 u_colorGainMidtones;
uniform vec4 u_colorOffsetMidtones;

uniform vec4 u_colorSaturationHighlights;
uniform vec4 u_colorContrastHighlights;
uniform vec4 u_colorGammaHighlights;
uniform vec4 u_colorGainHighlights;
uniform vec4 u_colorOffsetHighlights;

uniform float u_colorCorrectionShadowsMax;
uniform float u_colorCorrectionHighlightsMin;


vec3 colorCorrect(
  vec3 WorkingColor,
	vec4 ColorSaturation,
	vec4 ColorContrast,
	vec4 ColorGamma,
	vec4 ColorGain,
	vec4 ColorOffset
) {
	float Luma = dot(WorkingColor, AP1_RGB2Y);
	WorkingColor = max(vec3(0.0), mix(
    vec3(Luma, Luma, Luma),
    WorkingColor,
    ColorSaturation.xyz * ColorSaturation.w
  ));
	WorkingColor = pow(WorkingColor * (1.0 / 0.18), ColorContrast.xyz * ColorContrast.w) * 0.18;
	WorkingColor = pow(WorkingColor, 1.0 / (ColorGamma.xyz * ColorGamma.w) );
	WorkingColor = WorkingColor * (ColorGain.xyz * ColorGain.w) + (ColorOffset.xyz + ColorOffset.w);
	return WorkingColor;
}

// Nuke-style Color Correct
vec3 colorCorrectAll(vec3 WorkingColor) {
	float Luma = dot(WorkingColor, AP1_RGB2Y);

	// Shadow CC
	vec3 CCColorShadows = colorCorrect(
    WorkingColor,
		u_colorSaturationShadows * u_colorSaturation,
		u_colorContrastShadows * u_colorContrast,
		u_colorGammaShadows * u_colorGamma,
		u_colorGainShadows * u_colorGain,
		u_colorOffsetShadows + u_colorOffset);
	float CCWeightShadows = 1.0 - smoothstep(0.0, u_colorCorrectionShadowsMax, Luma);

	// Highlight CC
	vec3 CCColorHighlights = colorCorrect(
    WorkingColor,
		u_colorSaturationHighlights * u_colorSaturation,
		u_colorContrastHighlights * u_colorContrast,
		u_colorGammaHighlights * u_colorGamma,
		u_colorGainHighlights * u_colorGain,
		u_colorOffsetHighlights + u_colorOffset);
	float CCWeightHighlights = smoothstep(u_colorCorrectionHighlightsMin, 1.0, Luma);

	// Midtone CC
	vec3 CCColorMidtones = colorCorrect(
    WorkingColor,
		u_colorSaturationMidtones * u_colorSaturation,
		u_colorContrastMidtones * u_colorContrast,
		u_colorGammaMidtones * u_colorGamma,
		u_colorGainMidtones * u_colorGain,
		u_colorOffsetMidtones + u_colorOffset);
	float CCWeightMidtones = 1.0 - CCWeightShadows - CCWeightHighlights;

	// Blend Shadow, Midtone and Highlight CCs
	vec3 WorkingColorSMH =
    CCColorShadows * CCWeightShadows +
    CCColorMidtones * CCWeightMidtones +
    CCColorHighlights * CCWeightHighlights;

	return WorkingColorSMH;
}
