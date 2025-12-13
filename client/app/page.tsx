import Navigation from "@/components/Navigation";
import Link from "next/link";
import type { Post } from "@/types";

// 백엔드 API에서 게시물 가져오기
async function getPosts(): Promise<Post[]> {
  try {
    const res = await fetch('http://localhost:3000/posts', {
      cache: 'no-store', // 항상 최신 데이터
      credentials: 'include', // 쿠키 전송
    });

    if (!res.ok) {
      throw new Error('Failed to fetch posts');
    }

    return res.json();
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}

export default async function Home() {
  const posts = await getPosts(); // 백엔드에서 데이터 가져오기

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <main className="max-w-4xl mx-auto px-6 py-12">
        {posts.length === 0 ? (
          <p className="text-center text-gray-500">게시물이 없습니다.</p>
        ) : (
          <div className="grid grid-cols-3 gap-6">
            {posts.map((post: Post) => (
              <Link
                key={post.id}
                href={`/post/${post.id}`}
                className="block group"
              >
                <div className="p-6 border-b border-gray-200 hover:border-gray-400 transition-colors">
                  <h2 className="text-xl text-gray-900 group-hover:text-gray-900 transition-colors truncate">
                    {post.title}
                  </h2>
                  <p className="text-sm text-gray-500 mt-2">
                    조회 {post.viewCount || 0}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
