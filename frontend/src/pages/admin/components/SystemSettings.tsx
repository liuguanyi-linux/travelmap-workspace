import React, { useState } from 'react';

export default function SystemSettings({ isCloudSyncing, onEnableCloud }: { isCloudSyncing: boolean, onEnableCloud: (config: any) => boolean }) {
  const [configJson, setConfigJson] = useState('');
  const [error, setError] = useState('');

  const handleConnect = () => {
    try {
      const config = JSON.parse(configJson);
      if (onEnableCloud(config)) {
        alert('连接成功！现在开始实时同步。');
        setConfigJson('');
      } else {
        setError('连接失败，请检查配置是否正确');
      }
    } catch (e) {
      setError('JSON格式错误');
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 max-w-2xl">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        ☁️ 云端数据同步
        {isCloudSyncing ? (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">已连接</span>
        ) : (
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">未连接</span>
        )}
      </h3>
      
      <div className="space-y-4">
        <p className="text-gray-600">
          通过配置 Firebase 数据库，您可以实现多设备实时数据同步。
          修改后的数据将自动保存到云端，所有连接到此数据库的设备都会实时更新。
        </p>

        {!isCloudSyncing && (
          <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
            <strong>如何获取配置？</strong>
            <ol className="list-decimal list-inside mt-2 space-y-1">
              <li>访问 <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="underline">console.firebase.google.com</a> 创建项目</li>
              <li>在项目设置中添加 Web 应用</li>
              <li>复制 SDK 配置 (firebaseConfig) 的 JSON 内容</li>
              <li>粘贴到下方输入框中</li>
            </ol>
            <p className="mt-2 text-xs text-blue-600">
              提示：数据库请选择 Realtime Database，并设置规则为 read/write: true (测试用)
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Firebase 配置 (JSON)</label>
          <textarea
            value={configJson}
            onChange={e => setConfigJson(e.target.value)}
            disabled={isCloudSyncing}
            className="w-full h-48 font-mono text-sm p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder={`{
  "apiKey": "...",
  "authDomain": "...",
  "projectId": "...",
  "storageBucket": "...",
  "messagingSenderId": "...",
  "appId": "..."
}`}
          />
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>

        {!isCloudSyncing ? (
          <button 
            onClick={handleConnect}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors w-full"
          >
            连接云数据库
          </button>
        ) : (
          <div className="text-center text-green-600 py-4 border rounded-lg bg-green-50">
            ✅ 已成功连接到云端数据库，您的数据正在实时同步。
          </div>
        )}
      </div>
    </div>
  );
}
