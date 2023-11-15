#!/bin/bash
#  ____                                                    
# |  _ \ _____      _____ _ __ _ __ ___   ___ _ __  _   _  
# | |_) / _ \ \ /\ / / _ \ '__| '_ ` _ \ / _ \ '_ \| | | | 
# |  __/ (_) \ V  V /  __/ |  | | | | | |  __/ | | | |_| | 
# |_|   \___/ \_/\_/ \___|_|  |_| |_| |_|\___|_| |_|\__,_| 
#                                                          
#  
# by Stephan Raabe (2023) 
# ----------------------------------------------------- 
echo $XDG_SESSION_TYPE
if [ $XDG_SESSION_TYPE == "wayland" ]; then
	lockapp=swaylock
else
	lockapp=slock
fi
echo "Using $lockapp to lock the screen."

option1="    LOCK " 
option2="   LOGOUT"
option3="󱎝    REBOOT"
option4="󰤆    POWER OFF"

options="$option1\n"
options="$options$option2\n"
options="$options$option3\n$option4"

choice=$(echo -e "$options" | rofi -dmenu -config ~/.config/rofi/config-power.rasi -i -no-show-icons -l 4 -width 30 -p "Powermenu") 

case $choice in
	$option1)
		$lockapp ;;
	$option2)
		#qtile cmd-obj -o cmd -f shutdown ;;
		loginctl kill-user "$UID";;
	$option3)
		systemctl reboot ;;
	$option4)
		systemctl poweroff ;;
esac

