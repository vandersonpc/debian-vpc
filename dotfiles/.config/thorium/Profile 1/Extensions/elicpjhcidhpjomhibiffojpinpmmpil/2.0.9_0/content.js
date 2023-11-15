
setTimeout(function(){  sendAllLinks()  }, 300);
setInterval(function(){  sendAllLinks()  }, 500);

function isForbidden()
{   
    if (!document.location.href)
        return false;
	if (document.location.protocol != "https:")
        return true; // Not Allowed
    // Only for chromecast links
    if (document.location.hostname.endsWith(".youtube.com"))
        return true; // Not Allowed
	if (document.location.hostname.endsWith("tiktok.com"))
        return true; // Not Allowed
	if (document.location.hostname.endsWith("instagram.com"))
        return true; // Not Allowed
	if (document.location.hostname.endsWith("vk.com"))
        return true; // Not Allowed
	if (document.location.hostname.endsWith("dailymotion.com"))
        return true; // Not Allowed
	return false;
}

var oembedUrl=false;
var lastUrl = false;
var allUrlsList = [];
var loadedUrlsList = [];
function sendAllLinks()
{
	var url = document.location.href;

	
	if (lastUrl != url) 
	{
		if ( isForbidden())
		{
			//console.log("Forbidden site");
			return;
		}
		var title = document.title;
		lastUrl = url;
		chrome.runtime.sendMessage({ msg: "msgSetUrl" }, function (response)
		{
			if (typeof (response) == 'undefined' && chrome.runtime.lastError)
				return;
		    if ( response)
		    {
				if ( document.location.href.indexOf("vimeo.com")>=0)
                    findVimeoVideos(response.tabId);
                else
					scanPage( response.tabId);		        
            }
		} );
    }								
}

function scanPage( tabId ) 
{
    
	var url = document.location.href;
	allUrlsList = [];

	var html = document.documentElement.outerHTML;
	
	/*var i = html.indexOf("HTML5Player");
	if ( i>0)
		html =html.substr(i); 
*/
	for (var j = 0; j < 4; j++) {
		var ext = j == 3 ? "m3u8" :j == 2 ? "mov" : j == 1 ? "flv" : "mp4";
	    for (var i = 0; ;) {
			
	        var o = FindFirstUrl(html, "."+ext, i);
	        if (!o || !o.start)
	            break;
	        i = o.start;
			
			var ob = { 'url': o.mp4, 'title': document.title, 'type': j==3?"m3u8":"video" }
			if ( ob.url.indexOf(".m3u8") != -1)
			{
				ob.noDL = "m3u8";
				
			}
			ob.mime = "video/"+ext;
			
			addOnce( allUrlsList, ob);
	    }
	}

	for (var i = 0; i < document.links.length; i++) 
	{
	    var link =  document.links[i];
	    var u = isSupportedUrl(link.href);
		if ( u) 
		{
			var title = '';
			if (link.hasAttribute('title')) 
				title = myTrim(link.getAttribute('title'));
			if (!title && link.hasAttribute('alt')) 
				title = myTrim(link.getAttribute('alt'));
			if (!title) 
				title = myTrim(link.innerText);
				
	        if (!title) 
	            title=document.title;
			var cl = "";
			if (link.hasAttribute('class')) 
				cl = myTrim(link.getAttribute('class'));
			
			var ob = {'url': u,'title': title,'class': cl,'id': (link.id ? link.id : ""),'value': '','type': 'extern'};
			addOnce( allUrlsList, ob);
		}			
    }
			
    type="video";
    a = document.getElementsByTagName('video');
    for (var i = 0; i < a.length; i++) 
    {
        var link = a[i];
        var u = false;
	    if (link.src) 
	        u = link.src;
	    if (!u && link.hasAttribute('data-thumb'))
	    {
		    u = myTrim(link.getAttribute('data-thumb'));
		    if (u.indexOf("http") == -1) 
		        u = "http:" + u;
	    }	
	    var u = isSupportedUrl(u);
	    if ( u) 
	    {
		    var title = '';
		    if (link.hasAttribute('alt')) 
			    title = myTrim(link.getAttribute('alt'));
		    else if (link.hasAttribute('title')) 
			    title = myTrim(link.getAttribute('title'));
			if (!title) 
	            title=document.title;
		    var cl = "";
		    if (link.hasAttribute('class')) 
			    cl = myTrim(link.getAttribute('class'));
			    
		    addOnce( allUrlsList, {'url': u,'title': title, 'type': type});
	    }			
	}
	
	if ( tabId != -1)
	{
		var fGreenArrow = false;
		if ( allUrlsList.length>0)
			fGreenArrow = true;

		if ( !oembedUrl)
			oembedUrl = getOembedURL(); 
		if ( oembedUrl != false)
			fGreenArrow = true;

		if ( fGreenArrow)
		{
			chrome.runtime.sendMessage({ "msg": "msgSetIcon", "tabId": tabId, "fVideo": true}, function (response) { 
				if (typeof (response) == 'undefined' && chrome.runtime.lastError)
						return;
			});
		}
		/*chrome.runtime.sendMessage({ "msg": "msgAddLinks", "tabId": tabId, "url": url, "link": allUrlsList }, function (response) { 
			if (typeof (response) == 'undefined' && chrome.runtime.lastError)
					return;
		});*/
	}
}
   
function myTrim(txt) 
{
	if ( !txt) 
	    return '';
	return txt.replace(/^[\s_]+|[\s_]+$/gi, '').replace(/(_){2,}/g, "_");
}
		
function isSupportedUrl( url) 
{
    if ( !url || !url.toLowerCase)
        return false;
	if ( (url.toLowerCase().indexOf('javascript:') != -1) || (url.toLowerCase().indexOf('javascript :') != -1) )
	    return false;
	if ( (url.toLowerCase().indexOf('mailto:') != -1) || (url.toLowerCase().indexOf('mailto :') != -1) )
	    return false;
	if (url.indexOf("data:image") != -1)  
	    return false;
    if ( (url.indexOf(".mp4") == -1) && (url.indexOf(".flv") == -1) && (url.indexOf(".mov") == -1))
        return false;
	return url;
}


function OnAddToVideoList(info, play) {
    var info = JSON.parse(info.info);
    if (!info.title) {
        info.title = document.title; 
    }
    if (typeof (info.thumbnail_url) == "string") {
        if (info.thumbnail_url.indexOf("//") == 0) {
            info.thumbnail_url = "http:" + info.thumbnail_url;
        }
    }
    //console.log("ADD video");
    //console.log("URL:" + location.href);
    //console.log("Title:" + info.title);
    chrome.runtime.sendMessage({ msg: "msgAddToVideolist", info: info, url: location.href, play: play }, function (response) { 
				if (typeof (response) == 'undefined' && chrome.runtime.lastError)
					return;
			});
}

function checkStatus(response) {
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} - ${response.statusText}`);
  }
  return response;
}

/*
async function  trackDownloadingOnXHR(url, filename) {
  let xhr = new XMLHttpRequest();
  xhr.open("GET", url);
  
  var div = document.createElement("div");
  div.style.position = "fixed";
  div.style.right  = "10px";
  div.style.width  = "200px";
  div.style.top  = "10px";
  div.style.height  = "70px";
  div.style.background  = "#ff0";
  div.style.zIndex = "99999999";
  document.body.appendChild(div);
  
  var txt = document.createElement("p");
  txt.style.color  = "#000";
  txt.textContent = "Downloading video...";
  div.appendChild(txt);
  txt = document.createElement("p");
  txt.style.color  = "#000";
  txt.textContent = "please wait";
  txt.id = "idProgress566578";
  div.appendChild(txt);
  
  xhr.onprogress = event => {
	  var perc = parseInt(event.loaded*1000 / event.total)/10;
	  var mb  = parseInt(event.loaded/1024*10)/10;
	  var txt = document.getElementById("idProgress566578");
	  txt.textContent = "Received "+mb+"MB ("+perc+"%)";
    console.log(`Received ${event.loaded} of ${event.total}`); 
  };
  
  xhr.onload = () => {
    if(xhr.status != 200 || !xhr.response) {
      console.log(`Error ${xhr.status}: ${xhr.statusText}`);
    } else {
		console.log(`Success  ${xhr.status}: ${xhr.statusText}`);
    }
	document.body.removeChild(div);
  };

  xhr.send();
}
*/
async function myFetch( url,filename)
{

  var div = document.createElement("div");
  div.style.position = "fixed";
  div.style.right  = "10px";
  //div.style.width  = "200px";
  div.style.padding = "5px 10px";
  div.style.top  = "10px";
  //div.style.height  = "70px";
  div.style.background  = "#eee";
  div.style.border = "1px solid #333"
  div.style.zIndex = "99999999";
  
  document.body.appendChild(div);
  
  var txt = document.createElement("p");
  txt.style.color  = "#333";
  txt.textContent = chrome.i18n.getMessage("downloading");
  txt.style.fontSize = "12px";
  txt.style.fontWeight = "bold";
  div.appendChild(txt);
  var txt = document.createElement("p");
  txt.style.color  = "#333";
  txt.textContent = chrome.i18n.getMessage("downloading2");
  txt.style.fontSize = "10px";
  div.appendChild(txt);
  txt = document.createElement("p");
  txt.style.color  = "#333";
  txt.style.fontSize = "12px";
  txt.textContent = chrome.i18n.getMessage("wait");
  txt.id = "idProgress566578";
  div.appendChild(txt);
  
  
	// Step 1: start the fetch and obtain a reader
	let response = await fetch(url);

	const reader = response.body.getReader();

	// Step 2: get total length
	const contentLength = +response.headers.get('Content-Length');

	// Step 3: read the data
	let receivedLength = 0; // received that many bytes at the moment
	let chunks = []; // array of received binary chunks (comprises the body)
	while(true) {
	  const {done, value} = await reader.read();

	  if (done) {
		break;
	  }

	  chunks.push(value);
	  receivedLength += value.length;

	  var perc = parseInt(receivedLength*1000 / contentLength)/10;
	  var mb  = parseInt(receivedLength/1024*10/1024)/10;
	  var txt = document.getElementById("idProgress566578");
	  var t = chrome.i18n.getMessage("downloading3").replace("0",mb+" ");
	  txt.textContent = t+" ("+perc+"%)";  
	  //console.log("*Received ${receivedLength} of ${contentLength}")
	}

	// Step 4: concatenate chunks into single Uint8Array
	let blob = new Blob(chunks);
	console.log("save");
	const link = document.createElement("a");
	link.href = URL.createObjectURL(blob);
	link.download = filename;
	link.click();	
	document.body.removeChild(div);
}



async function getContentLengthOld(url, sendResponse)
{
	let response = await fetch(url);
	const reader = response.body.getReader();
	// Step 2: get total length
	const contentLength = +response.headers.get('Content-Length');
	//console.log("getlength "+contentLength+ "   "+sendResponse);
	sendResponse({ "len":contentLength});
}
function getContentLength(url, idcontrol)
{//alert("send Reponse kommt nicht an, da async");
	fetch(url).then(response => {
		const reader = response.body.getReader();
		// Step 2: get total length
		const contentLength = +response.headers.get('Content-Length');
		//console.log("getlength "+contentLength+ "   "+idcontrol);
		chrome.runtime.sendMessage({msg:"msgReturnContentLength",len:contentLength,idcontrol:idcontrol}, function (response) { 
			if (typeof (response) == 'undefined' && chrome.runtime.lastError)
			return;
		});  
	});
}

function addOnce( a, item)
{
	for ( var i = 0;i < a.length; i++)
	{
		if (a[i].url == item.url)
		{
			if ( a[i].len < item.len)
				a[i] = item;
			return;
		}
	}
	a.push(item);
}

chrome.runtime.onMessage.addListener(

  function (request, sender, sendResponse) 
  {
		if (sender.id != chrome.runtime.id)  // Accept only messages from our extension
          return;

		if (request.id == "msgAddToList") // Video gefunden von background.js
		{
			var item = request.item;
			if ( !item.title || item.title.length==0)
				item.title = document.title;		
			addOnce( loadedUrlsList, item);
			console.log("Video from background.js: "+JSON.stringify(item));
			return;
		}
		else if (request.id == "msgGetAllVideos")
		{
			if ( document.location.href.indexOf("vimeo.com")>=0)
				findVimeoVideos(-1); //Das ist async
			else
				scanPage( -1);
			var a = [];
			for ( var i = 0; i < loadedUrlsList.length; i++)
			{
				addOnce(a, loadedUrlsList[i]);
			}
			for ( var i = 0; i < allUrlsList.length; i++)
			{
				addOnce(a, allUrlsList[i]);
			}
			sendResponse({ "videoUrls":a, "oembed": (oembedUrl!=false), "txt": "ergebnis"});
		}
		else if (request.id == "msgGetLength") {
//console.log("getlength "+request.url);
			getContentLength(request.url, request.idcontrol);		
//sendResponse({ "len":4546654});			
			return;
		}
		else if (request.id == "msgDownload") {		 
			 
			if ( document.getElementById("idProgress566578"))
			{
				alert( "Please wait while the current download is finished");
				return;
			}
			//if ( confirm(request.txt))		
				
			console.log("Download "+request.url);
			myFetch( request.url,request.filename);
			//trackDownloadingOnXHR(request.url);
			return;
		 
				/*
			fetch(request.url)
			.then(response => response.blob())			
			.then(blob => {
					console.log("len_b:" + blob.byteLength);
			   const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = request.filename;
      link.click();	
			   
			})
			.catch(err => console.log(err)); // Never forget the final catch!
			*/
	
/*
  fetch(request.url)
    .then(response => response.blob())
    .then(blob => {

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = request.filename;
      link.click();
  })
  .catch(console.error);



				var a = document.createElement('a');
				a.setAttribute('href', request.url);
				//a.setAttribute('target', '_blank');// ###Edge only
				//a.setAttribute('download', request.filename);
				a.style.display = 'none';
				document.body.appendChild(a);			
				a.click();	
				document.body.removeChild(a);
				 			
				*/
			
			
	  }
	   
	   
	   
		/*else if (request.id == "SP24GetOEmbedUrl") {          
          var url = getOembedURL(); 
          sendResponse({ available: url });
          return; 
      }	  
	  */
      else if (request.id == "msgAddToVideolist") { // oembed
          var url = getOembedURL();
          var play = request.play; 
          if (!url) {
              sendResponse({ info: false, error: "no oembed url available on "+ location.href });
              return; 
          }
		  //sendResponse({ info: false, error: "no oembed url available on "+ location.href });
		  //return;
          getOembedInfo(url, function (response) {
				var info = JSON.parse(response.info);
				if ( info)
				{
					info.video_url = url;
					if (!info.title)
						info.title = document.title; 
					if (typeof (info.thumbnail_url) == "string") {
						if (info.thumbnail_url.indexOf("//") == 0) {
							info.thumbnail_url = "https:" + info.thumbnail_url;
						}
					}
				}
				else	
					info = response; // Pass the error
				info.originalUrl = location.href; 
				chrome.runtime.sendMessage({msg:"msgOembedInfos",info:info}, function (response) { 
					if (typeof (response) == 'undefined' && chrome.runtime.lastError)
					return;
				});
				
				//sendResponse(info);  
              //OnAddToVideoList(response, play);               
          });
      }
  });

function getOembedURL() {
    var url = location.href; 
    if (url.match("^https?:\/\/(?:www\.)?youtube.com\/watch\?")) {		
		//alert(document.location.protocol+"    "+document.location.hostname);
        return document.location.protocol+'//'+document.location.hostname+'/oembed?url=' + encodeURIComponent(url) + '&format=json';
    }
    var all = document.getElementsByTagName("link");
    for (var i = 0, max = all.length; i < max; i++) {
        var type = all[i].type;
        if (typeof (type) == "undefined") {
            continue; 
        }
        if (type.indexOf("application/json+oembed") != -1) {
            return all[i].href; 
        }
    }
    //console.log("NO OEMBED");
    return false; 
}

function getOembedInfo(url, callback) {
    
    if (url.indexOf(location.protocol) != 0) {
        url = location.protocol + url.replace(/^https?:/, '')
    }
    //console.log("getOembedInfo:" + url);

    if (!document.location.href) {
        //console.log("no location available");
        callback({ info: false, error: "no location available" });
        return;
    }
    var xhr = new XMLHttpRequest();
    xhr.onerror = function (e) {
        //console.log("Error onerror: " + e.target.status);
        callback({ info: false, error: e.target.status });
        return; 
    };
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            if (xhr.status >= 200 && xhr.status < 300) {
                //console.log("info received:", xhr.responseText)
                callback({ info: xhr.responseText, error: false });
            } else {
                //console.log("Error state:", xhr.statusText)
                callback({ info: false, error: xhr.status+" "+xhr.statusText });
            }
        }
    }
    xhr.send();
}

function FindFirstUrl(html, ext, start) {

    for (; ;) {
        var i = html.indexOf(ext, start)
        if (i < 0)
            return false;
        start = i + ext.length;
        var i1 = html.indexOf('\"', i);
        var i2 = html.indexOf('\'', i);
        var c = false;
        if (i1 > i && i2 > i) {

            c = i1 > i2 ? "\'" : "\"";
            if (i1 > i2)
                i1 = i2;
        }
        else if (i1 > i) {
            c = "\"";

        }
        else if (i2 > i) {
            c = "\'";
            i1 = i2;
        }
        else
            continue;

		var i0 = i1>600?i1-600:0;		
        var s = html.substr(i0, i1-i0);
        i2 = s.lastIndexOf(c);
        if (i2 < 0)
            continue;
        s = s.substr(i2 + 1);
        if (s.indexOf("http://") == 0 || s.indexOf("https://") == 0)
            return { mp4: s, start: i1 };
        if (s.indexOf("http:\\/\\/") == 0 || s.indexOf("https:\\/\\/") == 0) {
            s = s.replace(/\\\//g, '\/');
            return { mp4: s, start: i1 };
        }
		
		var server = document.location.protocol+"//"+document.location.hostname;
		
		if (s.indexOf("/") == 0)
            return { mp4: server+s, start: i1 };
		if (s.indexOf("\\/") == 0)
		{
			s = s.replace(/\\\//g, '\/');
            return { mp4: server+s, start: i1 };
		}
		
		if ( ext ==".m3u8" && (s.indexOf("\\/") == 0 || s.indexOf("/") == 0)) {
            s = s.replace(/\\\//g, '\/');
            return { mp4: s, start: i1 };
        }
        continue;
    }
}

//for Vimeo:
function FindFirstUrl_Vimeo(html, ext, i2)
{
	while(1)
	{
		var i1 = html.indexOf( ext, i2);
		if ( i1<0)
			return false;
		var i2 = i1;
		i2+=ext.length;
		var l = html.length;
		while ( i1>0 && html.charAt(i1) != '"' && html.charAt(i1) != '\'' && html.charAt(i1) != '>')
		{
			i1--;
		}
		if ( html.charAt(i1) == '>')
		{
			while ( i2<l && html.charAt(i2) != '<')
			{
				i2++;
			}
		}
		else
		{
			while ( i2<l &&  html.charAt(i2) != '"' &&  html.charAt(i2) != '\'')
			{
				i2++;
			}
		}
		i1++;
		if ( html.substr(i1,7)== "http://" || html.substr(i1,8)== "https://" || html.substr(i1,4)== "www." || html.substr(i1,5)== "/www.")
		{
		    return [i2,html.substr(i1,i2-i1)]
		}
		else if ( html.substr(i1,9) == "http:\\/\\/" || html.substr(i1,10) == "https:\\/\\/")
		{
			var s = html.substr(i1,i2-i1);
			s = s.replace( /\\\//g, "/");
			return [i2,s];
		}
		if ( i2 <= i1)
			break;
	}
	return false;
}

function findVimeoVideos(tabId) 
{
    if ( document.location.href.indexOf("vimeo.com")<0)
        return;
        
    var xmlHttpReq = new XMLHttpRequest();
    xmlHttpReq.open("GET", document.location.href, true);
    xmlHttpReq.onreadystatechange = function(data) 
    {
        if (this.readyState!=4)
            return;
        findVimeoVideos2(tabId, this.responseText) 
    }			
    xmlHttpReq.send( null);         
}
function GetVimeoId( url)
{
	//if ( GetUrlParameter( url, L"clip_id", csId))
	//	return TRUE;
	var csId = url;
	var i = csId.indexOf('?');
	if ( i>=0)
		csId = csId.substr(0,i);
	i = csId.indexOf('#');
	if ( i>=0)
		csId = csId.substr(0,i);

	i = csId.lastIndexOf('/');
	if ( i<0)
		return false;
	csId = csId.substr(i+1);
	if ( csId.length <8)
	    return false;
	for ( i = 0; i < csId.length; i++)
	{
		if ( csId.charAt(i) < '0' || csId.charAt(i) > '9')
			return false;
	}
	return csId;
}
function findVimeoVideos2(tabId, html) 
{
    var k = 'data-config-url="'
    var i = html.indexOf(k);
    var url = false;
    if ( i >= 0)
    {
        i+=k.length;
        var i2 = html.indexOf('"',i);
        if ( i2>i)
            url = html.substr(i,i2-i);
	}
	if ( !url)
	{
        var o =  FindFirstUrl_Vimeo( html, "/config?",0)
        if (o)
            url = o[1];
    }
    if ( !url)
	{
	    var id = GetVimeoId(document.location.href);
	    if ( !id)
	        return;
        url = "https://player.vimeo.com/video/"+id;
    }
    url = url.replace( /&amp;/g, "&");
    var xmlHttpReq = new XMLHttpRequest();
    xmlHttpReq.open("GET", url, true);
    xmlHttpReq.onreadystatechange = function(data) 
    {
        if (this.readyState!=4)
            return;
        var s = this.responseText;
        var k = '"title":"';
        var i = s.indexOf(k);
        title = document.title;
        if ( i >= 0)
        {
            i += k.length;
            for (var j = i; j+1 < s.length; j++)
            {
                if (s.charAt(j) == '\\') // Backslash vor Gänsefüßchen zählt nicht
                    j++;
                else if (s.charAt(j) == '\"')
                    break;
            }
            if (j + 1 < s.length)
                title = s.substr(i,j-i);
        }
        var start=0;
        allUrlsList=[];
        while(1)
        {
            var o = FindFirstUrl_Vimeo(s, ".mp4", start);
            if ( !o)
                break;
            start = o[0];
            var i = s.indexOf('"height":',start);
            var h= 0;
            if ( i>0)
                h = parseInt(s.substr(i+9));
            
            var url = o[1];
			addOnce( allUrlsList, {'url': url,'title': title+" ("+h+"p)", 'type': 'video'});
            //allUrlsList.push({'url': url,'title': title+" ("+h+"p)", 'type': 'video'});
        }
        if ( tabId != -1)
		{
			var fGreenArrow = false;
			if ( allUrlsList.length>0)
				fGreenArrow = true;

			if ( !oembedUrl)
				oembedUrl = getOembedURL(); 
			if ( oembedUrl != false)
				fGreenArrow = true;

			if ( fGreenArrow)
			{
				chrome.runtime.sendMessage({ "msg": "msgSetIcon", "tabId": tabId, "fVideo": true}, function (response) { 
					if (typeof (response) == 'undefined' && chrome.runtime.lastError)
							return;
				});
			}
		}
    }			
    xmlHttpReq.send( null);         
}
