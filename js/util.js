
function getSecondsDiff(StartDate, EndDate) {
	return Math.floor(Math.abs(StartDate - EndDate) / 1000);
}

function getMillisecondsDiff(StartDate, EndDate) {
	return Math.abs(StartDate - EndDate);
}