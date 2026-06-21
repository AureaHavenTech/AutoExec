#!/bin/bash
cd /home/team/shared/autoexec
npx next build > /tmp/nextbuild3.log 2>&1
echo "BUILD_DONE" >> /tmp/nextbuild3.log