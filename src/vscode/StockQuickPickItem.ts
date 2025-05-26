import * as vscode from 'vscode';

export interface StockQuickPickItem extends vscode.QuickPickItem {
	action: () => void;
}
