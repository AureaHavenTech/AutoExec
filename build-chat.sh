#!/bin/bash
cd /home/team/shared/autoexec
npx next build 2>&1 | tail -35 > /tmp/build-vc.log
echo "EXIT=$?" >> /tmp/build-vc.log