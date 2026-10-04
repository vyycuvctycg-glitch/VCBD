var N = 100;
// ===== VALEURS PAR DÉFAUT : titre + lien. Le reste est vide (= R). Modifie ici ou sur le site =====
var DEFAULTS = [
  {t:"Ma première vidéo", u:"https://www.tube8.fr/porn-video/288098031/"}
];
// ==================================================================================================
var $ = function(id){return document.getElementById(id)};
var stage = $("stage"), kind = null, editing = 0;

function blank(){var a=[];for(var i=0;i<N;i++)a.push({t:"",u:""});return a}
function load(){
  var a = blank();
  DEFAULTS.forEach(function(d,i){a[i]={t:d.t,u:d.u}});
  try{var s=JSON.parse(localStorage.getItem("vids100")||"null");if(s&&s.length){a=blank();s.slice(0,N).forEach(function(d,i){a[i]={t:d.t||"",u:d.u||""}})}}catch(e){}
  return a;
}
var V = load();
function save(){try{localStorage.setItem("vids100",JSON.stringify(V))}catch(e){}}

function parse(u){
  var m;
  if((m=u.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/))([\w-]{11})/)))return{t:"yt",id:m[1]};
  if((m=u.match(/vimeo\.com\/(?:video\/)?(\d+)/)))return{t:"vm",id:m[1]};
  return{t:"file",src:u};
}

function draw(){
  var g=$("grid");g.textContent="";
  V.forEach(function(v,i){
    var has=!!v.u.trim();
    var c=document.createElement("div");c.className="card"+(has?"":" empty");
    var n=document.createElement("div");n.className="n";n.textContent="Vidéo "+(i+1);
    var mid=document.createElement("div");
    if(has){mid.className="ttl";mid.textContent=v.t||"Sans titre"}else{mid.className="big";mid.textContent="R"}
    var r=document.createElement("div");r.className="row";
    var b=document.createElement("button");b.className="cta";b.textContent="Lancer la vidéo";b.disabled=!has;
    b.onclick=function(){play(i)};
    var e=document.createElement("button");e.className="ghost";e.textContent="Modifier";e.setAttribute("aria-label","Modifier la vidéo "+(i+1));
    e.onclick=function(){openOne(i)};
    r.appendChild(b);r.appendChild(e);
    c.appendChild(n);c.appendChild(mid);c.appendChild(r);g.appendChild(c);
  });
}

function post(msg){var f=$("player");if(f&&f.contentWindow)f.contentWindow.postMessage(typeof msg==="string"?msg:JSON.stringify(msg),"*")}
function maxVolume(){
  var p=$("player");if(!p||!kind)return;
  if(kind.t==="file"){p.muted=false;p.volume=1;p.play&&p.play().catch(function(){})}
  else if(kind.t==="yt"){[["unMute",[]],["setVolume",[100]],["playVideo",[]]].forEach(function(x){post({event:"command",func:x[0],args:x[1]})})}
  else{post({method:"setMuted",value:false});post({method:"setVolume",value:1});post({method:"play"})}
}
function fullscreen(){
  var f=stage.requestFullscreen||stage.webkitRequestFullscreen;
  if(f){try{var r=f.call(stage);if(r&&r.catch)r.catch(function(){})}catch(e){}}
  else{var p=$("player");if(p&&p.webkitEnterFullscreen)p.webkitEnterFullscreen()}
}
function mount(i){
  var v=V[i];kind=parse(v.u.trim());
  stage.textContent="";
  var el;
  if(kind.t==="yt"){el=document.createElement("iframe");el.src="https://www.youtube.com/embed/"+kind.id+"?autoplay=1&enablejsapi=1&playsinline=1&rel=0&origin="+encodeURIComponent(location.origin)}
  else if(kind.t==="vm"){el=document.createElement("iframe");el.src="https://player.vimeo.com/video/"+kind.id+"?autoplay=1&api=1"}
  else{el=document.createElement("video");el.src=kind.src;el.controls=true;el.autoplay=true;el.playsInline=true}
  el.setAttribute("allow","autoplay; fullscreen; picture-in-picture; encrypted-media");
  el.setAttribute("allowfullscreen","");el.id="player";stage.appendChild(el);
  $("now").textContent=v.t||("Vidéo "+(i+1));document.title=v.t||"Salle de projection";
  setTimeout(maxVolume,1200);setTimeout(maxVolume,3000);
}
function play(i){
  mount(i);
  stage.scrollIntoView({block:"start"});
  fullscreen();maxVolume();
}

function openOne(i){editing=i;$("oneH").textContent="Vidéo "+(i+1);$("oT").value=V[i].t;$("oU").value=V[i].u;$("dlgOne").showModal()}
$("oSave").onclick=function(){V[editing]={t:$("oT").value.trim(),u:$("oU").value.trim()};save();draw();$("dlgOne").close()};
$("oClear").onclick=function(){V[editing]={t:"",u:""};save();draw();$("dlgOne").close()};
$("oClose").onclick=function(){$("dlgOne").close()};

$("fs").onclick=function(){if(!$("player")){var i=V.findIndex(function(v){return v.u.trim()});if(i<0)return;mount(i)}fullscreen();maxVolume();setTimeout(maxVolume,800)};

draw();
