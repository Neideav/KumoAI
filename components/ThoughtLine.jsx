import React, { useEffect, useLayoutEffect, useRef, useState, useMemo } from 'react';
import { animate, useReducedMotion } from 'motion/react';
import { Sparkles, ChevronDown, Check, XCircle, AlertCircle } from 'lucide-react';
import './ThoughtLine.css';

const EASE_OUT = [0.16, 1, 0.3, 1];
const EASE_IN_OUT = [0.77, 0, 0.175, 1];
const GLYPH_DONE = 0.65;
const EMPTY_STEPS = [];

const formatElapsed = (ds) => {
  if (ds < 600) {
    return `${(ds / 10).toFixed(1)}s`;
  }
  const mins = Math.floor(ds / 600);
  const secs = ((ds % 600) / 10).toFixed(1);
  return `${mins}m ${secs}s`;
};

export default function ThoughtLine({
  status = 'idle', // 'idle' | 'started' | 'waiting' | 'streaming' | 'completed' | 'cancelled' | 'error'
  label,
  doneLabel,
  startTime,
  endTime,
  elapsed,
  steps = EMPTY_STEPS,
  thinkingContent = '',
  collapsible = true,
  collapseOnSettle = false,
  color,
  glyphColor,
  fontSize = 13.5,
  shimmer = true,
  shimmerDuration = 1.8,
  settleDuration = 300,
  showTimer = true,
  className = '',
  style
}) {
  const reduce = useReducedMotion();
  const isWorking = status === 'started' || status === 'waiting' || status === 'streaming';
  const isCancelled = status === 'cancelled';
  const isError = status === 'error';
  const isDone = status === 'completed' || isCancelled || isError;

  // Decide active and done labels truthfully
  const activeLabel = useMemo(() => {
    if (label) return label;
    if (status === 'started') return 'Mengirim permintaan...';
    if (status === 'streaming') return 'Menerima respons...';
    return 'Menunggu respons...';
  }, [label, status]);

  const settledLabel = useMemo(() => {
    if (doneLabel) return doneLabel;
    if (isCancelled) return 'Respons dibatalkan';
    if (isError) return 'Terjadi kendala';
    return 'Jawaban selesai';
  }, [doneLabel, isCancelled, isError]);

  const hasTrace = (steps && steps.length > 0) || Boolean(thinkingContent && thinkingContent.trim());
  const [open, setOpen] = useState(false);

  const glyphRef = useRef(null);
  const breathRef = useRef(null);
  const timerRef = useRef(null);
  const stackRef = useRef(null);
  const workRef = useRef(null);
  const doneRef = useRef(null);
  const dsRef = useRef(0);
  const prevWorking = useRef(isWorking);
  const [announce, setAnnounce] = useState(activeLabel);

  // Auto collapse on settle if configured
  useEffect(() => {
    if (isWorking) {
      // Keep closed by default while streaming unless user opens it
    } else if (collapseOnSettle) {
      setOpen(false);
    }
  }, [isWorking, collapseOnSettle]);

  // Breathing & shimmer animation coordination
  useEffect(() => {
    const glyphEl = glyphRef.current;
    const breathEl = breathRef.current;
    if (!breathEl) return undefined;

    const s = settleDuration / 1000;
    const running = [];
    let cancelled = false;

    if (isWorking) {
      if (!reduce && glyphEl) {
        const loop = animate(
          glyphEl,
          { opacity: [0.55, 1, 0.55], scale: [0.94, 1.06, 0.94] },
          { duration: 1.6, ease: EASE_IN_OUT, repeat: Infinity }
        );
        running.push(loop);
      }
      running.push(animate(breathEl, { opacity: 1 }, { duration: 0.2, ease: EASE_OUT }));
    } else {
      if (glyphEl) {
        running.push(animate(glyphEl, { opacity: GLYPH_DONE, scale: 1 }, { duration: s, ease: EASE_OUT }));
      }
      running.push(animate(breathEl, { opacity: 1 }, { duration: s, ease: EASE_OUT }));
    }

    return () => {
      cancelled = true;
      running.forEach((a) => a.stop());
    };
  }, [isWorking, settleDuration, reduce]);

  // Timer painting
  const paint = (ds) => {
    dsRef.current = ds;
    if (timerRef.current) {
      timerRef.current.textContent = formatElapsed(ds);
    }
  };

  // Live timer calculation based on request start time
  useLayoutEffect(() => {
    if (elapsed != null) {
      paint(Math.round(elapsed * 10));
      return undefined;
    }

    if (isDone && startTime && endTime) {
      const totalDs = Math.max(0, Math.floor((endTime - startTime) / 100));
      paint(totalDs);
      return undefined;
    }

    if (!isWorking) return undefined;

    const start = startTime || Date.now();
    paint(Math.max(0, Math.floor((Date.now() - start) / 100)));

    const id = setInterval(() => {
      const ds = Math.max(0, Math.floor((Date.now() - start) / 100));
      paint(ds);
    }, 100);

    return () => clearInterval(id);
  }, [isWorking, isDone, startTime, endTime, elapsed]);

  // Smooth position glide on transition
  useLayoutEffect(() => {
    const t = timerRef.current;
    const stack = stackRef.current;
    if (!t || !stack) return undefined;

    const place = (glide) => {
      const active = isWorking ? workRef.current : doneRef.current;
      if (!active) return;
      const shift = active.offsetWidth - stack.offsetWidth;
      if (!glide) t.style.transition = 'none';
      t.style.transform = `translateX(${shift}px)`;
      if (!glide) {
        void t.offsetWidth;
        t.style.transition = '';
      }
    };

    place(prevWorking.current !== isWorking);
    prevWorking.current = isWorking;

    const ro = new ResizeObserver(() => place(false));
    if (workRef.current) ro.observe(workRef.current);
    if (doneRef.current) ro.observe(doneRef.current);
    return () => ro.disconnect();
  }, [isWorking, activeLabel, settledLabel, fontSize, showTimer]);

  useEffect(() => {
    if (isWorking) {
      setAnnounce(activeLabel);
    } else {
      setAnnounce(`${settledLabel} ${formatElapsed(dsRef.current)}`);
    }
  }, [isWorking, activeLabel, settledLabel]);

  const toggle = hasTrace && collapsible;

  // Glyph icon selection based on status
  const GlyphIcon = useMemo(() => {
    if (isCancelled) return XCircle;
    if (isError) return AlertCircle;
    if (isDone) return Check;
    return Sparkles;
  }, [isCancelled, isError, isDone]);

  const glyphColorComputed = useMemo(() => {
    if (glyphColor) return glyphColor;
    if (isCancelled) return 'var(--text-muted)';
    if (isError) return 'var(--danger)';
    if (isDone) return 'var(--success)';
    return 'var(--accent-purple)';
  }, [glyphColor, isCancelled, isError, isDone]);

  return (
    <div
      className={`thought-line${className ? ` ${className}` : ''}`}
      data-working={isWorking ? '' : undefined}
      data-open={open && hasTrace ? '' : undefined}
      style={{
        '--tl-font': `${fontSize}px`,
        '--tl-color': color || 'var(--text-secondary)',
        '--tl-glyph': glyphColorComputed,
        '--tl-settle': `${settleDuration}ms`,
        '--tl-shimmer': `${shimmerDuration}s`,
        ...style
      }}
    >
      {collapsible ? (
        <button
          type="button"
          className="thought-line__head"
          data-toggle={toggle ? '' : undefined}
          aria-expanded={toggle ? open : undefined}
          tabIndex={toggle ? 0 : -1}
          onClick={() => {
            if (toggle) setOpen((v) => !v);
          }}
          title={toggle ? (open ? 'Sembunyikan detail proses' : 'Lihat detail proses') : undefined}
        >
          <span ref={glyphRef} className="thought-line__glyph" aria-hidden="true">
            <GlyphIcon size={14} strokeWidth={2.2} />
          </span>

          <span ref={stackRef} className="thought-line__label" aria-hidden="true">
            <span ref={workRef} className="thought-line__text" data-active={isWorking ? '' : undefined}>
              <span
                ref={breathRef}
                className="thought-line__breath"
                data-shimmer={shimmer && !reduce ? '' : undefined}
              >
                {activeLabel}
              </span>
            </span>

            <span
              ref={doneRef}
              className="thought-line__text thought-line__text--done"
              data-active={isWorking ? undefined : ''}
            >
              {settledLabel}
            </span>
          </span>

          {showTimer ? (
            <span
              ref={timerRef}
              className="thought-line__timer"
              data-done={isWorking ? undefined : ''}
              aria-hidden="true"
            >
              0.0s
            </span>
          ) : null}

          {toggle ? (
            <span className="thought-line__chevron" aria-hidden="true">
              <ChevronDown size={13} strokeWidth={2.2} />
            </span>
          ) : null}

          <span className="thought-line__sr" role="status">
            {announce}
          </span>
        </button>
      ) : (
        <div className="thought-line__head">
          <span ref={glyphRef} className="thought-line__glyph" aria-hidden="true">
            <GlyphIcon size={14} strokeWidth={2.2} />
          </span>

          <span ref={stackRef} className="thought-line__label" aria-hidden="true">
            <span ref={workRef} className="thought-line__text" data-active={isWorking ? '' : undefined}>
              <span ref={breathRef} className="thought-line__breath">
                {activeLabel}
              </span>
            </span>
            <span
              ref={doneRef}
              className="thought-line__text thought-line__text--done"
              data-active={isWorking ? undefined : ''}
            >
              {settledLabel}
            </span>
          </span>

          {showTimer ? (
            <span ref={timerRef} className="thought-line__timer" aria-hidden="true">
              0.0s
            </span>
          ) : null}
        </div>
      )}

      {hasTrace ? (
        <div className="thought-line__trace" data-open={open ? '' : undefined} aria-hidden={!open}>
          <div className="thought-line__fold">
            <div className="thought-line__steps">
              {steps && steps.length > 0
                ? steps.map((text, i) => {
                    const stepDone = !isWorking || i < steps.length - 1;
                    return (
                      <div key={`${i}-${text}`} className="thought-line__step" data-done={stepDone ? '' : undefined}>
                        <span className="thought-line__mark" aria-hidden="true">
                          {stepDone ? (
                            <Check size={12} strokeWidth={2.5} color="var(--success)" />
                          ) : (
                            <i className="thought-line__pulse" />
                          )}
                        </span>
                        <span className="thought-line__step-text">{text}</span>
                      </div>
                    );
                  })
                : null}

              {thinkingContent ? (
                <div className="thought-line__step" data-done="">
                  <div
                    className="thought-line__step-text"
                    style={{
                      padding: '6px 10px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-app)',
                      border: '1px solid var(--border-subtle)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '12px',
                      whiteSpace: 'pre-wrap',
                      maxWidth: '100%'
                    }}
                  >
                    {thinkingContent}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
