var warframeRelics = [];
var warframeVaultedRelics = [];
var warframeRelicsByName = {};
var warframeRelicRewardMap = {relics: new Set(), next: {}};
var warframeVaultedRelicRewardMap = {relics: new Set(), next: {}};

function warframeFetchRelics() {
	let relicData = localStorage.getItem("warframeRelics");
	let refreshRelics = relicData == null;
	if (!refreshRelics) {
		console.log("checking relic data date");
		relicData = JSON.parse(LZString.decompress(relicData));
		// if data is not null, check date
		let lastDate = new Date(relicData.lastDate);
		// re-load relics if data is more than a day out of date
		if (getSecondsDiff(new Date(), lastDate) >= 60 * 60 * 24) {
			refreshRelics = true;
		} else {
			console.log("relic data is less than a day old, no refresh needed");
			refreshRelics = false;
			warframeRelics = relicData.data;
			warframeProcessRelics();
		}
	}

	if (refreshRelics) {
		console.log("refreshing relics");
		fetch("https://raw.githubusercontent.com/WFCD/warframe-items/master/data/json/Relics.json")
			.then((res) => res.json())
			.then((data_js) => {
				warframeRelics = data_js;
				warframeProcessRelics();
				let dataToStore = LZString.compress(JSON.stringify({"lastDate": new Date(), "data": warframeRelics}));
				localStorage.setItem("warframeRelics", dataToStore);
				console.log("done refreshing relics");
			});
	}
	
}

function warframeProcessRelics() {
	for (var i in warframeRelics) {
		let relic = warframeRelics[i];
		warframeRelicsByName[relic.name.toLowerCase()] = relic;
		if (relic.vaulted) {
			warframeVaultedRelics.push(i);
			warframePropagateSearchTrie(warframeVaultedRelicRewardMap, relic, i);
		}
		warframePropagateSearchTrie(warframeRelicRewardMap, relic, i);
	}
}

function warframePropagateSearchTrie(rewardMap, relic, relicIndex) {
	let next = rewardMap;
	for (var i in relic.rewards) {
		let reward = relic.rewards[i];
		let rewardName = reward.item.name;
		for(var j in rewardName) {
			next = rewardMap;
			let substring = rewardName.substr(j);
			for (var k in substring) {
				let letter = substring[k].toLowerCase();
				if (letter.trim().length === 0) {
					continue;
				}
				next.relics.add(relicIndex);
				
				if (!(letter in next.next)) {
					next.next[letter] = {relics: new Set(), next: {}};
				}
				next = next.next[letter];
			}
			next.relics.add(relicIndex);
		}
	}
}

function warframeSearchByRelic(relicName) {
	return warframeRelicsByName[relicName.toLowerCase()];
}

function warframeSearchByItem(vaultedOnly, itemName) {
	let relicTrie = warframeRelicRewardMap;
	if (vaultedOnly) {
		relicTrie = warframeVaultedRelicRewardMap;
	}

	itemName = itemName.toLowerCase();
	for (var i in itemName) {
		let letter = itemName[i];
		if (letter.trim().length === 0) {
			continue;
		}
		if (letter in relicTrie.next) {
			relicTrie = relicTrie.next[letter];
		} else {
			break;
		}
	}
	return relicTrie.relics;
}

function warframeChatRelicSearch(user, client, channel, relicName) {
	// command: !warframe search relic [relic name]
	let relic = warframeSearchByRelic(relicName);
	if (relic == null) {
		// default to "intact"
		relic = warframeSearchByRelic(relicName + " intact");
		if (relic == null) {
			client.say(channel, `${user}: Could not find the relic provided.`);
			return;
		}
	} 

	let rewards = relic.rewards;
	let respArr = [];
	for (var i in rewards) {
		let reward = rewards[i];
		let rewardName = reward.item.name;
		let rewardChance = reward.chance;
		respArr.push(`${rewardName}: ${rewardChance}%`);
	}
	client.say(channel, `${user}: ${relic.name} has the following rewards: ${respArr.join(", ")}`);
}

function warframeChatItemSearch(user, client, channel, vaulted, itemName) {
	// command: !warframe search item [vaulted] search [item name]
	console.log("starting search");
	let relics = warframeSearchByItem(vaulted, itemName);
	console.log(relics);
	if (relics.size === 0) {
		client.say(channel, `${user}: ${itemName} returned no results.`);
	} else {
		let respArr = [];
		for (var relicIndex of relics) {
			let relic = warframeRelics[relicIndex];
			let relicName = relic.name;
			if (!relicName.endsWith("Intact")) {
				continue;
			}

			let commonRelicName = relicName.slice(0, relicName.length - " Intact".length);
			respArr.push(commonRelicName);
		}

		if (respArr.length > 40) {
			client.say(channel, `${user}: ${itemName} has too many results to show, and was found in ${respArr.length} relics.`);
		} else {
			client.say(channel, `${user}: ${itemName} was found in ${respArr.length} relics: ${respArr.join(", ")}`);
		}
	}
}


if (config.enabledModules.warframe.relics) {
	warframeFetchRelics();
}
