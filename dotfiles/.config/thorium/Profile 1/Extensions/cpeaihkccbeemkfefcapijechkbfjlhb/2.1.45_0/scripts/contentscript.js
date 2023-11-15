"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MAX_KEYWORDS_IN_SEARCH = 500;

var tips = ["Try pressing the up and down arrow keys to get other suggestions!", "You may have to scroll to the right to see all keyword suggestions."];

var adIndex = 0;
var tipIndex = Math.floor(Math.random() * tips.length);
var adTimer = null;
var hoveringAd = false;
var displayedKeywordData = [];
var isASEPro = false;
var options = {};

if (jQuery.when.all === undefined) {
  jQuery.when.all = function (deferreds) {
    var deferred = new jQuery.Deferred();
    $.when.apply(jQuery, deferreds).done(function () {
      deferred.resolve(Array.prototype.slice.call(arguments));
    }, function () {
      deferred.fail(Array.prototype.slice.call(arguments));
    });

    return deferred;
  };
}

$("\n<style>\n.ase-suggestion {\n  padding: 8px 10px;\n  font-size: 16px;\n  font-family: \"Amazon Ember\";\n  cursor: pointer;\n}\n\n.ase-search-vol {\n  float: right;\n  margin-left: 5px;\n  font-size: 0.8em;\n  padding-top: 3px;\n  width: 42px;\n  text-align: right;  \n  position: relative;\n}\n\n.ase-blur-text {\n  color: transparent;\n  text-shadow: 0 0 4px rgb(0 0 0 / 50%);\n}\n\n.ase-search-vol-icon {\n  background-image: url(\"" + chrome.runtime.getURL("images/volume.png") + "\");\n  height: 16px;\n  width: 16px;\n  display: inline-block;\n  margin-right: 2px;\n  vertical-align: bottom;\n  opacity: .5;  \n}\n\n.ase-search-vol-icon-background {\n  position: absolute;\n  opacity: .2;\n}\n\n#ase-col1 {\n  min-height: 300px;\n}\n\n#ase-col1 .s-suggestion {\n  flex-grow: 0;\n}\n\n#ase-col1 b {\n  color: black;\n}\n\n#aseBanner, #aseBanner a {\n  color: black\n}\n\n#aseBanner a:hover {\n  text-decoration: none;\n}\n\n#aseBanner {\n  margin-left: 10px;\n  min-height: 40px;\n}\n\n#aseProIcon {\n  display:none;\n  font-weight: bold;\n  color: green;\n}\n\n#aseExportSection {\n  display: none;\n}\n\n#aseBanner div {\n  vertical-align: top;\n}\n\n#aseWordListSection {\n  display: none;\n  overflow: hidden;\n  height: 40px;  \n}\n\n#aseWordList {\n  display: inline-block;\n  padding: 0;\n  margin: 0;\n  width: 400px;\n  font-size: 14px;\n  font-weight: bold;\n}\n\n#aseWordList li {\n  display: inline-block;\n  padding: 0;\n  margin: 0 5px;\n  list-style-type: none;\n}\n\n#aseWordCloud {\n  display: inline-block;\n  padding: 0;\n  margin: 0;\n  font-size: 23px;\n  line-height: 16px;\n  width: 400px;\n}\n\n#aseWordCloud li {\n  display: inline-block;\n  padding: 0;\n  margin: 0 5px;\n  list-style-type: none;\n}\n\n#aseAds:hover, #aseExport:hover, #aseExportAd:hover {\n  background-color: #e5e5e5;\n}\n\n#aseAds a {\n  display:inline-block;\n  height:100%;\n}\n\n#aseExportAd {\n  background-color: #FFD700;\n  padding: 0 10px;\n}\n\n.ase-animated {\n  -webkit-animation-duration: 1s;\n  animation-duration: 1s;\n  -webkit-animation-fill-mode: both;\n  animation-fill-mode: both;\n}\n\n@-webkit-keyframes ase-fadeIn {\n  from {\n    opacity: 0;\n  }\n\n  to {\n    opacity: 1;\n  }\n}\n\n@keyframes ase-fadeIn {\n  from {\n    opacity: 0;\n  }\n\n  to {\n    opacity: 1;\n  }\n}\n\n.ase-fadeIn {\n  -webkit-animation-name: ase-fadeIn;\n  animation-name: ase-fadeIn;\n}\n\n#aseSettings img {\n  transform: rotate(0deg);\n  transition: 0.3s;\n}\n\n#aseSettings:hover img {\n  transform: rotate(45deg);\n}\n\n#aseWaitMessage {\n  background: white;\n  color: black;\n  padding: 20px;\n  z-index: 1000;\n  position: fixed;\n  left: 0;\n  top: 0;\n  font-size: 18px;\n}\n\n#aseWaitMessage img {\n  animation: aseRotation 2s infinite linear;\n  vertical-align: middle;\n  margin-right: 5px;\n}\n\n@keyframes aseRotation {\n  from {\n    transform: rotate(0deg);\n  }\n  to {\n    transform: rotate(359deg);\n  }\n}\n\n.ase-pulse {\n  animation: asePulse 1s infinite linear alternate;\n}\n\n@keyframes asePulse {\n  from {\n    opacity: 0.1;\n  }\n\n  to {\n    opacity: 0.5;\n  }\n}\n\n/**\n * Tooltip Styles\n */\n\n/* Base styles for the element that has a tooltip */\n[data-ase-tooltip],\n.ase-tooltip {\n  position: relative;\n  cursor: pointer;\n}\n\n/* Base styles for the entire tooltip */\n[data-ase-tooltip]:before,\n[data-ase-tooltip]:after,\n.ase-tooltip:before,\n.ase-tooltip:after {\n  position: absolute;\n  visibility: hidden;\n  -ms-filter: \"progid:DXImageTransform.Microsoft.Alpha(Opacity=0)\";\n  filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=0);\n  opacity: 0;\n  -webkit-transition: \n    opacity 0.2s ease-in-out,\n    visibility 0.2s ease-in-out,\n    -webkit-transform 0.2s cubic-bezier(0.71, 1.7, 0.77, 1.24);\n  -moz-transition:    \n    opacity 0.2s ease-in-out,\n    visibility 0.2s ease-in-out,\n    -moz-transform 0.2s cubic-bezier(0.71, 1.7, 0.77, 1.24);\n  transition:         \n    opacity 0.2s ease-in-out,\n    visibility 0.2s ease-in-out,\n    transform 0.2s cubic-bezier(0.71, 1.7, 0.77, 1.24);\n  -webkit-transform: translate3d(0, 0, 0);\n  -moz-transform:    translate3d(0, 0, 0);\n  transform:         translate3d(0, 0, 0);\n  pointer-events: none;\n}\n\n/* Show the entire tooltip on hover and focus */\n[data-ase-tooltip]:hover:before,\n[data-ase-tooltip]:hover:after,\n[data-ase-tooltip]:focus:before,\n[data-ase-tooltip]:focus:after,\n.ase-tooltip:hover:before,\n.ase-tooltip:hover:after,\n.ase-tooltip:focus:before,\n.ase-tooltip:focus:after {\n  visibility: visible;\n  -ms-filter: \"progid:DXImageTransform.Microsoft.Alpha(Opacity=100)\";\n  filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=100);\n  opacity: 1 !important;\n}\n\n/* Base styles for the tooltip's directional arrow */\n.ase-tooltip:before,\n[data-ase-tooltip]:before {\n  z-index: 1001;\n  border: 6px solid transparent;\n  background: transparent;\n  content: \"\";\n}\n\n/* Base styles for the tooltip's content area */\n.ase-tooltip:after,\n[data-ase-tooltip]:after {\n  z-index: 1000;\n  padding: 8px;\n  width: 160px;\n  background-color: #000;\n  background-color: hsla(0, 0%, 20%, 0.9);\n  color: #fff;\n  content: attr(data-ase-tooltip);\n  font-size: 14px;\n  line-height: 1.2;\n  text-align: center;\n}\n\n/* Directions */\n\n/* Top (default) */\n[data-ase-tooltip]:before,\n[data-ase-tooltip]:after,\n.ase-tooltip:before,\n.ase-tooltip:after,\n.ase-tooltip-top:before,\n.ase-tooltip-top:after {\n  bottom: 100%;\n  left: 50%;\n}\n\n[data-ase-tooltip]:before,\n.ase-tooltip:before,\n.ase-tooltip-top:before {\n  margin-left: -6px;\n  margin-bottom: -12px;\n  border-top-color: #000;\n  border-top-color: hsla(0, 0%, 20%, 0.9);\n}\n\n/* Horizontally align top/bottom tooltips */\n[data-ase-tooltip]:after,\n.ase-tooltip:after,\n.ase-tooltip-top:after {\n  margin-left: -80px;\n}\n\n[data-ase-tooltip]:hover:before,\n[data-ase-tooltip]:hover:after,\n[data-ase-tooltip]:focus:before,\n[data-ase-tooltip]:focus:after,\n.ase-tooltip:hover:before,\n.ase-tooltip:hover:after,\n.ase-tooltip:focus:before,\n.ase-tooltip:focus:after,\n.ase-tooltip-top:hover:before,\n.ase-tooltip-top:hover:after,\n.ase-tooltip-top:focus:before,\n.ase-tooltip-top:focus:after {\n  -webkit-transform: translateY(-12px);\n  -moz-transform:    translateY(-12px);\n  transform:         translateY(-12px); \n}\n\n/* Left */\n.ase-tooltip-left:before,\n.ase-tooltip-left:after {\n  right: 100%;\n  bottom: 50%;\n  left: auto;\n}\n\n.ase-tooltip-left:before {\n  margin-left: 0;\n  margin-right: -12px;\n  margin-bottom: 0;\n  border-top-color: transparent;\n  border-left-color: #000;\n  border-left-color: hsla(0, 0%, 20%, 0.9);\n}\n\n.ase-tooltip-left:hover:before,\n.ase-tooltip-left:hover:after,\n.ase-tooltip-left:focus:before,\n.ase-tooltip-left:focus:after {\n  -webkit-transform: translateX(-12px);\n  -moz-transform:    translateX(-12px);\n  transform:         translateX(-12px); \n}\n\n/* Bottom */\n.ase-tooltip-bottom:before,\n.ase-tooltip-bottom:after {\n  top: 100%;\n  bottom: auto;\n  left: 50%;\n}\n\n.ase-tooltip-bottom:before {\n  margin-top: -12px;\n  margin-bottom: 0;\n  border-top-color: transparent;\n  border-bottom-color: #000;\n  border-bottom-color: hsla(0, 0%, 20%, 0.9);\n}\n\n.ase-tooltip-bottom:hover:before,\n.ase-tooltip-bottom:hover:after,\n.ase-tooltip-bottom:focus:before,\n.ase-tooltip-bottom:focus:after {\n  -webkit-transform: translateY(12px);\n  -moz-transform:    translateY(12px);\n  transform:         translateY(12px); \n}\n\n/* Right */\n.ase-tooltip-right:before,\n.ase-tooltip-right:after {\n  bottom: 50%;\n  left: 100%;\n}\n\n.ase-tooltip-right:before {\n  margin-bottom: 0;\n  margin-left: -12px;\n  border-top-color: transparent;\n  border-right-color: #000;\n  border-right-color: hsla(0, 0%, 20%, 0.9);\n}\n\n.ase-tooltip-right:hover:before,\n.ase-tooltip-right:hover:after,\n.ase-tooltip-right:focus:before,\n.ase-tooltip-right:focus:after {\n  -webkit-transform: translateX(12px);\n  -moz-transform:    translateX(12px);\n  transform:         translateX(12px); \n}\n\n/* Move directional arrows down a bit for left/right tooltips */\n.ase-tooltip-left:before,\n.ase-tooltip-right:before {\n  top: 3px;\n}\n\n/* Vertically center tooltip content for left/right tooltips */\n.ase-tooltip-left:after,\n.ase-tooltip-right:after {\n  margin-left: 0;\n  margin-bottom: -16px;\n}\n\n</style>\n").appendTo("head");

var adHtml = $("\n<div>\n  <section>\n    <a href=\"https://gum.co/asepro/ase?utm_source=ase\" target=\"_blank\" data-target=\"ASE Pro 1 Default\">\n      <img src=\"https://dl.dropboxusercontent.com/s/qv0wsx9grwpazyx/ase-icon.png\"\n        style=\"height:30px;margin-top:5px\" />\n      Need more keywords? Upgrade to <b>AMZ Suggestion Expander PRO!</b>\n    </a>\n  </section>\n  <section>\n    <a href=\"https://gum.co/asepro/ase?utm_source=ase\" target=\"_blank\" data-target=\"ASE Pro 3 Default\">\n      <img src=\"https://dl.dropboxusercontent.com/s/6h5od4z3bjolh4i/download-icon.png\"\n        style=\"height:30px;margin-top:5px\" />\n      Want to see <b>Search Volume</b> for these keywords? Go <b>PRO!</b>\n    </a>\n  </section>\n</div>\n");

$.ajax("https://amzse.z21.web.core.windows.net/ads/ase_ads2.html").done(function (data) {
  if (data.indexOf("<section>") >= 0) {
    adHtml = $(data);
    adIndex = Math.floor(Math.random() * $("section", adHtml).length);
  }
});

$("body").append("\n<div id=\"aseWaitMessage\" style=\"display:none\">\n  <img src=\"" + chrome.runtime.getURL("images/settings.png") + "\" /> Please wait while downloading keyword data...\n</div>\n");

$(function () {

  get_options(function (items) {
    options = items;

    chrome.runtime.sendMessage({
      command: "getNotice",
      lastNoticeCheck: items.lastNoticeCheck
    }, function (notices) {
      if (notices && notices[0]) {
        var notice = notices[0];
        if (notice.acf && notice.acf.notice_enabled) {
          if (!items.noticeId || notice.acf.notice_id > items.noticeId) {
            items.noticeId = notice.acf.notice_id;
            set_options({ noticeId: items.noticeId }, function () {
              window.open(notice.link);
            });
          }
        }
        set_options({ lastNoticeCheck: Date.now() });
      }
    });

    verifyLicense(items.licenseKey, items.lastLicenseCheck, function (valid) {
      switch (valid) {
        case "valid":
          items.lastLicenseCheck = Date.now();
          break;
        case "valid no check":
          break;
        case "not valid":
          items.licenseKey = null;
          items.lastLicenseCheck = null;
          break;
      }
      set_options(items, function () {
        if (valid.indexOf("valid") == 0) {
          isASEPro = true;
        }
        setup();
      });
    });
  });
});

function setup() {

  $("#twotabsearchtextbox").focus(function (e) {
    if ($(e.target).val()) {
      processSearchEvent(e);
    }
  });

  $("#twotabsearchtextbox").keyup(function (e) {
    processSearchEvent(e);
  });

  $(document).on("click", ".ase-suggestion", function (e) {
    var keyword = $(e.target).closest(".ase-suggestion").data("keyword");
    var domain = location.hostname;
    var url = "https://" + domain + "/s/ref=nb_sb_noss?url=search-alias%3Daps&field-keywords=" + encodeURIComponent(keyword);
    window.open(url);
  });

  $(document).on("mousedown", "#aseAds a", function (e) {
    gaevent("advertisement", "clicked", $(e.target).data("target"));
  });

  $(document).on("mousedown", "#nav-flyout-searchAjax a", function (e) {
    if (e.target.href && e.target.href.charAt(e.target.href.length - 1) != "#") {
      window.open(e.target.href);
      e.preventDefault();
    }
  });

  $(document).on("mouseenter", "#aseAds a", function (e) {
    hoveringAd = true;
  });

  $(document).on("mouseleave", "#aseAds a", function (e) {
    hoveringAd = false;
  });

  $(document).on("mousedown", "#aseSettings", function (e) {
    chrome.runtime.sendMessage({
      command: "openOptions"
    });
    return false;
  });

  $(document).on("mousedown", "#aseExportAd a", function (e) {
    gaevent("exportAd", "clicked");
  });

  $(document).on("mousedown", "#aseExport a", function (e) {
    var search = $("#twotabsearchtextbox").val();
    var departmentQuery = getDepartmentQuery();

    gaevent("export", "clicked");

    $("#aseWaitMessage").show();

    getExtendedKeywordResults(search, departmentQuery, displayedKeywordData).then(function (results) {
      var sheet = [];
      var keywordData = [];

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        var _loop = function _loop() {
          var keyword = _step.value;

          var stats = null;
          if (results.keywordStats && !results.keywordStats.error) {
            stats = results.keywordStats.find(function (s) {
              return s.Keyword == keyword;
            });
          }
          keywordData.push({
            keyword: keyword,
            monthlySearchVolume: stats ? stats.MonthlySearchVolume : -1
          });
        };

        for (var _iterator = results.allKeywords[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          _loop();
        }

      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      keywordData.sort(function (a, b) {
        return b.monthlySearchVolume - a.monthlySearchVolume;
      });

      sheet.push(["Keyword", "Monthly Searches", "Amazon.com", "Amazon UK", "Amazon DE", "Google Search", "Google Trends"]); 

      var i = 2;
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = keywordData[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var k = _step2.value;

          sheet.push([k.keyword, k.monthlySearchVolume, { t: "n", f: "HYPERLINK(\"https://www.amazon.com/s?k=\" & A" + i + ", \"Open Amazon.com\")" }, { t: "n", f: "HYPERLINK(\"https://www.amazon.co.uk/s?k=\" & A" + i + ", \"Open Amazon UK\")" }, { t: "n", f: "HYPERLINK(\"https://www.amazon.de/s?k=\" & A" + i + ", \"Open Amazon DE\")" }, { t: "n", f: "HYPERLINK(\"https://www.google.com/search?q=\" & A" + i + ", \"Open Google\")" }, { t: "n", f: "HYPERLINK(\"https://trends.google.com/trends/explore?q=\" & A" + i + ", \"Open Trends\")" }]
          );
          i++;
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      var wb = XLSX.utils.book_new();
      var ws = XLSX.utils.aoa_to_sheet(sheet);
      XLSX.utils.book_append_sheet(wb, ws, "Keywords");

      sheet = [];
      sheet.push(["Word", "Count"]);

      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = results.allWords[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var word = _step3.value;

          if (!search.toLowerCase().includes(word.keyword)) {
            sheet.push([word.keyword, word.count]);
          }
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3.return) {
            _iterator3.return();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }

      ws = XLSX.utils.aoa_to_sheet(sheet);
      XLSX.utils.book_append_sheet(wb, ws, "Word Analysis");

      var fileName = search.replace(/[^a-zA-Z0-9 ]+/g, "").trim() + " keywords.xlsx";

      XLSX.writeFile(wb, fileName);

      $("#aseWaitMessage").hide();
    });

    return false;
  });
}

var getKeywordStatsDb = debounce(function (keywords) {

  console.debug("getKeywordStatsDb");

  gaevent("search", "getKeywordStats");

  console.debug("getting keywords stats...");
  var marketplace = getMarketplace();

  chrome.runtime.sendMessage({
    command: "getKeywordStats",
    marketplace: marketplace.webDomain,
    keywords: keywords,
    licenseKey: options.licenseKey
  }, function (keywordStats) {
    console.debug("keyword stats", keywordStats);
    var _iteratorNormalCompletion4 = true;
    var _didIteratorError4 = false;
    var _iteratorError4 = undefined;

    try {
      for (var _iterator4 = keywordStats[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
        var stat = _step4.value;

        var amzSugs = $("#suggestions .s-suggestion");
        var aseSugs = $("#ase-col1 .ase-suggestion");
        var _iteratorNormalCompletion5 = true;
        var _didIteratorError5 = false;
        var _iteratorError5 = undefined;

        try {
          for (var _iterator5 = amzSugs[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
            var item = _step5.value;

            if (item.innerText == stat.Keyword) {
              $(".ase-search-vol-icon", item).remove();
              $(".ase-search-vol-val", item).text(abbreviateNumber(stat.MonthlySearchVolume));
            }
          }
        } catch (err) {
          _didIteratorError5 = true;
          _iteratorError5 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion5 && _iterator5.return) {
              _iterator5.return();
            }
          } finally {
            if (_didIteratorError5) {
              throw _iteratorError5;
            }
          }
        }

        var _iteratorNormalCompletion6 = true;
        var _didIteratorError6 = false;
        var _iteratorError6 = undefined;

        try {
          for (var _iterator6 = aseSugs[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
            var _item = _step6.value;

            if (_item.getAttribute("data-keyword") == stat.Keyword) {
              $(".ase-search-vol-icon", _item).remove();
              $(".ase-search-vol-val", _item).text(abbreviateNumber(stat.MonthlySearchVolume));
            }
          }
        } catch (err) {
          _didIteratorError6 = true;
          _iteratorError6 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion6 && _iterator6.return) {
              _iterator6.return();
            }
          } finally {
            if (_didIteratorError6) {
              throw _iteratorError6;
            }
          }
        }
      }
    } catch (err) {
      _didIteratorError4 = true;
      _iteratorError4 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion4 && _iterator4.return) {
          _iterator4.return();
        }
      } finally {
        if (_didIteratorError4) {
          throw _iteratorError4;
        }
      }
    }
  });
}, 1000);

function processSearchEvent(e) {

  if (e.key == "Meta") {
    return;
  }

  var search = $(e.target).val();
  var departmentQuery = getDepartmentQuery();
  console.debug("search " + search);

  var promises = [];

  promises.push(getSuggestions(search, "", departmentQuery));
  promises.push(getSuggestions(" ", search.trim(), departmentQuery));
  promises.push(getSuggestions(search.trim() + " ", "", departmentQuery));
  var words = search.split(" ");
  if (words.length >= 2) {
    var lastWords = [];
    for (var i = 1; i < words.length; i++) {
      lastWords.push(words[i]);
    }
    promises.push(getSuggestions(words[0] + " ", " " + lastWords.join(" "), departmentQuery));
  } else {
    promises.push($.Deferred().resolve("").promise());
  }



  promises.push(getSuggestions(search + " for ", "", departmentQuery));
  promises.push(getSuggestions(search + " and ", "", departmentQuery));
  promises.push(getSuggestions(search + " with ", "", departmentQuery));


  $.when.all(promises).done(function (data) {
    processSuggestions(search, data).then(function (displayedKeywords) {
      displayedKeywordData = data;
      var fa = new FrequencyAnalysis(true);
      var _iteratorNormalCompletion7 = true;
      var _didIteratorError7 = false;
      var _iteratorError7 = undefined;

      try {
        for (var _iterator7 = displayedKeywords[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
          var _keyword = _step7.value;

          fa.parse(_keyword, _keyword);
        }
      } catch (err) {
        _didIteratorError7 = true;
        _iteratorError7 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion7 && _iterator7.return) {
            _iterator7.return();
          }
        } finally {
          if (_didIteratorError7) {
            throw _iteratorError7;
          }
        }
      }

      var topKeywords = fa.topKeywords(20);
      $("#aseWordList").html(buildWordList(search, topKeywords));

      var searchVolStats = "";
      if (isASEPro) {
        searchVolStats = "<span class='ase-search-vol ase-tooltip-right' data-ase-tooltip=\"Estimated monthly search volume.\"><span class='ase-search-vol-icon ase-pulse'></span><span class=\"ase-search-vol-val\"></span></span>";
        getKeywordStatsDb(displayedKeywords);
      } else {
        searchVolStats = "<span class='ase-search-vol ase-tooltip-right' data-ase-tooltip=\"Would you like to see monthly search volume estimates? Click here!\" onclick=\"event.stopPropagation(); window.open('https://gum.co/asepro/ase?utm_source=ase'); return false;\"><span class='ase-search-vol-icon'></span>?</span>";
      }

      $("#suggestions div.s-suggestion .ase-search-vol").remove();
      $("#suggestions div.s-suggestion").append(searchVolStats);
      $("div.ase-suggestion").append(searchVolStats);

      if (!isASEPro) {
        var fakeValues = $(".ase-search-vol-val");
        var _iteratorNormalCompletion8 = true;
        var _didIteratorError8 = false;
        var _iteratorError8 = undefined;

        try {
          for (var _iterator8 = fakeValues[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
            var val = _step8.value;

            var rand = Math.floor(Math.random() * (10000 - 1000 + 1) + 1000);
            $(val).text(abbreviateNumber(rand));
          }
        } catch (err) {
          _didIteratorError8 = true;
          _iteratorError8 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion8 && _iterator8.return) {
              _iterator8.return();
            }
          } finally {
            if (_didIteratorError8) {
              throw _iteratorError8;
            }
          }
        }
      }
    });
  });
}

function getDepartmentQuery() {
  var departmentQuery = $("#searchDropdownBox").val();
  departmentQuery = departmentQuery.replace("search-alias=", "");
  return departmentQuery;
}

function getExtendedKeywordResults(search, departmentQuery, data) {

  var p = new Promise(function (resolve, reject) {
    var promises = [];
    for (var i = 0; i < 26; i++) {
      var letter = (i + 10).toString(36);
      promises.push(getSuggestions(search + " " + letter, "", departmentQuery));
      promises.push(getSuggestions(letter, search, departmentQuery));
    }

    $.when.all(promises).done(function (extendedData) {
      var currentSearch = $("#twotabsearchtextbox").val();
      if (currentSearch != search) {
        return;
      }

      var allKeywords = [];
      var allArrays = data.concat(extendedData);
      var _iteratorNormalCompletion9 = true;
      var _didIteratorError9 = false;
      var _iteratorError9 = undefined;

      try {
        for (var _iterator9 = allArrays[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
          var d = _step9.value;

          var keywords = parseResults(d);
          var _iteratorNormalCompletion11 = true;
          var _didIteratorError11 = false;
          var _iteratorError11 = undefined;

          try {
            for (var _iterator11 = keywords[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
              var k = _step11.value;

              if (!allKeywords.includes(k)) {
                allKeywords.push(k);
              }
            }
          } catch (err) {
            _didIteratorError11 = true;
            _iteratorError11 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion11 && _iterator11.return) {
                _iterator11.return();
              }
            } finally {
              if (_didIteratorError11) {
                throw _iteratorError11;
              }
            }
          }
        }
      } catch (err) {
        _didIteratorError9 = true;
        _iteratorError9 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion9 && _iterator9.return) {
            _iterator9.return();
          }
        } finally {
          if (_didIteratorError9) {
            throw _iteratorError9;
          }
        }
      }

      var marketplace = getMarketplace();

      chrome.runtime.sendMessage({
        command: "getKeywordStats",
        marketplace: marketplace.webDomain,
        keywords: allKeywords,
        licenseKey: options.licenseKey
      }, function (keywordStats) {
        var fa = new FrequencyAnalysis(true);
        var _iteratorNormalCompletion10 = true;
        var _didIteratorError10 = false;
        var _iteratorError10 = undefined;

        try {
          for (var _iterator10 = allKeywords[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
            var _keyword2 = _step10.value;

            fa.parse(_keyword2, _keyword2);
          }
        } catch (err) {
          _didIteratorError10 = true;
          _iteratorError10 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion10 && _iterator10.return) {
              _iterator10.return();
            }
          } finally {
            if (_didIteratorError10) {
              throw _iteratorError10;
            }
          }
        }

        var allWords = fa.allKeywords();

        resolve({
          allKeywords: allKeywords,
          allWords: allWords,
          keywordStats: keywordStats
        });
      });
    });
  });
  return p;
}

function buildWordList(search, keywords) {

  var list = "";

  var _iteratorNormalCompletion12 = true;
  var _didIteratorError12 = false;
  var _iteratorError12 = undefined;

  try {
    for (var _iterator12 = keywords[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
      var k = _step12.value;

      if (!search.toLowerCase().includes(k.keyword)) {
        list += "<li>" + k.keyword + " (" + k.count + ")</li>";
      }
    }
  } catch (err) {
    _didIteratorError12 = true;
    _iteratorError12 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion12 && _iterator12.return) {
        _iterator12.return();
      }
    } finally {
      if (_didIteratorError12) {
        throw _iteratorError12;
      }
    }
  }

  return list;
}

function buildWordCloud(search, keywords) {

  var randomKeywords = keywords.slice();

  randomKeywords = shuffle(randomKeywords);

  var list = "";

  var counts = randomKeywords.map(function (value) {
    if (!search.toLowerCase().includes(value.keyword)) {
      return value.count;
    }
  }).filter(function (value) {
    return value != undefined;
  });

  var max = Math.max.apply(Math, counts);
  var min = Math.min.apply(Math, counts);

  var scale = function scale(num, in_min, in_max, out_min, out_max) {
    return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
  };

  var _iteratorNormalCompletion13 = true;
  var _didIteratorError13 = false;
  var _iteratorError13 = undefined;

  try {
    for (var _iterator13 = randomKeywords[Symbol.iterator](), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
      var k = _step13.value;

      if (!search.toLowerCase().includes(k.keyword)) {
        var size = scale(k.count, min, max, 0.5, 1.0); 
        list += "<li style=\"font-size:" + size + "em\">" + k.keyword + "</li>";
      }
    }
  } catch (err) {
    _didIteratorError13 = true;
    _iteratorError13 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion13 && _iterator13.return) {
        _iterator13.return();
      }
    } finally {
      if (_didIteratorError13) {
        throw _iteratorError13;
      }
    }
  }

  return list;
}

function getSuggestions(queryFirst, queryLast, departmentQuery) {

  var marketplace = getMarketplace();

  var suggestUrl = "https://completion." + marketplace.domain + "/api/2017/suggestions?site-variant=desktop&mid=" + marketplace.market + "&alias=" + departmentQuery + "&prefix=" + queryFirst + "&suffix=" + queryLast;
  var p = new Promise(function (resolve, reject) {
    chrome.runtime.sendMessage({
      command: "getUrl",
      url: suggestUrl
    }, function (response) {
      resolve(response);
    });
  });
  return p;
}

function getMarketplace() {
  var domain = "amazon.com";
  var webDomain = "amazon.com";
  var market = "ATVPDKIKX0DER";
  var host = location.hostname.toLowerCase();

  if (host.indexOf("amazon.ca") > 0) {
    domain = "amazon.ca";
    webDomain = "amazon.ca";
    market = "A2EUQ1WTGCTBG2";
  }
  if (host.indexOf("amazon.co.uk") > 0) {
    domain = "amazon.co.uk";
    webDomain = "amazon.co.uk";
    market = "A1F83G8C2ARO7P";
  }
  if (host.indexOf("amazon.de") > 0) {
    domain = "amazon.de";
    webDomain = "amazon.de";
    market = "A1PA6795UKMFR9";
  }
  if (host.indexOf("amazon.fr") > 0) {
    domain = "amazon.fr";
    webDomain = "amazon.fr";
    market = "A13V1IB3VIYZZH";
  }
  if (host.indexOf("amazon.it") > 0) {
    domain = "amazon.it";
    webDomain = "amazon.it";
    market = "APJ6JRA9NG5V4";
  }
  if (host.indexOf("amazon.es") > 0) {
    domain = "amazon.es";
    webDomain = "amazon.es";
    market = "A1RKKUPIHCS9HS";
  }
  if (host.indexOf("amazon.com.mx") > 0) {
    domain = "amazon.com.mx";
    webDomain = "amazon.com.mx";
    market = "A1AM78C64UM0Y8";
  }
  if (host.indexOf("amazon.com.au") > 0) {
    domain = "amazon.com.au";
    webDomain = "amazon.com.au";
    market = "A39IBJ37TRP1C6";
  }
  return { domain: domain, market: market, webDomain: webDomain };
}

function processSuggestions(search, results) {

  var currentSearch = $("#twotabsearchtextbox").val();
  if (currentSearch != search) {
    return new Promise(function (resolve, reject) {});
  }


  var p = new Promise(function (resolve, reject) {
    var displayedKeywords = [];

    setTimeout(function () {

      if ($("#suggestions-template").length == 0) {
        $("#nav-flyout-searchAjax > div").wrapAll("<div id='suggestions-template'><div id='suggestions'></div></div>");
      }

      var subSearch = false;
      if ($("#suggestions .s-selected").length > 0) {
        subSearch = true;
      }

      $("#suggestions").css("display", "inline-block").css("vertical-align", "top").css("min-width", "350px");

      $("#suggestions .discover-tr").remove();
      $("#suggestions .discover-hr").remove();
      $(".cards_discover_widget-sug-container-top").remove();
      $("#suggestions .text-refinement").remove();

      $("#nav-flyout-searchAjax").css("width", "100%").css("left", "0");
      var suggestionHeight = $("#suggestions").height();
      if ($("#ase-col1").length == 0) {
        $("div#suggestions-template").css("overflow-x", "scroll").css("display", "flex");
        $("div#suggestions-template").append("<div id='ase-col1' style='display: flex;flex-flow: column wrap;align-content: left;'>Col1</div>");
      }
      $("#ase-col1").empty().height(suggestionHeight);


      if ($("#aseBanner").length == 0) {
        $("#nav-flyout-searchAjax").append("\n        <div id=\"aseBanner\" style=\"line-height:40px;margin-left:10px\">\n          <a href=\"https://chrome.google.com/webstore/detail/amz-suggestion-expander/cpeaihkccbeemkfefcapijechkbfjlhb?hl=en-US\" target=\"_blank\">\n            ASE v" + chrome.runtime.getManifest().version + "\n            <span id=\"aseProIcon\">PRO</span>\n          </a>\n          <a href=\"#\" id=\"aseSettings\" style=\"margin-left:10px;\" class=\"ase-tooltip-top\" data-ase-tooltip=\"Settings\">\n            <img src=\"" + chrome.runtime.getURL("images/settings.png") + "\" style=\"height:20px;margin-top:10px;\" />\n          </a>\n          <div id=\"aseWordListSection\">\n            <span style=\"padding:0 10px; vertical-align:top\">|</span>\n            <div style=\"display:inline-block\">Common Words:</div>\n            <ul id=\"aseWordList\">\n            </ul>\n          </div>\n          <div id=\"aseExportSection\">\n            <span style=\"padding:0 10px; vertical-align:top\">|</span>\n            <div style=\"display:inline-block\" id=\"aseExport\">\n              <a href=\"#\" style=\"display:inline-block;height:100%\">\n                <img src=\"" + chrome.runtime.getURL("images/download.png") + "\" style=\"height:20px;margin-top:10px\" />\n                Download Keywords\n              </a>\n            </div>\n          </div>\n          <div style=\"display:inline-block\" id=\"aseExportAdSection\">\n            <span style=\"padding:0 10px; vertical-align:top\">|</span>\n            <div style=\"display:inline-block\" id=\"aseExportAd\">\n              <a href=\"https://gum.co/asepro/ase?utm_source=ase\" target=\"_blank\" style=\"display:inline-block;height:100%\">\n                <img src=\"" + chrome.runtime.getURL("images/download.png") + "\" style=\"height:20px;margin-top:10px\" />\n                Download Keywords!\n              </a>\n            </div>\n          </div>\n          <div style=\"display:inline-block\" id=\"aseAdsSection\">\n            <span style=\"padding:0 10px; vertical-align:top\">|</span>\n            <div style=\"display:inline-block\" id=\"aseAds\">\n            </div>\n          </div>\n          <span style=\"padding:0 10px\">|</span>\n          <img src=\"" + chrome.runtime.getURL("images/light-bulb.png") + "\" style=\"height:20px;margin-top:10px\" />\n          <div style=\"display:inline-block\" id=\"aseTips\">\n          </div>\n        </div>");

        if (isASEPro) {
          $("#aseAdsSection").hide();
          $("#aseExportAdSection").hide();
          $("#aseProIcon").show();
          $("#aseExportSection").css("display", "inline-block");
          $("#aseWordListSection").css("display", "inline-block");
        }

        $("#aseAds").html(getNextAd());
        $("#aseTips").html(getNextTip());

        if (adTimer) clearInterval(adTimer);
        adTimer = setInterval(function () {
          if (!hoveringAd) {
            $("#aseAds").html(getNextAd());
          }
          $("#aseTips").html(getNextTip());
        }, 12000);
      }

      var mainKeywords = parseResults(results[0]);
      displayedKeywords = mainKeywords;

      var otherTitleDisplayed = false;
      var keywordCount = 0;
      var i = 0;
      var _iteratorNormalCompletion14 = true;
      var _didIteratorError14 = false;
      var _iteratorError14 = undefined;

      try {
        for (var _iterator14 = results[Symbol.iterator](), _step14; !(_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done); _iteratorNormalCompletion14 = true) {
          var result = _step14.value;

          if (i == 0 && !subSearch) {
            i++;
            continue;
          }

          var keywords = parseResults(result);

          var filteredKeywords = [];

          if (i == 0) {
            filteredKeywords = keywords;
          } else {
            var _iteratorNormalCompletion15 = true;
            var _didIteratorError15 = false;
            var _iteratorError15 = undefined;

            try {
              for (var _iterator15 = keywords[Symbol.iterator](), _step15; !(_iteratorNormalCompletion15 = (_step15 = _iterator15.next()).done); _iteratorNormalCompletion15 = true) {
                var _keyword3 = _step15.value;

                if (mainKeywords.indexOf(_keyword3) < 0 && displayedKeywords.indexOf(_keyword3) < 0) {
                  filteredKeywords.push(_keyword3);
                  displayedKeywords.push(_keyword3);
                }
              }
            } catch (err) {
              _didIteratorError15 = true;
              _iteratorError15 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion15 && _iterator15.return) {
                  _iterator15.return();
                }
              } finally {
                if (_didIteratorError15) {
                  throw _iteratorError15;
                }
              }
            }
          }

          if (filteredKeywords.length == 0) {
            i++;
            continue;
          }

          var backgroundColor = "#ffe6e6";
          var suggestionType = "";
          if (i == 0) {
            backgroundColor = "white";
            suggestionType = "Amazon Suggestions";
          } else if (i == 1) {
            suggestionType = "Keywords Before";
          } else if (i == 2) {
            backgroundColor = "#ebfaeb";
            suggestionType = "Keywords After";
          } else if (i == 3) {
            backgroundColor = "#e6ecff";
            suggestionType = "Keywords Between";
          } else if (i >= 4) {
            backgroundColor = "#f2f2f2";
            suggestionType = "Other";
          }
          if (i <= 4 || !otherTitleDisplayed) {
            $("#ase-col1").append("<div class=\"s-suggestion\" style=\"background-color:" + backgroundColor + "\"><b>" + suggestionType + "</b></div>");

            if (i >= 4) {
              otherTitleDisplayed = true;
            }
          }

          var _iteratorNormalCompletion16 = true;
          var _didIteratorError16 = false;
          var _iteratorError16 = undefined;

          try {
            for (var _iterator16 = filteredKeywords[Symbol.iterator](), _step16; !(_iteratorNormalCompletion16 = (_step16 = _iterator16.next()).done); _iteratorNormalCompletion16 = true) {
              var _keyword4 = _step16.value;

              if (keywordCount >= MAX_KEYWORDS_IN_SEARCH) {
                break;
              }

              var beforeKeyword = "";
              var middleKeyword = search;
              var afterKeyword = "";
              var pos = _keyword4.indexOf(search);
              if (pos >= 0) {
                beforeKeyword = _keyword4.substring(0, pos);
                afterKeyword = _keyword4.substring(pos + search.length);
              } else {
                beforeKeyword = _keyword4;
                middleKeyword = "";
              }
              $("#ase-col1").append("<div class=\"ase-suggestion\" style=\"background-color:" + backgroundColor + "\" data-keyword=\"" + quoteattr(_keyword4, false) + "\"><span class=\"s-heavy\">" + beforeKeyword + "</span>" + middleKeyword + "<span class=\"s-heavy\">" + afterKeyword + "</span></div>");
              keywordCount++;
            }
          } catch (err) {
            _didIteratorError16 = true;
            _iteratorError16 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion16 && _iterator16.return) {
                _iterator16.return();
              }
            } finally {
              if (_didIteratorError16) {
                throw _iteratorError16;
              }
            }
          }

          i++;

          if (keywordCount >= MAX_KEYWORDS_IN_SEARCH) {
            break;
          }
        }
      } catch (err) {
        _didIteratorError14 = true;
        _iteratorError14 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion14 && _iterator14.return) {
            _iterator14.return();
          }
        } finally {
          if (_didIteratorError14) {
            throw _iteratorError14;
          }
        }
      }

      gaevent("search", "performed");

      trackSearchDb();

      resolve(displayedKeywords);
    }, 500);
  });

  return p;
}

var trackSearchDb = debounce(function () {
  console.debug("trackSearchDb");

  gaevent("searchDb", "performed");
}, 1000);

function parseResults(result) {

  var jsonText = result;
  var keywords = [];
  if (jsonText.length > 0) {
    var json = JSON.parse(jsonText);
    keywords = json.suggestions.filter(function (value) {
      if (value.type == "KEYWORD") {
        return true;
      }
      return false;
    }).map(function (value) {
      if (value.highlightFragments && value.highlightFragments.length > 0) {
        var text = "";
        var _iteratorNormalCompletion17 = true;
        var _didIteratorError17 = false;
        var _iteratorError17 = undefined;

        try {
          for (var _iterator17 = value.highlightFragments[Symbol.iterator](), _step17; !(_iteratorNormalCompletion17 = (_step17 = _iterator17.next()).done); _iteratorNormalCompletion17 = true) {
            var fragment = _step17.value;

            text += fragment.text;
          }
        } catch (err) {
          _didIteratorError17 = true;
          _iteratorError17 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion17 && _iterator17.return) {
              _iterator17.return();
            }
          } finally {
            if (_didIteratorError17) {
              throw _iteratorError17;
            }
          }
        }

        return text;
      } else {
        return value.value;
      }
    });
  }
  console.debug(keywords);

  return keywords;
}

function quoteattr(s, preserveCR) {
  preserveCR = preserveCR ? '&#13;' : '\n';
  return ('' + s). 
  replace(/&/g, '&amp;') 
  .replace(/'/g, '&apos;') 
  .replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/\r\n/g, preserveCR) 
  .replace(/[\r\n]/g, preserveCR);
  ;
}

function getNextAd() {

  var html = $("section:eq(" + adIndex + ")", adHtml).html();
  adIndex++;
  if (adIndex >= $("section", adHtml).length) {
    adIndex = 0;
  }
  return "<div class=\"ase-animated ase-fadeIn\">" + html + "</div>";
}

function getNextTip() {

  var tip = tips[tipIndex];
  tipIndex++;
  if (tipIndex >= tips.length) {
    tipIndex = 0;
  }
  return "<div class=\"ase-animated ase-fadeIn\">Tip: " + tip + "</div>";
}

function shuffle(array) {
  var currentIndex = array.length,
      temporaryValue,
      randomIndex;

  while (0 !== currentIndex) {

    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function debounce(func) {
  var _this = this;

  var timeout = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 300;

  var timer = void 0;
  return function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    clearTimeout(timer);
    timer = setTimeout(function () {
      func.apply(_this, args);
    }, timeout);
  };
}

var FrequencyAnalysis = function () {
  _createClass(FrequencyAnalysis, null, [{
    key: "MIN_KEYWORD_LENGTH",
    get: function get() {
      return 2;
    }
  }]);

  function FrequencyAnalysis(ignoreAdjectives) {
    _classCallCheck(this, FrequencyAnalysis);

    this.list = {};
    this.ignoreAdjectives = ignoreAdjectives;
    this.stemmer = new Stemmer();
  }

  _createClass(FrequencyAnalysis, [{
    key: "parse",
    value: function parse(key, value) {

      var stopwords = ["a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", "by", "could", "did", "do", "does", "doing", "down", "during", "each", "few", "for", "from", "further", "had", "has", "have", "having", "he", "he'd", "he'll", "he's", "her", "here", "here's", "hers", "herself", "him", "himself", "his", "how", "how's", "i", "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is", "it", "it's", "its", "itself", "let's", "me", "more", "most", "my", "myself", "nor", "of", "on", "once", "only", "or", "other", "ought", "our", "ours", "ourselves", "out", "over", "own", "same", "she", "she'd", "she'll", "she's", "should", "so", "some", "such", "than", "that", "that's", "the", "their", "theirs", "them", "themselves", "then", "there", "there's", "these", "they", "they'd", "they'll", "they're", "they've", "this", "those", "through", "to", "too", "under", "until", "up", "very", "was", "we", "we'd", "we'll", "we're", "we've", "were", "what", "what's", "when", "when's", "where", "where's", "which", "while", "who", "who's", "whom", "why", "why's", "with", "would", "you", "you'd", "you'll", "you're", "you've", "your", "yours", "yourself", "yourselves"];
      var adjectives = ["average", "big", "colossal", "fat", "giant", "gigantic", "great", "huge", "immense", "large", "little", "long", "mammoth", "massive", "miniature", "petite", "puny", "short", "small", "tall", "tiny", "boiling", "breezy", "broken", "bumpy", "chilly", "cold", "cool", "creepy", "crooked", "cuddly", "curly", "damaged", "damp", "dirty", "dry", "dusty", "filthy", "flaky", "fluffy", "wet", "broad", "chubby", "crooked", "curved", "deep", "flat", "high", "hollow", "low", "narrow", "round", "shallow", "skinny", "square", "steep", "straight", "wide", "ancient", "brief", "early", "fast", "late", "long", "modern", "old", "old-fashioned", "quick", "rapid", "short", "slow", "swift", "young", "abundant", "empty", "few", "heavy", "light", "many", "numerous", "Sound", "cooing", "deafening", "faint", "harsh", "high-pitched", "hissing", "hushed", "husky", "loud", "melodic", "moaning", "mute", "noisy", "purring", "quiet", "raspy", "resonant", "screeching", "shrill", "silent", "soft", "squealing", "thundering", "voiceless", "whispering", "bitter", "delicious", "fresh", "juicy", "ripe", "rotten", "salty", "sour", "spicy", "stale", "sticky", "strong", "sweet", "tasteless", "tasty", "thirsty", "fluttering", "fuzzy", "greasy", "grubby", "hard", "hot", "icy", "loose", "melted", "plastic", "prickly", "rainy", "rough", "scattered", "shaggy", "shaky", "sharp", "shivering", "silky", "slimy", "slippery", "smooth", "soft", "solid", "steady", "sticky", "tender", "tight", "uneven", "weak", "wet", "wooden", "afraid", "angry", "annoyed", "anxious", "arrogant", "ashamed", "awful", "bad", "bewildered", "bored", "combative", "condemned", "confused", "creepy", "cruel", "dangerous", "defeated", "defiant", "depressed", "disgusted", "disturbed", "eerie", "embarrassed", "envious", "evil", "fierce", "foolish", "frantic", "frightened", "grieving", "helpless", "homeless", "hungry", "hurt", "ill", "jealous", "lonely", "mysterious", "naughty", "nervous", "obnoxious", "outrageous", "panicky", "repulsive", "scary", "scornful", "selfish", "sore", "tense", "terrible", "thoughtless", "tired", "troubled", "upset", "uptight", "weary", "wicked", "worried", "agreeable", "amused", "brave", "calm", "charming", "cheerful", "comfortable", "cooperative", "courageous", "delightful", "determined", "eager", "elated", "enchanting", "encouraging", "energetic", "enthusiastic", "excited", "exuberant", "fair", "faithful", "fantastic", "fine", "friendly", "funny", "gentle", "glorious", "good", "happy", "healthy", "helpful", "hilarious", "jolly", "joyous", "kind", "lively", "lovely", "lucky", "obedient", "perfect", "pleasant", "proud", "relieved", "silly", "smiling", "splendid", "successful", "thoughtful", "victorious", "vivacious", "witty", "wonderful", "zealous", "zany", "other", "good", "new", "old", "great", "high", "small", "different", "large", "local", "social", "important", "long", "young", "national", "british", "right", "early", "possible", "big", "little", "political", "able", "late", "general", "full", "far", "low", "public", "available", "bad", "main", "sure", "clear", "major", "economic", "only", "likely", "real", "black", "particular", "international", "special", "difficult", "certain", "open", "whole", "white", "free", "short", "easy", "strong", "european", "central", "similar", "human", "common", "necessary", "single", "personal", "hard", "private", "poor", "financial", "wide", "foreign", "simple", "recent", "concerned", "american", "various", "close", "fine", "english", "wrong", "present", "royal", "natural", "individual", "nice", "french", "following", "current", "modern", "labour", "legal", "happy", "final", "red", "normal", "serious", "previous", "total", "prime", "significant", "industrial", "sorry", "dead", "specific", "appropriate", "top", "soviet", "basic", "military", "original", "successful", "aware", "hon", "popular", "heavy", "professional", "direct", "dark", "cold", "ready", "green", "useful", "effective", "western", "traditional", "scottish", "german", "independent", "deep", "interesting", "considerable", "involved", "physical", "left", "hot", "existing", "responsible", "complete", "medical", "blue", "extra", "past", "male", "interested", "fair", "essential", "beautiful", "civil", "primary", "obvious", "future", "environmental", "positive", "senior", "nuclear", "annual", "relevant", "huge", "rich", "commercial", "safe", "regional", "practical", "official", "separate", "key", "chief", "regular", "due", "additional", "active", "powerful", "complex", "standard", "impossible", "light", "warm", "middle", "fresh", "sexual", "front", "domestic", "actual", "united", "technical", "ordinary", "cheap", "strange", "internal", "excellent", "quiet", "soft", "potential", "northern", "religious", "quick", "very", "famous", "cultural", "proper", "broad", "joint", "formal", "limited", "conservative", "lovely", "usual", "ltd", "unable", "rural", "initial", "substantial", "christian", "bright", "average", "leading", "reasonable", "immediate", "suitable", "equal", "detailed", "working", "overall", "female", "afraid", "democratic", "growing", "sufficient", "scientific", "eastern", "correct", "inc", "irish", "expensive", "educational", "mental", "dangerous", "critical", "increased", "familiar", "unlikely", "double", "perfect", "slow", "tiny", "dry", "historical", "thin", "daily", "southern", "increasing", "wild", "alone", "urban", "empty", "married", "narrow", "liberal", "supposed", "upper", "apparent", "tall", "busy", "bloody", "prepared", "russian", "moral", "careful", "clean", "attractive", "japanese", "vital", "thick", "alternative", "fast", "ancient", "elderly", "rare", "external", "capable", "brief", "wonderful", "grand", "typical", "entire", "grey", "constant", "vast", "surprised", "ideal", "terrible", "academic", "funny", "minor", "pleased", "severe", "ill", "corporate", "negative", "permanent", "weak", "brown", "fundamental", "odd", "crucial", "inner", "used", "criminal", "contemporary", "sharp", "sick", "near", "roman", "massive", "unique", "secondary", "parliamentary", "african", "unknown", "subsequent", "angry", "alive", "guilty", "lucky", "enormous", "well", "communist", "yellow", "unusual", "net", "long-term", "tough", "dear", "extensive", "glad", "remaining", "agricultural", "alright", "healthy", "italian", "principal", "tired", "efficient", "comfortable", "chinese", "relative", "friendly", "conventional", "willing", "sudden", "proposed", "voluntary", "slight", "valuable", "dramatic", "golden", "temporary", "federal", "keen", "flat", "silent", "indian", "video-taped", "worried", "pale", "statutory", "welsh", "dependent", "firm", "wet", "competitive", "armed", "radical", "outside", "acceptable", "sensitive", "living", "pure", "global", "emotional", "sad", "secret", "rapid", "adequate", "fixed", "sweet", "administrative", "wooden", "remarkable", "comprehensive", "surprising", "solid", "rough", "mere", "mass", "brilliant", "maximum", "absolute", "tory", "electronic", "visual", "electric", "cool", "spanish", "literary", "continuing", "supreme", "chemical", "genuine", "exciting", "written", "stupid", "advanced", "extreme", "classical", "fit", "favourite", "socialist", "widespread", "confident", "straight", "catholic", "proud", "numerous", "opposite", "distinct", "mad", "helpful", "given", "disabled", "consistent", "anxious", "nervous", "awful", "stable", "constitutional", "satisfied", "conscious", "developing", "strategic", "holy", "smooth", "dominant", "remote", "theoretical", "outstanding", "pink", "pretty", "clinical", "minimum", "honest", "impressive", "related", "residential", "extraordinary", "plain", "visible", "accurate", "distant", "still", "greek", "complicated", "musical", "precise", "gentle", "broken", "live", "silly", "fat", "tight", "monetary", "round", "psychological", "violent", "unemployed", "inevitable", "junior", "sensible", "grateful", "pleasant", "dirty", "structural", "welcome", "so-called", "deaf", "above", "continuous", "blind", "overseas", "mean", "entitled", "delighted", "loose", "occasional", "evident", "desperate", "fellow", "universal", "square", "steady", "classic", "equivalent", "intellectual", "victorian", "level", "ultimate", "creative", "lost", "medieval", "clever", "linguistic", "convinced", "judicial", "raw", "sophisticated", "asleep", "vulnerable", "illegal", "outer", "revolutionary", "bitter", "changing", "australian", "native", "imperial", "strict", "wise", "informal", "flexible", "collective", "frequent", "experimental", "spiritual", "intense", "rational", "ethnic", "generous", "inadequate", "prominent", "logical", "bare", "historic", "modest", "dutch", "acute", "electrical", "valid", "weekly", "gross", "automatic", "loud", "reliable", "mutual", "liable", "multiple", "ruling", "curious", "arab", "sole", "jewish", "managing", "pregnant", "latin", "nearby", "exact", "underlying", "identical", "satisfactory", "marginal", "distinctive", "electoral", "urgent", "presidential", "controversial", "oral", "everyday", "encouraging", "organic", "continued", "expected", "statistical", "desirable", "innocent", "improved", "exclusive", "marked", "experienced", "unexpected", "superb", "sheer", "disappointed", "frightened", "full-time", "gastric", "capitalist", "romantic", "naked", "reluctant", "magnificent", "convenient", "established", "closed", "uncertain", "artificial", "diplomatic", "tremendous", "marine", "mechanical", "retail", "institutional", "mixed", "required", "biological", "known", "functional", "straightforward", "superior", "digital", "part-time", "spectacular", "unhappy", "confused", "unfair", "aggressive", "spare", "painful", "abstract", "asian", "associated", "legislative", "monthly", "intelligent", "hungry", "explicit", "nasty", "just", "faint", "coloured", "ridiculous", "amazing", "comparable", "successive", "working-class", "realistic", "back", "decent", "unnecessary", "flying", "fucking", "random", "influential", "dull", "genetic", "neat", "marvellous", "crazy", "damp", "giant", "secure", "bottom", "skilled", "subtle", "elegant", "brave", "lesser", "parallel", "steep", "intensive", "casual", "tropical", "lonely", "partial", "preliminary", "concrete", "alleged", "assistant", "vertical", "upset", "delicate", "mild", "occupational", "excessive", "progressive", "iraqi", "exceptional", "integrated", "striking", "continental", "okay", "harsh", "combined", "fierce", "handsome", "characteristic", "chronic", "compulsory", "interim", "objective", "splendid", "magic", "short-term", "systematic", "obliged", "payable", "fun", "horrible", "primitive", "fascinating", "ideological", "metropolitan", "surrounding", "estimated", "peaceful", "premier", "operational", "technological", "kind", "advisory", "hostile", "precious", "gay", "accessible", "determined", "excited", "impressed", "provincial", "smart", "endless", "isolated", "post-war", "drunk", "geographical", "like", "dynamic", "boring", "forthcoming", "unfortunate", "definite", "super", "notable", "indirect", "stiff", "wealthy", "awkward", "lively", "neutral", "artistic", "content", "mature", "colonial", "ambitious", "evil", "magnetic", "verbal", "legitimate", "sympathetic", "well-known", "empirical", "head", "shallow", "vague", "naval", "depressed", "shared", "added", "shocked", "mid", "worthwhile", "qualified", "missing", "blank", "absent", "favourable", "polish", "israeli", "developed", "profound", "representative", "enthusiastic", "dreadful", "rigid", "reduced", "cruel", "coastal", "peculiar", "racial", "ugly", "swiss", "crude", "extended", "selected", "eager", "feminist", "canadian", "bold", "relaxed", "corresponding", "running", "planned", "applicable", "immense", "allied", "comparative", "uncomfortable", "conservation", "productive", "beneficial", "bored", "charming", "minimal", "mobile", "turkish", "orange", "rear", "passive", "suspicious", "overwhelming", "fatal", "resulting", "symbolic", "registered", "neighbouring", "calm", "irrelevant", "patient", "compact", "profitable", "rival", "loyal", "moderate", "distinguished", "interior", "noble", "insufficient", "eligible", "mysterious", "varying", "middle-class", "managerial", "molecular", "olympic", "linear", "prospective", "printed", "parental", "diverse", "elaborate", "furious", "fiscal", "burning", "useless", "semantic", "embarrassed", "inherent", "philosophical", "deliberate", "awake", "variable", "promising", "unpleasant", "varied", "sacred", "selective", "inclined", "tender", "hidden", "worthy", "intermediate", "sound", "protective", "fortunate", "slim", "islamic", "defensive", "divine", "stuck", "driving", "invisible", "misleading", "circular", "mathematical", "inappropriate", "liquid", "persistent", "solar", "doubtful", "manual", "architectural", "intact", "incredible", "devoted", "prior", "tragic", "respectable", "optimistic", "convincing", "unacceptable", "decisive", "competent", "spatial", "respective", "binding", "relieved", "nursing", "toxic", "select", "redundant", "integral", "then", "probable", "amateur", "fond", "passing", "specified", "territorial", "horizontal", "old-fashioned", "inland", "cognitive", "regulatory", "miserable", "resident", "polite", "scared", "marxist", "gothic", "civilian", "instant", "lengthy", "adverse", "korean", "unconscious", "anonymous", "aesthetic", "orthodox", "static", "unaware", "costly", "fantastic", "foolish", "fashionable", "causal", "compatible", "wee", "implicit", "dual", "ok", "cheerful", "subjective", "forward", "surviving", "exotic", "purple", "cautious", "visiting", "aggregate", "ethical", "protestant", "teenage", "large-scale", "dying", "disastrous", "delicious", "confidential", "underground", "thorough", "grim", "autonomous", "atomic", "frozen", "colourful", "injured", "uniform", "ashamed", "glorious", "wicked", "coherent", "rising", "shy", "novel", "balanced", "delightful", "arbitrary", "adjacent", "psychiatric", "worrying", "weird", "unchanged", "rolling", "evolutionary", "intimate", "sporting", "disciplinary", "formidable", "lexical", "noisy", "gradual", "accused", "homeless", "supporting", "coming", "renewed", "excess", "retired", "rubber", "chosen", "outdoor", "embarrassing", "preferred", "bizarre", "appalling", "agreed", "imaginative", "governing", "accepted", "vocational", "palestinian", "mighty", "puzzled", "worldwide", "handicapped", "organisational", "sunny", "eldest", "eventual", "spontaneous", "vivid", "rude", "nineteenth-century", "faithful", "ministerial", "innovative", "controlled", "conceptual", "unwilling", "civic", "meaningful", "disturbing", "alive", "brainy", "breakable", "busy", "careful", "cautious", "clever", "concerned", "crazy", "curious", "dead", "different", "difficult", "doubtful", "easy", "famous", "fragile", "helpful", "helpless", "important", "impossible", "innocent", "inquisitive", "modern", "open", "outstanding", "poor", "powerful", "puzzled", "real", "rich", "shy", "sleepy", "stupid", "super", "tame", "uninterested", "wandering", "wild", "wrong", "adorable", "alert", "average", "beautiful", "blonde", "bloody", "blushing", "bright", "clean", "clear", "cloudy", "colorful", "crowded", "cute", "dark", "drab", "distinct", "dull", "elegant", "fancy", "filthy", "glamorous", "gleaming", "graceful", "grotesque", "homely", "light", "misty", "motionless", "muddy", "plain", "poised", "quaint", "shiny", "smoggy", "sparkling", "spotless", "stormy", "strange", "ugly", "unsightly", "unusual", "bad", "better", "beautiful", "big", "black", "blue", "bright", "clumsy", "crazy", "dizzy", "dull", "fat", "frail", "friendly", "funny", "great", "green", "gigantic", "gorgeous", "grumpy", "handsome", "happy", "horrible", "itchy", "jittery", "jolly", "kind", "long", "lazy", "magnificent", "magenta", "many", "mighty", "mushy", "nasty", "new", "nice", "nosy", "nutty", "nutritious", "odd", "orange", "ordinary", "pretty", "precious", "prickly", "purple", "quaint", "quiet", "quick", "quickest", "rainy", "rare", "ratty", "red", "roasted", "robust", "round", "sad", "scary", "scrawny", "short", "silly", "stingy", "strange", "striped", "spotty", "tart", "tall", "tame", "tan", "tender", "testy", "tricky", "tough", "ugly", "ugliest", "vast", "watery", "wasteful", "wide-eyed", "wonderful", "yellow", "yummy", "zany", "xl"];

      var words = value.replace(/[\-]+/g, " ");
      words = words.replace(/[^0-9a-zA-ZÀ-ÿ ]+/g, "").split(" ");
      words = this.removeDupes(words);
      for (var i = 0; i < words.length; i++) {
        var word = words[i].trim().toLowerCase();
        if (!stopwords.includes(word) && (!this.ignoreAdjectives || !adjectives.includes(word)) && isNaN(word) && word != "") {
          this.add(key, word);
        }
      }
    }
  }, {
    key: "add",
    value: function add(key, keyword) {
      if (keyword.length >= FrequencyAnalysis.MIN_KEYWORD_LENGTH) {
        var stemmedWord = this.stemmer.stem(keyword);
        var counter = this.list[stemmedWord];
        if (!counter) {
          counter = this.list[stemmedWord] = { keyword: keyword, count: 0, keys: [] };
        }
        if (!counter.keys.includes(key)) {
          counter.keys.push(key);
          if (keyword.length < counter.keyword.length) {
            counter.keyword = keyword;
          }
        }
        counter.count++;
      }
    }
  }, {
    key: "dump",
    value: function dump() {
      console.log("Total keywords: " + Object.keys(this.list).length);
      console.log(this.list);
    }
  }, {
    key: "process",
    value: function process(minCountToKeep) {
      var results = [];
      for (var _keyword5 in this.list) {
        if (this.list[_keyword5].count >= minCountToKeep) {
          results.push(this.list[_keyword5]);
        }
      }
      results.sort(function (a, b) {
        return (a.count - b.count) * -1;
      });
      return results;
    }
  }, {
    key: "allKeywords",
    value: function allKeywords() {
      return this.topKeywords(Number.MAX_VALUE);
    }
  }, {
    key: "topKeywords",
    value: function topKeywords(numKeywords) {
      var results = [];
      for (var _keyword6 in this.list) {
        results.push(this.list[_keyword6]);
      }
      results.sort(function (a, b) {
        return (a.count - b.count) * -1;
      });
      results = results.slice(0, numKeywords);
      return results;
    }
  }, {
    key: "removeDupes",
    value: function removeDupes(a) {
      return a.sort().filter(function (item, pos, ary) {
        return !pos || item != ary[pos - 1];
      });
    }
  }]);

  return FrequencyAnalysis;
}();

var Stemmer = function () {
  function Stemmer() {
    _classCallCheck(this, Stemmer);

    var STOP = -1;
    var INTACT = 0;
    this.INTACT = INTACT;
    var CONTINUE = 1;
    this.CONTINUE = CONTINUE;
    var PROTECT = 2;
    this.PROTECT = PROTECT;
    this.VOWELS = /[aeiouy]/;

    this.rules = {
      a: [{ match: 'ia', replacement: '', type: INTACT }, { match: 'a', replacement: '', type: INTACT }],
      b: [{ match: 'bb', replacement: 'b', type: STOP }],
      c: [{ match: 'ytic', replacement: 'ys', type: STOP }, { match: 'ic', replacement: '', type: CONTINUE }, { match: 'nc', replacement: 'nt', type: CONTINUE }],
      d: [{ match: 'dd', replacement: 'd', type: STOP }, { match: 'ied', replacement: 'y', type: CONTINUE }, { match: 'ceed', replacement: 'cess', type: STOP }, { match: 'eed', replacement: 'ee', type: STOP }, { match: 'ed', replacement: '', type: CONTINUE }, { match: 'hood', replacement: '', type: CONTINUE }],
      e: [{ match: 'e', replacement: '', type: CONTINUE }],
      f: [{ match: 'lief', replacement: 'liev', type: STOP }, { match: 'if', replacement: '', type: CONTINUE }],
      g: [{ match: 'ing', replacement: '', type: CONTINUE }, { match: 'iag', replacement: 'y', type: STOP }, { match: 'ag', replacement: '', type: CONTINUE }, { match: 'gg', replacement: 'g', type: STOP }],
      h: [{ match: 'th', replacement: '', type: INTACT }, { match: 'guish', replacement: 'ct', type: STOP }, { match: 'ish', replacement: '', type: CONTINUE }],
      i: [{ match: 'i', replacement: '', type: INTACT }, { match: 'i', replacement: 'y', type: CONTINUE }],
      j: [{ match: 'ij', replacement: 'id', type: STOP }, { match: 'fuj', replacement: 'fus', type: STOP }, { match: 'uj', replacement: 'ud', type: STOP }, { match: 'oj', replacement: 'od', type: STOP }, { match: 'hej', replacement: 'her', type: STOP }, { match: 'verj', replacement: 'vert', type: STOP }, { match: 'misj', replacement: 'mit', type: STOP }, { match: 'nj', replacement: 'nd', type: STOP }, { match: 'j', replacement: 's', type: STOP }],
      l: [{ match: 'ifiabl', replacement: '', type: STOP }, { match: 'iabl', replacement: 'y', type: STOP }, { match: 'abl', replacement: '', type: CONTINUE }, { match: 'ibl', replacement: '', type: STOP }, { match: 'bil', replacement: 'bl', type: CONTINUE }, { match: 'cl', replacement: 'c', type: STOP }, { match: 'iful', replacement: 'y', type: STOP }, { match: 'ful', replacement: '', type: CONTINUE }, { match: 'ul', replacement: '', type: STOP }, { match: 'ial', replacement: '', type: CONTINUE }, { match: 'ual', replacement: '', type: CONTINUE }, { match: 'al', replacement: '', type: CONTINUE }, { match: 'll', replacement: 'l', type: STOP }],
      m: [{ match: 'ium', replacement: '', type: STOP }, { match: 'um', replacement: '', type: INTACT }, { match: 'ism', replacement: '', type: CONTINUE }, { match: 'mm', replacement: 'm', type: STOP }],
      n: [{ match: 'sion', replacement: 'j', type: CONTINUE }, { match: 'xion', replacement: 'ct', type: STOP }, { match: 'ion', replacement: '', type: CONTINUE }, { match: 'ian', replacement: '', type: CONTINUE }, { match: 'an', replacement: '', type: CONTINUE }, { match: 'een', replacement: '', type: PROTECT }, { match: 'en', replacement: '', type: CONTINUE }, { match: 'nn', replacement: 'n', type: STOP }],
      p: [{ match: 'ship', replacement: '', type: CONTINUE }, { match: 'pp', replacement: 'p', type: STOP }],
      r: [{ match: 'er', replacement: '', type: CONTINUE }, { match: 'ear', replacement: '', type: PROTECT }, { match: 'ar', replacement: '', type: STOP }, { match: 'ior', replacement: '', type: CONTINUE }, { match: 'or', replacement: '', type: CONTINUE }, { match: 'ur', replacement: '', type: CONTINUE }, { match: 'rr', replacement: 'r', type: STOP }, { match: 'tr', replacement: 't', type: CONTINUE }, { match: 'ier', replacement: 'y', type: CONTINUE }],
      s: [{ match: 'ies', replacement: 'y', type: CONTINUE }, { match: 'sis', replacement: 's', type: STOP }, { match: 'is', replacement: '', type: CONTINUE }, { match: 'ness', replacement: '', type: CONTINUE }, { match: 'ss', replacement: '', type: PROTECT }, { match: 'ous', replacement: '', type: CONTINUE }, { match: 'us', replacement: '', type: INTACT }, { match: 's', replacement: '', type: CONTINUE }, { match: 's', replacement: '', type: STOP }],
      t: [{ match: 'plicat', replacement: 'ply', type: STOP }, { match: 'at', replacement: '', type: CONTINUE }, { match: 'ment', replacement: '', type: CONTINUE }, { match: 'ent', replacement: '', type: CONTINUE }, { match: 'ant', replacement: '', type: CONTINUE }, { match: 'ript', replacement: 'rib', type: STOP }, { match: 'orpt', replacement: 'orb', type: STOP }, { match: 'duct', replacement: 'duc', type: STOP }, { match: 'sumpt', replacement: 'sum', type: STOP }, { match: 'cept', replacement: 'ceiv', type: STOP }, { match: 'olut', replacement: 'olv', type: STOP }, { match: 'sist', replacement: '', type: PROTECT }, { match: 'ist', replacement: '', type: CONTINUE }, { match: 'tt', replacement: 't', type: STOP }],
      u: [{ match: 'iqu', replacement: '', type: STOP }, { match: 'ogu', replacement: 'og', type: STOP }],
      v: [{ match: 'siv', replacement: 'j', type: CONTINUE }, { match: 'eiv', replacement: '', type: PROTECT }, { match: 'iv', replacement: '', type: CONTINUE }],
      y: [{ match: 'bly', replacement: 'bl', type: CONTINUE }, { match: 'ily', replacement: 'y', type: CONTINUE }, { match: 'ply', replacement: '', type: PROTECT }, { match: 'ly', replacement: '', type: CONTINUE }, { match: 'ogy', replacement: 'og', type: STOP }, { match: 'phy', replacement: 'ph', type: STOP }, { match: 'omy', replacement: 'om', type: STOP }, { match: 'opy', replacement: 'op', type: STOP }, { match: 'ity', replacement: '', type: CONTINUE }, { match: 'ety', replacement: '', type: CONTINUE }, { match: 'lty', replacement: 'l', type: STOP }, { match: 'istry', replacement: '', type: STOP }, { match: 'ary', replacement: '', type: CONTINUE }, { match: 'ory', replacement: '', type: CONTINUE }, { match: 'ify', replacement: '', type: STOP }, { match: 'ncy', replacement: 'nt', type: CONTINUE }, { match: 'acy', replacement: '', type: CONTINUE }],
      z: [{ match: 'iz', replacement: '', type: CONTINUE }, { match: 'yz', replacement: 'ys', type: STOP }]
    };
  }

  _createClass(Stemmer, [{
    key: "stem",
    value: function stem(value) {
      return this.applyRules(String(value).toLowerCase(), true);
    }
  }, {
    key: "applyRules",
    value: function applyRules(value, isIntact) {
      var ruleset = this.rules[value.charAt(value.length - 1)];
      var breakpoint;
      var index;
      var length;
      var rule;
      var next;

      if (!ruleset) {
        return value;
      }

      index = -1;
      length = ruleset.length;

      while (++index < length) {
        rule = ruleset[index];

        if (!isIntact && rule.type === this.INTACT) {
          continue;
        }

        breakpoint = value.length - rule.match.length;

        if (breakpoint < 0 || value.substr(breakpoint) !== rule.match) {
          continue;
        }

        if (rule.type === this.PROTECT) {
          return value;
        }

        next = value.substr(0, breakpoint) + rule.replacement;

        if (!this.acceptable(next)) {
          continue;
        }

        if (rule.type === this.CONTINUE) {
          return this.applyRules(next, false);
        }

        return next;
      }

      return value;
    }


  }, {
    key: "acceptable",
    value: function acceptable(value) {
      return this.VOWELS.test(value.charAt(0)) ? value.length > 1 : value.length > 2 && this.VOWELS.test(value);
    }
  }]);

  return Stemmer;
}();