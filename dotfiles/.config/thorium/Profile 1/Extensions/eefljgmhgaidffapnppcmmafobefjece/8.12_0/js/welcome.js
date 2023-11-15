chrome.runtime.sendMessage({ message: "login", payload: {} }, function (response) {
  if (response == "success") {
    document.querySelector(".beforelogin").style.display = "none";
    document.querySelector(".logincontainer").style.display = "block";
    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
      var activeTab = tabs[0];
      chrome.tabs.sendMessage(activeTab.id, { isEnable: "true" });
    });
  }
  if (response == "fail") {
    document.querySelector(".logdiv").style.display = "block";
    document.querySelector(".loader").style.display = "none";
    setTimeout(function () {
      document.querySelector(".wrongpass").style.display = "none";
    }, 3000);
  }
});
