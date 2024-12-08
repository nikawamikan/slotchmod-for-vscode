import * as vscode from 'vscode';
import * as childProcess from 'child_process';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {

	// Destroyコマンドを登録
	const disposable = vscode.commands.registerCommand('slotchmod-for-vscode.destroy', () => {

		// WebViewを開く
		const panel = vscode.window.createWebviewPanel(
			'destroy',
			'Destroy',
			vscode.ViewColumn.One,
			{
				enableScripts: true
			}
		);

		// WebViewに表示するHTMLを生成
		panel.webview.html = getWebviewContent(panel.webview, context.extensionUri);

		// WebViewからのメッセージを受信
		panel.webview.onDidReceiveMessage(
			message => {
				switch (message.command) {
					case 'destroy':
						// consoleのコマンドを実行する
						const command = "echo 'バルス'";

						// コマンドを実行
						childProcess.exec(command, (error, stdout, stderr) => {
							if (error) {
								console.error(`exec error: ${error}`);
								return;
							}
							if (stdout) {
								console.log(`stdout: ${stdout}`);
								return;
							}
						});
						return;
				}
			},
			undefined,
			context.subscriptions
		);

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