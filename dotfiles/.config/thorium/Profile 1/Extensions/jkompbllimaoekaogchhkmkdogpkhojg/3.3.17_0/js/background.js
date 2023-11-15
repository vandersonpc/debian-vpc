var TaskManager=function(){var n=!1,t=[],u=1e3,i=function(){},f=null,a=function(t){f=setInterval((function(){n||e()}),t)},e=function(){if(t[0]){var n=t.shift().task;"function"==typeof n&&n()}else"function"==typeof i&&i()};return{init:function(n){u=n.interval,n.onEnd&&(i=n.onEnd),e(),a(u)},updateInterval:function(n){f&&clearInterval(f),a(n)},push:function(n,u){t[t.length-1];t.push({tabId:n,task:u})},unshift:function(n,u){t.unshift({tabId:n,task:u})},stop:function(){t=[],f&&clearInterval(f)},pause:function(){n=!0},unpause:function(){n=!1},filter:function(n){t=t.filter(n)}}}();
var App=function(){var e=!1,t=!1,n={showExtInfo:!0,showPopupByKeypress:!1,showTopRight:!1,hideSubrank:!0,hidePremium:!1,tmInterval:500},a={},s=!1,i=function(e){chrome.storage.local.get(null,(function(t){t.appStorage&&(a=t.appStorage),t.settings&&(n=t.settings),e(n)}))},o=function(){void 0===a.ab&&(a.ab=Math.ceil(100*Math.random()))},r=function(){var e={settings:n,appStorage:a};chrome.storage.local.set(e,(function(){}))},c=function(e,t){var n="img/off38.png";e&&(n="img/on38.png",t&&(n="img/on38dot.png")),chrome.action.setIcon({path:n})},u=function(){chrome.runtime.onMessage.addListener((function(i,o,u){var p,g=i.cmd,v=i.data,h=(o.tab||{}).id;if("app.get_state"===g)u({state:e,settings:n});else if("app.set_state"===g)p=v.state,e=!!p,a.enabled=e,c(e,!t),f(),r();else if("ab.get"===g)u(parseInt(a.ab));else if("settings.set"===g)!function(e){e.tmInterval&&e.tmInterval!==n.tmInterval&&TaskManager.updateInterval(e.tmInterval)}(v),function(e){for(var t in e)n[t]=e[t];r(),f()}(v);else if("new_tab"===g)chrome.tabs.create({url:v});else{if("add_ajax_task"===g){var b=v.url,I=v.priority;return l(h,b,I,u),!0}if("clear_tasks"===g)d(h);else if("tab.unloaded"===g)d(h),s===h&&(s=!1,TaskManager.unpause());else if("captcha.prompt"===g){if(TaskManager.pause(),s)return;s=h}else if("captcha.resolved"===g)s&&chrome.tabs.sendMessage(s,{cmd:"captcha.resolve"}),s=!1,tmpCap=!1,TaskManager.unpause();else if("tm.pause"===g)TaskManager.pause();else if("tm.unpause"===g)TaskManager.unpause();else if("notifications.get"===g){if(!e||Session.getVisit()<3)return void u(!1);for(var T=v,M={},k=0,S=T.length;k<S;k++){var w=T[k],y=a["notification"+w];M[w]=y||!1}u(M)}else if("notifications.later"===g){var x="notification"+v.id;a[x]=Date.now(),r()}else if("notifications.dismiss"===g){x="notification"+v.id;a[x]=!0,r()}else if("userdata.set"===g){for(var x in v)a["userdata."+x]=v[x];r()}else"clipboard.copy"===g?m(v):"discounts.seen"===g&&(a.discountsSeen=!0,r(),c(e,!1))}}))},f=function(){chrome.tabs.query({},(function(t){for(var a=0,s=t.length;a<s;a++)chrome.tabs.sendMessage(t[a].id,{cmd:"app.update_state",data:{state:e,settings:n}},(function(e){}))}))},l=function(e,t,n,a){TaskManager[n?"unshift":"push"](e,(function(){p(t,a)}))},d=function(e){TaskManager.filter((function(t){return t.tabId!==e}))},p=function(e,t){fetch(e,{method:"GET",mode:"cors",credentials:"include"}).then((function(e){if(!e.ok)throw e;return e})).then((function(e){return e.text()})).then((function(e){t&&t({error:!1,data:e})})).catch((function(e){"object"==typeof e&&e.message?t({error:!0,statusText:e.message}):e.text().then((function(t){var n={error:!0,status:e.status,statusText:t};cbProcessResponse(n)}))}))},m=function(e){var t=document.createElement("textarea");document.body.appendChild(t),t.value=e,t.focus(),t.select(),document.execCommand("Copy",!1,null),document.body.removeChild(t)};return{init:function(){i((function(){o(),e=void 0===a.enabled||a.enabled,t=void 0!==a.discountsSeen&&a.discountsSeen,n.tmInterval||(n.tmInterval=500),c(e,!t),u(),TaskManager.init({interval:n.tmInterval}),Session.init()}))}}}(),Session=function(){var e=1,t=Date.now(),n={},a=function(){n.visit=e,n.visitTimestamp=t,chrome.storage.local.set({sessionStorage:n})};return{init:function(){chrome.storage.local.get("sessionStorage",(function(s){(n=s.sessionStorage||{}).visit&&(e=parseInt(n.visit),t=parseInt(n.visitTimestamp)||Date.now()),a()}))},getVisit:function(){return Date.now()-t>432e5&&(t=Date.now(),e++,a()),e}}}();App.init();