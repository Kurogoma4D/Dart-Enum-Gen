import * as vscode from 'vscode';
import { EnumPatternMatchGenerator } from './enumPatternMatchGenerator';

export function activate(context: vscode.ExtensionContext) {
  const actions = vscode.languages.registerCodeActionsProvider(
    {
      language: 'dart',
      scheme: 'file',
    },
    new EnumPatternMatchGenerator(),
    {
      providedCodeActionKinds:
        EnumPatternMatchGenerator.providedCodeActionKinds,
    }
  );

  context.subscriptions.push(actions);
}

// this method is called when your extension is deactivated
export function deactivate() {}
