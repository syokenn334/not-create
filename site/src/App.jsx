import React, { useEffect, useRef } from 'react';
import { VFXProvider, VFXSpan } from '@vfx-js/react';
import patterns from './patterns.json';
import Card from './Card.jsx';
import { usePlayer } from './usePlayer.js';
import './crt.css';

export default function App() {
  const { playingId, play, stop } = usePlayer();
  const canvasRef = useRef(null);

  // #test-canvas の描画バッファを表示サイズに合わせる(Strudel が punchcard を描く先)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(r.width * dpr));
      canvas.height = Math.max(1, Math.floor(r.height * dpr));
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  const playing = patterns.find((p) => p.id === playingId) || null;

  return (
    <VFXProvider>
      <div className="crt">
        <header className="crt-header">
          <VFXSpan className="crt-title" shader="rgbShift">
            STRUDEL_GALLERY
          </VFXSpan>
          <div className="crt-status">
            {playing ? (
              <>
                ▶ NOW PLAYING<span className="blink"> ▌</span>
              </>
            ) : (
              '■ STANDBY'
            )}
          </div>
        </header>

        <section className="crt-screen">
          <canvas id="test-canvas" ref={canvasRef} />
          <div className={`crt-screen-label${playing ? '' : ' no-signal'}`}>
            {playing ? playing.title : 'NO SIGNAL — SELECT A TRACK'}
          </div>
        </section>

        {patterns.length === 0 ? (
          <p className="glow">// まだパターンがありません。patterns/ に .mjs を追加してください。</p>
        ) : (
          <main className="crt-grid">
            {patterns.map((p) => (
              <Card
                key={p.id}
                pattern={p}
                isPlaying={p.id === playingId}
                onToggle={() => (p.id === playingId ? stop() : play(p.id, p.code))}
              />
            ))}
          </main>
        )}

        <footer className="crt-footer">
          {patterns.length} TRACKS · STRUDEL // CRT GALLERY
        </footer>
      </div>

      <div className="crt-overlay crt-scanlines" />
      <div className="crt-overlay crt-vignette" />
      <div className="crt-overlay crt-flicker" />
      <div className="crt-bezel" />
    </VFXProvider>
  );
}
