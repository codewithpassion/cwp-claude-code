#!/bin/sh

bun build --compile --target=bun gemini-cli.ts 

mkdr -p ~/.local/bin
cp ./gemini-cli ~/.local/bin/gemini-cli
