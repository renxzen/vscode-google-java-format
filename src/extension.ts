/*
 * Copyright 2020 Ilkka Poutanen
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
"use strict";
import * as vscode from "vscode";
import * as childProcess from "child_process";
Object.defineProperty(exports, "__esModule", { value: true });

const outputChannel = vscode.window.createOutputChannel("google-java-format");

/**
 * Runs google-java-format on a file and returns the newly formatted code as a
 * `vscode.TextEdit` against the original file contents. If it fails, the
 * rejection includes the parsed buildifier error messages as `err.diagnostics`.
 */
function runJavaFormat(input: any, token: any, editRange?: vscode.Range) {
	const extraArgs = vscode.workspace
		.getConfiguration("google-java-format")
		.get<string>("args");

	const aospMode = vscode.workspace
		.getConfiguration("google-java-format")
		.get<boolean>("aosp-mode");

	let args: Array<string> = [];

	if (extraArgs) {
		args = extraArgs.split(" ");
	}

	if (aospMode) {
		args.push("--aosp");
	}

	if (editRange) {
		args.push(`--lines=${editRange.start.line}:${editRange.end.line}`);
	}

	args.push("-");
	return new Promise((resolve, reject) => {
		var _a;
		const proc = childProcess.execFile(
			"google-java-format",
			args,
			(err, stdout, stderr) => {
				if (err) {
					reject(err);
				} else {
					resolve(stdout);
				}
			}
		);

		if (token) {
			token.onCancellationRequested(() => {
				proc.kill();
			});
		}

		(_a = proc.stdin) === null || _a === void 0 ? void 0 : _a.end(input);
	});
}

class Formatter {
	provideDocumentFormattingEdits(
		document: vscode.TextDocument,
		options: vscode.FormattingOptions,
		token: vscode.CancellationToken
	) {
		return this.runFormatter(document, token);
	}

	provideDocumentRangeFormattingEdits(
		document: vscode.TextDocument,
		range: vscode.Range,
		options: vscode.FormattingOptions,
		token: vscode.CancellationToken
	) {
		return this.runFormatter(document, token, range);
	}

	runFormatter(
		document: vscode.TextDocument,
		token: vscode.CancellationToken,
		range?: vscode.Range
	) {
		const input = document.getText();
		return runJavaFormat(input, token, range)
			.then((formatted) => {
				const wholeFileRange = new vscode.Range(
					document.positionAt(0),
					document.positionAt(input.length)
				);

				let formattedText = formatted as string;

				const useTabs = vscode.workspace
					.getConfiguration("google-java-format")
					.get<boolean>("use-tabs");

				if (useTabs) {
					const aospMode = vscode.workspace
						.getConfiguration("google-java-format")
						.get<boolean>("aosp-mode");

					const spaces = aospMode ? /    /g : /  /g;
					formattedText = formattedText.replace(spaces, "\t");
				}

				return [
					vscode.TextEdit.replace(
						wholeFileRange,
						formattedText as string
					),
				];
			})
			.catch((err) => {
				throw err;
			});
	}
}

/**
 * Registers google-java-format as the Java formatter when a Java file is
 * loaded.
 */
function registerFormatter() {
	const editProvider = new Formatter();
	const documentFilter = {
		language: "java",
		scheme: "file",
	};

	return vscode.Disposable.from(
		vscode.languages.registerDocumentFormattingEditProvider(
			documentFilter,
			editProvider
		),
		vscode.languages.registerDocumentRangeFormattingEditProvider(
			documentFilter,
			editProvider
		)
	);
}

/** Called when the extension is activated. */
function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(registerFormatter());
}

exports.activate = activate;
//# sourceMappingURL=java_format.js.map
