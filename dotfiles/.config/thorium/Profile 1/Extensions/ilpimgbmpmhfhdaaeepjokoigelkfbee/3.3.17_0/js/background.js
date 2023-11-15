var Cache=function(){var e={},t=function(){var t=0,n=Date.now();for(var o in e)console.log(o),n-e[o].timestamp>6e4&&(delete e[o],t++);console.log("cleared",t)};return{get:function(t){var n=Date.now();return e[t]&&n-e[t].timestamp<=6e4?e[t].response:(delete e[t],!1)},set:function(t,n){var o=Date.now();e[t]&&o-e[t].timestamp<=6e4||(e[t]={timestamp:Date.now(),response:n})},init:function(){setInterval((function(){t()}),3e4)}}}();
var Captcha=function(){var e,n=!1,t=null,a=function(){n=!1,t&&(t.remove(),t=null)},c=function(n){t||(t=$("<div/>").attr("id","xtaqv-captcha-root").addClass("xtaqv-vis-hidden").html(i(n)).appendTo($("body"))).find("a").click((function(n){n.preventDefault(),a(),chrome.runtime.sendMessage({cmd:"captcha.resolved"}),e&&e()}))},i=function(e){return['<div class="xtaqv-captcha-header">Amazon CAPTCHA prompt</div>',"<div>",'<iframe src="'+e+'"/>',"</div>",'<div class="xtaqv-captcha-continue">','You see this message because "DS Amazon Quick View" extension detected Amazon captcha request. Please solve the captcha to continue extension working.','<a href="#">Close this window.</a>',"</div>"].join("\n")};return{init:function(n){e=n.onResolved},findHTML:function(e){return-1!==e.indexOf("validateCaptcha")},find:function(){return!!document.querySelector("#captchacharacters")},process:function(e,t){n||(n=!0,chrome.runtime.sendMessage({cmd:"captcha.prompt",data:{url:t}}),c(t))},reveal:function(){t&&t.removeClass("xtaqv-vis-hidden")},resolve:a}}();
var TaskManager=function(){var n=!1,t=[],u=1e3,i=function(){},f=null,a=function(t){f=setInterval((function(){n||e()}),t)},e=function(){if(t[0]){var n=t.shift().task;"function"==typeof n&&n()}else"function"==typeof i&&i()};return{init:function(n){u=n.interval,n.onEnd&&(i=n.onEnd),e(),a(u)},updateInterval:function(n){f&&clearInterval(f),a(n)},push:function(n,u){t[t.length-1];t.push({tabId:n,task:u})},unshift:function(n,u){t.unshift({tabId:n,task:u})},stop:function(){t=[],f&&clearInterval(f)},pause:function(){n=!0},unpause:function(){n=!1},filter:function(n){t=t.filter(n)}}}();
var Gumroad=function(){var e="",r=0,t="",o={},n=function(e){chrome.storage.local.get("gumroad",(function(e){e.gumroad&&(r=e.gumroad.ts,o=e.gumroad.res,t=e.gumroad.key)}))},a=function(r){return new Promise((function(t,o){r||o({error:!0,data:"No license key specified"}),e||o({error:!0,data:"Empty product id"});fetch("https://dmitry.artamoshkin.com/ds/license.php",{method:"POST",mode:"cors",body:new URLSearchParams({license_key:r})}).then((function(e){if(!e.ok)throw e;return e})).then((function(e){return e.text()})).then((function(e){console.log(e);try{json=JSON.parse(e)}catch(e){json=response}var o=s(json,r);t(o)})).catch((function(e){if("object"==typeof e&&e.message)o({error:!0,data:e.message});else if("object"==typeof e&&e.status){var r={error:!0,data:"Error: "+e.status+" "+e.statusText};o(r)}}))}))},s=function(e,n){if(!e.success)return{error:!0,data:e.message};var a={error:!1,data:e};return function(e,n){r=Date.now(),o=n,t=e,chrome.storage.local.set({gumroad:{ts:r,res:o,key:t}})}(n,a),a};return{init:function(r){r.productId&&(e=r.productId),n()},get:function(e){return Date.now()-r<1728e5&&e===t?Promise.resolve(o):a(e)},verify:a}}();
var App=function(){var e=!1,t={showExtInfo:!0,showPopupByKeypress:!1,showTopRight:!1,showFilters:!1,showFiltersOnTop:!1,hideSubrank:!1,tmInterval:100,hidePrime:!1,hideSoldByAmazon:!1,hideSponsored:!1,hideNoBB:!1,showBBHolder:!0,infiniteScroll:!1,filterRankMin:-1,filterRankMax:-1,filterPriceMin:-1,filterPriceMax:-1,filterFBASelMin:-1,filterFBASelMax:-1,filterReviewsMin:0,filterReviewsMax:-1,filterRatingMin:0,filterHidePrime:!1,filterHideSponsored:!1,filterHideSoldByAMZ:!1,filterHideNoBB:!1},n={},i={},a=!1,s="",o=function(e){chrome.storage.local.get(null,(function(t){t.appStorage&&(i=t.appStorage),t.settings&&(n=t.settings),e(n)}))},r=function(){var e={settings:n,appStorage:i};chrome.storage.local.set(e,(function(){}))},c=function(e){var t="img/off38.png";e&&(t="img/on38.png"),chrome.action.setIcon({path:t})},u=function(){chrome.runtime.onMessage.addListener((function(s,o,u){var p,g=s.cmd,h=s.data,v=(o.tab||{}).id;if("app.get_state"===g)Session.getVisitCount(),u({state:e,license:"ok",settings:n,visitTimestamp:Session.getVisitTimestamp()});else if("app.set_state"===g)p=h.state,e=!!p,i.enabled=e,c(e),f(),r();else if("settings.set"===g)!function(e){e.tmInterval&&e.tmInterval!==n.tmInterval&&TaskManager.updateInterval(e.tmInterval)}(h),function(e){for(var t in e)n[t]=e[t];r(),f()}(h);else if("settings.reset-filters"===g){u(function(){var e={};for(var i in t)0===i.indexOf("filter")&&(e[i]=t[i],n[i]=t[i]);return r(),e}())}else if("new_tab"===g)chrome.tabs.create({url:h});else{if("add_ajax_task"===g){var M=h.url,T=h.priority,S=Cache.get(M);return S?u(S):l(v,M,T,u),!0}if("clear_tasks"===g)d(v);else if("tab.unloaded"===g)d(v),a===v&&(a=!1,TaskManager.unpause());else if("captcha.prompt"===g){if(TaskManager.pause(),a)return;a=v}else if("captcha.resolved"===g)a&&chrome.tabs.sendMessage(a,{cmd:"captcha.resolve"}),a=!1,TaskManager.unpause();else if("tm.pause"===g)TaskManager.pause();else if("tm.unpause"===g)TaskManager.unpause();else{if("gumroad.get"===g)return(h.nocache?Gumroad.verify(h.key):Gumroad.get(h.key)).then(u).catch(u),!0;if("notifications.get"===g){if(Session.getVisitCount()<3)return void u(!1);for(var k=h,b={},w=0,y=k.length;w<y;w++){var I=k[w],x=i["notification"+I];b[I]=x||!1}u(b)}else if("notifications.later"===g){var B="notification"+h.id;i[B]=Date.now(),r()}else if("notifications.dismiss"===g){B="notification"+h.id;i[B]=!0,r()}else"clipboard.copy"===g&&m(h)}}}))},f=function(){chrome.tabs.query({},(function(t){for(var i=0,a=t.length;i<a;i++)chrome.tabs.sendMessage(t[i].id,{cmd:"app.update_state",data:{state:e,license:s,settings:n}},(function(e){}))}))},l=function(e,t,n,i){TaskManager[n?"unshift":"push"](e,(function(){p(t,(function(e){!e.error&&Captcha.findHTML(e.data),i(e)}))}))},d=function(e){TaskManager.filter((function(t){return t.tabId!==e}))},p=function(e,t){fetch(e,{method:"GET",mode:"cors",credentials:"include"}).then((function(e){if(!e.ok)throw e;return e})).then((function(e){return e.text()})).then((function(e){t&&t({error:!1,data:e})})).catch((function(e){"object"==typeof e&&e.message?t({error:!0,statusText:e.message}):e.text().then((function(t){var n={error:!0,status:e.status,statusText:t};cbProcessResponse(n)}))}))},m=function(e){var t=document.createElement("textarea");document.body.appendChild(t),t.value=e,t.focus(),t.select(),document.execCommand("Copy",!1,null),document.body.removeChild(t)};return{init:function(){o((function(){for(var a in e=void 0===i.enabled||i.enabled,t)void 0===n[a]&&(n[a]=t[a]);c(e),Gumroad.init({key:n.license,productId:"oBQaa"}),u(),TaskManager.init({interval:n.tmInterval}),Session.init()}))}}}(),Session=function(){var e=1,t=Date.now(),n={},i=function(){n.visitCount=e,n.lastVisitTS=t,chrome.storage.local.set({sessionStorage:n})};return{init:function(){chrome.storage.local.get("sessionStorage",(function(a){(n=a.sessionStorage||{}).visitCount&&(e=parseInt(n.visitCount),t=parseInt(n.lastVisitTS)||Date.now()),i()}))},getVisitCount:function(){return Date.now()-t>432e5&&(t=Date.now(),e++,i()),e},getVisitTimestamp:function(){if(!n.visitTimestamp)return"";var e=parseInt(n.visitTimestamp);return e>16121664e5?"":e}}}();App.init();