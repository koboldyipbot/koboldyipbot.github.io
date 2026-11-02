// just in case we need to implement a custom one
// theoretically, 44-character codes can fit >100k users
function getStorage() {
  return localStorage;
}

export function saveCode(username, code) {
  getStorage().setItem(`${username}_code`, code);
}

export function loadCode(username) {
  return getStorage().getItem(`${username}_code`);
}