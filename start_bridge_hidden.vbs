Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
strPath = fso.GetParentFolderName(WScript.ScriptFullName)
' Run the bridge using a path relative to this script
WshShell.Run "node.exe """ & strPath & "\bridge\index.js""", 0, false
