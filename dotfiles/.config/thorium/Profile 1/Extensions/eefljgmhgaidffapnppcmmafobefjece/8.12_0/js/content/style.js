function generateUUID() {
  // Public Domain/MIT
  var d = new Date().getTime(); //Timestamp
  var d2 = (typeof performance !== "undefined" && performance.now && performance.now() * 1000) || 0; //Time in microseconds since page-load or 0 if unsupported
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = Math.random() * 16; //random number between 0 and 16
    if (d > 0) {
      //Use timestamp until depleted
      r = (d + r) % 16 | 0;
      d = Math.floor(d / 16);
    } else {
      //Use microseconds since page-load if supported
      r = (d2 + r) % 16 | 0;
      d2 = Math.floor(d2 / 16);
    }
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}
var stylePrefix = chrome.runtime.id + "-" + generateUUID();
const style = document.createElement("style");
style.id = stylePrefix + "-style";
const styleText = `
.${stylePrefix}-modal {
  display: block;
  background-color: rgba(0, 0, 0, 0);
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.${stylePrefix}-modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

/* Help Icon Styles */
.${stylePrefix}-bsr-help-icon {
  width: 25px;
  height: 25px;
  border-radius: 100px;
  margin: 5px;
  line-height: 1.2;
  border: 1px solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.${stylePrefix}-circle-icon {
  width: 25px;
  height: 25px;
  border-radius: 100px;
  margin: 5px;
  line-height: 1.2;
  border: 1px solid transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: black;
}

.${stylePrefix}-show {
  display: block;
}

.${stylePrefix}-hide {
  display: none;
}
.${stylePrefix}-close-icon {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 20px;
  height: 20px;
  border-radius: 100px;
  line-height: 1.2;
  border: 1px solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.${stylePrefix}-close-icon:hover {
  background-color: #e32b2b;
  color: white;
}

.${stylePrefix}-kdplogoword {
  background-image: linear-gradient(270.09deg, #6b49fc -13.64%, #de85ff 86.14%, #e26ff1 106.56%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.${stylePrefix}-bsr-td {
  padding-left: 5px;
  padding-right: 5px;
  margin-left: 3px;
  margin-right: 3px;
  text-align: left;
  border: 2px solid black;
  background-color: black;
}

.${stylePrefix}-main-table {
  height: 170px;
  width: 100%;
  border-collapse: collapse;
  border: 2px solid white;
  color: white;
  text-align: center;
  font-size: 16px;
}

.${stylePrefix}-top-box {
  display: flex;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  border: 2px solid rgb(222, 133, 255);
  border-bottom: 1px solid rgb(222, 133, 255);
  width: 99%;
  height: 40px;
  line-height: 40px;
  text-align: center;
}

.${stylePrefix}-bottom-box {
  display: flex;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
  border: 2px solid rgb(222, 133, 255);
  border-top: 1px solid rgb(222, 133, 255);
  width: 99%;
  height: 40px;
  line-height: 40px;
  text-align: center;
}

.${stylePrefix}-inner-box {
  display: flex;
  border: 2px solid rgb(222, 133, 255);
  border-bottom: 1px solid rgb(222, 133, 255);
  border-top: 1px solid rgb(222, 133, 255);
  width: 99%;
  height: 40px;
  line-height: 40px;
  text-align: center;
}

.${stylePrefix}-left-box {
  width: 80px;
  border-right: 2px solid rgb(222, 133, 255);
  margin: 0px 6px 0px 6px;
}

.${stylePrefix}-card {
  perspective: 600px;
  position: relative;
}
.${stylePrefix}-card.${stylePrefix}-is-switched .${stylePrefix}-card__wrapper {
  animation: ${stylePrefix}-rotate 0.5s linear both;
}
.${stylePrefix}-card__wrapper {
  transform-style: preserve-3d;
  animation: ${stylePrefix}-rotate-inverse 0.5s linear both;
}
.${stylePrefix}-card__side {
  backface-visibility: hidden;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
}
.${stylePrefix}-card__side.${stylePrefix}-is-active {
  position: static;
}
.${stylePrefix}-card__side--back {
  transform: rotateY(180deg);
}
@keyframes ${stylePrefix}-rotate {
  0% {
    transform: rotateY(0);
  }
  70% {
    transform: rotateY(200deg);
  }
  100% {
    transform: rotateY(180deg);
  }
}
@keyframes ${stylePrefix}-rotate-inverse {
  0% {
    transform: rotateY(180deg);
  }
  70% {
    transform: rotateY(-20deg);
  }
  100% {
    transform: rotateY(0);
  }
}

.${stylePrefix}-card {
}
.${stylePrefix}-card__side {
}
.${stylePrefix}-card__side--back {
}

.${stylePrefix}-text-btn {
  border: none;
  background-color: inherit;
  padding: 14px 28px;
  cursor: pointer;
  display: inline-block;
}

.${stylePrefix}-tooltip {
  position: relative;
  display: inline-block;
  border-bottom: 1px dotted black;
}

.${stylePrefix}-tooltip .${stylePrefix}-tooltiptext {
  visibility: hidden;
  min-width: max-content;
  background-color: white;
  color: black;
  text-align: center;
  border-radius: 6px;
  padding: 8px;

  /* Position the tooltip */
  position: absolute;
  z-index: 1;
  top: 100%;
  left: 50%;
  margin-left: -60px;
}

.${stylePrefix}-tooltip:hover .${stylePrefix}-tooltiptext {
  visibility: visible;
}
`;

style.textContent = styleText;
document.head.appendChild(style);
