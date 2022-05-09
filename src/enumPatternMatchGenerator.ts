import * as vscode from 'vscode';
import DartEnum from './dartEnum';

export class EnumPatternMatchGenerator implements vscode.CodeActionProvider {
  public provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range | vscode.Selection,
    context: vscode.CodeActionContext,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<(vscode.CodeAction | vscode.Command)[]> {
    console.log('prepare...');
    const action = this.generatePatternMatch(document, range);

    if (!action) {
      return [];
    }

    console.log('generated action.');

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

    fix.edit = new vscode.WorkspaceEdit();

    // TODO: Dartコードをとってきてenumの下にextension生やす
    const dartEnum = DartEnum.fromString(document);

    if (!dartEnum) {
      return null;
    }

    fix.edit.insert(document.uri, dartEnum.range.end, dartEnum.toDartCode());
    // fix.edit.insert(document.uri, new vscode.Position(行（enumの下）, 0), '');

    return fix;
  }
}
