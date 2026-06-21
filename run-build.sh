#!/bin/bash
# Run the build in background and signal when done
exec > /tmp/build_exec.log 2>&1
set -x
cd /home/team/shared/autoexec
npx next build 2>&1 | tail -40
echo "EXIT_CODE=$?"