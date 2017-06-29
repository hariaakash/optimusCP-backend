echo 'Started'
sudo apt-get update
sudo apt-get -y upgrade
sudo apt-get -y dist-upgrade
echo 'Upgraded & started screen'
screen -dmS lamp bash -c "sudo apt-get -y install tasksel && echo 'tasksel installed' && sudo debconf-set-selections <<< 'mysql-server mysql-server/root_password password '$1 && sudo debconf-set-selections <<< 'mysql-server mysql-server/root_password_again password '$1 && echo 'args set' && sudo tasksel install lamp-server"
echo 'finish'