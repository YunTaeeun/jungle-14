"use client";

import Navigation from "@/components/Navigation";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
    const router = useRouter();
    const [nickname, setNickname] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // 현재 사용자 정보 가져오기
        const fetchUser = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }

            try {
                const res = await fetch('http://localhost:3000/users/me', {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                const user = await res.json();

                setNickname(user.nickname || '');
                setEmail(user.email || '');
            } catch (error) {
                console.error(error);
            }
        };

        fetchUser();
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const token = localStorage.getItem('token');
        if (!token) {
            alert("로그인이 필요합니다.");
            router.push('/login');
            return;
        }

        setLoading(true);

        try {
            const body: any = {};
            if (nickname) body.nickname = nickname;
            if (email) body.email = email;
            if (password) body.password = password;

            const res = await fetch('http://localhost:3000/users/profile', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || '업데이트 실패');
            }

            alert('프로필이 업데이트되었습니다!');
            setPassword(''); // 비밀번호 필드 초기화
        } catch (error: any) {
            console.error(error);
            alert(error.message || '프로필 업데이트에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <Navigation />

            <main className="max-w-4xl mx-auto px-6 py-12">
                <div className="max-w-md mx-auto space-y-8">
                    <h1 className="text-4xl text-gray-900 text-center">계정 설정</h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-600 mb-2">
                                    닉네임 (선택)
                                </label>
                                <input
                                    type="text"
                                    placeholder="닉네임을 입력하세요"
                                    value={nickname}
                                    onChange={(e) => setNickname(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 focus:border-gray-400 outline-none transition-colors text-gray-900"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-600 mb-2">
                                    이메일
                                </label>
                                <input
                                    type="email"
                                    placeholder="이메일"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 focus:border-gray-400 outline-none transition-colors text-gray-900"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-600 mb-2">
                                    비밀번호 변경 (선택)
                                </label>
                                <input
                                    type="password"
                                    placeholder="새 비밀번호 (최소 6자)"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 focus:border-gray-400 outline-none transition-colors text-gray-900"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-gray-900 text-white hover:bg-gray-700 transition-colors disabled:bg-gray-400"
                        >
                            {loading ? "저장 중..." : "저장"}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}
