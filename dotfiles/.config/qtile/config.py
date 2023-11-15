# Copyright (c) 2010 Aldo Cortesi
# Copyright (c) 2010, 2014 dequis
# Copyright (c) 2012 Randall Ma
# Copyright (c) 2012-2014 Tycho Andersen
# Copyright (c) 2012 Craig Barnes
# Copyright (c) 2013 horsik
# Copyright (c) 2013 Tao Sauvage
#
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in
# all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
# SOFTWARE.

import os
import subprocess
from libqtile import bar, layout, widget
from libqtile import hook
from libqtile.config import Click, Drag, Group, Key, Match, Screen, KeyChord
from libqtile.lazy import lazy
from libqtile.utils import guess_terminal
from pathlib import Path
import colors

mod = "mod4"
terminal = guess_terminal()
cursor_warp = True
# --------------------------------------------------------
# General Variables
# --------------------------------------------------------

mod = "mod4"             		# Sets mod key to SUPER/WINDOWS
home = str(Path.home())			# Get home path
myTerm = "alacritty"      		# My terminal of choice
myBrowser = "thorium-browser"     	# My browser of choice
myFileBrowser = "thunar" 		# My File Browser of choice
myMenu = "rofi -show drun -show-icons -modi drun" 			# My Menu

myEmacs = "emacsclient -c -a 'emacs' " 	# The space at the end is IMPORTANT!

# Allows you to input a name when adding treetab section.
@lazy.layout.function
def add_treetab_section(layout):
    prompt = qtile.widgets_map["prompt"]
    prompt.start_input("Section name: ", layout.cmd_add_section)

# A function for hide/show all the windows in a group
@lazy.function
def minimize_all(qtile):
    for win in qtile.current_group.windows:
        if hasattr(win, "toggle_minimize"):
            win.toggle_minimize()
            
# Show the key biddings          
def show_keys():
    key_help = ""
    for k in keys:
        mods = ""

        for m in k.modifiers:
            if m == "mod4":
                mods += "Super + "
            else:
                mods += m.capitalize() + " + "

        if len(k.key) > 1:
            mods += k.key.capitalize()
        else:
            mods += k.key

        key_help += "{:<30} {}".format(mods, k.desc + "\n")

    return key_help

#keys.extend([Key([mod], "F1", lazy.spawn("sh -c 'echo \"" + show_keys() + "\" | rofi -dmenu -i -mesg \"Keyboard shortcuts\"'"), desc="Print keyboard bindings"),])            

keys = [
    
	 # Focus
        Key([mod], "Left", lazy.layout.left(), desc="Move focus to left"),
        Key([mod], "Right", lazy.layout.right(), desc="Move focus to right"),
        Key([mod], "Down", lazy.layout.down(), desc="Move focus down"),
        Key([mod], "Up", lazy.layout.up(), desc="Move focus up"),
        Key([mod], "space", lazy.layout.next(), desc="Move window focus to other window around"),
        
        # Move
        Key([mod, "shift"], "Left", lazy.layout.shuffle_left(), desc="Move window to the left"),
        Key([mod, "shift"], "Right", lazy.layout.shuffle_right(), desc="Move window to the right"),
        Key([mod, "shift"], "Down", lazy.layout.shuffle_down(), desc="Move window down"),
        Key([mod, "shift"], "Up", lazy.layout.shuffle_up(), desc="Move window up"),

        # Swap
        Key([mod, "shift"], "h", lazy.layout.swap_left(), desc="Swap window to the left"),
        Key([mod, "shift"], "l", lazy.layout.swap_right(), desc="Swap window to the right"),

        #Key([mod], "Print", lazy.spawn(home + "/.config/qtile/scripts/screenshot.sh")),

        # Size
        Key([mod, "control"], "Down", lazy.layout.shrink(), desc="Grow window to the left"),
        Key([mod, "control"], "Up", lazy.layout.grow(), desc="Grow window to the right"),
    	Key([mod], "n", lazy.layout.reset(), desc="Reset all window sizes"),
    	Key([mod], "m", lazy.layout.maximize(), desc='Toggle between min and max sizes'),
    	Key([mod], "t", lazy.window.toggle_floating(), desc='toggle floating'),
    	Key([mod], "f", lazy.window.toggle_fullscreen(), desc='toggle fullscreen'),
    	Key([mod, "shift"], "m", minimize_all(), desc="Toggle hide/show all windows on current group"),

        # Floating
        Key([mod], "t", lazy.window.toggle_floating(), desc='Toggle floating'),
        
        # Split
        Key([mod, "shift"], "Return", lazy.layout.toggle_split(), desc="Toggle between split and unsplit sides of stack"),

        # Toggle Layouts
        Key([mod], "Tab", lazy.next_layout(), desc="Toggle between layouts"),

	# Screens
	Key([mod], 'period', lazy.next_screen(), desc='Next monitor'),

        #System
        Key([mod], "q", lazy.window.kill(), desc="Kill focused window"),
        Key([mod, "shift"], "r", lazy.reload_config(), desc="Reload the config"),
        Key([mod, "control"], "q", lazy.spawn(home + "/.config/qtile/scripts/powermenu.sh"), desc="Open Powermenu"),
        
        # Audio
        Key([], 'XF86AudioLowerVolume', lazy.spawn('amixer sset Master,0 5%-')),
    	Key([], 'XF86AudioRaiseVolume', lazy.spawn('amixer sset Master,0 5%+')),
    	Key([], 'XF86AudioMute', lazy.spawn('amixer sset Master,0 toggle')),
    	
    	# Brigthness
    	Key([], 'XF86MonBrightnessDown', lazy.spawn("brightnessctl -q s 5%-")),
    	Key([], "XF86MonBrightnessUp",lazy.spawn("brightnessctl -q s 5%+")),
    
        # Apps
	Key([mod], "Return", lazy.spawn(myTerm), desc="Terminal"),
	Key([mod, "shift"], "Return", lazy.spawn(myFileBrowser), desc='File Browser'),
	Key([mod], "b", lazy.spawn(myBrowser), desc='Web browser'),
	Key([mod], "d", lazy.spawn(myMenu), desc='Menu'),


	Key([mod], "r", lazy.spawncmd(), desc="Spawn a command using a prompt widget"),
   
   	#Key([mod], "F1", lazy.spawn("sh -c 'echo \"" + show_keys(keys) + "\" | rofi -dmenu -i -mesg \"Keyboard shortcuts\"'"), desc="Print keyboard bindings"),
    
]

keys.extend([Key([mod], "F1", lazy.spawn("sh -c 'echo \"" + show_keys() + "\" | rofi -dmenu -config ~/.config/rofi/config-key.rasi -i -mesg \"Keyboard shortcuts\"'"), desc="Print keyboard bindings"),])

groups = []
group_names = ["1", "2", "3", "4", "5", "6", "7", "8", "9",]

#group_labels = ["DEV", "WWW", "SYS", "DOC", "VBOX", "CHAT", "MUS", "VID", "GFX",]
group_labels = ["1", "2", "3", "4", "5", "6", "7", "8", "9",]
#group_labels = ["", "", "", "", "", "", "", "", "",]


group_layouts = ["monadtall", "monadtall", "monadtall", "monadtall", "monadtall", "monadtall", "monadtall", "monadtall", "monadtall"]

for i in range(len(group_names)):
    groups.append(
        Group(
            name=group_names[i],
            layout=group_layouts[i].lower(),
            label=group_labels[i],
        ))
 
for i in groups:
    keys.extend(
        [
            # mod1 + letter of group = switch to group
            Key(
                [mod],
                i.name,
                lazy.group[i.name].toscreen(),
                desc="Switch to group {}".format(i.name),
            ),
            # mod1 + shift + letter of group = move focused window to group
            Key(
                [mod, "shift"],
                i.name,
                lazy.window.togroup(i.name, switch_group=False),
                desc="Move focused window to group {}".format(i.name),
            ),
        ]
    )


### COLORSCHEME ###
# Colors are defined in a separate 'colors.py' file.
# There 10 colorschemes available to choose from:
#
# colors = colors.DoomOne
# colors = colors.Dracula
# colors = colors.GruvboxDark
# colors = colors.MonokaiPro
# colors = colors.Nord
# colors = colors.OceanicNext
# colors = colors.Palenight
# colors = colors.SolarizedDark
# colors = colors.SolarizedLight
# colors = colors.TomorrowNight
#
# It is best not manually change the colorscheme; instead run 'dtos-colorscheme'
# which is set to 'MOD + p c'

colors = colors.DoomOne

### LAYOUTS ###
# Some settings that I use on almost every layout, which saves us
# from having to type these out for each individual layout.
layout_theme = {"border_width": 3,
                "margin": 8,
                "border_focus": "FFFFFF",
                "border_normal": colors[0]
                }

layouts = [
    #layout.Bsp(**layout_theme),
    #layout.Floating(**layout_theme)
    #layout.RatioTile(**layout_theme),
    #layout.Tile(shift_windows=True, **layout_theme),
    #layout.VerticalTile(**layout_theme),
    #layout.Matrix(**layout_theme),
    layout.MonadTall(**layout_theme),
    #layout.MonadWide(**layout_theme),
    layout.Max(
         border_width = 0,
         margin = 0,
         ),
    layout.Stack(**layout_theme, num_stacks=3),
    layout.Columns(**layout_theme),
    layout.TreeTab(
         font = "Ubuntu Bold",
         fontsize = 11,
         border_width = 0,
         bg_color = colors[0],
         active_bg = colors[8],
         active_fg = colors[2],
         inactive_bg = colors[1],
         inactive_fg = colors[0],
         padding_left = 8,
         padding_x = 8,
         padding_y = 6,
         sections = ["ONE", "TWO", "THREE"],
         section_fontsize = 10,
         section_fg = colors[7],
         section_top = 15,
         section_bottom = 15,
         level_shift = 8,
         vspace = 3,
         panel_width = 240
         ),
    layout.Zoomy(**layout_theme),
]

# Some settings that I use on almost every widget, which saves us
# from having to type these out for each individual widget.
widget_defaults = dict(
    font="Ubuntu Bold",
    fontsize = 12,
    padding = 0,
    background=colors[0]
)


extension_defaults = widget_defaults.copy()

screens = [Screen(top=bar.Gap(size=28))]

connected_monitors = subprocess.run(
    "xrandr | grep 'connected' | cut -d ' ' -f 2",
    shell=True,
    stdout=subprocess.PIPE
).stdout.decode("UTF-8").split("\n")[:-1].count("connected")

if connected_monitors > 1:
    for i in range(1, connected_monitors):
        screens.append(Screen(top=bar.Gap(size=28)))

#screens = [Screen(top=bar.Gap(size=28)), Screen(top=bar.Gap(size=28))]

# Drag floating layouts.
mouse = [
    Drag([mod], "Button1", lazy.window.set_position_floating(), start=lazy.window.get_position()),
    Drag([mod], "Button3", lazy.window.set_size_floating(), start=lazy.window.get_size()),
    Click([mod], "Button2", lazy.window.bring_to_front()),
]

dgroups_key_binder = None
dgroups_app_rules = []  # type: list
follow_mouse_focus = True
bring_front_click = False
floats_kept_above = True
cursor_warp = False
floating_layout = layout.Floating(
    float_rules=[
        # Run the utility of `xprop` to see the wm class and name of an X client.
        *layout.Floating.default_float_rules,
        Match(wm_class="confirmreset"),  # gitk
        Match(wm_class="makebranch"),  # gitk
        Match(wm_class="maketag"),  # gitk
        Match(wm_class="ssh-askpass"),  # ssh-askpass
        Match(title="branchdialog"),  # gitk
        Match(title="pinentry"),  # GPG key password entry
    ]
)
auto_fullscreen = True
focus_on_window_activation = "smart"
reconfigure_screens = True

# If things like steam games want to auto-minimize themselves when losing
# focus, should we respect this or not?
auto_minimize = True

# When using the Wayland backend, this can be used to configure input devices.
wl_input_rules = None

# XXX: Gasp! We're lying here. In fact, nobody really uses or cares about this
# string besides java UI toolkits; you can see several discussions on the
# mailing lists, GitHub issues, and other WM documentation that suggest setting
# this string if your java app doesn't work correctly. We may as well just lie
# and say that we're a working one by default.
#


# --------------------------------------------------------
# Windows Manager Name
# --------------------------------------------------------

wmname = "QTILE"

# --------------------------------------------------------
# Hooks
# --------------------------------------------------------

# HOOK startup
@hook.subscribe.startup_once
def start_once():
    home = os.path.expanduser('~')
    subprocess.call([home + '/.config/qtile/autostart.sh'])

