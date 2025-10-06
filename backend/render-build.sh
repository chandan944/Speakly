#!/usr/bin/env bash
set -e

# Go into the backend directory
cd backend

# Give permission to gradlew
chmod +x gradlew

# Build the project
./gradlew clean build -x test
