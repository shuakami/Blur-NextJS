"use client"

import * as React from "react"
import type { ToastActionElement, ToastProps } from "@/components/ui/toast"

// 常量定义
const TOAST_LIMIT = 3
const TOAST_REMOVE_DELAY = 1000000

// 类型定义
type ToasterToast = ToastProps & {
    id: string
    title?: React.ReactNode
    description?: React.ReactNode
    action?: ToastActionElement
}

const actionTypes = {
    ADD_TOAST: "ADD_TOAST",
    UPDATE_TOAST: "UPDATE_TOAST",
    DISMISS_TOAST: "DISMISS_TOAST",
    REMOVE_TOAST: "REMOVE_TOAST",
} as const

// ID 生成器
let count = 0
const genId = (): string => {
    count = (count + 1) % Number.MAX_SAFE_INTEGER
    return count.toString()
}

// Action 类型定义
type ActionType = typeof actionTypes
type Action =
    | { type: ActionType["ADD_TOAST"]; toast: ToasterToast }
    | { type: ActionType["UPDATE_TOAST"]; toast: Partial<ToasterToast> }
    | { type: ActionType["DISMISS_TOAST"]; toastId?: ToasterToast["id"] }
    | { type: ActionType["REMOVE_TOAST"]; toastId?: ToasterToast["id"] }

// State 接口
interface State {
    toasts: ToasterToast[]
}

// 状态管理
let memoryState: State = { toasts: [] }
const listeners = new Set<(state: State) => void>()

// 超时管理
const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const addToRemoveQueue = (toastId: string): void => {
    if (toastTimeouts.has(toastId)) {
        return
    }

    const timeout = setTimeout(() => {
        toastTimeouts.delete(toastId)
        dispatch({
            type: "REMOVE_TOAST",
            toastId: toastId,
        })
    }, TOAST_REMOVE_DELAY)

    toastTimeouts.set(toastId, timeout)
}

// Reducer
const reducer = (state: State, action: Action): State => {
    switch (action.type) {
        case "ADD_TOAST":
            return {
                ...state,
                toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
            }

        case "UPDATE_TOAST":
            return {
                ...state,
                toasts: state.toasts.map((t) =>
                    t.id === action.toast.id ? { ...t, ...action.toast } : t
                ),
            }

        case "DISMISS_TOAST": {
            const { toastId } = action

            if (toastId) {
                addToRemoveQueue(toastId)
            } else {
                state.toasts.forEach((toast) => {
                    addToRemoveQueue(toast.id)
                })
            }

            return {
                ...state,
                toasts: state.toasts.map((t) =>
                    t.id === toastId || toastId === undefined
                        ? {
                            ...t,
                            open: false,
                        }
                        : t
                ),
            }
        }

        case "REMOVE_TOAST":
            if (action.toastId === undefined) {
                return {
                    ...state,
                    toasts: [],
                }
            }
            return {
                ...state,
                toasts: state.toasts.filter((t) => t.id !== action.toastId),
            }
    }
}

const dispatch = (action: Action): void => {
    memoryState = reducer(memoryState, action)
    listeners.forEach((listener) => {
        listener(memoryState)
    })
}

// Toast 类型和函数
type Toast = Omit<ToasterToast, "id">

interface ToastReturn {
    id: string
    dismiss: () => void
    update: (props: ToasterToast) => void
}

function toast(props: Toast): ToastReturn {
    const id = genId()

    const update = (props: ToasterToast): void =>
        dispatch({
            type: "UPDATE_TOAST",
            toast: { ...props, id },
        })

    const dismiss = (): void => dispatch({ type: "DISMISS_TOAST", toastId: id })

    dispatch({
        type: "ADD_TOAST",
        toast: {
            ...props,
            id,
            open: true,
            onOpenChange: (open: boolean) => {
                if (!open) dismiss()
            },
        },
    })

    return {
        id,
        dismiss,
        update,
    }
}

// Hook
interface UseToastReturn extends State {
    toast: (props: Toast) => ToastReturn
    dismiss: (toastId?: string) => void
}

function useToast(): UseToastReturn {
    const [state, setState] = React.useState<State>(memoryState)

    React.useEffect(() => {
        listeners.add(setState)
        return () => {
            listeners.delete(setState)
        }
    }, [])

    return {
        ...state,
        toast,
        dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
    }
}

export { useToast, toast }