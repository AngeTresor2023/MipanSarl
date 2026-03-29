import React from 'react'
import { createClient } from '@/lib/supabase/client';
import SocialAuthButton from './social-auth-button';

import { FcGoogle } from "react-icons/fc";
import { FaGithub, FaFacebook, FaApple } from "react-icons/fa";
import { IconType } from "react-icons";

type provider = 'google' | 'github' | 'facebook' | 'apple';

type providerType = {
    name: provider;
    icon: IconType;
    size: number;
    color: string;
};

const providers: providerType[] = [
    {
        name: 'google',
        icon: FcGoogle,
        size: 20,
        color: "white",
    },
    {
        name: 'github',
        icon: FaGithub,
        size: 20,
        color: "white",
    },
    {
        name: 'facebook',
        icon: FaFacebook,
        size: 20,
        color: "white",
    },
    {
        name: 'apple',
        icon: FaApple,
        size: 20,
        color: "white",
    },
];

const SocialAuthButtons = () => {
    const handleOAuthLogin = async (provider: provider) => {
        const supabase = createClient();
        await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: `${location.origin}/auth/callback`,
            },
        });
    };

    return (
        <div className="flex items-center gap-3 mb-4">
            {providers.map((provider) => {
                const Icon = provider.icon;

                return (
                    <SocialAuthButton
                        key={provider.name}
                        action={() => handleOAuthLogin(provider.name)}
                    >
                        <Icon
                            size={provider.size}
                            color={provider.color}
                            className="flex items-center gap-2"
                        />
                    </SocialAuthButton>
                );
            })}
        </div>
    );
};

export default SocialAuthButtons;
