import { motion, useReducedMotion } from "framer-motion";
import { Lock, ShieldCheck, TrendingUp, Atom, Bug, Check } from "lucide-react";

const ACCENTS = {
  cyan: { hex: "#22d3ee", soft: "rgba(34,211,238,0.14)" },
  violet: { hex: "#8b5cf6", soft: "rgba(139,92,246,0.14)" },
  magenta: { hex: "#f472b6", soft: "rgba(244,114,182,0.14)" },
} as const;

type Accent = keyof typeof ACCENTS;
type Motif = "audit" | "engine" | "messages" | "lab";

const LABELS: Record<Motif, string> = {
  audit: "audit_log",
  engine: "live_engine",
  messages: "secure_channel",
  lab: "lab",
};

/** Abstract, animated motif for each project — no real data, pure atmosphere. */
export default function ProjectVisual({
  motif,
  accent,
}: {
  motif: Motif;
  accent: Accent;
}) {
  const a = ACCENTS[accent];

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl glass">
      {/* grid + glow */}
      <div className="absolute inset-0 bg-grid-fade [background-size:34px_34px] opacity-40" />
      <div
        className="absolute -inset-10 opacity-70"
        style={{
          background: `radial-gradient(circle at 50% 40%, ${a.soft}, transparent 72%)`,
        }}
      />

      <div className="absolute left-4 top-4 z-10 font-mono text-[0.65rem] uppercase tracking-[0.25em] text-fog-dim">
        {LABELS[motif]}
      </div>

      <div className="relative z-10 flex h-full w-full items-center justify-center p-8">
        {motif === "audit" && <Audit hex={a.hex} />}
        {motif === "engine" && <Engine hex={a.hex} />}
        {motif === "messages" && <Messages hex={a.hex} />}
        {motif === "lab" && <Lab hex={a.hex} />}
      </div>
    </div>
  );
}

/* ---------- audit · contract security scan ---------- */
const VULN = "#f472b6"; // magenta — the "vuln" marker
const FIXED = "#34d399"; // live green — the "fixed" check

type AuditRow = { w: string; indent: number; flags: boolean };

const AUDIT_ROWS: AuditRow[] = [
  { w: "82%", indent: 0, flags: false },
  { w: "64%", indent: 1, flags: true },
  { w: "73%", indent: 1, flags: false },
  { w: "58%", indent: 2, flags: true },
  { w: "70%", indent: 1, flags: false },
  { w: "48%", indent: 0, flags: false },
];

function Audit({ hex }: { hex: string }) {
  const reduce = useReducedMotion();

  return (
    <div className="relative w-full max-w-xs">
      <motion.div
        className="absolute -right-2 -top-9 opacity-20"
        animate={reduce ? undefined : { y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <ShieldCheck className="h-20 w-20" style={{ color: hex }} />
      </motion.div>

      {/* contract panel */}
      <div
        className="relative overflow-hidden rounded-2xl px-3.5 py-3.5"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {/* header */}
        <div className="mb-3 flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-fog-dim">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: hex, boxShadow: `0 0 8px ${hex}` }}
          />
          contract.sol
        </div>

        {/* code rows */}
        <div className="flex flex-col gap-2.5">
          {AUDIT_ROWS.map((r, i) => (
            <div
              key={i}
              className="flex items-center gap-2"
              style={{ paddingLeft: r.indent * 12 }}
            >
              {/* status marker — flips vuln -> fixed */}
              {r.flags ? (
                <Marker reduce={!!reduce} delay={i * 0.18} />
              ) : (
                <span className="h-3.5 w-3.5 shrink-0" />
              )}
              {/* code line */}
              <div className="relative h-2 flex-1 overflow-hidden rounded-full">
                <span
                  className="absolute inset-0 rounded-full"
                  style={{
                    width: r.w,
                    background: r.flags
                      ? `linear-gradient(90deg, ${FIXED}55, ${FIXED}10)`
                      : "rgba(255,255,255,0.10)",
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* scanning sweep line */}
        {!reduce && (
          <motion.div
            className="pointer-events-none absolute inset-x-0 h-12"
            style={{
              background: `linear-gradient(180deg, transparent, ${hex}22 45%, ${hex} 50%, ${hex}22 55%, transparent)`,
              top: 0,
            }}
            animate={{ y: ["-20%", "320%"] }}
            transition={{
              duration: 3.2,
              repeat: Infinity,
              ease: "easeInOut",
              repeatDelay: 0.4,
            }}
          />
        )}
      </div>
    </div>
  );
}

/** A status marker for a flagged row: starts as a magenta Bug, flips to a green Check. */
function Marker({ reduce, delay }: { reduce: boolean; delay: number }) {
  if (reduce) {
    // static "fixed" state — the resolved end-state
    return (
      <span
        className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[3px]"
        style={{ background: `${FIXED}22`, border: `1px solid ${FIXED}66` }}
      >
        <Check className="h-2.5 w-2.5" style={{ color: FIXED }} strokeWidth={3} />
      </span>
    );
  }

  return (
    <span className="relative flex h-3.5 w-3.5 shrink-0 items-center justify-center">
      {/* vuln */}
      <motion.span
        className="absolute flex h-3.5 w-3.5 items-center justify-center rounded-[3px]"
        style={{ background: `${VULN}22`, border: `1px solid ${VULN}66` }}
        animate={{ opacity: [1, 1, 0, 0, 1] }}
        transition={{
          duration: 5,
          times: [0, 0.38, 0.46, 0.92, 1],
          repeat: Infinity,
          delay,
        }}
      >
        <Bug className="h-2.5 w-2.5" style={{ color: VULN }} />
      </motion.span>
      {/* fixed */}
      <motion.span
        className="absolute flex h-3.5 w-3.5 items-center justify-center rounded-[3px]"
        style={{ background: `${FIXED}22`, border: `1px solid ${FIXED}66` }}
        animate={{ opacity: [0, 0, 1, 1, 0] }}
        transition={{
          duration: 5,
          times: [0, 0.38, 0.46, 0.92, 1],
          repeat: Infinity,
          delay,
        }}
      >
        <Check className="h-2.5 w-2.5" style={{ color: FIXED }} strokeWidth={3} />
      </motion.span>
    </span>
  );
}

/* ---------- messages · encrypted messages ---------- */
function Messages({ hex }: { hex: string }) {
  const reduce = useReducedMotion();
  return (
    <div className="relative w-full max-w-xs">
      <motion.div
        className="absolute -right-2 -top-10 opacity-20"
        animate={reduce ? undefined : { y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <ShieldCheck className="h-20 w-20" style={{ color: hex }} />
      </motion.div>

      <div className="flex flex-col gap-3">
        {[0, 1, 2].map((row) => {
          const right = row === 1;
          return (
            <motion.div
              key={row}
              className={`flex ${right ? "justify-end" : "justify-start"}`}
              initial={{ opacity: 0, x: right ? 18 : -18 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 * row, duration: 0.6 }}
            >
              <div
                className="relative flex items-center gap-2 overflow-hidden rounded-2xl px-3 py-2.5"
                style={{
                  width: right ? "62%" : "78%",
                  background: right ? `${hex}22` : "rgba(255,255,255,0.05)",
                  border: `1px solid ${right ? hex + "55" : "rgba(255,255,255,0.08)"}`,
                }}
              >
                <Lock className="h-3.5 w-3.5 shrink-0" style={{ color: hex }} />
                <div className="flex gap-1">
                  {[...Array(7)].map((_, i) => (
                    <motion.span
                      key={i}
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: hex, opacity: 0.5 }}
                      animate={reduce ? undefined : { opacity: [0.25, 0.9, 0.25] }}
                      transition={{
                        duration: 1.4,
                        repeat: Infinity,
                        delay: i * 0.12 + row * 0.2,
                      }}
                    />
                  ))}
                </div>
                {!reduce && (
                  <motion.div
                    className="absolute inset-y-0 w-1/3"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${hex}33, transparent)`,
                    }}
                    animate={{ x: ["-120%", "320%"] }}
                    transition={{ duration: 2.6, repeat: Infinity, delay: row * 0.4 }}
                  />
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- engine · live trading engine ---------- */
function Engine({ hex }: { hex: string }) {
  const reduce = useReducedMotion();
  const bars = [42, 60, 35, 78, 50, 88, 64, 96, 72, 58];
  return (
    <div className="relative w-full">
      <div className="mb-2 flex items-center gap-2">
        <TrendingUp className="h-4 w-4" style={{ color: hex }} />
        <motion.span
          className="font-mono text-xs"
          style={{ color: hex }}
          animate={reduce ? undefined : { opacity: [1, 0.4, 1] }}
          transition={{ duration: 1.6, repeat: Infinity }}
        >
          scanning…
        </motion.span>
      </div>

      <div className="flex h-36 items-end gap-1.5">
        {bars.map((h, i) => (
          <motion.div
            key={i}
            className="flex-1 rounded-t-sm"
            style={{
              background: `linear-gradient(to top, ${hex}22, ${hex})`,
            }}
            initial={{ height: "8%" }}
            whileInView={{ height: `${h}%` }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              className="h-full w-full rounded-t-sm"
              animate={reduce ? undefined : { opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
            />
          </motion.div>
        ))}
      </div>

      {/* signal line */}
      <svg className="pointer-events-none absolute inset-x-0 bottom-0 h-36 w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
        <motion.path
          d="M0 70 L12 55 L24 72 L36 30 L48 52 L60 18 L72 40 L84 12 L100 28"
          fill="none"
          stroke={hex}
          strokeWidth="1.4"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.6, ease: "easeInOut" }}
        />
      </svg>
    </div>
  );
}

/* ---------- lab · experiments / lab ---------- */
function Lab({ hex }: { hex: string }) {
  const reduce = useReducedMotion();
  return (
    <div className="relative flex h-44 w-44 items-center justify-center">
      {[0, 1, 2].map((ring) => (
        <motion.div
          key={ring}
          className="absolute rounded-full border"
          style={{
            inset: ring * 22,
            borderColor: `${hex}${ring === 0 ? "66" : "33"}`,
          }}
          animate={reduce ? undefined : { rotate: ring % 2 === 0 ? 360 : -360 }}
          transition={{ duration: 12 + ring * 6, repeat: Infinity, ease: "linear" }}
        >
          <span
            className="absolute h-2 w-2 rounded-full"
            style={{
              background: hex,
              top: -4,
              left: "50%",
              boxShadow: `0 0 12px ${hex}`,
            }}
          />
        </motion.div>
      ))}
      <motion.div
        className="relative flex h-14 w-14 items-center justify-center rounded-full"
        style={{ background: `${hex}22`, border: `1px solid ${hex}66` }}
        animate={reduce ? undefined : { scale: [1, 1.12, 1] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      >
        <Atom className="h-7 w-7" style={{ color: hex }} />
      </motion.div>
    </div>
  );
}
