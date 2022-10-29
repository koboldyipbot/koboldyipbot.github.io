var raffleKey = "raffle";
var activeRaffle = true;

function addRaffleEntry(day, user) {
	if (config.mods.includes(user)) {
		return;
	}
	var entries = getRaffleEntries();
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

function addRaffleEntryToday(user) {
	var date = new Date();
	addRaffleEntry(date.toLocaleDateString("en-us"), user);
}

function getRaffleEntries() {
	return JSON.parse(localStorage.getItem(raffleKey)) || {};
}

function clearRaffleEntries() {
	localStorage.setItem(raffleKey, JSON.stringify({}));
}

function getEntryCount(user) {
	return getRaffleEntries()[user] || 0;
}

function doRaffle() {
	var entries = getRaffleEntries();
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
	client.say(channel, "@" + user + ": You have " + getEntryCount(user) + " entries in the raffle!");
}

function raffleDrawCommand(client, channel) {
	var winner = doRaffle();
	client.say(channel, "The winner of the raffle is @" + winner + "! YIPYIPYIYPYIPYIYPYIPYIPYIP");
}