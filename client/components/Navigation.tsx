"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navigation() {
    const pathname = usePathname();
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        // 로그인 상태 체크 함수
        const checkAuth = () => {
            const token = localStorage.getItem('token');
            setIsLoggedIn(!!token);
        };

        // 초기 체크
        checkAuth();

        // pathname 변경 시 체크
        checkAuth();

        // storage 이벤트 리스너 (다른 탭에서 로그아웃 시)
        window.addEventListener('storage', checkAuth);

        // 커스텀 이벤트 리스너 (같은 탭에서 로그인/로그아웃 시)
        window.addEventListener('auth-change', checkAuth);

        return () => {
            window.removeEventListener('storage', checkAuth);
            window.removeEventListener('auth-change', checkAuth);
        };
    }, [pathname]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsLoggedIn(false);

        // 커스텀 이벤트 발생
        window.dispatchEvent(new Event('auth-change'));

        router.push('/');
    };

    // 로그인 전: 게시판 | 로그인
    // 로그인 후 (일반): 게시판 | 글쓰기 | 내정보 | 로그아웃
    // 내정보 페이지: 게시판 | 글쓰기 | 정보수정 | 로그아웃
    const isProfilePage = pathname === '/profile';

    const links = !isLoggedIn ? [
        { href: "/", label: "게시판" },
        { href: "/login", label: "로그인" },
    ] : isProfilePage ? [
        { href: "/", label: "게시판" },
        { href: "/write", label: "글쓰기" },
        { href: "/settings", label: "정보수정" },
    ] : [
        { href: "/", label: "게시판" },
        { href: "/write", label: "글쓰기" },
        { href: "/profile", label: "내정보" },
    ];

    return (
        <nav className="bg-white">
            <div className="max-w-4xl mx-auto px-6 py-6">
                <div className="flex gap-8 items-center justify-end">
                    {links.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`text-base transition-colors ${pathname === link.href
                                ? "text-gray-900 font-medium"
                                : "text-gray-500 hover:text-gray-900"
                                }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                    {isLoggedIn && (
                        <button
                            onClick={handleLogout}
                            className="text-base text-gray-500 hover:text-gray-900 transition-colors"
                        >
                            로그아웃
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
}
