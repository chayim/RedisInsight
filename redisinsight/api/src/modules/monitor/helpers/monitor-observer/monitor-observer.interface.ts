import { IClientMonitorObserver } from '../client-monitor-observer/client-monitor-observer.interface';

export enum MonitorObserverStatus {
  Wait = 'wait',
  Ready = 'ready',
  End = 'end',
  Error = 'error',
}

export interface IMonitorObserver {
  status: MonitorObserverStatus;
  subscribe: (client: IClientMonitorObserver) => Promise<void>;
  unsubscribe: (id: string) => void;
  getSize: () => number;
  clear: () => void;
}