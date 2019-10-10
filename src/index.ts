import 'module-alias/register';

export class Issuer {
  public Issue(somethig: string): Promise<string> {
    const b = (c: string | PromiseLike<string> | undefined): string => `${c}`;
    return new Promise((a) => {
      return `${somethig} ${b('a')} Edu: ${a}`;
    });
  }
}
