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