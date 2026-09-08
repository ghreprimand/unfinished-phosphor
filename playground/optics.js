/* SPDX-License-Identifier: GPL-3.0-only; Copyright (C) 2026 Unfinished Works */
export function optics() {
  return `<div class="optics-demo">
    <header class="optics-top"><span>01 / TYPE & OPTICS</span><span>VICTOR MONO · 400 / 700</span></header>
    <div class="type-study">
      <div class="type-primary"><h2 class="ph-title">Phosphor<span class="type-period">.</span></h2><p class="type-alphabet">Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm<br>Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz</p><p class="type-numerals ph-accent">0123456789 <span>→ ± × ÷</span></p></div>
      <div class="optical-target" aria-hidden="true"><div class="target-ring"></div><span class="target-glyph ph-title">Ag</span><span class="target-axis target-axis-x"></span><span class="target-axis target-axis-y"></span><span class="target-label">GLYPH / HALO</span></div>
    </div>
    <div class="study-caption"><span>Selectable HTML text</span><span>Foreground color drives emission</span><span>Stationary raster</span></div>
    <div class="optics-grid">
      <section class="reading-study ph-prose"><h3>02 / READING SURFACE</h3><p>Light spreads around each glyph. The letter itself stays in focus. Adjust the glow to compare a narrow halo with the full preset.</p><p class="ph-muted">Code and editable fields stay sharp. Select this text, tab through the controls, or compare with all decoration removed.</p><p class="reading-italic"><em>Regular, bold, and italic share the same optical treatment.</em></p></section>
      <section class="signal-study"><h3>03 / COLOR RESPONSE</h3><div class="signal-bars" aria-label="Six palette chart colors">${Array.from({length:6},(_,i)=>`<div style="--signal:var(--ph-chart-${i+1})"><span>${String(i+1).padStart(2,'0')}</span></div>`).join('')}</div><div class="signal-scale" aria-hidden="true"><span>SEMANTIC COLOR</span><span>FULL → LOW</span></div><p class="signal-status"><span class="ph-success">● Ready</span><span class="ph-warning">△ Review</span><span class="ph-danger">× Error</span></p><div class="reference-progress"><label for="signal-progress">Native progress</label><progress class="ph-progress" id="signal-progress" value="64" max="100">64%</progress><span>64%</span></div></section>
    </div>
    <section class="code-study"><div><h3>04 / SHARP CONTENT</h3><p>Opt out per region with <code>.ph-sharp</code>.<br>Native code and inputs opt out automatically.</p><span class="key-example"><kbd class="ph-kbd">Tab</kbd> moves focus</span></div><pre class="ph-code"><code><span class="ph-syntax-keyword">const</span> display = mountPhosphor(root, {
  palette: <span class="ph-syntax-string" id="study-palette">'dashboard:odyssey-crt'</span>,
  glow: <span class="ph-syntax-number" id="study-glow">100</span>, raster: <span class="ph-syntax-number" id="study-raster">100</span>, glass: <span class="ph-syntax-number" id="study-glass">100</span>,
});</code></pre></section>
    <footer class="optics-bottom"><span>CSS TEXT + SURFACE LAYERS</span><span>NO IMAGE FILTER ON CONTENT</span></footer>
  </div>`;
}
