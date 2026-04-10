import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Phone, Mail, MessageCircle, MapPin, ArrowLeft, Loader2, Map, ExternalLink } from 'lucide-react';
import { getFullImageUrl } from '../utils/image';

export default function AdDetail() {
  const { id } = useParams<{ id: string }>();
  const [ad, setAd] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/ads/${id}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(data => { setAd(data); setLoading(false); fetch('/api/ads/' + id + '/view', { method: 'POST' }); })
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

  if (notFound || !ad) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-500">
      <p className="text-lg font-medium">내용을 찾을 수 없습니다</p>
      <a href="/" className="mt-4 text-blue-500 underline text-sm">홈으로 돌아가기</a>
    </div>
  );

  const imgUrl = ad.image ? getFullImageUrl(ad.image) : null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header with branding */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
              <ArrowLeft size={20} className="text-gray-600" />
            </a>
            <span className="font-semibold text-gray-800 truncate">{ad.title}</span>
          </div>
          <a
            href="/"
            className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium px-3 py-1.5 rounded-full transition-colors whitespace-nowrap"
          >
            <Map size={14} />
            진입 지도
          </a>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Cover Image */}
        {imgUrl && (
          <div className="w-full rounded-2xl overflow-hidden shadow-sm">
            <img src={imgUrl} alt={ad.title} className="w-full object-cover max-h-72" />
          </div>
        )}

        {/* Title & Description */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{ad.title}</h1>
          {ad.description && <p className="text-gray-500 mt-1">{ad.description}</p>}
        </div>

        {/* Contact Info */}
        {(ad.phone || ad.wechat || ad.kakao || ad.email || ad.address) && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">연락처</h2>
            {ad.phone && (
              <a href={`tel:${ad.phone}`} className="flex items-center gap-3 text-gray-800 hover:text-blue-600 transition-colors">
                <div className="w-9 h-9 bg-blue-50 rounded-full flex items-center justify-center shrink-0">
                  <Phone size={16} className="text-blue-500" />
                </div>
                <span className="text-sm">{ad.phone}</span>
              </a>
            )}
            {ad.kakao && (
              <div className="flex items-center gap-3 text-gray-800">
                <div className="w-9 h-9 bg-yellow-50 rounded-full flex items-center justify-center shrink-0">
                  <MessageCircle size={16} className="text-yellow-500" />
                </div>
                <span className="text-sm">카카오톡: {ad.kakao}</span>
              </div>
            )}
            {ad.wechat && (
              <div className="flex items-center gap-3 text-gray-800">
                <div className="w-9 h-9 bg-green-50 rounded-full flex items-center justify-center shrink-0">
                  <MessageCircle size={16} className="text-green-500" />
                </div>
                <span className="text-sm">WeChat: {ad.wechat}</span>
              </div>
            )}
            {ad.email && (
              <a href={`mailto:${ad.email}`} className="flex items-center gap-3 text-gray-800 hover:text-blue-600 transition-colors">
                <div className="w-9 h-9 bg-purple-50 rounded-full flex items-center justify-center shrink-0">
                  <Mail size={16} className="text-purple-500" />
                </div>
                <span className="text-sm">{ad.email}</span>
              </a>
            )}
            {ad.address && (
              <div className="flex items-center gap-3 text-gray-800">
                <div className="w-9 h-9 bg-red-50 rounded-full flex items-center justify-center shrink-0">
                  <MapPin size={16} className="text-red-500" />
                </div>
                <span className="text-sm">{ad.address}</span>
              </div>
            )}
          </div>
        )}

        {/* Rich Content */}
        {ad.content && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div
              className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: ad.content }}
            />
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-gray-300 pb-4">
          anjenMap · anjen.net
        </div>
      </div>

      {/* Bottom floating CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-20">
        <div className="max-w-2xl mx-auto px-4 pb-4">
          <a
            href="/"
            className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-3 rounded-2xl shadow-lg transition-all"
          >
            <Map size={18} />
            www.anjen.net 여행지도에서 더 많은 정보 보기
          </a>
        </div>
      </div>
    </div>
  );
}
