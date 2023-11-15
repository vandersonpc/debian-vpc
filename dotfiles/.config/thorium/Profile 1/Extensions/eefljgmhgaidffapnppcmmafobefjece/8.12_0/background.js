const uniqueId = "amazon-analysis-" + chrome.runtime.id;

chrome.runtime.onInstalled.addListener(function (details) {
  chrome.storage.local.set(
    {
      [uniqueId + "_isEnable"]: true,
    },
    function () {
      if (chrome.runtime.lastError) {
        console.error("Initialize isEnable flag: ", chrome.runtime.lastError.message);
      }
    }
  );
  if (details.reason == "install") {
    chrome.tabs.create({ url: "welcome.html" });
  }
});
chrome.storage.local.set({ version: 3 });


const chromeExternalMessage = (message, sendResponse) => {
  const type = message.type;
  const payload = message.payload;
  switch (type) {
    case "TITANS_LOGIN":
      chrome.storage.local.set(
        {
          userStatus: true,
          userInfo: payload.user,
          token: payload.token,
        },
        function () {
          if (chrome.runtime.lastError) sendResponse("Login fail");

          sendResponse("Login success");
        }
      );
      break;
    case "TITANS_LOGOUT":
      chrome.storage.local.set({ userStatus: false, userInfo: {}, token: null }, function () {
        if (chrome.runtime.lastError) sendResponse("Logout fail");

        sendResponse("Logout success");
      });
      break;
    default:
      break;
  }
};

chrome.runtime.onMessageExternal.addListener((request, sender, sendResponse) => {
  console.log("Request ::: ", request);
  chromeExternalMessage(request, sendResponse);
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message == "disable") {
    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
      var activeTab = tabs[0];
      chrome.tabs.sendMessage(activeTab.id, { isEnable: "false" });
    });
  }
  if (request.command) {
    return "getUrl" == request.command
      ? (fetch(request.url, { method: "GET" })
          .then(function (request) {
            request.text().then(function (request) {
              console.log(request), sendResponse(request);
            });
          })
          ["catch"](function (request) {
            console.error(request);
          }),
        !0)
      : void ("saveKeywords" == request.command);
  }
  let userSignedIn = false;
  let returnSession = false;
  let userPackage = null;
  async function flip_user_status(signIn) {
    if (signIn) {
      return new Promise((resolve) => {
        fetch("https://selfpublishingtitans.com/api/auth/session", {
          mode: "cors",
        })
          .then((response) => response.json())
          .then((session) => {
            if (Object.keys(session).length > 0) {
              if (!session.token) {
                resolve("fail");
              } else {
                chrome.storage.local.set(
                  {
                    userStatus: signIn,
                    userInfo: session.user,
                    token: session.token,
                  },
                  function () {
                    if (chrome.runtime.lastError) resolve("fail");
                    userSignedIn = true;
                    resolve("success");
                  }
                );
              }
            } else {
              resolve("fail");
            }
          })
          .catch((err) => {
            console.error(err);
            resolve("fail");
          });
      });
    } else if (!signIn) {
      return new Promise((resolve) => {
        chrome.storage.local.get(["userStatus", "userInfo", "token"], function (response) {
          if (chrome.runtime.lastError) resolve("fail");

          if (response.userStatus == undefined && response.token == null) resolve("fail");

          chrome.storage.local.set({ userStatus: signIn, userInfo: {}, token: null }, function () {
            if (chrome.runtime.lastError) resolve("fail");

            userSignedIn = signIn;
            resolve("success");
          });
        });
      });
    }
  }

  if (request.message == "login") {
    flip_user_status(true)
      .then((res) => sendResponse(res))
      .catch((err) => console.log(err));
    return true;
  } else if (request.message == "logout") {
    flip_user_status(false)
      .then((res) => sendResponse(res))
      .catch((err) => console.log(err));
    return true;
  } else if (request.message == "userStatus") {
    is_user_signed_in()
      .then((res) => sendResponse(res))
      .catch((err) => console.log(err));
    return true;
  } else if (request.message == "packageInfo") {
    getPackageInfo()
      .then((res) => {
        if (Date.parse(res.subscription_due) > Date.now()) {
          sendResponse(true);
          return true;
        }
      })
      .catch((err) => {
        sendResponse(err);
        return true;
      });
  }

  function is_user_signed_in() {
    return new Promise((resolve) => {
      chrome.storage.local.get(["userStatus", "userInfo"], function (response) {
        if (chrome.runtime.lastError) resolve({ userStatus: false, userInfo: {} });

        resolve(response.userStatus == undefined ? { userStatus: false, userInfo: {} } : { userStatus: response.userStatus, userInfo: response.userInfo });
      });
    });
  }

  async function getPackageInfo() {
    chrome.storage.local.get(["token"], async function (response) {
      const requestOptions = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
      };
      let res = await fetch(`https://selfpublishingtitans-server-vwy33.ondigitalocean.app/api/exosub`, requestOptions);
      if (res.status != 200) return "fail";

      return res;
    });
  }

  is_user_signed_in()
    .then((res) => {
      if (res.userStatus) return (returnSession = true);

      userSignedIn = res.userSignedIn;
    })
    .catch((err) => console.log(err));

  chrome.action.onClicked.addListener(function () {
    is_user_signed_in().then((res) => {
      if (res.userStatus) {
        chrome.windows.create({
          url: "./popup.html",
          width: 300,
          height: 600,
          focused: true,
        });
      } else {
        chrome.windows.create({
          url: "./pop-up-sign-in.html",
          width: 300,
          height: 600,
          focused: true,
        });
      }
    });
  });
});
