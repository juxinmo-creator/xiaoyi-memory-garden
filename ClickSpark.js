/* Buildless equivalent of <ClickSpark sparkColor="#fff" shape="line"
   sparkCount={8} sparkSize={14} sparkRadius={30} duration={500}>. */
class ClickSpark {
  constructor(root, {sparkColor='#fff',shape='line',sparkCount=8,sparkSize=14,sparkRadius=30,duration=500}={}) {
    this.root=root;
    this.options={sparkColor,shape,sparkCount,sparkSize,sparkRadius,duration};
    this.active=[];
    this.frame=0;
    this.ns='http://www.w3.org/2000/svg';
    this.layer=document.createElementNS(this.ns,'svg');
    this.layer.classList.add('click-spark-layer');
    this.layer.setAttribute('aria-hidden','true');
    document.body.append(this.layer);
    this.onClick=e=>{
      if(e.button!==0 || document.hidden || matchMedia('(prefers-reduced-motion: reduce)').matches || document.body.classList.contains('reduced'))return;
      if(e.target.closest('button:disabled,[aria-disabled="true"]'))return;
      // A modal is in the top layer; attach feedback there so it stays visible.
      const host=e.target.closest('dialog[open]')||document.body;
      if(this.layer.parentElement!==host){this.clear();host.append(this.layer);}
      const box=this.layer.getBoundingClientRect();
      let x=e.clientX,y=e.clientY;
      if(e.detail===0){const r=e.target.getBoundingClientRect();x=r.x+r.width/2;y=r.y+r.height/2;}
      this.burst(x-box.left,y-box.top);
    };
    this.onHide=()=>{if(document.hidden)this.clear();};
    root.addEventListener('click',this.onClick,true);
    document.addEventListener('visibilitychange',this.onHide);
  }
  burst(x,y){
    const o=this.options,group=document.createElementNS(this.ns,'g');
    const rays=Array.from({length:o.sparkCount},(_,i)=>{
      const line=document.createElementNS(this.ns,'line');
      line.setAttribute('stroke',o.sparkColor);line.setAttribute('stroke-width','2');group.append(line);
      return {line,angle:2*Math.PI*i/o.sparkCount};
    });
    this.layer.append(group);this.active.push({x,y,rays,group,start:performance.now()});
    if(this.active.length>24)this.active.shift().group.remove();
    if(!this.frame)this.frame=requestAnimationFrame(t=>this.draw(t));
  }
  draw(now){
    const o=this.options;
    this.active=this.active.filter(s=>{
      const p=Math.min(1,(now-s.start)/o.duration);
      if(p>=1){s.group.remove();return false;}
      const ease=1-Math.pow(1-p,3),radius=o.sparkRadius*ease,length=o.sparkSize*(1-ease);
      s.group.setAttribute('opacity',String(1-p));
      for(const {line,angle} of s.rays){
        const dx=Math.cos(angle),dy=Math.sin(angle);
        line.setAttribute('x1',s.x+dx*radius);line.setAttribute('y1',s.y+dy*radius);
        line.setAttribute('x2',s.x+dx*(radius+length));line.setAttribute('y2',s.y+dy*(radius+length));
      }
      return true;
    });
    this.frame=this.active.length?requestAnimationFrame(t=>this.draw(t)):0;
  }
  clear(){cancelAnimationFrame(this.frame);this.frame=0;this.active.forEach(s=>s.group.remove());this.active=[];}
  destroy(){this.clear();this.root.removeEventListener('click',this.onClick,true);document.removeEventListener('visibilitychange',this.onHide);this.layer.remove();}
}
new ClickSpark(document,{sparkColor:'#fff',shape:'line',sparkCount:8,sparkSize:14,sparkRadius:30,duration:500});

