function defaultMessageHandler(channel, context, msg, self) {
  // if (self) { return; }

  if (!msg.startsWith('!')) { return; } 

  const command = msg.trim();
  console.log(`channel: ${channel} -- user: ${context.username} -- command: ${command}}`);

  var commandArr = command.split(/\s+/);
  var isMod = config.mods.includes(context.username);

  var moduleName = commandArr[0].toLowerCase();
  // console.log(`module: ${moduleName}`);
  // console.log(MODULES);

  if (moduleName in MODULES) {
    MODULES[moduleName](isMod, commandArr, channel, context, msg, self);
  } else {
    console.log(`${moduleName} not in module list!`);
  }
}

  