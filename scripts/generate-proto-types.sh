#!/bin/bash

# This script requires git, protobuf-compiler and protoc-gen-grpc-web to be
# installed in your system, along with an env var GH_TOKEN storing a valid
# GitHub token to grant access to https://github.com/hermeznetwork/comms-protocol

TMP_PATH="tmp"
IMPORTS_PATH="$TMP_PATH/third_party"
PROTO_PATH="proto/bridge/v1"
PROTO_FILE="query.proto"
OUTPUT_PATH="src/types"
REPOSITORY="https://$GH_TOKEN@github.com/hermeznetwork/comms-protocol.git"
BRANCH="feature/bridge"

mkdir $TMP_PATH
mkdir $OUTPUT_PATH
git clone --branch $BRANCH $REPOSITORY $TMP_PATH

protoc -I=$TMP_PATH $PROTO_PATH/$PROTO_FILE \
  --proto_path=$IMPORTS_PATH \
  --js_out=import_style=commonjs:$OUTPUT_PATH \
  --grpc-web_out=import_style=typescript,mode=grpcwebtext:$OUTPUT_PATH

# Remove unused import that breaks the compilation until this is fixed:
# https://github.com/grpc/grpc-web/issues/529
ls -1 $OUTPUT_PATH/$PROTO_PATH/*.js | xargs sed -i '/google_api_annotations_pb =/d'

rm -rf $TMP_PATH
