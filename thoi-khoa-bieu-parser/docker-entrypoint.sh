#!/bin/bash

set -eu

WORKER_COUNT=${WORKER_COUNT:-2}
PORT=${PORT:-5000}

shutdown() {
    echo "Caught SIGTERM/SIGINT signal. Shutting down gracefully..."
    kill -TERM "$child_pid" 2>/dev/null
}

trap 'shutdown' SIGTERM SIGINT

gunicorn main:app -w $WORKER_COUNT -b "0.0.0.0:$PORT" &
child_pid=$!
wait "$child_pid"

exit 0
