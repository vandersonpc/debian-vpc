var Tool = (function(){

  var vendor = (navigator.userAgent.match(/(Chrome|Firefox)/) || [])[1];

  const OFFPAGE_PERCENT = 0.65;
  const ONPAGE_PERCENT = 0.35;
  const PAGINATION_OPTIONS = [10, 20, 50, 100, 200];
  const BACKLINKS_LINK_LEN = 50;
  const BACKLINKS_ANCHOR_LEN = 20;
  var currentBacklinksPerPage;

  var source = 'gsearc';
  var conf;
  var showLinkData = false;

  var darkMode = false;

  var rootSel = '#sbtc';
  var addMethod = 'appendTo';
  var rightColSelector = '#cnt:not(.rfli) #rhs';

  var serpObserver;

  var suggestionsObserver;
  var suggestionsTimer;
  var suggestionsList = {};
  var cachedSuggestions = {};

  var $popover;
  var popoverTimeout;


  var init = function(){
    if (document.location.href.indexOf('sorry/index') !== -1) {
      return;
    }
    var itemtype = document.documentElement.getAttribute('itemtype');
    if (!itemtype) itemtype = '';
    if (document.location.href.match(/google\.[\w.]+\/?$/)) itemtype = 'SearchResultsPage';
    if (document.location.href.match(/google\.[\w.]+\/[\w=?&]+$/)) itemtype = 'SearchResultsPage';
    if (itemtype.indexOf('SearchResultsPage') === -1) {
      return;
    }

    darkMode = isDarkMode();
    if (darkMode) {
      document.documentElement.setAttribute('dark', true);
    }

    initWindowMessaging();
    setTimeout( function(){
      var node = $('#sbtc')[0];
      if (!node) node = $('#tsf')[0];
      if (!node) node = $('form[role=search]')[0];
      if (!node) {
        console.error("Target not found");
        return;
      }
      initSERPMutationObserver();
      initSuggestionsMutationObserver(node);
      processPage();
    }, 500 );

    initURLChangeListener(function(){
      setTimeout( function(){
        processPage();
      }, 500 );
    });

    initPopover();
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
        var selector = '';
        if (source === 'pasf') selector = '#xt-google-people-search';
        if (source === 'ltkwid') selector = '#xt-google-ltkwid';
        else if (source === 'related') selector = '#xt-related-search';
        else if (source === 'trend') selector = '#xt-trend-chart-root';
        else if (source === 'trenkw') selector = '#xt-google-trenkw';
        else if (source === 'difficulty') selector = '#xt-difficulty-root';
        else if (source.indexOf('freeuser') !== -1) selector = '#xt-freeuser-root';
        if (!selector) return;
        if (height <= 0) return;
        if (data.isEmpty) height = 0;
        $(selector + ' iframe').height(height);
      }
    }, false);
  };


  var initPopover = function(){
    $popover = $('<div/>')
      .attr('id', 'xt-popover')
      .appendTo( $('body') );
    var hideTimer;

    $('body').on('mouseenter', '.xt-google-url-metrics, .xt-google-domain-link-metrics',
      function(e){
        var html = this.dataset.popover;
        var trendStr = this.dataset.trend;
        var rect = e.target.getBoundingClientRect();
        $popover[0].dataset.type = '';
        $popover.html(html);
        var top = document.documentElement.scrollTop + rect.top + rect.height - 5;
        showPopover($popover, top, e.pageX - 50);
        if (trendStr) {
          renderPopoverTrendChart($popover, trendStr, {darkMode: darkMode});
          var domain = this.dataset.domain;
          var arr = Common.parseTrendStr(trendStr, {moz: true});
          var $table = $popover.find('table');
            $table.append(`<tr class="xt-hidden"><td></td><td></td></tr>`);
            $table.append(`<tr class="xt-hidden"><td>Month</td><td>Domain Authority</td></tr>`);
          arr.map(function(item){
            $table.append(`<tr class="xt-hidden"><td>${item.date}</td><td>${item.val}</td></tr>`);
          });
          $popover.find('.xt-copy-csv').click(function(e){
            Common.exportTableToCSV({
              table: $popover.find('table'),
              method: 'copy'
            });
          });
          $popover.find('.xt-export-csv').click(function(e){
            Common.exportTableToCSV({
              table: $popover.find('table'),
              method: 'export',
              filename: domain.replace(/\s+/g, '_') + '-domain-link-metrics-' + Common.getDate('YYYY-MM-DD') + '.csv'
            });
          });
        }
      });
    $('body').on('mouseleave', '.xt-google-url-metrics, .xt-google-domain-link-metrics',
      function(e){
        clearTimeout(popoverTimeout);
        if ($(e.relatedTarget).closest('#xt-popover')[0] || e.relatedTarget === $popover[0]) return;
        hideTimer = setTimeout(function(){
          $popover.hide();
        }, 500);
      });
    $('body').on('mouseenter', '.xt-popover', function(e){
      if (hideTimer) clearTimeout(hideTimer);
      hideTimer = null;
    });

    $popover.mouseleave(function(e){
      $popover.hide();
    });

    $('body').on('click', '.xt-google-backlinks', function(e){
      var $self = $(this);
      var $next = $self.next();
      if ($next[0] && $next.hasClass('xt-backlinks-widget')) {
        if ($next.is(':visible')) {
          $next.hide();
          $self.text('Show backlinks');
        }
        else {
          $self.text('Hide backlinks');
          $next.show();
        }
        return;
      }
      else {
        $next = $('<div>', {class: 'xt-backlinks-widget xt-widget-table'}).insertAfter($self);
        $self.text('Hide backlinks');
      }
      var domain = this.dataset.domain;
      var page = this.dataset.page;
      runBacklinks({page: page, domain: domain, uniq: true, perDomain: false, $root: $next});
    });
  };


  var runBacklinks = function(params){
    html = `<div style="text-align:center"><img src="${chrome.runtime.getURL('img/spinner32.gif')}"></div>`;
    var settings = Starter.getSettings();
    var keywordsPerPage = settings.widgetBacklinksPerPage || 10;
    if (currentBacklinksPerPage) keywordsPerPage = currentBacklinksPerPage;
    params.$root.html(html);
    getBacklinks({
      domain: params.domain,
      page: params.page,
      uniq: params.uniq,
      perDomain: params.perDomain
    })
      .then(getBacklinksDomainsAuthority)
      .then(function(response){
        let html = processGetBacklinksResponse(response, params);
        params.$root.html(html);
        let $table = params.$root.find('table');
        Common.showWidgetTablePage($table, response.links, keywordsPerPage, 1);
        initBacklinksPopoverEvents(response, params);
      })
      .catch(function(response){
        console.log(response);
      });
  };


  var initBacklinksPopoverEvents = function(response, params){
    let $root = params.$root;
    $root.find('.xt-show-backlinks-retry').click(function(e){
      e.preventDefault();
      runBacklinks(params);
    });
    $root.find('.xt-show-backlinks-domain-page-toggle').click(function(e){
      e.preventDefault();
      let target = this.dataset.target;
      params.perDomain = target === 'domain';
      runBacklinks(params);
    });
    $root.find('.xt-show-backlinks-uniq-toggle').click(function(e){
      e.preventDefault();
      let uniq = this.dataset.uniq;
      params.uniq = uniq === 'uniq';
      runBacklinks(params);
    });
    $root.on('click', '[data-page]', function(e){
      e.preventDefault();
      var page = parseInt(this.dataset.page);
      var perPage = $root.find('.xt-widget-page-select').val();
      var html = Common.getPaginationHTML({perPage: perPage, rows: response.links, currentPage: page, options: PAGINATION_OPTIONS});
      $root.find('.xt-widget-pagination').html(html);
      var $table = $root.find('table');
      Common.showWidgetTablePage($table, response.links, perPage, page);
    });

    $root.on('change', '.xt-widget-page-select', function(e){
      var perPage = this.value;
      var html = Common.getPaginationHTML({perPage: perPage, rows: response.links, currentPage: 1, options: PAGINATION_OPTIONS});
      $root.find('.xt-widget-pagination').html(html);
      var $table = $root.find('table');
      Common.showWidgetTablePage($table, response.links, perPage, 1);
      currentBacklinksPerPage = perPage;
      chrome.runtime.sendMessage({
        cmd: 'setting.set',
        data: {
          key: 'widgetBacklinksPerPage',
          value: perPage
        }
      });
    });

    let filename = getBacklinksExportFilename(params);

    $root.find('.xt-copy-csv').click(function(e){
      e.preventDefault();
      var table = exportBacklinksTable( $($root.find('table')[0]), params );
      Common.exportTableToCSV({table: table, filename: filename, method: 'copy'});
    });

    $root.find('.xt-export-csv').click(function(e){
      e.preventDefault();
      var table = exportBacklinksTable( $($root.find('table')[0]), params );
      Common.exportTableToCSV({table: table, filename: filename});
    });
  };


  var getBacklinksExportFilename = function(params){
    var res = ['Backlinks'];
    res.push(params.uniq ? 'Unique' : 'All');
    if (!params.perDomain) {
      res.push('Page');
      res.push(params.page.replace(/https?:\/\//, '').substr(0, 40));
    }
    else {
      res.push('Domain');
      res.push(params.domain);
    }
    res = res.join('-') + '.csv';
    return res;
  };


  var exportBacklinksTable = function($table, params){
    var $result = $('<table>');
    $table.find('tr').each(function(i, tr){
      var $tr = $('<tr>').appendTo($result);
      $(tr).find('td,th').each(function(j, td){
        var text = td.textContent;
        if (td.querySelector('a[title]')) {
          text = td.querySelector('a').getAttribute('title');
        }
        $('<td>').text(text).appendTo($tr);
      });
    });
    return $result;
  };


  var getBacklinks = function(params){
    let cmd = '';
    if (params.uniq && params.perDomain) cmd = 'api.getUniqueDomainBacklinks';
    if (params.uniq && !params.perDomain) cmd = 'api.getUniquePageBacklinks';
    if (!params.uniq && params.perDomain) cmd = 'api.getDomainBacklinks';
    if (!params.uniq && !params.perDomain) cmd = 'api.getPageBacklinks';

    return new Promise(function(resolve, reject){
      chrome.runtime.sendMessage({
        cmd: cmd,
        data: params
      }, function(response){
        resolve(response);
      });
    });
  };


  var getBacklinksDomainsAuthority = function(response){
    if (response.error) {
      response.links = [];
      return response;
    }
    let links = response.backlinks || [];
    let authorityByDomain = {};
    let promises = [];
    let chunks = [];
    let chunkSize = 500;
    let settings = Starter.getSettings();
    let linksClone = links.slice();
    for (let i = 0, len = Math.ceil(linksClone.length/chunkSize); i < len; i++) {
      chunks.push( linksClone.splice(0, chunkSize));
    }
    chunks.map(function(chunk){
      let promise = new Promise(function(resolve){
        let domains = [];
        if (!chunk.length) {
          resolve({links: chunk});
          return;
        }
        chunk.map(function(item){
          domains.push(item.domain_source);
        });
        chrome.runtime.sendMessage({
          cmd: 'api.getDomainLinkMetrics',
          data: {
            domains: domains,
            country: settings.country
          }
        }, function(json){
          if (json.error) {
            console.log(json);
            resolve({links: chunk});
            return;
          }
          json.data.map(function(item){
            if (item.error) return;
            let da = item.data.moz_domain_authority;
            authorityByDomain[item.domain] = da;
          });
          resolve({
            links: chunk,
            authorityByDomain: authorityByDomain
          });
        });
      });
      promises.push(promise);
    });
    return Promise.all(promises).then(function(responses){
      console.log(responses);
      return {
        links: links,
        authorityByDomain: authorityByDomain
      };
    });
  };


  var processGetBacklinksResponse = function(response, params){
    let links = response.links;
    let authorityByDomain = response.authorityByDomain;
    var settings = Starter.getSettings();
    var keywordsPerPage = settings.widgetBacklinksPerPage || 10;
    console.log(response);
    if (currentBacklinksPerPage) keywordsPerPage = currentBacklinksPerPage;
    let html = `
      <div class="xt-backlinks-widget-controls">
        <button class="xt-ke-btn xt-show-backlinks-domain-page-toggle" data-target="${params.perDomain ? 'page' : 'domain'}">show backlinks for ${params.perDomain ? 'page' : 'entire domain'}</button>
        <button class="xt-ke-btn xt-show-backlinks-uniq-toggle" data-uniq="${params.uniq ? '' : 'uniq'}">show ${params.uniq ? 'all backlinks' : 'only one backlink'} per subdomain</button>
      </div>
    `;
    if (response.error) {
      html += '<div class="xt-ke-mt-md xt-text-center">Unable to get data <a href="#" class="xt-show-backlinks-retry" data-target="domain">Try again?</a></div>';
    }
    else if (!links.length) {
      html += '<div class="xt-ke-mt-md xt-text-center">No backlinks found for this page <a href="#" class="xt-show-backlinks-domain-page-toggle" data-target="domain">View backlinks for the entire domain</a></div>';
    }
    else {
      html += '<table><thead>';
      html += '<tr><th>URL</th><th>Anchor Text</th><th class="xt-ke-text-right">Moz DA</th><th class="xt-hidden">Target URL</th></tr></thead><tbody>';
      let domains = [];
      links.map(function(item){
        let da = authorityByDomain[item.domain_source];
        let daStr = da ? `${da}/100` : '-';
        let tr = `<tr data-domain="${Common.escapeHtml(item.domain_source)}">`;
        tr += `<td><a href="${Common.escapeHtml(item.url_source)}" target="_blank" title="${Common.escapeHtml(item.url_source)}">${Common.shortenStr(Common.escapeHtml(item.url_source), BACKLINKS_LINK_LEN)}</a></td>`;
        let anchorText = Common.escapeHtml(Common.decodeHTMLEntities(item.anchor_text));
        tr += `<td><a href="${Common.escapeHtml(item.url_target)}" target="_blank" title="${anchorText}">${Common.shortenStr(anchorText, BACKLINKS_ANCHOR_LEN)}</a></td>`;
        tr += `<td class="xt-ke-text-right"><span class="xt-ke-badge xt-ke-badge-light xt-ke-px-10px">${daStr}</span></td>`;
        tr += `<td class="xt-hidden">${item.url_target}</td>`;
        tr += '</tr>';
        html += tr;
      });
      html += '</tbody></table>';
      html += '<div class="xt-widget-pagination">' + Common.getPaginationHTML({perPage: keywordsPerPage, rows: links, currentPage: 1, options: PAGINATION_OPTIONS}) + '</div>';
      html += [
        '<div class="xt-copy-export-row">',
          '<button class="xt-copy-csv xt-ke-btn">' + Common.getIcon('copy') + ' Copy</button>',
          '<button class="xt-export-csv xt-ke-btn">' + Common.getIcon('export') + ' Export</button>',
        '</div>'].join('\n');
    }
    return html;
  };


  var showPopover = function($popover, top, left){
    if (popoverTimeout) clearTimeout(popoverTimeout);
    popoverTimeout = setTimeout(function(){
      $popover
        .show()
        .css('top', top)
        .css('left', left);
    }, 300);
  };


  var isDarkMode = function() {
    let bgColor = getComputedStyle(document.body).backgroundColor;
    if (bgColor === "rgb(255, 255, 255)") return false;
    else return true;
  };


  var getQuery = function(corrected){
    var query = getURLParameter('q', true);
    if (!query) query = getURLParameter('q');
    if (!query) query = getURLParameter('as_q');
    if (!query) query = '';
    if (corrected) {
      var correctedText = $.trim( $('#taw .med').text() );
      if (correctedText && correctedText.match(/(did you mean|including results for|showing results for)/i)) {
        query = $.trim($($('#taw .med a')[0]).text());
      }
    }
    return query;
  };


  var isSearchResultsView = function(){
    var tbm = getURLParameter('tbm');
    return !tbm;
  };


  var isAutocompleteResultsView = function(){
    var tbm = getURLParameter('tbm');
    if (!tbm || tbm === 'vid' || tbm === 'isch' || tbm === 'nws') {
      return true;
    }
  };


  var isGoogleMap = function(){
    return !!$('#lu_pinned_rhs')[0];
  };


  var processPage = function(){
    var query = getQuery();
    if (!query) {
      UIHelper.moveButtons(50);
      return;
    }
    else UIHelper.moveButtons(10);
    query = Common.cleanKeyword(query);
    var metricsPromise = Promise.resolve({});
    var plan = Common.getPlan();
    var config = Common.getConfig();
    var hasCredits = Common.getCredits() > 0 || (config.areSubsEnabled && plan.credits > 0);
    conf = config.google;
    if (config.showLinkData) showLinkData = true;
    if (hasCredits) {
      metricsPromise = new Promise((resolve) => {
        chrome.runtime.sendMessage({
          cmd: 'api.getKeywordData',
          data: {
            keywords: [query],
            src: source
          }
        }, function( json ){
          UIHelper.checkErrors(json, $('#top_nav')[0]);
          processQueryResponse( json );
          resolve(json);
        });
      });
    }
    if (isGoogleMap()) return;
    if (!isSearchResultsView()) return;

    if (config.areSubsEnabled && (!plan.plan || !plan.credits)) {
      renderPromoIframe();
      return;
    }

    var settings = Starter.getSettings();
    if (settings.showGoogleTrendChart) {
      initTrendsChart({
        showVolume: hasCredits,
        query: query,
        metrics: metricsPromise,
        timeRange: settings.googleTrendChartDefaultTime
      });
    }
    if (settings.showDifficultyMetrics) {
      getDifficulty();
    }
    getTrendingKeywords();
    getLTKQueries();
    setTimeout(function(){
      processRelatedSearch();
      processPeopleAlsoSearch();
    }, 1000);
    runURLMetricsChecking();
  };


  var getWidgetsParent = function(){
    var $rhs = $(rightColSelector);
    if ($rhs[0]) {
      return $rhs[0];
    }
    if ($('#xt-ke-widgets-root')[0]) return $('#xt-ke-widgets-root')[0];
    var $widgetsRoot = $('<div>', {id: 'xt-ke-widgets-root'});
    var $rcnt = $('#rcnt');
    var $centerCol = $('#center_col');
    var rect;
    if ($centerCol[0]) rect = $centerCol[0].getBoundingClientRect();
    var left;
    if (rect) left = rect.right;
    if ($rcnt[0] && $centerCol[0] && getComputedStyle($rcnt[0]).display === 'flex') {
      $widgetsRoot.insertAfter($centerCol)
        .css({'margin-left': 30});
      $rcnt.css({'max-width': 'fit-content'});
      if (document.documentElement.clientWidth > 2232 && $centerCol[0].previousElementSibling) {
        $rcnt.css({'max-width': 'min-content'});
      }
    }
    else if ($rcnt[0] && $centerCol[0] && getComputedStyle($rcnt[0]).display !== 'grid') {
      $widgetsRoot.insertAfter($centerCol.parent())
        .addClass('xt-ke-google-widgets-float')
        .css({'margin-left': left + 50});
    }
    else {
      $widgetsRoot.appendTo('body').addClass('xt-ke-google-widgets-absolute');
      if (left) $widgetsRoot.css({'left': left + 50});
    }
    return $widgetsRoot[0];
  };


  var runURLMetricsChecking = function(){
    var settings = Starter.getSettings();
    if (!settings.showGoogleTraffic && !settings.showGoogleMetrics) return;
    processURLs(settings.showGoogleTraffic, settings.showGoogleMetrics);
  };


  var processURLs = function(showGoogleTraffic, showGoogleMetrics, parentId){
    if (!parentId) parentId = '#search';
    var $items = $(parentId + ' .g a[ping] h3:visible');
    var $itemsWithoutPing = $(parentId + ' .g a h3:visible');
    if ($items.length && $items.length < $itemsWithoutPing.length) {
      $itemsWithoutPing.map(function(i, node){
        if ($(node).closest('a').attr('href').match(/https.*google\.com/)) {
          $items = $items.add(node);
        }
      });
    }
    if (vendor === 'Firefox') {
      $items = $(parentId + ' .g a h3');
    }
    if (!$items.length && $itemsWithoutPing.length) {
      $items = $itemsWithoutPing;
    }
    if ($items.length) {
      $items = $items.map(function(i, item){
        return item.parentNode;
      });
    }
    else $items = $(parentId + ' .g .r > a');
    var urls = {};
    var serpItems = [];
    $items.map(function(i, node){
      var $node = $(node);
      if ($node.closest('g-accordion-expander')[0]) {
        return;
      }
      if ($node.closest('.related-question-pair')[0]) {
        return;
      }
      var $parent = $($node.closest('.g'));
      if ($parent.find('.xt-google-domain-link-metrics, .xt-google-url-metrics')[0]) return;
      urls[node.href] = node;
      let domain = Common.getHost(node.href);
      serpItems.push({node: node, url: node.href, domain: domain});
    });
    var domains = Object.keys(urls);
    var list = Object.keys(urls);
    var settings = Starter.getSettings();
    if (showGoogleMetrics) {
      getGoogleMetrics(serpItems);
    }
    if (showGoogleTraffic) {
      var urlPromise = new Promise(function(resolve){
        chrome.runtime.sendMessage({
          cmd: 'api.getURLMetrics',
          data: {
            urls: list,
            country: settings.country
          }
        }, function(json){
          resolve(json);
        });
      });
      var domainPromise = new Promise(function(resolve){
        chrome.runtime.sendMessage({
          cmd: 'api.getDomainMetrics',
          data: {
            domains: domains,
            country: settings.country
          }
        }, function(json){
          resolve(json);
        });
      });
      Promise.all([urlPromise, domainPromise]).then(function(responses){
        // console.log(responses);
        processGetMetricsResponse(responses, {
          urls: urls,
          country: settings.country
        });
      });
    }
  };


  var getGoogleMetrics = function(list){
    var domains = list.map(function(item){
      return item.domain;
    });
    var settings = Starter.getSettings();
    chrome.runtime.sendMessage({
      cmd: 'api.getDomainLinkMetrics',
      data: {
        domains: domains,
        country: settings.country
      }
    }, function(json){
      processGetDomainLinkMetricsResponse(json, list);
      // resolve(json);
    });
  };


  var domainLinkPopoverHTML = function(params) {
    let propensity = params.moz_link_propensity / 100;
    if (propensity) propensity = propensity.toFixed(2) + '%';
    else propensity = '-';
    const data = [
      { title: "Domain Authority", value: `${params.moz_domain_authority}/100` },
      { title: "DA Trend (12mo)", value: `${params.trendPercent}%` },
      { title: "Spam Score", value: `${params.moz_spam_score < 0 ? '-' : params.moz_spam_score + '%'}` },
      { title: "Link Propensity", value: propensity },
      { title: "Referring Domains", value: params.moz_root_domains_to_subdomain.toLocaleString() },
      { title: "Total Backlinks", value: params.moz_external_pages_to_subdomain.toLocaleString() }
    ];

    const dataLength = data.length;

    let tableHTML = '<table class="xt-hidden">' + data.map((row) => {
      return `<tr><td>${row.title}</td><td>${row.value}</td></tr>`;
    }).join('') + '</table>';

    const mozInfoHtml = data.map((row, i) => `
        <div class="${ i < dataLength - 3 ? "xt-ke-mb-md" : ""}">
          <div class="xt-ke-font-sm">
            <span class="xt-ke-cl-dk">${row.title}</span>
          </div>
          <div class="xt-ke-font-lg xt-ke-value xt-ke-popup-value">
            ${row.value}
          </div>
        </div>
    `);

    let html = `
      <div class="xt-popover-header">
        <div class="xt-ke-bold xt-ke-title xt-ke-mb-0 xt-ke-cl-dk">
            <img class="xt-ke-logo" src="${chrome.runtime.getURL('/img/icon24.png')}">Link Metrics For <a href="${params.url}" target="_blank">${params.domain}</a>
        </div>
      </div>

      <div class="xt-popover-content xt-links-popover xt-popover-content-col-3 b-b">
        ${mozInfoHtml.join('')}
      </div>

      <div class="xt-popover-content">
        <canvas class="xt-popover-trend-chart"></canvas>
      </div>

      <div class="xt-popover-footer xt-ke-d-flex xt-ke-align-items-center b-t">
          <button class="xt-copy-csv xt-ke-btn">${Common.getIcon('copy')} Copy</button>
          <button class="xt-export-csv xt-ke-btn xt-ke-ml-md">${Common.getIcon('export')} Export</button>

          <img src="${chrome.runtime.getURL('img/moz_blue.png')}" alt="" class="xt-popover-logo xt-ke-ms-auto" />
      </div>
      ${tableHTML}
    `;

    return html;
  };

  var metricsPopoverHTML = function(params){
    var html = `
      <div class="xt-popover-header b-b">
        <div class="xt-ke-bold xt-ke-title"><img class="xt-ke-logo" src="${chrome.runtime.getURL('/img/icon24.png')}"><a href="${params.url}" target="_blank">${params.url}</a></div>
        <div class="xt-ke-subtitle"><span class="xt-ke-bold" style="margin-right: 1rem">${params.domain}</span><span class="xt-ke-badge xt-ke-badge-gr xt-ke-font-sm">${aHrefHTML(params.toppagesURL, 'view top pages')}</span></div>
        <div>Country: ${params.countryStr}</div>
      </div>

      <div class="xt-popover-content xt-popover-content-col">
        <div class="xt-ke-mb-lg">
          <div class="xt-ke-font-sm">
            <span class="xt-ke-cl-dk">Organic Traffic</span><br>per month for URL
          </div>
          <div class="xt-ke-font-lg xt-ke-value xt-ke-popup-value">
            <a href="${params.keywordsURL}" target="_blank">${params.trafURLData}/mo</a>
          </div>
        </div>

        <div class="xt-ke-mb-lg">
            <div class="xt-ke-font-sm">
                <span class="xt-ke-cl-dk">Organic Traffic</span><br>per month for ${params.domain}
            </div>
            <div class="xt-ke-font-lg xt-ke-value xt-ke-popup-value">
                <a href="${params.keywordsDomainURL}" target="_blank">${params.trafDomData}/mo</a>
            </div>
        </div>

        <div>
            <div class="xt-ke-font-sm">
                <span class="xt-ke-cl-dk">Total Keywords</span><br>that URL ranks for
            </div>
            <div class="xt-ke-font-lg xt-ke-value xt-ke-popup-value">
              <a href="${params.keywordsURL}" target="_blank">${params.kwURLData}</a>
            </div>
        </div>

        <div>
          <div class="xt-ke-font-sm">
            <span class="xt-ke-cl-dk">Total Keywords</span><br>that ${params.domain} ranks for
          </div>
          <div class="xt-ke-font-lg xt-ke-value xt-ke-popup-value">
            <a href="${params.keywordsDomainURL}" target="_blank">${params.kwDomData}</a>
          </div>
        </div>
      </div>
    `;
    return html;
  };


  var aHrefHTML = function(href, anchor){
    return `<a href="${href}" target="_blank">${anchor}</a>`;
  };


  var processGetMetricsResponse = function(responses, params){
    var urls = params.urls;
    var country = params.country;
    var urlsJSON = responses[0];
    var domainsJSON = responses[1];
    if (urlsJSON.error) return;
    var payload = urlsJSON.data;
    var domainsPayload = !domainsJSON.error ? domainsJSON.data : {};
    var domainDataByDomain = {};
    domainsPayload.map(item => {
      domainDataByDomain[item.domain] = item.data;
    });
    var countryStr = `(${ country ? country : 'us'})`;
    for (let url in urls) {
      let item = (payload.filter(function(x){
        return x.url === url;
      }))[0];
      let domain = Common.getHost(url);
      let domainData = domainDataByDomain[domain];
      if (!domainData && !item) continue;
      let id = btoa(url);
      let keywordsURL = chrome.runtime.getURL('html/page.html?page=keywords&target=url&id=' + id);
      let keywordsDomainURL = chrome.runtime.getURL('html/page.html?page=keywords&target=domain&id=' + id);
      let toppagesURL = chrome.runtime.getURL('html/page.html?page=toppages&id=' + id);
      let etv_format = '-';
      let total_keywords_format = '-';
      let trafURLData = '-';
      let kwURLData = '-';
      if (item) {
        let data = item.data;
        trafURLData = data.etv.toLocaleString();
        kwURLData = data.total_keywords.toLocaleString();
        etv_format = data.etv_format;
        total_keywords_format = data.total_keywords_format;
      }
      let popoverParams = {
        country: country.toUpperCase(),
        countryStr: countryStr,
        url: url,
        domain: domain,
        keywordsURL: keywordsURL,
        keywordsDomainURL: keywordsDomainURL,
        toppagesURL: toppagesURL,
        trafURLData: trafURLData,
        kwURLData: kwURLData
      };
      let trafVals = aHrefHTML(keywordsURL, etv_format + '/mo');
      if (domainData) {
        trafVals += ' (website: ' + aHrefHTML(keywordsDomainURL, domainData.etv_format + '/mo') + ')';
        popoverParams.trafDomData = domainData.etv.toLocaleString();
      }
      let kwVals = aHrefHTML(keywordsURL, total_keywords_format);
      if (domainData) {
        kwVals += ' (website: ' + aHrefHTML(keywordsDomainURL, domainData.total_keywords_format) + ')';
        popoverParams.kwDomData = domainData.total_keywords_format;
      }
      let str = `
        <span class="xt-ke-cl-dk">Search traffic</span> ${countryStr}: <span class="xt-ke-value xt-ke-traf-vals">${trafVals}</span> -
        <span class="xt-ke-cl-dk">Keywords</span> ${countryStr}: <span class="xt-ke-value xt-ke-kw-vals">${kwVals}</span>`;
      let node = urls[url];
      if (!node) {
        console.log("Can't find item", url, urls);
        continue;
      }
      let $node = $(node);
      var popoverHTML = metricsPopoverHTML(popoverParams);
      var $root;
      var $parent = getMetricsParent($node);
      if ($parent.find('.xt-google-url-metrics')[0]) {
        continue;
      }
      $root = $(`<div class="xt-google-url-metrics">${str}</div>`);

      $root.appendTo($parent);
      $root[0].dataset.popover = popoverHTML;
      $parent.find('.xt-google-url-metrics a').click(function(e){
        e.preventDefault();
        chrome.runtime.sendMessage({
          cmd: 'new_tab',
          data: this.href
        });
      });
    }
  };


  var getMetricsParent = function($node){
    return $node.parent();
  };


  // after
  var getMetricsParent_ = function($node){
    var $parent;

    var $g = $node.closest('.g');
    // var $res = $g.find('div > div');
    var $res = $g.find('div[jscontroller] > div');
    if ($res[0]) $parent = $($res[$res.length - 1]);
    if (!$parent[0]) {
      var $em = $($g.find('em')[0]);
      if ($em[0]) {
        var parent = $em.closest('div[jscontroller] > div')[0];
        if (parent) $parent = $(parent);
      }
    }

    if (!$parent[0]) {
      $parent = $node.closest('video-voyager');
    }
    var style = {};
    if ($parent[0]) style = getComputedStyle($parent[0]);
    if (style.gridTemplateAreas || style.display === 'flex') {
      $parent = $parent.parent();
    }
    if (!$parent[0]) {
      return $([]);
    }
    return $parent;
  };


  var getDescriptionNode = function($node){
    var em = $node.find('em')[0];
    if (em) return $(em.parentNode);
    return $([]);
  };


  var processGetDomainLinkMetricsResponse = function(response, serpItems){
    if (response.error) {
      return;
    }
    var dataByDomain = {};
    response.data.map(function(item){
      var domain = item.domain;
      dataByDomain[domain] = item.data;
    });
    serpItems.map(function(item){
      var node = item.node;
      var $node = $(node);
      var data = dataByDomain[item.domain];
      if (!data) return;
      var $parent = getMetricsParent($node);
      var popoverParams = data;
      popoverParams.domain = item.domain;
      popoverParams.url = item.url;
      var $root;
      if (!data.moz_da_history_values) return;
      popoverParams.trendPercent = Common.getTrendPercent(data.moz_da_history_values, {moz: true});
      // popoverParams.trendImg = Common.getTrendImgHTML(data.moz_da_history_values, false, {color: '#aaa', sizeFactor: 3, moz: true});
      var popoverHTML = domainLinkPopoverHTML(popoverParams);
      var str = `<span>MOZ DA: ${data.moz_domain_authority}/100 (${popoverParams.trendPercent}%)</span><span>Ref Dom: ${Common.formatNumber(data.moz_root_domains_to_subdomain)}</span> <span>Ref Links: ${Common.formatNumber(data.moz_external_pages_to_subdomain)}</span> <span>Spam Score: ${data.moz_spam_score >= 0 ? data.moz_spam_score + '%' : '-'}</span>`;
      if ($parent[0]) {
        if ($parent.find('.xt-google-domain-link-metrics-root')[0]) return;
        $root = $('<div>', {class: 'xt-google-domain-link-metrics-root'});
        if (!$parent.find('.xt-google-url-metrics')[0]) $root.appendTo($parent);
        else $root.insertBefore($parent.find('.xt-google-url-metrics'));
        var $metricsRoot = $(`<span class="xt-google-domain-link-metrics">${str}</span>`).appendTo($root);
        $metricsRoot[0].dataset.popover = popoverHTML;
        $metricsRoot[0].dataset.trend = data.moz_da_history_values;
        $metricsRoot[0].dataset.domain = item.domain;
        if (showLinkData) {
          var $a = $(`<a class="xt-google-backlinks" data-domain="${item.domain}" data-page="${item.url}" data-da="${data.moz_domain_authority}">Show backlinks</a>`).appendTo($root);
        }
      }
    });
  };


  var renderPopoverTrendChart = function($popover, trendStr, params, data){
    if (!params) params = {};
    if (!data) data = {};
    var arr = Common.parseTrendStr(trendStr, {moz: true});
    var labels = [];
    var values = [];
    arr.map(function(item){
      labels.push(item.date);
      values.push(item.val);
    });
    var $canvas = $($popover.find('canvas'));
    var ctx = $canvas[0].getContext('2d');
    var grayColor = params.darkMode ? '#aaa' : '#70757a';
    var gridColor = params.darkMode ? '#3e3e3e' : '#d9e2ef';
    var chartColor = '#c0504f';
    var chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: '',
          backgroundColor: chartColor,
          borderColor: chartColor,
          // partialColor: '#00f000',
          data: values,
          colors: ['', 'red', 'green', 'blue']
        }],
        type: "line",
        pointRadius: 0,
        lineTension: 0,
        borderWidth: 1
      },
      options: {
        elements: {
          point:{
            radius: 0
          }
        },
        legend: {
          display: false
        },
        animation: {
          duration: 0
        },
        scales: {
          xAxes: [{
            gridLines: {
              display: false
            }
          }],
          yAxes: [{
            ticks: {
              beginAtZero: true,
              stepSize: 20,
              max: 100,
              padding: 10,
              fontColor: grayColor,
            },
            gridLines: {
              borderDashOffset: [2],
              drawBorder: false,
              color: gridColor,

              zeroLineColor: gridColor,
              zeroLineBorderDash: [2],
              zeroLineBorderDashOffset: [2]
            },
            scaleLabel: {
              display: true,
              fontColor: grayColor,
              labelString: 'Domain Authority'
            }
          }]
        },
        tooltips: {
          intersect: false,
          mode: "index",
          // callbacks: {
          //   label: function(e, t) {
          //     let res = parseFloat(e.value).toLocaleString();
          //     return `${res}`;
          //   },
          //   title: function(e, t){
          //     let index = e[0].index;
          //     let res = data.formattedTime[index];
          //     return res;
          //   }
          // }
        }
      }
    });
    chart.update();
  };


  var processRelatedSearch = function(manual){
    // see Oct 18 issue with google maps
    if (document.location.pathname.indexOf('/search') !== 0) return;
    var list = [];
    if (conf && conf.relatedSearchSelectors) {
      for (var i = 0, len = conf.relatedSearchSelectors.length; i < len; i++) {
        var selItem = conf.relatedSearchSelectors[i];
        list = $(selItem.sel);
        if (selItem.ignoreClosest) {
          selItem.ignoreClosest.map(function(filterSelector){
            if (list.closest(filterSelector)[0]) list = $([]);
          });
        }
        // console.log(selItem, list);
        if (list.length) break;
      }
    }
    else {
      list = $('._e4b a:not([target="_blank"]');
      if (!list.length) {
        list = $('#extrares .brs_col a:not([target="_blank"])');
      }
      if (!list.length) {
        list = $('#botstuff .brs_col a:not([target="_blank"])');
      }
      if (!list.length) {
        list = $('#botstuff #bzMwOe a span');
        if (list.closest('g-more-link')[0] || list.closest('g-popup')[0]) list = [];
      }
      if (!list.length) {
        list = $('#botstuff #bzMwOe a .s75CSd');
        if (list.closest('g-more-link')[0] || list.closest('g-popup')[0]) list = [];
      }
      if (!list.length) {
        list = $('#extrares #bres a.F3dFTe');
      }
    }
    var $mosaicItems = getRelatedSearchMosaicKeywords();
    $mosaicItems.map(function(i, item){
      list.push(item);
    });
    if (!list.length) return;
    var keywords = {};
    for (var i = 0, len = list.length; i < len; i++) {
      var keyword = Common.cleanKeyword( list[i].textContent );
      keywords[ keyword.toLowerCase() ] = list[i];
    }
    var settings = Starter.getSettings();
    if ( (!settings.sourceList.gprsea && !manual) || !settings.apiKey ) {
      var rows = [];
      for (var keyword in keywords) {
        rows.push({keyword: keyword});
      }
      renderWidgetTable('related-keywords', rows, null);
      return;
    }
    processKeywords( keywords, {} );
  };


  var getRelatedSearchMosaicKeywords = function(){
    var list = [];
    if (conf && conf.relatedMosaicSelectors) {
      for (var i = 0, len = conf.relatedMosaicSelectors.length; i < len; i++) {
        var selItem = conf.relatedMosaicSelectors[i];
        list = $(selItem.sel);
        if (list.length) break;
      }
    }
    else {
      list = $('#botstuff [jscontroller="V9u9Nb"] a, #botstuff [jscontroller="V9u9Nb"] a');
    }
    list = list.filter(function(i, node){
      if (node.querySelector('g-more-link')) return false;
      return true;
    });
    return list;
  };


  var getPASFData = function(){
    return new Promise(function(resolve, reject){
      chrome.runtime.sendMessage({
        cmd: 'api.getPASFData',
        data: {
          keyword: getQuery()
        }
      }, function(res){
        resolve(res);
      });
    });
  };


  var processPeopleAlsoSearch = async function(manual){
    var keywords = {};
    var rows = [];
    var $nodes = $( "div.g div .rc div div[id^='eobd'] div" );
    if (!$nodes.length) {
      $nodes = $("div.g div[jsname=d3PE6e] div[data-ved]");
    }
    $nodes.each(function( index ) {
      var keyword = this.textContent;
      keywords[keyword] = true;
    });
    var listLen = Object.keys(keywords).length;
    if (listLen === 0) {
      var res = await getPASFData();
      if (res && res.keywords && res.keywords.length) {
        res.keywords.map(function(keyword){
          keywords[keyword] = true;
        });
      }
      else return;
    }
    var settings = Starter.getSettings();
    var hasCredits = Common.getCredits() > 0;
    if ( (!settings.sourceList.gpasea && !manual) || !settings.apiKey || !hasCredits) {
      for (var keyword in keywords) {
        rows.push({keyword: keyword});
      }
      renderWidgetTable('people-also-search', rows, null);
      return;
    }
    Common.processKeywords({
      keywords: Object.keys(keywords),
      tableNode: null,
      src: source,
      from: 'pasf',
      seed: getQuery('corrected'),
      noCheckCredits: true
    }, function(json){
      console.log(json.error_code);
      if (json.error_code === 'NOCREDITS') {
        for (var keyword in keywords) {
          rows.push({keyword: keyword});
        }
        renderWidgetTable('people-also-search', rows, null, 'nocredits');
      }
      else {
        processPeopleAlsoSearchResponse(json, keywords, rows);
      }
    });
  };


  var hasAutocompleteSuggestions = function(aQuery, response){
    if (!response) return false;
    if (!response.length) return false;
    if (response.length === 1) {
      let keyword = response[0].keyword;
      if (keyword === aQuery) return false;
    }
    return true;
  };


  var getTrendingKeywords = function(manual){
    var query = getQuery();
    query = Common.cleanKeyword(query);
    let params = {};
    let settings = Starter.getSettings();
    let geo = settings.country.toUpperCase();
    if (!geo) geo = 'US';
    if (geo === 'UK') geo = 'GB';
    params.geo = geo;
    let property = '';
    let timeRange = '30d';
    chrome.runtime.sendMessage({cmd: 'googleTrendsAPI.relatedsearches', data: {
      keyword: query,
      timeRange: timeRange,
      geo: geo,
      property: property || ''
    }}, (res) => {
      processTrendingKeywordsResponse(res, manual);
    });
  };


  var processTrendingKeywordsResponse = function(res, manual){
    try {
      let arr = res.json.default.rankedList[1].rankedKeyword;
      var keywords = {};
      var rows = [];
      arr.map(function(item) {
        let keyword = item.query;
        keywords[keyword] = item.value;
      });
      var listLen = Object.keys(keywords).length;
      if (listLen === 0) return;
      var settings = Starter.getSettings();
      var hasCredits = Common.getCredits() > 0;
      if ( (!settings.sourceList.trenkw && !manual) || !settings.apiKey || !hasCredits) {
        for (var keyword in keywords) {
          rows.push({keyword: keyword, trendingValue: keywords[keyword]});
        }
        renderWidgetTable('trending-keywords', rows, null);
        return;
      }
      chrome.runtime.sendMessage({
        cmd: 'api.postTrendKeywords',
        data: {
          list: Object.keys(keywords)
        }
      }, function(){});
      Common.processKeywords({
        keywords: Object.keys(keywords),
        tableNode: null,
        src: source,
        from: 'trenkw',
        seed: getQuery('corrected'),
        noCheckCredits: true
      }, function(json){
        if (json.error_code === 'NOCREDITS') {
          for (var keyword in keywords) {
            rows.push({keyword: keyword, trendingValue: keywords[keyword]});
          }
          renderWidgetTable('trending-keywords', rows, null, 'nocredits');
        }
        else {
          // console.log(json, keywords, rows);
          if (typeof json.data !== 'object') return;
          for (var key in json.data) {
            var item = json.data[key];
            item.trendingValue = keywords[item.keyword];
            rows.push(item);
          }
          rows.sort(function(a,b){
            var aVal = parseInt(a.trendingValue);
            var bVal = parseInt(b.trendingValue);
            return bVal - aVal;
          });
          renderWidgetTable('trending-keywords', rows, json);
        }
      });
    } catch (e) {
      console.log(e);
    }
  };


  var getLTKQueries = async function(manual){
    var query = getQuery();
    query = Common.cleanKeyword(query);

    var aQuery = query + ' *';
    var response1 = await autocompleteQuery(aQuery, aQuery.length - 1);
    if (!hasAutocompleteSuggestions(aQuery, response1)) response1 = await autocompleteQuery(query + ' ?', aQuery.length - 1);

    aQuery = '* ' + query;
    var response2 = await autocompleteQuery(aQuery, 1);
    if (!hasAutocompleteSuggestions(aQuery, response2)) response2 = await autocompleteQuery('? ' + query, 1);

    var response3, response4, response5;
    var words = query.split(' ');
    if (words.length >= 2)  {
      var words2 = words.slice();
      words2.splice(1, 0, '*');
      var wordsStr = words2.join(' ');
      response3 = await autocompleteQuery(wordsStr, words[0].length);
      if (!response3.length) {
        words2[1] = '?';
        response3 = await autocompleteQuery(words2.join(' '), words[0].length);
      }
    }
    if (words.length >= 3) {
      var words3 = words.slice();
      words3.splice(2, 0, '*');
      var wordsStr = words3.join(' ');
      response4 = await autocompleteQuery(wordsStr, words[0].length);
    }
    if (words.length >= 4) {
      var words4 = words.slice();
      words4.splice(3, 0, '*');
      var wordsStr = words4.join(' ');
      response5 = await autocompleteQuery(wordsStr, words[0].length);
    }

    var keywords = {};
    var rows = [];
    response1.map(item => {
      let kw = Common.decodeHTMLEntities(item.keyword);
      keywords[kw] = true;
    });
    response2.map(item => {
      let kw = Common.decodeHTMLEntities(item.keyword);
      keywords[kw] = true;
    });
    if (response3) {
      response3.map(item => {
        let kw = Common.decodeHTMLEntities(item.keyword);
        keywords[kw] = true;
      });
    }
    if (response4) {
      response4.map(item => {
        let kw = Common.decodeHTMLEntities(item.keyword);
        keywords[kw] = true;
      });
    }
    if (response5) {
      response5.map(item => {
        let kw = Common.decodeHTMLEntities(item.keyword);
        keywords[kw] = true;
      });
    }
    delete keywords[query];
    // console.log(keywords);
    if (!Object.keys(keywords).length) return;
    var settings = Starter.getSettings();
    var hasCredits = Common.getCredits() > 0;
    if ( (!settings.sourceList.ltkwid && !manual) || !settings.apiKey || !hasCredits ) {
      for (var keyword in keywords) {
        rows.push({keyword: keyword});
      }
      renderWidgetTable('ltkwid', rows, null);
      return;
    }
    Common.processKeywords({
      keywords: Object.keys(keywords),
      tableNode: null,
      src: source,
      from: 'ltkwid',
      seed: getQuery('corrected'),
      noCheckCredits: true
    }, function(json){
      if (json.error_code === 'NOCREDITS') {
        for (var keyword in keywords) {
          rows.push({keyword: keyword});
        }
        renderWidgetTable('ltkwid', rows, null, 'nocredits');
      }
      else {
        ltkResponse(json, keywords, rows);
      }
    });
  };


  var autocompleteQuery = function(query, cp){
    return new Promise(function(resolve, reject){
      let tld = document.location.host.replace('www.', '').replace('google.', '');
      chrome.runtime.sendMessage({
        cmd: 'autocomplete',
        data: {
          service: 'google',
          query: query,
          tld: tld,
          cp: cp
        }
      }, function(response){
        if (!response.error) resolve(response.data);
        else resolve([]);
      });
    });
  };


  var processPeopleAlsoSearchResponse = function(json, keywords, rows){
    // console.log(json, keywords, rows);
    if (typeof json.data !== 'object') return;
    for (var key in json.data) {
      var item = json.data[key];
      rows.push(item);
    }
    rows.sort(function(a,b){
      var aVol = parseInt(a.vol.replace(/[,.\s]/g, ''));
      var bVol = parseInt(b.vol.replace(/[,.\s]/g, ''));
      return bVol - aVol;
    });
    renderWidgetTable('people-also-search', rows, json);
  };


  var ltkResponse = function(json, keywords, rows){
    // console.log(json, keywords, rows);
    if (typeof json.data !== 'object') return;
    for (var key in json.data) {
      var item = json.data[key];
      rows.push(item);
    }
    rows.sort(function(a,b){
      var aVol = parseInt(a.vol.replace(/[,.\s]/g, ''));
      var bVol = parseInt(b.vol.replace(/[,.\s]/g, ''));
      return bVol - aVol;
    });
    renderWidgetTable('ltkwid', rows, json);
  };


  var renderWidgetTable = function(type, rows, json, nocredits){
    var query = getQuery();
    var source = '';
    var title = '';
    var rootSelector;
    var iframeSrcParam = '';
    if (type === 'related-keywords') {
      source = 'gprsea';
      title = 'Related Keywords';
      iframeSrcParam = 'related';
      rootSelector = 'xt-related-search';
    }
    if (type === 'people-also-search') {
      source = 'gpasea';
      title = 'People Also Search For';
      iframeSrcParam = 'pasf';
      rootSelector = 'xt-google-people-search';
    }
    if (type === 'ltkwid') {
      source = 'ltkwid';
      title = 'Long-Tail Keywords';
      iframeSrcParam = 'ltkwid';
      rootSelector = 'xt-google-ltkwid';
    }
    if (type === 'trending-keywords') {
      source = 'trenkw';
      title = 'Trending Keywords';
      iframeSrcParam = 'trenkw';
      rootSelector = 'xt-google-trenkw';
    }
    var settings = Starter.getSettings();
    var params = {
      settingEnabled: settings.sourceList[source],
      source: source,
      darkMode: darkMode,
      query: query,
      title: title,
      json: json,
      type: type,
      columnName: 'Keyword',
      rootSelector: rootSelector,
      addTo: getWidgetsParent(),
      addMethod: 'appendTo',
      iframeSrcParam: iframeSrcParam,
      filename: source + '-' + query.replace(/\s+/g, '_'),
      fnGenerateLink: function(keywordEnc){
        return document.location.origin + '/search?q=' + keywordEnc;
      },
      onAdded: function($root){
        if ($('#xt-google-ltkwid')[0]) {
          $root.insertBefore($('#xt-google-ltkwid'));
        }
        if ($('#xt-google-people-search')[0]){
          if (type === 'ltkwid' || type === 'trending-keywords') {
            $root.insertAfter($('#xt-google-people-search'));
          }
          else {
            $root.insertBefore($('#xt-google-people-search'));
          }
        }
      },
      onClosed: function(){},
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
        $this.remove();
        if ($parent[0].id === 'xt-related-search') {
          processRelatedSearch('manual');
        }
        else if ($parent[0].id === 'xt-google-people-search') {
          processPeopleAlsoSearch('manual');
        }
        else if ($parent[0].id === 'xt-google-ltkwid') {
          getLTKQueries('manual');
        }
        else if ($parent[0].id === 'xt-google-trenkw') {
          getTrendingKeywords('manual');
        }
      }
    };
    if (type === 'trending-keywords') {
      params.trendColumnName = '30d inc';
    }
    Common.renderWidgetTable(rows, params);
  };


  var processKeywords = function( keywords, table ){
    Common.processKeywords({
        keywords: Object.keys( keywords ),
        tableNode: table,
        src: source,
        from: 'related',
        seed: getQuery('corrected'),
        noCheckCredits: true
      },
      function(json){
        processRelatedSearchWidgetResponse( json, keywords );
      }
    );
  };


  var processQueryResponse = function( json ){
    var data;
    if (json.error) {
      console.error(json);
      return;
    }
    if (json.data) data = json.data[0];
    var $node = $('#xt-info');
    if (!$node.length) {
      $node = $('<div/>', {
          class: 'xt-google-query'
        })
        .attr('id', 'xt-info');
      var settings = Starter.getSettings();
      var $parent = $(rootSel);
      if (settings.googlePos === 'abvres') {
        rootSel = '#result-stats';
        addMethod = 'prependTo';
        $parent = $(rootSel);
        // if (!$parent[0]) $parent = $('#appbar');
        $parent.addClass('xt-root-abvres');
      }
      else {
        if (!$parent[0]) {
          $parent = $('#tsf .A8SBwf');
          if ($parent[0] && getComputedStyle($parent[0]).display === 'flex') {
            $node.css({
              position: 'absolute',
              top: $parent[0].getBoundingClientRect().bottom,
              zIndex: 1000
            });
          }
        }
        if (document.location.href.indexOf('&tbm=isch') !== -1) {
          $parent = $('#tsf .A8SBwf');
        }
      }
      $node[addMethod]( $parent );
    }
    if (!data) {
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


  var processRelatedSearchWidgetResponse = function( json, keywords ){
    var rows = [];
    if (json.error_code === 'NOCREDITS') {
      for (var keyword in keywords) {
        rows.push({keyword: keyword});
      }
      renderWidgetTable('related-keywords', rows, null, 'nocredits');
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
    renderWidgetTable('related-keywords', rows, json);
  };


  var processRelatedSearchResponse = function( json, keywords ){
    var data = json.data;
    for (var key in data) {
      var item = data[key];
      var node = keywords[ item.keyword ];
      var $node = $(node);
      var $span = $('<span/>').addClass('xt-related-search');
      if (item.vol != '-') {
        var html = Common.getResultStr(item);
        var color = Common.highlight(item);
        if (color) {
          $span.addClass('xt-highlight');
          $span.css({background: color});
        }
        html = Common.appendStar(html, item);
        html = Common.appendKeg(html, json, item);
        $span.html(html);
      }
      $node
        .after( $span );
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


  var initSERPMutationObserver = function(){
    if (serpObserver) serpObserver.disconnect();
    serpObserver = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type === 'childList') {
          if (!mutation.addedNodes.length) return;
          processSERPChildList(mutation.addedNodes);
        }
      });
    });

    var config = { subtree: true, childList: true, characterData: true };
    var target = document.querySelector('body');
    serpObserver.observe(target, config);
  };


  var processSERPChildList = function(children){
    for (var i = 0, len = children.length; i < len; i++) {
      var node = children[i];
      if (node.dataset && node.dataset.asyncContext) {
        if (node.querySelector('.g')) {
          var settings = Starter.getSettings();
          processURLs(settings.showGoogleTraffic, settings.showGoogleMetrics, '#botstuff');
        }
      }
    }
  };


  var initSuggestionsMutationObserver = function( target ){
    var settings = Starter.getSettings();
    if (!settings.showMetricsForSuggestions) return;
    if (suggestionsObserver) suggestionsObserver.disconnect();
    suggestionsObserver = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type === 'childList') {
          if (!mutation.addedNodes.length) return;
          processSuggestionsChildList(mutation.addedNodes);
        }
      });
    });

    var config = { subtree: true, childList: true, characterData: true };
    suggestionsObserver.observe(target, config);
  };


  var processSuggestionsChildList = function(children){
    for (var i = 0, len = children.length; i < len; i++) {
      var node = children[i];
      if (typeof node.className === 'string' && node.className.match(/xt-/)) continue;
      var $node = $(node);
      if ($node.attr('role') === 'presentation') {
        processSuggestion(node);
      }
      else if ($node.parent().hasClass('sbl1') || $node.closest('li[role=presentation]')[0]){
        processSuggestion($node.closest('li[role=presentation]')[0]);
      }
      else {
        var list = $node.find('ul[role=listbox]')[0];
        if (list) {
          $(list).find('li div[role=option]').map(function(i, node){
            processSuggestion(node);
          });
        }
      }
    }
  };


  var processSuggestion = function(node){
    var $node = $(node);
    var option = $node.find('div[role=option]')[0];
    if (!option && $node.attr('role') === 'option') option = $node[0];
    if (!option) return;
    // console.log(node.textContent);
    if (!suggestionsTimer) suggestionsList = {};
    var $option = $(option);
    var keyword = $option.find('.sbqs_c, .sbpqs_a').text();
    if ($option.find('.aypzV')[0]) {
      keyword = $option.find('.aypzV').text();
    }
    if ($option.find('.Hlfhoe')[0]) {
      keyword = $option.find('.Hlfhoe').text();
    }
    if (!keyword && !$option.find('.sbqs_c')[0]) {
      keyword = $option.find('.sbl1 span').text();
    }
    if (!keyword) {
      keyword = $option.find('.wM6W7d span').text();
    }
    suggestionsList[keyword.toLowerCase()] = option;
    if (suggestionsTimer) clearTimeout(suggestionsTimer);
    suggestionsTimer = setTimeout(function(){
      processSuggestionsList();
    }, 1000);
  };


  var processSuggestionsList = function(){
    var visible = {};
    for (var key in suggestionsList) {
      var $option = $(suggestionsList[key]);
      if ($option.find('.sbl1 span, .aypzV span, .wM6W7d span, .sbqs_c, span.Hlfhoe').text().toLowerCase() === key) {
        visible[key] = suggestionsList[key];
      }
    }
    var key = Object.keys(visible).join('');
    if (cachedSuggestions[key]) {
      processSuggestionsListResponse(cachedSuggestions[key], visible);
      return;
    }
    suggestionsTimer = null;
    Common.processKeywords({
        keywords: Object.keys( visible ),
        tableNode: {},
        src: source
      },
      function(json){
        // console.log(json, visible);
        processSuggestionsListResponse( json, visible );
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
      $node.find('.sbqs_c, .sbpqs_a').append( $span );
      if (!$node.find('.sbqs_c')[0]) {
        $node.find('.sbl1 span').append( $span );
      }
      if (!$node.find('.sbl1 span')[0]) {
        $node.find('.aypzV span, .wM6W7d span, .Hlfhoe').append($span);
      }
    }
  };


  var getURLParameter = function(sParam, useHash) {
    var qs = window.location.search.substring(1);
    if (useHash) qs = window.location.hash.substring(1);
    qs = qs.split('+').join(' ');
    var params = {},
        tokens,
        re = /[?&]?([^=]+)=([^&]*)/g;
    while (tokens = re.exec(qs)) {
      params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
    }
    return params[sParam];
  };


  var getSource = function(){
    return source;
  };


  const initTrendsChart = (params) => {
    // example of ".rfli" - serp with results on the map, e.g. pizza
    params.parentSelector = getWidgetsParent();
    params.parentClassName = 'xt-g-google-trends-root';
    params.addFn = function($node){
      let $difficultyRoot = $('#xt-difficulty-root');
      let $ltkbtn = $('#xt-ltkbtn-root');
      if ($difficultyRoot[0]) $node.insertAfter($difficultyRoot);
      else if ($ltkbtn[0]) $node.insertAfter($ltkbtn);
      else $node.prependTo(getWidgetsParent());
    };
    params.rootId = 'xt-trend-chart-root';
    params.title = 'Trend Data For';
    params.buttonCopy = 'Copy';
    params.buttonExport = 'Export';
    params.query = getQuery();
    params.source = 'trend';
    params.darkMode = darkMode;
    TrendsChart.init(params);
  };


  const addFindLongTailKeywordsBtn = () => {
    let tld = document.location.host.replace('www.', '').replace('google.', '');
    let params = {
      parentSelector: getWidgetsParent(),
      addMethod: 'prependTo',
      rootId:'xt-ltkbtn-root',
      query: getQuery(),
      service: 'google',
      tld: tld
    };
    Common.renderFindLongTailKeywordsBtn(params);
  };


  const addDifficultyWidget = () => {
    let page = getURLParameter('start');
    if (page && page !== '0') return;
    let rootId = 'xt-difficulty-root';
    let $node = $('<div>', { id: rootId });
    let $ltkbtn = $('#xt-ltkbtn-root');
    if ($ltkbtn[0]) {
      $node.insertAfter($ltkbtn);
    }
    else $node.prependTo(getWidgetsParent());
    getDifficulty();
  };


  const getDifficulty = async () => {
    let page = getURLParameter('start');
    if (page && page !== '0') return;
    let query = getQuery().trim();
    let domains = [];
    let serpData = [];
    let count = 0;
    let total = 0;
    let branded = false;
    let social = 'twitter.com facebook.com linkedin.com instagram.com tiktok.com'.split(' ');
    let socialCount = {sum: 0};
    // let selector = getSERPItemsSelector();
    let selector = '#ires div.g, #res div.g';
    $(selector).map(function(i, node){
      if (count > 10) return;
      let $node = $(node);
      if ($node.closest('.related-question-pair')[0]) return;
      // if ($node.closest('.ULSxyf')[0]) return;
      if ($node.find('#kp-wp-tab-cont-overview')[0]) return;
      if ($node.find('g-section-with-header')[0]) return;
      if ($node.find('.g')[0]) return;
      if ($node.find('#currency-v2-updatable_2')[0]) return;
      if (node.classList.contains('g-blk')) {}
      else {
        if ($node.closest('.g-blk')[0]) {
          return;
        }
        if (count === 0 && $node.parent().closest('.g').find('table')[0]) {
          branded = true;
        }
        count++;
        let data = getSERPItemData($node);
        data.domain = Common.getHost(data.url);
        social.map(function(domain){
          if (data.domain.indexOf(domain) !== -1 && !socialCount[domain]) {
            socialCount.sum++;
            socialCount[domain] = true;
          }
        });
        domains.push(data.domain);
        if (count === 3 && domains[0] === domains[1] && domains[1] === domains[2]) branded = true;
        let res = calcOnPagePoints(query, data, {exactMatchesTitle: 15, exactMatchesURL: 5, exactMatchesDescr: 5, broadMatchesTitle: 25, broadMatchesURL: 10, broadMatchesDescr: 10, hasBolded: 30});
        total += res.sum;
        data.onpage = res;
        serpData.push(data);
      }
    });
    if (socialCount.sum > 1) branded = true;
    let onpageAvg = Math.round(total / count);
    let offpage = await getOffpageDifficulty(domains);
    let difficulty = OFFPAGE_PERCENT * offpage.avg + ONPAGE_PERCENT * onpageAvg;
    if (branded) difficulty *= 1.2;
    if (difficulty > 100) difficulty = 100;
    else difficulty = Math.round(difficulty);
    let title = 'Find long-tail keywords for';
    let queryQuotes = '"' + query + '"';
    if (query.length > 38) queryQuotes = 'this search query';
    let country = (Starter.getSettings().country || '').toUpperCase();
    let countryTitle = country ? `(${country})` : '';
    let btnURL = chrome.runtime.getURL(`html/page.html?page=autocomplete&query=${encodeURIComponent(query)}&service=google`);
    let tld = document.location.host.replace('www.', '').replace('google.', '');
    btnURL += '&tld=' + tld;
    renderDifficulty({
      title: title,
      countryTitle: countryTitle,
      btnURL: btnURL,
      query: query,
      queryQuotes: queryQuotes,
      onpage: {
        avg: onpageAvg,
        data: serpData
      },
      offpage: offpage,
      difficulty: difficulty,
      branded: branded
    });
  };


  const getSERPItemsSelector = function(){
    let res = '#ires .g, #res .g';
    let $nodes = $(res);
    if (res.length < 3) return res;
    let classNameCounts = {};
    let maxCount = 0;
    let maxClassName = '';
    $nodes.map(function(i, node){
      Array.from(node.classList).map(function(c){
        if (c === 'g') return;
        if (!classNameCounts[c]) classNameCounts[c] = 0;
        classNameCounts[c]++;
        if (classNameCounts[c] > maxCount) {
          maxCount = classNameCounts[c];
          maxClassName = c;
        }
      });
    });
    if (maxClassName) {
      res = `#ires .g.${maxClassName}, #res .g.${maxClassName}`;
    }
    return res;
  };


  const getOffpageDifficulty = domains => {
    return new Promise((resolve, reject) => {
      let settings = Starter.getSettings();
      chrome.runtime.sendMessage({
        cmd: 'api.getDomainLinkMetrics',
        data: {
          domains: domains,
          country: settings.country
        }
      }, function(response){
        let dataByDomain = {};
        let total = 0;
        let count = 0;
        if (typeof response.data === 'object' && response.data.error) {
          console.error(response.data.error, response.data.message);
          return;
        }
        response.data.map(function(item){
          let domain = item.domain;
          dataByDomain[domain] = item.data;
          if (item.data.error) return;
          let moz_domain_authority = item.data.moz_domain_authority;
          let page_rank = item.data.page_rank * 10;
          if (typeof moz_domain_authority === 'undefined' || typeof page_rank === 'undefined') return;
          let sum = moz_domain_authority*0.75 + page_rank*0.25;
          total += sum;
          dataByDomain[domain].sum = sum;
          count++;
        });
        let avg = Math.round(total / count);
        resolve({
          avg: avg,
          data: dataByDomain
        });
      });
    });
  };


  const renderDifficulty = function(data){
    let html = '';
    let settings = Starter.getSettings();
    if (settings.showAutocompleteButton) {
      html = `
      <table><tr>
      <td><button class="xt-ke-btn">${data.title} <span style="margin-left: .25rem">${data.queryQuotes} ${data.countryTitle}</span></button>
      </td></tr></table>`;
    }
    html += `<div class="xt-ke-row xt-ke-mb-md">
        <div class="xt-ke-col">
            <div class="xt-ke-row xt-ke-align-items-center">
              <div class="xt-ke-col xt-ke-col-60">SEO Difficulty</div>
              <div class="xt-ke-col xt-ke-col-40">
                <span class="xt-ke-badge xt-ke-badge-light xt-ke-px-10px">${data.difficulty}/100</span>
              </div>
            </div>
        </div>

        <div class="xt-ke-col">
          <div class="xt-ke-row xt-ke-align-items-center">
            <div class="xt-ke-col xt-ke-col-60">Brand Query</div>
            <div class="xt-ke-col xt-ke-col-40 xt-difficulty-branded">
                <span class="xt-ke-badge xt-ke-badge-light">${data.branded ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="xt-ke-row xt-ke-mb-md">
        <div class="xt-ke-col">
          <div class="xt-ke-row xt-ke-align-items-center">
            <div class="xt-ke-col xt-ke-col-60">Off-Page Difficulty</div>
            <div class="xt-ke-col xt-ke-col-40"><span class="xt-ke-badge xt-ke-badge-light">${data.offpage.avg}/100</span></div>
          </div>
        </div>

        <div class="xt-ke-col">
          <div class="xt-ke-row xt-ke-align-items-center">
            <div class="xt-ke-col xt-ke-col-60">On-Page Difficulty</div>
            <div class="xt-ke-col xt-ke-col-40"><span class="xt-ke-badge xt-ke-badge-light">${data.onpage.avg}/100</span></div>
          </div>
        </div>
      </div>

      <div class="xt-ke-difficulty-links">
        <a href="https://keywordseverywhere.com/seo-metrics.html" target="_blank">How these metrics are calculated</a>
        <a href="${chrome.runtime.getURL('html/diffstats.html')}" class="xt-difficulty-breakdown-btn" target="_blank">Detailed breakdown</a>
      </div>
    `;
    html += Common.renderIframeHTML({
      query: data.query,
      settingEnabled: true,
      darkMode: darkMode,
      iframeSrcParam: 'difficulty'
    });
    let params = {
      parentSelector: getWidgetsParent(),
      addMethod: 'prependTo',
      rootId:'xt-difficulty-root',
      html: html,
      service: 'google',
      onAdded: function($root){
        let $ltkbtn = $('#xt-ltkbtn-root');
        if ($ltkbtn[0]) {
          $root.insertAfter($ltkbtn);
        }
      },
      onReady: function($root){
        $root.find('.xt-difficulty-breakdown-btn').click(function(e){
          chrome.runtime.sendMessage({
            cmd: 'google.setDifficultyData',
            data: data
          });
        });
        if (data.branded) {
          $root.find('.xt-difficulty-branded').attr('title', 'Google considers "' + getQuery() + '" to be a branded query, the SEO Difficulty is increased by 20%.');
        }
      }
    };
    let $root = Common.renderGenericWidget(params);
    $root.find('button').click(() => {
      // console.log(data);
      chrome.runtime.sendMessage({
        cmd: 'new_tab',
        data: data.btnURL
      });
    });
  };


  const renderPromoIframe = function(){
    let query = getQuery().trim();
    var html = Common.renderIframeHTML({
      query: query,
      settingEnabled: true,
      darkMode: darkMode,
      iframeSrcParam: 'freeuser_google'
    });
    let params = {
      parentSelector: getWidgetsParent(),
      addMethod: 'prependTo',
      rootId: 'xt-freeuser-root',
      html: html,
      service: 'google',
      onAdded: function($root){
      },
      onReady: function($root){
      }
    };
    let $root = Common.renderGenericWidget(params);
  };


  const getSERPItemData = function($node){
    let res = {};
    try {
      if (!res.url) {
        res.url = $($node.find('.rc a[ping]')[0]).attr('href');
        if (vendor === 'Firefox') {
          res.url = $($node.find('.rc a')[0]).attr('href');
        }
      }
      if (!res.url) {
        let link = $node.find('g-link');
        if (link[0]) { // e.g. twitter results
          let $link = $(link);
          res.url = $link.find('a').get(0).getAttribute('href');
          res.title = $.trim($link.text());
        }
      }
      if (!res.url) {
        let $link = $node.find('a h3').closest('a');
        if ($link[0]) {
          res.url = $link.get(0).getAttribute('href');
        }
      }
      res.title = $.trim($node.find('a h3')[0].textContent);
      let $descriptionNode = getDescriptionNode($node);
      if ($descriptionNode[0]) {
        res.description = $descriptionNode.text();
        if ($descriptionNode[0].tagName === 'TABLE') {
          res.description = Array.from($descriptionNode.find('td').map(function(i, td){
            return td.textContent;
          })).join(' ');
        }
        let words = [];
        $descriptionNode.find('em').map(function(i, em){
          words = words.concat(em.textContent.toLowerCase().split(/\s+/));
          let uniq = {};
        });
        let uniqWords = {};
        words.map(function(word){
          uniqWords[word] = true;
        });
        res.descriptionBold = Object.keys(uniqWords);
      }
      else if ($node.find('.W8l4ac')[0]) {
        res.description = $node.find('.W8l4ac').text();
        res.descriptionBold = [];
      }
      else {
        res.descriptionBold = [];
        res.description = '';
      }
      // console.log($node[0], res);
      let $when = $node.find('.st .f, .aCOpRe .f');
      if ($when[0]) {
        let text = $when[0].textContent.replace(/ -\s+$/, '');
        let date = new Date(text);
        let isValid = !isNaN(date.getTime()) || text.match(/ago/);
        if (isValid) {
          res.when = text;
        }
      }
    } catch (e) {
      console.log(e);
      console.log($node[0]);
    }
    return res;
  };


  var hasExactMatch = function(str, substr){
    var index = str.indexOf(substr);
    if (index === -1) return false;
    if (index > 0 && str[index - 1].match(/\w/)) return false;
    var nextChar = index + substr.length;
    if (str[nextChar] && str[nextChar].match(/\w/)) return false;
    return true;
  };


  var preprocessWords = function(text, params){
    text = text.toLowerCase();
    let stopwords = 'a am an and any are as at be by can did do does for from had has have how i if in is it its may me might mine must my mine must my nor not of oh ok when who whom why will with yes yet you your'.split(' ');
    stopwords.map(function(word){
      let re = new RegExp(`\\b${word}\\b`);
      text = text.replace(re, '');
    });
    let keywords = text.match(/[\w-']+/g);
    if (!keywords) {
      keywords = text.split(/\s+/);
    }
    if (!keywords) return '';
    keywords = keywords.map(function(kw){
      kw = kw.replace(/^'/, '');
      kw = kw.replace(/'$/, '');
      if (params.pluralize) kw = pluralize(kw);
      return kw;
    });
    if (params.split) return keywords;
    else return keywords.join(' ');
  };


  var calcOnPagePoints = (query, item, scale) => {
    let title = item.title;
    let description = item.description;
    let queryNoSpaces = query.replace(/\W/g, '');
    let url = item.url;
    url = url.replace(/https?:\/\//, '').replace(/[-_.]+/g, ' ');
    let exactMatchesTitle = 0, exactMatchesDescr = 0, broadMatchesTitle = 0, broadMatchesDescr = 0, exactMatchesURL = 0, broadMatchesURL = 0;
    if (!title) title = '';
    if (!description) description = '';
    let urlP = preprocessWords(url, {pluralize: true});
    query = preprocessWords(query, {});
    let queryP = preprocessWords(query, {pluralize: true});
    queryNoSpaces = preprocessWords(queryNoSpaces, {pluralize: true});
    let titleP = preprocessWords(title, {pluralize: true});
    let descriptionP = preprocessWords(description, {pluralize: true});
    if (hasExactMatch(titleP, queryP)) {
      exactMatchesTitle = scale.exactMatchesTitle;
    }
    if (hasExactMatch(urlP, queryP)) {
      exactMatchesURL = scale.exactMatchesURL;
    }
    if (hasExactMatch(urlP, queryNoSpaces)) {
      exactMatchesURL = scale.exactMatchesURL;
    }
    if (hasExactMatch(descriptionP, queryP)) {
      exactMatchesDescr = scale.exactMatchesDescr;
    }
    let keywords = query.split(/\s+/);
    let keywordsP = queryP.split(/\s+/);
    let arrTitle = titleP.split(/\s+/);
    let arrDescr = descriptionP.split(/\s+/);
    let arrURL = urlP.split(/\s+/);
    let titleMatchesCount = 0;
    let urlMatchesCount = 0;
    let descrMatchesCount = 0;
    let permArr = [];
    if (keywords.length <= 3) {
      permArr = permutator(keywords);
    }
    permArr.map(function(arr){
      let joined = arr.join('');
      if (url.indexOf(joined) !== -1) {
        broadMatchesURL = scale.broadMatchesURL;
      }
    });
    keywordsP.map((keyword, index) => {
      if (arrTitle.indexOf(keyword) !== -1) titleMatchesCount++;
      if (arrURL.indexOf(keyword) !== -1) urlMatchesCount++;
      else if (url.indexOf(keywords[index]) !== -1) urlMatchesCount++;
      if (arrDescr.indexOf(keyword) !== -1) descrMatchesCount++;
    });
    broadMatchesTitle = parseFloat(((titleMatchesCount / keywords.length) * scale.broadMatchesTitle).toFixed(2));
    if (!broadMatchesURL) {
      broadMatchesURL = parseFloat(((urlMatchesCount / keywords.length) * scale.broadMatchesURL).toFixed(2));
    }
    broadMatchesDescr = parseFloat(((descrMatchesCount / keywords.length) * scale.broadMatchesDescr).toFixed(2));

    var boldFactor = parseFloat((item.descriptionBold.length / keywords.length).toFixed(2));
    if (boldFactor > 1) boldFactor = 1;
    let boldPoints = parseFloat((boldFactor * scale.hasBolded).toFixed(2));

    if (item.descriptionOptimized) boldPoints = 30;
    let sum = exactMatchesTitle + exactMatchesDescr + exactMatchesURL + broadMatchesTitle + broadMatchesDescr + broadMatchesURL + boldPoints;

    return {
      sum: parseFloat(sum.toFixed(2)),
      exactMatchesTitle: exactMatchesTitle,
      exactMatchesDescr: exactMatchesDescr,
      exactMatchesURL: exactMatchesURL,
      broadMatchesTitle: broadMatchesTitle,
      broadMatchesDescr: broadMatchesDescr,
      broadMatchesURL: broadMatchesURL,
      boldPoints: boldPoints
    };
  };


  const permutator = (inputArr) => {
    let result = [];

    const permute = (arr, m = []) => {
      if (arr.length === 0) {
        result.push(m);
      } else {
        for (let i = 0; i < arr.length; i++) {
          let curr = arr.slice();
          let next = curr.splice(i, 1);
          permute(curr.slice(), m.concat(next));
       }
     }
   };
   permute(inputArr);
   return result;
  };


  return {
    init: init,
    getSource: getSource
  };

})();
