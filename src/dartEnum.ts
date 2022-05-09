import { TextDocument, Range, Position } from 'vscode';

export default class DartEnum {
  name: string;
  values: string[];
  range: Range;

  constructor(name: string, values: string[], range: Range) {
    this.name = name;
    this.values = values;
    this.range = range;
  }

  static fromString(input: TextDocument): DartEnum | null {
    const enumPattern = /(?<=(enum\s))([A-Z][a-zA-Z0-9{,\s\S]*?})/;
    const text = input.getText();
    const match = text.match(enumPattern);

    // TODO: カーソルに一番近いenumを取り出す
    // TODO: enumの下にextensionを出せるようにする

    if (!match) {
      return null;
    }

    const rawEnum = match[0];
    const elements = rawEnum.split(/[{}]/);

    if (elements.length !== 3) {
      return null;
    }

    const name = elements[0];
    const values = this.extractValues(elements[1]);

    return new DartEnum(
      name.trim(),
      values,
      new Range(new Position(0, 0), new Position(0, 0))
    );
  }

  private static extractValues(input: string): string[] {
    return input.split(',').map((e) => e.trim());
  }

  toDartCode(): string {
    const code = `
extension ${this.name}PatternMatch on ${this.name} {
  ${this.toWhenMethod()}
}
`;
    return code;
  }

  private toWhenMethod(): string {
    var template = 'T when<T>({\n';
    for (const value of this.values) {
      template += `    required T Function() ${value},\n`;
    }
    template += '  }) {\n    switch (this) {\n';
    for (const value of this.values) {
      template += `      case ${this.name}.${value}:\n`;
      template += `        return ${value}();\n`;
    }
    template += '    }\n  }\n';
    return template;
  }
}
