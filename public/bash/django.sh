echo 'Started'
sudo apt-get update
sudo apt-get -y upgrade
sudo apt-get -y dist-upgrade
echo 'Upgraded & started screen'
screen -dmS mean bash -c "sudo apt-get install python3 && sudo apt-get install -y python3-pip && sudo pip3 install django"
echo 'finish'