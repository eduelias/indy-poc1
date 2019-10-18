import io from 'socket.io';

export class SocketLogger implements Console {
  /**
   *
   */
  constructor(private socket: io.Socket) {}

  memory: any;
  assert(condition?: boolean, message?: string, ...data: any[]): void;
  assert(value: any, message?: string, ...optionalParams: any[]): void;
  assert(value?: any, message?: any, ...optionalParams: any[]) {
    throw new Error('Method not implemented.');
  }

  clear(): void;
  clear(): void;
  clear() {
    throw new Error('Method not implemented.');
  }

  count(label?: string): void;
  count(label?: string): void;
  count(label?: any) {
    throw new Error('Method not implemented.');
  }

  debug(message?: any, ...optionalParams: any[]): void;
  debug(message?: any, ...optionalParams: any[]): void;
  debug(message?: any, ...optionalParams: any[]) {
    throw new Error('Method not implemented.');
  }

  dir(value?: any, ...optionalParams: any[]): void;
  dir(obj: any, options?: NodeJS.InspectOptions): void;
  dir(obj?: any, options?: any, ...rest: any[]) {
    throw new Error('Method not implemented.');
  }

  dirxml(value: any): void;
  dirxml(...data: any[]): void;
  dirxml(value?: any, ...rest: any[]) {
    throw new Error('Method not implemented.');
  }

  error(message?: any, ...optionalParams: any[]): void;
  error(message?: any, ...optionalParams: any[]): void;
  error(message?: any, ...optionalParams: any[]) {
    throw new Error('Method not implemented.');
  }
  exception(message?: string, ...optionalParams: any[]): void {
    throw new Error('Method not implemented.');
  }
  group(groupTitle?: string, ...optionalParams: any[]): void;
  group(...label: any[]): void;
  group(groupTitle?: any, ...optionalParams: any[]) {
    throw new Error('Method not implemented.');
  }
  groupCollapsed(groupTitle?: string, ...optionalParams: any[]): void;
  groupCollapsed(...label: any[]): void;
  groupCollapsed(groupTitle?: any, ...optionalParams: any[]) {
    throw new Error('Method not implemented.');
  }
  groupEnd(): void;
  groupEnd(): void;
  groupEnd() {
    throw new Error('Method not implemented.');
  }
  info(message?: any, ...optionalParams: any[]): void;
  info(message?: any, ...optionalParams: any[]): void;
  info(message?: any, ...optionalParams: any[]) {
    throw new Error('Method not implemented.');
  }
  log(message?: any, ...optionalParams: any[]): void;
  log(message?: any, ...optionalParams: any[]): void;
  log(message?: any, ...optionalParams: any[]) {
    this.socket.emit('log', { message, optionalParams });
  }
  markTimeline(label?: string): void;
  markTimeline(label?: string): void;
  markTimeline(label?: any) {
    throw new Error('Method not implemented.');
  }
  profile(reportName?: string): void;
  profile(label?: string): void;
  profile(label?: any) {
    throw new Error('Method not implemented.');
  }
  profileEnd(reportName?: string): void;
  profileEnd(label?: string): void;
  profileEnd(label?: any) {
    throw new Error('Method not implemented.');
  }
  table(...tabularData: any[]): void;
  table(tabularData: any, properties?: string[]): void;
  table(tabularData?: any, properties?: any, ...rest: any[]) {
    throw new Error('Method not implemented.');
  }
  time(label?: string): void;
  time(label?: string): void;
  time(label?: any) {
    throw new Error('Method not implemented.');
  }
  timeEnd(label?: string): void;
  timeEnd(label?: string): void;
  timeEnd(label?: any) {
    throw new Error('Method not implemented.');
  }
  timeStamp(label?: string): void;
  timeStamp(label?: string): void;
  timeStamp(label?: any) {
    throw new Error('Method not implemented.');
  }
  timeline(label?: string): void;
  timeline(label?: string): void;
  timeline(label?: any) {
    throw new Error('Method not implemented.');
  }
  timelineEnd(label?: string): void;
  timelineEnd(label?: string): void;
  timelineEnd(label?: any) {
    throw new Error('Method not implemented.');
  }
  trace(message?: any, ...optionalParams: any[]): void;
  trace(message?: any, ...optionalParams: any[]): void;
  trace(message?: any, ...optionalParams: any[]) {
    throw new Error('Method not implemented.');
  }
  warn(message?: any, ...optionalParams: any[]): void;
  warn(message?: any, ...optionalParams: any[]): void;
  warn(message?: any, ...optionalParams: any[]) {
    throw new Error('Method not implemented.');
  }

  Console!: NodeJS.ConsoleConstructor;
  countReset(label?: string): void {
    throw new Error('Method not implemented.');
  }
  timeLog(label?: string, ...data: any[]): void {
    throw new Error('Method not implemented.');
  }
}
