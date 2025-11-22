' Create desktop shortcut for SAIL Bokaro Application
' Run this script to create a desktop shortcut

Set objShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")

' Get the project directory
strProjectDir = objShell.CurrentDirectory

' Define paths
strBatFile = strProjectDir & "\launch-app.bat"
strIconFile = strProjectDir & "\electron\assets\logo.svg"
strDesktopPath = objShell.SpecialFolders("Desktop")
strShortcutPath = strDesktopPath & "\SAIL Bokaro.lnk"

' Create shortcut
Set objShortcut = objShell.CreateShortcut(strShortcutPath)
objShortcut.TargetPath = strBatFile
objShortcut.WorkingDirectory = strProjectDir
objShortcut.Description = "SAIL Bokaro Logistics Optimization System"
objShortcut.WindowStyle = 1
objShortcut.Save

' Show success message
MsgBox "Desktop shortcut created successfully!" & vbCrLf & vbCrLf & _
        "You can now double-click 'SAIL Bokaro' on your desktop to launch the application.", _
        vbInformation, "Shortcut Created"
