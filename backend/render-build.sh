#!/usr/bin/env bash
set -e
chmod +x ./gradlew
./gradlew clean build -x test
