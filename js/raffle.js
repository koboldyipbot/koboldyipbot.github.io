var raffleKey = "raffle";
var raffleIsEnabled = Boolean(localStorage.getItem("raffleIsEnabled")) || false;
var raffleAcceptEntries = Boolean(localStorage.getItem("raffleAcceptEntries")) || false;

function raffleAddEntry(day, user) {
	if (config.mods.includes(user) || !raffleAcceptEntries || !raffleIsEnabled) {
		return;
	}
	var entries = raffleGetEntries();
	var dayEntries = entries[day] || {};
	entries[day] = dayEntries;
	if (!(user in dayEntries)) {
		entries[user] = (entries[user] || 0) + 1;
	} else {
		return;
	}

	dayEntries[user] = true;
	localStorage.setItem(raffleKey, JSON.stringify(entries));
}

function raffleAddEntryToday(user) {
	var date = new Date();
	raffleAddEntry(date.toLocaleDateString("en-us"), user);
}

function raffleGetEntries() {
	return JSON.parse(localStorage.getItem(raffleKey)) || {};
}

function raffleClearEntries() {
	localStorage.setItem(raffleKey, JSON.stringify({}));
}

function raffleGetEntryCount(user) {
	return raffleGetEntries()[user] || 0;
}

function raffleDo() {
	var entries = raffleGetEntries();
	var raffleEntries = [];
	for (var day in entries) {
		var dayEntries = entries[day];
		if (typeof(dayEntries) !== "object") {
			continue;
		}
		for (var user in entries[day]) {
			raffleEntries.push(user);
		}
	}
	return raffleEntries[Math.floor(Math.random()*raffleEntries.length)];
}

function raffleQueryCommand(client, channel, user) {
	var count = raffleGetEntryCount(user);
	var entry = count == 1 ? "entry" : "entries";
	client.say(channel, "@" + user + ": You have " + count + " " + entry + " in the raffle to win a wyx sticker!");
}

function raffleAdminQueryCommand(client, channel, user) {
	client.say(channel, user + " has " + raffleGetEntryCount(user) + " entries!");
}

function raffleDebug(client, channel) {
	client.say(channel, JSON.stringify(raffleGetEntries()));
}

function raffleDrawCommand(client, channel) {
	var winner = raffleDo();
	client.say(channel, "The winner of the raffle is @" + winner + "! YIPYIPYIYPYIPYIYPYIPYIPYIP");
}

function raffleSetAcceptEntries(enabled) {
	raffleAcceptEntries = Boolean(enabled);
	localStorage.setItem("raffleAcceptEntries", enabled.toString());
}

function raffleSetIsEnabled(enabled) {
	raffleIsEnabled = Boolean(enabled);
	localStorage.setItem("raffleIsEnabled", enabled.toString());
}