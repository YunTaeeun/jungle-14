'use client';

import Navigation from "@/components/Navigation";
import InfiniteScrollPosts from "@/components/InfiniteScrollPosts";
import SearchBar from "@/components/SearchBar";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* 검색 바 */}
        <div className="mb-8">
          <SearchBar />
        </div>

        {/* 무한 스크롤 게시물 목록 */}
        <InfiniteScrollPosts />
      </main>
    </div>
  );
}
