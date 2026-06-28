import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { isMobileTier } from "@/lib/perf";

/**
 * Global, fixed full-viewport WebGL backdrop sitting BEHIND all content.
 * A single fullscreen triangle runs an fbm-noise fragment shader to paint a
 * slow, dark "aurora" — deep ink mixed with faint cyan / violet / magenta
 * bands that drift over time and warp gently toward the cursor. Multiplied
 * down hard so white text on top stays readable.
 *
 * Hand-written WebGL (no Three.js) — this is a couple of KB instead of pulling
 * in a whole 3D engine. Renders a single static frame for reduced-motion,
 * caps to ~30fps, and pauses on a hidden tab.
 *
 * The lead supplies z-index / opacity via `className`.
 */

const VERT = /* glsl */ `
  attribute vec2 a_pos;
  varying vec2 v_uv;
  void main() {
    v_uv = a_pos * 0.5 + 0.5;
    gl_Position = vec4(a_pos, 0.0, 1.0);
  }
`;

const FRAG = /* glsl */ `
  precision highp float;

  varying vec2 v_uv;
  uniform float u_time;
  uniform vec2 u_resolution;
  uniform vec2 u_mouse;
  uniform int u_octaves;

  // --- hash + value noise (self-contained, no imports) ---
  vec2 hash2(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return fract(sin(p) * 43758.5453123) * 2.0 - 1.0;
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
    float a = dot(hash2(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0));
    float b = dot(hash2(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0));
    float c = dot(hash2(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0));
    float d = dot(hash2(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }

  float fbm(vec2 p) {
    float sum = 0.0;
    float amp = 0.5;
    float freq = 1.0;
    for (int i = 0; i < 8; i++) {
      if (i >= u_octaves) break;
      sum += amp * noise(p * freq);
      freq *= 2.02;
      amp *= 0.5;
    }
    return sum;
  }

  void main() {
    vec2 uv = v_uv;
    vec2 p = (uv - 0.5) * vec2(u_resolution.x / u_resolution.y, 1.0);

    float t = u_time * 0.06;

    vec2 toMouse = (u_mouse - 0.5) * vec2(u_resolution.x / u_resolution.y, 1.0);
    p += toMouse * 0.12;

    vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(5.2, 1.3 - t)));
    vec2 r = vec2(
      fbm(p + 1.7 * q + vec2(8.3, 2.8) + 0.15 * t),
      fbm(p + 1.7 * q + vec2(1.6, 9.2) - 0.12 * t)
    );
    float f = fbm(p + 2.0 * r);

    float band = clamp(f * 0.5 + 0.5, 0.0, 1.0);

    vec3 ink     = vec3(0.024, 0.024, 0.031); // #060608
    vec3 cyan    = vec3(0.133, 0.827, 0.933); // #22d3ee
    vec3 violet  = vec3(0.545, 0.361, 0.965); // #8b5cf6
    vec3 magenta = vec3(0.957, 0.447, 0.714); // #f472b6

    vec3 col = ink;
    col = mix(col, violet, smoothstep(0.30, 0.85, band) * 0.55);
    col = mix(col, cyan, smoothstep(0.45, 1.00, q.x * 0.5 + 0.5) * 0.45);
    col = mix(col, magenta, smoothstep(0.72, 1.0, band) * 0.28);

    float vig = smoothstep(1.15, 0.25, length(uv - 0.5));
    col *= 0.55 + 0.45 * vig;

    // CRITICAL: multiply down hard — faint nebula, never a bright gradient
    col *= 0.4;
    col += ink * 0.6;

    gl_FragColor = vec4(col, 1.0);
  }
`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  return sh;
}

export default function AuroraShader({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = ref.current;
    if (!mount) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const mobile = isMobileTier();

    let width = mount.clientWidth || window.innerWidth;
    let height = mount.clientHeight || window.innerHeight;
    // Internal-resolution factor: render the canvas below CSS size — the soft,
    // multiplied-down aurora upscales invisibly when the canvas CSS-fills 100%.
    // Mobile 0.6x; desktop pinned to 1.0 (local factor — does NOT touch
    // perf.ts/webglPixelRatio, which the lead owns).
    const factor = mobile ? 0.6 : 1.0;

    const canvas = document.createElement("canvas");
    canvas.style.cssText =
      "position:absolute;inset:0;width:100%;height:100%;display:block";
    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      depth: false,
      premultipliedAlpha: false,
    }) as WebGLRenderingContext | null;
    // No WebGL → leave the div empty; the body's ink background shows through.
    if (!gl) return;

    const prog = gl.createProgram()!;
    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    // Fullscreen triangle (cheaper than a quad, covers clip space).
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, "u_time");
    const uRes = gl.getUniformLocation(prog, "u_resolution");
    const uMouse = gl.getUniformLocation(prog, "u_mouse");
    const uOctaves = gl.getUniformLocation(prog, "u_octaves");
    // Fewer fbm octaves — still recognizably banded, far cheaper. Phones use 2;
    // desktop uses 3 (was 4): the final color is multiplied down *0.4 and soft,
    // so dropping the highest-frequency octave is visually indistinguishable.
    gl.uniform1i(uOctaves, mobile ? 2 : 3);

    const setSize = () => {
      canvas.width = Math.floor(width * factor);
      canvas.height = Math.floor(height * factor);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    setSize();
    mount.appendChild(canvas);

    // Smoothed cursor warp.
    let mx = 0.5, my = 0.5, tx = 0.5, ty = 0.5;
    const onMove = (e: MouseEvent) => {
      tx = e.clientX / window.innerWidth;
      ty = 1 - e.clientY / window.innerHeight;
    };
    if (!coarse) window.addEventListener("mousemove", onMove, { passive: true });

    // rAF-coalesce resize: many resize events collapse into a single layout
    // read + setSize on the next frame, so a window drag can't thrash the GPU.
    let resizeRaf = 0;
    const applyResize = () => {
      resizeRaf = 0;
      width = mount.clientWidth || window.innerWidth;
      height = mount.clientHeight || window.innerHeight;
      setSize();
    };
    const onResize = () => {
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(applyResize);
    };
    window.addEventListener("resize", onResize, { passive: true });

    const t0 = performance.now();
    const render = () => {
      const t = (performance.now() - t0) / 1000;
      mx += (tx - mx) * 0.04;
      my += (ty - my) * 0.04;
      gl.uniform1f(uTime, t);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform2f(uMouse, mx, my);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    let raf = 0;
    let running = false;
    let last = 0;
    // Normal cap: ~24fps (≈41ms) on phones, ~25fps (≈40ms) on desktop. The
    // aurora drifts slowly, so the lower rate is imperceptible and saves GPU.
    const frameGap = mobile ? 41 : 40;
    // While the hero (screen 1) is in view we throttle hard to ~10fps: the hero
    // + ParticleField own the GPU there, and the last full frame stays painted
    // on the fixed canvas so the faint nebula is still visible. ParticleField
    // pauses when the hero scrolls off, so only one heavy GL context runs at a
    // time. Once scrolled past ~55% of the viewport we ramp to the normal cap.
    const HERO_GAP = 100; // ~10fps while the hero owns screen 1
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      // Hero (screen 1) in view → throttle to ~10fps so the hero + particles
      // own the GPU; otherwise ramp to the normal cap. The fixed canvas keeps
      // its last full frame painted between draws, so a low rate is invisible.
      const heroInView = window.scrollY < window.innerHeight * 0.55;
      const gap = heroInView ? HERO_GAP : frameGap;
      if (now - last < gap) return;
      last = now;
      render();
    };
    const start = () => {
      if (running || reduce) return;
      running = true;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };
    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibility);

    if (reduce) render();
    else start();

    return () => {
      stop();
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
      document.removeEventListener("visibilitychange", onVisibility);
      if (!coarse) window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", onResize);
      gl.deleteBuffer(buf);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteProgram(prog);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      if (canvas.parentNode === mount) mount.removeChild(canvas);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn("fixed inset-0 pointer-events-none", className)}
    />
  );
}
