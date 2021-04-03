#!/bin/sh

npx eslint src && \
parcel build src && \
git checkout