import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

const player = require('play-sound')();

let lastPlayed = 0;
const cooldown = 2000; // 2 seconds

export function activate(context: vscode.ExtensionContext) {

	console.log('Terminal Error Sound extension is active!');

	const disposable = vscode.window.onDidCloseTerminal((terminal) => {

		const config = vscode.workspace.getConfiguration('terminalErrorSound');
		const isEnabled = config.get<boolean>('enabled', true);
		const selectedSound = config.get<string>('soundType', 'error.mp3');
		const customSoundPath = config.get<string>('customSoundPath', '');

		if (!isEnabled) return;

		const exitStatus = terminal.exitStatus;
		if (!exitStatus) return;	

		// Non-zero exit code means error
		if (exitStatus.code && exitStatus.code !== 0) {

			const now = Date.now();
			if (now - lastPlayed > cooldown) {

				let soundToPlay: string;

				// Use custom sound if provided and exists
				if (customSoundPath && fs.existsSync(customSoundPath)) {
					soundToPlay = customSoundPath;
				} else {
					// fallback to built-in sound
					soundToPlay = path.join(context.extensionPath, 'media', selectedSound);
				}

				player.play(soundToPlay, (err: any) => {
					if (err) {
						console.error("Sound playback error:", err);
					}
				});

				lastPlayed = now;
			}
		}
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}