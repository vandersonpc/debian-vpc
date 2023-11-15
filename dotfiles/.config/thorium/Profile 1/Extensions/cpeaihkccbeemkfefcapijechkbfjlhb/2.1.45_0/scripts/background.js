"use strict";

importScripts("/bower_components/js-md5/build/md5.min.js");

chrome.runtime.onInstalled.addListener(function (details) {
  if (details.reason == "install") {
    chrome.tabs.create({ url: chrome.runtime.getURL("post_install.html") });

    chrome.storage.sync.set({ seenRegistrationForm: true });
    chrome.tabs.create({ url: "https://list.raybeksolutions.com/ase-registration-form" });
  }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

  if (request.command == "getUrl") {
    fetch(request.url, {
      method: "GET"
    }).then(function (response) {
      response.text().then(function (data) {
        console.log(data);
        sendResponse(data);
      });
    }).catch(function (error) {
      console.error(error);
    });
    return true;
  }

  if (request.command == "getKeywordStats") {
    var time = new Date().getTime();
    fetch("https://ase-api.azure-api.net/keywords/lookup", {
      method: "post",
      headers: {
        "Accept": "application/json",
        "Ocp-Apim-Subscription-Key": "64a6cdd023944e59be30b88abff7575c"
      },
      body: JSON.stringify({
        "marketplace": request.marketplace,
        "keywords": request.keywords,
        "licenseKey": request.licenseKey,
        "requestKey": md5(time.toString() + "-" + request.licenseKey),
        "time": time
      })
    }).then(function (response) {
      response.text().then(function (data) {
        sendResponse(JSON.parse(data));
      });
    }).catch(function (error) {
      console.error(error);
      sendResponse({ "error": error });
    });

    return true;
  }

  if (request.command == "verifyLicense") {
    verifyLicense(request.licenseKey, request.lastLicenseCheck, function (result, uses) {
      sendResponse({ result: result, uses: uses });
    });
    return true;
  }

  if (request.command == "getNotice") {
    if (request.lastNoticeCheck && Math.abs(Date.now() - request.lastNoticeCheck) / 36e5 < 10 / 60) {
      sendResponse(null);
      return true;
    }

    fetch("https://raybeksolutions.com/wp-json/wp/v2/pages/?slug=ase-notice", {
      method: "get"
    }).then(function (response) {
      response.text().then(function (data) {
        sendResponse(JSON.parse(data));
      });
    }).catch(function (error) {
      console.error(error);
      sendResponse({ "error": error });
    });
    return true;
  }

  if (request.command == "openOptions") {
    chrome.runtime.openOptionsPage();
  }

  if (request.command == "saveKeywords") {

    return;

    if (Date.now() - lastSaveKeywordCall < 1000) {
      return;
    }
    lastSaveKeywordCall = Date.now();
    fetch("https://us-central1-amz-suggestion-expander.cloudfunctions.net/saveKeywords", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(request.keywords)
    }).catch(function (error) {
      console.error(error);
    });
  }
});

function verifyLicense(licenseKey, lastLicenseCheck, callback) {

  if (!licenseKey) {
    callback("not valid");
    return;
  }

  if (lastLicenseCheck && Math.abs(Date.now() - lastLicenseCheck) / 36e5 < 24) {
    callback("valid no check");
    return;
  }

  var incrementUseCount = false;
  if (!lastLicenseCheck) {
    incrementUseCount = true;
  }

  var params = {
    "product_id": "LugQoPZLPewJfSHodOzTQw==",
    "license_key": licenseKey,
    "increment_uses_count": incrementUseCount
  };

  var formBody = [];
  for (var property in params) {
    var encodedKey = encodeURIComponent(property);
    var encodedValue = encodeURIComponent(params[property]);
    formBody.push(encodedKey + "=" + encodedValue);
  }
  formBody = formBody.join("&");

  fetch("https://api.gumroad.com/v2/licenses/verify", {
    method: "POST",
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: formBody
  }).then(function (data) {
    var valid = "not valid";
    data.json().then(function (lic) {
      if (lic.success && !lic.purchase.chargebacked && !lic.purchase.refunded) {
        valid = "valid";
      }
      callback(valid, lic.uses);
    });
  }).catch(function (error) {
    if (lastLicenseCheck) {
      callback("valid");
    } else {
      callback("not valid");
    }
  });
}