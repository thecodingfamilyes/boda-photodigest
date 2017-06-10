#!/bin/bash

echo "Testing"
npm test

set -e
BRANCH=${TRAVIS_BRANCH:-$(git rev-parse --abbrev-ref HEAD)}
if [[ $BRANCH == 'master' ]]; then
  STAGE="production"
elif [[ $BRANCH == 'develop' ]]; then
  STAGE="dev"
fi
if [ -z ${STAGE+x} ]; then
  echo "Not deploying changes";
  exit 0;
fi

echo "Deploying from branch $BRANCH to stage $STAGE"
sls deploy --stage $STAGE
