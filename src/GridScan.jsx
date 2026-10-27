import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { EffectComposer, RenderPass, EffectPass, BloomEffect, ChromaticAberrationEffect } from 'postprocessing';

const vert = `
varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const frag = `
precision highp float;
uniform vec3 iResolution;
uniform float iTime;
uniform vec2 uSkew;
uniform float uTilt;
uniform float uYaw;
uniform float uLineThickness;
uniform vec3 uLinesColor;
uniform vec3 uScanColor;
uniform float uGridScale;
uniform float uLineStyle;
uniform float uLineJitter;
uniform float uScanOpacity;
uniform float uScanDirection;
uniform float uNoise;
uniform float uBloomOpacity;
uniform float uScanGlow;
uniform float uScanSoftness;
uniform float uPhaseTaper;
uniform float uScanDuration;
uniform float uScanDelay;
varying vec2 vUv;

uniform float uScanStarts[8];
uniform float uScanCount;

const int MAX_SCANS = 8;

float smoother01(float a, float b, float x){
  float t = clamp((x - a) / max(1e-5, (b - a)), 0.0, 1.0);
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
    vec2 p = (2.0 * fragCoord - iResolution.xy) / iResolution.y;

    vec3 ro = vec3(0.0);
    vec3 rd = normalize(vec3(p, 2.0));

    float cR = cos(uTilt), sR = sin(uTilt);
    rd.xy = mat2(cR, -sR, sR, cR) * rd.xy;

    float cY = cos(uYaw), sY = sin(uYaw);
    rd.xz = mat2(cY, -sY, sY, cY) * rd.xz;

    vec2 skew = clamp(uSkew, vec2(-0.7), vec2(0.7));
    rd.xy += skew * rd.z;

    vec3 color = vec3(0.0);
    float minT = 1e20;
    float gridScale = max(1e-5, uGridScale);
    float fadeStrength = 2.0;
    vec2 gridUV = vec2(0.0);

    float hitIsY = 1.0;
    for (int i = 0; i < 4; i++)
    {
        float isY = float(i < 2);
        float pos = mix(-0.2, 0.2, float(i)) * isY + mix(-0.5, 0.5, float(i - 2)) * (1.0 - isY);
        float num = pos - (isY * ro.y + (1.0 - isY) * ro.x);
        float den = isY * rd.y + (1.0 - isY) * rd.x;
        float t = num / den;
        vec3 h = ro + rd * t;

        float depthBoost = smoothstep(0.0, 3.0, h.z);
        h.xy += skew * 0.15 * depthBoost;

        bool use = t > 0.0 && t < minT;
        gridUV = use ? mix(h.zy, h.xz, isY) / gridScale : gridUV;
        minT = use ? t : minT;
        hitIsY = use ? isY : hitIsY;
    }

    vec3 hit = ro + rd * minT;
    float dist = length(hit - ro);

    float jitterAmt = clamp(uLineJitter, 0.0, 1.0);
    if (jitterAmt > 0.0) {
        vec2 j = vec2(
            sin(gridUV.y * 2.7 + iTime * 1.8),
            cos(gridUV.x * 2.3 - iTime * 1.6)
        ) * (0.15 * jitterAmt);
        gridUV += j;
    }
    float fx = fract(gridUV.x);
    float fy = fract(gridUV.y);
    float ax = min(fx, 1.0 - fx);
    float ay = min(fy, 1.0 - fy);
    float wx = fwidth(gridUV.x);
    float wy = fwidth(gridUV.y);
    float halfPx = max(0.0, uLineThickness) * 0.5;

    float tx = halfPx * wx;
    float ty = halfPx * wy;

    float aax = wx;
    float aay = wy;

    float lineX = 1.0 - smoothstep(tx, tx + aax, ax);
    float lineY = 1.0 - smoothstep(ty, ty + aay, ay);
    if (uLineStyle > 0.5) {
        float dashRepeat = 4.0;
        float dashDuty = 0.5;
        float vy = fract(gridUV.y * dashRepeat);
        float vx = fract(gridUV.x * dashRepeat);
        float dashMaskY = step(vy, dashDuty);
        float dashMaskX = step(vx, dashDuty);
        if (uLineStyle < 1.5) {
            lineX *= dashMaskY;
            lineY *= dashMaskX;
        } else {
            float dotRepeat = 6.0;
            float dotWidth = 0.18;
            float cy = abs(fract(gridUV.y * dotRepeat) - 0.5);
            float cx = abs(fract(gridUV.x * dotRepeat) - 0.5);
            float dotMaskY = 1.0 - smoothstep(dotWidth, dotWidth + fwidth(gridUV.y * dotRepeat), cy);
            float dotMaskX = 1.0 - smoothstep(dotWidth, dotWidth + fwidth(gridUV.x * dotRepeat), cx);
            lineX *= dotMaskY;
            lineY *= dotMaskX;
        }
    }
    float primaryMask = max(lineX, lineY);

    vec2 gridUV2 = (hitIsY > 0.5 ? hit.xz : hit.zy) / gridScale;
    if (jitterAmt > 0.0) {
        vec2 j2 = vec2(
            cos(gridUV2.y * 2.1 - iTime * 1.4),
            sin(gridUV2.x * 2.5 + iTime * 1.7)
        ) * (0.15 * jitterAmt);
        gridUV2 += j2;
    }
    float fx2 = fract(gridUV2.x);
    float fy2 = fract(gridUV2.y);
    float ax2 = min(fx2, 1.0 - fx2);
    float ay2 = min(fy2, 1.0 - fy2);
    float wx2 = fwidth(gridUV2.x);
    float wy2 = fwidth(gridUV2.y);
    float tx2 = halfPx * wx2;
    float ty2 = halfPx * wy2;
    float aax2 = wx2;
    float aay2 = wy2;
    float lineX2 = 1.0 - smoothstep(tx2, tx2 + aax2, ax2);
    float lineY2 = 1.0 - smoothstep(ty2, ty2 + aay2, ay2);
    if (uLineStyle > 0.5) {
        float dashRepeat2 = 4.0;
        float dashDuty2 = 0.5;
        float vy2m = fract(gridUV2.y * dashRepeat2);
        float vx2m = fract(gridUV2.x * dashRepeat2);
        float dashMaskY2 = step(vy2m, dashDuty2);
        float dashMaskX2 = step(vx2m, dashDuty2);
        if (uLineStyle < 1.5) {
            lineX2 *= dashMaskY2;
            lineY2 *= dashMaskX2;
        } else {
            float dotRepeat2 = 6.0;
            float dotWidth2 = 0.18;
            float cy2 = abs(fract(gridUV2.y * dotRepeat2) - 0.5);
            float cx2 = abs(fract(gridUV2.x * dotRepeat2) - 0.5);
            float dotMaskY2 = 1.0 - smoothstep(dotWidth2, dotWidth2 + fwidth(gridUV2.y * dotRepeat2), cy2);
            float dotMaskX2 = 1.0 - smoothstep(dotWidth2, dotWidth2 + fwidth(gridUV2.x * dotRepeat2), cx2);
            lineX2 *= dotMaskY2;
            lineY2 *= dotMaskX2;
        }
    }
    float altMask = max(lineX2, lineY2);

    float edgeDistX = min(abs(hit.x - (-0.5)), abs(hit.x - 0.5));
    float edgeDistY = min(abs(hit.y - (-0.2)), abs(hit.y - 0.2));
    float edgeDist = mix(edgeDistY, edgeDistX, hitIsY);
    float edgeGate = 1.0 - smoothstep(gridScale * 0.5, gridScale * 2.0, edgeDist);
    altMask *= edgeGate;

    float lineMask = max(primaryMask, altMask);

    float fade = exp(-dist * fadeStrength);

    float dur = max(0.05, uScanDuration);
    float del = max(0.0, uScanDelay);
    float scanZMax = 2.0;
    float widthScale = max(0.1, uScanGlow);
    float sigma = max(0.001, 0.18 * widthScale * uScanSoftness);
    float sigmaA = sigma * 2.0;

    float combinedPulse = 0.0;
    float combinedAura = 0.0;

    float cycle = dur + del;
    float tCycle = mod(iTime, cycle);
    float scanPhase = clamp((tCycle - del) / dur, 0.0, 1.0);
    float phase = scanPhase;
    if (uScanDirection > 0.5 && uScanDirection < 1.5) {
        phase = 1.0 - phase;
    } else if (uScanDirection > 1.5) {
        float t2 = mod(max(0.0, iTime - del), 2.0 * dur);
        phase = (t2 < dur) ? (t2 / dur) : (1.0 - (t2 - dur) / dur);
    }
    float scanZ = phase * scanZMax;
    float dz = abs(hit.z - scanZ);
    float lineBand = exp(-0.5 * (dz * dz) / (sigma * sigma));
    float taper = clamp(uPhaseTaper, 0.0, 0.49);
    float headW = taper;
    float tailW = taper;
    float headFade = smoother01(0.0, headW, phase);
    float tailFade = 1.0 - smoother01(1.0 - tailW, 1.0, phase);
    float phaseWindow = headFade * tailFade;
    float pulseBase = lineBand * phaseWindow;
    combinedPulse += pulseBase * clamp(uScanOpacity, 0.0, 1.0);
    float auraBand = exp(-0.5 * (dz * dz) / (sigmaA * sigmaA));
    combinedAura += (auraBand * 0.25) * phaseWindow * clamp(uScanOpacity, 0.0, 1.0);

    for (int i = 0; i < MAX_SCANS; i++) {
        if (float(i) >= uScanCount) break;
        float tActiveI = iTime - uScanStarts[i];
        float phaseI = clamp(tActiveI / dur, 0.0, 1.0);
        if (uScanDirection > 0.5 && uScanDirection < 1.5) {
            phaseI = 1.0 - phaseI;
        } else if (uScanDirection > 1.5) {
            phaseI = (phaseI < 0.5) ? (phaseI * 2.0) : (1.0 - (phaseI - 0.5) * 2.0);
        }
        float scanZI = phaseI * scanZMax;
        float dzI = abs(hit.z - scanZI);
        float lineBandI = exp(-0.5 * (dzI * dzI) / (sigma * sigma));
        float headFadeI = smoother01(0.0, headW, phaseI);
        float tailFadeI = 1.0 - smoother01(1.0 - tailW, 1.0, phaseI);
        float phaseWindowI = headFadeI * tailFadeI;
        float pulseI = lineBandI * phaseWindowI;
        combinedPulse += pulseI * clamp(uScanOpacity, 0.0, 1.0);
        float auraBandI = exp(-0.5 * (dzI * dzI) / (sigmaA * sigmaA));
        combinedAura += (auraBandI * 0.25) * phaseWindowI * clamp(uScanOpacity, 0.0, 1.0);
    }

    combinedPulse = clamp(combinedPulse, 0.0, 1.0);
    combinedAura = clamp(combinedAura, 0.0, 1.0);

    float noiseVal = 0.0;
    if (uNoise > 0.0) {
        noiseVal = fract(sin(dot(fragCoord.xy + iTime, vec2(12.9898, 78.233))) * 43758.5453);
        noiseVal = (noiseVal - 0.5) * uNoise;
    }

    vec3 gridLines = uLinesColor * lineMask * fade;
    vec3 scanPulse = uScanColor * combinedPulse * lineMask * fade;
    vec3 scanAura = uScanColor * combinedAura * fade;

    color = gridLines + scanPulse + scanAura;
    color += vec3(noiseVal);
    color = clamp(color, 0.0, 1.0);

    float alpha = max(lineMask * fade, max(combinedPulse * fade, combinedAura * fade));
    alpha = clamp(alpha + noiseVal, 0.0, 1.0);

    fragColor = vec4(color, alpha);
}

void main(){
  mainImage(gl_FragColor, vUv * iResolution.xy);
}
`;

function hexToVec3(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return new THREE.Vector3(r, g, b);
}

const GridScan = ({
  sensitivity = 0.5,
  lineThickness = 1,
  linesColor = '#ffffff',
  gridScale = 0.15,
  scanColor = '#00e5ff',
  scanOpacity = 0.5,
  enablePost = true,
  bloomIntensity = 0.4,
  chromaticAberration = 0.002,
  noiseIntensity = 0.02,
  lineJitter = 0.0,
  scanGlow = 0.5,
  scanSoftness = 2,
  lineStyle = 0,
  scanDirection = 0,
  scanDuration = 2.0,
  scanDelay = 0.5,
  phaseTaper = 0.15,
  enableWebcam = false,
  showPreview = false,
  rotationSpeed = 0,
}) => {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const composerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const materialRef = useRef(null);
  const animRef = useRef(null);
  const clockRef = useRef(new THREE.Clock());
  const mouseRef = useRef({ x: 0, y: 0 });
  const targetSkewRef = useRef({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    targetSkewRef.current.x = nx * sensitivity * 0.3;
    targetSkewRef.current.y = ny * sensitivity * 0.3;
  }, [sensitivity]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const linesVec = hexToVec3(linesColor);
    const scanVec = hexToVec3(scanColor);

    const uniforms = {
      iResolution: { value: new THREE.Vector3(container.clientWidth, container.clientHeight, 1) },
      iTime: { value: 0 },
      uSkew: { value: new THREE.Vector2(0, 0) },
      uTilt: { value: 0.35 },
      uYaw: { value: 0.0 },
      uLineThickness: { value: lineThickness },
      uLinesColor: { value: linesVec },
      uScanColor: { value: scanVec },
      uGridScale: { value: gridScale },
      uLineStyle: { value: lineStyle },
      uLineJitter: { value: lineJitter },
      uScanOpacity: { value: scanOpacity },
      uScanDirection: { value: scanDirection },
      uNoise: { value: noiseIntensity },
      uBloomOpacity: { value: bloomIntensity },
      uScanGlow: { value: scanGlow },
      uScanSoftness: { value: scanSoftness },
      uPhaseTaper: { value: phaseTaper },
      uScanDuration: { value: scanDuration },
      uScanDelay: { value: scanDelay },
      uScanStarts: { value: new Float32Array(8) },
      uScanCount: { value: 0 },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader: vert,
      fragmentShader: frag,
      uniforms,
      transparent: true,
      depthWrite: false,
    });
    materialRef.current = material;

    const plane = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(plane);

    let composer = null;
    if (enablePost) {
      composer = new EffectComposer(renderer);
      const renderPass = new RenderPass(scene, camera);
      composer.addPass(renderPass);

      const effects = [];
      if (bloomIntensity > 0) {
        const bloom = new BloomEffect({ intensity: bloomIntensity, luminanceThreshold: 0.2, luminanceSmoothing: 0.9 });
        effects.push(bloom);
      }
      if (chromaticAberration > 0) {
        const ca = new ChromaticAberrationEffect({ offset: new THREE.Vector2(chromaticAberration, chromaticAberration) });
        effects.push(ca);
      }
      if (effects.length > 0) {
        composer.addPass(new EffectPass(camera, ...effects));
      }
      composerRef.current = composer;
    }

    const animate = () => {
      animRef.current = requestAnimationFrame(animate);
      const t = clockRef.current.getElapsedTime();
      uniforms.iTime.value = t;
      uniforms.uYaw.value = t * rotationSpeed;

      mouseRef.current.x += (targetSkewRef.current.x - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (targetSkewRef.current.y - mouseRef.current.y) * 0.05;
      uniforms.uSkew.value.set(mouseRef.current.x, mouseRef.current.y);

      if (composer) {
        composer.render();
      } else {
        renderer.render(scene, camera);
      }
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h);
      uniforms.iResolution.value.set(w, h, 1);
      if (composer) composer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);
    container.addEventListener('mousemove', handleMouseMove);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handleMouseMove);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      material.dispose();
      if (composer) composer.dispose();
    };
  }, [
    linesColor, scanColor, lineThickness, gridScale, scanOpacity,
    enablePost, bloomIntensity, chromaticAberration, noiseIntensity,
    lineJitter, scanGlow, scanSoftness, lineStyle, scanDirection,
    scanDuration, scanDelay, phaseTaper, handleMouseMove
  ]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
      }}
    />
  );
};

export default GridScan;