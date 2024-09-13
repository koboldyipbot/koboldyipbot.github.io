async function getTwitchUsers(bearerToken, users) {
  let userParams = new URLSearchParams();
  for (let i in users) {
    userParams.append('login', users[i]);
  }
  let resp = await fetch(`https://api.twitch.tv/helix/users?${userParams.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Bearer ${bearerToken}`,
      'Client-Id': secrets.twitchChannelPoints.clientID,
    } 
  });

  let output = await resp.json();
  console.log(`getTwitchUsers output: ${output}`);
  return output;
}

async function getTwitchProfilePictureURL(bearerToken, user) {
  let userData = await getTwitchUsers(bearerToken, [user]);
  return userData.data[0].profile_image_url;
}