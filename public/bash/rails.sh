echo 'Started'
sudo apt-get update
sudo apt-get -y upgrade
sudo apt-get -y dist-upgrade
echo 'Upgraded & started screen'
screen -dmS mean bash -c "gpg --keyserver hkp://keys.gnupg.net --recv-keys 409B6B1796C275462A1703113804BB82D39DC0E3 && cd /tmp && \curl -sSL https://get.rvm.io -o rvm.sh && cat /tmp/rvm.sh | bash -s stable && source /usr/local/rvm/scripts/rvm && rvm install 2.3.0 && gem install rails && sudo apt-get install nodejs && sudo apt-get install npm"
echo 'finish'