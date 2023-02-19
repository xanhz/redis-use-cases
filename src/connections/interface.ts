export interface Connection {
  init(): Promise<any>
  destroy(): Promise<any>
}
