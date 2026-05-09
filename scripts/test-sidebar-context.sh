#!/usr/bin/env bash
set -euo pipefail

# Sync mirrored frontend/src and run sidebar-context regression suites.
npm run sync:frontend-src
npm run test -- --runInBand --watchAll=false --testPathPattern='AppUnified\.test|SettingsView\.test|ChatGPTInterface\.test|sidebarContextFilterEvent\.test'
