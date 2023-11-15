const uniqueId = "amazon-analysis-" + chrome.runtime.id;
//data-titans-quick-view-id
let bodyElement = document.body;
// add extension id in body using data attribute
if(bodyElement){
  bodyElement.setAttribute("data-titans-quick-view-extension-id", chrome.runtime.id);
}
const hostname = window.location.hostname;
let isSponsoredEnabled = false;
const isSponsoredStoreKey = uniqueId + "_isSponsoredEnabled";

try {
  window.addEventListener("online", () => console.log("Became online"));
  window.addEventListener("offline", () => console.log("Became offline"));
} catch (error) {
  console.log(error);
}

function containsWord(str, word) {
  srt = str.toLowerCase();
  word = word.toLowerCase();
  // Escape special characters in the word
  const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  // Create a regular expression pattern with optional 's' character
  const pattern = new RegExp(`\\b${escapedWord}s?\\b`, "i");

  // Test if the pattern exists in the string
  return pattern.test(str);
}

function showLoginModal() {
  chrome.runtime.sendMessage({ message: "login", payload: {} }, function (response) {
    chrome.storage.local.set({ isEnable: "true" });
    if (response == "success") {
      location.reload();
    }

    if (response == "fail") {
      var wraper = document.createElement("div");
      wraper.style.cssText = "position: fixed; left: 36%; margin-top: 16px";
      wraper.innerHTML = login_div;

      var nav = document.getElementById("nav-main");
      if (nav) {
        nav.append(wraper);
        nav.style.height = "auto";
      }
    }
  });
  return;
}

/**
 * Get amazon products url
 */
function getProductUrls() {
  return new Promise(async (resolve, reject) => {
    const nodes = document.querySelectorAll(".s-main-slot.s-result-list [data-component-type=s-search-result]");
    const links = [];
    nodes.forEach((item) => {
      try {
        // .match(/\d+((.|,)\d+)?/) get price from string
        let price = 0;
        if (item && item.querySelector("span.a-offscreen") && item.querySelector("span.a-offscreen").textContent) {
          price = item.querySelector("span.a-offscreen").textContent;
        }
        const currencyDelimiterString = currencyDelimiter[hostname];
        const isSponsored = item.querySelector(".a-row.a-spacing-micro");
        const node = item.querySelector(".rush-component > .a-link-normal");
        const index = item.getAttribute("data-index");
        links.push({
          link: "https://" + hostname + node.getAttribute("href"),
          index: index,
          isSponsored: isSponsored == null ? false : true,
          price: price == null ? 0 : accounting.unformat(price, currencyDelimiterString),
        });
      } catch (error) {
        console.error(error);
      }
    });
    if (links.length == 0) {
      reject();
    }
    resolve(links);
  });
}

/**
 * Separate number with commas
 * @param {*} num
 */
function numberWithCommas(num) {
  if (num) return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

async function getToken() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(["token"], function (response) {
      resolve(response.token);
    });
  });
}

async function getDemandOpportunityScore(data) {
  let token = await getToken();
  // create a post fetch request with with token
  const response = await fetch("https://go.selfpublishingtitans.com/api/v1/chrome/bsr-results", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify(data),
  });
  return response;
}

function closeModal(modal) {
  modal.remove();
}

// Function to open the modal
function openModal(divId, pText) {
  if (document.querySelector(`.${stylePrefix}-modal`)) {
    return;
  }
  const modal = document.createElement("div");
  modal.classList.add(`${stylePrefix}-modal`);

  const modalContent = document.createElement("div");
  modalContent.classList.add(`${stylePrefix}-modal-content`);

  const text = document.createElement("p");
  text.textContent = pText;
  text.style.color = "black";

  const closeButton = document.createElement("button");
  closeButton.textContent = "x";
  closeButton.addEventListener("click", () => closeModal(modal));
  closeButton.classList.add(`${stylePrefix}-close-icon`);
  modalContent.appendChild(text);
  modalContent.appendChild(closeButton);

  modal.appendChild(modalContent);
  document.body.addEventListener(
    "click",
    () => {
      closeModal(modal);
    },
    true
  );
  // position: fixed;
  //   top: 0;
  //   left: 0;
  // get the divId position
  const divIdPosition = document.getElementById(divId).getBoundingClientRect();
  modal.style.left = divIdPosition.left + "px";
  modal.style.position = "fixed";
  modal.style.minWidth = "800px";
  modal.style.maxWidth = "900px";

  document.getElementById(divId).appendChild(modal);
}

function addPopUp(divId, text, styleText = "") {
  // content.js
  const helpIcon = document.createElement("span");
  helpIcon.innerHTML = "?";
  helpIcon.classList.add(`${stylePrefix}-bsr-help-icon`);
  helpIcon.style.cssText = styleText;
  helpIcon.setAttribute("id", "openModal");

  // add hover event
  helpIcon.addEventListener(
    "mouseover",
    function () {
      openModal(divId, text);
    },
    false
  );

  // add help icon
  document.getElementById(divId).appendChild(helpIcon);
}

/**
 * Create and download excel file
 * @param {*} productDetails
 */
function createExcelFile(productDetails) {
  // Create csv data
  var data = [["ASIN / ISBN", "Authors", "Title"]];
  Object.keys(productDetails).map(function (key) {
    var arr = [];
    arr.push(productDetails[key].isbn10.replace(/,/g, ""));
    arr.push(productDetails[key].authors);
    arr.push(productDetails[key].title.replace(/,/g, ""));
    data.push(arr);
  });
  csvData = data
    .map(function (v) {
      return v.join(",");
    })
    .join("\n");

  const createXLSLFormatObj = [];

  /* XLS Head Columns */
  const xlsHeader = ["ASIN / ISBN", "Authors", "Title"];

  /* XLS Rows Data */
  const xlsRows = Object.keys(productDetails).map(function (key) {
    return {
      "ASIN / ISBN": productDetails[key].isbn10.replace(/,/g, ""),
      Authors: productDetails[key].authors,
      Title: productDetails[key].title.replace(/,/g, ""),
    };
  });

  createXLSLFormatObj.push(xlsHeader);
  $.each(xlsRows, function (index, value) {
    const innerRowData = [];
    $.each(value, function (ind, val) {
      innerRowData.push(val);
    });
    createXLSLFormatObj.push(innerRowData);
  });

  /* File Name */
  var filename = "amazon_analysis.xlsx";

  /* Sheet Name */
  var ws_name = "AmazonAnalysis";

  if (typeof console !== "undefined") console.log(new Date());
  var wb = XLSX.utils.book_new(),
    ws = XLSX.utils.aoa_to_sheet(createXLSLFormatObj);

  /* Add worksheet to workbook */
  XLSX.utils.book_append_sheet(wb, ws, ws_name);

  /* Write workbook and Download */
  if (typeof console !== "undefined") console.log(new Date());
  XLSX.writeFile(wb, filename);
  if (typeof console !== "undefined") console.log(new Date());
}

/**
 * Render analysis table
 * @param {*} resNumber
 * @param {*} avgBSR
 * @param {*} nicheScore
 * @param {*} avgReviews
 * @param {*} avgPrice
 */
function renderLoadingTable() {
  if (document.getElementById(uniqueId)) {
    document.getElementById(uniqueId).parentElement.remove();
  }

  const wrapper = document.createElement("div");
  wrapper.style.cssText = "height: 180px; background: black;";
  // document.body.style = "position:absolute";
  chrome.storage.local.get(["version"], function (item) {
    if (item.version === 2) {
      wrapper.innerHTML = tableOld;
    } else if (item.version === 3) {
      wrapper.innerHTML = table;
    }
    setTimeout(function () {
      // Add eventlistner
      const v3Btn = document.querySelector("#switchStyleV3");
      if (v3Btn) {
        v3Btn.addEventListener("click", function () {
          chrome.storage.local.set({ version: 3 });
          location.reload();
        });
      }

      // Add eventlistner
      const v2Btn = document.querySelector("#switchStyle");
      if (v2Btn) {
        v2Btn.addEventListener("click", function () {
          chrome.storage.local.set({ version: 2 });
          location.reload();
        });
      }
    }, 500);
  });

  const nav = document.getElementById("nav-main");
  if (nav) {
    nav.after(wrapper);
    nav.style.height = "auto";
  }
}

/**
 * Render analysis table
 * @param {*} avgBSR
 * @param {*} nicheScore
 * @param {*} avgReviews
 * @param {*} avgPrice
 */
async function renderTable(productDetails = [], demandOpportunityData, resNumber, productCount, productCountForBSRavg, sum, avgBSR) {
  if (document.getElementById(uniqueId)) {
    document.getElementById(uniqueId).parentElement.remove();
  }

  // get search keyword from the search bar
  const searchKeyword = document.getElementById("twotabsearchtextbox").value;

  let matchCounter = 0;

  productDetails.forEach((item) => {
    if (containsWord(item.title, searchKeyword) && !item.isSponsored) {
      matchCounter++;
    }
  });

  const minBSR = Math.min(
    ...Object.keys(productDetails).map(function (key) {
      return productDetails[key].bsr;
    })
  ).toFixed(0);

  const maxBSR = Math.max(
    ...Object.keys(productDetails).map(function (key) {
      return productDetails[key].bsr;
    })
  ).toFixed(0);
  // todo
  const avgReviews = (
    Object.keys(productDetails)
      .map(function (key) {
        return productDetails[key].ratings;
      })
      .reduce((a, b) => a + b, 0) / productCount
  ).toFixed(0);

  const minReviews = Math.min(
    ...Object.keys(productDetails).map(function (key) {
      return productDetails[key].ratings;
    })
  ).toFixed(0);

  const maxReviews = Math.max(
    ...Object.keys(productDetails).map(function (key) {
      return productDetails[key].ratings;
    })
  ).toFixed(0);

  const avgPrice = (
    Object.keys(productDetails)
      .map(function (key) {
        return productDetails[key].price;
      })
      .reduce((a, b) => a + b, 0) / productCount
  ).toFixed(2);
  // ignore sponsored products
  const minPrice = Math.min(
    ...Object.keys(productDetails).map(function (key) {
      return productDetails[key].price;
    })
  ).toFixed(2);

  const maxPrice = Math.max(
    ...Object.keys(productDetails).map(function (key) {
      return productDetails[key].price;
    })
  ).toFixed(2);

  const indSellers = Object.keys(productDetails).filter(function (key) {
    return productDetails[key].seller.toLowerCase().indexOf("independently") !== -1;
  }).length;

  let score = 0;

  if (demandOpportunityData && demandOpportunityData.data && demandOpportunityData.data.niche_score) {
    score = demandOpportunityData.data.niche_score;
  }

  let ScoreColor = "#ddd";
  if (score >= 87.6 && score <= 100) {
    ScoreColor = "#3dff2c";
  } else if (score >= 75.1 && score <= 87.5) {
    ScoreColor = "#48ff00";
  } else if (score >= 65.1 && score <= 87.5) {
    ScoreColor = "#48ff00";
  } else if (score >= 62.6 && score <= 75) {
    ScoreColor = "#aeff00";
  } else if (score >= 60.0 && score <= 65.0) {
    ScoreColor = "#aeff00";
  } else if (score >= 50.1 && score <= 62.5) {
    ScoreColor = "#f4ff00";
  } else if (score >= 50.1 && score <= 59.9) {
    ScoreColor = "#D5EA69";
  } else if (score >= 37.6 && score <= 50) {
    ScoreColor = "#f7f400";
  } else if (score >= 25.1 && score <= 37.5) {
    ScoreColor = "#ffc700";
  } else if (score >= 12.6 && score <= 25) {
    ScoreColor = "#ff7c00";
  } else if (score >= 0 && score <= 12.5) {
    ScoreColor = "#ff0002";
  }

  const tableData = {
    extensionId: chrome.runtime.id,
    totalResults: numberWithCommas(resNumber),
    firstPageResults: numberWithCommas(productDetails.length),
    indResults: indSellers,
    avgPrice: numberWithCommas(avgPrice),
    lowPrice: numberWithCommas(minPrice),
    highPrice: numberWithCommas(maxPrice),
    score: score,
    scoreColor: ScoreColor,
    avgBsr: numberWithCommas(avgBSR),
    lowBsr: numberWithCommas(minBSR),
    highBsr: numberWithCommas(maxBSR),
    avgReviews: numberWithCommas(avgReviews),
    lowReviews: numberWithCommas(minReviews),
    highReviews: numberWithCommas(maxReviews),
  };

  let demandScore = -1;
  let opportunityScore = -1;
  let isPaid = false;
  // check any of the data is undefined or not if yes then not paid
  if (demandOpportunityData && demandOpportunityData.data && demandOpportunityData.data.opportunityScore !== -1) {
    // paid
    isPaid = true;
    demandScore = demandOpportunityData.data.demandScore;
    opportunityScore = demandOpportunityData.data.opportunityScore;
  } else if (demandOpportunityData && demandOpportunityData.data && demandOpportunityData.data.demandScore) {
    // free
    demandScore = demandOpportunityData.data.demandScore;
  }

  const tableOld = `
  <table id="amazon-analysis-${chrome.runtime.id}" style="border-collapse: collapse; border: 2px solid white; color: white; text-align: center; font-size: 16px">
    <tbody>
      <tr style="border: 2px solid black; line-height: 30px">
        <td rowspan="2" style="border: 2px solid black; vertical-align: middle; background-color: black">
          <div style="display: flex; align-items: center; justify-content: center">
            <img src="chrome-extension://${chrome.runtime.id}/images/newpic.png" width="200px" />
          </div>
        </td>
        <td style="border: 2px solid black; background-color: black; text-align: left; vertical-align:top;">
        
  
          <div style="border: 2px solid rgb(222,133,255); border-radius: 10px; margin-left: 32px; width: 230px; text-align: center; display: flex; align-items: center">
            <span style="margin: 5px; margin-left: 40px">${score}</span>
            <span
              style="
                width: 20px;
                height: 20px;
                display: table;
                border-radius: 100px;
                margin: 5px;
              "
            ></span>
            <span
              style=" margin:5px;width: 20px; height: 20px; border-radius: 100px; background: ${ScoreColor}; line-height: 1.2; border: 2px solid #ddd; display: flex; align-items: center; justify-content: center; cursor: help"
              title="Keyword Niche Score Algorithm 2.0 – The higher the score, the better. It is recommend to find niches with a score of 60 and higher, but see what averages and scores works best for you. The lowest score I would be potentially interested in is 50 for a new product, but be careful. Always check first page results to confirm the niche for yourself. The score is just a guide. Once you find a niche you want to sell in, create a solid plan of how you will create a product to enter the niche, how you can be better than your competitors, what your starting price will be, your main keywords, and most importantly your title are going to use. Your design, your title, your keywords, description, price have to be right for you to have a chance to rank for your new niche. If you do not do a good job with that, you might never rank in your niche, or at least not for long. "
              >?</span
            >
            <span style="margin-left:5px">Loading...</span>
            </div>
        </td>
        <td style="text-align: left; border: 2px solid black; background-color: black">
          <span style="font-weight: bold; margin-left: 5px">Number of Results</span>
  
          <div style="border: 2px solid rgb(222,133,255); border-radius: 10px; width: 185px; height: 40px; line-height: 40px; text-align: center">${numberWithCommas(resNumber)}</div>
        </td>
        <td style="text-align: left; border: 2px solid black; background-color: black">
          <span style="font-weight: bold; margin-left: 5px">Average Price</span>
  
          <div style="border: 2px solid rgb(222,133,255); border-radius: 10px; width: 185px; height: 40px; line-height: 40px; text-align: center">${numberWithCommas(avgPrice)}</div>
        </td>
  
        <td style="text-align: left; border: 2px solid black; background-color: black">
          <span style="font-weight: bold; margin-left: 5px">Help</span>
  
          <div style="border: 2px solid rgb(222,133,255); border-radius: 10px; width: 185px; height: 40px; line-height: 40px; text-align: center">
            <a href="https://www.facebook.com/groups/2690865597847008" target="_blank" style="color: white; display: block">
              <span>Join Facebook Group</span>
            </a>
          </div>
        </td>
        <td style="text-align: left; border: 2px solid black; background-color: black">
          <span style="font-weight: bold; margin-left: 5px">Self Publishing Titans</span>
  
          <div style="border: 2px solid rgb(222,133,255); border-radius: 10px; width: 185px; height: 40px; line-height: 40px; text-align: center">
            <a href="https://selfpublishingtitans.com/" target="_blank" style="color: white; display: block">
              <span>More Free Tools</span>
            </a>
          </div>
        </td>
      </tr>
      <tr style="border: 2px solid white; line-height: 30px">
        <td style="border: 2px solid black; text-align: left; vertical-align: middle; background-color: black">
          <span> <span style="font-weight: bold; font-size: 30px;padding-left: 10px;" class="${stylePrefix}-kdplogoword">Titans Quick View</span> </span>
        </td>
  
        <td style="text-align: left; border: 2px solid black; background-color: black">
          <span style="font-weight: bold; margin-left: 5px">Average BSR</span>
  
          <div style="border: 2px solid rgb(222,133,255); border-radius: 10px; width: 185px; height: 40px; line-height: 40px; text-align: center">${numberWithCommas(avgBSR)}</div>
        </td>
  
        <td style="text-align: left; border: 2px solid black; background-color: black">
          <span style="font-weight: bold; margin-left: 5px">Average Reviews</span>
  
          <div style="border: 2px solid rgb(222,133,255); border-radius: 10px; width: 185px; height: 40px; line-height: 40px; text-align: center">${numberWithCommas(avgReviews)}</div>
        </td>
        <td style="text-align: left; border: 2px solid black; background-color: black">
          <span style="font-weight: bold; margin-left: 5px">Download</span>
  
          <div style="border: 2px solid rgb(222,133,255); border-radius: 10px; width: 185px; height: 40px; line-height: 40px; text-align: center">
            <a
              href="javascript: void(0)"
              id="download_excel_file_${chrome.runtime.id}"
              style="color: white; display: block"
            >
              All 1st Page Data
            </a>
          </div>
        </td>
        <td style="text-align: left; border: 2px solid black; background-color: black">
          <span style="font-weight: bold; margin-left: 5px">How To</span>
  
          <div style="background-color: red; border: 2px solid rgb(222,133,255); border-radius: 10px; width: 185px; height: 40px; line-height: 40px; text-align: center">
            <a href="https://www.youtube.com/channel/UCkOTYGNYxS6jq7JT3Fk5NEQ" target="_blank" style="color: white"> New Tutorial Video! </a>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
  `;

  const table = `
    <table id="amazon-analysis-${chrome.runtime.id}" style="height: 170px; width: 100%; border-collapse: collapse; border: 2px solid white; color: white; text-align: center; font-size: 16px">
    <tbody>
      <tr style="border: 2px solid black; line-height: 30px">
        <td style="border: 2px solid black; text-align: center; vertical-align: middle; background-color: black">
          <span> <span style="font-weight: bold; font-size: 30px;padding-left: 10px;" class="${stylePrefix}-kdplogoword">Titans Quick View</span> </span>
        </td>

        <td rowspan="2" class="${stylePrefix}-bsr-td">
          <span style="font-weight: bold; margin-left: 5px">Results</span>

          <div class="${stylePrefix}-top-box" >
            <div class="${stylePrefix}-left-box" style="width:120px;">Total Results</div>
            <div>${tableData.totalResults}</div>
          </div>
          <div class="${stylePrefix}-inner-box" >
            <div class="${stylePrefix}-left-box" style="width:120px;">Exact Match</div>
            <div>${matchCounter}/${productCount}</div>
            <div id="counter-popup" style="display: inline-block;"></div>
          </div>
          <div class="${stylePrefix}-bottom-box" >
            <div class="${stylePrefix}-left-box" style="width:120px;">Ind. Published</div>
            <div>${tableData.indResults}</div>
          </div>
        </td>
        <td rowspan="2" class="${stylePrefix}-bsr-td">
          <span style="font-weight: bold; margin-left: 5px; font-size: 95%;">Best Seller Rank</span>

          <div class="${stylePrefix}-top-box" >
            <div class="${stylePrefix}-left-box">Average</div>
            <div>${tableData.avgBsr}</div>
          </div>
          <div class="${stylePrefix}-inner-box">
            <div class="${stylePrefix}-left-box">Low</div>
            <div>${tableData.lowBsr}</div>
          </div>
          <div class="${stylePrefix}-bottom-box">
            <div class="${stylePrefix}-left-box">High</div>
            <div>${tableData.highBsr}</div>
          </div>
        </td>
        <td rowspan="2" class="${stylePrefix}-bsr-td">
          <span style="font-weight: bold; margin-left: 5px">Reviews</span>

          <div class="${stylePrefix}-top-box">
            <div class="${stylePrefix}-left-box">Average</div>
            <div>${tableData.avgReviews}</div>
          </div>
          <div class="${stylePrefix}-inner-box">
            <div class="${stylePrefix}-left-box">Low</div>
            <div>${tableData.lowReviews}</div>
          </div>
          <div class="${stylePrefix}-bottom-box">
            <div class="${stylePrefix}-left-box">High</div>
            <div>${tableData.highReviews}</div>
          </div>
        </td>
        <td rowspan="2" class="${stylePrefix}-bsr-td">
          <span style="font-weight: bold; margin-left: 5px">Price</span>

          <div class="${stylePrefix}-top-box">
            <div class="${stylePrefix}-left-box">Average</div>
            <div>${tableData.avgPrice}</div>
          </div>
          <div class="${stylePrefix}-inner-box">
            <div class="${stylePrefix}-left-box">Low</div>
            <div>${tableData.lowPrice}</div>
          </div>
          <div class="${stylePrefix}-bottom-box">
            <div class="${stylePrefix}-left-box">High</div>
            <div>${tableData.highPrice}</div>
          </div>
        </td>
        <td rowspan="2" class="${stylePrefix}-bsr-td">
          <span style="font-weight: bold; margin-left: 5px">Links</span>

          <div class="${stylePrefix}-top-box">
            <a href="https://www.selfpublishingtitans.com/shop" target="_blank" style="color: white; margin-left: 4px;"> More Tools </a>
          </div>

          <div class="${stylePrefix}-inner-box">
            <a href="https://www.facebook.com/groups/2690865597847008" target="_blank" style="color: white; margin-left: 4px;">
              <span>Join Facebook Group</span>
            </a>
          </div>

          <div class="${stylePrefix}-bottom-box">
            <a href="javascript: void(0)" id="download_excel_file_${chrome.runtime.id}" style="color: white; margin-left: 4px;"> Download 1st Page Data </a>
          </div>
        </td>

        <td rowspan="2" style="padding-left: 10px; border: 2px solid black; vertical-align: middle; background-color: black">
          <div style="min-width: 200px; display: flex; align-items: center; justify-content: center">
            <img src="chrome-extension://${chrome.runtime.id}/images/newpic.png" width="200px" />
          </div>
        </td>
      </tr>
      <tr style="text-align: -webkit-center; border: 2px solid white; line-height: 30px">
        <td style="border: 2px solid black; background-color: black; vertical-align:top; min-width: 310px;">

        ${
          isPaid == false
            ? `
     <a target="_blank" style="display: flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  color: white;
  text-decoration: none;
  height: 27px;
  border-radius: 5px;
  padding: 0 12px 0 9px;
  margin-right: 2%;
  line-height: 1.5;
  border: 0.5px solid rgb(179, 158, 158);   background: linear-gradient(
    270.09deg,
    #6b49fc -13.64%,
    #de85ff 86.14%,
    #e26ff1 106.56%
  );
  border: none;" href="https://chrome.google.com/webstore/detail/titans-pro-amazon-kdp-key/mmdamlknnafgffhlobhlmiljonijdnid/related" >NEW - Get Titans Pro
  
  <img src="chrome-extension://${chrome.runtime.id}/images/cursor.png" width="20px" style="filter: brightness(0) invert(1) grayscale(100%) sepia(0%) saturate(0%); margin-left: 2px;" />
  </a>
     
     `
            : ""
        }
          
  <div class="${stylePrefix}-card ${stylePrefix}-js-card" id="flipCard">
    <div class="${stylePrefix}-card__wrapper">

          <div class="${stylePrefix}-card__side ${
    isPaid ? `${stylePrefix}-card__side--back` : `${stylePrefix}-is-active`
  }" style="border: 2px solid rgb(222,133,255); width: fit-content; margin-top: 10px; border-radius: 10px; text-align: center; display: flex; align-items: center">
    <span style="margin-left: 5px">Niche Score:</span>
   
    <span class="${stylePrefix}-circle-icon" style="
                background: ${tableData.scoreColor};">
        ${tableData.score}
    </span>
    <div id="niche-popup"></div>
  
</div>

<div class="${stylePrefix}-card__side ${
    isPaid ? `${stylePrefix}-is-active` : `${stylePrefix}-card__side--back`
  }" style="border: 2px solid rgb(222,133,255); width: fit-content; margin-top: 10px; border-radius: 10px; text-align: center; display: flex; align-items: center">

    <span style="margin-left: 5px">Demand</span>

     ${
       demandScore !== -1
         ? `
     <span class="${stylePrefix}-circle-icon" style="
                background: ${demandOpportunityData.data.demandColor};">
        ${demandScore}
    </span>
    <div id="demand-popup"></div>
     `
         : `<div id="demand-popup"></div>`
     }

         <span style="margin-left: 5px">Opportunity</span>
   
    ${
      opportunityScore !== -1
        ? `
        <span class="${stylePrefix}-circle-icon" style="${isPaid ? "" : "filter: blur(4px);"}
                background: ${demandOpportunityData.data.opportunityColor};">
        ${opportunityScore}
    </span>
    
        `
        : `
        <div class="${stylePrefix}-tooltip">
        <span class="${stylePrefix}-circle-icon" style="filter: blur(4px); background: white;">
        ?
    </span>
    <span class="${stylePrefix}-tooltiptext">Upgrade to Titans Pro to see full analysis</span>
    </div>
    `
    }
    
    <div id="opportunity-popup"></div>
</div>

 </div>
 </div>
 
 <div>
     <button id="flipButton"
     class="${stylePrefix}-text-btn"
     style="color: white;"
     >
     ${isPaid ? "See Niche Score Analysis" : "See Titans Pro Analysis"} 
     </b>
      </div>
        </td>
      </tr>
    </tbody>
  </table>


	`;

  const wrapper = document.createElement("div");
  wrapper.style.cssText = "height: 180px; background: black;";
  chrome.storage.local.get(["version"], function (item) {
    if (item.version === 2) {
      wrapper.innerHTML = tableOld;
    } else if (item.version === 3) {
      wrapper.innerHTML = table;
    }
    let opportunityText = `
    The opportunity scoring analysis is meant to help guide you to see if the niche might be good and worthwhile for you. The higher the number the better it might be. Opportunity would also be an indication of how worthwhile the niche is and how easy it might be to rank on page 1 on Amazon for the keyword. 0 would be the lowest and 9 the highest. 
    `;
    addPopUp("opportunity-popup", opportunityText);
    const demandText = `The demand scoring analysis is an indication of how in demand a niche might be. 0 would be the lowest and 9 the highest. If a demand has a score of 1 or 2 for example, one does not necessarily have to shy away from it. Small niches can be wonderful too and make you sales. Of the two scoring systems, the opportunity score will be the most important one when choosing a niche for your book or product.`;
    addPopUp("demand-popup", demandText);
    const nicheText = `Keyword Niche Score Algorithm 2.0 – The higher the score, the better. It is recommend to find niches with a score of 60 and higher, but see what averages and scores works best for you. The lowest score I would be potentially interested in is 50 for a new product, but be careful. Always check first page results to confirm the niche for yourself. The score is just a guide. Once you find a niche you want to sell in, create a solid plan of how you will create a product to enter the niche, how you can be better than your competitors, what your starting price will be, your main keywords, and most importantly your title are going to use. Your design, your title, your keywords, description, price have to be right for you to have a chance to rank for your new niche. If you do not do a good job with that, you might never rank in your niche, or at least not for long.`;
    addPopUp("niche-popup", nicheText);
    addPopUp(
      "counter-popup",
      "This is a Titans Quick View feature. It shows you the amount of exact matches from your keyword search in product titles on this search results page",
      "display: inline-block; margin-left: 5px; height: 20px; width: 20px"
    );

    let cardTransitionTime = 500;

    let $card = $(`.${stylePrefix}-js-card`);
    let switching = false;

    $("#flipButton").click(flipCard);

    var isTextChanged = false;

    function changeText() {
      if (isTextChanged) {
        $("#flipButton").html(isPaid ? "See Niche Score Analysis" : "See Titans Pro Analysis");

        isTextChanged = false;
      } else {
        $("#flipButton").html(isPaid ? "See Titans Pro Analysis" : "See Niche Score Analysis");
        isTextChanged = true;
      }
    }

    function flipCard() {
      changeText();
      if (switching) {
        // change the button text
        return false;
      }

      switching = true;

      $card.toggleClass(`${stylePrefix}-is-switched`);
      setTimeout(function () {
        $card.children().children().toggleClass(`${stylePrefix}-is-active`);
        switching = false;
      }, cardTransitionTime / 2);
    }
    setTimeout(function () {
      // Add eventlistner
      const v3Btn = document.querySelector("#switchStyleV3");
      if (v3Btn) {
        v3Btn.addEventListener("click", function () {
          chrome.storage.local.set({ version: 3 });
          location.reload();
        });
      }

      // Add eventlistner
      const v2Btn = document.querySelector("#switchStyle");
      if (v2Btn) {
        v2Btn.addEventListener("click", function () {
          chrome.storage.local.set({ version: 2 });
          location.reload();
        });
      }
    }, 500);
  });

  const nav = document.getElementById("nav-main");
  nav.after(wrapper);
  nav.style.height = "auto";

  setTimeout(function () {
    $("#download_excel_file_" + chrome.runtime.id).click(function () {
      createExcelFile(productDetails);
    });
  }, 200);
}

/**
 * Parse english content
 * @param {*} html
 */
async function parseProductHTML(product, html) {
  const siteLang = validDomains[hostname];
  // var parsed = $("<div>").append($(html));
  html = html.replace(/<img[^>]*>/g, "");
  const parsed = $(html);
  const title = parsed.find(selectors.title[siteLang]).text().trim();
  // Get product details
  let itemWeight = 0;
  let bsr = 0;
  let bsrHTML = [];
  let paperback = 0;
  let isbn10 = 0;
  let seller = "";
  let ratings = 0;
  let productDimensions = "";
  let authorsNode = null;
  let authors = [];

  // Determine product details layout
  if (parsed.find("#detailBulletsWrapper_feature_div").length || parsed.find("#productDetailsTable").length) {
    // Get product details
    itemWeight = parsed
      .find(selectors.itemWeight[siteLang]["list"])
      .text()
      .match(/\d+((.|,)\d+)?/);
    if (Array.isArray(itemWeight)) {
      itemWeight = itemWeight[0];
    }

    bsr = null;
    selectors.bsr[siteLang]["list"].forEach((selector) => {
      if (parsed.find(selector).text() !== null && parsed.find(selector).text() !== "") {
        bsr = parsed
          .find(selector)
          .text()
          .trim()
          .match(/\d+((.|,)\d+)+((.|,)\d+)+((.|,)\d+)?/);
        if (!bsr)
          bsr = parsed
            .find(selector)
            .text()
            .match(/\d+((.|,)\d+)?/);
      }
    });

    if (Array.isArray(bsr)) {
      bsr = bsr[0];
    }

    // Get bsr html
    bsrHTML = [];
    selectors.bsrHTML[siteLang]["list"].forEach((selector) => {
      if (parsed.find(selector).html() !== undefined) {
        bsrHTML.push("<li>" + parsed.find(selector).html() + "</li>");
      }
    });
    bsrHTML = bsrHTML.join("");

    paperback = parsed
      .find(selectors.paperback[siteLang]["list"])
      .text()
      .match(/\d+((.|,)\d+)?/);
    if (Array.isArray(paperback)) {
      paperback = paperback[0];
    }

    isbn10 = parsed
      .find(selectors.isbn10[siteLang]["list"])
      .next("span")
      .text()
      .match(/\d+((.|,)\d+)?/);
    if (!isbn10) {
      isbn10 = parsed.find(selectors.asin[siteLang]["list"]).next("span").text().trim();
    }
    if (Array.isArray(isbn10)) {
      isbn10 = isbn10[0];
    }

    seller = parsed.find(selectors.publisher[siteLang]["list"]).next("span").text();
    if (!seller) {
      seller = parsed.find(selectors.manufacturer[siteLang]["list"]).next("td").text().trim();
    }

    ratings = parsed
      .find(selectors.ratings[siteLang]["list"])
      .text()
      .match(/\d+((.|,)\d+)?/);
    if (Array.isArray(ratings)) {
      ratings = ratings[0];
    }

    productDimensions = parsed.find(selectors.productDimensions[siteLang]["list"]).next("span").text();
    if (!productDimensions) {
      productDimensions = parsed.find(selectors.size[siteLang]["list"]).next("span").text();
    }

    authorsNode = parsed.find(selectors.authorsNode[siteLang]["list"] + " a.contributorNameID");
    if (authorsNode.length <= 0) {
      authorsNode = parsed.find(selectors.authorsNode[siteLang]["list"] + " a");
    }
    authors = [];
    for (let m = 0; m < authorsNode.length; m++) {
      authors.push(authorsNode[m].innerText.trim().replace(/,/g, ""));
    }
  } else if (parsed.find("#productDetails_feature_div").length || parsed.find("#prodDetails").length) {
    // Get product details
    itemWeight = parsed
      .find(selectors.itemWeight[siteLang]["table"])
      .next("td")
      .text()
      .match(/\d+((.|,)\d+)?/);
    if (Array.isArray(itemWeight)) {
      itemWeight = itemWeight[0];
    }

    selectors.bsr[siteLang]["table"].forEach((selector) => {
      if (parsed.find(selector).next("td").text() !== null && parsed.find(selector).next("td").text() !== "") {
        bsr = parsed
          .find(selector)
          .next("td")
          .text()
          .match(/\d+((.|,)\d+)+((.|,)\d+)+((.|,)\d+)?/);

        if (!bsr)
          bsr = parsed
            .find(selector)
            .next("td")
            .text()
            .match(/\d+((.|,)\d+)?/);
      }
    });
    if (Array.isArray(bsr)) {
      bsr = bsr[0];
    }

    // Get bsr html
    bsrHTML = "";
    selectors.bsrHTML[siteLang]["table"].forEach((selector) => {
      if (parsed.find(selector).next("td").html() !== null && parsed.find(selector).next("td").html() !== undefined) {
        bsrHTML = parsed.find(selector).next("td").html();
      }
    });

    paperback = parsed
      .find(selectors.paperback[siteLang]["table"])
      .next("td")
      .text()
      .match(/\d+((.|,)\d+)?/);
    if (Array.isArray(paperback)) {
      paperback = paperback[0];
    }

    isbn10 = parsed
      .find(selectors.isbn10[siteLang]["table"])
      .next("td")
      .text()
      .match(/\d+((.|,)\d+)?/);
    if (!isbn10) {
      selectors.asin[siteLang]["table"].forEach((selector) => {
        if (parsed.find(selector).next("td").html() !== null && parsed.find(selector).next("td").html() !== undefined) {
          isbn10 = parsed.find(selector).next("td").text().trim();
        }
      });
    }
    if (Array.isArray(isbn10)) {
      isbn10 = isbn10[0];
    }

    seller = parsed.find(selectors.publisher[siteLang]["table"]).next("td").text().trim();
    if (!seller) {
      selectors.manufacturer[siteLang]["table"].forEach((selector) => {
        if (parsed.find(selector).next("td").html() !== null && parsed.find(selector).next("td").html() !== undefined) {
          seller = parsed.find(selector).next("td").text().trim();
        }
      });
    }

    ratings = parsed
      .find(selectors.ratings[siteLang]["table"])
      .next("td")
      .text()
      .match(/\d+((.|,)\d+)?/);

    if (!ratings) {
      ratings = parsed
        .find(selectors.ratings[siteLang]["table"])
        .text()
        .match(/\d+((.|,)\d+)?/);
    }
    if (Array.isArray(ratings)) {
      ratings = ratings[0];
    }
    productDimensions = parsed.find(selectors.productDimensions[siteLang]["table"]).next("td").text().trim();
    if (!productDimensions) {
      productDimensions = parsed.find(selectors.size[siteLang]["table"]).next("td").text().trim();
    }

    authorsNode = parsed.find(selectors.authorsNode[siteLang]["table"] + " a.contributorNameID");
    if (authorsNode.length <= 0) {
      authorsNode = parsed.find(selectors.authorsNode[siteLang]["table"] + " a");
    }
    authors = [];
    for (let m = 0; m < authorsNode.length; m++) {
      authors.push(authorsNode[m].innerText.trim().replace(/,/g, ""));
    }
  } else {
  }

  // Get price
  let price = 0;
  const paperbackPrice = parsed.find(selectors.paperbackPrice[siteLang]).text();

  const kindlePrice = parsed.find(selectors.kindlePrice[siteLang]).text();

  const spiralBoundPrice = parsed.find(selectors.spiralBoundPrice[siteLang]).text();

  const hardcoverPrice = parsed.find(selectors.hardcoverPrice[siteLang]).text();

  const mp3Price = parsed.find(selectors.mp3Price[siteLang]).text();

  const audiobookPrice = parsed.find(selectors.audiobookPrice[siteLang]).text();

  const insideBoxPrice = parsed.find(selectors.insideBoxPrice[siteLang]).text();

  const otherPrice = parsed.find(selectors.otherPrice[siteLang]).text();

  if (paperbackPrice !== null) {
    price = paperbackPrice;
  } else if (kindlePrice !== null) {
    price = kindlePrice;
  } else if (spiralBoundPrice !== null) {
    price = spiralBoundPrice;
  } else if (hardcoverPrice !== null) {
    price = hardcoverPrice;
  } else if (mp3Price !== null) {
    price = mp3Price;
  } else if (audiobookPrice !== null) {
    price = audiobookPrice;
  } else if (insideBoxPrice !== null) {
    price = insideBoxPrice;
  } else if (otherPrice !== null) {
    price = otherPrice;
  }

  if (Array.isArray(price)) {
    price = price[0];
  }
  // .match(/\d+((.|,)\d+)?/);

  // if price is 0 then product is not available

  if (price == 0) {
    price = product.price;
  }
  if (bsr) {
    bsr = parseFloat(bsr.replaceAll(",", "").replaceAll(".", ""));
  }

  if (Number.isNaN(bsr)) {
    bsr = 0;
  }

  const currencyDelimiterString = currencyDelimiter[hostname];

  return {
    index: product.index,
    isSponsored: product.isSponsored,
    title: title,
    authors: authors.join("-"),
    itemWeight: itemWeight ? itemWeight : 0,
    bsr: bsr,
    bsrHTML: bsrHTML,
    paperback: paperback ? paperback.replace(",", "").replace(".", "") : "",
    isbn10: isbn10 ? isbn10 : "",
    seller: seller,
    size: productDimensions,
    ratings: ratings ? parseInt(ratings.replace(",", "").replace(".", "")) : 0,
    price: accounting.unformat(price, currencyDelimiterString),
  };
}

/**
 * Render analysis table
 */
async function renderAnalysisTable() {
  // Check domain hostname
  if (!Object.keys(validDomains).includes(hostname)) {
    return;
  }

  // Check is on search page
  const urlParams = new URLSearchParams(window.location.search);
  const haskeyword = urlParams.get("k");

  if (haskeyword == null) {
    return;
  }

  renderLoadingTable();
  chrome.runtime.sendMessage({ message: "userStatus" }, function (response) {
    if (!response.userStatus) {
      showLoginModal();
    }
    // Render loading
    if (response.userStatus) {
      chrome.storage.local.get([isSponsoredStoreKey], function (response) {
        if (response[isSponsoredStoreKey] === "true" || response[isSponsoredStoreKey] === true) {
          isSponsoredEnabled = true;
        }
      });
      chrome.storage.local.get(uniqueId + "_isEnable", function (data) {
        if (data[uniqueId + "_isEnable"] !== undefined && (data[uniqueId + "_isEnable"] == "false" || data[uniqueId + "_isEnable"] == false)) {
          return;
        }
        async function fetchProductHTML(url) {
          const response = await fetch(url);
          if (!response.ok) return "";
          return await response.text();
        }

        async function setProductData(productData) {
          let data = await productData;
          // add product details

          let product = document.querySelectorAll('.s-main-slot.s-result-list [data-index="' + data.index + '"] div.s-product-image-container .rush-component')[1];
          if (!product) {
            product = document.querySelector('.s-main-slot.s-result-list [data-index="' + data.index + '"] div.s-product-image-container .rush-component');
          }
          if (!product) {
            product = document.querySelector('.s-main-slot.s-result-list [data-index="' + data.index + '"] .s-include-content-margin.s-border-bottom.s-latency-cf-section');
          }

          if (product) {
            let details = document.createElement("div");
            details.style.border = "3px solid black";
            details.style.margin = "5px";
            details.style.padding = "5px";

            details.innerHTML =
              "<div>Best-sellers rank #" +
              numberWithCommas(data.bsr) +
              "</div>" +
              "<div>" +
              data.bsrHTML +
              "</div>" +
              "<div><strong>Paperback: </strong>" +
              data.paperback +
              "</div>" +
              "<div><strong>ISBN-10/ASIN: </strong>" +
              data.isbn10.replace(/,/g, "") +
              "</div>" +
              "<div><strong>Size: </strong>" +
              data.size +
              "</div>" +
              "<div><strong>Seller: </strong>" +
              data.seller +
              "</div>";
            product.prepend(details);
          }
        }

        function getProductDetails(products) {
          const promises = [];

          products.forEach((product, idx) => {
            // Check if product is sponsored defined or not

            if (!product.isSponsored || isSponsoredEnabled) {
              const promise = new Promise((resolve, reject) => {
                try {
                  const link = product.link;
                  fetchProductHTML(link)
                    .then((html) => {
                      if (html !== "") {
                        const productDetails = parseProductHTML(product, html);

                        setProductData(productDetails);

                        return productDetails;
                      }
                    })
                    .then(resolve)
                    .catch(reject);
                } catch (error) {
                  console.error(error);
                  resolve(); // Resolve the promise to continue the loop
                }
              });

              promises.push(promise);
            } else {
              // Create sponsored product box
              // add product details
              let productElement = document.querySelectorAll('.s-main-slot.s-result-list [data-index="' + product.index + '"] div.s-product-image-container .rush-component')[1];
              if (!productElement) {
                productElement = document.querySelector('.s-main-slot.s-result-list [data-index="' + product.index + '"] div.s-product-image-container .rush-component');
              }
              if (!productElement) {
                productElement = document.querySelector('.s-main-slot.s-result-list [data-index="' + product.index + '"] .s-include-content-margin.s-border-bottom.s-latency-cf-section');
              }

              if (productElement) {
                const details = document.createElement("div");
                details.style.border = "3px solid black";
                details.style.margin = "5px";
                details.style.padding = "5px";
                details.innerHTML = "<div>This is a Sponsored Product. If you want to fetch all data then turn on the sponsored button from the popup menu.</div>";
                productElement.prepend(details);
              }
            }
          });

          return Promise.allSettled(promises);
        }
        setTimeout(async function () {
          try {
            const products = await getProductUrls();
            if (products.length <= 0) {
              return;
            }

            let productDetails = await getProductDetails(products);

            productDetails = productDetails.filter((pro) => pro.status === "fulfilled" && pro.value).map((pro) => pro.value);
            // Get number of results
            var resNumber = 0;
            try {
              document.querySelectorAll("script").forEach((item) => {
                if (item.innerText.indexOf("totalResultCount") >= 0) {
                  const scriptText = item.innerText.trim();
                  let jsonText = scriptText.substr(scriptText.indexOf("{"));
                  jsonText = jsonText.replace(");", "").replace(/\\/g, "").trim();
                  resNumber = JSON.parse(jsonText).totalResultCount;
                }
              });
            } catch (error) {
              console.error(error);
            }
            // Hostname     string `json:"hostname"`
            // Mid          string `json:"mid"`
            // Cookies      string `json:"cookies"`
            // Language     string `json:"language"`
            // SearchResult int    `json:"search_result"`
            // SearchText   string `json:"search_text"

            // get demand opportunity here
            let language = "en_US";
            try {
              const splittedLanguage = document.documentElement.lang.split("-");
              language = splittedLanguage[0] + "_" + splittedLanguage[1].toUpperCase();
            } catch (error) {
              console.error(error);
            }
            let demandOpportunityData;
            const productCount = Object.keys(productDetails).filter(function (item) {
              return productDetails[item].isSponsored == false;
            }).length;

            const productCountForBSRavg = Object.keys(productDetails).filter(function (item) {
              return productDetails[item].isSponsored == false && productDetails[item].bsr !== 0;
            }).length;

            const sum = Object.keys(productDetails)
              .map(function (key) {
                return productDetails[key].bsr;
              })
              .reduce((a, b) => a + b, 0);
            let avgBSR = 0;
            if (sum > 0) {
              avgBSR = (sum / productCountForBSRavg).toFixed(0);
            }
            const avgReviews = (
              Object.keys(productDetails)
                .map(function (key) {
                  return productDetails[key].ratings;
                })
                .reduce((a, b) => a + b, 0) / productCount
            ).toFixed(0);
            const avgPrice = (
              Object.keys(productDetails)
                .map(function (key) {
                  return productDetails[key].price;
                })
                .reduce((a, b) => a + b, 0) / productCount
            ).toFixed(2);
            try {
              const mid = MID_BY_HOST[hostname.replace("www.", "")] || "";
              let keyword = $("#twotabsearchtextbox").val().trim();

              let data = {
                search_text: keyword,
                search_result: resNumber,
                mid: mid,
                hostname: hostname,
                language: language,
                cookies: document.cookie,
                avg_bsr: parseFloat(avgBSR),
                avg_reviews: parseFloat(avgReviews),
                avg_price: parseFloat(avgPrice),
              };

              const response = await getDemandOpportunityScore(data);

              if (response.status == 200) {
                //const jsonData = await response.json();
                demandOpportunityData = await response.json();
              } else if (response.status == 401) {
                chrome.runtime.sendMessage({ message: "logout", payload: {} }, function (response) {
                  chrome.storage.local.set({ userStatus: false });
                  showLoginModal();
                });
              }
            } catch (error) {
              // check if token is invalid or not
              console.error(error);
            }
            const organicProducts = productDetails.filter((pro) => pro.isSponsored == false);
            await renderTable(organicProducts, demandOpportunityData, resNumber, productCount, productCountForBSRavg, sum, avgBSR);
            if (productDetails.length == 0) {
              location.reload();
            }
          } catch (error) {
            console.error(error);
            // Continue with the code execution even if an error occurs
          }
        }, 500);
      });
    }
  });
}

chrome.storage.local.get(uniqueId + "_isEnable", async function (data) {
  if (data[uniqueId + "_isEnable"] !== undefined && (data[uniqueId + "_isEnable"] == "false" || data[uniqueId + "_isEnable"] == false)) {
    return;
  }
  // Render main table
  await renderAnalysisTable();
});
// event based on ajax request
if (Object.keys(validDomains).includes(hostname)) {
  var oldLocation = location.href;
  setInterval(function () {
    if (location.href !== oldLocation) {
      // do your action
      oldLocation = location.href;

      const el = document.getElementById(uniqueId);

      if (el && el.parentElement) {
        el.parentElement.remove();
      }

      location.reload();
    }
  }, 500);
}

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  chrome.storage.local.set(
    {
      [uniqueId + "_isEnable"]: msg.isEnable,
    },
    function () {
      if (chrome.runtime.lastError) {
        console.error("Error Storing 2: ", chrome.runtime.lastError.message);
      }

      location.reload();
    }
  );
});
