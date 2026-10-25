"use client";
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
    IconBrandGithub,
    IconBrandGoogle,
} from "@tabler/icons-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSignIn } from "@/hooks/useSignIn";

export default function SignInForm() {
    const navigate = useNavigate();
    const location = useLocation();
    const from = (location.state as any)?.from?.pathname || "/";
    const { signInUser, isLoading, error } = useSignIn();

    const [data, setData] = useState({
        userName: "",
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
        const success = await signInUser(data.userName, data.password);
        if (success) {
            navigate(from, { replace: true });
        }
    };

    return (
        <div className="shadow-input mx-auto w-full max-w-md rounded-none bg-white p-4 md:rounded-2xl md:p-8 dark:bg-black">
            <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">
                Welcome back
            </h2>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                Sign in to your SyncWrite account
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
                        placeholder="johndoe"
                        type="text"
                        value={data.userName}
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

                <div className="mb-6 flex justify-end">
                    <button
                        type="button"
                        className="text-sm font-medium text-neutral-600 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors duration-300"
                        onClick={() => alert("Forgot password clicked!")}
                    >
                        Forgot Password?
                    </button>
                </div>

                <button
                    className="group/btn relative block h-10 w-full cursor-pointer rounded-md bg-gradient-to-br from-black to-neutral-700 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] transition-all duration-300 hover:brightness-110 hover:shadow-[0px_4px_20px_rgba(59,130,246,0.35)] active:scale-[0.99] disabled:opacity-50 dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset]"
                    type="submit"
                    disabled={isLoading}
                >
                    {isLoading ? "Signing in..." : "Sign in →"}
                    <BottomGradient />
                </button>

                <div className="mt-6 text-center">
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Don’t have an account?{" "}
                        <Link
                            to="/signup"
                            state={{ from: (location.state as any)?.from }}
                            className="group/link relative inline-flex items-center text-blue-600 font-medium transition-colors hover:text-blue-700"
                        >
                            <span>Sign up now</span>
                            <span className="absolute inset-x-0 -bottom-0.5 block h-0.5 w-full bg-gradient-to-r from-cyan-500 to-indigo-500 opacity-0 transition-opacity duration-300 group-hover/link:opacity-100" />
                        </Link>
                    </p>
                </div>

                <div className="my-8 h-[1px] w-full bg-gradient-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-700" />

                <div className="flex flex-col space-y-4">
                    <button
                        className="group/btn shadow-input relative flex h-10 w-full cursor-pointer items-center justify-start space-x-2 rounded-md bg-gray-50 px-4 font-medium text-black transition-all duration-300 hover:bg-gray-100 dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_#262626]"
                        type="button"
                    >
                        <IconBrandGithub className="h-4 w-4 text-neutral-800 dark:text-neutral-300" />
                        <span className="text-sm text-neutral-700 dark:text-neutral-300">
                            GitHub
                        </span>
                        <BottomGradient />
                    </button>
                    <button
                        className="group/btn shadow-input relative flex h-10 w-full cursor-pointer items-center justify-start space-x-2 rounded-md bg-gray-50 px-4 font-medium text-black transition-all duration-300 hover:bg-gray-100 dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_#262626]"
                        type="button"
                    >
                        <IconBrandGoogle className="h-4 w-4 text-neutral-800 dark:text-neutral-300" />
                        <span className="text-sm text-neutral-700 dark:text-neutral-300">
                            Google
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
