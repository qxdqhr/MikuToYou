#!/usr/bin/env bash
# 将本机构建的 APK 复制到本地文件服务目录（与 CI upload-apk-selfhosted 路径规则一致）。
# Debug:  {ROOT}/debug/{versionName}/{branch}-{shortSha}/mikutoyou-debug-{shortSha}.apk
#         并同步 {ROOT}/debug/latest/mikutoyou-debug.apk
# Release:{ROOT}/release/{tag}/mikutoyou-{tag}.apk
#         并同步 {ROOT}/release/latest/mikutoyou-release.apk
#
# 用法:
#   ./scripts/publish-apk-local.sh debug
#   RELEASE_TAG=v0.1.0 ./scripts/publish-apk-local.sh release
#
# 环境变量:
#   LOCAL_APK_ROOT  默认 /home/qhr/Desktop/shared-downloads

set -euo pipefail

MODE="${1:-}"
if [[ "$MODE" != "debug" && "$MODE" != "release" ]]; then
  echo "用法: $0 {debug|release}" >&2
  exit 1
fi

ROOT="${LOCAL_APK_ROOT:-/home/qhr/Desktop/shared-downloads}"
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
GRADLE_FILE="$REPO_ROOT/android/app/build.gradle"

VERSION_NAME="$(grep -E 'versionName\s+"' "$GRADLE_FILE" | head -1 | sed -E 's/.*versionName[[:space:]]+"([^"]+)".*/\1/')"
if [[ -z "${VERSION_NAME}" ]]; then
  echo "无法从 $GRADLE_FILE 解析 versionName" >&2
  exit 1
fi

SHORT_SHA="$(git -C "$REPO_ROOT" rev-parse --short HEAD)"
SAFE_BRANCH="$(git -C "$REPO_ROOT" rev-parse --abbrev-ref HEAD | tr '/' '-')"

if [[ "$MODE" == "debug" ]]; then
  SRC="$REPO_ROOT/android/app/build/outputs/apk/debug/app-debug.apk"
  SUBDIR="${VERSION_NAME}/${SAFE_BRANCH}-${SHORT_SHA}"
  DEST_DIR="${ROOT}/debug/${SUBDIR}"
  DEST_NAME="mikutoyou-debug-${SHORT_SHA}.apk"
else
  TAG="${RELEASE_TAG:-}"
  if [[ -z "$TAG" ]]; then
    TAG="$(git -C "$REPO_ROOT" describe --tags --exact-match 2>/dev/null || true)"
  fi
  if [[ -z "$TAG" ]]; then
    echo "Release 模式请设置 RELEASE_TAG（例如 RELEASE_TAG=v0.1.0）或处于带 tag 的 detached HEAD" >&2
    exit 1
  fi
  SRC="$REPO_ROOT/android/app/build/outputs/apk/release/app-release.apk"
  DEST_DIR="${ROOT}/release/${TAG}"
  DEST_NAME="mikutoyou-${TAG}.apk"
fi

if [[ ! -f "$SRC" ]]; then
  echo "未找到构建产物: $SRC（请先 ./gradlew assembleDebug / assembleRelease）" >&2
  exit 1
fi

mkdir -p "$DEST_DIR"
cp -f "$SRC" "${DEST_DIR}/${DEST_NAME}"
if [[ "$MODE" == "debug" ]]; then
  LATEST_DIR="${ROOT}/debug/latest"
  LATEST_NAME="mikutoyou-debug.apk"
else
  LATEST_DIR="${ROOT}/release/latest"
  LATEST_NAME="mikutoyou-release.apk"
fi
mkdir -p "$LATEST_DIR"
cp -f "${DEST_DIR}/${DEST_NAME}" "${LATEST_DIR}/${LATEST_NAME}"
echo "已发布: ${DEST_DIR}/${DEST_NAME}"
echo "最新固定路径: ${LATEST_DIR}/${LATEST_NAME}"
echo "HTTP 示例根: http://47.94.166.44:6001/"
if [[ "$MODE" == "debug" ]]; then
  echo "相对路径: debug/${VERSION_NAME}/${SAFE_BRANCH}-${SHORT_SHA}/${DEST_NAME}"
  echo "最新 URL: debug/latest/${LATEST_NAME}"
else
  echo "相对路径: release/${TAG}/${DEST_NAME}"
  echo "最新 URL: release/latest/${LATEST_NAME}"
fi
