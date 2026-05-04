/**
 * WebView 内嵌 Live2D（Cubism 4）查看器：Pixi 6 + pixi-live2d-display + Cubism Core。
 * 脚本自 CDN 加载，便于在 RN WebView 中快速验证 model3.json 是否可用。
 */

import { DEFAULT_LIVE2D_MODEL3_JSON_URL } from '../../constants/integrationDefaults';

/** 官方 redistributable Core（npm 镜像，仍需遵守 Live2D 许可）。 */
export const CUBISM_CORE_CDN =
  'https://cdn.jsdelivr.net/npm/live2dcubismcore@1.0.0/live2dcubismcore.min.js';

export const PIXI_CDN =
  'https://cdn.jsdelivr.net/npm/pixi.js@6.5.10/dist/browser/pixi.min.js';

export const PIXI_LIVE2D_CUBISM4_CDN =
  'https://cdn.jsdelivr.net/npm/pixi-live2d-display@0.4.0/dist/cubism4.min.js';

/** Haru 演示 model3（与 `integrationDefaults` 同源，便于旧代码引用）。 */
export const DEMO_MODEL3_URL = DEFAULT_LIVE2D_MODEL3_JSON_URL;

/** 与 loadHTMLString 的 baseUrl 一致：优先使用模型所在源，减少 WebView 下跨域页面加载纹理失败。 */
export function live2dWebViewBaseUrl(modelUrl: string): string {
  const t = modelUrl.trim();
  if (!t) return 'https://localhost/';
  try {
    const u = new URL(t);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') {
      return 'https://localhost/';
    }
    return `${u.origin}/`;
  } catch {
    return 'https://localhost/';
  }
}

export function buildLive2dPlaceholderHtml(): string {
  return `<!doctype html>
<html><head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1"/>
<style>
body{margin:0;background:#0b1220;color:#94a3b8;font-family:system-ui,sans-serif;
display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center;padding:16px;}
.h{color:#39c5bb;font-weight:600;margin-bottom:8px;}
</style></head><body>
<div><div class="h">Live2D</div>
<div>请在「设置」中填写 <b>model3.json</b> 的 HTTPS 地址。</div>
<div style="margin-top:10px;font-size:12px;opacity:.85">可先用演示地址测试资源是否可加载（见设置页占位提示）。</div></div>
<script>
(function(){
  function post(o){try{if(window.ReactNativeWebView&&window.ReactNativeWebView.postMessage)
    window.ReactNativeWebView.postMessage(JSON.stringify(o));}catch(e){}}
  post({type:'live2d-empty'});
})();
</script>
</body></html>`;
}

export function buildLive2dViewerHtml(modelUrl: string): string {
  const modelJson = JSON.stringify(modelUrl);
  const core = JSON.stringify(CUBISM_CORE_CDN);
  const pixi = JSON.stringify(PIXI_CDN);
  const pld = JSON.stringify(PIXI_LIVE2D_CUBISM4_CDN);

  return `<!doctype html>
<html><head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/>
<style>
html,body{margin:0;padding:0;width:100%;height:100%;overflow:hidden;background:#0b1220;}
#wrap{width:100%;height:100%;display:flex;align-items:center;justify-content:center;}
canvas{touch-action:none;max-width:100%;max-height:100%;}
#err{display:none;position:absolute;left:8px;right:8px;bottom:8px;color:#fecaca;
font-size:11px;background:rgba(0,0,0,.45);padding:8px;border-radius:8px;word-break:break-all;}
</style></head>
<body>
<div id="wrap"><canvas id="c"></canvas></div>
<div id="err"></div>
<script>
(function(){
  function normalizeModelUrl(u){
    try{
      var x=new URL(String(u||'').trim());
      if(x.hostname==='fastly.jsdelivr.net'){
        x.hostname='cdn.jsdelivr.net';
      }
      return x.toString();
    }catch(_){
      return String(u||'').trim();
    }
  }
  function post(o){try{if(window.ReactNativeWebView&&window.ReactNativeWebView.postMessage)
    window.ReactNativeWebView.postMessage(JSON.stringify(o));}catch(e){}}
  function showErr(msg){
    var el=document.getElementById('err');
    el.style.display='block';
    el.textContent=msg;
    post({type:'live2d-error',message:String(msg)});
  }
  function loadScript(src){
    return new Promise(function(resolve,reject){
      var s=document.createElement('script');
      s.src=src;
      s.onload=resolve;
      s.onerror=function(){reject(new Error('脚本加载失败: '+src));};
      document.head.appendChild(s);
    });
  }
  var MODEL_URL=${modelJson};
  var CORE=${core};
  var PIXI_URL=${pixi};
  var PLD=${pld};

  function resolveUrl(base, rel){
    try{return normalizeModelUrl(new URL(rel, base).toString());}catch(_){return normalizeModelUrl(rel);}
  }
  async function fetchSettings(modelUrl){
    var normalized=normalizeModelUrl(modelUrl);
    var r=await fetch(normalized,{method:'GET',mode:'cors',cache:'no-store'});
    if(!r.ok) throw new Error('模型 JSON 请求失败: '+r.status+' '+r.statusText);
    var json=await r.json();
    if(!json||typeof json!=='object') throw new Error('模型 JSON 非法');
    json.url=normalized;
    return json;
  }
  function preloadImage(url){
    return new Promise(function(resolve,reject){
      var img=new Image();
      img.crossOrigin='anonymous';
      img.onload=function(){resolve(url);};
      img.onerror=function(ev){
        var err=new Error('纹理预加载失败: '+url);
        err.event=ev;
        reject(err);
      };
      img.src=url;
    });
  }

  async function main(){
    if(!MODEL_URL||!MODEL_URL.trim()){
      showErr('模型地址为空');
      return;
    }
    try{
      await loadScript(CORE);
      if(typeof Live2DCubismCore==='undefined') throw new Error('Cubism Core 未就绪');
      await loadScript(PIXI_URL);
      if(typeof PIXI==='undefined') throw new Error('Pixi 未就绪');
      if(PIXI.settings){
        PIXI.settings.CREATE_IMAGE_BITMAP=false;
      }
      await loadScript(PLD);
      if(!PIXI.live2d||!PIXI.live2d.Live2DModel) throw new Error('pixi-live2d-display 未挂载到 PIXI.live2d');

      var normalizedModelUrl=normalizeModelUrl(MODEL_URL.trim());
      var settings=await fetchSettings(normalizedModelUrl);
      var textures=((settings.FileReferences&&settings.FileReferences.Textures)||[]);
      if(Array.isArray(textures)&&textures.length){
        var textureUrls=textures.map(function(tex){return resolveUrl(settings.url||normalizedModelUrl, String(tex));});
        for(var i=0;i<textureUrls.length;i++){
          try{
            await preloadImage(textureUrls[i]);
          }catch(preErr){
            // 预加载用于诊断；失败时继续走正式加载，避免误杀可加载模型。
            post({type:'live2d-warn',message:(preErr&&preErr.message)?String(preErr.message):String(preErr)});
          }
        }
      }

      var canvas=document.getElementById('c');
      var dpr=Math.min(window.devicePixelRatio||1,2);
      var w=Math.max(1,Math.floor(window.innerWidth));
      var h=Math.max(1,Math.floor(window.innerHeight));

      var app=new PIXI.Application({
        view:canvas,
        width:w,
        height:h,
        backgroundAlpha:0,
        antialias:true,
        resolution:dpr,
        autoDensity:true
      });

      var Live2DModel=PIXI.live2d.Live2DModel;
      Live2DModel.registerTicker(PIXI.Ticker);

      var model=await Live2DModel.from(settings,{
        crossOrigin:'anonymous',
        autoInteract:true
      });

      var sw=app.screen.width;
      var sh=app.screen.height;
      var mw=model.width||200;
      var mh=model.height||200;
      var sc=Math.min(sw*0.92/mw, sh*0.92/mh);
      model.scale.set(sc);
      model.anchor.set(0.5,0.5);
      model.position.set(sw/2, sh*0.52);
      app.stage.addChild(model);

      var motionList = [];
      try {
        var motionsDef =
          settings &&
          settings.FileReferences &&
          settings.FileReferences.Motions;
        if (motionsDef && typeof motionsDef === 'object') {
          motionList = Object.keys(motionsDef)
            .map(function (g) {
              var arr = motionsDef[g];
              var count = Array.isArray(arr) ? arr.length : 0;
              return { group: g, count: count };
            })
            .filter(function (x) {
              return x.count > 0;
            });
        }
      } catch (eCap) {
        motionList = [];
      }

      window.__mt_model = model;
      window.__mt_dispatch = function (payloadJson) {
        try {
          var cmd =
            typeof payloadJson === 'string'
              ? JSON.parse(payloadJson)
              : payloadJson;
          var mdl = window.__mt_model;
          if (!mdl || !cmd || cmd.kind !== 'motion') {
            return;
          }
          var idx =
            typeof cmd.index === 'number' && !isNaN(cmd.index) ? cmd.index : 0;
          mdl.motion(cmd.group, idx);
        } catch (err) {
          post({
            type: 'live2d-motion-error',
            message: String(err && err.message ? err.message : err),
          });
        }
      };

      post({ type: 'live2d-capabilities', motions: motionList });
      post({ type: 'live2d-loaded', modelUrl: MODEL_URL });

      function resize(){
        var nw=Math.max(1,Math.floor(window.innerWidth));
        var nh=Math.max(1,Math.floor(window.innerHeight));
        app.renderer.resize(nw,nh);
        var s2=Math.min(nw*0.92/mw, nh*0.92/mh);
        model.scale.set(s2);
        model.position.set(nw/2, nh*0.52);
      }
      window.addEventListener('resize',resize);

    }catch(e){
      var msg=e&&e.message?String(e.message):String(e);
      try{
        var ev=e&&e.event;
        var t=ev&&ev.target;
        if(t){
          if(t.src) msg+=' | src='+t.src;
          else if(t.currentSrc) msg+=' | src='+t.currentSrc;
        }
      }catch(_){}
      showErr(msg);
    }
  }
  main();
})();
</script>
</body></html>`;
}
