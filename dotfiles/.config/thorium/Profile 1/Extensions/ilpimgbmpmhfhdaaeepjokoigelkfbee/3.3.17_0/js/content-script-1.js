var Captcha=function(){var e,n=!1,t=null,a=function(){n=!1,t&&(t.remove(),t=null)},c=function(n){t||(t=$("<div/>").attr("id","xtaqv-captcha-root").addClass("xtaqv-vis-hidden").html(i(n)).appendTo($("body"))).find("a").click((function(n){n.preventDefault(),a(),chrome.runtime.sendMessage({cmd:"captcha.resolved"}),e&&e()}))},i=function(e){return['<div class="xtaqv-captcha-header">Amazon CAPTCHA prompt</div>',"<div>",'<iframe src="'+e+'"/>',"</div>",'<div class="xtaqv-captcha-continue">','You see this message because "DS Amazon Quick View" extension detected Amazon captcha request. Please solve the captcha to continue extension working.','<a href="#">Close this window.</a>',"</div>"].join("\n")};return{init:function(n){e=n.onResolved},findHTML:function(e){return-1!==e.indexOf("validateCaptcha")},find:function(){return!!document.querySelector("#captchacharacters")},process:function(e,t){n||(n=!0,chrome.runtime.sendMessage({cmd:"captcha.prompt",data:{url:t}}),c(t))},reveal:function(){t&&t.removeClass("xtaqv-vis-hidden")},resolve:a}}();
window.parent!==window&&(Captcha.find()?window.parent.postMessage({cmd:"xtaqv-premium.captcha_reveal",data:""},"*"):chrome.runtime.sendMessage({cmd:"captcha.resolved",data:{}}));