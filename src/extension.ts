import * as vscode from 'vscode';
import StockBarController from './StockBarController';

let controller: StockBarController;

export function activate(context: vscode.ExtensionContext): void {
	controller = new StockBarController();
	controller.registerCommands(context);
}

export function deactivate(): void {
	controller?.dispose();
}
