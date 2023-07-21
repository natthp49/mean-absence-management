# การตั้งค่า Git Bash บน Integrated Terminal

### การตั้งค่า Git Bash บน Integrated Terminal

Integrated Terminal ของ VSCode บน Windows สามารถตั้งค่าให้ใช้งาน Git Bash เป็นค่าเริ่มต้นได้ โดยให้เข้าไปเพิ่มการตั้งค่า `.vscode/settings.json` ดังนี้

```json
{
  "terminal.integrated.profiles.windows": {
    "Git Bash": {
      "path": "D:\\Git\\bin\\bash.exe",
      "icon": "terminal-bash"
    },
    "PowerShell": {
      "source": "PowerShell",
      "icon": "terminal-powershell"
    },
    "Command Prompt": {
      "path": ["${env:windir}\\Sysnative\\cmd.exe", "${env:windir}\\System32\\cmd.exe"],
      "args": [],
      "icon": "terminal-cmd"
    },
    "gitbash": {
      "path": "D:\\Git\\bin\\bash.exe",
      "icon": "terminal-bash"
    }
  },
  "terminal.integrated.defaultProfile.windows": "Git Bash"
}
```

[&lt; Back To สไลด์ Angular](Slide-Angular.md) | [Next To Nx Workspace &gt;](Nx-Workspace.md)
