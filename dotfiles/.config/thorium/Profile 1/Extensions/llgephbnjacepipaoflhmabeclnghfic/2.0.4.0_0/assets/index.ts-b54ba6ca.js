import{b as s}from"./browser-polyfill-6188a4ed.js";import{j as M,k as h,o as g,l as f,e as v,m,n as b,p}from"./index-58ca6142.js";import"./_commonjsHelpers-725317a4.js";function S(e){e.reason==="install"&&(s.storage.local.set({"preferred-audio-device-id":"default"}),s.tabs.create({url:"installed.html"}))}function _(e,r,t){return M().then(()=>{t({success:!0})}).catch(a=>{t({success:!1,error:a.toString()})}),!0}function T(e,r,t){const{name:a,code:i,email:l}=e;return fetch("https://tester.userbrain.com/api/2.0/invitation",{method:"POST",headers:h,body:g({email:l,name:a,code:i})}).then(o=>o.json()).then(o=>{var c;((c=o==null?void 0:o[0])==null?void 0:c.status)==="success"?t({success:!0,test:o[1]}):t({success:!1,error:f(o)})}).catch(o=>{t({success:!1,error:o.toString()})}),!0}async function d(){try{const e=await v("/tests"),r=e==null?void 0:e.find(t=>{var a;return((a=t.devices)==null?void 0:a.desktop)===!0});await s.storage.local.set({testsAvailable:r?!0:null})}catch{await s.storage.local.set({testsAvailable:null})}}async function u(){const{badgeStatus:e,testsAvailable:r}=await s.storage.local.get(["badgeStatus","testsAvailable"]);e?m(e.text??"",e.textColor??p,e.backgroundColor??b):m(r?"1":"",p,b)}function j(e,r,t){const{username:a,password:i}=e;return fetch("https://tester.userbrain.com/oauth/token/tester",{method:"POST",headers:h,body:g({grant_type:"password",client_id:2,client_secret:"uZEOPtnPU5Ul9sMdiH2TFTijjCMjJyv2cfyBKsjy",username:a,password:i,scope:"*"})}).then(n=>n.json()).then(n=>{if(n.access_token){const o={username:a,token:n,token_expires_at:Date.now()+n.expires_in*1e3};s.storage.local.set({user:o}).then(()=>{t({success:!0}),s.runtime.sendMessage({type:"refresh-globals"}),d().then(()=>{u()})})}else t({success:!1,errorMessage:f(n)})}).catch(n=>{t({success:!1,error:n.toString()})}),!0}function x(e,r,t){return s.storage.local.set({user:null}).then(()=>{t({success:!0}),s.runtime.sendMessage({type:"refresh-globals"}),d().then(()=>{u()})}),!0}function w(e,r,t){return s.storage.local.get("user").then(a=>{var n;const{user:i}=a,l=(n=i==null?void 0:i.token)==null?void 0:n.refresh_token;l?fetch("https://tester.userbrain.com/oauth/token/tester",{method:"POST",headers:h,body:g({grant_type:"refresh_token",client_id:2,client_secret:"uZEOPtnPU5Ul9sMdiH2TFTijjCMjJyv2cfyBKsjy",refresh_token:l,scope:"*"})}).then(c=>c.json()).then(c=>{c.access_token?s.storage.local.set({user:{...i,token:c,token_expires_at:Date.now()+c.expires_in*1e3}}).then(()=>{t({success:!0}),s.runtime.sendMessage({type:"refresh-globals"})}):t({success:!1,errorMessage:f(c)})}).catch(c=>{t({success:!1,error:c.toString()})}):t({success:!1,errorMessage:"No refresh token found"})}),!0}function B(e,r,t){s.storage.local.remove("badgeStatus").then(()=>{u()})}function A(e,r,t){s.notifications.create("",{priority:e.priority??0,iconUrl:e.iconUrl??"images/icon-128.png",type:e.notificationType??"basic",title:e.title,message:e.message})}let y;function C(e,r,t){const{backgroundColor:a,textColor:i,text:l}=e;clearTimeout(y),s.storage.local.set({badgeStatus:{backgroundColor:a,textColor:i,text:l}}),y=setTimeout(()=>{s.storage.local.remove("badgeStatus").then(()=>{u()})},3e3),u()}function L(e,r,t){switch(e.type){case"login":return j(e,r,t);case"logout":return x(e,r,t);case"refresh-access-token":return w(e,r,t);case"invitation":return T(e,r,t);case"dev-reset":return _(e,r,t);case"set-badge":return C(e);case"reset-badge":return B();case"send-notification":return A(e)}}s.runtime.onMessage.addListener(L);s.runtime.onInstalled.addListener(S);function k(){s.storage.local.remove("badgeStatus").then(()=>{d().then(()=>{u()})}),s.alarms.create("check-available-tests",{delayInMinutes:30,periodInMinutes:30})}s.runtime.onStartup.addListener(()=>{k()});s.runtime.onInstalled.addListener(()=>{k()});chrome.alarms.onAlarm.addListener(e=>{e.name==="check-available-tests"&&d().then(()=>{u()})});
