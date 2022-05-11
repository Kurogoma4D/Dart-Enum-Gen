import * as vscode from 'vscode';
import DartEnum from './dartEnum';

export class EnumPatternMatchGenerator implements vscode.CodeActionProvider {
  public provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range | vscode.Selection,
    context: vscode.CodeActionContext,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<(vscode.CodeAction | vscode.Command)[]> {
    const action = this.generatePatternMatch(document, range);

    if (!action) {
      return [];
    }

    return [action];
  }

  public static readonly providedCodeActionKinds = [
    vscode.CodeActionKind.Refactor,
    vscode.CodeActionKind.QuickFix,
    vscode.CodeActionKind.Empty,
  ];

  private generatePatternMatch(
    document: vscode.TextDocument,
    range: vscode.Range
  ): vscode.CodeAction | null {
    const fix = new vscode.CodeAction(
      'Generate Pattern-Match methods',
      vscode.CodeActionKind.Refactor
    );

    const wordRange = document.getWordRangeAtPosition(range.start);

    if (!wordRange) {
      return null;
    }

    const cursorLine = document.lineAt(range.start.line);

    if (!cursorLine || !cursorLine.text.includes('enum')) {
      return null;
    }

    var rawInput = cursorLine.text;
    var line = range.start.line;
    while (!rawInput.includes('}')) {
      line++;
      rawInput += document.lineAt(line).text;
    }

    fix.edit = new vscode.WorkspaceEdit();

    const dartEnum = DartEnum.fromString(rawInput);

    if (!dartEnum) {
      return null;
    }

    fix.edit.insert(
      document.uri,
      new vscode.Position(line + 1, 0),
      dartEnum.toDartCode()
    );

    return fix;
  }
}
