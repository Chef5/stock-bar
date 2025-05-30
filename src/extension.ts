import * as vscode from 'vscode';
import StockBarController from './StockBarController';
import { StockManager } from './vscode/stockManager';

const controller = new StockBarController();
const stockManager = new StockManager();

export function activate(context: vscode.ExtensionContext): void {
	controller.registerCommands(context);
	stockManager.registerCommands(context);
}

export function deactivate(): void {
	controller?.dispose();
}
