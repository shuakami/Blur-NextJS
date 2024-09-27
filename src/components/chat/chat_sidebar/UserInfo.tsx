"use client";

import React, {useState} from "react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import PersonalCenter from "@/app/[个人中心]/index"; // 引入个人中心模态框

interface UserInfoProps {
    avatarUrl: string;
    name: string;
    status: string;
}

const UserInfo: React.FC<UserInfoProps> = ({ avatarUrl, name, status }) => {
    const [isModalOpen, setIsModalOpen] = useState(false); // 控制模态框状态

    // 打开模态框
    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    // 关闭模态框
    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    return (
        <div className="py-2 px-2">
            <PersonalCenter isOpen={isModalOpen} onClose={handleCloseModal}/>
            <div
                className="flex items-center space-x-2 hover:bg-[#f0f0f0] dark:hover:bg-[#1e1e1e] rounded-sm p-3 cursor-pointer"
                onClick={handleOpenModal}
            >
                <Avatar className="h-9 w-9 border border-black/10 dark:border-white/10 py-1 px-1">
                    <AvatarImage src={avatarUrl} alt="User avatar" />
                </Avatar>
                <div className="flex flex-col">
                    <h2 className="text-xs-sm font-semibold text-black dark:text-white">
                        {name}
                    </h2>
                    <p className="text-xs text-black dark:text-[#9e9e9e]">{status}</p>
                </div>
            </div>
        </div>
    );
};

export default UserInfo;
