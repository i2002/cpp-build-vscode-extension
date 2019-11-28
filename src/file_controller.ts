import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { resolveCliPathFromVSCodeExecutablePath } from 'vscode-test';

export class FileController {
    // -> extensions
    private readonly extension_in = '.in';
    private readonly extension_out = '.out';
    private readonly extension_cpp = '.cpp';

    // -> editor layouts
    private readonly open_layout = {orientation: 0, groups: [{ size: 0.6 }, { groups: [{}, {}], size: 0.4  }]};
    private readonly normal_layout = {orientation: 0, groups: [{}]};

    // -> paths
    private readonly buildPath: string;

    // constructor
    constructor(buildPath: string)
    {
        this.buildPath = buildPath;
    }

    // open the run interface
    async open(name: string, reset: boolean): Promise<void> {       
        // manage files
        if(reset) {
            this.cleanBuildDir(name);
        }
        this.createIOFiles(name);

        if(!this.getIOOpen(name))
        {
            // setup layout
            await vscode.commands.executeCommand('vscode.setEditorLayout', this.open_layout);

            // open IO files
            const td_in = await vscode.workspace.openTextDocument(this.getIn(name));
            await vscode.window.showTextDocument(td_in, {preserveFocus: true, preview: false, viewColumn: 2});
    
            const td_out = await vscode.workspace.openTextDocument(this.getOut(name));
            await vscode.window.showTextDocument(td_out, {preserveFocus: true, preview: false, viewColumn: 3});
        }
    }

    // close the run interface
    async close(): Promise<void> {
        // return later to the initial active
        let active;
        if(vscode.window.activeTextEditor) {
            active = vscode.window.activeTextEditor.document;
        }

        // reset layout
        await vscode.commands.executeCommand('vscode.setEditorLayout', this.normal_layout);
        await vscode.commands.executeCommand("workbench.action.togglePanel");
        await vscode.commands.executeCommand('workbench.action.closeAllEditors');
        
        // return to the initial active
        if(active) {
            await vscode.window.showTextDocument(active, {preview: false, preserveFocus: false});
        }
    }

    // file operations
    private cleanBuildDir(name: string): void {
        // delete all files other than the current builds' ones
        fs.readdirSync(this.buildPath).forEach(file => {
            if(this.getName(file) != name) {
                fs.unlinkSync(this.buildPath + file);
            }
        });
    }

    private createIOFiles(name: string): void {
        fs.appendFileSync(this.getIn(name), "");
        fs.appendFileSync(this.getOut(name), "");
    }

    // status getters
    async getActiveSource(): Promise<string> {
        let file_open = vscode.window.activeTextEditor;

        // check if open
        if(file_open == undefined) {
            throw Error("No file open to build");
        }

        // check if cpp file with that name exits
        let file = file_open.document.fileName;
        let extension = file.slice(file.lastIndexOf('.'));
        if(file_open.document.languageId != "cpp")
        {
            if(extension != this.extension_in && extension != this.extension_out) {
                throw Error("Active file is not a C++ file");
            }
        
            // find and activate the coresponding cpp file
            let found = false;
            let editors = vscode.window.visibleTextEditors;
            for(let i = 0; i < editors.length; i++) {
                let editor_name = editors[i].document.fileName;
                if(this.getName(editor_name) == this.getName(file) && this.getExtension(editor_name) == this.extension_cpp) {
                    await vscode.window.showTextDocument(editors[i].document, {preview: false, preserveFocus: false, viewColumn: 1});
                    found = true;
                }
            }

            if(!found) {
                throw Error("Active file is not a C++ file");
            }
        }
    
        return this.getName(file_open.document.fileName);
    }

    private getIOOpen(name: string): boolean {
        if(!vscode.window.visibleTextEditors) {
            return false;
        }

        vscode.window.visibleTextEditors.forEach(editor => {
            let start = editor.document.fileName.lastIndexOf(path.sep);
            if(editor.document.fileName == this.getIn(name) || editor.document.fileName == this.getOut(name)) {
                return true;
            }
        });

        return false;
    }

    // helper getters
    private getName(pth: string): string {
        let start = pth.lastIndexOf(path.sep) + 1;
        let len = pth.lastIndexOf('.');
        return pth.slice(start, len);
    }

    private getExtension(pth: string): string {
        return pth.slice(pth.lastIndexOf('.'));
    }

    private getIn(name: string): string {
        return this.buildPath + name + this.extension_in;
    }

    private getOut(name: string): string {
        return this.buildPath + name + this.extension_out;
    }
}