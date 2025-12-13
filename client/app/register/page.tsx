"use client";

import Navigation from "@/components/Navigation";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!username || !email || !password) {
            alert("모든 필드를 입력해주세요.");
            return;
        }

        if (password.length < 6) {
            alert("비밀번호는 최소 6자 이상이어야 합니다.");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("http://localhost:3000/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, password }),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || '회원가입 실패');
            }

            alert("회원가입 성공! 로그인 페이지로 이동합니다.");
            router.push("/login");
        } catch (error: any) {
            console.error("Error registering:", error);
            alert(error.message || "회원가입에 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <Navigation />

            <main className="max-w-4xl mx-auto px-6 py-12">
                <div className="max-w-md mx-auto space-y-8">
                    <h1 className="text-4xl text-gray-900 text-center">회원가입</h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* 입력 필드 */}
                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="사용자명"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 focus:border-gray-400 outline-none transition-colors text-gray-900"
                            />
                            <input
                                type="email"
                                placeholder="이메일"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 focus:border-gray-400 outline-none transition-colors text-gray-900"
                            />
                            <input
                                type="password"
                                placeholder="비밀번호 (최소 6자)"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 focus:border-gray-400 outline-none transition-colors text-gray-900"
                            />
                        </div>

                        {/* 회원가입 버튼 */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-gray-900 text-white hover:bg-gray-700 transition-colors disabled:bg-gray-400"
                        >
                            {loading ? "가입 중..." : "회원가입"}
                        </button>
                    </form>

                    {/* 로그인 링크 */}
                    <div className="text-center">
                        <p className="text-sm text-gray-600">
                            이미 계정이 있으신가요?{" "}
                            <Link href="/login" className="text-gray-900 hover:underline">
                                로그인
                            </Link>
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
