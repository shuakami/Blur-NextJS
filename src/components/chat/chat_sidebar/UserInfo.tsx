"use client";

import React from 'react';
import { Avatar, AvatarImage } from "@/components/ui/avatar";

interface UserInfoProps {
    avatarUrl: string;
    name: string;
    status: string;
}

const UserInfo: React.FC<UserInfoProps> = ({ avatarUrl, name, status }) => {
    return (
        <div className="py-2 px-2">
            <div className="flex items-center space-x-2 hover:bg-[#f0f0f0] dark:hover:bg-[#1e1e1e] rounded-sm p-3">
                <Avatar className="h-9 w-9 border border-black/10 dark:border-white/10 py-1 px-1">
                    <AvatarImage src={avatarUrl} alt="User avatar" />
                </Avatar>
                <div className="flex flex-col">
                    <h2 className="text-xs-sm font-semibold text-black dark:text-white">{name}</h2>
                    <p className="text-xs text-black dark:text-[#9e9e9e]">{status}</p>
                </div>
            </div>
        </div>
    );
};

export default UserInfo;
