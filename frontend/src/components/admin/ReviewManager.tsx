import React, { useState, useEffect } from 'react';
import { Star, Trash2 } from 'lucide-react';

interface ReviewManagerProps {
  targetId?: number;
  targetType: 'spot' | 'guide' | 'strategy';
}

export function ReviewManager({ targetId, targetType }: ReviewManagerProps) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [newReview, setNewReview] = useState({ username: '游客', rating: 5, content: '' });

  useEffect(() => {
    if (!targetId) return;
    fetch(`/api/reviews/${targetType}/${targetId}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setReviews(data);
      })
      .catch(console.error);
  }, [targetId, targetType]);

  const handleAdd = async () => {
    if (!newReview.content.trim() || !targetId) return;
    try {
      const body: any = {
        rating: newReview.rating,
        content: newReview.content,
        nickname: newReview.username,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`
      };
      // Dynamic key based on targetType
      body[`${targetType}Id`] = targetId;

      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      if (res.ok) {
        const saved = await res.json();
        setReviews([saved, ...reviews]);
        setNewReview({ username: '游客', rating: 5, content: '' });
      }
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定删除这条评论吗？')) return;
    try {
      await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
      setReviews(reviews.filter(r => r.id !== id));
    } catch (e) { console.error(e); }
  };

  if (!targetId) {
    return (
      <div className="border-t pt-4 mt-4 text-gray-400 text-sm text-center">
        请先保存项目，然后再管理评论
      </div>
    );
  }

  return (
    <div className="border-t pt-4 mt-4">
      <h3 className="font-bold text-gray-800 mb-3">评论管理</h3>
      
      {/* Add Review Form */}
      <div className="bg-gray-50 p-4 rounded-lg mb-4 space-y-3">
          <div className="flex gap-3">
              <input
                  type="text"
                  value={newReview.username}
                  onChange={e => setNewReview({...newReview, username: e.target.value})}
                  className="w-1/3 px-3 py-2 border rounded-lg text-sm"
                  placeholder="用户名"
              />
              <select
                  value={newReview.rating}
                  onChange={e => setNewReview({...newReview, rating: Number(e.target.value)})}
                  className="w-1/4 px-3 py-2 border rounded-lg text-sm"
              >
                  {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} 星</option>)}
              </select>
          </div>
          <div className="flex gap-3">
              <input
                  type="text"
                  value={newReview.content}
                  onChange={e => setNewReview({...newReview, content: e.target.value})}
                  className="flex-1 px-3 py-2 border rounded-lg text-sm"
                  placeholder="评论内容..."
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
              />
              <button
                  type="button"
                  onClick={handleAdd}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 whitespace-nowrap"
              >
                  添加评论
              </button>
          </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-3 max-h-60 overflow-y-auto">
          {reviews.length === 0 && <p className="text-sm text-gray-400 text-center py-2">暂无评论</p>}
          {reviews.map((review: any) => (
              <div key={review.id} className="bg-white border rounded-lg p-3 flex justify-between items-start group">
                  <div>
                      <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-sm">
                              {review.user?.nickname || review.nickname || '游客'}
                          </span>
                          <span className="text-yellow-500 text-xs">{'★'.repeat(review.rating)}</span>
                          <span className="text-gray-400 text-xs">{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-gray-600">{review.content}</p>
                  </div>
                  <button 
                      onClick={() => handleDelete(review.id)} 
                      className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                      <Trash2 size={16} />
                  </button>
              </div>
          ))}
      </div>
    </div>
  );
}
