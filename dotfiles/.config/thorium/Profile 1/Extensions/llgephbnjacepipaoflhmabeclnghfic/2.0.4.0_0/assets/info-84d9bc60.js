import{r as s,a as e,j as r,f as i,W as l,c,R as h,q as m}from"./index-f8bdaf1e.js";import{e as a}from"./index-e08f5af8.js";import{T as d}from"./index-40632cd6.js";import"./_commonjsHelpers-725317a4.js";const u=s.forwardRef((o,t)=>{const{...n}=o;return e("div",{ref:t,...n,children:r(i,{style:{textAlign:"center"},children:[e(d,{title:"Test discarded",text:"We had to discard a recording test due to exceeding the maximum pause duration"}),e(a,{onClick:()=>window.close(),children:"Close"})]})})}),w=s.forwardRef((o,t)=>{const{...n}=o;return e("div",{ref:t,...n,children:r(i,{style:{textAlign:"center"},children:[e(d,{title:"Test not available",text:"We are sorry, this test is not available anymore."}),e(a,{onClick:()=>window.close(),children:"Close"})]})})}),f="_body_15vez_1",y={body:f};function b(){const o=window==null?void 0:window.location.hash.replace("#","");window.onhashchange=()=>{window.location.reload()};let t=null;switch(o){case"paused-too-long":t=e(u,{});break;case"test-not-available":t=e(w,{});break;default:t=e("div",{children:"Silence is golden."})}return r("div",{children:[e(l,{children:e("body",{className:y.body})}),t]})}c.createRoot(document.getElementById("root")).render(e(h.StrictMode,{children:e(m,{children:e(b,{})})}));