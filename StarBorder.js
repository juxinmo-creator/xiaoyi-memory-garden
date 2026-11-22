/* Buildless StarBorder adapter. Keeps native buttons and their existing actions. */
(()=>{
'use strict';
const options={color:'#ffffff',trailColor:'#ffffff',duration:4,direction:'clockwise',stars:1,trailLength:.3,thickness:1,radius:12,glow:.6,hover:'lap',sparkle:false,clickPulse:true,theme:'dark'};
const selector='button:not(.match-card):not(.floating-photo):not(.experience-card):not(.outfit-item):not(.swatch):not(.shell-button):not(#video-hotspot),a.back';
const ns='http://www.w3.org/2000/svg',entries=new Map();let pending=0;
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches||document.body.classList.contains('reduced');
const element=(tag,attrs)=>{const el=document.createElementNS(ns,tag);for(const [k,v]of Object.entries(attrs))el.setAttribute(k,v);return el;};
function resize(button,svg){const w=button.clientWidth,h=button.clientHeight;if(!w||!h)return;svg.setAttribute('viewBox',`0 0 ${w} ${h}`);svg.querySelectorAll('rect').forEach(rect=>{rect.setAttribute('x','1');rect.setAttribute('y','1');rect.setAttribute('width',Math.max(0,w-2));rect.setAttribute('height',Math.max(0,h-2));rect.setAttribute('rx',Math.min(options.radius-1,(h-2)/2));});}
const sizes=new ResizeObserver(records=>{for(const r of records){const entry=entries.get(r.target);if(entry)resize(r.target,entry.svg);}});
function attach(button){let entry=entries.get(button);if(entry&&button.contains(entry.svg))return;if(entry)detach(button);
 const svg=element('svg',{'class':'star-border-fx','aria-hidden':'true','focusable':'false','preserveAspectRatio':'none'});
 const base=element('rect',{'class':'star-border-base','fill':'none','stroke':options.trailColor,'stroke-width':options.thickness});svg.append(base);
 // A single bright head with a continuous fading 30% trail along the real outline.
 for(let i=19;i>=0;i--){const rect=element('rect',{'class':'star-border-trail','fill':'none','stroke':options.trailColor,'stroke-width':options.thickness,'pathLength':100,'stroke-dasharray':'1.6 98.4','stroke-linecap':'round'});rect.style.setProperty('--star-offset',String(i*options.trailLength*100/20));rect.style.opacity=String((1-i/20)*.75);svg.append(rect);}
 const head=element('rect',{'class':'star-border-trail star-border-head','fill':'none','stroke':options.color,'stroke-width':options.thickness,'pathLength':100,'stroke-dasharray':'.7 99.3','stroke-linecap':'round'});head.style.setProperty('--star-offset','0');svg.append(head);
 const pulse=element('rect',{'class':'star-border-pulse','fill':'none','stroke':options.color,'stroke-width':options.thickness});svg.append(pulse);
 button.classList.add('star-border');if(getComputedStyle(button).position==='static')button.classList.add('star-border-relative');button.dataset.starTheme=options.theme;
 button.style.setProperty('--star-duration',options.duration+'s');button.style.setProperty('--star-glow',options.glow);button.style.setProperty('--star-radius',options.radius+'px');button.append(svg);
 const abort=new AbortController();entry={svg,abort,timer:0};entries.set(button,entry);sizes.observe(button);resize(button,svg);
 const lap=()=>{if(button.disabled||button.getAttribute('aria-disabled')==='true'||reduced()||svg.classList.contains('is-lapping'))return;svg.classList.add('is-lapping');clearTimeout(entry.timer);entry.timer=setTimeout(()=>svg.classList.remove('is-lapping'),options.duration*1000);};
 button.addEventListener('pointerenter',lap,{signal:abort.signal});button.addEventListener('focus',lap,{signal:abort.signal});
 button.addEventListener('click',()=>{if(button.disabled||reduced())return;lap();if(options.clickPulse){pulse.getAnimations().forEach(a=>a.cancel());pulse.animate([{opacity:0,strokeWidth:1},{opacity:1,strokeWidth:2,offset:.18},{opacity:0,strokeWidth:1}],{duration:500,easing:'ease-out'});}},{capture:true,signal:abort.signal});
}
function detach(button){const e=entries.get(button);if(!e)return;e.abort.abort();clearTimeout(e.timer);sizes.unobserve(button);e.svg.remove();entries.delete(button);}
function scan(){pending=0;for(const button of entries.keys())if(!button.isConnected||!button.matches(selector))detach(button);document.querySelectorAll(selector).forEach(attach);}
function schedule(records){if(pending)return;const relevant=records.some(r=>r.target.matches?.(selector)||[...r.addedNodes,...r.removedNodes].some(n=>n.nodeType===1&&(n.matches?.(selector)||n.querySelector?.(selector))));if(relevant)pending=requestAnimationFrame(scan);}
new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});scan();
})();
