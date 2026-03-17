import React, { useState, useEffect } from 'react';
import { usageGuideService } from '../../../services/api';
import { UsageGuide } from '../../../types/data';
import { Trash2, Plus, Edit2, Save, Loader2 } from 'lucide-react';
import RichTextEditor from '../../../components/admin/RichTextEditor';

export default function UsageGuideManager() {
  const [guides, setGuides] = useState<UsageGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentGuide, setCurrentGuide] = useState<Partial<UsageGuide>>({
    title: '',
    titleEn: '',
    titleKo: '',
    content: '',
    contentEn: '',
    contentKo: ''
  });
  const [saving, setSaving] = useState(false);
  const [activeLang, setActiveLang] = useState<'zh' | 'en' | 'ko'>('zh');

  useEffect(() => {
    fetchGuides();
  }, []);

  const fetchGuides = async () => {
    try {
      setLoading(true);
      const data = await usageGuideService.getAll();
      setGuides(data);
    } catch (error) {
      console.error('Failed to fetch guides', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (guide: UsageGuide) => {
    setCurrentGuide(guide);
    setIsEditing(true);
  };

  const handleCreate = () => {
    setCurrentGuide({ title: '', titleEn: '', titleKo: '', content: '', contentEn: '', contentKo: '' });
    setIsEditing(true);
    setActiveLang('zh');
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('确定要删除吗？')) return;
    try {
      await usageGuideService.delete(id);
      fetchGuides();
    } catch (error) {
      console.error('Failed to delete guide', error);
      alert('删除失败');
    }
  };

  const handleSave = async () => {
    if (!currentGuide.title || !currentGuide.content) {
      alert('中文标题和内容不能为空');
      return;
    }

    try {
      setSaving(true);
      if (currentGuide.id) {
        await usageGuideService.update(currentGuide.id, currentGuide);
      } else {
        await usageGuideService.create(currentGuide);
      }
      setIsEditing(false);
      fetchGuides();
    } catch (error) {
      console.error('Failed to save guide', error);
      alert('保存失败');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
  }

  if (isEditing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">
            {currentGuide.id ? '编辑介绍' : '新建介绍'}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              保存
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex space-x-2 border-b border-gray-200 mb-4">
             <button
               onClick={() => setActiveLang('zh')}
               className={`px-4 py-2 text-sm font-medium ${activeLang === 'zh' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
             >
               简体中文 (默认)
             </button>
             <button
               onClick={() => setActiveLang('en')}
               className={`px-4 py-2 text-sm font-medium ${activeLang === 'en' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
             >
               English
             </button>
             <button
               onClick={() => setActiveLang('ko')}
               className={`px-4 py-2 text-sm font-medium ${activeLang === 'ko' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
             >
               한국어
             </button>
          </div>

          {activeLang === 'zh' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">标题 (中文)</label>
                <input
                  type="text"
                  value={currentGuide.title || ''}
                  onChange={(e) => setCurrentGuide(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入标题"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">内容 (中文)</label>
                <RichTextEditor
                  value={currentGuide.content || ''}
                  onChange={(val) => setCurrentGuide(prev => ({ ...prev, content: val }))}
                  placeholder="请输入内容..."
                />
              </div>
            </>
          )}

          {activeLang === 'en' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title (English)</label>
                <input
                  type="text"
                  value={currentGuide.titleEn || ''}
                  onChange={(e) => setCurrentGuide(prev => ({ ...prev, titleEn: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter title in English"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content (English)</label>
                <RichTextEditor
                  value={currentGuide.contentEn || ''}
                  onChange={(val) => setCurrentGuide(prev => ({ ...prev, contentEn: val }))}
                  placeholder="Enter content in English..."
                />
              </div>
            </>
          )}

          {activeLang === 'ko' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">제목 (한국어)</label>
                <input
                  type="text"
                  value={currentGuide.titleKo || ''}
                  onChange={(e) => setCurrentGuide(prev => ({ ...prev, titleKo: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="제목 입력"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">내용 (한국어)</label>
                <RichTextEditor
                  value={currentGuide.contentKo || ''}
                  onChange={(val) => setCurrentGuide(prev => ({ ...prev, contentKo: val }))}
                  placeholder="내용 입력..."
                />
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">使用介绍管理</h2>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          新建介绍
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">ID</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">标题</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">更新时间</th>
              <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {guides.map((guide) => (
              <tr key={guide.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-500">{guide.id}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{guide.title}</td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(guide.updatedAt).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button
                    onClick={() => handleEdit(guide)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="编辑"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(guide.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="删除"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {guides.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                  暂无数据
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
