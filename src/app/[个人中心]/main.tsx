import {useUser} from "@clerk/nextjs";
import {toast} from "@/hooks/use-toast";
import * as React from "react";
import UpdateAvatar from "@/app/[个人中心]/modal/update_avatar";
import {motion, AnimatePresence, LayoutGroup} from "framer-motion";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Check, X} from "lucide-react";
import {useState} from "react";
import {GitHubLogoIcon} from "@radix-ui/react-icons";

export const PersonalCenterMain: React.FC = () => {
    const {user, isLoaded} = useUser(); // 从 Clerk 中获取用户数据
    const userId = user?.id;
    const [showId, setShowId] = useState(false);
    const [isEditingUsername, setIsEditingUsername] = useState(false);
    const [isEditingEmail, setIsEditingEmail] = useState(false);
    const [username, setUsername] = useState(user?.username || "shuakami0303"); // 使用 Clerk 的用户名
    const [email, setEmail] = useState(user?.primaryEmailAddress?.emailAddress || "shuakami@sdjz.wiki"); // 使用 Clerk 的邮箱
    const [newUsername, setNewUsername] = useState(username);
    const [newEmail, setNewEmail] = useState(email);

    // 更新用户名的提交处理
    const handleUsernameSubmit = async () => {
        if (!isLoaded || !user) return; // 确保用户数据已经加载，并且 user 存在

        try {
            await user.update({username: newUsername}); // 使用 Clerk 更新用户名
            setUsername(newUsername);
            setIsEditingUsername(false);
            toast({
                title: "用户名已更新",
                description: `新的用户名是 ${newUsername}`,
                variant: "success",
            });
        } catch (error) {
            toast({
                title: "更新失败",
                description: "无法更新用户名，请稍后再试。",
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
                    title: "邮箱已存在",
                    description: ` ${newEmail} 已经存在（被占用），请使用其他邮箱。`,
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
                    title: "邮箱地址已更新",
                    description: `已发送验证邮件至 ${newEmail}`,
                    variant: "success",
                });
            }
        } catch (error) {
            toast({
                title: "更新失败",
                description: "无法更新邮箱，请稍后再试。",
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
                    <LayoutGroup>
                        {/* 用户名 */}
                        <motion.div layout className="border-b border-gray-100 dark:border-gray-900 pb-6">
                            <motion.h3 layout className="text-sm font-medium text-black dark:text-white mb-2">用户名
                            </motion.h3>
                            <AnimatePresence mode="popLayout">
                                {isEditingUsername ? (
                                    <motion.div
                                        key="edit-username"
                                        initial={{opacity: 0}}
                                        animate={{opacity: 1}}
                                        exit={{opacity: 0}}
                                        transition={{duration: 0.2}}
                                        layout
                                        className="space-y-2"
                                    >
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
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="display-username"
                                        initial={{opacity: 0}}
                                        animate={{opacity: 1}}
                                        exit={{opacity: 0}}
                                        transition={{duration: 0.2}}
                                        layout
                                    >
                                        <motion.p layout className="text-base text-black dark:text-white mb-2">
                                            {username}{' '}
                                            <motion.span
                                                className={`text-xs mb-2 transition-all ease-in-out duration-200 ${
                                                    showId ? 'text-black/90 dark:text-white/90 select-text' : 'text-[#FCFCFC] dark:text-[#151515] select-none'
                                                }`}
                                            >
                                                &lt;{userId}&gt;
                                            </motion.span>
                                        </motion.p>
                                        <Button
                                            variant="link"
                                            className="text-sm text-[#747474] dark:text-[#B5B5B5] p-0 h-auto"
                                            onClick={() => setIsEditingUsername(true)}
                                        >
                                            更新用户名
                                        </Button>
                                        <Button
                                            variant="link"
                                            className="text-sm text-[#747474] dark:text-[#B5B5B5] p-0 h-auto mx-3"
                                            onClick={() => setShowId(!showId)}
                                        >
                                            显示id
                                        </Button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>

                        {/* 电子邮件地址 */}
                        <motion.div layout className="border-b border-gray-100 dark:border-gray-900 pb-6">
                            <motion.h3 layout
                                       className="text-sm font-medium text-black dark:text-white mb-2">电子邮件地址
                            </motion.h3>
                            <AnimatePresence mode="popLayout">
                                {isEditingEmail ? (
                                    <motion.div
                                        key="edit-email"
                                        initial={{opacity: 0}}
                                        animate={{opacity: 1}}
                                        exit={{opacity: 0}}
                                        transition={{duration: 0.2}}
                                        layout
                                        className="space-y-2"
                                    >
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
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="display-email"
                                        initial={{opacity: 0}}
                                        animate={{opacity: 1}}
                                        exit={{opacity: 0}}
                                        transition={{duration: 0.2}}
                                        layout
                                    >
                                        <motion.div layout className="flex items-center justify-between mb-2">
                                            <motion.p layout
                                                      className="text-base text-black dark:text-white">{email}</motion.p>
                                            <motion.span layout
                                                         className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                                主要
                                            </motion.span>
                                        </motion.div>
                                        <Button
                                            variant="link"
                                            className="text-sm text-[#747474] dark:text-[#B5B5B5] p-0 h-auto"
                                            onClick={() => setIsEditingEmail(true)}
                                        >
                                            添加电子邮件地址
                                        </Button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </LayoutGroup>

                    {/* 连接的账户 */}
                    <div>
                        <h3 className="text-sm font-medium text-black dark:text-white mb-2">链接的账户（未实装）</h3>
                        <div className="flex items-center mb-2">
                            <GitHubLogoIcon
                                height={22}
                                width={22}
                                className="mr-2"
                            />
                            <p className="text-base text-black dark:text-white">GitHub • shuakami</p>
                        </div>
                        <button className="text-sm text-[#747474] dark:text-[#B5B5B5] hover:underline">
                            连接账户
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
