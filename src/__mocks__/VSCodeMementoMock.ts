import { Memento } from 'vscode';

export default class VSCodeMementoMock implements Memento {
  private data: Record<string, any> = {};

  get<T>(key: string, defaultValue?: T): T | undefined {
    return Object.prototype.hasOwnProperty.call(this.data, key)
      ? this.data[key]
      : defaultValue;
  }

  update<T>(key: string, value: T) {
    this.data[key] = value;
    return { then: (fn: any) => fn() };
  }
}
