/* Process — scroll-driven accordion + correlated illustrations.
   Paired with process.css. Safe to load once per page (one .pa-scroll instance).
   - Active step is a deterministic function of scroll position => reversing (scroll up) is clean.
   - Fail-safe: on mobile OR prefers-reduced-motion it unpins and becomes a plain click accordion. */
(function(){
  var scroll=document.getElementById('paScroll');
  if(!scroll) return;
  var acc=document.getElementById('paAcc');
  var items=[].slice.call(acc.querySelectorAll('.pa-item'));
  var shots=[].slice.call(scroll.querySelectorAll('.pa-media .pa-shot'));
  var segs=[].slice.call(scroll.querySelectorAll('.pa-prog .pa-seg'));
  var count=document.getElementById('paCount');
  var N=items.length, current=-1, lock=false, lockTimer;

  var mqMobile=matchMedia('(max-width:860px)');
  var mqReduce=matchMedia('(prefers-reduced-motion:reduce)');
  function staticMode(){return mqMobile.matches || mqReduce.matches;}

  // clone each illustration into its mobile mini slot
  items.forEach(function(it,k){
    var mini=it.querySelector('.pa-mini'); var shot=shots[k];
    var vis=shot&&shot.querySelector('.pa-il,.pa-photo');
    if(mini&&vis){ mini.appendChild(vis.cloneNode(true)); }
  });

  function setH(it){var a=it.querySelector('.pa-a');a.style.maxHeight=it.classList.contains('open')?a.scrollHeight+'px':'0px';}

  function open(k){
    if(k===current) return;
    current=k;
    items.forEach(function(it,i){
      var on=i===k;
      it.classList.toggle('open',on);
      it.querySelector('.pa-q').setAttribute('aria-expanded',on?'true':'false');
      setH(it);
    });
    shots.forEach(function(s){ s.classList.toggle('on',+s.dataset.k===k); });
    segs.forEach(function(s,i){ s.classList.toggle('on',i<=k); s.classList.toggle('cur',i===k); });
    if(count) count.textContent='0'+(k+1)+' / 05';
  }
  function toggle(k){ // static-mode accordion (allow collapse)
    var it=items[k], willOpen=!it.classList.contains('open');
    if(!willOpen){
      it.classList.remove('open'); it.querySelector('.pa-q').setAttribute('aria-expanded','false'); setH(it);
      shots.forEach(function(s){s.classList.remove('on');}); return;
    }
    open(k);
  }

  function onScroll(){
    if(staticMode()||lock) return;
    var total=scroll.offsetHeight-window.innerHeight;
    if(total<=0) return;
    var p=Math.min(1,Math.max(0,(-scroll.getBoundingClientRect().top)/total));
    open(Math.min(N-1,Math.floor(p*N+0.0001)));
  }
  window.addEventListener('scroll',onScroll,{passive:true});

  function applyMode(){
    scroll.classList.toggle('no-pin',staticMode());
    items.forEach(function(o){ if(o.classList.contains('open')) setH(o); });
    if(!staticMode()) onScroll();
  }
  if(mqMobile.addEventListener){ mqMobile.addEventListener('change',applyMode); mqReduce.addEventListener('change',applyMode); }
  window.addEventListener('resize',function(){items.forEach(function(o){if(o.classList.contains('open'))setH(o);});});

  items.forEach(function(it,k){
    var btn=it.querySelector('.pa-q');
    btn.addEventListener('click',function(e){
      if(staticMode()){ toggle(k); return; }
      if(e.detail===0){ open(k); return; }   // keyboard (Enter/Space) opens directly
      open(k); lock=true; clearTimeout(lockTimer);
      var total=scroll.offsetHeight-window.innerHeight;
      var top=scroll.offsetTop + (k+0.5)/N*total;
      window.scrollTo({top:top,behavior:'smooth'});
      lockTimer=setTimeout(function(){lock=false;},700);
    });
  });

  requestAnimationFrame(function(){ applyMode(); items.forEach(setH); open(0); });
})();
