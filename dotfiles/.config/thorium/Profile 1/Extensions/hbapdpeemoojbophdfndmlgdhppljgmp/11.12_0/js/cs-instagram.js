var Tool = (function(){

  var source = 'instgr';

  var rootSel = '.header__search';
  var sidebarSelector;// = '.x1dr59a3';
  var observer;
  var suggestionsTimer;
  var suggestionsList = {};
  var cachedSuggestions = {};
  var darkMode = false;

  var vendor = (navigator.userAgent.match(/(Chrome|Firefox)/) || [])[1];


  var init = function(){
    initWindowMessaging();
    chrome.runtime.sendMessage({cmd: 'api.getConfig'}, function(json){
      if (!json.error && json.data && json.data.instagram) {
        sidebarSelector = json.data.instagram.sidebarSelector;
        console.log(sidebarSelector);
      }
    });
    setTimeout( function(){
      processPage();
    }, 1500 );
    // initURLChangeListener(function(){
    //   setTimeout( function(){
    //     processPage();
    //   }, 500 );
    // });
  };


  var initWindowMessaging = function(){
    // console.log('initWindowMessaging');
    window.addEventListener("message", function(event){
      var payload = event.data;
      if (typeof payload !== 'object') return;
      var cmd = payload.cmd;
      var data = payload.data;
      if (!cmd) return;
      if (cmd === 'xt.resize') {
        var height = data.height;
        var source = data.source;
        var selector = '.xt-widget-iframe';
        if (!selector) return;
        if (height <= 0) return;
        $(selector + ' iframe').height(height + 10);
      }
    }, false);
  };


  var processPage = function(){
    addGenerateHashtagsBtn();
  };


  var waitSidebarReady = function(){
    return new Promise(resolve => {
      let attempt = 10;
      let timer = setInterval(() => {
        if (attempt-- <= 0) {
          clearInterval(timer);
          resolve();
        }
        let sidebar = document.querySelector(sidebarSelector);
        if (sidebar) {
          resolve(sidebar);
          clearInterval(timer);
        }
      }, 500);
    });
  };


  var menuItemTemplate = function(darkmode, text){
    var fill = darkmode ? 'white' : '';
    return `<span aria-describedby=":r4:" class="x4k7w5x x1h91t0o x1h9r5lt x1jfb8zj xv2umb2 x1beo9mf xaigb6o x12ejxvf x3igimt xarpa2k xedcshv x1lytzrv x1t2pt76 x7ja8zs x1qrby5j"><div class="x1n2onr6"><a class="x1i10hfl xjbqb8w x6umtig x1b1mbwd xaqea5y xav7gou x9f619 x1ypdohk xt0psk2 xe8uvvx xdj266r x11i5rnm xat24cr x1mh8g0r xexx8yu x4uap5 x18d9i69 xkhd6sd x16tdsg8 x1hl2dhg xggy1nq x1a2a7pz _a6hd" href="/explore/" role="link" tabindex="0"><div class="x9f619 x3nfvp2 xr9ek0c xjpr12u xo237n4 x6pnmvc x7nr27j x12dmmrz xz9dl7a xn6708d xsag5q8 x1ye3gou x80pfx3 x159b3zp x1dn74xm xif99yt x172qv1o x10djquj x1lhsz42 xzauu7c xdoji71 x1dejxi8 x9k3k5o xs3sg5q x11hdxyr x12ldp4w x1wj20lx x1lq5wgf xgqcy7u x30kzoy x9jhf4c"><div><div class="x9f619 xjbqb8w x78zum5 x168nmei x13lgxp2 x5pf9jr xo71vjh x1n2onr6 x1plvlek xryxfnj x1c4vz4f x2lah0s xdt5ytf xqjyukv x1qjc9v5 x1oa3qoh x1nhvcw1"><div class="x9f619 xxk0z11 xii2z7h x11xpdln x19c4wfv xvy4d1p"><svg height="22" viewBox="0 0 24 24" width="22" xmlns="http://www.w3.org/2000/svg"><path fill="${fill}" d="m13.001 18c-.047 0-.094-.004-.142-.013-.406-.078-.674-.47-.596-.877l2-10.5c.077-.408.468-.673.877-.597.406.078.674.47.596.877l-2 10.5c-.068.36-.382.61-.735.61z"/><path fill="${fill}" d="m9.001 18c-.047 0-.094-.004-.142-.013-.406-.078-.674-.47-.596-.877l2-10.5c.077-.408.469-.673.877-.597.406.078.674.47.596.877l-2 10.5c-.068.36-.382.61-.735.61z"/><path fill="${fill}" d="m17.25 15h-10.5c-.414 0-.75-.336-.75-.75s.336-.75.75-.75h10.5c.414 0 .75.336.75.75s-.336.75-.75.75z"/><path fill="${fill}" d="m17.25 10.5h-10.5c-.414 0-.75-.336-.75-.75s.336-.75.75-.75h10.5c.414 0 .75.336.75.75s-.336.75-.75.75z"/><path fill="${fill}" d="m21.25 24h-18.5c-1.517 0-2.75-1.233-2.75-2.75v-18.5c0-1.517 1.233-2.75 2.75-2.75h18.5c1.517 0 2.75 1.233 2.75 2.75v18.5c0 1.517-1.233 2.75-2.75 2.75zm-18.5-22.5c-.689 0-1.25.561-1.25 1.25v18.5c0 .689.561 1.25 1.25 1.25h18.5c.689 0 1.25-.561 1.25-1.25v-18.5c0-.689-.561-1.25-1.25-1.25z"/></svg></div></div></div><div class="x6s0dn4 x9f619 xxk0z11 x6ikm8r xeq5yr9 x1swvt13 x1s85apg xzzcqpx" style="opacity: 1;"><div style="width: 100%;"><div class="" style="width: 100%;"><span class="x1lliihq x1plvlek xryxfnj x1n2onr6 x193iq5w xeuugli x1fj9vlw x13faqbe x1vvkbs x1s928wv xhkezso x1gmr53x x1cpjm7i x1fgarty x1943h6x x1i0vuye xl565be xo1l8bm x5n08af x1tu3fi x3x7a5m x10wh9bi x1wdrske x8viiok x18hxmgj" dir="auto" style="line-height: var(--base-line-clamp-line-height); --base-line-clamp-line-height: 20px;"><span class="x1lliihq x193iq5w x6ikm8r x10wlt62 xlyipyv xuxw1ft">${text}</span></span></div></div></div></div></a></div></span>`;
  };


  var addGenerateHashtagsBtn = async function() {
    darkMode = isDarkMode();
    let sidebar = await waitSidebarReady();
    let widgetContainer = 'body';
    var $btn;
    var $btnBulk;
    if (sidebar) {
      let $newPost = $(sidebar).find('[aria-label="New post"]');
      if (!$newPost[0]) $newPost = $(sidebar).find('svg[aria-label]')[6];
      let $newPostItem = $($newPost).closest('a[role=link]').parent().parent().parent();
      $btn = $(menuItemTemplate(darkMode, 'Generate HashTags')).insertAfter($newPostItem);
      $btnBulk = $(menuItemTemplate(darkMode, 'Hashtags Metrics')).insertAfter($btn);
      if (vendor !== 'Firefox') {
        addIframe($newPostItem.parent(), darkMode);
      }
    }
    else return;
    let btnURL = chrome.runtime.getURL(`html/page.html?page=hashtags&service=instagram`);
    let btnBulkURL = chrome.runtime.getURL(`html/page.html?page=hashtags_bulk&service=instagram`);
    $btn.click(function(e) {
      console.log(e);
      chrome.runtime.sendMessage({
        cmd: 'new_tab',
        data: btnURL
      });
    });
    $btnBulk.click(function(e) {
      console.log(e);
      chrome.runtime.sendMessage({
        cmd: 'new_tab',
        data: btnBulkURL
      });
    });

  };


  var isDarkMode = function() {
    let bgColor = getComputedStyle(document.body).backgroundColor;
    if (bgColor === "rgb(255, 255, 255)") return false;
    else return true;
  };


  var addIframe = function($parent, darkmode){
    var settings = Starter.getSettings();
    var apiKey = settings.apiKey || '';
    var settingEnabled = settings.sourceList.instgr;
    var pur = Common.getCredits() > 0 ? 0 : 1;
    var version = chrome.runtime.getManifest().version;

    var iframe = '<div class="xt-widget-iframe"><iframe class="xt-ke-instgrm-iframe" src="https://keywordseverywhere.com/ke/widget.php?apiKey=' + apiKey + '&source=instagram&enabled=' + settingEnabled + '&pur=' + pur + '&country=' + settings.country + '&darkmode=' + darkmode + '&version=' + version + '" scrolling="no"></div>';
    $parent.append(iframe);
  };


  var processRelatedSearch = function(manual){
    var list = $('.related-searches__item-text');
    console.log(list);
    var keywords = {};
    for (var i = 0, len = list.length; i < len; i++) {
      var keyword = Common.cleanKeyword( list[i].textContent );
      keywords[ keyword ] = list[i];
    }
    var settings = Starter.getSettings();
    if ((!settings.sourceList.gprsea && !manual) || !settings.apiKey ) {
      var rows = [];
      for (var keyword in keywords) {
        rows.push({keyword: keyword});
      }
      Common.renderWidgetTable(rows, getRenderParams({json: null}));
      return;
    }
    processKeywords( keywords, {} );
  };


  var processKeywords = function( keywords, table ){
    Common.processKeywords({
        keywords: Object.keys( keywords ),
        tableNode: table,
        src: source
      },
      function(json){
        processRelatedSearchResponse( json, keywords );
      }
    );
  };


  var processRelatedSearchResponse = function( json, keywords ){
    var data = json.data;
    var rows = [];
    if (json.error_code === 'NOCREDITS') {
      for (var keyword in keywords) {
        rows.push({keyword: keyword});
      }
      Common.renderWidgetTable(rows, getRenderParams({json: null, nocredits: true}));
      return;
    }

    if (typeof json.data !== 'object') return;
    for (var key in json.data) {
      var item = json.data[key];
      rows.push(item);
    }
    if (!rows.length) return;
    rows.sort(function(a,b){
      var aVol = parseInt(a.vol.replace(/[,.\s]/g, ''));
      var bVol = parseInt(b.vol.replace(/[,.\s]/g, ''));
      return bVol - aVol;
    });
    Common.renderWidgetTable(rows, getRenderParams({json: json}));
  };


  var getRenderParams = function(params){
    var nocredits = params.nocredits;
    var settings = Starter.getSettings();
    var query = getQuery() || '';
    var res = {
      settingEnabled: settings.sourceList.bingco,
      type: 'related',
      title: 'Related Keywords',
      query: query,
      columnName: 'Keyword',
      rootSelector: 'xt-related-search',
      addTo: '.js-results-sidebar',
      addMethod: 'prependTo',
      iframeSrcParam: 'related',
      filename: 'ddg-' + query.replace(/\s+/g, '_'),
      fnGenerateLink: function(keywordEnc){
        return document.location.origin + '/search?q=' + keywordEnc;
      },
      onAdded: function($root){
        // checkWidgetPosition($root, $('#related'));
      },
      onClosed: function(){
        // clearTimeout(checkWidgetPositionTimer);
      },
      loadAll: function(){
        var $this = $(this);
        var $parent = $this.closest('.xt-widget-table');
        if (nocredits || !settings.apiKey) {
          chrome.runtime.sendMessage({
            cmd: 'new_tab',
            data: 'https://keywordseverywhere.com/credits.html'
          });
          return;
        }
        processRelatedSearch('manual');
        $this.remove();
      }
    };
    for (var key in params) {
      res[key] = params[key];
    }
    return res;
  };


  var processQueryResponse = function( json ){
    var data;
    if (json.data) data = json.data[0];
    var $node = $('#xt-info');
    if (!$node.length) {
      $node = $('<link/>', {
          class: 'xt-ddg-query'
        })
        .attr('id', 'xt-info');
      var settings = Starter.getSettings();
      $node
        .insertAfter( $(rootSel) );
    }
    if (json.error_code === 'NOCREDITS') {
      return;
    }
    else if (!data) {
      Common.processEmptyData(json, $node);
      return;
    }
    else {
      if(data.vol != '-') {
        Common.addKeywords(data.keyword);
        var html = Common.getResultStrType2(data);
        html = Common.appendStar(html, data);
        html = Common.appendKeg(html, json, data);
        $node.html(html);
        var color = Common.highlight(data);
        if (color) {
          $node.addClass('xt-highlight');
          $node.css({background: color});
        }
      }
      else {
        $node.html('');
      }
    }
  };


  var initURLChangeListener = function( cbProcessPage ){
    var url = document.location.href;
    var timer = setInterval(function(){
      if ( url !== document.location.href ) {
        url = document.location.href;
        cbProcessPage( url );
      }
    }, 1000);
  };


  var initMutationObserver = function( target ){
    var settings = Starter.getSettings();
    if (!settings.showMetricsForSuggestions) return;
    if (observer) observer.disconnect();
    observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type === 'childList') {
          if (!mutation.addedNodes.length) return;
          processChildList(mutation.addedNodes);
        }
      });
    });

    var config = { subtree: true, childList: true, characterData: true };
    observer.observe(target, config);
  };


  var processChildList = function(children){
    for (var i = 0, len = children.length; i < len; i++) {
      var node = children[i];
      var $node = $(node);
      if ($node.hasClass('acp')) {
        processSuggestion(node);
      }
    }
  };


  var processSuggestion = function(node){
    var $node = $(node);
    var keyword = $.trim(node.textContent);
    if (!keyword) return;
    if (!suggestionsTimer) suggestionsList = {};
    suggestionsList[keyword] = node;
    if (suggestionsTimer) clearTimeout(suggestionsTimer);
    suggestionsTimer = setTimeout(function(){
      processSuggestionsList();
    }, 100);
  };



  var processSuggestionsList = function(){
    var list = $.extend({}, suggestionsList);
    var key = Object.keys(list).join('');
    if (cachedSuggestions[key]) {
      processSuggestionsListResponse(cachedSuggestions[key], list);
      return;
    }
    suggestionsTimer = null;
    Common.processKeywords({
        keywords: Object.keys( list ),
        tableNode: {},
        src: source
      },
      function(json){
        // console.log(json, list);
        processSuggestionsListResponse( json, list );
        cachedSuggestions[key] = json;
      }
    );
  };


  var processSuggestionsListResponse = function(json, keywords){
    var data = json.data;
    for (var key in data) {
      var item = data[key];
      var node = keywords[ item.keyword ];
      var $node = $(node);
      $node.find('.xt-suggestions-search').remove();
      var $span = $('<span/>').addClass('xt-suggestions-search');
      if (item.vol != '-' && item.vol != '0') {
        var html = Common.getResultStr(item);
        var color = Common.highlight(item);
        if (color) {
          $span.addClass('xt-highlight');
          $span.css({background: color});
        }
        // html = Common.appendStar(html, item);
        // html = Common.appendKeg(html, json, item);
        $span.html(html);
      }
      $node.append( $span );
    }
  };


  var getSource = function(){
    return source;
  };


  return {
    init: init,
    getSource: getSource
  };

})();
