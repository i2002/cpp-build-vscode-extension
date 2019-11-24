import * as vscode from 'vscode'

export class BuildController {
    async buildAndRun(): Promise<void> {
        await vscode.commands.executeCommand("workbench.action.tasks.runTask", "Build and run current file");
    }

    async run(): Promise<void> {
        await vscode.commands.executeCommand("workbench.action.tasks.runTask", "Run current file");
    }
}