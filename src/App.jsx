import {
  useEffect, useRef, useState, Suspense, useCallback
} from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Stars, Float, Sparkles } from '@react-three/drei'
import {
  motion, AnimatePresence,
  useScroll, useTransform, useSpring
} from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { QRCodeSVG } from 'qrcode.react'
import './index.css'

// ─────────────────────────────────────────────────────────────
//  MOBILE DETECTION
// ─────────────────────────────────────────────────────────────
function useIsMobile() {
  const [mobile, setMobile] = useState(() => window.innerWidth <= 768)
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth <= 768)
    window.addEventListener('resize', fn, { passive: true })
    return () => window.removeEventListener('resize', fn)
  }, [])
  return mobile
}

// ─────────────────────────────────────────────────────────────
//  CONTENT — English & Tamil
// ─────────────────────────────────────────────────────────────
const CONTENT = {
  en: {
    hero: {
      together: 'TOGETHER WITH OUR FAMILIES',
      invite:   'request the honour of your presence\nat the celebration of our Nikah & Walima',
      scroll:   'SCROLL',
      nikahTag: 'NIKAH', walimaTag: 'WALIMA',
    },
    ayat: {
      eyebrow: 'A SIGN FROM ALLAH', number: '02', title: 'The Ayat',
      trans: '"And among His signs is that He created for you mates from among yourselves, that you may find tranquility in them; and He placed between you affection and mercy. Indeed in that are signs for a people who reflect."',
      ref: 'SURAH AR-RUM · 30:21',
    },
    events: {
      eyebrow: 'JOIN US TO CELEBRATE', number: '01', title: 'The Occasions',
      dateLabel: 'DATE', timeLabel: 'TIME', countdownLabel: 'COUNTING DOWN',
      nikah: {
        title: 'Nikah alias Marriage',
        date: '25th October 2026', day: 'Sunday', time: '10:00 AM onwards',
        badge: 'NIKAH CEREMONY · 25 OCT 2026 · 10:00 AM',
        venue: 'Kadher Deluxe Mahal',
        addressLines: ['Near Bus Stand,', 'Ramanathapuram,', 'Tamil Nadu — 623504'],
        addrLabel: 'Venue', directions: 'Get Directions', scanLabel: 'SCAN FOR DIRECTIONS',
      },
      walima: {
        title: 'Walima alias Reception',
        date: '1st November 2026', day: 'Sunday', time: '1:00 PM onwards',
        badge: 'WALIMA RECEPTION · 1 NOV 2026 · 1:00 PM',
        venue: 'Sri Pichamuthu Nayakkar Kalyana Mandapam',
        addressLines: ['Main Road, Petthanayakkanpalayam,', 'Attur, Salem District,', 'Tamil Nadu — 636109'],
        addrLabel: 'Venue', directions: 'Get Directions', scanLabel: 'SCAN FOR DIRECTIONS',
      },
    },
    countdown: {
      eyebrow: 'THE BIG DAY APPROACHES', number: '03', title: 'Counting Down',
      nikahLabel:  'Until the Nikah — Sunday, 25th October 2026 · 10:00 AM',
      walimaLabel: 'Until the Walima — Sunday, 1st November 2026 · 1:00 PM',
      units: ['Days', 'Hours', 'Minutes', 'Seconds'],
    },
    closing: {
      verse: '"And We created you in pairs" — Surah An-Naba 78:8',
      await: 'WE AWAIT THE HONOUR OF YOUR PRESENCE',
      love:  'WITH LOVE — THE FAMILIES OF ARAFATH & ASSHIFA',
    },
    music: { playing: 'Now Playing', muted: 'Muted' },
  },

  ta: {
    hero: {
      together: 'எங்கள் குடும்பங்களுடன்',
      invite:   'எங்கள் நிக்காஹ் & வரவேற்பு விழாவில்\nதங்கள் வருகையை வேண்டுகிறோம்',
      scroll:   'கீழே பார்க்கவும்',
      nikahTag: 'நிக்காஹ்', walimaTag: 'வரவேற்பு',
    },
    ayat: {
      eyebrow: 'அல்லாஹ்வின் அத்தாட்சி', number: '02', title: 'வசனம்',
      trans: '"அவனது அத்தாட்சிகளில் ஒன்று என்னவென்றால், உங்களிலிருந்தே உங்களுக்கு துணைகளை படைத்தான் — அவர்களிடம் நீங்கள் அமைதி காண்பதற்காக; உங்களிடையே அன்பையும் கருணையையும் வைத்தான். சிந்திக்கும் மக்களுக்கு அதில் அத்தாட்சிகள் உள்ளன."',
      ref: 'சூரா அர்-ரூம் · 30:21',
    },
    events: {
      eyebrow: 'கொண்டாட எங்களுடன் சேருங்கள்', number: '01', title: 'நிகழ்வுகள்',
      dateLabel: 'தேதி', timeLabel: 'நேரம்', countdownLabel: 'எண்ணிக்கை',
      nikah: {
        title: 'நிக்காஹ் (எ) திருமணம்',
        date: '25 அக்டோபர் 2026', day: 'ஞாயிறு', time: 'காலை 10:00 மணி முதல்',
        badge: 'நிக்காஹ் விழா · 25 அக்டோபர் 2026 · காலை 10:00',
        venue: 'காதர் டீலக்ஸ் மஹால்',
        addressLines: ['பேருந்து நிலையம் அருகில்,', 'இராமநாதபுரம்,', 'தமிழ்நாடு — 623504'],
        addrLabel: 'இடம்', directions: 'வழிகாட்டி பெறுக', scanLabel: 'வழிகாட்டிக்கு ஸ்கேன் செய்யுங்கள்',
      },
      walima: {
        title: 'வலீமா (எ) வரவேற்பு',
        date: '1 நவம்பர் 2026', day: 'ஞாயிறு', time: 'பிற்பகல் 1:00 மணி முதல்',
        badge: 'வரவேற்பு — வலீமா · 1 நவம்பர் 2026 · பிற்பகல் 1:00',
        venue: 'ஸ்ரீ பிச்சமுத்து நாயக்கர் கல்யாண மண்டபம்',
        addressLines: ['மெயின் ரோடு, பெத்தநாயக்கன்பாளையம்,', 'ஆத்தூர், சேலம் மாவட்டம்,', 'தமிழ்நாடு — 636109'],
        addrLabel: 'இடம்', directions: 'வழிகாட்டி பெறுக', scanLabel: 'வழிகாட்டிக்கு ஸ்கேன் செய்யுங்கள்',
      },
    },
    countdown: {
      eyebrow: 'அந்த நாள் நெருங்குகிறது', number: '03', title: 'எண்ணிக்கை',
      nikahLabel:  'நிக்காஹ் வரை — ஞாயிறு, 25 அக்டோபர் 2026 · காலை 10:00',
      walimaLabel: 'வரவேற்பு வரை — ஞாயிறு, 1 நவம்பர் 2026 · பிற்பகல் 1:00',
      units: ['நாட்கள்', 'மணி', 'நிமிடம்', 'நொடி'],
    },
    closing: {
      verse: '"நாம் உங்களை ஜோடிகளாக படைத்தோம்" — சூரா அன்-நபா 78:8',
      await: 'தங்கள் வருகையையும் எதிர்நோக்குகிறோம்',
      love:  'அன்புடன் — அரஃபாத் மற்றும் அஷ்ஷிஃபாவின் குடும்பங்கள்',
    },
    music: { playing: 'இசை ஒலிக்கிறது', muted: 'மௌனம்' },
  },
}

// ─────────────────────────────────────────────────────────────
//  SHARED — Ornament divider
// ─────────────────────────────────────────────────────────────
function Ornament({ icon = '◆' }) {
  return (
    <div className="ornament">
      <span className="orn-line" />
      <span className="orn-gems">✦ {icon} ✦</span>
      <span className="orn-line" />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
//  COUNTDOWN (shared between mobile and desktop)
// ─────────────────────────────────────────────────────────────
function Countdown({ target, units }) {
  const calc = useCallback(() => {
    const d = +new Date(target) - Date.now()
    if (d <= 0) return { d: 0, h: 0, m: 0, s: 0 }
    return {
      d: Math.floor(d / 864e5),
      h: Math.floor((d % 864e5) / 36e5),
      m: Math.floor((d % 36e5) / 6e4),
      s: Math.floor((d % 6e4) / 1e3),
    }
  }, [target])
  const [t, setT] = useState(calc)
  useEffect(() => {
    const id = setInterval(() => setT(calc()), 1000)
    return () => clearInterval(id)
  }, [calc])

  return (
    <div className="cdwn">
      {[[units[0], t.d], [units[1], t.h], [units[2], t.m], [units[3], t.s]].map(([u, v]) => (
        <div key={u} className="cdwn__cell">
          <span className="cdwn__num">{String(v).padStart(2, '0')}</span>
          <span className="cdwn__unit">{u}</span>
        </div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
//  PRELOADER  — same for both mobile and desktop
// ─────────────────────────────────────────────────────────────
function Preloader({ onComplete }) {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 2200)
    return () => clearTimeout(t)
  }, [])

  return (
    <motion.div className="preloader" exit={{ opacity: 0 }} transition={{ duration: 1.2 }}>
      <div className="pl-rings">
        <div className="pl-ring pl-ring--1" />
        <div className="pl-ring pl-ring--2" />
        <div className="pl-ring pl-ring--3" />
      </div>
      <motion.div className="pl-text"
        initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.9 }}>
        <p className="pl-arabic">بِسْمِ اللهِ الرَّحْمنِ الرَّحِيْمِ</p>
        <p className="pl-en">ARAFATH A &amp; ASSHIFA S</p>
        <p className="pl-invite-line">
          You are cordially invited to our Wedding
          <br />
          <span className="pl-invite-ta">திருமணத்திற்கு அன்புடன் அழைக்கிறோம்</span>
        </p>
      </motion.div>
      <AnimatePresence>
        {ready && (
          <motion.div className="pl-lang-row"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
            <button className="pl-lang-btn" onClick={() => onComplete('en')}>
              <span className="pl-lang-btn__rings">
                <span className="pl-lang-btn__ring pl-lang-btn__ring--1" />
                <span className="pl-lang-btn__ring pl-lang-btn__ring--2" />
              </span>
              <span className="pl-lang-btn__label">English</span>
              <span className="pl-lang-btn__sub">Open Invitation</span>
            </button>
            <button className="pl-lang-btn pl-lang-btn--ta" onClick={() => onComplete('ta')}>
              <span className="pl-lang-btn__rings">
                <span className="pl-lang-btn__ring pl-lang-btn__ring--1" />
                <span className="pl-lang-btn__ring pl-lang-btn__ring--2" />
              </span>
              <span className="pl-lang-btn__label">தமிழ்</span>
              <span className="pl-lang-btn__sub">அழைப்பிதழ் திற</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// Music player removed — new track will be added later

// ═════════════════════════════════════════════════════════════
//  MOBILE VIEW  — completely plain, zero animations, no Three.js
// ═════════════════════════════════════════════════════════════
function MobileCombinedCard({ type, ev, mapsUrl, dateLabel, timeLabel, target, units, countdownLabel }) {
  return (
    <div className={`m-ev-card m-ev-card--${type}`}>
      <div className="m-ev-badge">{type === 'nikah' ? '☽' : '✦'}</div>
      <h3 className="m-ev-title">{ev.title}</h3>
      <p className="m-venue-badge">{ev.badge}</p>
      <Ornament icon={type === 'nikah' ? '☽' : '✦'} />
      <p className="m-ev-label">{dateLabel}</p>
      <p className="m-ev-val">{ev.date}</p>
      <p className="m-ev-sub">{ev.day}</p>
      <div className="m-ev-div" />
      <p className="m-ev-label">{timeLabel}</p>
      <p className="m-ev-val">{ev.time}</p>
      <div className="m-ev-div" />
      <p className="m-ev-label m-ev-label--countdown">{countdownLabel}</p>
      <Countdown target={target} units={units} />
      <div className="m-ev-div" />
      <p className="m-ev-label">{ev.addrLabel}</p>
      <p className="m-venue-name">{ev.venue}</p>
      {ev.addressLines.map((l, i) => <p key={i} className="m-addr-line">{l}</p>)}
      <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="m-map-btn">
        📍 {ev.directions}
      </a>
      <div className="m-qr-wrap">
        <QRCodeSVG value={mapsUrl} size={140} bgColor="#f0ebe0" fgColor="#0e2015" level="H" includeMargin />
        <p className="m-qr-label">{ev.scanLabel}</p>
      </div>
    </div>
  )
}

function MobileView({ C }) {
  const NIKAH_MAPS  = "https://www.google.com/maps/dir//Kader+Deluxe+Mahal,+9R7P%2B2QF,+Unnamed+Road,+Chalai+Bazar,+Ramanathapuram,+Tamil+Nadu+623504/@12.7183412,77.8252918,15z"
  const WALIMA_MAPS = "https://www.google.com/maps/dir/?api=1&destination=Pichamuthu+Nayakkar+Kalyana+Mandapam,+Petthanayakkanpalayam,+Attur,+Tamil+Nadu+636109"

  return (
    <div className="m-page">

      {/* HERO */}
      <div className="m-hero">
        <p className="m-bismillah">بِسْمِ اللهِ الرَّحْمنِ الرَّحِيْمِ</p>
        <p className="m-together">{C.hero.together}</p>
        <div className="m-names">
          <span className="m-name">ARAFATH A</span>
          <div className="m-amp-row">
            <span className="m-amp-line" />
            <span className="m-amp">&amp;</span>
            <span className="m-amp-line" />
          </div>
          <span className="m-name">ASSHIFA S</span>
        </div>
        <Ornament icon="◆" />
        <p className="m-invite">
          {C.hero.invite.split('\n').map((l, i) => <span key={i}>{l}{i === 0 && <br />}</span>)}
        </p>
        <div className="m-dates">
          <div className="m-date-pill">
            <span className="m-date-tag">{C.hero.nikahTag}</span>
            <span className="m-date-val">25 October 2026</span>
          </div>
          <span className="m-dot">◆</span>
          <div className="m-date-pill">
            <span className="m-date-tag">{C.hero.walimaTag}</span>
            <span className="m-date-val">1 November 2026</span>
          </div>
        </div>
      </div>

      {/* COMBINED EVENTS — date + venue + map + QR */}
      <div className="m-sec">
        <p className="m-eyebrow">{C.events.eyebrow}</p>
        <h2 className="m-sec-title">{C.events.title}</h2>
        <MobileCombinedCard type="nikah"  ev={C.events.nikah}  mapsUrl={NIKAH_MAPS}  dateLabel={C.events.dateLabel} timeLabel={C.events.timeLabel} target="2026-10-25T10:00:00" units={C.countdown.units} countdownLabel={C.events.countdownLabel} />
        <MobileCombinedCard type="walima" ev={C.events.walima} mapsUrl={WALIMA_MAPS} dateLabel={C.events.dateLabel} timeLabel={C.events.timeLabel} target="2026-11-01T13:00:00" units={C.countdown.units} countdownLabel={C.events.countdownLabel} />
      </div>

      {/* CLOSING */}
      <div className="m-sec m-close-sec">
        <div className="m-monogram">
          <div className="close__circle"><span className="close__initials">A &amp; A</span></div>
        </div>
        <Ornament icon="◆" />
        <p className="m-close-await">{C.closing.await}</p>
        <p className="m-close-love">{C.closing.love}</p>
      </div>
    </div>
  )
}

// ═════════════════════════════════════════════════════════════
//  DESKTOP — Three.js + full animations
// ═════════════════════════════════════════════════════════════
const PETALS = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  left:     `${((i / 30) * 100 + (Math.random() * 6 - 3)).toFixed(1)}%`,
  delay:    `${(Math.random() * 14).toFixed(2)}s`,
  duration: `${(9 + Math.random() * 9).toFixed(2)}s`,
  w:        Math.floor(6 + Math.random() * 7),
  h:        Math.floor(9 + Math.random() * 8),
  drift:    `${(Math.random() * 90 - 45).toFixed(0)}px`,
}))

function FallingPetals() {
  return (
    <div className="petals" aria-hidden="true">
      {PETALS.map(p => (
        <span key={p.id} className="petal" style={{
          left: p.left, width: p.w, height: p.h,
          animationDelay: p.delay, animationDuration: p.duration,
          '--drift': p.drift,
        }} />
      ))}
    </div>
  )
}

function GoldenTorus({ radius, tube, rx, ry, rz }) {
  const ref = useRef()
  useFrame((_, dt) => {
    ref.current.rotation.x += dt * rx
    ref.current.rotation.y += dt * ry
    ref.current.rotation.z += dt * rz
  })
  return (
    <mesh ref={ref}>
      <torusGeometry args={[radius, tube, 16, 120]} />
      <meshStandardMaterial color="#d4af37" metalness={0.98} roughness={0.02} emissive="#7a5800" emissiveIntensity={0.6} />
    </mesh>
  )
}

function GoldenKnot() {
  const ref = useRef()
  useFrame((state, dt) => {
    ref.current.rotation.x += dt * 0.09
    ref.current.rotation.y += dt * 0.12
    ref.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.04)
  })
  return (
    <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.5}>
      <mesh ref={ref}>
        <torusKnotGeometry args={[1.0, 0.16, 200, 32, 2, 3]} />
        <meshStandardMaterial color="#c9a84c" metalness={1} roughness={0} emissive="#6b4e08" emissiveIntensity={0.7} />
      </mesh>
    </Float>
  )
}

function HeroScene() {
  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[5, 5, 5]}   intensity={3}   color="#f0c040" />
      <pointLight position={[-5, -5, 4]} intensity={1.2} color="#40916c" />
      <pointLight position={[0, 0, 6]}   intensity={0.8} color="#fffbf0" />
      <Stars radius={90} depth={60} count={5000} factor={3.5} saturation={0} fade speed={0.5} />
      <Sparkles count={200} scale={[14, 14, 14]} size={1.3} speed={0.3} color="#d4af37" opacity={0.8} />
      <GoldenKnot />
      <GoldenTorus radius={2.9} tube={0.022} rx={0.07}  ry={0.16}  rz={0.04} />
      <GoldenTorus radius={3.7} tube={0.014} rx={-0.04} ry={0.11}  rz={0.08} />
      <GoldenTorus radius={2.1} tube={0.034} rx={0.15}  ry={-0.07} rz={0.11} />
      <GoldenTorus radius={4.4} tube={0.007} rx={0.02}  ry={0.07}  rz={-0.05} />
    </>
  )
}

function SectionHeader({ eyebrow, number, title }) {
  return (
    <header className="sec-hdr">
      <p className="sec-hdr__eye">{eyebrow}</p>
      <div className="sec-hdr__row">
        <span className="sec-hdr__line sec-hdr__line--left" />
        <span className="sec-hdr__num">{number}</span>
        <h2 className="sec-hdr__title">{title}</h2>
        <span className="sec-hdr__line sec-hdr__line--right" />
      </div>
    </header>
  )
}

function ScrollReveal({ children, className = '', depth = 22 }) {
  const sectionRef = useRef(null)
  const [inViewRef, inView] = useInView({ triggerOnce: true, threshold: 0.07 })
  const setRef = useCallback(node => { sectionRef.current = node; inViewRef(node) }, [inViewRef])
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'center center'] })
  const rawRotateX = useTransform(scrollYProgress, [0, 1], [depth, 0])
  const rawY       = useTransform(scrollYProgress, [0, 1], [40, 0])
  const rawScale   = useTransform(scrollYProgress, [0, 1], [0.95, 1])
  const rotateX = useSpring(rawRotateX, { stiffness: 60, damping: 18 })
  const y       = useSpring(rawY,       { stiffness: 60, damping: 18 })
  const scale   = useSpring(rawScale,   { stiffness: 60, damping: 18 })
  return (
    <div className="perspective-wrap">
      <motion.section
        ref={setRef}
        className={`page-sec ${className}`}
        style={{ rotateX, y, scale }}
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.8 }}
      >
        {children}
      </motion.section>
    </div>
  )
}

function TiltCard({ children, className = '' }) {
  const cardRef = useRef(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const onMouseMove = useCallback(e => {
    const el = cardRef.current; if (!el) return
    const { left, top, width, height } = el.getBoundingClientRect()
    setTilt({ x: ((e.clientY - top) / height - 0.5) * -14, y: ((e.clientX - left) / width - 0.5) * 14 })
  }, [])
  const onMouseLeave = useCallback(() => setTilt({ x: 0, y: 0 }), [])
  return (
    <motion.div ref={cardRef} className={className}
      onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}
      animate={{ rotateX: tilt.x, rotateY: tilt.y }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      style={{ transformStyle: 'preserve-3d' }}>
      {children}
    </motion.div>
  )
}

function DesktopCountdown({ target, units }) {
  const calc = useCallback(() => {
    const d = +new Date(target) - Date.now()
    if (d <= 0) return { d: 0, h: 0, m: 0, s: 0 }
    return {
      d: Math.floor(d / 864e5),
      h: Math.floor((d % 864e5) / 36e5),
      m: Math.floor((d % 36e5) / 6e4),
      s: Math.floor((d % 6e4) / 1e3),
    }
  }, [target])
  const [t, setT] = useState(calc)
  useEffect(() => { const id = setInterval(() => setT(calc()), 1000); return () => clearInterval(id) }, [calc])
  return (
    <div className="cdwn">
      {[[units[0], t.d], [units[1], t.h], [units[2], t.m], [units[3], t.s]].map(([u, v]) => (
        <div key={u} className="cdwn__cell">
          <AnimatePresence mode="popLayout">
            <motion.span key={v} className="cdwn__num"
              initial={{ y: -22, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 22, opacity: 0 }}
              transition={{ duration: 0.28 }}>
              {String(v).padStart(2, '0')}
            </motion.span>
          </AnimatePresence>
          <span className="cdwn__unit">{u}</span>
        </div>
      ))}
    </div>
  )
}

// Combined event+venue card for desktop
function DesktopCombinedCard({ type, ev, mapsUrl, delay, flipDir = 1, dateLabel, timeLabel, target, units, countdownLabel }) {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.06 })
  return (
    <div ref={ref} style={{ perspective: 1000 }}>
      <motion.div className={`vc vc--combined vc--${type}`}
        initial={{ opacity: 0, rotateY: 20 * flipDir, x: 60 * flipDir }}
        animate={inView ? { opacity: 1, rotateY: 0, x: 0 } : {}}
        transition={{ duration: 1.0, delay, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformStyle: 'preserve-3d' }}>
        <span className="ev-card__corner ev-card__corner--tl" />
        <span className="ev-card__corner ev-card__corner--tr" />
        <span className="ev-card__corner ev-card__corner--bl" />
        <span className="ev-card__corner ev-card__corner--br" />
        <div className="vc__left">
          <div className="vc__event-badge">{type === 'nikah' ? '☽' : '✦'}</div>
          <h3 className="vc__event-title">{ev.title}</h3>
          <Ornament icon={type === 'nikah' ? '☽' : '✦'} />
          <div className="vc__dt-row">
            <div className="vc__dt-cell">
              <span className="vc__dt-label">{dateLabel}</span>
              <span className="vc__dt-val">{ev.date}</span>
              <span className="vc__dt-sub">{ev.day}</span>
            </div>
            <div className="vc__dt-divider" />
            <div className="vc__dt-cell">
              <span className="vc__dt-label">{timeLabel}</span>
              <span className="vc__dt-val">{ev.time}</span>
            </div>
          </div>
          <div className="vc__venue-sep" />
          <p className="vc__cdwn-label">{countdownLabel}</p>
          <DesktopCountdown target={target} units={units} />
          <div className="vc__venue-sep" />
          <p className="vc__addr-label">{ev.addrLabel}</p>
          <p className="vc__venue">{ev.venue}</p>
          {ev.addressLines.map((line, i) => <p key={i} className="vc__addr-line">{line}</p>)}
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="vc__btn">
            <span>📍</span> {ev.directions}
          </a>
        </div>
        <div className="vc__right">
          <TiltCard className="vc__qr-wrap">
            <QRCodeSVG value={mapsUrl} size={160} bgColor="#f0ebe0" fgColor="#0e2015" level="H" includeMargin />
            <p className="vc__qr-label">{ev.scanLabel}</p>
          </TiltCard>
        </div>
      </motion.div>
    </div>
  )
}

function DesktopView({ C }) {
  const heroRef = useRef(null)
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroTextY   = useTransform(heroScroll, [0, 1], ['0%', '40%'])
  const heroCanvasY = useTransform(heroScroll, [0, 1], ['0%', '25%'])
  const heroOpacity = useTransform(heroScroll, [0, 0.7], [1, 0])

  const NIKAH_MAPS  = "https://www.google.com/maps/dir//Kader+Deluxe+Mahal,+9R7P%2B2QF,+Unnamed+Road,+Chalai+Bazar,+Ramanathapuram,+Tamil+Nadu+623504/@12.7183412,77.8252918,15z"
  const WALIMA_MAPS = "https://www.google.com/maps/dir/?api=1&destination=Pichamuthu+Nayakkar+Kalyana+Mandapam,+Petthanayakkanpalayam,+Attur,+Tamil+Nadu+636109"

  return (
    <motion.div className="app" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.1 }}>
      <FallingPetals />

      <section ref={heroRef} className="hero">
        <motion.div className="hero__canvas" style={{ y: heroCanvasY, willChange: 'transform' }}>
          <Canvas camera={{ position: [0, 0, 8], fov: 52 }} dpr={[1, 2]}>
            <Suspense fallback={null}><HeroScene /></Suspense>
          </Canvas>
        </motion.div>
        <div className="hero__veil" />
        <motion.div className="hero__body" style={{ y: heroTextY, opacity: heroOpacity }}>
          <motion.p className="hero__bismillah"
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 1 }}>
            بِسْمِ اللهِ الرَّحْمنِ الرَّحِيْمِ
          </motion.p>
          <motion.p className="hero__together"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65, duration: 0.9 }}>
            {C.hero.together}
          </motion.p>
          <motion.div className="hero__names"
            initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.95, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}>
            <span className="hero__name">ARAFATH A</span>
            <div className="hero__amp-row">
              <span className="hero__amp-line" />
              <span className="hero__amp">&amp;</span>
              <span className="hero__amp-line" />
            </div>
            <span className="hero__name">ASSHIFA S</span>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.35, duration: 0.8 }}>
            <Ornament icon="◆" />
          </motion.div>
          <motion.p className="hero__invite"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.55, duration: 0.9 }}>
            {C.hero.invite.split('\n').map((line, i) => <span key={i}>{line}{i === 0 && <br />}</span>)}
          </motion.p>
          <motion.div className="hero__date-row"
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.8, duration: 0.9 }}>
            <div className="hero__date-pill">
              <span className="hero__date-tag">{C.hero.nikahTag}</span>
              <span className="hero__date-val">25 October 2026</span>
            </div>
            <span className="hero__dot">◆</span>
            <div className="hero__date-pill">
              <span className="hero__date-tag">{C.hero.walimaTag}</span>
              <span className="hero__date-val">1 November 2026</span>
            </div>
          </motion.div>
          <motion.div className="hero__scroll"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5, duration: 0.9 }}>
            <span className="hero__scroll-line" />
            <span>{C.hero.scroll}</span>
          </motion.div>
        </motion.div>
      </section>

      {/* SECTION 1: Combined events (date + venue + map + QR) */}
      <ScrollReveal className="venue-sec" depth={20}>
        <SectionHeader eyebrow={C.events.eyebrow} number={C.events.number} title={C.events.title} />
        <DesktopCombinedCard type="nikah"  ev={C.events.nikah}  mapsUrl={NIKAH_MAPS}  delay={0}    flipDir={-1} dateLabel={C.events.dateLabel} timeLabel={C.events.timeLabel} target="2026-10-25T10:00:00" units={C.countdown.units} countdownLabel={C.events.countdownLabel} />
        <DesktopCombinedCard type="walima" ev={C.events.walima} mapsUrl={WALIMA_MAPS} delay={0.15} flipDir={1}  dateLabel={C.events.dateLabel} timeLabel={C.events.timeLabel} target="2026-11-01T13:00:00" units={C.countdown.units} countdownLabel={C.events.countdownLabel} />
      </ScrollReveal>

      {/* CLOSING */}
      <ScrollReveal className="close-sec" depth={12}>
        <div className="close__monogram">
          <div className="close__circle"><span className="close__initials">A &amp; A</span></div>
        </div>
        <Ornament icon="◆" />
        <p className="close__await">{C.closing.await}</p>
        <p className="close__love">{C.closing.love}</p>
      </ScrollReveal>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────
//  APP ROOT
// ─────────────────────────────────────────────────────────────
export default function App() {
  const [loading, setLoading] = useState(true)
  const [lang, setLang]       = useState('en')
  const isMobile = useIsMobile()

  const handleEnter = useCallback((selectedLang) => {
    setLang(selectedLang)
    setLoading(false)
  }, [])

  const C = CONTENT[lang]

  return (
    <>
      <AnimatePresence mode="wait">
        {loading && <Preloader key="loader" onComplete={handleEnter} />}
      </AnimatePresence>

      {!loading && (
        isMobile
          ? <MobileView C={C} />
          : <DesktopView C={C} />
      )}
    </>
  )
}
