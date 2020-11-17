#!/bin/sh

# work around: github page seems unable to serve pages deps with href="/script.js". This replace href="/script.js" with href="script.js"
parcel build src/index.html && \
sed 's/ href=\"\// href=\"/g' dist/index.html > dist/tmp.html && \
sed 's/ src=\"\// src=\"/g' dist/tmp.html > dist/index.html
