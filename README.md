# Windows Terminal JAWS Scripts

This repository contains custom JAWS scripts for Windows Terminal to improve accessibility and user experience, specifically targeting issues with UIA support and ncurses-based applications.

The scripts leverage the User Interface Automation (UIA) API to directly interact with the Windows Terminal elements.

The WT is more faster than old ConHost by the different implementation of it.

## Problem with the original version

The original script that shiped with JAWS 2026 scrapes the screen periodicaly and gets the differences from the text. IT is not a good option as ncurses-based APPs near unusable, E.G. entire nano window reread when anything written into it.

Later MS implemented UIA support in WT but JAWS not followed the implementation to use.

Issues related to this
- [#16734](https://github.com/microsoft/terminal/issues/16734)
- [#16545](https://github.com/microsoft/terminal/issues/16545)
- [#12051](https://github.com/microsoft/terminal/issues/12051)

## Key features

- Support UIA, make the terminal and ncurses apps usable
- Turn off the every screen item auto-read feature and read only the changed content
- Prevent announcing unneccessary information (honour the keyboard echo setting)
- Support the auto-completion feature (E.G. tabtab in Bash)
- Turn on (temporarily) and off the indentation echo feature in Terminal with JAWSKEy+Shift+i command. Supported in text editors (Nano, Vim) and command outputs (E.G. `kubectl ... -o yaml` or `argocd ... -o yaml`).
- Read the bottom line, as toolbar in other APPs, with INS+PageDown
    > Note: It works well if you use tmux or other APPs with sticky bottom line however it says nothing if you're in a simple Bash and press it. It announces the prompt or other text if the window fulfilled.
- Avoid doubling characters in nano: when navigated with arrow keys, an annoying issue caused that sometimes characters, lines speaked duplicated

## Installation & Usage

1. Download the repo as a zip.
2. Copy the WindowsTerminal prefixed files to your JAWS settings home directory.
3. Compile the script. As of this repo does not contains the compiled version of the script, open up Windows terminal, press the Windows+0 key to open script manager and press CTRL+s to compile the code.
4. The scripts automatically associate with "Windows Terminal" (`ScriptAndAppNames`).

## Key Mappings
- **Shift + JAWSKey + I**: Toggle indentation announcement. Turn it on if you need to analyze text where indentations matter, E.G. Kubernetes resources.
- **JAWSKey + PageDown**: Read the bottom line of the Window (toolbar of Nano, VI, Tmux or other ncurses app). If no bottom line, E.G. a normal Bash, no spoken information.

## Technical Details
- **Script File**: `WindowsTerminal.JSS`
- **Key Map**: `WindowsTerminal.JKM`
- **Dependencies**: Requires `uia.jsb` for UIA interface access.
