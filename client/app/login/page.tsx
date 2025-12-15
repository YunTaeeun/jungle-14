"use client";

import Navigation from "@/components/Navigation";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { LoginResponse } from "@/types";

export default function LoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!username || !password) {
            alert("아이디와 비밀번호를 입력해주세요.");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("http://localhost:3000/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || '로그인 실패');
            }

            const data: LoginResponse = await res.json();

            // 토큰 저장
            localStorage.setItem('token', data.access_token);
            localStorage.setItem('user', JSON.stringify(data.user));

            // 커스텀 이벤트 발생 (Navigation 상태 업데이트)
            window.dispatchEvent(new Event('auth-change'));

            alert("로그인 성공!");
            router.push("/");
        } catch (error: any) {
            console.error("Error logging in:", error);
            alert(error.message || "로그인에 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <Navigation />

            <main className="max-w-4xl mx-auto px-6 py-12">
                <div className="max-w-md mx-auto space-y-8">
                    <h1 className="text-4xl text-gray-900 text-center">로그인</h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* 입력 필드 */}
                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="아이디"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 focus:border-gray-400 outline-none transition-colors text-gray-900"
                            />
                            <input
                                type="password"
                                placeholder="비밀번호"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 focus:border-gray-400 outline-none transition-colors text-gray-900"
                            />
                        </div>

                        {/* 로그인 버튼 */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-gray-900 text-white hover:bg-gray-700 transition-colors disabled:bg-gray-400"
                        >
                            {loading ? "로그인 중..." : "로그인"}
                        </button>
                    </form>

                    {/* 회원가입 링크 */}
                    <div className="text-center">
                        <p className="text-sm text-gray-600">
                            계정이 없으신가요?{" "}
                            <Link href="/register" className="text-gray-900 hover:underline">
                                회원가입
                            </Link>
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
