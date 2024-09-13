var rpgEquipmentList = [
	"helmet", "cowl", "chestpiece", "pauldrons", "bracers", "gauntlets", "belt", "leggings", "boots", "amulet", "ring"
];

var rpgTrapNoises = ["BANG", "KERPLOWIE", "ZOINKS", "SWOOP", "SMASH", "KERSPLODE", "Uh oh"];

var lastRPGScavengeDates = {}; // user to date
var lastRPGFightDates = {}; // user to date
var rpgTraps = {}; // user maps to object that tracks the trapping user and the trap expiration date.

function getRPGCharacterStorageKey(user) {
	return user.toLowerCase() + "-idlerpg";
}

function getRPGDefaultData() {
	return {
		active: false,
		equipment: {},
		items: {
			traps: 0
		},
		level: 1,
		xp: 0,
		totalXP: 0,
		lastUpdate: new Date()
	};
}

function getRPGRandomActivePlayer() {
	
}


function getRPGCharacter(user) {
	let data = localStorage.getItem(getRPGCharacterStorageKey(user));
	let defaultData = getRPGDefaultData();
	if (data != null) {
		data = JSON.parse(data);
		for (var i in defaultData) {
			if (!(i in data)) {
				data[i] = defaultData[i];
			}
		}
		for (var i in defaultData.items) {
			if (!(i in data.items)) {
				data.items[i] = defaultData.items[i];
			}
		}
	} else {
		data = defaultData;
		if (user == "yip_bot") {
			data.level = 50;
		}
	}

	for (let i = 0; i < rpgEquipmentList.length; i++) {
		let piece = rpgEquipmentList[i];
		if (!(i in data.equipment)) {
			data.equipment.piece = 0;
		}
	}

	return data;
}

function startRPGCharacter(user) {
	let data = getRPGCharacter(user);
	data.active = true;
	saveRPGCharacter(user, data);
}

function getRPGXPToLevel(level) {
	return Math.min(config.rpg.maxXPPerLevel, level ** 2);
}

function addRPGChatXP(user, prevChatDate) {
	let data = getRPGCharacter(user);
	if (data.active) {
		data.xp += 1;
		saveRPGCharacter(user, data);
	}
}

function getLevel(user, data) {
	if (!data.active) {
		return;
	}
	let xpToLevel = getRPGXPToLevel(data.level);
	while (xpToLevel <= data.xp) {
		data.xp -= xpToLevel;
		data.totalXP += xpToLevel;
		data.level += 1;
		saveRPGCharacter(user, data);
		xpToLevel = getRPGXPToLevel(data.level);
	}
	return data.level;
}

function deleteRPGCharacter(user) {
	localStorage.removeItem(getRPGCharacterStorageKey(user));
}

function saveRPGCharacter(user, data) {
	for (let i in data.equipment) {
		if (data.equipment[i] == 0) {
			delete data.equipment[i];
		}
	}
	data.lastUpdate = new Date();
	data.username = user;
	localStorage.setItem(getRPGCharacterStorageKey(user), JSON.stringify(data));
}

function rpgScavengeCooldown(user) {
	// return amount of time left before we can scavenge
	let now = new Date();
	let lastScavenge = lastRPGScavengeDates[user.toLowerCase()];
	if (lastScavenge == null) {
		return 0;
	}
	let seconds = (now.getTime() - lastScavenge.getTime()) / 1000;
	return Math.max(config.rpg.scavengeCooldown - seconds, 0);
}

function rpgScavenge(user, client, channel) {
	let data = getRPGCharacter(user);
	if (!data.active) {
		client.say(channel, `${user}: You are not currently participating in the RPG.  If you want to join, enter into the chat: !rpg start`);
		return;
	}
	let scavengeCooldown = rpgScavengeCooldown(user);
	if (scavengeCooldown == 0) {
		if (Math.random() < .1) {
			// found a trap!
			data.items.traps += 1;
			saveRPGCharacter(user, data);
			client.say(channel, `${user}: You made a trap!  You have ${data.items.traps}.  To use it, type !rpg trap [user]`);
		} else {
			getRPGItem(user, client, channel);
		}
		lastRPGScavengeDates[user.toLowerCase()] = new Date();
	} else {
		client.say(channel, `${user}: You must wait ${scavengeCooldown / 60} minutes before you can scavenge again.`);
	}
}

function rpgSetTrap(user, targetUser, client, channel) {
	if (user.toLowerCase() == targetUser.toLowerCase()) {
		return;
	}

	let data = getRPGCharacter(user);
	let targetData = getRPGCharacter(targetUser);
	if (!data.active) {
		client.say(channel, `${user}: You are not currently participating in the RPG.  If you want to join, enter into the chat: !rpg start`);
		return;
	} else if (!targetData.active) {
		client.say(channel, `${user}: Your target is not currently participating in the RPG.  If they want to join, they can enter into the chat: !rpg start`);
		return;
	}

	if (data.items.traps == 0) {
		client.say(channel, `${user}: You don't have any traps!  Try to scavenge more to get one.`);
		return;
	}

	rpgTraps[targetUser.toLowerCase()] = {setBy: user, setDate: new Date()}
	data.items.traps -= 1;
	saveRPGCharacter(user, data);
}

function rpgSpringTrap(user, client, channel) {
	let data = getRPGCharacter(user);
	if (!data.active) {
		return;
	}

	let trap = rpgTraps[user.toLowerCase()];
	if (trap == null) {
		return;
	}

	let now = new Date();
	let seconds = (now.getTime() - trap.setDate.getTime()) / 1000;
	if (seconds < config.rpg.trapExpiration) {
		let trapperData = getRPGCharacter(trap.setBy);
		let stolenItem = getRPGEquipSlotToSteal(trapperData, data);
		let stolenItemLevel = data.equipment[stolenItem];
		let droppedItemLevel = trapperData.equipment[stolenItem] || 0;
		let trapNoise = rpgTrapNoises[Math.floor(Math.random() * rpgTrapNoises.length)];
		let stealMessage = `${user}: ${trapNoise}! ${trap.setBy} caught you with a trap, `;
		if (stolenItem != null) {
			stealMessage += ` and steals your level ${stolenItemLevel} ${stolenItem}!`;
			if (droppedItemLevel > 0) {
				stealMessage += ` At least they left you their level ${droppedItemLevel} ${stolenItem}.`;
			}
			trapperData.equipment[stolenItem] = stolenItemLevel;
			data.equipment[stolenItem] = droppedItemLevel;
		} else {
			stealMessage += " but you laugh when they stomp away without a suitable prize!";
		}
		delete rpgTraps[user.toLowerCase()];
		client.say(channel, stealMessage);

		trapperData.xp += data.level;
		saveRPGCharacter(trap.setBy, trapperData);
		saveRPGCharacter(user, data);
	} else {
		delete rpgTraps[user.toLowerCase()];
		data.xp += data.level;
		saveRPGCharacter(user, data);
	}
	
}

function getRPGItem(user, client, channel) {
	let data = getRPGCharacter(user);
	if (!data.active) {
		client.say(channel, `${user}: You are not currently participating in the RPG.  If you want to join, enter into the chat: !rpg start`);
		return;
	}
	let equipSlot = rpgEquipmentList[Math.floor(Math.random() * rpgEquipmentList.length)];
	let article = equipSlot[equipSlot.length-1] == 's' ? "some" : "a";
	let itemLevel = Math.floor(1 + Math.random() * getLevel(user, data) * 2);
	let prevItemLevel = data.equipment[equipSlot];
	if (prevItemLevel == null || itemLevel > prevItemLevel) {
		let toss = prevItemLevel == null ? "" : `They throw their old level ${prevItemLevel} one away.`;
		client.say(channel, `${user} found ${article} level ${itemLevel} ${equipSlot}! ${toss}`);
		data.equipment[equipSlot] = itemLevel;
		saveRPGCharacter(user, data);
	} else {
		client.say(channel, `${user} found ${article} level ${itemLevel} ${equipSlot}, but aleady has a level ${prevItemLevel} one.`);
		saveRPGCharacter(user, data);
	}
}

function getRPGRoll(user, data) {
	let potential = getLevel(user, data);
	for (let equipSlot in data.equipment) {
		potential += data.equipment[equipSlot];
	}
	return Math.floor(Math.random() * potential);
}

function getRPGEquipSlotToSteal(winnerData, loserData) {
	let viableItems = [];
	for (let equipSlotIndex in rpgEquipmentList) {
		let equipSlot = rpgEquipmentList[equipSlotIndex];
		let winnerItemLevel = winnerData.equipment[equipSlot] || 0;
		let loserItemLevel = loserData.equipment[equipSlot] || 0;
		if (winnerItemLevel < loserItemLevel) {
			viableItems.push(equipSlot);
		}
	}
	if (viableItems.length == 0) {
		return null;
	} else {
		return viableItems[Math.floor(Math.random() * viableItems.length)];
	}
}

function rpgFightCooldown(user) {
	// return amount of time left before we can fight
	let now = new Date();
	let lastFight = lastRPGFightDates[user.toLowerCase()];
	if (lastFight == null) {
		return 0;
	}
	let seconds = (now.getTime() - lastFight.getTime()) / 1000;
	return Math.max(config.rpg.fightCooldown - seconds, 0);
}

function rpgFightRandomOpponent(user, client, channel) {
	let users = ["yip_bot", "kobold_wyx"];
	for (let u in lastChatDates) {
		let data = getRPGCharacter(u);
		if (data.active) {
			users.push(u);
		}
	}

	let targetUser = users[Math.floor(Math.random() * users.length)];
	while (targetUser == user) {
		targetUser = users[Math.floor(Math.random() * users.length)];
	}
	rpgFight(user, targetUser, client, channel);
}

function initializeYipbot() {
	let initiatorData = getRPGCharacter(config.twitchUsername);
	if (!initiatorData.active) {
		startRPGCharacter(config.twitchUsername);
		return;
	}
}

function rpgFight(user, targetUser, client, channel) {
	if (user.toLowerCase() == targetUser.toLowerCase()) {
		return;
	}

	let initiatorData = getRPGCharacter(user);
	if (!initiatorData.active) {
		client.say(channel, `${user}: You are not currently participating in the RPG.  If you want to join, enter into the chat: !rpg start`);
		return;
	}

	let targetData = getRPGCharacter(targetUser);
	if (!targetData.active) {
		client.say(channel, `${user}: That user is invalid, or is not currently participating in the RPG.  If they wish to join, they can enter into the chat: !rpg start`);
		return;
	}

	let fightCooldown = rpgFightCooldown(user);
	if (fightCooldown > 0) {
		client.say(channel, `${user}: You must wait ${fightCooldown / 60} minutes before you can fight again!`);
		return;
	} else {
		lastRPGFightDates[user.toLowerCase()] = new Date();
	}

	let initiatorRoll = getRPGRoll(user, initiatorData);
	let targetRoll = getRPGRoll(targetUser, targetData);

	while (initiatorRoll == targetRoll) {
		initiatorRoll = getRPGRoll(user, initiatorData);
		targetRoll = getRPGRoll(targetUser, targetData);
	}

	if (initiatorRoll > targetRoll) {
		let stolenItem = getRPGEquipSlotToSteal(initiatorData, targetData);
		let stolenItemLevel = targetData.equipment[stolenItem];
		let droppedItemLevel = initiatorData.equipment[stolenItem] || 0;
		let stealMessage = "";
		if (stolenItem != null) {
			stealMessage = `-- ${user} snatches up the opponent's level ${stolenItemLevel} ${stolenItem}`
			if (droppedItemLevel > 0) {
				stealMessage += `, discarding the level ${droppedItemLevel} one- ${targetData.username || targetUser} grabs it in desparation.`;
			} else {
				stealMessage += "!";
			}
			initiatorData.equipment[stolenItem] = stolenItemLevel;
			targetData.equipment[stolenItem] = droppedItemLevel;
			initiatorData.xp += targetData.level;
			saveRPGCharacter(user, initiatorData);
			saveRPGCharacter(targetUser, targetData);
		}
		client.say(
			channel,
			`${user} challenges ${targetData.username || targetUser} to a fight and wins! ` +
			`(${initiatorRoll} vs ${targetRoll}) ` +
			stealMessage
		);
	} else {
		let stolenItem = getRPGEquipSlotToSteal(targetData, initiatorData);
		let stolenItemLevel = initiatorData.equipment[stolenItem];
		let droppedItemLevel = targetData.equipment[stolenItem] || 0;
		let stealMessage = "";
		if (stolenItem != null) {
			stealMessage = `-- ${targetData.username || targetUser} snatches up the opponent's level ${stolenItemLevel} ${stolenItem}`;
			if (droppedItemLevel > 0) {
				stealMessage += `, discarding the level ${droppedItemLevel} one- ${user} grabs it in desparation.`;
			} else {
				stealMessage += "!";
			}
			targetData.equipment[stolenItem] = stolenItemLevel;
			initiatorData.equipment[stolenItem] = droppedItemLevel;
			targetData.xp += initiatorData.level;
			saveRPGCharacter(user, initiatorData);
			saveRPGCharacter(targetUser, targetData);
		}

		client.say(
			channel,
			`${user} challenges ${targetData.username || targetUser} to a fight and loses! ` +
			`(${initiatorRoll} vs ${targetRoll}) ` +
			stealMessage
		);
	}
}