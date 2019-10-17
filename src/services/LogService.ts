export class LogService {
  public log(message: any): void {
    console.log(message);
  }

  public trace(message: any): void {
    console.trace(message);
  }
}
