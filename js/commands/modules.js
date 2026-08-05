/*
	How to use:
	
	A module must add its own parsing function.

	Ex. For the module "rpg", it has a function "rpgParse":


	```
	function rpgParse(isMod, commandArr, channel, context, msg, self) {
		...
	}

	addModule("rpg", rpgParse);
	```

*/

const MODULES = {};

function addModule(moduleName, fn) {
	var command = `!${moduleName.toLowerCase()}`;
	if (command in MODULES) {
		let msg = `FATAL: ${moduleName} was already added!`;
		console.log(msg);
		throw new Error(msg);
	} else {
		MODULES[command] = fn;
		console.log(`added ${command}`);
	}
}