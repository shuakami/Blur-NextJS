"use client"

import {useUser} from '@clerk/nextjs'
import React, {useState, useRef, useCallback} from 'react'
import {Button} from '@/components/ui/button'
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter} from '@/components/ui/dialog'
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import {Camera, Loader2} from 'lucide-react'
import {toast} from '@/hooks/ui/use-toast'
import Cropper from 'react-easy-crop'
import getCroppedImg, {Area} from '@/lib/utils/cropImage'
import {motion} from 'framer-motion'
import useTranslation from '@/hooks/i18n/useTranslation'

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

    const handleAvatarClick = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const target = e.target as HTMLInputElement;
            const file = target.files?.[0];
            if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreviewUrl(reader.result as string);
                    setCropping(true);
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    };

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
                        <AvatarImage 
                            onClick={handleAvatarClick} 
                            className="cursor-pointer hover:opacity-80" 
                            src={avatarUrl || '/default-avatar.png'} 
                            alt={t("用户头像")}
                        />
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
                        <DialogContent className="max-w-[600px] w-[450px] p-0 gap-0 overflow-hidden bg-white dark:bg-neutral-900 shadow-xl">
                            <DialogHeader className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
                                <DialogTitle className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                                    {t("更新个人信息")}
                                </DialogTitle>
                            </DialogHeader>

                            <motion.div
                                className="relative"
                                layout
                                transition={{duration: 0.2, ease: "easeInOut"}}
                            >
                                {cropping ? (
                                    // 裁剪界面
                                    <div className="p-6">
                                        <div className="relative w-full rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 
                                                      border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                                            <div className="h-[300px]">
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
                                            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
                                                <Button 
                                                    onClick={() => setCropping(false)}
                                                    variant="outline"
                                                    className="bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm"
                                                >
                                                    {t("取消")}
                                                </Button>
                                                <Button 
                                                    onClick={showCroppedImage}
                                                    className="bg-blue-500/90 hover:bg-blue-600/90 backdrop-blur-sm"
                                                >
                                                    {t("裁剪")}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    // 编辑界面
                                    <div className="px-6 py-4 space-y-6">
                                        <div className="flex flex-col items-center">
                                            <div className="relative group">
                                                <div className="relative w-24 h-24">
                                                    <Avatar className="w-full h-full ring-4 ring-white dark:ring-neutral-900">
                                                        <AvatarImage 
                                                            src={previewUrl || avatarUrl} 
                                                            alt={t("头像预览")}
                                                            className="object-cover cursor-pointer group-hover:opacity-80 group-hover:blur-sm transition-all duration-200"
                                                        />
                                                        <AvatarFallback>
                                                            {firstName?.[0]}{lastName?.[0]}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <button
                                                        onClick={handleAvatarClick}
                                                        className="absolute inset-0 flex items-center justify-center 
                                                                         rounded-full bg-white/0 opacity-0 group-hover:opacity-100 
                                                                         transition-all duration-200"
                                                    >
                                                        <div className="flex flex-col items-center gap-1">
                                                            <Camera className="h-6 w-6 text-neutral-700 dark:text-white" />
                                                            <span className="text-xs text-neutral-700 dark:text-white">
                                                                {t("更换头像")}
                                                            </span>
                                                        </div>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <Label htmlFor="firstName" className="block text-sm font-medium mb-1.5 
                                                                                    text-neutral-700 dark:text-neutral-300">
                                                    {t("名字 (First Name)")}
                                                </Label>
                                                <Input
                                                    id="firstName"
                                                    value={firstName}
                                                    onChange={(e) => setFirstName(e.target.value)}
                                                    className="w-full"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="lastName" className="block text-sm font-medium mb-1.5 
                                                                                   text-neutral-700 dark:text-neutral-300">
                                                    {t("姓氏 (Last Name)")}
                                                </Label>
                                                <Input
                                                    id="lastName"
                                                    value={lastName}
                                                    onChange={(e) => setLastName(e.target.value)}
                                                    className="w-full"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </motion.div>

                            <DialogFooter className="px-6 py-4 bg-neutral-50 dark:bg-neutral-800/50 
                                                   border-t border-neutral-200 dark:border-neutral-800">
                                <div className="flex justify-end gap-3 w-full">
                                    <Button 
                                        variant="outline" 
                                        onClick={() => setIsOpen(false)}
                                        disabled={loading}
                                        className="bg-white dark:bg-transparent"
                                    >
                                        {t("取消")}
                                    </Button>
                                    <Button 
                                        onClick={handleConfirm} 
                                        disabled={cropping}
                                        loading={loading}
                                        className="min-w-[100px] bg-blue-500 hover:bg-blue-600 
                                                 text-white dark:bg-blue-500 dark:hover:bg-blue-600 dark:text-neutral-100"
                                    >
                                        {t('确认更改')}
                                    </Button>
                                </div>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </div>
    )
}
