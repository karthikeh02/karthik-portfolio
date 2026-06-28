import { useEffect, useRef } from "react";
import { isMobileTier, webglPixelRatio } from "@/lib/perf";

/**
 * Live "node network" — drifting points with dynamic connecting lines that
 * fade with distance, tinted across cyan→violet. Slowly auto-rotates and
 * parallaxes to the cursor.
 *
 * Hand-written WebGL (no Three.js): two draw calls — additive POINTS with a
 * soft radial falloff, and additive LINES with per-vertex colour — driven by a
 * minimal 4×4 matrix stack. Renders a single static frame for reduced-motion,
 * and pauses the loop when the hero is off screen or the tab is hidden.
 */

// --- tiny column-major mat4 helpers (only what we need) ---
type M4 = number[];
function perspective(fovy: number, aspect: number, near: number, far: number): M4 {
  const f = 1 / Math.tan(fovy / 2);
  const nf = 1 / (near - far);
  return [f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0];
}
function multiply(a: M4, b: M4): M4 {
  const o = new Array(16);
  for (let c = 0; c < 4; c++)
    for (let r = 0; r < 4; r++)
      o[c * 4 + r] =
        a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
  return o;
}
function rotX(t: number): M4 {
  const c = Math.cos(t), s = Math.sin(t);
  return [1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1];
}
function rotY(t: number): M4 {
  const c = Math.cos(t), s = Math.sin(t);
  return [c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1];
}

const POINT_VERT = `
  attribute vec3 a_pos;
  uniform mat4 u_proj, u_mv;
  uniform float u_size, u_scale;
  void main() {
    vec4 mv = u_mv * vec4(a_pos, 1.0);
    gl_Position = u_proj * mv;
    gl_PointSize = u_size * (u_scale / -mv.z);
  }
`;
const POINT_FRAG = `
  precision mediump float;
  uniform vec3 u_color;
  uniform float u_opacity;
  void main() {
    float d = length(gl_PointCoord - vec2(0.5)) * 2.0;
    if (d > 1.0) discard;
    float a = smoothstep(1.0, 0.0, d);
    a *= a; // sharper core to mimic a soft radial sprite
    gl_FragColor = vec4(u_color, a * u_opacity);
  }
`;
const LINE_VERT = `
  attribute vec3 a_pos;
  attribute vec3 a_col;
  uniform mat4 u_proj, u_mv;
  varying vec3 v_col;
  void main() {
    v_col = a_col;
    gl_Position = u_proj * u_mv * vec4(a_pos, 1.0);
  }
`;
const LINE_FRAG = `
  precision mediump float;
  varying vec3 v_col;
  uniform float u_opacity;
  void main() {
    gl_FragColor = vec4(v_col, u_opacity);
  }
`;

function program(gl: WebGLRenderingContext, vsSrc: string, fsSrc: string) {
  const p = gl.createProgram()!;
  const vs = gl.createShader(gl.VERTEX_SHADER)!;
  gl.shaderSource(vs, vsSrc);
  gl.compileShader(vs);
  const fs = gl.createShader(gl.FRAGMENT_SHADER)!;
  gl.shaderSource(fs, fsSrc);
  gl.compileShader(fs);
  gl.attachShader(p, vs);
  gl.attachShader(p, fs);
  gl.linkProgram(p);
  return { p, vs, fs };
}

export default function ParticleField({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = ref.current;
    if (!mount) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // The node-network STILL SHOWS on phones — just lighter (fewer nodes, dpr 1).
    // Only bail for truly ancient devices that can't handle any WebGL here.
    const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
    if (mem && mem <= 2) return;
    const mobile = isMobileTier();

    let width = mount.clientWidth || window.innerWidth;
    let height = mount.clientHeight || window.innerHeight;
    const dpr = mobile ? webglPixelRatio() : Math.min(window.devicePixelRatio, 1.5);

    const canvas = document.createElement("canvas");
    canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";
    const gl = canvas.getContext("webgl", { alpha: true, antialias: false }) as WebGLRenderingContext | null;
    if (!gl) return;

    // ---- particle state ----
    // Fewer nodes on mobile so the network still reads the same, just cheaper
    // (the O(n^2) connection pass + GPU re-upload scale with COUNT).
    const COUNT = mobile ? 50 : 90;
    const BX = 52, BY = 32, BZ = 26;
    const DIST = 19;
    const positions = new Float32Array(COUNT * 3);
    const velocities = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      positions[i * 3] = (Math.random() * 2 - 1) * BX;
      positions[i * 3 + 1] = (Math.random() * 2 - 1) * BY;
      positions[i * 3 + 2] = (Math.random() * 2 - 1) * BZ;
      velocities[i * 3] = (Math.random() * 2 - 1) * 0.045;
      velocities[i * 3 + 1] = (Math.random() * 2 - 1) * 0.045;
      velocities[i * 3 + 2] = (Math.random() * 2 - 1) * 0.045;
    }
    const MAX = COUNT * COUNT;
    const linePositions = new Float32Array(MAX * 6);
    const lineColors = new Float32Array(MAX * 6);

    // cyan → violet endpoints (matches the original lerp)
    const CYAN = [0x22 / 255, 0xd3 / 255, 0xee / 255];
    const VIOLET = [0x8b / 255, 0x5c / 255, 0xf6 / 255];

    // ---- GL programs / buffers ----
    const pts = program(gl, POINT_VERT, POINT_FRAG);
    const lns = program(gl, LINE_VERT, LINE_FRAG);
    const posBuf = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.DYNAMIC_DRAW);
    const lineBuf = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, lineBuf);
    gl.bufferData(gl.ARRAY_BUFFER, linePositions.byteLength, gl.DYNAMIC_DRAW);
    const lineColBuf = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, lineColBuf);
    gl.bufferData(gl.ARRAY_BUFFER, lineColors.byteLength, gl.DYNAMIC_DRAW);

    const pp_pos = gl.getAttribLocation(pts.p, "a_pos");
    const pp_proj = gl.getUniformLocation(pts.p, "u_proj");
    const pp_mv = gl.getUniformLocation(pts.p, "u_mv");
    const pp_size = gl.getUniformLocation(pts.p, "u_size");
    const pp_scale = gl.getUniformLocation(pts.p, "u_scale");
    const pp_color = gl.getUniformLocation(pts.p, "u_color");
    const pp_op = gl.getUniformLocation(pts.p, "u_opacity");

    const lp_pos = gl.getAttribLocation(lns.p, "a_pos");
    const lp_col = gl.getAttribLocation(lns.p, "a_col");
    const lp_proj = gl.getUniformLocation(lns.p, "u_proj");
    const lp_mv = gl.getUniformLocation(lns.p, "u_mv");
    const lp_op = gl.getUniformLocation(lns.p, "u_opacity");

    gl.disable(gl.DEPTH_TEST);
    gl.depthMask(false);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE); // additive

    let proj: M4 = [];
    let scale = 1;
    // Reusable matrix upload buffers — hoisted out of step() so we don't churn
    // two new Float32Array(16) allocations (and their GC) every frame.
    const projF = new Float32Array(16);
    const mvF = new Float32Array(16);
    const setSize = () => {
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      proj = perspective((60 * Math.PI) / 180, width / height, 0.1, 1000);
      scale = canvas.height * 0.5; // point-size attenuation reference (px)
    };
    setSize();
    mount.appendChild(canvas);

    let mouseX = 0, mouseY = 0;
    let tiltX = 0, tiltY = 0, spin = 0;
    const onMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    // rAF-coalesce resize: bursts of resize events collapse into one layout
    // read + setSize() per frame instead of thrashing on every event.
    let resizeRaf = 0;
    const onResize = () => {
      if (resizeRaf) return;
      resizeRaf = requestAnimationFrame(() => {
        resizeRaf = 0;
        width = mount.clientWidth || window.innerWidth;
        height = mount.clientHeight || window.innerHeight;
        setSize();
      });
    };
    window.addEventListener("resize", onResize, { passive: true });

    const step = () => {
      if (!reduce) {
        for (let i = 0; i < COUNT; i++) {
          for (let a = 0; a < 3; a++) {
            const idx = i * 3 + a;
            positions[idx] += velocities[idx];
            const bound = a === 0 ? BX : a === 1 ? BY : BZ;
            if (positions[idx] > bound || positions[idx] < -bound) velocities[idx] *= -1;
          }
        }
      }

      // dynamic connections
      let v = 0, c = 0, segs = 0;
      for (let i = 0; i < COUNT; i++) {
        const ix = positions[i * 3], iy = positions[i * 3 + 1], iz = positions[i * 3 + 2];
        const tcol = i / COUNT;
        const cr = CYAN[0] + (VIOLET[0] - CYAN[0]) * tcol;
        const cg = CYAN[1] + (VIOLET[1] - CYAN[1]) * tcol;
        const cb = CYAN[2] + (VIOLET[2] - CYAN[2]) * tcol;
        for (let j = i + 1; j < COUNT; j++) {
          const dx = ix - positions[j * 3];
          const dy = iy - positions[j * 3 + 1];
          const dz = iz - positions[j * 3 + 2];
          const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
          if (d < DIST) {
            const alpha = 1 - d / DIST;
            linePositions[v++] = ix; linePositions[v++] = iy; linePositions[v++] = iz;
            linePositions[v++] = positions[j * 3]; linePositions[v++] = positions[j * 3 + 1]; linePositions[v++] = positions[j * 3 + 2];
            for (let k = 0; k < 2; k++) {
              lineColors[c++] = cr * alpha; lineColors[c++] = cg * alpha; lineColors[c++] = cb * alpha;
            }
            segs++;
          }
        }
      }

      if (!reduce) {
        spin += 0.0011;
        tiltY += (mouseX * 0.32 - tiltY) * 0.04;
        tiltX += (-mouseY * 0.22 - tiltX) * 0.04;
      }
      // modelview = view(translate z -60) * rotY(spin+tiltY) * rotX(tiltX)
      const m = multiply(rotY(spin + tiltY), rotX(tiltX));
      const mv = [
        m[0], m[1], m[2], 0,
        m[4], m[5], m[6], 0,
        m[8], m[9], m[10], 0,
        0, 0, -60, 1,
      ];
      projF.set(proj);
      mvF.set(mv);

      gl.clear(gl.COLOR_BUFFER_BIT);

      // lines
      if (segs > 0) {
        gl.useProgram(lns.p);
        gl.bindBuffer(gl.ARRAY_BUFFER, lineBuf);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, linePositions.subarray(0, segs * 6));
        gl.enableVertexAttribArray(lp_pos);
        gl.vertexAttribPointer(lp_pos, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, lineColBuf);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, lineColors.subarray(0, segs * 6));
        gl.enableVertexAttribArray(lp_col);
        gl.vertexAttribPointer(lp_col, 3, gl.FLOAT, false, 0, 0);
        gl.uniformMatrix4fv(lp_proj, false, projF);
        gl.uniformMatrix4fv(lp_mv, false, mvF);
        gl.uniform1f(lp_op, 0.78);
        gl.drawArrays(gl.LINES, 0, segs * 2);
        gl.disableVertexAttribArray(lp_col);
      }

      // points (drawn on top)
      gl.useProgram(pts.p);
      gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, positions);
      gl.enableVertexAttribArray(pp_pos);
      gl.vertexAttribPointer(pp_pos, 3, gl.FLOAT, false, 0, 0);
      gl.uniformMatrix4fv(pp_proj, false, projF);
      gl.uniformMatrix4fv(pp_mv, false, mvF);
      gl.uniform1f(pp_size, 2.2);
      gl.uniform1f(pp_scale, scale);
      gl.uniform3f(pp_color, 0x6d / 255, 0xf1 / 255, 0xff / 255);
      gl.uniform1f(pp_op, 1.0);
      gl.drawArrays(gl.POINTS, 0, COUNT);
    };

    // ---- loop with offscreen / hidden-tab gating ----
    let raf = 0;
    let running = false;
    let last = 0;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      // ~33fps cap — the drift is slow enough that this is imperceptible but
      // halves the per-frame CPU (O(n^2) connections) + GPU re-upload cost.
      if (now - last < 30) return;
      last = now;
      step();
    };
    const start = () => {
      if (running || reduce) return;
      running = true;
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };
    let onScreen = true;
    let visible = !document.hidden;
    const sync = () => (onScreen && visible ? start() : stop());
    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        sync();
      },
      { threshold: 0 }
    );
    io.observe(mount);
    const onVisibility = () => {
      visible = !document.hidden;
      sync();
    };
    document.addEventListener("visibilitychange", onVisibility);

    if (reduce) step();
    else sync();

    return () => {
      stop();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", onResize);
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
      gl.deleteBuffer(posBuf);
      gl.deleteBuffer(lineBuf);
      gl.deleteBuffer(lineColBuf);
      gl.deleteShader(pts.vs); gl.deleteShader(pts.fs); gl.deleteProgram(pts.p);
      gl.deleteShader(lns.vs); gl.deleteShader(lns.fs); gl.deleteProgram(lns.p);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      if (canvas.parentNode === mount) mount.removeChild(canvas);
    };
  }, []);

  return <div ref={ref} className={className} aria-hidden="true" />;
}
