var aTxt=['idvideo','rights','idTL','idaddvideo','idVDL','idYT','idYT3','idYT2','idnovideo','idwhy',"idwait1","idwait2","idcc","iddownload","idmb","more","downloadtt"];

var t = {};
for ( var i = 0; i <aTxt.length;i++)
	t[aTxt[i]] = chrome.i18n.getMessage(aTxt[i]);
 
function GetFileExtension( ob)
{
	if ( ob.ext && typeof(ob.ext)== "string")
		return ob.ext;
    var ext = ["m3u8","flv","mp4","3g","wmv","mpg","m4p","m4v","webm"];
    for ( var j = 0; j<ext.length;j++)
    {
        if ( ob.mime && ob.mime.indexOf( ext[j])>=0)
        {
            return ext[j];
        }
    }
    
    for ( var j = 0; j<ext.length;j++)
    {
        if ( ob.url & ob.url.toLowerCase().indexOf( ext[j])>=0)
        {
            return ext[j];
        }
    }
    return "mp4";
}

function OnUltimate( mode)
{    
	if ( mode != "m3u8")
		chrome.tabs.create({"url": "https://videodownloaderultimate.com/?p=professional","selected":true}, function(tab){});    
	else
		chrome.tabs.create({"url": "https://videodownloaderultimate.com/?p=m3u8","selected":true}, function(tab){});    
}


function OnDownloadVideo( ev)
{	
	var today = new Date();
	var i = parseInt(today.getDate());
	var j = parseInt(localStorage.getItem("RightsShown")); // Show rights warning once a day
	if ( i != j)
	{		
		if ( !confirm(t['rights']))
			return;		
		localStorage.setItem("RightsShown", i);	
	}
		
    var i = parseInt(ev.srcElement.id.slice(4));
    if ( i < videoUrls.length)
    {	
        //window.close();
        var s = getFilename(videoUrls[i]);
		
		//var txt =  "Wenn das Video abgespielt wird anstatt gespeichert zu werden, klicken Sie mit der rechten Maustaste auf das Video und wählen \"Video speichern unter\".";
			// s = "If the videos plays instead of downloading right click to the video and select \"Save video as\".";
		//alert( videoUrls[i].status);
		if (  videoUrls[i].status >= 400)
		{			
			chrome.tabs.sendMessage(curTabId, { id: "msgDownload",url:videoUrls[i].url, filename:s}, function (response)
			{
				if (typeof (response) == 'undefined' && chrome.runtime.lastError)
						return;			
				//window.close();
			});			
		}
		else
		{
			var options = { url:videoUrls[i].url, filename:s, saveAs:true};    				
			chrome.downloads.download(options, function(downloadId)
			{
			});
			/*chrome.downloads.onCreated.addListener(
				function(downloadItem)
				{					
					window.close();					
				});
				*/
			
		}
		chrome.storage.local.get('video_downloads', function(data)
		{
			var count = parseInt(data["video_downloads"]);
			if ( !count)
				count = 0;
			count++;
			chrome.storage.local.set({'video_downloads':count}, function(){});
			if ( count == 10)
			{
				var t = chrome.i18n.getMessage("idreview");
				if ( confirm(t))
					chrome.tabs.create({"url":"https://chrome.google.com/webstore/detail/video-downloader-professi/elicpjhcidhpjomhibiffojpinpmmpil/reviews","selected":true}, function(tab){});
				
			}
			//else
			//	window.close();
			
		});
	}		
}
  
function OnPlayVideo( ev)
{
    var i = parseInt(ev.id.slice(7));
    if ( i < videoUrls.length)
    {
        //window.close();
        var t = videoUrls[i].title;
        var u = videoUrls[i].url;
        window.open(u, "_blank", 'resizable=yes, scrollbars=no, titlebar=yes, width=800, height=600');
    }
}

function myEncodeURI(q)
{
    var b="";
    var d=0;
    while(d < q.length)
    {
        var e1 = q.charCodeAt(d);
        d++;
        if ( e1 >=48 && e1 <= 57)
            b+=String.fromCharCode(e1);
        else if ( e1 >=97 && e1 <= 122)
            b+=String.fromCharCode(e1);
        else if ( e1 >=65 && e1 <= 90)
            b+=String.fromCharCode(e1);
        else
        {
            b+='('+e1+')';
        }
    }
    return b;
}
 
//oembed add to list
function OnSP24NavigateAddVideo()
{
	if ( crctable == false)
		crctable = createcrctable();
	chrome.tabs.sendMessage(curTabId, { id: "msgAddToVideolist", play: false}, function (response) {
		if (typeof (response) == 'undefined' && chrome.runtime.lastError)
			return;
		
		alert("error");
		
		
	});
    //window.close();
    
}
//oembed add to list and play
function OnSP24NavigateAddVideo2() // add and Play
{
    chrome.tabs.sendMessage(curTabId, { id: "msgAddToVideolist", play: true}, function (response) {
		if (typeof (response) == 'undefined' && chrome.runtime.lastError)
			return;
	});
    window.close();
} 

function OnSP24NavigateVideo()
{
    var url = window.location.href;
    url = url.replace("popup.html","startpage/index.html?page=video");
    chrome.tabs.create({"url": url,"selected":true}, function(tab){});                
    window.close();
	
    //chrome.runtime.sendMessage({ msg: "OnSP24Navigate", url: url }, function (response)
    //{
    //});     
}
 
 
function getFilename(d)
{
	
    var s = "";
    for ( var j = 0; j<d.title.length;j++)
    {
        var c = d.title.charAt(j);
        if ( c>='A' && c<='Z')
            s+=c;
        else if ( c>='a' && c<='z')
            s+=c;
        else if ( c>='0' && c<='9')
            s+=c;
        else if ( "- _()".indexOf(c)>=0)
            s+=c;
    }   	
    s+="."+GetFileExtension( d);
    return s;
}

 function getTitleFromUrl( d)
 {
    var fname = d.url;
    var j = fname.indexOf( "?");
    if ( j>=0)
        fname = fname.substr(0,j);
    fname = fname.trim("/ ");
    j = fname.lastIndexOf( "/");
    if ( j>=0)
        fname = fname.substr(j+1);

    fname = fname.replace(/%20/g, " ");
    if ( fname == "videoplayback" || fname.length<4)
    {
        if ( !d.title)
            d.title = "video";
        fname = d.title;
    }   
    fname = fname.trim("\n \t\r<>");
    if ( fname.length > 30)      
        fname = fname.substr(0,27)+"...";
    return fname;
}
 
var curTabId=0;
var videoUrls=0;
var showYoutubeMsg=false;

function hideControl(id)
{
    var o = document.getElementById(id); 
    if ( o)
    o.style.display = "none";   
}
function showControl(id)
{
    var o = document.getElementById(id); 
    if ( o)
		o.style.display = "block";   
}

var lastBest = false;
var lastBytes = 0;
function markBestResult(id,bytes)
{	

	var o = document.getElementById(id);
	o.bytes = bytes;
		
	if( bytes && bytes > lastBytes)
	{
		//console.log( id+" - "+bytes);
		if ( lastBest)
			lastBest.style.background = '#fff';
		lastBest = o;
		lastBytes = bytes;		
		lastBest.style.background = '#ddd';		
	}
}

function getLength2( idControl, ob)
{
	chrome.tabs.sendMessage(curTabId, { id: "msgGetLength",url:ob.url, idcontrol:idControl}, function (response)
	{
		//console.log("len: "+response.len+"  id:"+idControl);
		if (typeof (response) == 'undefined' && chrome.runtime.lastError)
				return;			
	
		/*
		bytes = parseInt(response.len);
		ob.bytes = bytes;
		console.log( "Bytes: "+bytes);
		var mb = Math.floor(bytes*100/1024/1024)/100;
		
		var o = document.getElementById("idd_"+idControl);
		o.innerHTML = "Download "+mb+"MB";
		o.title = ""
		*/
	});
}

function getSizeFromOb(url, ob, i)
{
	if ( !ob.bytes && !ob.noDL)
	{				
		var client = new XMLHttpRequest();
		client.idControl = i;
		client.ob = ob;
		client.onreadystatechange = function() 
		{					
			if(this.readyState >= 2) 						
			{                      	
				if ( this.status==0)
					return;
				var o = document.getElementById("idd_"+this.idControl);
				if ( o)
				{
					var bytes = parseInt(this.getResponseHeader("Content-Length"));
					if ( this.status>=400)
					{
						this.ob.status = this.status;
						o.innerHTML = "Forbidden<br/>"+this.status;
						getLength2( this.idControl, this.ob);
						var o2 = document.getElementById("idd_item_"+this.idControl);
						//o.style.display="none";								
						o2.style.opacity=0.7;
						bytes = 0;								
					}
					else if ( !bytes)
					{
						bytes = 0;
						o.innerHTML = "Download<br/>? MB";
					}
					else
					{
						if (bytes<1000 && this.ob.len > 1000)
							bytes = this.ob.len
						
						this.ob.bytes = bytes;
						
						var mb = Math.floor(bytes*100/1024/1024)/100;
						o.innerHTML = "Download "+mb+"MB";
						o.title = ""
					}
					
					
					if ( bytes > 0)
						markBestResult("idd_item_"+this.idControl, bytes);							
				}
				  client.abort();
			}
		}
		//console.log("url:"+ob.res);
		client.open("HEAD", url);
		client.send();
	}
}
function showVideoUrls( )
{
    var sInner="";
 
    if ( showYoutubeMsg)
	{
		sInner+= "<div class='sep'></div><div class='clYT' style='width:300px'>"+t["idYT"].replace("YouTube",showYoutubeMsg)+"</div>";
		
	}
	if ( !videoUrls)
    {
        var o = document.getElementById("idNoVideo");
        if ( o)
        {
            o.innerHTML = t["idnovideo"]+"<a id='idNoVideoLink' style='margin-left:10px' href='#'>"+t["idwhy"]+"</a>";
            
            o.innerHTML += "<div id='sep4'></div>";
            o.style.display="block  ";
            
            var o = document.getElementById("idNoVideoLink");
            o.addEventListener('click', function(e)
            {
                e.stopPropagation();
                var w = 500; 
                var h = 220; 
                var left = (screen.width/2)-(w/2);
                var top = (screen.height/2)-(h/2);
                
                chrome.tabs.get(curTabId, function(tab)
                {
	                if ( tab)
	                {
	                    var url = "./novideo.html?url="+escape(tab.url);
                        window.open( url, "_blank", 'resizable=no, scrollbars=no, titlebar=yes, width='+w+', height='+h+', top='+top+', left='+left);
                        window.close();
                    }
                });
                return true;
            });
        }
    }   
    var fDownloadsAvailable=false;
	var hasM3u = false;
    if ( videoUrls)
    {
        //videoUrls.push(videoUrls[0]);
        for ( var i = 0; i < videoUrls.length; i++)
        {
			
            var ob = videoUrls[i];
			
			if (ob.noDL=="m3u8") 
			{
				if ( hasM3u)
					continue; // only one m3u entry
				else
					hasM3u=true;
					
			}
            var url = ob.url;
            var ext = GetFileExtension( ob);
            if ( !i)
                sInner+= "<div class='sep'></div><div class='clHeader'>"+t["idVDL"]+"</div>";
            else
                sInner+= "<div class='sep2'></div>";
            var color = "#aaa";
            if ( ext == "flv")
                color = "#acf";
            else if ( ext == "mp4" || ext == "m4v")
                color = "#af9";
			else if ( ext == "mp4" || ext == "m4v")
                color = "#af1";
            else if ( ext == "3g")
                color = "#faa";
            else if ( ext == "wmv")
                color = "#aff";
            sInner+= "<div class='clItem' id='idd_item_"+i+"'>";
			
			var s = "style='background-color:"+color+"'";
			var s2 ="";
			if ((ext == "mp4" || ext == "mov" || ext == "webm") && ob.url != "CANNOTPLAY")
			{
				s = "id='idd_pp_"+i+"' style='cursor:pointer;background-color:"+color+"'";
				s2 = "<div style='position:absolute;right:4px;top:4px;z-index:1;'><img height='24px' src='./png/pp.png'/></div>";
			}
            if ( ob.res)
                sInner+= "<div class='clFileExt' "+s+">"+s2+"<div style='position:relative;z-index:2;'>"+ext+" "+ob.res+"</div></div>";
            else 
                sInner+= "<div class='clFileExt2' "+s+">"+s2+"<div style='position:relative;z-index:2;'>"+ext+"</div></div>";
            
            if ((ext == "mp4" || ext == "mov" || ext == "webm") && ob.url != "CANNOTPLAY")
            {
                sInner+= "<div title='"+url+"' class='clDownloadVideo' id='idv_"+i+"' style='width:192px'>"+getFilename(ob)+"</div>"
            }
            else if ( ext == "m3u8")
                sInner+= "<div title='"+url+"' class='clDownloadVideo' id='idv_"+i+"' style='width:192px'>"+t["more"]+"</div>"
			else
                sInner+= "<div title='"+url+"' class='clDownloadVideo' id='idv_"+i+"' style='width:192px'>"+getFilename(ob)+"</div>"
            
			/*if ((ext == "mp4" || ext == "mov" || ext == "webm") && ob.url != "CANNOTPLAY")
            {
                sInner+= "<div class='clCC' id='idd_cc_"+i+"' ";                
                sInner+= "title='"+t["idcc"]+"'";                
                sInner+= "><img width=19 src='./png/cc.png'/></div>";
            }
			*/
            if (ob.noDL=="m3u8") 
                sInner += "<div id='idUltimate2' class='clNODownloadButton clNODownloadButtonM3U8'><img width=19 src='./png/no.png'/></div>";
			else if (ob.noDL) 
                sInner += "<div id='idUltimate3' class='clNODownloadButton clNODownloadButtonNoDl'><img width=19 src='./png/no.png'/></div>";
			else {
                if (ob.bytes) {
                    var mb = Math.floor(ob.bytes * 100 / 1024 / 1024) / 100;
                    sInner += "<div class='clDownloadButton' id='idd_" + i + "'>"+t["idwait2"]+"</div>";
                    //  sInner+= "<div class='clDownloadButton' id='idd_"+i+"'>Download "+mb+"MB</div>";
                }
                else {                    
                    sInner += "<div class='clDownloadButton' title='"+t["idwait1"]+"' id='idd_" + i + "'>"+t["idwait2"]+"</div>";                    
                }
            }

            
			sInner+= "</div>";
            fDownloadsAvailable=true;
		    
			if ( ob.bytes>0)
			{
				markBestResult("idd_item_"+i, ob.bytes);
			}

			getSizeFromOb( url, ob, i);             
		}
    }        
        
    var o = document.getElementById("idVideos");
    if ( o)
        o.innerHTML = sInner;
        
    var o = document.getElementById("idAdd");
    if (o)
        o.addEventListener('click', OnSP24NavigateAddVideo2);    
        
    if ( videoUrls)        
    {
        for ( var i = 0; i < videoUrls.length; i++)
        {
            var o = document.getElementById("idd_"+i);
            if (o)
                o.addEventListener('click', OnDownloadVideo);    
            //var o = document.getElementById("idd_cc_"+i);
            //if (o)
                //o.addEventListener('click', function(){OnPlayVideo(this)});    
			var o = document.getElementById("idd_pp_"+i);
            if (o)
                o.addEventListener('click', function(){OnPlayVideo(this)});    
        }
    }

    var a = document.getElementsByClassName("clNODownloadButtonM3U8");
	for ( var i = 0; i < a.length; i++)
	{    
        a[i].addEventListener('click', function(){OnUltimate("m3u8")});
	}
	a = document.getElementsByClassName("clNODownloadButtonNoDl");
	for ( var i = 0; i < a.length; i++)
	{    
        a[i].addEventListener('click', function(){OnUltimate("yt")});
	}
	o = document.getElementById("idUltimate");
	if ( o)
		o.addEventListener('click', function(){OnUltimate("yt")});
	
}


function SetLanguage()
{
    //if ( lang == "de")
    //    t = textDE;
    //chrome.runtime.sendMessage({msg: "GetCurrentSPLanguage"}, function(response) 
    //{
		//alert (response)
		for (var s in t) 
    	{
       		var ob = document.getElementById( s); 
        	if ( ob) 
           	    ob.innerHTML = t[s];
    	}
   // });
}

var crctable=false;
function createcrctable(){
	var c;
	var table = [];
	for(var n =0; n < 256; n++){
		c = n;
		for(var k =0; k < 8; k++){
			c = ((c&1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
		}
		table[n] = c;
	}
	return table;
}   
			
function crc32( /* String */ str, /* Number */ crc ) 
{ 
	if ( crctable == false)
		crctable = createcrctable();
	if( crc == window.undefined ) crc = 0; 
	var n = 0; //a number between 0 and 255 
	var x = 0; //an hex number 
	crc = crc ^ (-1); 
	for( var i = 0, iTop = str.length; i < iTop; i++ ) { 
		n = ( crc ^ str.charCodeAt( i ) ) & 0xFF; 
		x = crctable[n];
		crc = ( crc >>> 8 ) ^ x; 
	} 
	return crc ^ (-1); 
} 	
chrome.runtime.onMessage.addListener(function (details, sender)
{
    if (sender.id != chrome.runtime.id)  // Accept only messages from our extension
        return;

	if ( details.msg == "msgReturnContentLength")
	{
		console.log("len: "+details.len+"  id:"+details.idcontrol);
		if (typeof (response) == 'undefined' && chrome.runtime.lastError)
				return;				
		
		var bytes = parseInt(details.len);
		//ob.bytes = bytes;
		
		var mb = Math.floor(bytes*100/1024/1024)/100;		
		var o = document.getElementById("idd_"+details.idcontrol);
		if ( o)
		{
			o.innerHTML = "Download "+mb+"MB";
			o.style.color = "#ff7";
			o.title = t["downloadtt"];
		}
		return;
	}
	if ( details.msg == "msgOembedInfos")
	{
		var info = details.info;
		if ( info.error)
		{
			alert( info.error);
			return;
		}
		info.video_id = crc32(info.video_url); 
		
		chrome.storage.sync.get('video_items', function(data)
		{
			var sitems = data['video_items'];
			var aItems =false;
			if ((sitems == null)||(typeof(sitems)== 'undefined'))
				aItems = new Array();
			else
				aItems = JSON.parse(sitems);
//aItems = new Array();
			if( Object.prototype.toString.call( aItems ) !== '[object Array]' ) {
    				aItems = new Array();
			}
			//aItems = new Array();
			aItems.splice(0, 0, info.video_url);
			//aItems.push(info.video_url);
			chrome.storage.sync.set({video_items: aItems}, function(){}); 
			var newData ={}; 
			newData.video_items = JSON.stringify(aItems); 
			newData["video_item_"+ info.video_id] = info; 
			chrome.storage.sync.set(newData, function(){
			    					
				var title = '"'+info.title +'"' + chrome.i18n.getMessage("idadded2"); 			        
				alert(title); 
				window.close();

			}); 
		}); 
		return;
	}
		
    if ( details.msg == "__L64_NEW_VIDEOLIST")
    {
        if (!videoUrls)
            videoUrls=[];
        for ( var i = 0; i< details.videoUrls.length;i++)
        {
            if ( details.videoUrls[i].rtmp)
            {
                var r = details.videoUrls[i];
                videoUrls.push({url: r.url,site:r.site,rtmp:r.rtmp,mime: "rtmp/mp4", p: 0, len:100000, title:r.title,res:r.q});
            }
            else
            {
                if ( details.videoUrls[i].top)
                    videoUrls.splice(0,0,details.videoUrls[i]);
                else
                    videoUrls.push(details.videoUrls[i]);
            }
        }
        showVideoUrls();
    }
}); 	

 function isForbidden( url) // Lock download from youtube and others
{
	if ( url && url.indexOf( "youtube.") >= 0) 
		return "YouTube";
	if ( url && url.indexOf( "googlevideo.") >= 0) 
		return "YouTube";
	if ( url && url.indexOf( "dailymotion.") >= 0) 
		return "Dailymotion";
	if ( url && url.indexOf( "instagram.") >= 0) 
		return "Instagram";
	if ( url && url.indexOf( "tiktok.") >= 0) 
		return "Tiktok";
	if ( url && url.indexOf( "/startpage/") >= 0) 
		return "YouTube";       
	return false;
}
function getCurrentTabAsync( callback)
{
	chrome.windows.getCurrent(function (win) {
		chrome.tabs.query({ active: true }, function (tab) {
			if ( !tab)
				return;
			for ( var t = 0; t<tab.length; t++)
			{

				if ( tab[t].windowId == win.id)
				{
					console.log( "Tab found "+win.id+"   "+tab[t].id);
					callback(tab[t]);
					return;
				}
			}
		});
	});
}
document.addEventListener('DOMContentLoaded', function ()
{
	SetLanguage();	
	
	/*var query = window.location.search.substring(1); 
	 
    {	
        chrome.runtime.sendMessage({ msg: "OnYoutubeWarning", fOnce: true }, function (response) { 
			if (typeof (response) == 'undefined' && chrome.runtime.lastError)
                return;
			//alert(JSON.stringify(response));
			OnUltimate( "yt");			
		});
	}*/
    
    hideControl("idTL");  
    hideControl("idSep2");        
	//var j = query.indexOf("&tabid=");
//	if (  j>=0)
//	    curTabId = parseInt(query.slice(j+7));
	
	//if ( query.indexOf("canaddvideo=1") < 0)
	{	
		hideControl("idaddvideo"); 		
		hideControl("idSep"); 
	}
		
	getCurrentTabAsync( function (tab) {
		if ( !tab)
			return;
		curTabId = tab.id;
		showYoutubeMsg = isForbidden(tab.url);
		
		if ( showYoutubeMsg)
		{
			var item = {url: "CANNOTPLAY", noDL:"yt", mime: "mp4", len:0, title:tab.title};				
			videoUrls = [item];
			showVideoUrls();
			//oembed
			showControl("idaddvideo"); 			
			showControl("idSep"); 
		}
		else
		{
			chrome.tabs.sendMessage(curTabId, { id: "msgGetAllVideos" }, function (response)
//			chrome.runtime.sendMessage({ msg: "OnSP24GetVideoUrls", tabId: curTabId }, function (response)
			{
				if (typeof (response) == 'undefined' && chrome.runtime.lastError)
						return;			
				//alert( response.videoUrls);
				if ( response.oembed)
				{
					showControl("idaddvideo"); 					
					showControl("idSep"); 
				}
				videoUrls = response.videoUrls;
				if (videoUrls && videoUrls.length==0)
					videoUrls = false;
				showVideoUrls();
				
			});
		}
	});
    var divs = document.querySelectorAll('div');
   for (var i = 0; i < divs.length; i++) {
    if (divs[i].className == "vdlButton")
    {
        if (divs[i].id == "idaddvideo")
            divs[i].addEventListener('click', OnSP24NavigateAddVideo);          
    }    
    else if (divs[i].className == "Reinecke24")
    {
        /*if (divs[i].id == "idwebwebweb")
            divs[i].addEventListener('click', OnSP24NavigateWebWebWeb);  
        else */
        if (divs[i].id == "idvideo")
            divs[i].addEventListener('click', OnSP24NavigateVideo);          
    }
    
  }
});

 