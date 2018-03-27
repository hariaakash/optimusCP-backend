#!/bin/bash
# Stack installer for OptimusCP
# Version: 1.0

# Variables
os=$1
stack=$2
pass=$3
lamp="https://bitnami.com/redirect/to/167501/bitnami-lampstack-7.1.12-0-linux-x64-installer.run"
mean="https://bitnami.com/redirect/to/170111/bitnami-meanstack-3.6.0-0-linux-x64-installer.run"
django="https://bitnami.com/redirect/to/170692/bitnami-djangostack-2.0.1-0-linux-x64-installer.run"
rails="https://bitnami.com/redirect/to/170396/bitnami-rubystack-2.4.3-0-linux-x64-installer.run"
tf="https://bitnami.com/redirect/to/184103/bitnami-tensorflowserving-1.5.0-1-linux-x64-installer.run"

# Lamp Stack Installer
function lamp {
    wget -O lamp.run > /dev/null 2>&1 $lamp && chmod +x lamp.run
    if ./lamp.run --mode unattended --disable_glibcxx_version_check 1 --disable-components varnish,phpmyadmin --prefix /opt/lamp --base_password $pass > /dev/null 2>&1; then
        rm lamp.run && cd /opt/lamp/apache2/htdocs/ && rm -rf * && wget -O index.html https://optimuscp.io/starter.html > /dev/null 2>&1 &&
        echo "TRUE:Installation successfull" && cd /opt/lamp/ && ./use_lampstack > /dev/null 2>&1
        # cd /opt/lamp/apps/phpmyadmin/conf/ && sed -i 's/Allow from 127.0.0.1/Allow from all/g' httpd-app.conf &&
        # cd /opt/lamp/ && ./ctlscript.sh restart apache > /dev/null 2>&1 &&
    else
        echo "FALSE:Installation failed"
    fi
}

# Mean Stack Installer
function mean {
    wget -O mean.run > /dev/null 2>&1 $mean && chmod +x mean.run
    if ./mean.run --mode unattended --disable_glibcxx_version_check 1 --disable-components rockmongo --prefix /opt/mean --mongodb_password $pass > /dev/null 2>&1; then
        rm mean.run && cd /opt/mean/apache2/htdocs/ && rm -rf * && wget -O index.html https://optimuscp.io/starter.html > /dev/null 2>&1 &&
        echo "TRUE:Installation successfull" && cd /opt/mean/ && ./use_meanstack > /dev/null 2>&1
        # cd /opt/mean/apps/rockmongo/conf/ && sed -i 's/Allow from 127.0.0.1/Allow from all/g' httpd-app.conf &&
        # cd /opt/mean/ && ./ctlscript.sh restart apache > /dev/null 2>&1 &&
    else
        echo "FALSE:Installation failed"
    fi
}

# Django Stack Installer
function django {
    wget -O django.run > /dev/null 2>&1 $django && chmod +x django.run
    if ./django.run --mode unattended --disable_glibcxx_version_check 1 --prefix /opt/django --mysql_password $pass --postgres_password $pass --djangostack_database optimuscp > /dev/null 2>&1; then
        rm django.run && cd /opt/django/apache2/htdocs/ && rm -rf * && wget -O index.html https://optimuscp.io/starter.html > /dev/null 2>&1 &&
        echo "TRUE:Installation successfull" && cd /opt/django/ && ./use_djangostack > /dev/null 2>&1
    else
        echo "FALSE:Installation failed"
    fi
}

# Django Stack Installer
function rails {
    wget -O rails.run > /dev/null 2>&1 $rails && chmod +x rails.run
    if ./rails.run --mode unattended --disable_glibcxx_version_check 1 --prefix /opt/rails --disable-components varnish,phpmyadmin,phppgadmin,nginx,redis,Sphinx,varnish,samplerails,nodejs,memcached --base_password $pass --postgres_password $pass > /dev/null 2>&1; then
        rm rails.run && cd /opt/rails/apache2/htdocs/ && rm -rf * && wget -O index.html https://optimuscp.io/starter.html > /dev/null 2>&1 &&
        echo "TRUE:Installation successfull"
    else
        echo "FALSE:Installation failed"
    fi
}

# TF Stack Installer
function tf {
    wget -O tf.run > /dev/null 2>&1 $tf && chmod +x tf.run
    if ./tf.run --mode unattended --disable_glibcxx_version_check 1 --prefix /opt/tf > /dev/null 2>&1; then
        rm tf.run &&
        echo "TRUE:Installation successfull"
    else
        echo "FALSE:Installation failed"
    fi
}

# Create swap if not available
function checkSwap {
    if free | awk '/^Swap:/ {exit !$2}'; then
        echo "true"
    else
        # Creating swap
        dd if=/dev/zero of=/mnt/swap.0 bs=1024 count=1048576 > /dev/null 2>&1 && mkswap /mnt/swap.0 > /dev/null 2>&1
        echo '/mnt/swap.0 swap swap defaults 0 0' >> /etc/fstab
        swapon /mnt/swap.0 > /dev/null 2>&1

        # Confirm swap creation
        if free | awk '/^Swap:/ {exit !$2}'; then
            echo "true"
        else
            echo "false"
        fi
    fi
}

# Start of script
function start {
    if [ ! -z "$os" ] && [ ! -z "$stack" ] && [ ! -z "$pass" ]; then
        # Check for swap
        if [[ "$(checkSwap)"=="true" ]]; then
            case "$stack" in
                "lamp" | "mean" | "django" | "rails" | "tf")
                    # Update & call stack installer
                    if [ "$os" == "centos" ]; then
                        sudo yum update > /dev/null 2>&1
                    else
                        sudo apt-get update > /dev/null 2>&1
                    fi
                    $stack
                    ;;
                *)
                    echo "FALSE:Stack not found"
                    ;;
            esac
        else
            echo "FALSE:Swap creation failed"
        fi
    else
        echo "FALSE:Arguments not met"
    fi
}

start
