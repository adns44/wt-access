; Copyright 2022 Freedom Scientific Inc.
; Copyright 2025 TheAdam <theadam.eu>

import "uia.jsb"
include "hjconst.jsh"
include "common.jsm"
include "uia.jsh"

globals
    int WindowsTerminalObjectID,
    object WindowsTerminalTextProvider,
    int WindowsTerminalLastKeyPress,
    int NoSelect,
    string wt_LastText

Script ScriptFileName()
    ScriptAndAppNames("Windows Terminal")
EndScript

Void Function FocusChangedEventProcessAncestors(handle FocusWindow, handle PrevWindow)
    if GetObjectClassName() == "TermControl"
        sayObjectTypeAndText(2)
    ELSE
        FocusChangedEventProcessAncestors(FocusWindow, PrevWindow)
    EndIf
EndFunction

Int Function IgnoreObjectAtLevel(int level)
    var
        int type = GetObjectSubTypeCode()
    if type == WT_LISTBOX ||
        type == WT_LISTBOXITEM
        return true ; prevent overspeaking with Ctrl+Tab
    EndIf
    return FALSE
EndFunction

string function GetTextInConsoleWindow()
    var
        object oNull,
        object visibleRanges,
        object range
    if GetObjectClassName() != "TermControl"
        return ""
    EndIf
    WindowsTerminalTextProvider = FSUIAGetFocusedElement().GetTextPattern()
    visibleRanges = WindowsTerminalTextProvider.GetVisibleRanges()
    var string textRange = visibleRanges(0)
    var string text = textRange.GetText(-1)
    return text
EndFunction

script SayBottomLineOfWindow()
    var string text = GetTextInConsoleWindow()
    if text then
        var stringArray lines = StringSplit (text, "\n", false)
        var string LastLine = lines[ArrayLength (lines)]
        Say(LastLine,ot_user_requested_information)
    endIf
EndScript

script VirtualizeWindow()
    var string text = StringTrimTrailingBlanks(GetTextInConsoleWindow())
    if !text then
        SayMessage(OT_ERROR,cmsgNoTextToVirtualize_L,cmsgNoTextToVirtualize_S)
        return
    endIf
    SayMessage(ot_JAWS_Message,cmsgVirtualizeWindow_L,cmsgVirtualizeWindow_S)
    UserBufferClear()
    UserBufferAddText(StringTrimTrailingBlanks(text))
    UserBufferActivate()
EndScript

; Coming soon: Get the prompt out however still not work
string function GetLastLineFromConsoleText()
    var string WindowText = StringTrimTrailingBlanks(GetTextInConsoleWindow())
    var stringArray lines = StringSplit (WindowText, "\n", false)
    var string LastLine = lines[ArrayLength (lines)-1]
    return LastLine 
EndFunction

Script TopOfFile()
    IF IsJAWSCursor ()
        JAWSPageUp ()
    EndIf
    PerformScript TopOfFile()
EndScript

Script BottomOfFile()
    IF IsJAWSCursor ()
        RouteJAWSToPc ()
    EndIf
    PerformScript BottomOfFile()
EndScript

script ToggleSayIndentation()
    var int status =  GetJCFOption (OPT_INDICATE_INDENTATION)
    if status == 0
        ; turn it on
        Say ("Indentation echo on", OT_JAWS_MESSAGE, false)
        SetJCFOption (OPT_INDICATE_INDENTATION, 1)
    else
        ; turn it off
        Say ("Indentation echo off", OT_JAWS_MESSAGE, false)
        SetJCFOption (OPT_INDICATE_INDENTATION, 0)
    endif
EndScript

string function ProcessUiaText(string text)
    var stringArray lines = StringSplit (text, "\n", false)
    var int x = 0
    var string out = ""
    if ArrayLength(lines) == 1
        out = StringConcatenate (out, lines[x])
    EndIf
    For x = 0 to ArrayLength(lines)
        if StringLength (stringStripAllBlanks (lines[x+1])) < 2 & lines[x+1] != "\n" & x != ArrayLength(lines)
            out = StringConcatenate (out, StringReplaceChars (lines[x], "\n", " "))
        else
            out = StringConcatenate (out, lines[x], " ")
        EndIf
    EndFor
    out = StringConcatenate (out, lines[x+1], "\n")
    return out
EndFunction

Void Function KeyPressedEvent (int nKey, string strKeyName, int nIsBrailleKey, int nIsScriptKey)
    if nKey == 75 | nKey == 77
        NoSelect = 1
        return
    EndIf
    if (nKey > 100000)
        WindowsTerminalLastKeyPress = WindowsTerminalLastKeyPress+1
    else
        WindowsTerminalLastKeyPress = 0
    EndIf
    NoSelect = 0
EndFunction

void function SelectionChangedEvent( string text, int wasTextSelected, optional int source )
    if NoSelect == 1
        Say(text,ot_line)
    else
        SelectionChangedEvent( text, wasTextSelected, source )
    EndIf
    NoSelect = 0
EndFunction

string function GetNewlyWrittenText(string newText, string oldText)	
    if (LevenshteinDistance(oldText,newText) < 3) && NoSelect == 1
        return "" ; prevent double echoing of characters that are typed
    EndIf
    return newText
EndFunction

void function UIANotificationEvent(int notificationKind, int notificationProcessing, string displayString, string activityId, string appname)
    ;Say (activityId, OT_NONHIGHLIGHTED_SCREEN_TEXT)
    var string out = ProcessUiaText(GetNewlyWrittenText(displayString, wt_LastText))
    wt_LastText = ProcessUiaText(displayString)
    if appname == "WindowsTerminal"
        if activityId == "TerminalTextOutput"
            if WindowsTerminalLastKeyPress >= 2
                WindowsTerminalLastKeyPress = 0
            ENDIF
            if WindowsTerminalLastKeyPress == 0
                Say (out, OT_NONHIGHLIGHTED_SCREEN_TEXT)
            else
                WindowsTerminalLastKeyPress = WindowsTerminalLastKeyPress+1
            ENDIF
        else
            Say (out, OT_NONHIGHLIGHTED_SCREEN_TEXT)
        ENDIF
    ELSE
        UIANotificationEvent(notificationKind, notificationProcessing, displayString, activityId, appname)
    EndIf
EndFunction
