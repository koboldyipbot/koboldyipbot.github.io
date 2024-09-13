async function getTwitchRefreshToken(clientID, clientSecret, authCode) {
  // helper function for setting up local client authentication
  let resp = await fetch('https://id.twitch.tv/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: wwwEncode({
      client_id: clientID,
      client_secret: clientSecret,
      code: authCode,
      grant_type: "authorization_code",
      redirect_uri: "http://localhost"
    })
  });

  let output = await resp.json();
  console.log(`refresh token: ${output.refresh_token}`);
  return output;
}

async function getTwitchAuthToken(auth) {
  // function for authenticating
  // actually used by other code & not for setup
  let resp = await fetch('https://id.twitch.tv/oauth2/token', {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: wwwEncode({
      client_id: encodeURIComponent(auth.clientID),
      client_secret: encodeURIComponent(auth.clientSecret),
      grant_type: "refresh_token",
      refresh_token: encodeURIComponent(auth.refreshToken)
    })
  });
  return await resp.json();
}

function wwwEncode(paramMap) {
  let data = [];
  for (let i in paramMap) {
    data.push(`${encodeURIComponent(i)}=${encodeURIComponent(paramMap[i])}`);
  }
  return data.join('&');
}