import React from 'react';
import patterns from './patterns.json';
import Card from './Card.jsx';
import { usePlayer } from './usePlayer.js';
import './crt.css';

export default function App() {
  const {
    playingId,
    play,
    stop,
    error,
    partInfos,
    registerCanvas,
    registerSpectrumCanvas,
  } = usePlayer();

  const playing = patterns.find((p) => p.id === playingId) || null;
  // ビデオデッキ風の下部ディスプレイ: 再生中は曲名、待機中はギャラリー名(将来は階層名)
  const deckText = playing ? playing.title : 'STRUDEL_GALLERY';
  // 自動グリッド: パート数に応じて ceil(√N) 列。
  const cols = Math.max(1, Math.ceil(Math.sqrt(partInfos.length || 1)));

  return (
    <>
      <div className="crt">
        <div className="crt-top">
          {error && <div className="crt-error">⚠ {error}</div>}
          <section className="crt-screen">
            <canvas className="crt-spectrum" ref={registerSpectrumCanvas} />
            <div className="crt-parts" style={{ '--cols': cols }}>
              {partInfos.map((p, i) => (
                <div className="crt-part" key={p.key}>
                  <span className="crt-part-tag">{i + 1}</span>
                  <canvas
                    className="crt-part-canvas"
                    ref={(el) => registerCanvas(i, el)}
                  />
                </div>
              ))}
            </div>
            <div className="crt-screen-status">
              {playing ? '▶ NOW PLAYING' : '■ STANDBY'}
            </div>
            {!playing && <div className="crt-screen-label no-signal">NO SIGNAL</div>}
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

        <footer className="crt-footer">{patterns.length} TRACKS</footer>
      </div>

      <div className="crt-overlay crt-scanlines" />
      <div className="crt-overlay crt-vignette" />
      <div className="crt-overlay crt-flicker" />
      <div className="crt-bezel" />

      {/* bottom-chin capsule sub-display (VCR-style) */}
      <div className="crt-deck">
        <span className={`crt-deck-text${playing ? ' scrolling' : ''}`}>{deckText}</span>
      </div>
    </>
  );
}
