export type NotificationType = "success" | "info" | "warning" | "error"

export type PinnedNotification = {
  id: string
  message: string
  type: NotificationType
  timestamp: number
}

type Listener = (notification: PinnedNotification | null) => void
type RefreshListener = () => void

let currentNotification: PinnedNotification | null = null
const listeners: Set<Listener> = new Set()
const refreshListeners: Set<RefreshListener> = new Set()

export const notifyHeader = (message: string, type: NotificationType = "success") => {
  currentNotification = {
    id: Math.random().toString(36).substring(2, 9),
    message,
    type,
    timestamp: Date.now()
  }
  listeners.forEach((listener) => listener(currentNotification))
  triggerNotificationRefresh()
}

export const clearHeaderNotification = () => {
  currentNotification = null
  listeners.forEach((listener) => listener(null))
}

export const subscribeHeaderNotification = (listener: Listener) => {
  listeners.add(listener)
  listener(currentNotification)
  return () => {
    listeners.delete(listener)
  }
}

export const triggerNotificationRefresh = () => {
  refreshListeners.forEach((listener) => listener())
}

export const subscribeNotificationRefresh = (listener: RefreshListener) => {
  refreshListeners.add(listener)
  return () => {
    refreshListeners.delete(listener)
  }
}
