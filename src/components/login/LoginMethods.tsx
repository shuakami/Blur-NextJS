// components/login/LoginMethods.tsx
"use client";

import {useState} from "react";
import GitHubLoginButton from "./GitHubLoginButton";
import GoogleLoginButton from "./GoogleLoginButton";
import BetaUserLoginButton from "./BetaUserLoginButton";
import EmailLoginForm from "./EmailLoginForm";
import BetaLoginForm from "./BetaLoginForm";


export default function LoginMethods() {
    const [isEmailLogin, setIsEmailLogin] = useState(true);

    const toggleLoginMethod = () => {
        setIsEmailLogin((prev) => !prev);
    };

    return (
        <div className="w-full">
            <GitHubLoginButton/>
            <GoogleLoginButton/>
            <BetaUserLoginButton isEmailLogin={isEmailLogin} toggleLoginMethod={toggleLoginMethod}/>

            <hr className="border-t border-[#acaba9]/15 dark:border-[#666666]/40 mb-5"/>

            <div className={`transition-opacity duration-200 ${isEmailLogin ? 'opacity-100' : 'opacity-0 hidden'}`}>
                <EmailLoginForm/>
            </div>
            <div className={`transition-opacity duration-200 ${!isEmailLogin ? 'opacity-100' : 'opacity-0 hidden'}`}>
                <BetaLoginForm/>
            </div>
        </div>
    );
}