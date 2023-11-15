(function () {
  let userPackage = null;
  chrome.runtime.sendMessage({ message: "userStatus" }, function (response) {
    userPackage = response?.userPackage;

    if (!response.userStatus) {
      window.location.replace("./pop-up-sign-in.html");
    } else {
      window.location.replace("./popup.html");
    }

    // document.querySelector("#pkg").innerHTML = `you have ${userPackage} Package`;
  });
})();
