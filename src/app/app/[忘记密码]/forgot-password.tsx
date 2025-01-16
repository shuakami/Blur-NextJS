'use client'

import React, { useState } from 'react'
import { useSignIn } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'

const ForgotPasswordPage: React.FC = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [code, setCode] = useState('')
    const [successfulCreation, setSuccessfulCreation] = useState(false)
    const [secondFactor, setSecondFactor] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const router = useRouter()
    const { isLoaded, signIn, setActive } = useSignIn()

    if (!isLoaded) {
        return null
    }

    const sendResetCode = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await signIn?.create({
                strategy: 'reset_password_email_code',
                identifier: email,
            })
            setSuccessfulCreation(true)
            setError(null)
        } catch (err: any) {
            setError(err.errors?.[0]?.longMessage || '发送失败，请重试。')
        }
    }

    const resetPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const result = await signIn?.attemptFirstFactor({
                strategy: 'reset_password_email_code',
                code,
                password,
            })

            if (result?.status === 'needs_second_factor') {
                setSecondFactor(true)
                setError(null)
            } else if (result?.status === 'complete') {
                await setActive({ session: result.createdSessionId })
                router.push('/')
            } else {
                console.error('Unknown result', result)
            }
        } catch (err: any) {
            setError(err.errors?.[0]?.longMessage || '重置失败，请重试。')
        }
    }

    return (
        <div className="w-full max-w-md mx-auto mt-16 p-8 bg-white dark:bg-[#181818] shadow-lg rounded">
            <h1 className="text-2xl font-semibold mb-6">忘记密码</h1>
            <form onSubmit={!successfulCreation ? sendResetCode : resetPassword} className="space-y-4">
                {!successfulCreation && (
                    <>
                        <label htmlFor="email" className="block text-sm font-medium mb-1">
                            请输入你的邮箱地址
                        </label>
                        <Input
                            type="email"
                            id="email"
                            placeholder="e.g. john@doe.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <Button type="submit" className="w-full">发送验证码</Button>
                        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                    </>
                )}

                {successfulCreation && (
                    <>
                        <label htmlFor="password" className="block text-sm font-medium mb-1">
                            请输入你的新密码
                        </label>
                        <Input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <label htmlFor="code" className="block text-sm font-medium mb-1">
                            请输入发到你邮箱的验证码
                        </label>
                        <Input
                            type="text"
                            id="code"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            required
                        />

                        <Button type="submit" className="w-full">重置密码</Button>
                        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                    </>
                )}

                {secondFactor && <p className="text-red-500 text-sm">需要进行二次验证，但当前 UI 不支持该操作。</p>}
            </form>
        </div>
    )
}

export default ForgotPasswordPage
