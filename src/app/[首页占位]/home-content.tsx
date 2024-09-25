import React, {useState, useEffect} from 'react'
import useTranslation from "@/hooks/useTranslation";


export default function HomepageContent() {
    const [text, setText] = useState('')
    const {t} = useTranslation() // 获取 t 函数

    const prefix = "BLUR-AI >_\n"
    const translatedText = t('春风拂柳绿，明月照花新。')
    const fullText = prefix + translatedText

    useEffect(() => {
        let i = 0
        const typingEffect = setInterval(() => {
            if (i < fullText.length) {
                setText(fullText.slice(0, i + 1))
                i++
            } else {
                clearInterval(typingEffect)
            }
        }, 100)

        return () => clearInterval(typingEffect)
    }, [fullText])

    return (
        <div className="flex h-screen w-full items-center justify-center bg-transparent 2xl:ml-12 ml-[59px]">
            <div className="w-full max-w-4xl px-4">
                <div className="relative w-full flex justify-center">
                    <div className="relative w-[61.8%]">
                        <div className="absolute left-0 top-0 h-full w-px bg-gray-200 dark:bg-[#2A2A2A]"></div>
                        <div className="pl-6">
                            <pre
                                className="font-mono text-3xl-4xl font-bold leading-relaxed text-black dark:text-white">
                                {text.split('\n')[0]}
                            </pre>
                            <p className="mt-2 text-xl-2xl font-normal leading-relaxed text-black/60 dark:text-white/60">
                                {text.split('\n')[1]}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}