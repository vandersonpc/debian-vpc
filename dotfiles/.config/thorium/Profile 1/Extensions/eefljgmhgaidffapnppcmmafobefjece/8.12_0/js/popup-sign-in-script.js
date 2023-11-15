const uniqueId = "amazon-analysis-" + chrome.runtime.id;

chrome.storage.local.get(uniqueId + "_isEnable", function (data) {
  if (data[uniqueId + "_isEnable"] === "true" || data[uniqueId + "_isEnable"] === true || data[uniqueId + "_isEnable"] === undefined) {
    chrome.runtime.sendMessage({ message: "login", payload: {} }, function (response) {
      chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
        const activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, { isEnable: "true" });
      });
      if (response == "success") window.location.replace("./popup.html");

      if (response == "fail") {
        document.querySelector(".logdiv").style.display = "flex";
        document.querySelector(".loader").style.display = "none";
      }
    });
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
        console.log("Error Storing 2: ", chrome.runtime.lastError.message);
      }
    }
  );
  if ($(this).is(":checked")) {
    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
      const activeTab = tabs[0];
      chrome.tabs.sendMessage(activeTab.id, { isEnable: "true" });
    });
  } else {
    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
      const activeTab = tabs[0];
      chrome.tabs.sendMessage(activeTab.id, { isEnable: "false" });
    });
  }
});
