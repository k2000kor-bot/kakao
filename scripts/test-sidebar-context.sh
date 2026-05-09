#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${PROJECT_ROOT}"

# Sync mirrored frontend/src and run sidebar-context regression suites.
npm run sync:frontend-src
npm run test -- --runInBand --watchAll=false --testPathPattern='AppUnified\.test|SettingsView\.test|ChatGPTInterface\.test|sidebarContextFilterEvent\.test'
