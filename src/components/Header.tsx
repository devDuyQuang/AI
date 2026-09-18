import type { MouseEvent } from 'react';
import { ArrowUpRight, RotateCcw, Sparkles } from 'lucide-react';
function scrollToSection(event: MouseEvent<HTMLAnchorElement>) {
 if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
 event.preventDefault();
 const id = event.currentTarget.hash.slice(1);
 const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth';
 if (id) document.getElementById(id)?.scrollIntoView({ behavior, block: 'start' });
 else window.scrollTo({ top: 0, behavior });
 if (window.location.hash) history.replaceState(history.state, '', window.location.pathname + window.location.search);
}
export function Brand() { return <a className="brand" href="#" onClick={scrollToSection} aria-label="KhaiFrost home"><span className="brand-mark"><Sparkles size={23}/></span><span>KHAIFROST<small>AI CORE</small></span></a>; }
export function Header({ onReset }: { onReset: () => void }) { return <header className="header"><Brand/><nav aria-label="Main navigation"><a className="active" href="#demo" onClick={scrollToSection}>AI Receptionist</a><a href="#how-it-works" onClick={scrollToSection}>How it works</a><a href="#capabilities" onClick={scrollToSection}>Capabilities <ArrowUpRight size={12}/></a></nav><div className="header-actions"><button className="reset" onClick={onReset}><RotateCcw size={13}/> Reset Session</button></div></header>; }
