import React, { useEffect, useState } from 'react';
import { Loader2, Mail, Calendar, User, Monitor, Smartphone, Tablet, MapPin, Wifi } from 'lucide-react';
import api, { userService } from "../../../services/api";

interface UserData {
  id: number;
  email: string;
  nickname: string;
  createdAt: string;
}

interface LoginLog {
  id: number;
  email: string;
  ip: string;
  country: string;
  region: string;
  city: string;
  isp: string;
  device: string;
  loginAt: string;
}

interface DayStat {
  date: string;
  kr: number;
  total: number;
}

export default function UserList() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [logs, setLogs] = useState<LoginLog[]>([]);
  const [tab, setTab] = useState<'stats' | 'logs' | 'users'>('stats');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      userService.getAll().catch(() => []),
      api.get('/users/login-logs').then(r => r.data).catch(() => []),
    ]).then(([u, l]) => {
      setUsers(u);
      setLogs(l);
      setLoading(false);
    });
  }, []);

  const DeviceIcon = ({ device }: { device: string }) => {
    if (device === '手机') return <Smartphone size={14} className="text-blue-500" />;
    if (device === '平板') return <Tablet size={14} className="text-purple-500" />;
    return <Monitor size={14} className="text-gray-500" />;
  };

  const locationStr = (log: LoginLog) => {
    const parts = [log.country, log.region, log.city].filter(Boolean);
    return parts.length ? parts.join(' · ') : '-';
  };

  const isKorea = (country: string) => {
    const c = (country || '').toLowerCase();
    return c === '韩国' || c.includes('korea') || c.includes('한국');
  };

  const dayStats: DayStat[] = React.useMemo(() => {
    const map: Record<string, { kr: number; total: number }> = {};
    logs.forEach(log => {
      const d = new Date(log.loginAt);
      const date = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      if (!map[date]) map[date] = { kr: 0, total: 0 };
      map[date].total += 1;
      if (isKorea(log.country)) map[date].kr += 1;
    });
    return Object.entries(map)
      .map(([date, v]) => ({ date, ...v }))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [logs]);

  const totalKr = dayStats.reduce((s, d) => s + d.kr, 0);
  const totalAll = dayStats.reduce((s, d) => s + d.total, 0);
  const maxKr = Math.max(...dayStats.map(d => d.kr), 1);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button onClick={() => setTab('stats')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'stats' ? 'bg-blue-600 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}>
          韩国客户统计
        </button>
        <button onClick={() => setTab('logs')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'logs' ? 'bg-blue-600 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}>
          登录记录 ({logs.length})
        </button>
        <button onClick={() => setTab('users')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'users' ? 'bg-blue-600 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}>
          用户列表 ({users.length})
        </button>
      </div>

      {tab === 'stats' && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{totalKr}</div>
              <div className="text-xs text-gray-500 mt-1">韩国登录总次数</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
              <div className="text-2xl font-bold text-gray-700">{totalAll}</div>
              <div className="text-xs text-gray-500 mt-1">全部登录总次数</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{totalAll > 0 ? Math.round(totalKr / totalAll * 100) : 0}%</div>
              <div className="text-xs text-gray-500 mt-1">韩国占比</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-800">按天统计</h2>
              <p className="text-xs text-gray-400 mt-0.5">每天韩国 IP 登录次数（蓝色柱=韩国，共=全部）</p>
            </div>
            {dayStats.length === 0 ? (
              <div className="p-10 text-center text-gray-400 text-sm">暂无数据</div>
            ) : (
              <div className="divide-y divide-gray-50">
                {dayStats.map(day => (
                  <div key={day.date} className="px-4 py-3 flex items-center gap-4">
                    <div className="w-28 text-sm text-gray-600 shrink-0">{day.date}</div>
                    <div className="flex-1 flex items-center gap-3">
                      <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="h-2.5 bg-blue-500 rounded-full"
                          style={{ width: `${Math.round(day.kr / maxKr * 100)}%` }}
                        />
                      </div>
                      <div className="w-20 text-sm font-semibold text-blue-600 text-right shrink-0">
                        韩国 {day.kr} 人
                      </div>
                      <div className="w-16 text-xs text-gray-400 text-right shrink-0">
                        共 {day.total}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'logs' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-800">最近 200 条登录记录</h2>
            <p className="text-xs text-gray-400 mt-0.5">韩国 IP 行已高亮显示</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">邮箱</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">登录时间</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">设备</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">IP</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">地区</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">运营商</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {logs.map((log) => (
                  <tr key={log.id} className={`hover:bg-gray-50 transition-colors ${isKorea(log.country) ? 'bg-blue-50' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Mail size={13} className="text-gray-400 shrink-0" />
                        <span className="text-gray-800">{log.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{new Date(log.loginAt).toLocaleString('zh-CN')}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <DeviceIcon device={log.device} />
                        <span className="text-gray-600">{log.device || '-'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{log.ip || '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <MapPin size={12} className="text-gray-400 shrink-0" />
                        <span className={`${isKorea(log.country) ? 'text-blue-600 font-medium' : 'text-gray-600'}`}>{locationStr(log)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Wifi size={12} className="text-gray-400 shrink-0" />
                        <span className="text-gray-500 text-xs">{log.isp || '-'}</span>
                      </div>
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400 text-sm">暂无登录记录</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'users' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-800">注册用户 ({users.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">邮箱</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">昵称</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">注册时间</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-400">#{user.id}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Mail size={13} className="text-gray-400" />
                        <span className="text-gray-800">{user.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <User size={13} className="text-gray-400" />
                        <span className="text-gray-600">{user.nickname || '-'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-gray-400" />
                        <span className="text-gray-500">{new Date(user.createdAt).toLocaleString('zh-CN')}</span>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-10 text-center text-gray-400 text-sm">暂无用户</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
