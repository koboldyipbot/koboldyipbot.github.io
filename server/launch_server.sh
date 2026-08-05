#!/bin/bash
# This launches a simple Python server to host files- no custom setup needed.
# For use with Linux/Mac

server_dir=$(dirname "$0")
cd "$server_dir"

which python3 1>/dev/null

if [[ "$?" -gt 0 ]]; then
	echo 'python3 is not installed: https://www.python.org/downloads/' 1>&2
	exit 1
fi

terminated=false

function terminateServer()
{
	if [[ $terminated = false ]]; then
		terminated=true
		printf "\nHalting server...\n"
		kill $pid
	fi
}

trap terminateServer SIGINT EXIT

python3 "launch_server.py" 8000 &
pid="$!"

printf '\nServer launched!  Press Ctrl+C to halt the server.\n\n'

while [[ $terminated = false ]]; do
	sleep 1;
done
