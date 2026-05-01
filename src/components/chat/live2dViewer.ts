/**
 * WebView 内嵌 Live2D（Cubism 4）查看器：Pixi 6 + pixi-live2d-display + Cubism Core。
 * 脚本自 CDN 加载，便于在 RN WebView 中快速验证 model3.json 是否可用。
 */

/** 官方 redistributable Core（npm 镜像，仍需遵守 Live2D 许可）。 */
export const CUBISM_CORE_CDN =
  'https://cdn.jsdelivr.net/npm/live2dcubismcore@1.0.0/live2dcubismcore.min.js';

export const PIXI_CDN =
  'https://cdn.jsdelivr.net/npm/pixi.js@6.5.10/dist/browser/pixi.min.js';

export const PIXI_LIVE2D_CUBISM4_CDN =
  'https://cdn.jsdelivr.net/npm/pixi-live2d-display@0.4.0/dist/cubism4.min.js';

/**
 * Haru 演示模型（pixi-live2d-display 仓库测试资源，仅用于联调）。
 * 使用固定 commit，避免 @master 漂移导致相对纹理路径 404。
 */
export const DEMO_MODEL3_URL =
  'https://cdn.jsdelivr.net/gh/guansss/pixi-live2d-display@31317b37d5e22955a44d5b11f37f421e94a11269/test/assets/haru/haru_greeter_t03.model3.json';

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

      var model=await Live2DModel.from(MODEL_URL.trim(),{
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

      function resize(){
        var nw=Math.max(1,Math.floor(window.innerWidth));
        var nh=Math.max(1,Math.floor(window.innerHeight));
        app.renderer.resize(nw,nh);
        var s2=Math.min(nw*0.92/mw, nh*0.92/mh);
        model.scale.set(s2);
        model.position.set(nw/2, nh*0.52);
      }
      window.addEventListener('resize',resize);

      post({type:'live2d-loaded',modelUrl:MODEL_URL});
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
