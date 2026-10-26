/** Fury numerical prototype. All unverified rules are exposed, not hidden constants. */
function furyDamageCore(c, skills, rotation) {
  if (!(c.duration>0 && c.duration<=1800) || !(c.distance>=0) || !(c.calibration>0)) throw Error('Некорректные параметры боя.');
  const by={}; skills.forEach(s=>by[s.id]=s);
  const actions=[];
  rotation.forEach((r,i)=>{if(!r[1])return; if(!by[r[1]])throw Error('Неизвестный ID '+r[1]); if(!Number.isInteger(r[2])||r[2]<1||r[2]>1000||!(r[0]>=0)||!(r[3]>=0))throw Error('Ротация: строка '+(i+8)); for(let k=0;k<r[2];k++)actions.push({t:r[0]+k*r[3],id:r[1],order:actions.length});});
  actions.sort((a,b)=>a.t-b.t||a.order-b.order);
  const q=[],dots={},ready={},buff={},log=[],totals={},counts={}; let seq=0,total=0,free=0,last=0,elder=0,miasma=0,battle=0,battleEnd=0,mark=null,hitCount=0;
  // Optional comparison: both buffs finish immediately before t=0. Pre-cast time is outside the damage window.
  if(c.prebuffs || c.buffStacks===1){buff.time=12*(1+c.buffDuration);buff.light=7.5*(1+c.buffDuration);ready.time=21/(1+c.recovery);ready.light=30/(1+c.recovery);}
  const put=(t,kind,data)=>{if(t<=c.duration+1e-9)q.push({t,kind,data,n:seq++});};
  const active=t=>Object.values(dots).filter(d=>d.end>t);
  const rating=n=>Math.max(0,n)/(1000+Math.max(0,n));
  const critBonus=t=>c.critBonus-(c.distance<=5?c.distanceCrit:0)+(battle>=10&&t<battleEnd?0.123:0);
  function raw(s,t,dot,stacks) {
    const wand=!['mark','weak'].includes(s.id), lo=wand?c.wandMin:c.xbowMin, hi=(wand?c.wandMax:c.xbowMax)+(t<(buff.light||0)?92:0);
    const base=(lo+hi)/2, boost=c.skillBoost+(t<(buff.time||0)?220:0)+(t<battleEnd?battle*(c.battleBoost===undefined?5:c.battleBoost):0);
    const p=rating(c.critRating+(c.distance<=10?100:0)-c.endurance),h=rating(c.heavyRating-c.heavyResist);
    const k=dot?s.dot:s.coeff,flat=dot?s.dotFlat:s.flat;
    // Aragon hypothesis: DoT crit keeps mean weapon roll; direct crit uses max roll.
    const normal=base*k+flat, critical=(dot?normal:hi*k+flat)*(1+critBonus(t));
    let value=(normal*(1-p)+critical*p)*(1+h*c.heavyExtra);
    value*= (1+rating(boost))*(1+rating(c.creatureBoost))*(1+(wand?miasma*0.024:0));
    if(dot)value*=stacks*(1+c.gift+c.dotMastery+c.curseMastery+c.elderBase+elder*c.elderPerStack)*c.calibration;
    else value=(value+c.bonusDamage)*c.directFactor;
    if(s.id==='ray')value*=1+c.rayMonster+c.healEfficiency*.5;
    return value;
  }
  function add(t,id,kind,damage,note,accumulate=true){
    if(!Number.isFinite(damage)||damage<0)throw Error('Некорректный урон '+id);
    total+=damage;totals[id]=(totals[id]||0)+damage;
    if(mark&&t<=mark.end&&accumulate)mark.sum+=damage;
    log.push([t,kind,by[id]?by[id].name:id,damage,total,note||'']);
  }
  function settle(t){
    Object.keys(dots).forEach(id=>{const d=dots[id],dt=Math.max(0,Math.min(t,d.end)-Math.max(last,d.start));if(dt>0)add(t,id,'DoT · среднее',dt*d.rate,'Непрерывное матожидание; не отдельный игровой тик');if(d.end<=t)delete dots[id];});last=t;
  }
  function weaken(t,id){
    elder=Math.min(3,elder+1); // duration unknown: persists for this scenario
    if(t<(buff.selfless||0))Object.keys(ready).forEach(k=>{if(k!=='selfless')ready[k]=Math.max(t,ready[k]-.36);});
    if(id!=='despair')return;
  }
  actions.forEach(a=>put(a.t,'request',a));put(c.duration,'end',null);
  while(q.length){
    // Resolve effects at cast completion before the next request at the same timestamp.
    q.sort((a,b)=>a.t-b.t||Number(a.kind==='request')-Number(b.kind==='request')||a.n-b.n);const e=q.shift(),t=e.t;settle(t);if(log.length>15000)throw Error('Слишком много событий.');
    if(e.kind==='request'){
      const a=e.data,s=by[a.id];if(!(s.cooldown>=0)||!(s.cast>0))throw Error('Неизвестны откат/время применения: '+s.name);
      const start=Math.max(t,free,ready[s.id]||0);if(start>t+1e-8){put(start,'request',a);continue;}if(t>=c.duration)continue;
      free=t+s.cast+(s.id==='ray'?6:0);ready[s.id]=t+s.cooldown*(c.curseCooldown&&['despair','finger','circle','explosion','extend'].includes(s.id)?0.9:1)/(1+c.recovery);
      counts[s.id]=(counts[s.id]||0)+1;log.push([t,'Применение',s.name,0,total,'Откат до '+ready[s.id].toFixed(3)]);put(t+s.cast,'cast',s);continue;
    }
    if(e.kind==='cast'){
      const s=e.data,hadCurse=active(t).length>0;
      if(hadCurse&&['despair','finger','circle','explosion','extend','ray'].includes(s.id))miasma=Math.min(3,miasma+1);
      if(s.id==='time'){buff.time=t+12*(1+c.buffDuration);continue;}
      if(s.id==='light'){buff.light=t+7.5*(1+c.buffDuration);continue;}
      if(s.id==='selfless'){buff.selfless=t+6*(1+c.buffDuration);continue;}
      if(s.id==='mana')continue;
      if(s.id==='nature'){buff.nature=t+6*(1+c.buffDuration);continue;}
      if(s.id!=='ray'){battle=t<battleEnd?Math.min(10,battle+1):1;battleEnd=t+3;}
      if(s.id==='mark'){
        if(mark)add(t,'mark','Детонация метки',mark.sum*.4,'Без повторного крита/мощного удара',false);
        mark=null;add(t,s.id,'Прямой · среднее',raw(s,t,false,1));mark={end:t+3*(1+c.buffDuration),sum:0};put(mark.end,'markEnd',mark);continue;
      }
      if(s.id==='extend'){
        const types=active(t).length;add(t,s.id,'Прямой · среднее',raw(Object.assign({},s,{coeff:2*types,flat:0}),t,false,1),'2×база за тип проклятия; гипотеза');active(t).forEach(d=>{d.end+=5;put(d.end,'expiry',null);});continue;
      }
      if(s.id==='explosion'){add(t,s.id,'Прямой · среднее',raw(s,t,false,1));put(t+1,'explode',s);continue;}
      if(s.id==='ray'){for(let k=0;k<12;k++)put(t+.5*(k+1),'ray',s);continue;}
      if(s.coeff>0)add(t,s.id,'Прямой · среднее',raw(s,t,false,1));
      if(s.dot>0){
        weaken(t,s.id);const old=dots[s.id];let ps=null,stacks=1;
        if(s.id==='despair'){
          const prev=old?old.ps:[1,0,0,0];ps=[0,0,0,0];
          prev.forEach((p,i)=>{ps[Math.min(3,i+1)]+=p*.5;ps[Math.min(3,i+2)]+=p*.5;});
          stacks=ps.reduce((sum,p,i)=>sum+p*i,0);
        }
        const duration=s.duration+c.curseDuration+(s.id==='despair'&&old?2*old.ps[3]:0);
        dots[s.id]={start:t,end:t+duration,stacks,ps,rate:raw(s,t,true,stacks)};put(t+duration,'expiry',null);
        log.push([t,'Наложение',s.name,0,total,stacks+' ожидаемых стаков; снимок урона; '+duration+' с']);
      }
      if(t<(buff.nature||0)&&['mark','weak'].includes(s.id))add(t,'nature','Снаряд природы',raw(Object.assign({},s,{id:'nature',coeff:.41,flat:0}),t,false,1),'Число снарядов = 1; парная атака не моделируется');
    }
    if(e.kind==='ray')add(t,'ray','Луч · удар',raw(e.data,t,false,1));
    if(e.kind==='markEnd'&&mark===e.data){const damage=mark.sum*.4;mark=null;add(t,'mark','Детонация метки',damage,'40% накопленного; гипотеза всех источников',false);}
    if(e.kind==='explode'){
      const st=dots.despair?dots.despair.stacks:0;let residual=0;active(t).forEach(d=>residual+=d.rate*(d.end-t));
      add(t,'explosion','Взрыв остатка',residual*(1+.1*st),'Остаток снимка DoT; без второго крита/мощного');Object.keys(dots).forEach(k=>delete dots[k]);
    }
  }
  return {total,dps:total/c.duration,log,totals,counts};
}

function furyDamageSelfTest(){
  const c={duration:20,distance:9,calibration:1,wandMin:100,wandMax:100,xbowMin:100,xbowMax:100,skillBoost:0,battleBoost:0,critRating:0,endurance:100,heavyRating:0,heavyResist:0,heavyExtra:1,critBonus:.34,distanceCrit:.1,creatureBoost:0,gift:0,dotMastery:0,curseMastery:0,elderBase:0,elderPerStack:0,bonusDamage:0,directFactor:1,recovery:0,buffDuration:0,curseDuration:0,rayMonster:0,healEfficiency:0};
  const s=[{id:'despair',name:'DoT',cooldown:0,cast:1,coeff:0,flat:0,dot:1,dotFlat:0,duration:3.3},{id:'explosion',name:'Взрыв',cooldown:0,cast:1,coeff:0,flat:0,dot:0,dotFlat:0,duration:0}];
  const near=(a,b)=>{if(Math.abs(a-b)>1e-6)throw Error('Тест: '+a+' != '+b);};
  near(furyDamageCore(c,s,[[0,'despair',1,0]]).total,495);
  const x=furyDamageCore(c,s,[[0,'despair',1,0],[1,'explosion',1,0]]);near(x.total,300+195*1.15);
  const short=furyDamageCore(Object.assign({},c,{duration:2}),s,[[0,'despair',1,0]]);near(short.total,150);
  const heavy=furyDamageCore(Object.assign({},c,{heavyRating:1000}),s,[[0,'despair',1,0]]);near(heavy.total,742.5);
  const stacked=furyDamageCore(c,s,[[0,'despair',2,1]]).log.filter(r=>r[1]==='Наложение');
  if(!stacked[1][5].startsWith('2.75 '))throw Error('Неверное ожидание стаков второго наложения.');
  return '5 проверок: длительность, взрыв, граница боя, мощный удар, распределение стаков';
}

