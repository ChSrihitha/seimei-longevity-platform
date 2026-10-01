import { motion } from 'framer-motion';
import { ArrowRight, Check, ChevronRight, Menu, MessageCircle, Play, Sparkles, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import './landing.css';

const reveal = { initial: { opacity: 0, y: 22 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.2 }, transition: { duration: 0.65 } };

function Logo({ light = false }: { light?: boolean }) {
  return <span className={`landing-logo-frame ${light ? 'landing-logo-frame--footer' : ''}`}>
    <img className="landing-logo" src={`${import.meta.env.BASE_URL}logo.jpeg`} alt="SEIMEI" />
  </span>;
}

function SignalMap() {
  return <div className="signal-map" aria-label="Wellbeing signal visualization">
    <div className="signal-map__head"><span>WELLBEING SIGNALS</span><span className="live-dot">Live pattern</span></div>
    <div className="signal-map__body">
      <div className="signal-map__labels"><span>Stress</span><span>Energy</span><span>Recovery</span></div>
      <svg viewBox="0 0 460 180" preserveAspectRatio="none" role="img">
        <defs><linearGradient id="signalFill" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#6f9a72" stopOpacity=".28"/><stop offset="1" stopColor="#6f9a72" stopOpacity="0"/></linearGradient></defs>
        {[38, 90, 142].map(y => <line key={y} x1="0" x2="460" y1={y} y2={y} stroke="#dbe2d7" strokeDasharray="3 5" />)}
        <motion.path d="M0 120 C26 105 38 113 61 94 S98 62 125 91 S165 131 189 112 S233 55 263 72 S303 107 330 82 S368 37 395 61 S431 103 460 52 L460 180 L0 180Z" fill="url(#signalFill)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.3 }} />
        <motion.path d="M0 120 C26 105 38 113 61 94 S98 62 125 91 S165 131 189 112 S233 55 263 72 S303 107 330 82 S368 37 395 61 S431 103 460 52" fill="none" stroke="#245139" strokeWidth="3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.8, ease: 'easeOut' }} />
        <circle cx="395" cy="61" r="5" fill="#c1843c" stroke="#fff" strokeWidth="3"/>
      </svg>
      <div className="signal-map__axis"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Today</span></div>
    </div>
    <div className="signal-map__insight"><span className="mini-pulse"/>A shift in workload patterns is emerging <ChevronRight size={15}/></div>
  </div>
}

function ProductPanel() {
  return <div className="product-panel">
    <div className="product-panel__bar"><span className="product-mark">S</span><span>Today</span><span className="product-avatar">AS</span></div>
    <div className="product-panel__content">
      <div><p className="eyebrow">YOUR WELLBEING</p><h3>Good morning, Amara.</h3><p className="muted">Here is your wellbeing snapshot.</p></div>
      <div className="score-row"><div className="score-ring"><b>72</b><small>/100</small></div><div><p className="muted">Your score is stable</p><span className="trend-good">↑ 4 points this week</span></div></div>
      <div className="product-grid"><div className="metric"><small>STRESS</small><b>Elevated</b><span className="metric-bar amber"><i/></span></div><div className="metric"><small>RECOVERY</small><b>On track</b><span className="metric-bar green"><i/></span></div><div className="metric"><small>ENERGY</small><b>Balanced</b><span className="metric-bar green"><i/></span></div></div>
      <div className="next-action"><span className="leaf-symbol">✦</span><div><small>NEXT STEP</small><b>Take a 15-minute reset</b></div><ArrowRight size={16}/></div>
    </div>
  </div>
}

export function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  return <main className="landing">
    <header className="landing-nav"><Link to="/" className="brand"><Logo /></Link><nav className={menuOpen ? 'open' : ''}>{['Platform','Solutions','How It Works','Insights','Resources'].map(item => <a key={item} href={`#${item.toLowerCase().replaceAll(' ', '-')}`} onClick={() => setMenuOpen(false)}>{item}</a>)}<Link className="mobile-signin" to="/sign-in">Sign In</Link></nav><div className="nav-actions"><Link className="signin" to="/sign-in">Sign In</Link><a className="nav-cta" href="#get-started">Get Started <ArrowRight size={15}/></a></div><button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation">{menuOpen ? <X/> : <Menu/>}</button></header>

    <section className="hero-section" id="platform"><div className="hero-copy"><motion.p className="kicker" initial={{opacity:0}} animate={{opacity:1}}>Corporate wellbeing, made more human</motion.p><motion.h1 initial={{opacity:0,y:18}} animate={{opacity:1,y:0}} transition={{duration:.7}}>Wellbeing,<br/><em>understood</em> differently.</motion.h1><motion.p className="hero-description" initial={{opacity:0,y:18}} animate={{opacity:1,y:0}} transition={{delay:.15,duration:.7}}>SEIMEI helps organizations understand the signals behind employee wellbeing—and guide people toward meaningful, personalized action.</motion.p><motion.div className="hero-actions" initial={{opacity:0,y:18}} animate={{opacity:1,y:0}} transition={{delay:.25,duration:.7}}><a className="button button--dark" href="#intelligence">Explore SEIMEI <ArrowRight size={17}/></a><a className="text-link" href="#how-it-works"><Play size={13} fill="currentColor"/> See how it works</a></motion.div></div><motion.div className="hero-visual" initial={{opacity:0,scale:.97}} animate={{opacity:1,scale:1}} transition={{duration:.9,delay:.1}}><div className="hero-orbit orbit-a"/><div className="hero-orbit orbit-b"/><div className="hero-caption top">SIGNAL <span>01</span></div><div className="hero-caption bottom">PERSONALIZED ACTION <span>04</span></div><div className="hero-visual__center"><div className="hero-center__top"><span>SEIMEI intelligence</span><span>Today, 09:42</span></div><div className="hero-center__body"><div className="center-score"><span>Wellbeing</span><b>72</b><small>stable</small></div><div className="center-lines"><i/><i/><i/></div></div><div className="hero-center__footer"><span>Signals connected</span><Check size={15}/></div></div><div className="floating-card stress-card"><span className="card-label">STRESS</span><b>Elevated</b><div><i/><i/><i/><i/></div></div><div className="floating-card recovery-card"><span className="card-label">RECOVERY</span><b>On track</b><span className="small-good">↑ Improving</span></div></motion.div></section>

    <section className="statement-section"><motion.div {...reveal}><p className="section-label">FROM FRAGMENTED TO CONNECTED</p><h2>Wellbeing isn't<br/>a single number.</h2></motion.div><motion.div className="statement-copy" {...reveal}><p>Surveys, utilization and absence data all tell part of the story. SEIMEI brings the human signals together—so the right conversation can happen at the right moment.</p><a className="text-link" href="#intelligence">See the platform <ArrowRight size={16}/></a></motion.div><div className="fragment-line"><span>Check-in</span><i/><span>Energy</span><i/><span>Recovery</span><i/><span>Context</span><strong>ONE CLEARER PICTURE</strong></div></section>

    <section className="intelligence-section" id="intelligence"><motion.div className="section-intro intro-light" {...reveal}><p className="section-label">SEIMEI INTELLIGENCE</p><h2>Clarity that moves<br/>with your people.</h2><p>One connected system that helps employees understand their wellbeing, while giving organizations a more thoughtful view of what needs attention.</p></motion.div><div className="intelligence-flow">{[['01','Daily Check-In','A moment of reflection'],['02','Stress Mapping','Patterns, not assumptions'],['03','Insight','Context that matters'],['04','Wellness Companion','Guidance for the next step'],['05','Wellness Plan','Progress that lasts']].map(([number,title,copy], i) => <motion.div className="flow-step" key={title} {...reveal} transition={{duration:.5,delay:i*.08}}><span>{number}</span><div className="flow-icon">{i === 3 ? <MessageCircle size={18}/> : i === 4 ? <Check size={18}/> : <Sparkles size={18}/>}</div><b>{title}</b><small>{copy}</small>{i < 4 && <i className="flow-connector"/>}</motion.div>)}</div></section>

    <section className="product-section" id="solutions"><motion.div className="product-copy" {...reveal}><p className="section-label">A MORE USEFUL DAILY EXPERIENCE</p><h2>Make the next step<br/>feel possible.</h2><p>SEIMEI turns everyday signals into a clear, personal view of stress, energy, recovery and progress. No judgment. No noise. Just an invitation to take care.</p><ul><li><Check/> A wellbeing score with real context</li><li><Check/> Contributors you can understand</li><li><Check/> Recommendations that fit the day</li></ul></motion.div><motion.div {...reveal}><ProductPanel /></motion.div></section>

    <section className="patterns-section" id="insights"><div className="patterns-head"><motion.div {...reveal}><p className="section-label">UNDERSTAND THE PATTERN</p><h2>See what a moment<br/>can't tell you.</h2></motion.div><motion.p {...reveal}>A single check-in is useful. A connected timeline gives it meaning—revealing changes in stress, recovery, energy and overall wellbeing over time.</motion.p></div><motion.div {...reveal}><SignalMap /></motion.div><div className="legend"><span><i className="legend-stress"/>Stress</span><span><i className="legend-recovery"/>Recovery</span><span><i className="legend-energy"/>Energy</span><span><i className="legend-wellbeing"/>Wellbeing</span></div></section>

    <section className="action-section" id="how-it-works"><motion.div className="action-header" {...reveal}><p className="section-label">PERSONALIZED ACTION</p><h2>From insight<br/>to a better next move.</h2></motion.div><div className="action-journey"><div className="journey-line"/>{[['Your stress is elevated.','A signal, noticed early.'],['Workload is a primary contributor.','The context, made clearer.'],['Try a 15-minute reset.','A small action, designed for now.'],['Add to your Wellness Plan.','Progress, made sustainable.']].map(([title,copy], i) => <motion.article className="journey-card" {...reveal} transition={{duration:.5,delay:i*.1}} key={title}><span>0{i+1}</span><div><h3>{title}</h3><p>{copy}</p></div>{i === 3 && <Check className="journey-check"/>}</motion.article>)}</div></section>

    <section className="companion-section"><motion.div className="companion-copy" {...reveal}><p className="section-label">THE WELLNESS COMPANION</p><h2>AI-assisted.<br/><em>Human-led.</em></h2><p>SEIMEI uses intelligent guidance to help people find a meaningful next step. It complements—not replaces—the care, judgment and support of human wellbeing teams.</p><a href="#get-started" className="text-link">Meet the companion <ArrowRight size={16}/></a></motion.div><motion.div className="conversation" {...reveal}><div className="conversation-top"><span><span className="companion-dot">✦</span> SEIMEI Companion</span><small>Available now</small></div><div className="bubble companion-bubble">You've had a demanding few days. Would a short reset help you create some space?</div><div className="bubble user-bubble">Yes, I have 15 minutes.</div><div className="bubble companion-bubble">I've added a guided reset to your plan. It's there when you're ready.</div><div className="conversation-choice">Start a 15-minute reset <ArrowRight size={15}/></div></motion.div></section>

    <section className="outcomes-section" id="resources"><motion.div {...reveal}><p className="section-label">WHAT BECOMES POSSIBLE</p><h2>Wellbeing that stays<br/>in motion.</h2></motion.div><div className="outcome-list">{[['01','Earlier signals','Notice changes before they become a crisis.'],['02','Better understanding','Bring context to wellbeing conversations.'],['03','Personalized action','Help each person choose a practical next step.'],['04','Sustained wellbeing','Make progress visible, one day at a time.']].map(([n,t,c]) => <motion.article {...reveal} key={n}><span>{n}</span><h3>{t}</h3><p>{c}</p></motion.article>)}</div></section>

    <section className="closing-section" id="get-started"><motion.div {...reveal}><p className="section-label">SEIMEI FOR ENTERPRISE</p><h2>Better wellbeing starts<br/>with understanding.</h2><p>Build a more responsive, more human wellbeing culture.</p><a href="mailto:hello@seimei.com" className="button button--light">Explore SEIMEI <ArrowRight size={17}/></a></motion.div><div className="closing-ring"><span>Human wellbeing</span><span>Intelligence</span><span>Meaningful action</span></div></section>

    <footer className="landing-footer"><div className="footer-brand"><Logo light/><p>Wellbeing, understood differently.</p></div><div className="footer-links">{[['Platform','Daily Check-In','Insights','Wellness Plan'],['Solutions','For employees','For HR teams','For leaders'],['Resources','Perspective','Guides','Contact'],['Company','About SEIMEI','Privacy','Terms']].map(([title,...links]) => <div key={title}><b>{title}</b>{links.map(l => <a href="#" key={l}>{l}</a>)}</div>)}</div><div className="footer-base"><span>© 2026 SEIMEI. All rights reserved.</span><span>Designed for human potential.</span></div></footer>
  </main>;
}
