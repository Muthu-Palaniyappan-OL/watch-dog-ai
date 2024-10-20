#!/bin/sh
sudo yum install git -y
git clone https://github.com/Muthu-Palaniyappan-OL/watch-dog-ai.git
cd ./watch-dog-ai/watch-dog-backend/
python3 -m venv venv
/home/ec2-user/watch-dog-ai/watch-dog-backend/venv/bin/python3 -m pip install --upgrade pip
source venv/bin/activate
mkdir ~/pip_temp
TMPDIR=~/pip_temp pip install -r requirements.txt