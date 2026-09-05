const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const OUT = path.join(__dirname, 'generated');
fs.mkdirSync(OUT, { recursive: true });

const C = {
  paper: '#F4F4F0', ink: '#19191C', muted: '#6E6E76', line: '#D8D8D1',
  purple: '#6C47FF', purpleSoft: '#DED7FF', acid: '#C9FA68', white: '#FFFFFF'
};

const esc = (value) => String(value)
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

function base(width, height, body, label = 'YEEDIO / VIDEO CONTROL') {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M40 0H0V40" fill="none" stroke="#19191C" stroke-opacity=".045"/>
      </pattern>
      <filter id="shadow" x="-30%" y="-30%" width="160%" height="180%">
        <feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="#19191C" flood-opacity=".14"/>
      </filter>
      <linearGradient id="purpleGlow" x1="0" y1="0" x2="1" y2="1">
        <stop stop-color="#795CFF"/><stop offset="1" stop-color="#5230E8"/>
      </linearGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="${C.paper}"/>
    <rect width="${width}" height="${height}" fill="url(#grid)"/>
    <text x="64" y="58" font-family="Segoe UI,Arial,sans-serif" font-size="16" font-weight="800" letter-spacing="2.4" fill="${C.muted}">${esc(label)}</text>
    ${body}
  </svg>`;
}

function logo(x, y, size) {
  const r = size * .22;
  return `<g transform="translate(${x} ${y})">
    <rect width="${size}" height="${size}" rx="${r}" fill="${C.ink}"/>
    <rect x="${size*.13}" y="${size*.42}" width="${size*.25}" height="${size*.075}" rx="${size*.04}" fill="${C.acid}"/>
    <rect x="${size*.13}" y="${size*.58}" width="${size*.18}" height="${size*.075}" rx="${size*.04}" fill="${C.acid}"/>
    <path d="M${size*.47} ${size*.29}Q${size*.42} ${size*.26} ${size*.42} ${size*.34}V${size*.72}Q${size*.42} ${size*.8} ${size*.49} ${size*.76}L${size*.82} ${size*.57}Q${size*.89} ${size*.52} ${size*.82} ${size*.47}Z" fill="#F7F7F2"/>
  </g>`;
}

function pill(x, y, w, text, fill = C.white, color = C.ink, stroke = C.line) {
  return `<g><rect x="${x}" y="${y}" width="${w}" height="42" rx="21" fill="${fill}" stroke="${stroke}"/>
    <text x="${x+w/2}" y="${y+27}" text-anchor="middle" font-family="Segoe UI,Arial,sans-serif" font-size="16" font-weight="700" fill="${color}">${esc(text)}</text></g>`;
}

function popup(x, y, scale = 1) {
  return `<g transform="translate(${x} ${y}) scale(${scale})" filter="url(#shadow)">
    <rect width="340" height="500" rx="22" fill="${C.paper}" stroke="${C.line}"/>
    <g transform="translate(18 16)">${logo(0,0,28)}<text x="40" y="21" font-family="Segoe UI,Arial,sans-serif" font-size="20" font-weight="800" fill="${C.ink}">Yeedio</text>
      <circle cx="292" cy="14" r="14" fill="white" stroke="${C.line}"/><path d="M286 14h12M292 8v12" stroke="${C.muted}" stroke-width="1.7"/>
    </g>
    <path d="M0 58H340" stroke="${C.line}"/>
    <g transform="translate(16 76)">
      <rect width="308" height="142" rx="15" fill="white" stroke="${C.line}"/>
      <text x="16" y="30" font-family="Segoe UI,Arial,sans-serif" font-size="12" font-weight="800" letter-spacing="1.4" fill="${C.muted}">⚡  SPEED</text>
      <rect x="234" y="13" width="58" height="32" rx="10" fill="${C.paper}" stroke="${C.line}"/><text x="263" y="34" text-anchor="middle" font-family="Consolas,monospace" font-size="14" font-weight="700" fill="${C.ink}">2.00x</text>
      <path d="M24 70H284" stroke="${C.purpleSoft}" stroke-width="7" stroke-linecap="round"/><path d="M24 70H162" stroke="${C.purple}" stroke-width="7" stroke-linecap="round"/><circle cx="162" cy="70" r="10" fill="white" stroke="${C.ink}" stroke-width="3"/>
      ${pill(12,92,48,'1x')}${pill(66,92,58,'1.25x')}${pill(130,92,56,'1.5x')}${pill(192,92,46,'2x',C.acid,C.ink,C.ink)}${pill(244,92,50,'3x')}
    </g>
    <g transform="translate(16 230)">
      <rect width="308" height="126" rx="15" fill="white" stroke="${C.line}"/>
      <text x="16" y="30" font-family="Segoe UI,Arial,sans-serif" font-size="12" font-weight="800" letter-spacing="1.4" fill="${C.muted}">◖))  VOLUME BOOST</text>
      <rect x="234" y="13" width="58" height="32" rx="10" fill="${C.paper}" stroke="${C.line}"/><text x="263" y="34" text-anchor="middle" font-family="Consolas,monospace" font-size="14" font-weight="700" fill="${C.ink}">200%</text>
      <path d="M24 66H284" stroke="${C.purpleSoft}" stroke-width="7" stroke-linecap="round"/><path d="M24 66H119" stroke="${C.purple}" stroke-width="7" stroke-linecap="round"/><circle cx="119" cy="66" r="10" fill="white" stroke="${C.ink}" stroke-width="3"/>
      ${pill(12,84,54,'100%')}${pill(72,84,54,'150%')}${pill(132,84,54,'200%',C.acid,C.ink,C.ink)}${pill(192,84,48,'400%')}${pill(246,84,48,'600%')}
    </g>
    <g transform="translate(16 370)"><rect width="308" height="66" rx="15" fill="${C.ink}"/>
      <text x="15" y="22" font-family="Segoe UI,Arial,sans-serif" font-size="10" font-weight="800" letter-spacing="1.2" fill="#F4F4F0" opacity=".5">NOW PLAYING</text>
      <text x="15" y="47" font-family="Segoe UI,Arial,sans-serif" font-size="14" font-weight="700" fill="#F4F4F0">Focus playlist — 1080p</text>
    </g>
    <rect x="16" y="449" width="308" height="34" rx="17" fill="#E5F8BF" stroke="#B9DB84"/>
    <text x="170" y="471" text-anchor="middle" font-family="Consolas,monospace" font-size="12" fill="#3D5B12">Resolution: 1920×1080</text>
  </g>`;
}

const assets = [
  {
    name: '01-control-every-video.png', width: 1280, height: 800,
    body: `${logo(64,92,70)}
      <text x="64" y="244" font-family="Segoe UI,Arial,sans-serif" font-size="64" font-weight="850" letter-spacing="-2" fill="${C.ink}">One popup.</text>
      <text x="64" y="315" font-family="Segoe UI,Arial,sans-serif" font-size="64" font-weight="850" letter-spacing="-2" fill="${C.ink}">Total control.</text>
      <text x="68" y="374" font-family="Segoe UI,Arial,sans-serif" font-size="23" fill="${C.muted}">Speed, volume and resolution in one place.</text>
      ${pill(68,424,142,'0.25×–16×',C.acid,C.ink,C.ink)}${pill(222,424,148,'Up to 600%')}${pill(382,424,142,'19 languages')}
      <g transform="translate(760 92)"><rect width="440" height="610" rx="30" fill="${C.ink}"/>
        <circle cx="28" cy="28" r="5" fill="#EC514A"/><circle cx="47" cy="28" r="5" fill="#F2C94C"/><circle cx="66" cy="28" r="5" fill="${C.acid}"/>
        <rect x="34" y="72" width="372" height="506" rx="20" fill="url(#purpleGlow)"/>
        <path d="M188 213L188 438L374 325Z" fill="#F7F7F2" opacity=".95"/>
        <rect x="60" y="510" width="330" height="7" rx="4" fill="#fff" opacity=".25"/><rect x="60" y="510" width="206" height="7" rx="4" fill="${C.acid}"/>
      </g>${popup(650,160,.78)}`
  },
  {
    name: '02-speed-control.png', width: 1280, height: 800,
    body: `<text x="64" y="180" font-family="Segoe UI,Arial,sans-serif" font-size="64" font-weight="850" letter-spacing="-2" fill="${C.ink}">Set the perfect pace.</text>
      <text x="68" y="236" font-family="Segoe UI,Arial,sans-serif" font-size="24" fill="${C.muted}">Fine-tune any HTML5 video from 0.25× to 16×.</text>
      <g transform="translate(64 315)"><rect width="592" height="280" rx="28" fill="${C.ink}"/>
        <text x="42" y="65" font-family="Segoe UI,Arial,sans-serif" font-size="16" font-weight="800" letter-spacing="2" fill="#fff" opacity=".55">PLAYBACK SPEED</text>
        <text x="42" y="160" font-family="Consolas,monospace" font-size="86" font-weight="700" fill="${C.acid}">2.00×</text>
        <path d="M44 221H548" stroke="#fff" stroke-opacity=".2" stroke-width="10" stroke-linecap="round"/><path d="M44 221H315" stroke="${C.purple}" stroke-width="10" stroke-linecap="round"/><circle cx="315" cy="221" r="15" fill="#fff" stroke="${C.acid}" stroke-width="5"/>
      </g>
      <g transform="translate(724 126)">${popup(0,0,1.02)}</g>
      ${pill(82,636,88,'0.25×')}${pill(182,636,88,'1.25×')}${pill(282,636,82,'1.5×')}${pill(376,636,76,'2×',C.acid,C.ink,C.ink)}${pill(464,636,76,'3×')}${pill(552,636,82,'16×')}`
  },
  {
    name: '03-volume-boost.png', width: 1280, height: 800,
    body: `<text x="64" y="180" font-family="Segoe UI,Arial,sans-serif" font-size="64" font-weight="850" letter-spacing="-2" fill="${C.ink}">Hear what you were missing.</text>
      <text x="68" y="236" font-family="Segoe UI,Arial,sans-serif" font-size="24" fill="${C.muted}">Boost quiet videos up to 600% with precise controls.</text>
      <g transform="translate(64 320)"><rect width="700" height="350" rx="30" fill="url(#purpleGlow)"/>
        <text x="44" y="77" font-family="Segoe UI,Arial,sans-serif" font-size="17" font-weight="800" letter-spacing="2" fill="#fff" opacity=".65">VOLUME BOOST</text>
        <text x="44" y="180" font-family="Consolas,monospace" font-size="94" font-weight="700" fill="#fff">400%</text>
        <path d="M50 267H650" stroke="#fff" stroke-opacity=".25" stroke-width="11" stroke-linecap="round"/><path d="M50 267H436" stroke="${C.acid}" stroke-width="11" stroke-linecap="round"/><circle cx="436" cy="267" r="17" fill="#fff" stroke="${C.ink}" stroke-width="5"/>
      </g>
      <g transform="translate(826 304)">${[96,176,264,340,226,154,286].map((h,i)=>`<rect x="${i*48}" y="${320-h}" width="28" height="${h}" rx="14" fill="${i%2?C.purple:C.acid}"/>`).join('')}</g>`
  },
  {
    name: '04-shortcuts-presets.png', width: 1280, height: 800,
    body: `<text x="64" y="180" font-family="Segoe UI,Arial,sans-serif" font-size="64" font-weight="850" letter-spacing="-2" fill="${C.ink}">Stay in the flow.</text>
      <text x="68" y="236" font-family="Segoe UI,Arial,sans-serif" font-size="24" fill="${C.muted}">Use presets, exact values or keyboard shortcuts.</text>
      <g transform="translate(64 316)">
        <rect width="560" height="100" rx="22" fill="white" stroke="${C.line}"/><text x="30" y="38" font-family="Segoe UI,Arial,sans-serif" font-size="14" font-weight="800" letter-spacing="1.5" fill="${C.muted}">OPEN YEEDIO</text><text x="30" y="73" font-family="Segoe UI,Arial,sans-serif" font-size="21" font-weight="750" fill="${C.ink}">Alt + Shift + Y</text>
        <rect y="118" width="560" height="100" rx="22" fill="white" stroke="${C.line}"/><text x="30" y="156" font-family="Segoe UI,Arial,sans-serif" font-size="14" font-weight="800" letter-spacing="1.5" fill="${C.muted}">ADJUST SPEED</text><text x="30" y="191" font-family="Segoe UI,Arial,sans-serif" font-size="21" font-weight="750" fill="${C.ink}">Alt + Shift + , / .</text>
        <rect y="236" width="560" height="100" rx="22" fill="${C.ink}"/><text x="30" y="274" font-family="Segoe UI,Arial,sans-serif" font-size="14" font-weight="800" letter-spacing="1.5" fill="#fff" opacity=".55">YOUR PRESETS</text><text x="30" y="309" font-family="Segoe UI,Arial,sans-serif" font-size="21" font-weight="750" fill="${C.acid}">Saved across pages</text>
      </g>
      <g transform="translate(745 245)"><rect width="420" height="420" rx="44" fill="${C.ink}"/>
        <rect x="46" y="48" width="100" height="88" rx="18" fill="#2B2B30" stroke="#4B4B52"/><text x="96" y="103" text-anchor="middle" font-family="Segoe UI,Arial,sans-serif" font-size="22" font-weight="700" fill="#fff">Alt</text>
        <rect x="160" y="48" width="100" height="88" rx="18" fill="#2B2B30" stroke="#4B4B52"/><text x="210" y="103" text-anchor="middle" font-family="Segoe UI,Arial,sans-serif" font-size="22" font-weight="700" fill="#fff">Shift</text>
        <rect x="274" y="48" width="100" height="88" rx="18" fill="${C.acid}" stroke="#fff"/><text x="324" y="103" text-anchor="middle" font-family="Segoe UI,Arial,sans-serif" font-size="26" font-weight="850" fill="${C.ink}">Y</text>
        <text x="210" y="210" text-anchor="middle" font-family="Segoe UI,Arial,sans-serif" font-size="18" font-weight="800" letter-spacing="2" fill="#fff" opacity=".55">QUICK ACCESS</text>
        <path d="M90 292H330" stroke="${C.purple}" stroke-width="12" stroke-linecap="round"/><circle cx="246" cy="292" r="20" fill="#fff" stroke="${C.acid}" stroke-width="6"/>
        <text x="210" y="360" text-anchor="middle" font-family="Consolas,monospace" font-size="32" font-weight="700" fill="#fff">2.00×</text>
      </g>`
  },
  {
    name: '05-private-global.png', width: 1280, height: 800,
    body: `${logo(64,105,70)}
      <text x="64" y="257" font-family="Segoe UI,Arial,sans-serif" font-size="64" font-weight="850" letter-spacing="-2" fill="${C.ink}">Private by design.</text>
      <text x="68" y="315" font-family="Segoe UI,Arial,sans-serif" font-size="24" fill="${C.muted}">No accounts. No ads. No analytics. No external server.</text>
      <g transform="translate(64 392)">${pill(0,0,184,'19 languages',C.acid,C.ink,C.ink)}${pill(198,0,170,'Local settings')}${pill(382,0,160,'No tracking')}</g>
      <g transform="translate(690 105)"><rect width="500" height="575" rx="34" fill="${C.ink}"/>
        <circle cx="250" cy="175" r="90" fill="${C.purple}"/><path d="M216 174l24 25 49-57" fill="none" stroke="#fff" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>
        <text x="250" y="310" text-anchor="middle" font-family="Segoe UI,Arial,sans-serif" font-size="30" font-weight="800" fill="#fff">Your preferences stay local.</text>
        <text x="250" y="357" text-anchor="middle" font-family="Segoe UI,Arial,sans-serif" font-size="19" fill="#fff" opacity=".62">Built for focus, not data collection.</text>
        <g font-family="Segoe UI,Arial,sans-serif" font-size="22" font-weight="700" fill="${C.acid}" text-anchor="middle"><text x="115" y="458">EN</text><text x="250" y="458">TR</text><text x="385" y="458">DE</text><text x="115" y="510">ES</text><text x="250" y="510">日本語</text><text x="385" y="510">العربية</text></g>
      </g>`
  },
  {
    name: 'promo-small-440x280.png', width: 440, height: 280,
    body: `${logo(32,58,74)}<text x="128" y="92" font-family="Segoe UI,Arial,sans-serif" font-size="35" font-weight="850" fill="${C.ink}">Yeedio</text>
      <text x="34" y="174" font-family="Segoe UI,Arial,sans-serif" font-size="26" font-weight="800" fill="${C.ink}">Own the pace.</text><text x="34" y="209" font-family="Segoe UI,Arial,sans-serif" font-size="26" font-weight="800" fill="${C.ink}">Hear every detail.</text>
      <rect x="32" y="234" width="158" height="8" rx="4" fill="${C.acid}"/>`, label: 'VIDEO CONTROL'
  },
  {
    name: 'promo-marquee-1400x560.png', width: 1400, height: 560,
    body: `${logo(72,122,110)}<text x="216" y="174" font-family="Segoe UI,Arial,sans-serif" font-size="54" font-weight="850" fill="${C.ink}">Yeedio</text>
      <text x="72" y="304" font-family="Segoe UI,Arial,sans-serif" font-size="56" font-weight="850" letter-spacing="-1.5" fill="${C.ink}">Own the pace.</text>
      <text x="72" y="369" font-family="Segoe UI,Arial,sans-serif" font-size="56" font-weight="850" letter-spacing="-1.5" fill="${C.ink}">Hear every detail.</text>
      <text x="76" y="424" font-family="Segoe UI,Arial,sans-serif" font-size="23" fill="${C.muted}">Video speed up to 16× • Volume boost up to 600%</text>
      <g transform="translate(1015 38)">${popup(0,0,.88)}</g>`, label: 'YEEDIO / VIDEO CONTROL'
  }
];

async function render() {
  for (const asset of assets) {
    const svg = base(asset.width, asset.height, asset.body, asset.label);
    await sharp(Buffer.from(svg))
      .flatten({ background: C.paper })
      .png({ compressionLevel: 9, palette: false })
      .toFile(path.join(OUT, asset.name));
  }
  await sharp(path.join(__dirname, '..', 'icons', 'icon512.png'))
    .resize(128, 128)
    .flatten({ background: C.paper })
    .png({ compressionLevel: 9, palette: false })
    .toFile(path.join(OUT, 'store-icon-128.png'));
}

render().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
