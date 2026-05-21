#!/usr/bin/env bash
# push/PR 기본 GitHub 원격 — k2000kor-bot 계정 (SSH도 k2000kor-bot)
# source scripts/push-remote-default.sh

# shell/.envrc에 남은 k2000kor → bot으로 보정
case "${PUSH_GITHUB_OWNER:-}" in
  "" | k2000kor) export PUSH_GITHUB_OWNER="k2000kor-bot" ;;
esac
case "${PUSH_GITHUB_REPO:-}" in
  "" | kakao-frontend) export PUSH_GITHUB_REPO="kakao" ;;
esac
export PUSH_DEFAULT_REMOTE_URL="git@github.com:${PUSH_GITHUB_OWNER}/${PUSH_GITHUB_REPO}.git"
# shell/.envrc 레거시 URL 보정
case "${PUSH_REMOTE_URL:-}" in
  *@github.com:k2000kor/* | *kakao-frontend.git) unset PUSH_REMOTE_URL ;;
esac

# 레거시 (push 대상 아님)
export PUSH_LEGACY_REMOTE_URL="${PUSH_LEGACY_REMOTE_URL:-git@github.com:k2000kor/kakao.git}"
