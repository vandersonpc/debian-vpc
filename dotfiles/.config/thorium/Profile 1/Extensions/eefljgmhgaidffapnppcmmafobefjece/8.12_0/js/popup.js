(function () {

    chrome.runtime.sendMessage({ message: "login" }, function (response) {
      if (response == "fail") {
        chrome.runtime.sendMessage({ message: "logout", payload: {} }, function (response) {
          if (response == "success") $("#extension_status").prop("checked", false);
          window.location.replace("./pop-up-sign-in.html");
        });
      } else {
        chrome.tabs.sendMessage(activeTab.id, { isEnable: "true" });
        console.log("login success");
        // location.reload();
      }
    });

  let userPackage = null;
  chrome.runtime.sendMessage({ message: "userStatus" }, function (response) {
    userPackage = response?.userPackage;

    if (!response.userStatus) {
      window.location.replace("./pop-up-sign-in.html");
    }
  });

  chrome.storage.local.get(["token"], async function (response) {
    const res = await fetch(`https://go.selfpublishingtitans.com/api/v1/check/huge-expander`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${response.token}`,
      },
    });

    let resJson = await res.json();
    if (res.status === 401 || resJson.error == "Unauthorized" || resJson.error == "Invalid token") {
      chrome.runtime.sendMessage({ message: "logout", payload: {} }, function (response) {
        window.location.replace("./pop-up-sign-in.html");
      });
    }

    if (resJson.data) {
      document.getElementById("titanpro").style.display = "none";
    } else {
      document.getElementById("titanpro").style.display = "block";
    }
  });

  var uniqueId = "amazon-analysis-" + chrome.runtime.id;
  const isSponsoredStoreKey = uniqueId + "_isSponsoredEnabled";
  // check if sponsored is enabled
  chrome.storage.local.get([isSponsoredStoreKey], function (response) {
    if (response[isSponsoredStoreKey] === "true" || response[isSponsoredStoreKey] === true) {
      $("#is_sponsored_status").prop("checked", true);
    }
  });

  $("#is_sponsored_status").change(function () {
    chrome.storage.local.set(
      {
        [isSponsoredStoreKey]: $(this).is(":checked"),
      },
      function () {
        if (chrome.runtime.lastError) {
          console.error("Error Storing 1: ", chrome.runtime.lastError.message);
        }
      }
    );
  });

  chrome.storage.local.get(uniqueId + "_isEnable", function (data) {

    if (data[uniqueId + "_isEnable"] === "true" || data[uniqueId + "_isEnable"] === true) {
      $("#extension_status").prop("checked", true);
    }
  });

  $("#extension_status").change(function () {
    chrome.storage.local.set(
      {
        [uniqueId + "_isEnable"]: $(this).is(":checked"),
      },
      function () {
        if (chrome.runtime.lastError) {
          console.error("Error Storing 2: ", chrome.runtime.lastError.message);
        }
      }
    );

    if ($(this).is(":checked")) {
      chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, { isEnable: "true" });
      });
    } else {
      chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, { isEnable: "false" });
      });
    }
  });
})();
