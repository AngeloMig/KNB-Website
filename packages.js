(function(){

  var IC={
    monitor:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4"/></svg>',
    building:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M5 21V7l7-4 7 4v14"/><path d="M9 9h.01M9 13h.01M9 17h.01M15 9h.01M15 13h.01M15 17h.01"/></svg>',
    cart:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="20" r="1.2"/><circle cx="18" cy="20" r="1.2"/><path d="M2 3h3l2.4 12.3a1.6 1.6 0 0 0 1.6 1.3h8.6a1.6 1.6 0 0 0 1.6-1.3L23 7H6"/></svg>',
    grid:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>'
  };
  var CHK='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';
  var CRS='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>';
  var ARR='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  var CLOCK='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 1.8"/></svg>';
  var OUT={ starter:'A polished site you can launch fast and grow into.', business:'A credible site that turns visitors into enquiries.', ecom:'A fast store that is easy to run and ready to scale.', app:'Software that fits your process, not the other way round.' };
  var PKG=[
    {id:'starter',acc:'#111110',scope:1,next:'Business Website',name:'Starter Website',sub:'Small businesses & service sites',icon:'monitor',tagline:'A clean, professional site — ready in weeks.',meta:['~1–2 weeks','1 revision','Launch support'],inc:['1–5 pages, responsive design','Contact form, navigation & CTAs','Basic SEO (titles, meta, alt text)','Mobile-first, fast-loading build','Google Analytics setup','One revision, QA & launch support'],sep:['Ecommerce checkout','Custom animation & interactions','Branding / logo design','Full copywriting','Blog / CMS','Ongoing care plan']},
    {id:'business',acc:'#111110',scope:2,next:'Ecommerce Website',name:'Business Website',sub:'Growing companies, B2B, clinics',icon:'building',popular:true,tagline:'A site that builds trust and brings in leads.',meta:['~3–4 weeks','2 revisions','CMS training'],inc:['6–12 pages + blog / CMS','Lead forms & integrations','On-page SEO & speed','Editable CMS — update it yourself','Analytics & conversion tracking','2 revisions, QA & launch'],sep:['Ecommerce checkout','Custom web app features','Branding / logo design','Paid ad landing pages','Full copywriting','Ongoing care plan']},
    {id:'ecom',acc:'#5e8e3e',scope:3,next:'Custom Web App',name:'Ecommerce Website',sub:'Shopify & WooCommerce brands',icon:'cart',tagline:'A storefront built to sell on any device.',meta:['~4–6 weeks','2 revisions','Store training'],inc:['Theme build & product setup','Cart, checkout & payments','Apps, shipping & tax config','Collections, variants & filters','SEO, speed & analytics','Store training & launch'],sep:['Custom app features','Branding / logo design','Product photography','Ongoing marketing & ads','Full copywriting','Subscriptions / B2B portal']},
    {id:'app',acc:'#4353ff',scope:4,next:'',name:'Custom Web App',sub:'Dashboards, portals, booking, POS',icon:'grid',tagline:'Custom software, scoped around your workflow.',meta:['Scoped to spec','Agile sprints','Ongoing support'],inc:['Discovery & UX flows','Custom front-end build','APIs & integrations','Auth, roles & permissions','Database & admin dashboard','QA, launch & handover'],sep:['Off-the-shelf themes','Branding / logo design','Native mobile app','Third-party licenses','Ongoing maintenance','Data migration']}
  ];
  var FEAT=[
    {label:'Pages',vals:['1–5','6–12','Catalogue','Custom']},
    {label:'Responsive design',vals:[true,true,true,true]},
    {label:'Blog / CMS',vals:[false,true,true,true]},
    {label:'Ecommerce checkout',vals:[false,false,true,'Optional']},
    {label:'Dashboards / app',vals:[false,false,false,true]},
    {label:'SEO setup',vals:['Basic','On-page','Full','Full']},
    {label:'Revisions',vals:['1','2','2','Sprints']},
    {label:'Timeline',vals:['~1–2w','~3–4w','~4–6w','Scoped']},
    {label:'Launch support',vals:[true,true,true,true]}
  ];

  var PLUS='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>';
  function dots(n){ var o=''; for(var k=0;k<4;k++){ o+='<i class="'+(k<n?'on':'')+'"></i>'; } return o; }
  function detail(p){
    return '<span class="md-wm">'+IC[p.icon]+'</span>'+
      '<div class="md-d-ic">'+IC[p.icon]+'</div>'+
      '<span class="pk-eyebrow">'+p.name+'</span>'+
      '<span class="md-d-sub">'+p.sub+'</span>'+
      '<h3 class="pk-tagline">'+p.tagline+'</h3>'+
      '<p class="md-outcome">'+OUT[p.id]+'</p>'+'<div class="md-quote"><span class="pk-badge"><span class="dot"></span>Quoted to your scope</span><div class="pk-meta">'+p.meta.map(function(m,mi){return '<span'+(mi===0?' class="meta-time"':'')+'>'+(mi===0?CLOCK:'')+m+'</span>';}).join('')+'</div></div>'+
      '<div class="md-scope"><span class="md-scope-l">Project scope</span><span class="md-dots">'+dots(p.scope)+'</span></div>'+'<div class="md-div"></div>'+
      '<div class="pk-cols"><div class="pk-col"><span class="pk-col-h">Included <span class="pk-cnt">'+p.inc.length+'</span></span>'+p.inc.map(function(x){return '<span class="pk-li yes"><i class="pk-tick">'+CHK+'</i>'+x+'</span>';}).join('')+'</div>'+
      '<div class="pk-col md-addons"><span class="pk-col-h">Quoted separately <span class="pk-cnt">'+p.sep.length+'</span><span class="md-added" hidden></span></span>'+p.sep.map(function(x){return '<button type="button" class="md-addon">'+PLUS+'<span>'+x+'</span></button>';}).join('')+'</div></div>'+
      '<div class="md-process"><span class="md-pstep"><span class="md-pn">1</span>Discovery</span><span class="md-pline"></span><span class="md-pstep"><span class="md-pn">2</span>Design &amp; build</span><span class="md-pline"></span><span class="md-pstep"><span class="md-pn">3</span>Launch</span></div>'+'<div class="md-trust"><span>'+CHK+'Written proposal</span><span>'+CHK+'Fixed scope</span><span>'+CHK+'No surprises</span></div>'+'<div class="md-foot"><a class="pk-cta" href="contact.html"><span class="dot"></span>Get a quote</a><a class="md-compare" href="#">Compare all packages \u2192</a>'+(p.next?'<a class="md-upsell" href="#" data-next="'+p.next+'">Outgrowing this? See '+p.next+' \u2192</a>':'')+'<span class="md-note">No prices shown \u2014 every project is quoted in writing after a free consultation.</span></div>';
  }

  function build(v, el){
    if(v==='md'){
      el.className='render v-md';
      el.innerHTML='<div class="md-list">'+ PKG.map(function(p,i){ return '<button class="md-item'+(i===0?' on':'')+'" data-i="'+i+'" style="--acc:'+p.acc+'">'+(p.popular?'<span class="md-pop">Popular</span>':'')+'<span class="md-ic">'+IC[p.icon]+'</span><span><span class="md-tt">'+p.name+'</span><span class="md-sub">'+p.sub+'</span></span><span class="md-arrow">'+ARR+'</span></button>'; }).join('')+'</div>'+
        '<div class="md-detail"><div class="md-face">'+detail(PKG[0])+'</div></div>';
      var items=[].slice.call(el.querySelectorAll('.md-item')), face=el.querySelector('.md-detail'), list=el.querySelector('.md-list'), cur=0;
      function wire(){ var added=face.querySelector('.md-added'); var addons=[].slice.call(face.querySelectorAll('.md-addon')); function upd(){ var n=face.querySelectorAll('.md-addon.on').length; if(added){ added.hidden=n===0; added.textContent='\u00b7 '+n+' added'; } } addons.forEach(function(a){ a.addEventListener('click', function(e){ e.preventDefault(); a.classList.toggle('on'); upd(); }); }); var up=face.querySelector('.md-upsell'); if(up){ up.addEventListener('click', function(e){ e.preventDefault(); var nm=up.getAttribute('data-next'), idx=-1; PKG.forEach(function(p,k){ if(p.name===nm){ idx=k; } }); if(idx>=0){ sel(idx); } }); } }
      function sel(i){ cur=(i+items.length)%items.length; items.forEach(function(x,j){ x.classList.toggle('on', j===cur); }); face.innerHTML='<div class="md-face">'+detail(PKG[cur])+'</div>'; face.style.setProperty('--acc', PKG[cur].acc||'#111110'); wire(); }
      items.forEach(function(b){ b.addEventListener('click', function(){ sel(+b.dataset.i); }); });
      list.setAttribute('tabindex','0');
      list.addEventListener('keydown', function(e){ if(e.key==='ArrowDown'||e.key==='ArrowRight'){ e.preventDefault(); sel(cur+1); } else if(e.key==='ArrowUp'||e.key==='ArrowLeft'){ e.preventDefault(); sel(cur-1); } });
      sel(0);
    }
    else if(v==='cards4'){
      el.className='render v-cards4';
      el.innerHTML=PKG.map(function(p){ return '<article class="c4'+(p.popular?' pop':'')+'">'+(p.popular?'<span class="c4-pop">Popular</span>':'')+'<span class="c4-ic">'+IC[p.icon]+'</span><h4>'+p.name+'</h4><div class="sub">'+p.sub+'</div><div class="price"><span class="dot"></span>Quoted to scope</div><div class="c4-meta">'+p.meta.map(function(m){return '<span>'+m+'</span>';}).join('')+'</div><ul>'+p.inc.map(function(x){return '<li>'+CHK+x+'</li>';}).join('')+'</ul><div class="c4-foot"><span class="c4-not">+ '+p.sep.length+' add-ons quoted separately</span><a class="c4-cta" href="contact.html">Get a quote</a></div></article>'; }).join('');
    }
    else if(v==='acc2'){
      el.className='render v-acc2';
      el.innerHTML=PKG.map(function(p,i){ return '<div class="a2'+(i===0?' on':'')+'" data-i="'+i+'"><button class="a2-head"><span class="a2-ic">'+IC[p.icon]+'</span><span><span class="a2-tt">'+p.name+(p.popular?'<span class="a2-pop">Popular</span>':'')+'</span><span class="a2-sub">'+p.sub+'</span></span><span class="a2-plus">+</span></button><div class="a2-body"><div class="a2-inner"><h3 class="pk-tagline" style="margin-top:0">'+p.tagline+'</h3><span class="pk-badge" style="margin-bottom:14px"><span class="dot"></span>Quoted to your scope</span><div class="pk-meta" style="margin:0">'+p.meta.map(function(m){return '<span>'+m+'</span>';}).join('')+'</div><div class="pk-cols"><div class="pk-col"><span class="pk-col-h">Included</span>'+p.inc.map(function(x){return '<span class="pk-li yes"><i class="pk-tick">'+CHK+'</i>'+x+'</span>';}).join('')+'</div><div class="pk-col"><span class="pk-col-h">Quoted separately</span>'+p.sep.map(function(x){return '<span class="pk-li no"><i class="pk-tick">'+CRS+'</i>'+x+'</span>';}).join('')+'</div></div><a class="pk-cta" href="contact.html"><span class="dot"></span>Get a quote</a></div></div></div>'; }).join('');
      var rows=[].slice.call(el.querySelectorAll('.a2'));
      rows.forEach(function(r){ r.querySelector('.a2-head').addEventListener('click', function(){ var open=r.classList.contains('on'); rows.forEach(function(x){x.classList.remove('on');}); if(!open) r.classList.add('on'); }); });
    }
    else if(v==='tabs2'){
      el.className='render v-tabs2';
      el.innerHTML='<div class="t2-rail"><span class="t2-ind"></span>'+ PKG.map(function(p,i){ return '<button class="t2-btn'+(i===0?' on':'')+'" data-i="'+i+'">'+IC[p.icon]+p.name+'</button>'; }).join('')+'</div><div class="t2-panel"><div class="t2-face"></div></div>';
      var rail=el.querySelector('.t2-rail'), ind=el.querySelector('.t2-ind'), btns=[].slice.call(el.querySelectorAll('.t2-btn')), panel=el.querySelector('.t2-panel');
      function detailSplit(p){ return '<div class="t2-left"><span class="pk-eyebrow">'+p.name+'</span><span class="t2-sub">'+p.sub+'</span><h3 class="pk-tagline">'+p.tagline+'</h3><span class="pk-badge"><span class="dot"></span>Quoted to your scope</span><div class="pk-meta">'+p.meta.map(function(m){return '<span>'+m+'</span>';}).join('')+'</div><a class="pk-cta" href="contact.html"><span class="dot"></span>Get a quote</a></div><div class="t2-right"><div class="pk-cols" style="grid-template-columns:1fr 1fr;margin-top:0"><div class="pk-col"><span class="pk-col-h">Included</span>'+p.inc.map(function(x){return '<span class="pk-li yes"><i class="pk-tick">'+CHK+'</i>'+x+'</span>';}).join('')+'</div><div class="pk-col"><span class="pk-col-h">Quoted separately</span>'+p.sep.map(function(x){return '<span class="pk-li no"><i class="pk-tick">'+CRS+'</i>'+x+'</span>';}).join('')+'</div></div></div>'; }
      function moveInd(b){ ind.style.left=b.offsetLeft+'px'; ind.style.width=b.offsetWidth+'px'; }
      function sel(i){ btns.forEach(function(x,j){ x.classList.toggle('on', j===i); }); moveInd(btns[i]); panel.querySelector('.t2-face').outerHTML='<div class="t2-face">'+detailSplit(PKG[i])+'</div>'; }
      btns.forEach(function(b){ b.addEventListener('click', function(){ sel(+b.dataset.i); }); });
      el._onPlay=function(){ sel(0); };
      setTimeout(function(){ sel(0); }, 30);
    }
    else if(v==='matrix'){
      el.className='render v-matrix';
      var head='<thead><tr><th class="mx-corner"></th>'+PKG.map(function(p,ci){ return '<th data-c="'+ci+'"'+(p.popular?' class="col-pop"':'')+'><div class="mx-col"><span class="mx-ic">'+IC[p.icon]+'</span><b>'+p.name.replace(' Website','').replace(' Web App',' App')+'</b>'+(p.popular?'<span class="mx-pop">Popular</span>':'')+'</div></th>'; }).join('')+'</tr></thead>';
      var body='<tbody>'+'<tr class="mx-bestfor"><th>Best for</th>'+PKG.map(function(p,ci){return '<td data-c="'+ci+'"'+(p.popular?' class="col-pop"':'')+'><span class="mx-bf">'+p.sub+'</span></td>';}).join('')+FEAT.map(function(f){ return '<tr><th>'+f.label+'</th>'+f.vals.map(function(val,ci){ var pop=PKG[ci].popular?' class="col-pop"':''; var cell; if(val===true) cell='<span class="yes">'+CHK+'</span>'; else if(val===false) cell='<span class="no">'+CRS+'</span>'; else cell='<span class="val">'+val+'</span>'; return '<td data-c="'+ci+'"'+pop+'>'+cell+'</td>'; }).join('')+'</tr>'; }).join('')+'</tbody>';
      var foot='<tfoot><tr><td></td>'+PKG.map(function(p,ci){ return '<td data-c="'+ci+'"'+(p.popular?' class="col-pop"':'')+'><a class="mx-cta" href="contact.html">Get a quote</a></td>'; }).join('')+'</tr></tfoot>';
      el.innerHTML='<table class="mx">'+head+body+foot+'</table>';
    }
  }

  document.querySelectorAll('.demo').forEach(function(demo){
    var v=demo.dataset.variant, stage=demo.querySelector('.stage'), render=demo.querySelector('.render');
    build(v, render);
    var play=function(){ stage.classList.remove('play'); void stage.offsetWidth; stage.classList.add('play'); if(render._onPlay) render._onPlay(); };
    if('IntersectionObserver' in window){ var io=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ play(); io.unobserve(e.target); } }); },{threshold:0.2}); io.observe(stage); }
    else play();
  });

  document.querySelectorAll('.c4').forEach(function(c){
    c.addEventListener('pointermove', function(e){ var r=c.getBoundingClientRect(); c.style.setProperty('--mx',((e.clientX-r.left)/r.width*100)+'%'); c.style.setProperty('--my',((e.clientY-r.top)/r.height*100)+'%'); });
  });
  document.querySelectorAll('.mx').forEach(function(t){
    t.addEventListener('pointerover', function(e){ var c=e.target.closest('[data-c]'); if(!c){ return; } var ci=c.getAttribute('data-c'); t.querySelectorAll('.colhi').forEach(function(x){ x.classList.remove('colhi'); }); t.querySelectorAll('[data-c="'+ci+'"]').forEach(function(x){ x.classList.add('colhi'); }); });
    t.addEventListener('pointerleave', function(){ t.querySelectorAll('.colhi').forEach(function(x){ x.classList.remove('colhi'); }); });
  });

  function matrixHTML(){
    var head='<thead><tr><th class="mx-corner"></th>'+PKG.map(function(p,ci){ return '<th data-c="'+ci+'"'+(p.popular?' class="col-pop"':'')+'><div class="mx-col"><span class="mx-ic">'+IC[p.icon]+'</span><b>'+p.name.replace(' Website','').replace(' Web App',' App')+'</b>'+(p.popular?'<span class="mx-pop">Popular</span>':'')+'</div></th>'; }).join('')+'</tr></thead>';
    var body='<tbody>'+'<tr class="mx-bestfor"><th>Best for</th>'+PKG.map(function(p,ci){return '<td data-c="'+ci+'"'+(p.popular?' class="col-pop"':'')+'><span class="mx-bf">'+p.sub+'</span></td>';}).join('')+FEAT.map(function(f){ return '<tr><th>'+f.label+'</th>'+f.vals.map(function(val,ci){ var pop=PKG[ci].popular?' class="col-pop"':''; var cell; if(val===true){ cell='<span class="yes">'+CHK+'</span>'; } else if(val===false){ cell='<span class="no">'+CRS+'</span>'; } else { cell='<span class="val">'+val+'</span>'; } return '<td data-c="'+ci+'"'+pop+'>'+cell+'</td>'; }).join('')+'</tr>'; }).join('')+'</tbody>';
    var foot='<tfoot><tr><td></td>'+PKG.map(function(p,ci){ return '<td data-c="'+ci+'"'+(p.popular?' class="col-pop"':'')+'><a class="mx-cta" href="contact.html">Get a quote</a></td>'; }).join('')+'</tfoot>';
    return '<table class="mx">'+head+body+foot+'</table>';
  }
  function wireMatrix(t){ if(!t){ return; } t.addEventListener('pointerover', function(e){ var c=e.target.closest('[data-c]'); if(!c){ return; } var ci=c.getAttribute('data-c'); t.querySelectorAll('.colhi').forEach(function(x){ x.classList.remove('colhi'); }); t.querySelectorAll('[data-c="'+ci+'"]').forEach(function(x){ x.classList.add('colhi'); }); }); t.addEventListener('pointerleave', function(){ t.querySelectorAll('.colhi').forEach(function(x){ x.classList.remove('colhi'); }); }); }
  var lastFocus=null;
  function closeModals(){ var any=false; document.querySelectorAll(".cmp-modal.open").forEach(function(m){ m.classList.remove("open"); any=true; }); document.body.style.overflow=""; if(location.hash==='#addons'){ history.replaceState(null,'',location.pathname+location.search); } if(any && lastFocus && lastFocus.focus){ try{ lastFocus.focus(); }catch(e){} } }
  function showModal(m){ lastFocus=document.activeElement; m.classList.add('open'); document.body.style.overflow='hidden'; var x=m.querySelector('.cmp-x'); if(x){ x.focus(); } }
  function addTrap(m){ m.addEventListener('keydown', function(e){ if(e.key!=='Tab'){ return; } var dialog=m.querySelector('.cmp-dialog'); if(!dialog){ return; } var nodes=Array.prototype.slice.call(dialog.querySelectorAll('a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])')).filter(function(n){ return n.offsetParent!==null; }); if(!nodes.length){ return; } var first=nodes[0], last=nodes[nodes.length-1]; if(e.shiftKey && document.activeElement===first){ e.preventDefault(); last.focus(); } else if(!e.shiftKey && document.activeElement===last){ e.preventDefault(); first.focus(); } }); }
  var ADDONS=[{n:'Extra pages',d:'More templates or landing pages beyond the package.',q:'Quoted per page',i:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3h8a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M9 8h6M9 12h6M9 16h4"/></svg>'},{n:'Copywriting',pop:true,d:'Full website copy written for your audience.',q:'Quoted by scope',i:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>'},{n:'Branding & logo',pop:true,d:'Logo, colours, and brand direction.',q:'Quoted by scope',i:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l2.2 5.8L20 11l-5.8 2.2L12 19l-2.2-5.8L4 11l5.8-2.2z"/></svg>'},{n:'Product photography',d:'Studio or lifestyle shots for your store.',q:'Quoted by scope',i:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="18" height="13" rx="2"/><circle cx="12" cy="13.5" r="3.2"/><path d="M8.5 7l1.3-2h4.4l1.3 2"/></svg>'},{n:'Content migration',d:'Moving large amounts of content or products.',q:'Quoted by volume',i:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h12l-3-3M20 16H8l3 3"/></svg>'},{n:'Advanced integrations',pop:true,d:'ERP, POS, CRM, or custom API connections.',q:'Quoted by scope',i:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="5" width="14" height="14" rx="2"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/></svg>'},{n:'Multi-language',d:'Extra languages with a localised experience.',q:'Quoted by scope',i:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/></svg>'},{n:'Booking & scheduling',d:'Appointments, calendars, and reminders.',q:'Quoted by scope',i:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/></svg>'},{n:'Email & automation',d:'Newsletters, flows, and CRM setup.',q:'Quoted by scope',i:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>'},{n:'Memberships',d:'Logins, paywalls, and member-only areas.',q:'Quoted by scope',i:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>'},{n:'Accessibility audit',d:'WCAG review and remediation for compliance.',q:'Quoted by scope',i:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="4.5" r="1.8"/><path d="M5 8h14M12 8v7M9 21l3-6 3 6"/></svg>'},{n:'Performance tuning',d:'Core Web Vitals and speed optimisation.',q:'Quoted by scope',i:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18a9 9 0 1 1 18 0"/><path d="M12 13l4-4"/><circle cx="12" cy="18" r="1"/></svg>'},{n:'Ongoing care plan',care:true,d:'Updates, backups, security, and support.',q:'Billed monthly',i:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/></svg>'}];
  function buildAddons(){ return '<div class="ax-legend">Tags show how each is priced — by scope, per page, by volume, or billed monthly. Tick the ones you want and we’ll include them in your quote.</div><div class="ax-grid">'+ADDONS.map(function(a){ var pop=a.pop?'<span class="ax-pop">Popular</span>':''; if(a.care){ return '<a class="ax ax-care" href="#" data-care="1"><span class="ax-go">→</span><span class="ax-ic">'+a.i+'</span><div class="ax-n">'+a.n+pop+'</div><div class="ax-d">'+a.d+'</div><span class="ax-q">'+a.q+'</span></a>'; } return '<div class="ax" data-n="'+a.n+'"><button type="button" class="ax-pick" aria-pressed="false" aria-label="Add '+a.n+'">+</button><span class="ax-ic">'+a.i+'</span><div class="ax-n">'+a.n+pop+'</div><div class="ax-d">'+a.d+'</div><span class="ax-q">'+a.q+'</span></div>'; }).join("")+'</div>'; }
  function openAddons(){ var m=document.getElementById("axModal"); if(!m){ m=document.createElement("div"); m.id="axModal"; m.className="cmp-modal"; m.innerHTML='<div class="cmp-backdrop"></div><div class="cmp-dialog cmp-sticky" role="dialog" aria-modal="true" aria-label="Optional add-ons"><div class="cmp-head"><button class="cmp-x" aria-label="Close">\u2715</button><div class="cmp-htop"><span class="pk-kicker">Optional extras</span><span class="cmp-badge">'+ADDONS.length+' add-ons</span></div><h3>Add-ons, quoted separately</h3><p class="cmp-sub">Mix any of these into your project \u2014 each is scoped on its own, so you only pay for what you add.</p></div><div class="cmp-body">'+buildAddons()+'</div><div class="cmp-foot"><div class="cmp-foot-l"><span class="cmp-foot-q" id="axSelMsg">Don\u2019t see what you need?</span><button type="button" class="ax-clear" id="axClear" hidden>Clear all</button></div><a class="pk-cta cmp-cta" id="axCta" href="contact.html"><span class="dot"></span>Get a quote</a></div></div>'; document.body.appendChild(m); m.querySelector(".cmp-x").addEventListener("click", closeModals); m.querySelector(".cmp-backdrop").addEventListener("click", closeModals); addTrap(m); } applyPicksToModal(m); showModal(m); }
  function openCompare(){
    var m=document.getElementById('cmpModal');
    if(!m){
      m=document.createElement('div'); m.id='cmpModal'; m.className='cmp-modal';
      m.innerHTML='<div class="cmp-backdrop"></div><div class="cmp-dialog" role="dialog" aria-modal="true"><div class="cmp-head"><button class="cmp-x" aria-label="Close">\u2715</button><span class="pk-kicker">Compare packages</span><h3>All four, side by side</h3><p class="cmp-sub">Scope and inclusions for every package. Hover a column to focus it.</p></div><div class="cmp-body">'+matrixHTML()+'</div><div class="cmp-foot cmp-foot--note"><span class="cmp-foot-note">No prices shown \u2014 every project is quoted in writing after a free consultation.</span><a class="pk-cta cmp-cta" href="contact.html"><span class="dot"></span>Get a quote</a></div></div>';
      document.body.appendChild(m);
      m.querySelector('.cmp-x').addEventListener('click', closeModals);
      m.querySelector('.cmp-backdrop').addEventListener('click', closeModals);
      wireMatrix(m.querySelector('.mx'));
      addTrap(m);
    }
    showModal(m);
  }
  var picks={};
  function loadPicks(){ try{ var raw=localStorage.getItem('knb_addons'); if(raw){ JSON.parse(raw).forEach(function(n){ picks[n]=true; }); } }catch(e){} }
  function savePicks(){ try{ localStorage.setItem('knb_addons', JSON.stringify(Object.keys(picks).filter(function(k){ return picks[k]; }))); }catch(e){} }
  function updateTeaser(){ var n=Object.keys(picks).filter(function(k){ return picks[k]; }).length; document.querySelectorAll('[data-addons-count]').forEach(function(b){ if(n>0){ b.textContent=n; b.hidden=false; } else { b.textContent=''; b.hidden=true; } }); }
  function applyPicksToModal(m){ if(!m){ return; } m.querySelectorAll('.ax[data-n]').forEach(function(card){ var n=card.getAttribute('data-n'); var on=!!picks[n]; card.classList.toggle('sel', on); var pk=card.querySelector('.ax-pick'); if(pk){ pk.setAttribute('aria-pressed', on?'true':'false'); pk.textContent=on?'✓':'+'; } }); axFootUpdate(); }
  function clearPicks(){ Object.keys(picks).forEach(function(k){ picks[k]=false; }); savePicks(); updateTeaser(); applyPicksToModal(document.getElementById('axModal')); }
  function axFootUpdate(){ var modal=document.getElementById('axModal'); if(!modal){ return; } var names=Object.keys(picks).filter(function(k){ return picks[k]; }); var msg=modal.querySelector('#axSelMsg'); var cta=modal.querySelector('#axCta'); var clr=modal.querySelector('#axClear'); if(!msg||!cta){ return; } if(names.length){ msg.textContent=names.length+(names.length>1?' add-ons selected':' add-on selected'); msg.classList.add('on'); cta.href='contact.html?addons='+encodeURIComponent(names.join(', ')); if(clr){ clr.hidden=false; } } else { msg.textContent='Don’t see what you need?'; msg.classList.remove('on'); cta.href='contact.html'; if(clr){ clr.hidden=true; } } }
  document.addEventListener('click', function(e){ if(e.target.closest('.md-compare')){ e.preventDefault(); openCompare(); } if(e.target.closest('[data-addons]')){ e.preventDefault(); openAddons(); } var pk=e.target.closest('.ax-pick'); if(pk){ e.preventDefault(); var card=pk.closest('.ax'); var n=card.getAttribute('data-n'); picks[n]=!picks[n]; pk.setAttribute('aria-pressed', picks[n]?'true':'false'); pk.textContent=picks[n]?'✓':'+'; card.classList.toggle('sel', !!picks[n]); savePicks(); updateTeaser(); axFootUpdate(); return; } if(e.target.closest('#axClear')){ e.preventDefault(); clearPicks(); return; } var care=e.target.closest('.ax-care'); if(care){ e.preventDefault(); closeModals(); var t=document.getElementById('tab-care'); if(t){ t.click(); var p=document.getElementById('panel-care'); (p||t).scrollIntoView({behavior:'smooth', block:'start'}); } return; } });
  document.addEventListener('keydown', function(e){ if(e.key==='Escape'){ closeModals(); } });
  loadPicks(); updateTeaser();
  if(location.hash==='#addons'){ openAddons(); }
  window.addEventListener('hashchange', function(){ if(location.hash==='#addons'){ openAddons(); } });

  /* public API (used by the quiz) */
  window.KNBpkg = {
    open: openAddons,
    compare: openCompare,
    select: function(id){ var el=document.getElementById('pkgSelect'); if(!el){ return; } var idx=-1; PKG.forEach(function(p,k){ if(p.id===id){ idx=k; } }); if(idx<0){ return; } var tb=document.getElementById('tab-build'); if(tb){ tb.click(); } var b=el.querySelectorAll('.md-item')[idx]; if(b){ b.click(); el.scrollIntoView({behavior:'smooth', block:'start'}); } },
    addAddons: function(names){ if(!names||!names.length){ return; } names.forEach(function(n){ picks[n]=true; }); savePicks(); updateTeaser(); applyPicksToModal(document.getElementById('axModal')); }
  };

  /* pricing page init */
  (function(){ var el=document.getElementById('pkgSelect'); if(!el){ return; } build('md', el); var m=/^#build-([a-z]+)$/.exec(location.hash); if(m){ var idx=-1; PKG.forEach(function(p,k){ if(p.id===m[1]){ idx=k; } }); if(idx>=0){ var b=el.querySelectorAll('.md-item')[idx]; if(b){ b.click(); } } } })();
})();
