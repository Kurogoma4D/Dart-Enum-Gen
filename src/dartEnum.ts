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
    return code.trimLeft();
  }

  private toWhenMethod(): string {
    const args = this.values
      .map((e) => `required T Function() ${e},`)
      .join('\n    ');
    const cases = this.values
      .map((e) => `case ${this.name}.${e}:\n        return ${e}();`)
      .join('\n      ');

    return `
  T when<T>({
    ${args}
  }) {
    switch (this) {
      ${cases}
    }
  }
`.trim();
  }
}
