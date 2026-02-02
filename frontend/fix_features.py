import os

# --- Update API ---
api_path = 'src/api/index.ts'
with open(api_path, 'r', encoding='utf-8') as f:
    api_content = f.read()

if 'getUserReviews' not in api_content:
    api_content = api_content.replace(
        "export const createReview = async (userId: number, poiId: number, rating: number, content: string) => {",
        "export const getUserReviews = async (userId: number) => {\n  const response = await api.get(`/reviews/user/${userId}`);\n  return response.data;\n};\n\nexport const createReview = async (userId: number, poiId: number, rating: number, content: string) => {"
    )
    with open(api_path, 'w', encoding='utf-8') as f:
        f.write(api_content)
    print("API updated with getUserReviews")

# --- Update Sidebar ---
sidebar_path = 'src/components/Sidebar.tsx'
with open(sidebar_path, 'r', encoding='utf-8') as f:
    sidebar_content = f.read()

# 1. Add import
if 'getUserReviews' not in sidebar_content:
    sidebar_content = sidebar_content.replace(
        "getReviews, createReview, Poi } from '../api';",
        "getReviews, createReview, getUserReviews, Poi } from '../api';"
    )

# 2. Add saveRecentSearch helper (before handleSearch)
if 'const saveRecentSearch' not in sidebar_content:
    helper_code = """  const saveRecentSearch = (kw: string) => {
    const recent = JSON.parse(localStorage.getItem('recent_searches') || '[]');
    if (!recent.includes(kw)) {
      const newRecent = [kw, ...recent].slice(0, 10);
      localStorage.setItem('recent_searches', JSON.stringify(newRecent));
    }
  };

  const handleSearch = (e: React.FormEvent) => {"""
    sidebar_content = sidebar_content.replace(
        "const handleSearch = (e: React.FormEvent) => {",
        helper_code
    )

# 3. Call saveRecentSearch in handleSearch
sidebar_content = sidebar_content.replace(
    "if (keyword.trim()) {\n      onSearch(keyword);",
    "if (keyword.trim()) {\n      saveRecentSearch(keyword);\n      onSearch(keyword);"
)

# 4. Update ActionModal for Recent and Contributions
# We need to inject logic to fetch reviews for contributions, but ActionModal is a functional component.
# We can't easily add state to it without rewriting it.
# However, we can pass `userReviews` as a prop from Sidebar, or make ActionModal fetch it.
# Making ActionModal fetch it is easier for now to avoid prop drilling if we didn't plan it.
# But ActionModal is defined as a simple function. Let's make it fetch on mount if action is contributions.
# Or better, just read localStorage for recent.
# For contributions, we can use a small useEffect inside ActionModal if we convert it to proper component or just use SWR-like logic.
# Since I can't easily change ActionModal to have state without changing its definition line which I already touched,
# I'll modify ActionModal to be a component that can fetch.

# Wait, ActionModal is `function ActionModal(...)`. I can add hooks inside it.
# It's a functional component.

action_modal_start = "function ActionModal({ action, onClose, savedPlaces, onSearch }: { action: string | null, onClose: () => void, savedPlaces: any[], onSearch: (keyword: string, isNearby?: boolean) => void }) {"
action_modal_body_start = """    if (!action || action === 'saved') return null; // 'saved' is handled by main view

    const [userReviews, setUserReviews] = useState<any[]>([]);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);

    useEffect(() => {
        if (action === 'contributions') {
            getUserReviews(USER_ID).then(setUserReviews).catch(console.error);
        } else if (action === 'recent') {
            setRecentSearches(JSON.parse(localStorage.getItem('recent_searches') || '[]'));
        }
    }, [action]);

    return ("""

sidebar_content = sidebar_content.replace(
    "function ActionModal({ action, onClose, savedPlaces, onSearch }: { action: string | null, onClose: () => void, savedPlaces: any[], onSearch: (keyword: string, isNearby?: boolean) => void }) {\n    if (!action || action === 'saved') return null; // 'saved' is handled by main view\n\n    return (",
    action_modal_start + "\n" + action_modal_body_start
)

# Now replace the "Recent" section
old_recent = """                    {action === 'recent' ? (
                        <div className="p-4">
                            <p className="text-gray-500 text-sm mb-4">这里将显示您的最近搜索记录。</p>
                            <div className="p-3 bg-blue-50 text-blue-800 text-xs rounded border border-blue-100">
                                演示模式：后端数据库连接正常，但此功能尚未完全实现。
                            </div>
                        </div>
                    )"""
new_recent = """                    {action === 'recent' ? (
                        <div className="p-4">
                            <h4 className="font-bold mb-3 text-sm text-gray-700">最近搜索</h4>
                            {recentSearches.length === 0 ? (
                                <p className="text-gray-500 text-sm">暂无搜索记录</p>
                            ) : (
                                <div className="space-y-2">
                                    {recentSearches.map((kw, i) => (
                                        <div key={i} onClick={() => { onSearch(kw); onClose(); }} className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded cursor-pointer">
                                            <History className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm text-gray-700">{kw}</span>
                                        </div>
                                    ))}
                                    <button onClick={() => { localStorage.removeItem('recent_searches'); setRecentSearches([]); }} className="text-xs text-red-500 mt-4 hover:underline">清除记录</button>
                                </div>
                            )}
                        </div>
                    )"""
sidebar_content = sidebar_content.replace(old_recent, new_recent)

# Replace "Contributions" section (which was generic "demo" before)
# It was: {action === 'recent' && ...} {action === 'contributions' && '您的贡献'} ...
# Actually in the header it says '您的贡献', but in body it falls through to "功能演示".
# We need to add a specific check for contributions in the body.

old_categories = """                    ) : action === 'categories' ? ("""
new_categories = """                    ) : action === 'contributions' ? (
                        <div className="p-4">
                            {userReviews.length === 0 ? (
                                <p className="text-gray-500 text-sm text-center">您还没有发表过评价</p>
                            ) : (
                                <div className="space-y-4">
                                    {userReviews.map((r, i) => (
                                        <div key={i} className="border-b pb-3 last:border-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="font-bold text-sm">{r.poi?.name || '未知地点'}</h4>
                                                <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex mb-1">{[...Array(r.rating)].map((_, j) => <Star key={j} className="w-3 h-3 fill-yellow-400 text-yellow-400" />)}</div>
                                            <p className="text-xs text-gray-600 line-clamp-2">{r.content}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : action === 'categories' ? ("""

sidebar_content = sidebar_content.replace(old_categories, new_categories)

with open(sidebar_path, 'w', encoding='utf-8') as f:
    f.write(sidebar_content)

print("Sidebar updated with Recent and Contributions")
