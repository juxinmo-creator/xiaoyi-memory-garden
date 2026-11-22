(function(root){
class Session{
 constructor(random=Math.random){this.random=random;this.restart();}
 restart(){this.dispose();this.id=(this.id||0)+1;this.deck=['A','A','B','B','C','C'].map((pair,id)=>({pair,id}));for(let i=5;i>0;i--){const j=Math.floor(this.random()*(i+1));[this.deck[i],this.deck[j]]=[this.deck[j],this.deck[i]];}this.open=[];this.matched=[];this.phase='playing';this.ready=false;}
 dispose(){clearTimeout(this.timer);this.id=(this.id||0)+1;this.ready=false;}
 choose(id,update,complete){const c=this.deck.find(c=>c.id===id);if(!this.ready||this.phase!=='playing'||!c||this.open.includes(id)||this.matched.includes(c.pair))return;this.open.push(id);if(this.open.length===1){update();return;}this.phase='comparing';update();const other=this.deck.find(c=>c.id===this.open[0]);if(other.pair===c.pair){this.matched.push(c.pair);this.open=[];this.phase=this.matched.length===3?'completed':'playing';update();if(this.phase==='completed')complete();}else{const token=this.id;this.timer=setTimeout(()=>{if(token!==this.id)return;this.open=[];this.phase='playing';update();},900);}}
}
if(typeof module!=='undefined'&&module.exports)module.exports=Session;else root.ForestSession=Session;
})(typeof window==='undefined'?globalThis:window);
