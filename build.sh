#!/bin/sh
# Bygger index.html af src/app.html (samme fil som udgives som artifact, uden <html>-skelet).
cd "$(dirname "$0")" || exit 1
{
  printf '<!doctype html>\n<html lang="da">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n<meta name="robots" content="noindex">\n<meta name="theme-color" content="#15171c">\n<link rel="icon" href="/favicon.svg" type="image/svg+xml">\n<link rel="apple-touch-icon" href="/apple-touch-icon.png">\n<style>:root{color-scheme:light;padding:env(safe-area-inset-top,0px) 0 env(safe-area-inset-bottom,0px)}body{margin:0}img{max-width:100%%}[hidden]{display:none!important}</style>\n'
  awk '/^<div class="app">/{print "</head>\n<body>"}{print}' src/app.html
  printf '</body>\n</html>\n'
} > index.html
