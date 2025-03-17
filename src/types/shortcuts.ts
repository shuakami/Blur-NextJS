export type ShortcutCommand = 
  | 'TOGGLE_SIDEBAR'
  | 'NEW_CHAT'
  | 'DELETE_CHAT'
  | 'PREV_CHAT'
  | 'NEXT_CHAT'
  | 'TOGGLE_MODEL'
  | 'FOCUS_CHAT'
  | 'TOGGLE_COMMAND_CENTER'
  | 'DELETE_BOOK'

export interface ShortcutConfig {
  command: ShortcutCommand
  key: string
  description: string
  handler: () => void
  condition?: (event: KeyboardEvent) => boolean
}

export interface ShortcutManager {
  register: (config: ShortcutConfig) => void
  unregister: (command: ShortcutCommand) => void
  handleKeyDown: (event: KeyboardEvent) => void
  handleKeyUp?: (event: KeyboardEvent) => void
  setDisabled: (disabled: boolean) => void
}