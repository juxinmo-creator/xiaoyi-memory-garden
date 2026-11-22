(function(root){
'use strict';
const CONFIG=Object.freeze({durationMs:60000,target:6,shellChance:.85,spawnMin:.8,spawnMax:1.2,width:1000,height:560,playerMin:65,playerMax:935,playerSpeed:640,catchY:456,catchWidth:100});
function migrate(old={}){
 const ids=old.collectedMemoryIds||(Array.isArray(old.memories)?old.memories.filter(n=>Number.isInteger(n)&&n>=0&&n<6):[]);
 const legacyComplete=Array.isArray(ids)&&new Set(ids).size>=6;
 return {...old,schemaVersion:2,contentVersion:'shell-catch-v1',bestScore:Number.isInteger(old.bestScore)?old.bestScore:null,lastScore:Number.isInteger(old.lastScore)?old.lastScore:null,memoryUnlocked:!!(old.memoryUnlocked||legacyComplete||old.cardClaimed||old.memoryCardClaimed),memoryCardClaimed:!!(old.memoryCardClaimed||old.cardClaimed)};
}
function resultRecord(old,r){if(old.lastSessionId===r.sessionId)return old;return {...old,lastSessionId:r.sessionId,lastScore:r.score,bestScore:old.bestScore===null||old.bestScore===undefined?r.score:Math.max(old.bestScore,r.score),memoryUnlocked:!!old.memoryUnlocked||r.score>=(r.target??CONFIG.target)};}
class Session{
 constructor(options={}){this.config={...CONFIG,...options.config};this.random=options.random||Math.random;this.sessionId=options.sessionId||((typeof crypto!=='undefined'&&crypto.randomUUID)?crypto.randomUUID():Date.now()+'-'+Math.random());this.status='ready';this.remainingMs=this.config.durationMs;this.playerX=500;this.items=[];this.score=0;this.shellCount=0;this.seaweedCount=0;this.elapsed=0;this.nextSpawn=300;this.serial=0;this.feedback=[];this.result=null;}
 start(){if(this.status==='ready')this.status='running';}
 pause(){if(this.status==='running')this.status='paused';}
 resume(){if(this.status==='paused')this.status='running';}
 moveTo(x){if(this.status==='running'&&Number.isFinite(x))this.playerX=Math.max(this.config.playerMin,Math.min(this.config.playerMax,x));}
 spawn(){const c=this.config,first=this.serial<3;this.items.push({id:++this.serial,type:first||this.random()<c.shellChance?'shell':'seaweed',x:first?this.playerX:65+this.random()*870,y:55,vy:(c.catchY-55)/(3+this.random()*2),width:this.config.itemWidth||42,height:38,consumed:false});this.nextSpawn+=(c.spawnMin+this.random()*(c.spawnMax-c.spawnMin))*1000;}
 hit(item){if(this.status!=='running'||item.consumed||this.remainingMs<=0)return false;item.consumed=true;if(item.type==='shell')this.shellCount++;else this.seaweedCount++;this.score=this.shellCount-2*this.seaweedCount;this.feedback.push({id:item.id,x:this.playerX,at:this.elapsed,value:item.type==='shell'?1:-2});return true;}
 step(ms,direction=0){if(this.status!=='running'||!Number.isFinite(ms)||ms<=0)return;
 let left=Math.min(ms,this.remainingMs);
 while(left>0&&this.status==='running'){
  const dt=Math.min(16,left),sec=dt/1000;left-=dt;
  const oldX=this.playerX;this.moveTo(this.playerX+Math.sign(direction)*this.config.playerSpeed*sec);
  this.elapsed+=dt;
  while(this.elapsed>=this.nextSpawn)this.spawn();
  for(const item of this.items){const prev=item.y;item.y+=item.vy*sec;
   const line=this.config.catchY,oldBottom=prev+item.height/2,newBottom=item.y+item.height/2;
   if(oldBottom<=line&&newBottom>=line){const ratio=(line-oldBottom)/(newBottom-oldBottom),at=oldX+(this.playerX-oldX)*ratio;if(ratio*dt<this.remainingMs&&Math.abs(item.x-at)<(this.config.catchWidth+item.width)/2)this.hit(item);}
  }
  this.items=this.items.filter(i=>!i.consumed&&i.y<600);
  this.feedback=this.feedback.filter(f=>this.elapsed-f.at<700);
  this.remainingMs=Math.max(0,this.remainingMs-dt);
  if(this.remainingMs===0){this.status='completed';this.result=Object.freeze({sessionId:this.sessionId,score:this.score,shellCount:this.shellCount,seaweedCount:this.seaweedCount,target:this.config.target});}
 }
 }
}
const api={CONFIG,Session,migrate,resultRecord};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.ShellGame=api;
})(typeof window==='undefined'?globalThis:window);
