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

TMP_PATH="tmp"
IMPORTS_PATH="$TMP_PATH/third_party"
PROTO_PATH="proto/bridge/v1"
PROTO_FILE="query.proto"
OUTPUT_PATH="src/types"
SSH_REPOSITORY="git@github.com:hermeznetwork/comms-protocol.git"
HTTP_REPOSITORY="https://$GH_TOKEN@github.com/hermeznetwork/comms-protocol.git"
BRANCH="main"

# Checking for ssh/https argument
if [ $# -ne 1 ]; then
  cat <<EOF
Please pass the argument -ssh or -https to specify which protocol should I use
to clone the repository https://github.com/hermeznetwork/comms-protocol

Exiting now :(

EOF
  exit 1
fi

if [ "$1" == "-ssh" ]; then
  git clone --branch $BRANCH $SSH_REPOSITORY $TMP_PATH
elif [ "$1" == "-https" ]; then

  # Making sure "GH_TOKEN" env var is available and exiting otherwise
  if [ -z ${GH_TOKEN+x} ]; then
    cat <<EOF
The env var GH_TOKEN could not be found on your system.

An env var GH_TOKEN storing a valid GitHub token is required to grant access to
https://github.com/hermeznetwork/comms-protocol using the -https protocol.

Exiting now :(

EOF
    exit 1
  fi

  git clone --branch $BRANCH $HTTP_REPOSITORY $TMP_PATH

else
  cat <<EOF
The provided argument $1 is invalid.

Please pass the argument -ssh or -https to specify which protocol should I use
to clone the repository https://github.com/hermeznetwork/comms-protocol

Exiting now :(

EOF
  exit 1
fi

if [ ! -d $OUTPUT_PATH ]; then
  mkdir $OUTPUT_PATH
fi

# All options and dependencies are available, we can move on!
protoc -I=$TMP_PATH $PROTO_PATH/$PROTO_FILE \
  --proto_path=$IMPORTS_PATH \
  --js_out=import_style=commonjs:$OUTPUT_PATH \
  --grpc-web_out=import_style=typescript,mode=grpcwebtext:$OUTPUT_PATH

# Remove unused import that breaks the compilation until this is fixed:
# https://github.com/grpc/grpc-web/issues/529
perl -ni -e 'print unless /google_api_annotations_pb/' $OUTPUT_PATH/$PROTO_PATH/*.js

rm -rf $TMP_PATH
