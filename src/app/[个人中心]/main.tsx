import {useUser} from "@clerk/nextjs";
import {toast} from '../../hooks/ui/use-toast';
import * as React from "react";
import UpdateAvatar from "@/app/[个人中心]/modal/update_avatar";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Check, X} from "lucide-react";
import {useState} from "react";
import {GitHubLogoIcon} from "@radix-ui/react-icons";
import useTranslation from '../../hooks/i18n/useTranslation';

export const PersonalCenterMain: React.FC = () => {
    const {t} = useTranslation();
    const {user, isLoaded} = useUser(); // 从 Clerk 中获取用户数据
    const userId = user?.id;
    const [showId, setShowId] = useState(false);
    const [isEditingUsername, setIsEditingUsername] = useState(false);
    const [isEditingEmail, setIsEditingEmail] = useState(false);
    const [username, setUsername] = useState(user?.username || t('还没有名字')); // 使用 Clerk 的用户名
    const [email, setEmail] = useState(user?.primaryEmailAddress?.emailAddress || "unknown@example.com"); // 使用 Clerk 的邮箱
    const [newUsername, setNewUsername] = useState(username);
    const [newEmail, setNewEmail] = useState(email);

    const handleUsernameSubmit = async () => {
        if (!isLoaded || !user) return; // 确保用户数据已经加载，并且 user 存在

        try {
            await user.update({username: newUsername}); // 使用 Clerk 更新用户名
            setUsername(newUsername);
            setIsEditingUsername(false);
            toast({
                title: t("用户名已更新"),
                description: t("新的用户名是") + ` ${newUsername}`,
                variant: "success",
            });
        } catch (error: unknown) {
            let errorMessage = t("无法更新用户名，请稍后再试。");

            if (error instanceof Error && (error as any).errors && (error as any).errors[0]) {
                const errorCode = (error as any).errors[0].code;

                if (errorCode === "form_username_invalid_length") {
                    errorMessage = t("用户名必须在 4 到 64 个字符之间。");
                } else if (errorCode === "form_username_needs_non_number_char") {
                    errorMessage = t("用户名必须包含至少一个非数字字符。");
                }
            }

            toast({
                title: t("更新失败"),
                description: errorMessage,
                variant: "destructive",
            });
        }
    };

    // 更新邮箱的提交处理
    const handleEmailSubmit = async () => {
        if (!isLoaded || !user) return; // 确保用户数据已经加载，并且 user 存在

        try {
            const existingEmail = user.emailAddresses.find(
                (emailAddress) => emailAddress.emailAddress === newEmail
            );

            if (existingEmail) {
                toast({
                    title: t("邮箱已存在"),
                    description: t("邮箱") + ` ${newEmail} ` + t("已经存在（被占用），请使用其他邮箱。"),
                    variant: "destructive",
                });
                return;
            }

            const emailAddress = await user.createEmailAddress({email: newEmail});

            if (emailAddress) {
                await emailAddress.prepareVerification({
                    strategy: "email_link",
                    redirectUrl: "/",
                });
                setEmail(newEmail);
                setIsEditingEmail(false);
                toast({
                    title: t("邮箱地址已更新"),
                    description: t("已发送验证邮件至") + ` ${newEmail}`,
                    variant: "success",
                });
            }
        } catch (error) {
            toast({
                title: t("更新失败"),
                description: t("无法更新邮箱，请稍后再试。"),
                variant: "destructive",
            });
        }
    };

    return (
        <div className="flex-1 overflow-y-auto p-8">
            <div className="mx-auto max-w-2xl">

                {/* 头像 */}
                <UpdateAvatar/>

                <div className="space-y-8">
                    <div className="border-b border-gray-100 dark:border-gray-900 pb-6">
                        <h3 className="text-sm font-medium text-black dark:text-white mb-2">{t("用户名")}</h3>
                        {isEditingUsername ? (
                            <div className="space-y-2 transition-opacity duration-200 ease-in-out opacity-100">
                                <div className="flex items-center space-x-2">
                                    <Input
                                        value={newUsername}
                                        onChange={(e) => setNewUsername(e.target.value)}
                                        className="max-w-xs dark:bg-gray-800 dark:text-white"
                                    />
                                    <Button size="icon" variant="ghost" onClick={handleUsernameSubmit}>
                                        <Check className="h-4 w-4"/>
                                    </Button>
                                    <Button size="icon" variant="ghost"
                                            onClick={() => setIsEditingUsername(false)}>
                                        <X className="h-4 w-4"/>
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="transition-opacity duration-200 ease-in-out opacity-100">
                                <p className="text-base text-black dark:text-white mb-2">
                                    {username}{' '}
                                    <span className={`text-xs mb-2 transition-all ease-in-out duration-200 ${
                                        showId ? 'text-black/90 dark:text-white/90 select-text' : 'text-[#FCFCFC] dark:text-[#151515] select-none'
                                    }`}>
                                        &lt;{userId}&gt;
                                    </span>
                                </p>
                                <Button
                                    variant="link"
                                    className="text-sm text-[#747474] dark:text-[#B5B5B5] p-0 h-auto"
                                    onClick={() => setIsEditingUsername(true)}
                                >
                                    {t("更新用户名")}
                                </Button>
                                <Button
                                    variant="link"
                                    className="text-sm text-[#747474] dark:text-[#B5B5B5] p-0 h-auto mx-3"
                                    onClick={() => setShowId(!showId)}
                                >
                                    {t("显示id")}
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* 电子邮件地址 */}
                    <div className="border-b border-gray-100 dark:border-gray-900 pb-6">
                        <h3 className="text-sm font-medium text-black dark:text-white mb-2">{t("电子邮件地址")}</h3>
                        {isEditingEmail ? (
                            <div className="space-y-2 transition-opacity duration-200 ease-in-out opacity-100">
                                <div className="flex items-center space-x-2">
                                    <Input
                                        value={newEmail}
                                        onChange={(e) => setNewEmail(e.target.value)}
                                        className="max-w-xs dark:bg-gray-800 dark:text-white"
                                    />
                                    <Button size="icon" variant="ghost" onClick={handleEmailSubmit}>
                                        <Check className="h-4 w-4"/>
                                    </Button>
                                    <Button size="icon" variant="ghost"
                                            onClick={() => setIsEditingEmail(false)}>
                                        <X className="h-4 w-4"/>
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="transition-opacity duration-200 ease-in-out opacity-100">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-base text-black dark:text-white">{email}</p>
                                    <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                        {t("主要")}
                                    </span>
                                </div>
                                <Button
                                    variant="link"
                                    className="text-sm text-[#747474] dark:text-[#B5B5B5] p-0 h-auto"
                                    onClick={() => setIsEditingEmail(true)}
                                >
                                    {t("添加电子邮件地址")}
                                </Button>
                            </div>
                        )}
                    </div>
                    {/* 连接的账户 */}
                    <div>
                        <h3 className="text-sm font-medium text-black dark:text-white mb-2">{t("链接的账户（未实装）")}</h3>
                        <div className="flex items-center mb-2">
                            <GitHubLogoIcon
                                height={22}
                                width={22}
                                className="mr-2"
                            />
                            <p className="text-base text-black dark:text-white">Github</p>
                        </div>
                        <button className="text-sm text-[#747474] dark:text-[#B5B5B5] hover:underline">
                            {t("连接账户")}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
