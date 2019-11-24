# cpp-build README

This extension can manage IO files for cpp builds. It was intended to work with [Pbinfo](https://www.pbinfo.ro) informatics problems.

## Features
### Build and run helper
- create IO files for active cpp file
- set up run layout (IO files stacked up on the right side)
- run the configured build and run task
- clean up workspace

![Build and run](https://www.gitlab.com/i2002/cpp-build-vscode-extension/images/build-and-run.png)

### Pbinfo problem preview
- fetch problem info and show it in the right panel

![Pbinfo preview](https://www.gitlab.com/i2002/cpp-build-vscode-extension/images/pbinfo-preview.png)

## Shortcuts
- **F9** -  build and run
- **F10** - run
- **ctr+ESC** - clean up workspace
- **alt+P** - pbinfo problem preview

## Requirements
- a folder named `build/` in the root workspace
- a cpp build task named `"Build current file"` and two run tasks named `"Build and run current file"` and `"Run current file"`\
  the source file for the build task should be the current open one and the output should have the same name and be located in the `build/` directory\
  the run file should run the file with the same name as the active one from the `build/` directory with the working directory set to that directory
- debugger configured to run the executable from `build/`
- vscode cpp include paths configured
- `gcc` and `gdb` in *PATH*
- the in and out file names should be the name of the current file plus the `.in` or `.out` extensions

## Examples
Some example configurations. These should be put in the `.vscode` directory in the root directory of the workspace

### Tasks configuration
`.vscode/tasks.json`
```json
{
    "version": "2.0.0",
    "tasks": [
        {
            "label": "Build current file",
            "type": "shell",
            "command": "g++",
            "args": [
                "-g",
                "-Wall",
                "-o${workspaceRoot}/build/${fileBasenameNoExtension}",
                "${fileDirname}/${fileBasenameNoExtension}.cpp"
            ],
            "group": {
                "kind": "build",
                "isDefault": true
            },
            "problemMatcher": [
                "$gcc"
            ]
        },
        {
            "label": "Build and run current file",
            "type": "shell",
            "command": "${workspaceRoot}/build/${fileBasenameNoExtension}",
            "options": {
                "cwd": "${workspaceRoot}/build/"
            },
            "dependsOn": "Build current file"
        },
        {
            "label": "Run current file",
            "type": "shell",
            "command": "${workspaceRoot}/build/${fileBasenameNoExtension}",
            "options": {
                "cwd": "${workspaceRoot}/build/"
            }
        }
    ]
}
```

### Debugger configuration
`.vscode/launch.json`
```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "(gdb) Launch",
            "type": "cppdbg",
            "request": "launch",
            "program": "${workspaceRoot}/build/${fileBasenameNoExtension}",
            "args": [],
            "stopAtEntry": false,
            "cwd": "${workspaceRoot}/build/",
            "environment": [],
            "externalConsole": false,
            "MIMode": "gdb",
            "setupCommands": [
                {
                    "description": "Enable pretty-printing for gdb",
                    "text": "-enable-pretty-printing",
                    "ignoreFailures": true
                }
            ],
            "preLaunchTask": "Build current file"
        }
    ]
}
```

### Helper snippets
`.vscode/cpp.code-snippets`
```json
{
	"Insert fin": {
		"scope": "cpp",
		"prefix": "fin",
		"body": "ifstream fin(\"$TM_FILENAME_BASE.in\");\n"
	},
	"Insert fout": {
		"scope": "cpp",
		"prefix": "fout",
		"body": "ofstream fout(\"$TM_FILENAME_BASE.out\");\n"
	},
	"Insert pbinfo reference": {
		"scope": "cpp",
		"prefix": "pbinfo",
		"body": "// #$1 - $3 https://www.pbinfo.ro/?pagina=probleme&id=$1$0"
	}
}
```
