"use client"

import {useUser} from '@clerk/nextjs'
import React, {useState, useRef, useCallback} from 'react'
import {Button} from '@/components/ui/button'
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter} from '@/components/ui/dialog'
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import {Camera, Loader2} from 'lucide-react'
import {toast} from "@/hooks/use-toast"
import Cropper from 'react-easy-crop'
import getCroppedImg, {Area} from '@/lib/cropImage'
import {motion} from 'framer-motion'
import useTranslation from "@/hooks/useTranslation"

export default function UpdateAvatar() {
    const {t} = useTranslation();
    const {user} = useUser()
    const [avatarUrl, setAvatarUrl] = useState(user?.imageUrl || '')
    const [lastName, setLastName] = useState(user?.lastName || '')
    const [firstName, setFirstName] = useState(user?.firstName || '')
    const [isOpen, setIsOpen] = useState(false)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [cropping, setCropping] = useState(false)
    const [crop, setCrop] = useState<{ x: number; y: number }>({x: 0, y: 0})
    const [zoom, setZoom] = useState<number>(1)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string)
                setCropping(true) // 打开裁剪界面
            }
            reader.readAsDataURL(file)
        }
    }

    const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels)
    }, [])

    const showCroppedImage = useCallback(async () => {
        if (!previewUrl || !croppedAreaPixels) return
        try {
            const croppedImage = await getCroppedImg(previewUrl, croppedAreaPixels)
            setPreviewUrl(croppedImage)
            setCropping(false)
        } catch (e) {
            console.error(e)
            toast({
                variant: "destructive",
                title: t("裁剪失败"),
                description: t("请重试。"),
            })
        }
    }, [previewUrl, croppedAreaPixels, t])

    const handleConfirm = async () => {
        setLoading(true);
        try {
            if (previewUrl) {
                setAvatarUrl(previewUrl);
                toast({
                    variant: "default",
                    title: t("正在上传图片"),
                    description: t("请耐心等一下..."),
                });

                // 将Base64字符串转换为Blob
                const response = await fetch(previewUrl);
                const blob = await response.blob();
                const file = new File([blob], "avatar.png", {type: blob.type});

                // 更新头像到Clerk
                await user?.setProfileImage({file});
            }

            // 更新名字到Clerk
            await user?.update({
                firstName,
                lastName,
            });

            toast({
                variant: "default",
                title: t("信息已更新"),
            });
            setIsOpen(false);
        } catch (error) {
            console.error(error);
            toast({
                variant: "destructive",
                title: t("更新失败"),
                description: t("上传过程中出现了问题，请稍后再试。"),
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 overflow-y-auto p-8">
            <div className="mx-auto max-w-2xl">
                <div className="mb-10 mt-4 text-center">
                    <Avatar className="w-24 h-24 mx-auto mb-4">
                        <AvatarImage src={avatarUrl || '/default-avatar.png'} alt={t("用户头像")}/>
                        <AvatarFallback>{firstName?.[0]}{lastName?.[0]}</AvatarFallback>
                    </Avatar>
                    <h2 className="text-lg font-medium text-black dark:text-white mb-2">
                        {firstName} {lastName}
                    </h2>
                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button variant="ghost"
                                    className="text-sm text-[#7B7B7B] hover:text-black dark:text-gray-400">
                                {t("更新个人信息")}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-[600px] w-[450px] dark:bg-gray-black/90">
                            <DialogHeader>
                                <DialogTitle className="dark:text-white">{t("更新个人信息")}</DialogTitle>
                            </DialogHeader>

                            <motion.div
                                className="py-6 space-y-4"
                                layout
                                transition={{duration: 0.2, ease: "easeInOut"}}  // 设置过渡效果
                            >
                                {cropping ? (
                                    <div className="relative w-full h-auto rounded">
                                        <div className="max-w-[290px] h-[260px]">
                                            <Cropper
                                                image={previewUrl || ''}
                                                crop={crop}
                                                zoom={zoom}
                                                aspect={1}
                                                zoomSpeed={0.04}
                                                onCropChange={setCrop}
                                                onZoomChange={setZoom}
                                                onCropComplete={onCropComplete}
                                                cropShape="round"
                                                showGrid={false}
                                            />
                                        </div>
                                        <div
                                            className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4 mt-6">
                                            <Button onClick={() => setCropping(false)}
                                                    variant="outline">{t("取消")}</Button>
                                            <Button onClick={showCroppedImage}>{t("裁剪")}</Button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex flex-col items-center">
                                            <div className="relative group">
                                                <Avatar
                                                    className="w-24 h-24 mb-2 cursor-pointer transition-opacity duration-200 group-hover:opacity-75">
                                                    <AvatarImage src={previewUrl || avatarUrl} alt={t("头像预览")}/>
                                                    <AvatarFallback>{firstName?.[0]}{lastName?.[0]}</AvatarFallback>
                                                </Avatar>
                                                <div
                                                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                                    onClick={() => fileInputRef.current?.click()}
                                                >
                                                    <Camera className="h-8 w-8 text-white"/>
                                                </div>
                                            </div>
                                            <Input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="hidden"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="firstName"
                                                   className="text-sm font-medium dark:text-gray-300">
                                                {t("名字 (First Name)")}
                                            </Label>
                                            <div className="flex mt-1">
                                                <Input
                                                    id="firstName"
                                                    value={firstName}
                                                    onChange={(e) => setFirstName(e.target.value)}
                                                    className="w-full"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <Label htmlFor="lastName"
                                                   className="text-sm font-medium dark:text-gray-300">
                                                {t("姓氏 (Last Name)")}
                                            </Label>
                                            <div className="flex mt-1">
                                                <Input
                                                    id="lastName"
                                                    value={lastName}
                                                    onChange={(e) => setLastName(e.target.value)}
                                                    className="w-full"
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}
                            </motion.div>

                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsOpen(false)}
                                        disabled={loading}>{t("取消")}</Button>
                                <Button onClick={handleConfirm} disabled={loading || cropping}>
                                    {loading ? (
                                        <>
                                            <Loader2 className="animate-spin h-4 w-4 mr-2"/>
                                            {t("正在更新...")}
                                        </>
                                    ) : (
                                        t('确认更改')
                                    )}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </div>
    )
}
