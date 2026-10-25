"use client";
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
    IconBrandGithub,
    IconBrandGoogle,
    IconBrandOnlyfans,
} from "@tabler/icons-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSignUp } from "@/hooks/useSignUp";

export default function SignupFormDemo() {
    const navigate = useNavigate();
    const location = useLocation();
    const from = (location.state as any)?.from?.pathname || "/";
    const { signUpUser, isLoading, error } = useSignUp();

    const [data, setData] = useState({
        userName: "",
        email: "",
        password: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setData((prev) => ({
            ...prev,
            [id]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const success = await signUpUser(data.userName, data.email, data.password);
        if (success) {
            navigate(from, { replace: true });
        }
    };

    return (
        <div className="shadow-input mx-auto w-full max-w-md rounded-none bg-white p-4 md:rounded-2xl md:p-8 dark:bg-black">
            <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">
                Create your account
            </h2>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                Join SyncWrite for real-time collaboration
            </p>

            {error && (
                <div className="mt-4 rounded-md bg-red-50 p-3 text-xs font-medium text-red-600 border border-red-200">
                    {error}
                </div>
            )}

            <form className="my-8" onSubmit={handleSubmit}>
                <LabelInputContainer className="mb-4">
                    <Label htmlFor="userName">Username</Label>
                    <Input
                        id="userName"
                        placeholder="Tylor08"
                        type="text"
                        value={data.userName}
                        onChange={handleChange}
                        required
                    />
                </LabelInputContainer>
                <LabelInputContainer className="mb-4">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                        id="email"
                        placeholder="projectmayhem@fc.com"
                        type="email"
                        value={data.email}
                        onChange={handleChange}
                        required
                    />
                </LabelInputContainer>
                <LabelInputContainer className="mb-4">
                    <Label htmlFor="password">Password</Label>
                    <Input
                        id="password"
                        placeholder="••••••••"
                        type="password"
                        value={data.password}
                        onChange={handleChange}
                        required
                    />
                </LabelInputContainer>
                <button
                    className="group/btn relative block h-10 w-full cursor-pointer rounded-md bg-gradient-to-br from-black to-neutral-700 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] transition-all duration-300 hover:brightness-110 hover:shadow-[0px_4px_20px_rgba(59,130,246,0.35)] active:scale-[0.99] disabled:opacity-50 dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset]"
                    type="submit"
                    disabled={isLoading}
                >
                    {isLoading ? "Creating account..." : "Sign Up →"}
                    <BottomGradient />
                </button>

                <div className="mt-6 text-center">
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Already have an account?{" "}
                        <Link
                            to="/signin"
                            state={{ from: (location.state as any)?.from }}
                            className="text-blue-600 hover:underline hover:text-blue-700 font-medium"
                        >
                            Sign in now
                        </Link>
                    </p>
                </div>

                <div className="my-8 h-[1px] w-full bg-gradient-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-700" />

                <div className="flex flex-col space-y-4">
                    <button
                        className="group/btn shadow-input relative flex h-10 w-full items-center justify-start space-x-2 rounded-md bg-gray-50 px-4 font-medium text-black dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_#262626]"
                        type="submit"
                    >
                        <IconBrandGithub className="h-4 w-4 text-neutral-800 dark:text-neutral-300" />
                        <span className="text-sm text-neutral-700 dark:text-neutral-300">
                            GitHub
                        </span>
                        <BottomGradient />
                    </button>
                    <button
                        className="group/btn shadow-input relative flex h-10 w-full items-center justify-start space-x-2 rounded-md bg-gray-50 px-4 font-medium text-black dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_#262626]"
                        type="submit"
                    >
                        <IconBrandGoogle className="h-4 w-4 text-neutral-800 dark:text-neutral-300" />
                        <span className="text-sm text-neutral-700 dark:text-neutral-300">
                            Google
                        </span>
                        <BottomGradient />
                    </button>
                    <button
                        className="group/btn shadow-input relative flex h-10 w-full items-center justify-start space-x-2 rounded-md bg-gray-50 px-4 font-medium text-black dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_#262626]"
                        type="submit"
                    >
                        <IconBrandOnlyfans className="h-4 w-4 text-neutral-800 dark:text-neutral-300" />
                        <span className="text-sm text-neutral-700 dark:text-neutral-300">
                            OnlyFans
                        </span>
                        <BottomGradient />
                    </button>
                </div>
            </form>
        </div>
    );
}

const BottomGradient = () => {
    return (
        <>
            <span className="absolute inset-x-0 -bottom-px block h-[2px] w-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
            <span className="absolute inset-x-6 -bottom-px mx-auto block h-[3px] w-3/4 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-xs transition duration-500 group-hover/btn:opacity-100" />
            <span className="absolute inset-x-12 -bottom-px mx-auto block h-[4px] w-1/2 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
        </>
    );
};

const LabelInputContainer = ({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) => {
    return (
        <div className={cn("flex w-full flex-col space-y-2", className)}>
            {children}
        </div>
    );
};
