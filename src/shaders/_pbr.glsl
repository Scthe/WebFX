const vec3 DIELECTRIC_FRESNEL = vec3(0.04, 0.04, 0.04); // nearly black
const vec3 METALLIC_DIFFUSE_CONTRIBUTION = vec3(0.0); // none


vec3 pbr_LambertDiffuse (const Material material) {
  // return material.albedo / PI;
  return material.albedo;
}


/**
 * Fresnel (F): Schlick's version
 *
 * If cosTheta 0 means 90dgr, so return big value, if is 1 means 0dgr return
 * just F0. Function modeled to have shape of most common fresnel
 * reflectance function shape.
 *
 * @param float cosTheta - cos(viewDirection V, halfway vector H),
 * @param vec3 F0 - surface reflectance at 0dgr. vec3 somewhat models wavelengths
 */
vec3 FresnelSchlick(float cosTheta, vec3 F0) {
    return F0 + (1.0 - F0) * pow(1.0 - cosTheta, 5.0);
}

/**
 * Normal distribution function (D): GGX
 *
 * Just standard implementation ('Real Shading in Unreal Engine 4' equation 2)
 *
 * @param vec3 N - normalized normal
 * @param vec3 H - halfway vector
 * @param float roughness [0,1]
 */
float DistributionGGX(vec3 N, vec3 H, float roughness) {
    float a      = roughness*roughness;
    float a2     = a*a;
    float NdotH  = dotMax0(N, H);
    float NdotH2 = NdotH*NdotH;

    float num   = a2;
    float denom = NdotH2 * (a2 - 1.0) + 1.0;
    denom = PI * denom * denom;

    return num / denom;
}

/**
 * Self-shadowing Smith helper function.
 *
 * @see 'Real Shading in Unreal Engine 4' equation 4 line 1,2
 *
 * @param vec3 NdotV dot prod. between normal and vector to camera/light source
 * @param float roughness material property
 */
float GeometrySchlickGGX(float NdotV, float roughness) {
    float r = (roughness + 1.0);
    float k = (r*r) / 8.0;

    float num   = NdotV;
    float denom = NdotV * (1.0 - k) + k;

    return num / denom;
}

/**
 * Self-shadowing (G): GGX
 *
 * Just standard implementation ('Real Shading in Unreal Engine 4' equation 4 line 3). We do calculate self-shadowing in directions light-point and point-camera, then mul.
 *
 * @param vec3 N normal at current frag
 * @param vec3 V frag -> point
 * @param vec3 L frag -> light
 * @param float roughness material property
 *
 */
float GeometrySmith(vec3 N, vec3 V, vec3 L, float roughness) {
    float NdotV = dotMax0(N, V);
    float NdotL = dotMax0(N, L);
    float ggx2  = GeometrySchlickGGX(NdotV, roughness);
    float ggx1  = GeometrySchlickGGX(NdotL, roughness);

    return ggx1 * ggx2;
}

vec3 pbr_CookTorrance (const Material material, vec3 V, vec3 L, out vec3 F) {
  vec3 H = normalize(V + L); // halfway vector
  vec3 N = material.normal; // normal at fragment

  // F - Fresnel
  vec3 F0 = mix(DIELECTRIC_FRESNEL, material.albedo, material.isMetallic);
  F = FresnelSchlick(dotMax0(H, V), F0);
  // G - microfacet self-shadowing
  float G = GeometrySmith(N, V, L, material.roughness);
  // D - Normals distribution
  float NDF = DistributionGGX(N, H, material.roughness);

  // Cook-Torrance BRDF using NDF,G,F
  vec3 numerator = NDF * G * F;
  float denominator = 4.0 * dotMax0(N, V) * dotMax0(N, L);
  return numerator / max(denominator, 0.001);
}

vec3 pbr_mixDiffuseAndSpecular (const Material material, vec3 diffuse, vec3 specular, vec3 F) {
  vec3 kS = F;
  // kD for metalics is ~0 (means they have pure black diffuse color, but take color of specular)
  vec3 kD = mix(vec3(1.0) - kS, METALLIC_DIFFUSE_CONTRIBUTION, material.isMetallic);
  return kD * diffuse + specular;
}


vec3 pbr (const Material material, const Light light) {
  vec3 N = material.normal; // normal at fragment
  vec3 V = normalize(u_cameraPosition - material.positionWS); // viewDir
  vec3 L = light.position - material.positionWS; // wi in integral
  // float attenuation = lightAttenuation(length(L), light.radius);
  float attenuation = 1.0; // hardcoded for this demo
  L = normalize(L);

  // diffuse
  vec3 lambert = pbr_LambertDiffuse(material);

  // specular
  vec3 F;
  vec3 specular = pbr_CookTorrance(material, V, L, F);
  specular = specular * material.specularMul; // not PBR, but simplifies material setup

  // final light calc.
  float NdotL = dotMax0(N, L);
  vec3 brdfFinal = pbr_mixDiffuseAndSpecular(material, lambert, specular, F);
  vec3 radiance = light.color * attenuation * light.intensity; // incoming color from light
  return brdfFinal * radiance * NdotL;
}
