'use client';

import { useState, useEffect } from 'react';
import { Trash2, Edit2, Send } from 'lucide-react';

interface Comment {
    id: number;
    content: string;
    author: {
        id: number;
        username: string;
        nickname?: string;
    };
    createdAt: string;
    updatedAt: string;
}

interface CommentSectionProps {
    postId: number;
}

export default function CommentSection({ postId }: CommentSectionProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editContent, setEditContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);

    // 현재 사용자 정보 가져오기
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setCurrentUserId(payload.userId);
            } catch (error) {
                console.error('토큰 파싱 실패:', error);
            }
        }
    }, []);

    // 댓글 목록 가져오기
    useEffect(() => {
        fetchComments();
    }, [postId]);

    const fetchComments = async () => {
        try {
            const res = await fetch(`http://localhost:3000/posts/${postId}/comments`);
            if (res.ok) {
                const data = await res.json();
                setComments(data);
            }
        } catch (error) {
            console.error('댓글 로드 실패:', error);
        } finally {
            setLoading(false);
        }
    };

    // 댓글 작성
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        const token = localStorage.getItem('token');
        if (!token) {
            alert('로그인이 필요합니다.');
            return;
        }

        try {
            const res = await fetch(`http://localhost:3000/posts/${postId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ content: newComment }),
            });

            if (res.ok) {
                setNewComment('');
                fetchComments(); // 댓글 목록 새로고침
            } else {
                alert('댓글 작성에 실패했습니다.');
            }
        } catch (error) {
            console.error('댓글 작성 실패:', error);
            alert('댓글 작성 중 오류가 발생했습니다.');
        }
    };

    // 댓글 수정
    const handleEdit = async (id: number) => {
        if (!editContent.trim()) return;

        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`http://localhost:3000/comments/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ content: editContent }),
            });

            if (res.ok) {
                setEditingId(null);
                setEditContent('');
                fetchComments();
            } else {
                alert('댓글 수정에 실패했습니다.');
            }
        } catch (error) {
            console.error('댓글 수정 실패:', error);
        }
    };

    // 댓글 삭제
    const handleDelete = async (id: number) => {
        if (!confirm('정말 삭제하시겠습니까?')) return;

        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`http://localhost:3000/comments/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (res.ok) {
                fetchComments();
            } else {
                alert('댓글 삭제에 실패했습니다.');
            }
        } catch (error) {
            console.error('댓글 삭제 실패:', error);
        }
    };

    if (loading) {
        return <div className="text-center py-8">댓글을 불러오는 중...</div>;
    }

    return (
        <div className="mt-12 border-t pt-8">
            <h2 className="text-2xl font-bold mb-6">댓글 {comments.length}개</h2>

            {/* 댓글 작성 폼 */}
            <form onSubmit={handleSubmit} className="mb-8">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="댓글을 입력하세요..."
                        className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        maxLength={1000}
                    />
                    <button
                        type="submit"
                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center gap-2"
                    >
                        <Send size={16} />
                        작성
                    </button>
                </div>
            </form>

            {/* 댓글 목록 */}
            <div className="space-y-4">
                {comments.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">첫 댓글을 작성해보세요!</p>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold">
                                        {comment.author.nickname || comment.author.username}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        {new Date(comment.createdAt).toLocaleDateString('ko-KR')}
                                    </span>
                                </div>

                                {/* 본인 댓글만 수정/삭제 버튼 표시 */}
                                {currentUserId === comment.author.id && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                setEditingId(comment.id);
                                                setEditContent(comment.content);
                                            }}
                                            className="text-blue-500 hover:text-blue-700"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(comment.id)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* 수정 모드 */}
                            {editingId === comment.id ? (
                                <div className="flex gap-2 mt-2">
                                    <input
                                        type="text"
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        className="flex-1 px-3 py-1 border rounded"
                                        maxLength={1000}
                                    />
                                    <button
                                        onClick={() => handleEdit(comment.id)}
                                        className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
                                    >
                                        저장
                                    </button>
                                    <button
                                        onClick={() => {
                                            setEditingId(null);
                                            setEditContent('');
                                        }}
                                        className="px-3 py-1 bg-gray-300 rounded text-sm"
                                    >
                                        취소
                                    </button>
                                </div>
                            ) : (
                                <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
