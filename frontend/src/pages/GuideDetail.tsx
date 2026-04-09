import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Phone, Mail, MessageCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { getFullImageUrl } from '../utils/image';

export default function GuideDetail() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/guides/${id}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(data => { setItem(data); setLoading(false); fetch('/api/guides/' + id + '/view', { method: 'POST' }); })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [id]);

  useEffect(() => {
    document.body.style.overflow = 'auto';
    return () => { document.body.style.overflow = ''; };
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loader2 className="animate-spin text-blue-500" size={36} />
    </div>
  );

  if (notFound || !item) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-500">
      <p className="text-lg font-medium">내용을 찾을 수 없습니다</p>
      <a href="/" className="mt-4 text-blue-500 underline text-sm">홈으로 돌아가기</a>
    </div>
  );

  const photos = (() => { try {
    const p = item.photos;
    if (Array.isArray(p)) return p;
    return JSON.parse(p || '[]');
  } catch { return []; } })();
  const coverSrc = item.avatar || item.image || (photos.length > 0 ? photos[0] : null);
  const imgUrl = coverSrc ? getFullImageUrl(coverSrc) : null;
  const remainingPhotos = photos.filter((p: string) => p !== coverSrc);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <a href="/" className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
            <ArrowLeft size={20} className="text-gray-600" />
          </a>
          <span className="font-semibold text-gray-800 truncate">{item.name}</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {imgUrl && (
          <div className="w-full rounded-2xl overflow-hidden shadow-sm">
            <img src={imgUrl} alt={item.name} className="w-full object-cover max-h-72" />
          </div>
        )}

        <div>
          <h1 className="text-2xl font-bold text-gray-900">{item.name}</h1>
          {item.title && <p className="text-gray-500 mt-1">{item.title}</p>}
        </div>

        {(item.phone || item.wechat || item.kakao || item.email) && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">연락처</h2>
            {item.phone && (
              <a href={`tel:${item.phone}`} className="flex items-center gap-3 text-gray-800 hover:text-blue-600 transition-colors">
                <div className="w-9 h-9 bg-blue-50 rounded-full flex items-center justify-center shrink-0"><Phone size={16} className="text-blue-500" /></div>
                <span className="text-sm">{item.phone}</span>
              </a>
            )}
            {item.kakao && (
              <div className="flex items-center gap-3 text-gray-800">
                <div className="w-9 h-9 bg-yellow-50 rounded-full flex items-center justify-center shrink-0"><MessageCircle size={16} className="text-yellow-500" /></div>
                <span className="text-sm">카카오톡: {item.kakao}</span>
              </div>
            )}
            {item.wechat && (
              <div className="flex items-center gap-3 text-gray-800">
                <div className="w-9 h-9 bg-green-50 rounded-full flex items-center justify-center shrink-0"><MessageCircle size={16} className="text-green-500" /></div>
                <span className="text-sm">WeChat: {item.wechat}</span>
              </div>
            )}
            {item.email && (
              <a href={`mailto:${item.email}`} className="flex items-center gap-3 text-gray-800 hover:text-blue-600 transition-colors">
                <div className="w-9 h-9 bg-purple-50 rounded-full flex items-center justify-center shrink-0"><Mail size={16} className="text-purple-500" /></div>
                <span className="text-sm">{item.email}</span>
              </a>
            )}
          </div>
        )}

        {photos.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {remainingPhotos.map((p: string, i: number) => (
              <div key={i} className="rounded-xl overflow-hidden aspect-square">
                <img src={getFullImageUrl(p)} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}

        {item.intro && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h2 className="text-sm font-semibold text-gray-500 mb-3">소개</h2>
            <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: item.intro }} />
          </div>
        )}

        {item.content && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: item.content }} />
          </div>
        )}

        <div className="text-center text-xs text-gray-300 pb-4">anjenMap · anjen.net</div>
      </div>
    </div>
  );
}
