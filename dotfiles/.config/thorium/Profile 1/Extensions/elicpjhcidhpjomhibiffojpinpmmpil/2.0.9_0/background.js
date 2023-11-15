String.prototype.hashCode = function(){
    var hash = 0;
    if (this.length == 0) return hash;
    for (i = 0; i < this.length; i++) {
        char = this.charCodeAt(i);
        hash = ((hash<<5)-hash)+char;
        hash = hash & hash; 
    }
    return hash;
}

var L64B=
{
	vars:{}, 
	startpage:
	{
		onMessage:function(details, sender, callback)
		{
		    if (sender.id != chrome.runtime.id)  // Accept only messages from our extension
		        return;
			if (details.msg=="msgSetIcon")
			{
				SetVideoIcon( details.tabId, details.fVideo);
				return;
			}
            else if (details.msg=="msgSetUrl")
            {
                callback( {tabId:sender.tab.id});
            }             
		}
	},
	request:
	{
		lshorthistory: new Object(), 
		 
	}
}

function SetVideoIcon( tabid, fVideo)
{	
	//console.log("set icon "+tabid+ "   "+fVideo);
	if ( tabid>=0)
		chrome.action.setIcon({tabId: tabid, path: (fVideo?"./iconHilight.png":"./icon19.png")}, () => { /* ... */ });
}


L64B.video =
{
    onUpdateTabCalled:false,
    onUpdateTab:function(tabId, changeInfo, tab) 
    {
       /*if ( !tab)
        {
            setTimeout( function ( ) // make sure onUpdateTab is called at least once
            {
                chrome.tabs.get( tabId, function(tab)
                {
					if (typeof (tab) == 'undefined' && chrome.runtime.lastError)
						return;			
                    L64B.video.onUpdateTab(tab.id, null, tab);
                });
            },100);
            return;               
        }

		if ( vdl.lasturl[tabId] != tab.url)// Url has ls
        {
			vdl.reset( tabId, tab.url);			
        }
        else if ( vdl.urllist[tabId]) // there's are videos in the list
		{
			SetVideoIcon(tabId,true);

        }
        L64B.video.onUpdateTabCalled=true;
		*/
        /*popupHTML = "./popup.html?";
        
        //popupHTML+= "&tabid="+tabId;
		
        // OEMBED... decide later in popup?!
        if (tab.id < 0) {
            return; 
        }
        
        chrome.action.setPopup({tabId:tab.id, popup:  popupHTML}); 
		*/
        //chrome.action.show(tab.id);  
	},
     
    playVideo: function (tabid, video_id) {
            var url = window.location.href;
            url = url.replace("extension/background.html", "startpage/index.html?page=video&id=" + video_id);
            chrome.tabs.update(tabid, { "url": url, "selected": false }, function (tab) { });
    },
	/*
	addWatchedVideoItem:function(detail, fShowMessage)
	{	
		chrome.storage.sync.get('video_items', function(data)
		{
			var sitems = data['video_items'];
			var aItems =false;
			if ((sitems == null)||(typeof(sitems)== 'undefined'))
				aItems = new Array();
			else
				aItems = JSON.parse(sitems);
			if( Object.prototype.toString.call( aItems ) !== '[object Array]' ) {
    				aItems = new Array();
			}
			//aItems = new Array();
			aItems.splice(0, 0, detail.video_url);
			//aItems.push(detail.video_url);
			chrome.storage.sync.set({video_items: aItems}, function(){}); 
			var newData ={}; 
			newData.video_items = JSON.stringify(aItems); 
			newData["video_item_"+ detail.video_id] = detail; 
			chrome.storage.sync.set(newData, function(){
			    if ( fShowMessage)
			    {					
			        var title = '"'+detail.title +'"' + chrome.i18n.getMessage("idadded2"); 			        
			        alert(title); 
                }
			}); 
		}); 
	} 	
*/	
}


var vdl =
{
    
    lasturl:new Object(),
     

    reset:function( tabid,lasturl)
    {
		//console.log("-->Reset "+tabid);
        vdl.lasturl[tabid] = lasturl;
        
        //vdl.urllist[tabid]=false; 
	    
    },

    launch:function(details)
    {
		console.log("launch"+JSON.stringify(details));
		return;
	 

    },
/*
    launchc:function(tab)
    {
		vdl.reset(tab.id,"");
    },
	*/
    checkObject:function(details)
    {
		if (typeof (details) == 'undefined' && chrome.runtime.lastError)
			return;

		var url = details.url;   

		if ( url.indexOf(".m4s")>=0 && (url.indexOf("segment-")>=0 || url.indexOf("fragment")>=0))
			return;

		
		//console.log("checkObject "+url);
		var mime = "";
		var  referer = "";
		var len = 0;
		var tabid = details.tabId;
		if ( tabid<0)
		{
			console.log("tabid "+tabid);
			return;
		}
        for (var i = 0; i < details.responseHeaders.length; ++i) 
        {
            if (details.responseHeaders[i].name === 'Content-Type')
            {	
				mime  = details.responseHeaders[i].value; 
            }
            else if (details.responseHeaders[i].name === 'Content-Length')
                len = parseInt(details.responseHeaders[i].value); 
            else if (!len && details.responseHeaders[i].name === 'Content-Range')
                len = parseInt(details.responseHeaders[i].value);
        }
		
		if ( mime.indexOf("mp4") >= 0)
		{
			let ra = url.indexOf("&range=") // Vimeo
			if ( ra >=0)
			{
				let ra2 = url.indexOf("&",ra+5)
				if ( ra2>=ra)
					url = url.substr(0,ra)+url.substr(ra2);
				else
					url = url.substr(0,ra);
				//console.log("checkObject "+mime+" - "+url);	
			}
		}
		//if ( len<1024)
		//	return;
		var ext = ["m3u8","ts","flv","mp4","mov","m4v","webm","mpg","mp3","aac"];
		var isVideo = false;
		for ( i=0;i<ext.length;i++)
		{
			if ( mime.indexOf(ext[i]) >= 0)
			{
				isVideo = ext[i];
				break;
			}
			else if ( url.indexOf("."+ext[i]) >= 0)
			{
				isVideo = ext[i];
				break;
			}
		}
        if (isVideo != false)
        {
			var item = {url: url, mime: mime, len: len, title: false, ext:isVideo};
			if ( isVideo == "m3u8")
				item.noDL = "m3u8";
			else if ( len< 1024*10)
				return;
			SetVideoIcon(tabid,true);
			chrome.tabs.sendMessage(tabid, { id: "msgAddToList", item:item}, function (response)
			{
				if (typeof (response) == 'undefined' && chrome.runtime.lastError)
					return;
			});

        }
        
      /*  var filename = vdl.downloadlist[details.url];
        if ( filename)
        {
            for (var i = 0; i < details.responseHeaders.length; ++i) 
            {
                if ( details.responseHeaders[i].name && details.responseHeaders[i].name.toLowerCase() == 'content-disposition')
                {
                    details.responseHeaders[i].value = "attachment; filename=\""+filename+"\"";
                }                               
                else if ( details.responseHeaders[i].name && details.responseHeaders[i].name.toLowerCase() == 'location')
                {
                    var url = details.responseHeaders[i].value;
                    vdl.downloadlist[url] = filename;
                }
            }
            
            var u = details.url;
            setTimeout( function ( ) // make sure onUpdateTab is called at least once
            {
                vdl.downloadlist[u] = false;
            }, 200);
            
            var h = {name: "Content-Disposition",value: "attachment; filename=\""+filename+"\""};
		    details.responseHeaders.push(h);
            return {
                responseHeaders: details.responseHeaders
            };
        }
		*/
    },
    
}





// Listen for any changes to the URL of any tab.
//chrome.tabs.onUpdated.addListener(L64B.video.onUpdateTab);
//chrome.tabs.onReplaced.addListener(L64B.video.onUpdateTab);  
//chrome.tabs.onCreated.addListener(vdl.launchc);

chrome.action.setIcon({ path: "./icon19.png"}, () => { /* ... */ });

chrome.runtime.onMessage.addListener(L64B.startpage.onMessage);  
chrome.webRequest.onHeadersReceived.addListener(vdl.checkObject,
{
urls: ["<all_urls>"]
},["responseHeaders"]);

/*
chrome.webRequest.onCompleted.addListener(vdl.launch,{
        urls: ["<all_urls>"],
        types:["main_frame"]
   });
   
   

	chrome.webRequest.onBeforeRequest.addListener(
	function(details) {
		console.log("onBeforeRequest");
	},
	 {urls: ["<all_urls>"]},[]);
	
	
	console.log("start");
	*/