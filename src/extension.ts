import * as vscode from 'vscode';
import * as childProcess from 'child_process';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {

	// slotchmodコマンドを登録
	const disposable = vscode.commands.registerCommand(
		'slotchmod-for-vscode.slotchmod',
		async () => {

			// ユーザーにディレクトリを選択させる
			const uri = await vscode.window.showOpenDialog({
				canSelectFolders: true,
				canSelectFiles: true,
				canSelectMany: false,
				openLabel: 'Select Directory or File'
			});

			if (!uri) { return; }

			const targetPath = uri[0].path;

			// WebViewを開く
			const panel = vscode.window.createWebviewPanel(
				'slotchmod',
				`🎰 ${uri[0].path}`,
				vscode.ViewColumn.One,
				{
					enableScripts: true
				}
			);

			// WebViewに表示するHTMLを生成
			panel.webview.html = getWebviewContent(panel.webview, context.extensionUri);

			// WebViewがメッセージを受信した時の処理
			panel.webview.onDidReceiveMessage(
				message => {
					switch (message.command) {
						case 'slotchmod':
							const reelStates = message.payload.reelStates as number[];
							const chmodPermissions = reelStates.join('');

							// ゾロ目かどうかを判定
							const isZorome = new Set(reelStates).size === 1;

							// consoleのコマンドを生成する
							const command = `chmod ${chmodPermissions} ${targetPath}`;

							// コマンドを実行
							childProcess.exec(command, (error, stdout, stderr) => {
								// エラーが無ければ実行した事を通知
								if (!error) {
									if (isZorome) {
										vscode.window.showInformationMessage(`🎉🎉🎉 おめでとう！！ ${command} を実行しました！！ 🎉🎉🎉`);
									} else {
										vscode.window.showInformationMessage(`${command} を実行しました`);
									}
								}
								if (error) {
									vscode.window.showInformationMessage('エラーが発生しました');
									console.error(`exec error: ${error}`);
									return;
								}
							});
							return;
					}
				},
				undefined,
				context.subscriptions
			);

			// WebViewにtargetPathを送信
			panel.webview.postMessage({ command: 'setTargetPath', targetPath });
		});

	context.subscriptions.push(disposable);
}

// Webview側で使用できるようにuriに変換する関数
function getUri(
	webview: vscode.Webview,
	extensionUri: vscode.Uri,
	pathList: string[]
) {
	// vscode.Uri.joinPath は、利用できなくなったため、path.join を使用
	return webview.asWebviewUri(vscode.Uri.file(path.join(extensionUri.fsPath, ...pathList)));
}

// Nonceを生成する関数
function getNonce() {
	let text = "";
	const possible =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}

// WebViewに表示するHTMLを生成
function getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri) {
	const webviewUri = getUri(webview, extensionUri, ["dist", "webview.js"]);
	const nonce = getNonce();

	return `<!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Cat Coding</title>
                </head>
                <body>
                    <div id="app"></div>
                    <script type="module" nonce="${nonce}" src="${webviewUri}"></script>
                </body>
            </html>`;
}

// This method is called when your extension is deactivated
export function deactivate() { }