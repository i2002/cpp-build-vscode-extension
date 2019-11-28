// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import { FileController } from './file_controller';
import { BuildController } from './build_controller';
import { PbinfoProvider} from './pbinfo_document';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	if(!vscode.workspace.workspaceFolders) {
		throw Error("Need to open a folder first");
	}
	const buildPath: string = vscode.workspace.workspaceFolders[0].uri.fsPath + `${path.sep}build${path.sep}`;

	// controllers
	const file_controller = new FileController(buildPath);
	const build_controller = new BuildController();

	// register a content provider for the pbinfo-scheme
	const scheme = 'pbinfo';
	const provider = new PbinfoProvider();
	context.subscriptions.push(vscode.workspace.registerTextDocumentContentProvider(scheme, provider));


	// commands
	let buildAndRun = vscode.commands.registerCommand('extension.buildAndRun', async () => {
		try {
			let name = await file_controller.getActiveSource();
			await file_controller.open(name, true);
			await build_controller.buildAndRun();
		} catch(e) {
			await vscode.window.showErrorMessage(e.toString());
		}
	});

	let run = vscode.commands.registerCommand('extension.run', async () => {
		try {
			let name = await file_controller.getActiveSource();
			await file_controller.open(name, false);
			await build_controller.run();
		} catch(e) {
			vscode.window.showErrorMessage(e);
		}
	});

	let close = vscode.commands.registerCommand('extension.close', async () => {
		await file_controller.close();
	});

	let pbinfo = vscode.commands.registerCommand('extension.pbinfo', async () => {
		let what = await vscode.window.showInputBox({ placeHolder: 'Numarul problemei...' });
		if (what) {
			let uri = vscode.Uri.parse('pbinfo:' + what);
			let doc = await vscode.workspace.openTextDocument(uri); // calls back into the provider
			await vscode.window.showTextDocument(doc, { preview: false, preserveFocus: true, viewColumn: 2 });
			await vscode.languages.setTextDocumentLanguage(doc, "markdown");
		}
	});

	context.subscriptions.push(buildAndRun);
	context.subscriptions.push(run);
	context.subscriptions.push(close);
	context.subscriptions.push(pbinfo);
}

// this method is called when your extension is deactivated
export function deactivate() {}
