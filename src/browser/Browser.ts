import * as open from 'open';

export interface Browser {
  open(url: string): void;
}

export class AnyBrowser implements Browser {
  constructor(private browser?: string) {}

  open(url: string): void {
    open(url, { url: true, app: this.browser });
  }
}
