const IMAGE_DIR = `${window.location.href.split("/").slice(0,-1).join("/")}/images`;


function getSecondsDiff(StartDate, EndDate) {
	return Math.floor(Math.abs(StartDate - EndDate) / 1000);
}

function getMillisecondsDiff(StartDate, EndDate) {
	return Math.abs(StartDate - EndDate);
}

function toDataURL(url, callback) {
  // yoinked from https://stackoverflow.com/questions/6150289/how-can-i-convert-an-image-into-base64-string-using-javascript
  var xhr = new XMLHttpRequest();
  xhr.onload = function() {
    var reader = new FileReader();
    reader.onloadend = function() {
      callback(reader.result);
    }
    reader.readAsDataURL(xhr.response);
  };
  xhr.open('GET', url);
  xhr.responseType = 'blob';
  xhr.send();
}

function fetchFileData(url) {
	
}

function generateRandomString(length) {
  // yoinked from https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

async function preloadImage(url) {
  let i = new Image();
  i.src = url;
}

function wwwEncode(paramMap) {
  let data = [];
  for (let i in paramMap) {
    data.push(`${encodeURIComponent(i)}=${encodeURIComponent(paramMap[i])}`);
  }
  return data.join('&');
}

async function listImages(path, imageTypeSet=new Set(["svg"])) {
  let resp = await fetch(`${window.location.origin}/images/${path}`);
  let parser = new DOMParser();
  let text = await resp.text();
  let html = parser.parseFromString(text, "text/html");
  let listings = html.getElementsByTagName("a");
  let ret = [];
  for (let i = 0; i < listings.length; i++) {
    let filename = listings[i].textContent;
    let filenameSplit = filename.split(".");
    if (imageTypeSet.has(filenameSplit.at(-1).toLowerCase())) {
      ret.push(filename);
    }
  }
  return ret;
}

// borrowed from https://stackoverflow.com/questions/5448545/how-to-retrieve-get-parameters-from-javascript
function findGetParameter(parameterName) {
    var result = null,
        tmp = [];
    location.search
        .substr(1)
        .split("&")
        .forEach(function (item) {
          tmp = item.split("=");
          if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
        });
    return result;
}