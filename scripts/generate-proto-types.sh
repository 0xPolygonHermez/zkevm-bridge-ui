#!/bin/bash

# Making sure "protoc" is available and exiting otherwise
if ! command -v protoc &>/dev/null; then
cat <<EOF
gRPC compiler (protoc) could not be found on your system.

Please visit https://grpc.io/docs/protoc-installation/ for
installation instructions.

Exiting now :(

EOF
  exit 1
fi

# Making sure "protoc-gen-grpc-web" is available and exiting otherwise
if ! command -v protoc-gen-grpc-web &>/dev/null; then
cat <<EOF
gRPC Web code generator plugin (protoc-gen-grpc-web) could
not be found on your system.

Please visit https://github.com/grpc/grpc-web#code-generator-plugin
for installation instructions.

Exiting now :(

EOF
  exit 1
fi

# Making sure "git" is available and exiting otherwise
if ! command -v git &>/dev/null; then
cat <<EOF
Git (git) could not be found on your system.

Please visit https://git-scm.com/book/en/v2/Getting-Started-Installing-Git
for installation instructions.

Exiting now :(

EOF
  exit 1
fi

# Making sure "GH_TOKEN" env var is available and exiting otherwise
if [ -z ${GH_TOKEN+x} ]; then
cat <<EOF
The env var GH_TOKEN could not be found on your system.

An env var GH_TOKEN storing a valid GitHub token to grant access to
https://github.com/hermeznetwork/comms-protocol is required.

Exiting now :(

EOF
  exit 1
fi

# All dependencies are available, we can move on!
TMP_PATH="tmp"
IMPORTS_PATH="$TMP_PATH/third_party"
PROTO_PATH="proto/bridge/v1"
PROTO_FILE="query.proto"
OUTPUT_PATH="src/types"
REPOSITORY="https://$GH_TOKEN@github.com/hermeznetwork/comms-protocol.git"
BRANCH="main"

mkdir $TMP_PATH
mkdir $OUTPUT_PATH
git clone --branch $BRANCH $REPOSITORY $TMP_PATH

protoc -I=$TMP_PATH $PROTO_PATH/$PROTO_FILE \
  --proto_path=$IMPORTS_PATH \
  --js_out=import_style=commonjs:$OUTPUT_PATH \
  --grpc-web_out=import_style=typescript,mode=grpcwebtext:$OUTPUT_PATH

# Remove unused import that breaks the compilation until this is fixed:
# https://github.com/grpc/grpc-web/issues/529
perl -ni -e 'print unless /google_api_annotations_pb/' $OUTPUT_PATH/$PROTO_PATH/*.js

rm -rf $TMP_PATH
