const TWITCH_TOKEN_URL = 'https://id.twitch.tv/oauth2/token';

window.onload = (event) => {
	let twitchStateText = document.getElementById("twitchState");
	twitchStateText.focus();
	twitchStateText.addEventListener('keyup', ({key}) => {
		if (key === 'Enter') {
			validateState();
		}
	});
};

function validateState() {
  // TODO: validate that authenticated user matches configured user
	let pastedState = document.getElementById('twitchState');
	let paramState = getGETParam('state').split('--');

	let accountType = paramState[0];
	let state = paramState[1];

	let refreshTokenDiv = document.getElementById('refreshTokenDiv');
	let refreshTokenText = document.getElementById('refreshTokenText');
	let authOutputText = document.getElementById('authOutputText');
	let validateButton = document.getElementById('validateButton');

	if (pastedState.value === state) {
		getRefreshToken(accountType).then((resp) => {
			console.log(resp);
			if ('status' in resp && resp.status != 200) {
				authOutputText.innerHTML = `Something went wrong!  Twitch's response: ${JSON.stringify(resp)}`;
			} else {
				refreshTokenDiv.style.removeProperty('display');
				refreshTokenText.value = resp.refresh_token;
				authOutputText.innerHTML = `Successful auth!  Paste the provided refresh token into the '${accountType}' account's 'refreshToken' secret in js/secrets.js`;
			}
			validateButton.disabled = true;
			pastedState.readOnly = true;
		});
		
	} else {
		refreshTokenDiv.style.display = 'none';
		authOutputText.innerHTML = "State does not match.  Double check you entered it correctly.  If you've tried multiple times and can't get the state to match, contact Twitch support.";
	}

	let authOutput = document.getElementById('authOutput');

	authOutput.style.removeProperty('display');
}

function getGETParam(key) {
	let href = window.location.href;
	let hashIndex = href.indexOf('#');
	let qIndex = href.indexOf('?');

	let hashSnippet = null;
	let qSnippet = null;

	if (hashIndex != -1 && (qIndex == -1 || hashIndex < qIndex)) {
		hashSnippet = href.slice(hashIndex+1, qIndex > hashIndex ? qIndex : href.length);
	} else if (qIndex != -1 && (hashIndex == -1 || qIndex < hashIndex)) {
		qSnippet = href.slice(qIndex+1, hashIndex > qIndex ? hashIndex : href.length);
	}

	let mainSnippet = null;
	let keySearch = `${key}=`;

	if (hashSnippet !== null && hashSnippet.includes(keySearch)) {
		mainSnippet = hashSnippet;
	} else if (qSnippet !== null && qSnippet.includes(keySearch)) {
		mainSnippet = qSnippet;
	} else {
		return null;
	}

	let params = mainSnippet.split('&');	
	for (let i in params) {
		let entry = params[i];
		if (entry.startsWith(keySearch)) {
			return entry.slice(keySearch.length);
		}
	}
	return null;
}

function copyToken() {
	let refreshTokenText = document.getElementById('refreshTokenText');
	navigator.clipboard.writeText(refreshTokenText.value);
}

async function getRefreshToken(accountType) {
	let auth = secrets.twitch[accountType];
	let code = getGETParam('code');

	let resp = await fetch(TWITCH_TOKEN_URL, {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: wwwEncode({
      client_id: encodeURIComponent(auth.clientID),
      client_secret: encodeURIComponent(auth.clientSecret),
      grant_type: "authorization_code",
      code: code,
      redirect_uri: window.location.href.replace("127.0.0.1", "localhost").split('?')[0].split('#')[0]
    })
  });
  return await resp.json();
}