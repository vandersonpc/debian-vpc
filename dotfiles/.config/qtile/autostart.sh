#!/bin/sh
#   ___ _____ ___ _     _____   ____  _             _    
#  / _ \_   _|_ _| |   | ____| / ___|| |_ __ _ _ __| |_  
# | | | || |  | || |   |  _|   \___ \| __/ _` | '__| __| 
# | |_| || |  | || |___| |___   ___) | || (_| | |  | |_  
#  \__\_\|_| |___|_____|_____| |____/ \__\__,_|_|   \__| 
#                                                        
#  
# by Vanderson Carvalho(2023) 
# ----------------------------------------------------- 

# Flameshot - Screen grab
flameshot &

# - Xfce managers
#
# Load power manager
xfce4-power-manager &

# Load network manager
nm-applet &

# Load Bluetooth manager
blueman-applet &

# My screen resolution
# xrandr --rate 120
intern=LVDS1-1
extern=HDMI-1-1

if xrandr | grep "$extern disconnected"; then
    # Setup monitor
    xrandr --output "$extern" --off --output "$intern" --auto  
    # Launch single polybar
    polybar -r mybar & 
else
   # Setup multiple monitor
   ~/.config/screenlayout/dualmonitor.sh
   # Launch polybar
   polybar -r mybar & 
   polybar -r mybar_external &
fi

# For Virtual Machine 
# xrandr --output Virtual-1 --mode 1920x1080

# Set keyboard layout in config.py

# Load picom
picom &

# Load notification service
dunst &

# Load wallpapers
nitrogen --restore &




