#!/bin/bash

# This script requires git, protobuf-compiler and protoc-gen-grpc-web to be
# installed in your system, along with an env var GH_TOKEN storing a valid
# GitHub token to grant access to https://github.com/hermeznetwork/comms-protocol

TMP_PATH="tmp"
TARGET_PATH="types"
PROTO_PATH="$TMP_PATH/third_party"
PROTO_FILE="proto/bridge/v1/query.proto"
REPOSITORY="https://$GH_TOKEN@github.com/hermeznetwork/comms-protocol.git"
BRANCH="feature/bridge"

mkdir $TMP_PATH
mkdir $TARGET_PATH
git clone --branch $BRANCH $REPOSITORY $TMP_PATH

protoc -I=$TMP_PATH $PROTO_FILE \
  --proto_path=.:$PROTO_PATH \
  --js_out=import_style=commonjs:$TARGET_PATH \
  --grpc-web_out=import_style=typescript,mode=grpcwebtext:$TARGET_PATH

rm -rf $TMP_PATH
