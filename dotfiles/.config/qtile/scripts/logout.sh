#!/usr/bin/env bash
#
# Script name: dm-logout
# Description: Logout, shutdown, reboot or lock screen.
# Dependencies: dmenu, fzf, rofi, systemd, slock, notify-send
# GitLab: https://www.gitlab.com/dwt1/dmscripts
# License: https://www.gitlab.com/dwt1/dmscripts/LICENSE
# Contributors: Derek Taylor,
#               Simon Ingelsson

# Set with the flags "-e", "-u","-o pipefail" cause the script to fail
# if certain things happen, which is a good thing.  Otherwise, we can
# get hidden bugs that are hard to discover.
set -euo pipefail

# shellcheck disable=SC1091
#source ./_dm-helper.sh 2>/dev/null || source _dm-helper.sh 2>/dev/null

#source_dmscripts_configs

if configs_are_different; then
    echo "$(date): configs are different" >>"$DM_CONFIG_DIFF_LOGFILE"
    sleep 1
fi

# use notify-send if run in dumb term
# TODO: add abillity to control from config.
_out="echo"
if [[ ${TERM} == 'dumb' ]]; then
    _out="notify-send"
fi

output() {
    ${_out} "logout" "$@"
}

main() {
    # An array of options to choose.
    declare -a options=(
        "Lock screen"
        "Logout"
        "Reboot"
        "Shutdown"
        "Suspend"
        "Quit"
    )

    # look up what managers are used (makes it more dynamic)
    declare -a managers
    while IFS= read -r manager; do
        managers+=("${manager,,}")
    done < <(grep-desktop)
    # Original code, used as a refrence and as backup
    # done < <(grep 'Name=' /usr/share/xsessions/*.desktop | cut -d'=' -f2)
    managers+=("qtile")
    # Piping the above array into dmenu, fzf or rofi.
    # We use "printf '%s\n'" to format the array one item to a line.
    choice=$(printf '%s\n' "${options[@]}" | ${MENU} 'Shutdown menu:')

    # What to do when/if we choose one of the options.
    case $choice in
    'Logout')
        if [[ "$(echo -e "No\nYes" | ${MENU} "${choice}?")" == "Yes" ]]; then
            for manager in "${managers[@]}"; do
                loginctl kill-user "$UID"
            done
        else
            output "User chose not to logout." && exit 1
        fi
        ;;
    'Lock screen')
        # shellcheck disable=SC2154
        ${logout_locker}
        ;;
    'Reboot')
        if [[ "$(echo -e "No\nYes" | ${MENU} "${choice}?")" == "Yes" ]]; then
            systemctl reboot
        else
            output "User chose not to reboot." && exit 0
        fi
        ;;
    'Shutdown')
        if [[ "$(echo -e "No\nYes" | ${MENU} "${choice}?")" == "Yes" ]]; then
            systemctl poweroff
        else
            output "User chose not to shutdown." && exit 0
        fi
        ;;
    'Suspend')
        if [[ "$(echo -e "No\nYes" | ${MENU} "${choice}?")" == "Yes" ]]; then
            systemctl suspend
        else
            output "User chose not to suspend." && exit 0
        fi
        ;;
    'Quit')
        output "Program terminated." && exit 0
        ;;
    # It is a common practice to use the wildcard asterisk symbol (*) as a final
    # pattern to define the default case. This pattern will always match.
    *)
        exit 0
        ;;
    esac

}

MENU="$(get_menu_program "$@")"
[[ "${BASH_SOURCE[0]}" == "${0}" ]] && main

