const TWITCH_BASE_AUTH_URL = 'https://id.twitch.tv/oauth2/authorize';

window.addEventListener('load', (event) => {
  // Prep Account Entries from secrets
  let accountSelector = document.getElementById('twitchAccountSelector');
  let first = true;
  for (let accountType in secrets.twitch) {
  	let li = document.createElement('li');
  	let secret = secrets.twitch[accountType];
  	let radio = document.createElement('input');
  	radio.type = 'radio';
  	radio.id = accountType;
  	radio.name = 'accountType';
  	radio.value = accountType;
  	if (first) {
  		first = false;
  		radio.checked = true;
  	}

  	let label = document.createElement('label');
  	label.for = radio.id;
  	label.appendChild(radio);

  	let info = [
  		`Account Type: ${accountType}`,
  		`User: ${secret.username}`,
  		`Client ID: ${secret.clientID}`
  	]
  	let div = document.createElement('div');
  	label.appendChild(div);
  	for (let i = 0; i < info.length; i++) {
  		let span = document.createElement('span');
  		span.innerHTML = info[i];
  		div.appendChild(span);
  	}

  	li.appendChild(label);

  	accountSelector.appendChild(li);
  }
  // Prep state with randomly generated value
  let stateBox = document.getElementById("twitchState");
  stateBox.value = generateRandomString(32);

  // Prep submit button to control data that gets submitted
  document.getElementById("submitForm").addEventListener("submit", function (e) {
  	e.preventDefault();
  	navigator.clipboard.writeText(stateBox.value);
  	beginAuthentication(e.target);
  });
});

function beginAuthentication(formData) {
	console.log(formData.accountType);
	let args = {
		response_type: 'code',
		client_id: secrets.twitch[formData.accountType.value].clientID,
		redirect_uri: window.location.href.replace("127.0.0.1", "localhost").replace('auth_start.html', 'auth_finish.html'),
		scope: config.twitchAuthScopes[formData.accountType.value].join(' '),
		state: `${formData.accountType.value}--${formData.state.value}`
	};

	let url = `${TWITCH_BASE_AUTH_URL}?${new URLSearchParams(args).toString()}`
	console.log(url);
	window.open(url, '_blank').focus();
}