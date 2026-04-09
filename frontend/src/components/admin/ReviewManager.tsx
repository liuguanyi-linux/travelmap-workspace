import React, { useState, useEffect } from 'react';
import { Star, Trash2 } from 'lucide-react';

interface ReviewManagerProps {
  targetId?: number | string;
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
        customNickname: newReview.username,
        isAdmin: true, // Tell backend this is from admin
      };
      
      body[`${targetType}Id`] = targetId;
      
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      if (res.ok) {
        const saved = await res.json();
        setReviews([saved, ...reviews]);
        setNewReview({ username: '방문자', rating: 5, content: '' }); // Set default to korean visitor
      }
    } catch (e) { console.error(e); }
  };

  const handleBatchGenerate = async () => {
    if (!confirm('确定要批量生成 3-5 条虚拟好评吗？')) return;
    try {
      const res = await fetch('/api/reviews/batch-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetType, targetId })
      });
      if (res.ok) {
        const generated = await res.json();
        setReviews([...generated, ...reviews]);
      }
    } catch (e) { console.error(e); }
  };

  const handleBatchClear = async () => {
    if (!confirm('警告：确定要清空所有系统生成的虚拟评论吗？（此操作不可逆，且仅删除 SYSTEM_MOCK 类型数据）')) return;
    try {
      const res = await fetch('/api/reviews/batch-clear', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetType, targetId })
      });
      if (res.ok) {
        setReviews(reviews.filter(r => r.type !== 'SYSTEM_MOCK'));
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
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-gray-800">评论管理</h3>
        <div className="flex gap-2">
            <button onClick={handleBatchGenerate} className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs hover:bg-green-700">
                批量生成好评
            </button>
            <button onClick={handleBatchClear} className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs hover:bg-red-700">
                清空系统虚拟评论
            </button>
        </div>
      </div>
      
      {/* Add Review Form */}
      <div className="bg-gray-50 p-4 rounded-lg mb-4 space-y-3">
          <div className="flex gap-3">
              <input
                  type="text"
                  value={newReview.username}
                  onChange={e => setNewReview({...newReview, username: e.target.value})}
                  className="w-1/3 px-3 py-2 border rounded-lg text-sm"
                  placeholder="自定义昵称 (留空则使用默认)"
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
                  添加后台评论
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
                              {review.customNickname || review.user?.nickname || review.nickname || '방문자'}
                          </span>
                          <span className="text-yellow-500 text-xs">{'★'.repeat(review.rating)}</span>
                          <span className="text-gray-400 text-xs">{new Date(review.createdAt).toLocaleDateString()}</span>
                          
                          {/* Data Source Tag */}
                          {review.type === 'SYSTEM_MOCK' && <span className="ml-2 px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-[10px]">系统生成</span>}
                          {review.type === 'ADMIN_MOCK' && <span className="ml-2 px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px]">后台添加</span>}
                          {(!review.type || review.type === 'REAL') && <span className="ml-2 px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-[10px]">真实用户</span>}
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
