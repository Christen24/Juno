!macro customUnInstall
  ; Kill running Juno process before uninstalling
  nsExec::ExecToLog 'taskkill /f /im "Juno.exe"'
  
  ; Remove auto-start registry entry
  DeleteRegValue HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "Juno"
  
  ; Small delay to let process fully exit
  Sleep 2000
!macroend
