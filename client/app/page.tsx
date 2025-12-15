'use client';

import Navigation from "@/components/Navigation";
import InfiniteScrollPosts from "@/components/InfiniteScrollPosts";
import SearchBar from "@/components/SearchBar";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <main className="max-w-4xl mx-auto px-6">
        {/* 검색바 - 네비게이션 바로 아래 */}
        <div className="py-6">
          <SearchBar />
        </div>

        {/* 게시물 목록 */}
        <InfiniteScrollPosts />
      </main>
    </div>
  );
}
