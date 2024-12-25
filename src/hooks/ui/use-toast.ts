// use-toast.ts

"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import type { ToastActionElement, ToastProps } from "@/components/ui/toast"

// 常量定义
const TOAST_LIMIT = 5
const TOAST_REMOVE_DELAY = 300

// 动作类型定义
enum ActionTypes {
    ADD_TOAST = "ADD_TOAST",
    UPDATE_TOAST = "UPDATE_TOAST",
    DISMISS_TOAST = "DISMISS_TOAST",
    REMOVE_TOAST = "REMOVE_TOAST",
}

// 类型定义
type ToasterToast = ToastProps & {
    id: string
    title?: React.ReactNode
    description?: React.ReactNode
    action?: ToastActionElement
    position?: number
}

type Action =
    | { type: ActionTypes.ADD_TOAST; toast: ToasterToast }
    | { type: ActionTypes.UPDATE_TOAST; toast: Partial<ToasterToast> & { id: string } }
    | { type: ActionTypes.DISMISS_TOAST; toastId?: string }
    | { type: ActionTypes.REMOVE_TOAST; toastId?: string }

// State 接口
interface State {
    toasts: ToasterToast[]
}

// ID 生成器（使用 UUID 以确保唯一性）
import { v4 as uuidv4 } from 'uuid'

const genId = (): string => uuidv4()

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
            type: ActionTypes.REMOVE_TOAST,
            toastId: toastId,
        })
    }, TOAST_REMOVE_DELAY)

    toastTimeouts.set(toastId, timeout)
}

// Reducer
const reducer = (state: State, action: Action): State => {
    switch (action.type) {
        case ActionTypes.ADD_TOAST:
            console.log('[Toast Reducer] Adding toast:', action.toast)
            return {
                ...state,
                toasts: [action.toast, ...state.toasts]
                    .slice(0, TOAST_LIMIT)
                    .map((toast, index) => ({
                        ...toast,
                        position: index
                    })),
            }

        case ActionTypes.UPDATE_TOAST:
            console.log('[Toast Reducer] Updating toast:', action.toast)
            return {
                ...state,
                toasts: state.toasts.map((t) =>
                    t.id === action.toast.id ? { ...t, ...action.toast } : t
                ),
            }

        case ActionTypes.DISMISS_TOAST: {
            const { toastId } = action
            console.log('[Toast Reducer] Dismissing toast:', toastId)

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

        case ActionTypes.REMOVE_TOAST:
            console.log('[Toast Reducer] Removing toast:', action.toastId)
            if (action.toastId === undefined) {
                return {
                    ...state,
                    toasts: [],
                }
            }
            return {
                ...state,
                toasts: state.toasts
                    .filter((t) => t.id !== action.toastId)
                    .map((toast, index) => ({
                        ...toast,
                        position: index
                    })),
            }

        default:
            return state
    }
}

const dispatch = (action: Action): void => {
    try {
        console.log('[Toast Dispatch]', action.type, action)
        memoryState = reducer(memoryState, action)
        listeners.forEach((listener) => {
            listener(memoryState)
        })
    } catch (error) {
        console.error('[Toast Dispatch] Error:', error)
    }
}

// Toast 类型和函数
type Toast = Omit<ToasterToast, "id">

interface ToastReturn {
    id: string
    dismiss: () => void
    update: (props: Partial<ToasterToast>) => void
}

function toast(props: Toast): ToastReturn {
    const id = genId()

    const update = (props: Partial<ToasterToast>): void => {
        if (!id) {
            console.error('[Toast] Update failed: Invalid ID')
            return
        }
        dispatch({
            type: ActionTypes.UPDATE_TOAST,
            toast: { ...props, id },
        })
    }

    const dismiss = (): void => {
        if (!id) {
            console.error('[Toast] Dismiss failed: Invalid ID')
            return
        }
        dispatch({ type: ActionTypes.DISMISS_TOAST, toastId: id })
    }

    try {
        dispatch({
            type: ActionTypes.ADD_TOAST,
            toast: {
                ...props,
                id,
                open: true,
                onOpenChange: (open: boolean) => {
                    if (!open) dismiss()
                },
            },
        })
    } catch (error) {
        console.error('[Toast] Error adding toast:', error)
    }

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
    const [state, setState] = useState<State>(memoryState)
    const isMounted = useRef<boolean>(false)

    useEffect(() => {
        isMounted.current = true
        listeners.add(setState)
        return () => {
            isMounted.current = false
            listeners.delete(setState)
        }
    }, [])

    const toastCallback = useCallback((props: Toast): ToastReturn => {
        return toast(props)
    }, [])

    const dismissCallback = useCallback((toastId?: string): void => {
        try {
            dispatch({ type: ActionTypes.DISMISS_TOAST, toastId })
        } catch (error) {
            console.error('[useToast] Error dismissing toast:', error)
        }
    }, [])

    return {
        ...state,
        toast: toastCallback,
        dismiss: dismissCallback,
    }
}

export { useToast, toast }
