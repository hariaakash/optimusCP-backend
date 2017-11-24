echo 'Started'
sudo apt-get update
sudo apt-get -y upgrade
sudo apt-get -y dist-upgrade
echo 'Upgraded & started screen'
screen -dmS mean bash -c "sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 0C49F3730359A14518585931BC711F9BA15703C6 && echo \"deb [ arch=amd64,arm64 ] http://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/3.4 multiverse\" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.4.list && sudo apt-get update && sudo apt-get install -y mongodb-org && sudo service mongod start && sudo apt-get install nodejs && sudo apt-get install npm"
echo 'finish'