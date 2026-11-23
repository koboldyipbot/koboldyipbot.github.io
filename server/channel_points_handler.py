from http import HTTPStatus
import json
import os

channel_points_file = 'managed/channelPoints.json'


def matches_path(path):
    return path == '/channel_points'


def do_GET(request_handler):
    filename = f'{request_handler.directory}{channel_points_file}'
    try:
        if not os.path.exists(filename):
            request_handler.basic_response(
                HTTPStatus.OK,
                content_type='application/json',
                content='{}'
            )
            return

        with open(filename) as f:
            raw_data = f.read()
            data = json.loads(raw_data)
            request_handler.basic_response(
                HTTPStatus.OK,
                content_type='application/json',
                content=json.dumps(data)
            )
    except Exception as e:
        request_handler.basic_response(
            HTTPStatus.BAD_REQUEST,
            content='\n\n'.join([
                f'Saved data invalid.  Error:', 
                str(e),
                f'Data saved in {filename}:',
                raw_data
            ])
        )



def do_POST(request_handler):
    filename = f'{request_handler.directory}{channel_points_file}'
    content_length = int(request_handler.headers['Content-Length'])
    post_data = request_handler.rfile.read(content_length).decode('utf-8')
    try:
        processed = json.loads(post_data)
        pretty_data = json.dumps(processed, indent=4)
        with open(filename, 'w') as f:
            f.write(pretty_data)
        request_handler.basic_response(HTTPStatus.OK)
        return
    except Exception as e:
        request_handler.basic_response(HTTPStatus.BAD_REQUEST, content='Invalid JSON provided!')
        return
    request_handler.basic_response(HTTPStatus.BAD_REQUEST, content='Something went wrong.')
    return
