import React, { useEffect, useRef } from 'react';
import patterns from './patterns.json';
import Card from './Card.jsx';
import { usePlayer } from './usePlayer.js';
import './crt.css';

export default function App() {
  const { playingId, play, stop, error } = usePlayer();
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
    <>
      <div className="crt">
        {/* fixed top: title + now playing + punchcard screen */}
        <div className="crt-top">
          <header className="crt-header">
            <h1 className="crt-title">STRUDEL_GALLERY</h1>
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
          {error && <div className="crt-error">⚠ {error}</div>}
          <section className="crt-screen">
            <canvas id="test-canvas" ref={canvasRef} />
            <div className={`crt-screen-label${playing ? '' : ' no-signal'}`}>
              {playing ? playing.title : 'NO SIGNAL — SELECT A TRACK'}
            </div>
          </section>
        </div>

        {/* only this region scrolls */}
        <div className="crt-grid-wrap">
          {patterns.length === 0 ? (
            <p className="glow">// patterns/ に .mjs を追加してください。</p>
          ) : (
            <div className="crt-grid">
              {patterns.map((p) => (
                <Card
                  key={p.id}
                  pattern={p}
                  isPlaying={p.id === playingId}
                  onToggle={() => (p.id === playingId ? stop() : play(p.id, p.code))}
                />
              ))}
            </div>
          )}
        </div>

        <footer className="crt-footer">{patterns.length} TRACKS · STRUDEL // CRT GALLERY</footer>
      </div>

      <div className="crt-overlay crt-scanlines" />
      <div className="crt-overlay crt-vignette" />
      <div className="crt-overlay crt-flicker" />
      <div className="crt-bezel" />
    </>
  );
}
