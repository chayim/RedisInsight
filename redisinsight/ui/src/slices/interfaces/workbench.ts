import { CommandExecution } from './api'

export interface StateWorkbenchSettings {
  wbClientUuid: string;
  loading: boolean;
  error: string;
  errorClient: string;
  unsupportedCommands: string[];
}

export interface StateWorkbenchResults {
  loading: boolean
  processing: boolean
  error: string
  items: CommandExecutionUI[]
}

export enum EnablementAreaComponent {
  CodeButton = 'code-button',
  Group = 'group',
  InternalLink = 'internal-link',
}

export interface IEnablementAreaItem {
  id: string,
  type: EnablementAreaComponent,
  label: string,
  children?: Record<string, IEnablementAreaItem>,
  args?: Record<string, any>,
}

export interface StateWorkbenchEnablementArea {
  loading: boolean;
  error: string;
  items: Record<string, IEnablementAreaItem>;
}

export interface CommandExecutionUI extends Partial<CommandExecution> {
  id?: string
  loading?: boolean
  isOpen?: boolean
  error?: string
  emptyCommand?: boolean
}

export enum RunQueryMode {
  Raw = 'RAW',
  ASCII = 'ASCII',
}

export enum ResultsMode {
  Default = 'DEFAULT',
  GroupMode = 'GROUP_MODE',
}

export interface ResultsSummary {
  total: number
  success: number
  fail: number
}

export interface ExecuteQueryParams {
  batchSize: number
  activeRunQueryMode: RunQueryMode
  resultsMode: ResultsMode
}
