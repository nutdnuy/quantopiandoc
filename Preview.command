#!/bin/zsh
cd "$(dirname "$0")" || exit 1
node scripts/build.mjs || exit 1
QRL_OPEN=1 node scripts/serve.mjs
