import * as vscode from 'vscode';
import Configuration from '../configuration';

export enum AssetType {
	Stock = 'stock',
	Future = 'future',
}

export interface AssetItem {
	type: AssetType;
	code: string;
	alias: string;
}

interface ManageQuickPickItem extends vscode.QuickPickItem {
	data: AssetItem;
	deleteAction: () => void;
}

export class StockManager {
	async removeAsset(asset: AssetItem) {
		if (asset.type == AssetType.Stock) {
			await this.removeStock(asset);
		} else if (asset.type == AssetType.Future) {
			await this.removeFuture(asset);
		} else {
			vscode.window.showWarningMessage(`未知资产类型：${asset.type}`);
		}
	}

	async removeStock(asset: AssetItem) {
		await this.removeFromConfigList(
			asset,
			Configuration.getStocks,
			'stocks',
			(item) => (typeof item === 'string' ? item : item.code),
		);
	}

	async removeFuture(asset: AssetItem) {
		await this.removeFromConfigList(
			asset,
			Configuration.getFutures,
			'futures',
			(item) => item.code,
		);
	}

	private async removeFromConfigList<T>(
		asset: AssetItem,
		getList: () => T[],
		updateKey: string,
		getCode: (item: T) => string | undefined,
	): Promise<boolean> {
		const currentList = getList() || [];
		const assetCodeLower = asset.code.toLowerCase();

		const configItemIndex = currentList.findIndex((item) => {
			const code = getCode(item)?.toLowerCase() ?? '';
			return code === assetCodeLower;
		});

		if (configItemIndex > -1) {
			currentList.splice(configItemIndex, 1);

			await Configuration.stockBarConfig().update(
				updateKey,
				currentList,
				vscode.ConfigurationTarget.Global,
			);

			const alias = asset.alias ?? asset.code;
			vscode.window.showInformationMessage(`已成功[删除]：${alias}`);
			return true;
		} else {
			vscode.window.showWarningMessage(`未找到：${asset.code}，删除失败`);
			return false;
		}
	}

	getAllAssets(): AssetItem[] {
		const stocks: AssetItem[] = Configuration.getStocks().map((s) => ({
			type: AssetType.Stock,
			code: typeof s === 'string' ? s : s.code,
			alias: typeof s === 'string' ? s : s.alias,
		}));
		const futures: AssetItem[] = Configuration.getFutures().map((f) => ({
			type: AssetType.Future,
			code: f.code,
			alias: f.alias,
		}));

		return [...stocks, ...futures];
	}

	private buildLabel(asset: AssetItem) {
		const labelText = asset.alias?.trim() ? asset.alias : asset.code;
		return `${asset.type === AssetType.Stock ? '📈' : '📊'} ${
			asset.code
		} (${labelText})`;
	}

	async showManageMenu() {
		const makeItem = (asset: AssetItem): ManageQuickPickItem => ({
			label: this.buildLabel(asset),
			description: asset.type === AssetType.Stock ? '股票' : '期货',
			data: asset,
			deleteAction: async () => {
				await this.removeAsset(asset);
				// 重新刷新列表
				await this.showManageMenu();
			},
		});

		const assets = this.getAllAssets();

		const stockItems = assets
			.filter((a) => a.type === AssetType.Stock)
			.map(makeItem);
		const futureItems = assets
			.filter((a) => a.type === AssetType.Future)
			.map(makeItem);

		const items: (ManageQuickPickItem | vscode.QuickPickItem)[] = [];

		if (stockItems.length > 0) {
			items.push({
				label: '──── 股票 ────',
				kind: vscode.QuickPickItemKind.Separator,
			} as any);
			items.push(...stockItems);
		}
		if (futureItems.length > 0) {
			items.push({
				label: '──── 期货 ────',
				kind: vscode.QuickPickItemKind.Separator,
			} as any);
			items.push(...futureItems);
		}

		const picker = vscode.window.createQuickPick<
			ManageQuickPickItem | vscode.QuickPickItem
		>();
		picker.items = items;
		picker.placeholder = '请选择要删除的股票或期货';
		picker.canSelectMany = false;

		picker.onDidAccept(async () => {
			const selected = picker.selectedItems[0];
			if (selected && 'deleteAction' in selected) {
				const confirm = await vscode.window.showWarningMessage(
					`确定要删除 ${selected.label} 吗？`,
					{ modal: true },
					'删除',
				);
				if (confirm === '删除') {
					selected.deleteAction();
					picker.hide();
				}
			}
		});

		picker.onDidHide(() => picker.dispose());
		picker.show();
	}

	public registerCommands(context: vscode.ExtensionContext): void {
		context.subscriptions.push(
			vscode.commands.registerCommand('stockbar.manage.assets', () => {
				this.showManageMenu();
			}),
		);
	}
}
