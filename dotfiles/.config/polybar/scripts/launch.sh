#!/usr/bin/env bash
#  ____  _             _     ____       _       _                 
# / ___|| |_ __ _ _ __| |_  |  _ \ ___ | |_   _| |__   __ _ _ __  
# \___ \| __/ _` | '__| __| | |_) / _ \| | | | | '_ \ / _` | '__| 
#  ___) | || (_| | |  | |_  |  __/ (_) | | |_| | |_) | (_| | |    
# |____/ \__\__,_|_|   \__| |_|   \___/|_|\__, |_.__/ \__,_|_|    
#                                         |___/                   
#  
# by Stephan Raabe (2023) 
# ----------------------------------------------------- 

# ----------------------------------------------------- 
# Quit running polybar instances
# ----------------------------------------------------- 
killall polybar

# polybar-msg cmd quit


# ----------------------------------------------------- 
# Loading the configuration based on the username
# ----------------------------------------------------- 
polybar -r mybar

#for m in $(polybar --list-monitors | cut -d":" -f1); do
#    MONITOR=$m polybar --reload mybar &
#    MONITOR=$m polybar --reload mybar_external &


