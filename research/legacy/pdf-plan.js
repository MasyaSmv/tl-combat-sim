/** Aragon PDF p15 adapted to selected Finger specialization. */
function furyPdfPlan(config,skills,utilityCast,openerOnly){
  if(!(utilityCast>0&&utilityCast<=2))throw Error('Время неизмеренных применений: 0–2 с.');
  const by={};skills.forEach(s=>by[s.id]=Object.assign({},s,{cast:s.cast===''?utilityCast:s.cast}));
  const ready={},buff={},rotation=[];let now=0,loops=0,combos=0;
  const cd=id=>by[id].cooldown/(1+config.recovery)*(config.curseCooldown&&['finger','despair','explosion','extend'].includes(id)?.9:1);
  function cast(id,note){
    const s=by[id],start=Math.max(now,ready[id]||0),end=start+s.cast;
    if(start>=config.duration)return false;
    rotation.push([start,id,1,0,note||'']);ready[id]=start+cd(id);
    if(['time','light','selfless','nature'].includes(id))buff[id]=end+({time:12,light:7.5,selfless:6,nature:6}[id])*(1+config.buffDuration);
    if(['finger','despair'].includes(id)&&end<(buff.selfless||0))Object.keys(ready).forEach(k=>{if(k!=='selfless')ready[k]=Math.max(end,ready[k]-.36);});
    now=end+(id==='ray'?6:0);return true;
  }
  const comboReady=()=>Math.max(now,ready.finger||0,(ready.despair||0)-by.finger.cast,(ready.mark||0)-by.finger.cast-by.despair.cast,(ready.explosion||0)-by.finger.cast-by.despair.cast-by.mark.cast);
  function combo(){
    combos++;cast('finger','PDF 3: Перст вместо Круга, без поля');
    if((ready.selfless||0)<=now+1e-8)cast('selfless','PDF 4: по доступности, без ожидания всей комбинацией');
    cast('despair','PDF 5');cast('mark','PDF 6');cast('explosion','PDF 7');
    if((ready.extend||0)<=now+1e-8&&by.extend.cast<1)cast('extend','PDF 8: продление после применения взрыва и до детонации');
  }
  cast('nature','Перед нумерованными шагами PDF; дополнительный урон не включён');cast('time','PDF 1');cast('light','PDF 2');combo();
  if(openerOnly){cast('ray','Заполнитель после комбинации');return {rotation,combos,end:now};}
  while(now<config.duration&&loops++<5000){
    let used=false;
    for(const id of ['time','light','nature'])if((ready[id]||0)<=now+1e-8){cast(id,'Бафф по готовности');used=true;break;}
    if(used)continue;
    const target=comboReady(),gap=target-now;
    if(gap<=1e-8){combo();continue;}
    if((ready.despair||0)<=now+1e-8&&by.despair.cast<gap&&now+cd('despair')<=target+by.finger.cast+1e-8){cast('despair','Поддержание стаков без задержки следующей комбинации');continue;}
    if((ready.ray||0)<=now+1e-8&&by.ray.cast+6<=gap){cast('ray','Полный канал Луча помещается до следующей комбинации');continue;}
    if((ready.mana||0)<=now+1e-8&&by.mana.cast<gap){cast('mana','В свободном окне; ресурсная симуляция отсутствует');continue;}
    const future=[target,...['time','light','nature','despair','ray','mana'].map(id=>ready[id]||0)].filter(t=>t>now+1e-8);now=Math.min(...future);
  }
  if(loops>=5000)throw Error('Слишком много действий планировщика.');
  return {rotation,combos,end:now};
}
