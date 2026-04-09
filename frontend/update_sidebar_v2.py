import os
import re

file_path = 'src/components/Sidebar.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update Imports
if 'getReviews, createReview' not in content:
    content = content.replace('import { toggleFavorite, getFavorites, createOrUpdatePoi, createBooking, Poi } from \'../api\';', 
                              'import { toggleFavorite, getFavorites, createOrUpdatePoi, createBooking, getReviews, createReview, Poi } from \'../api\';')

# 2. Update State
state_marker = "const [bookingModalOpen, setBookingModalOpen] = useState(false);"
new_state = """const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [reviewContent, setReviewContent] = useState('');
  const [rating, setRating] = useState(5);"""

if 'const [reviews, setReviews]' not in content:
    content = content.replace(state_marker, new_state)

# 3. Add loadReviews
load_fav_marker = "const loadFavorites = async () => {"
new_logic = """const loadReviews = async (poiId: number) => {
    try {
        const data = await getReviews(poiId);
        setReviews(data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (selectedPoi && selectedPoi.id) {
        loadReviews(selectedPoi.id);
    }
  }, [selectedPoi]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPoi.id) return;
    try {
        await createReview(USER_ID, selectedPoi.id, rating, reviewContent);
        setReviewContent('');
        loadReviews(selectedPoi.id);
        showToast('评价已发布');
    } catch (e) {
        showToast('发布评价失败');
    }
  };

  const loadFavorites = async () => {"""

if 'const loadReviews' not in content:
    content = content.replace(load_fav_marker, new_logic)

# 4. Handle 'saved' action
handle_action_regex = r"if \(action === 'saved'\) \{[\s\S]*?\}"
handle_action_new = """if (action === 'saved') {
      // Sidebar will render saved places
      onClear(); // Clear current selection
    }"""
content = re.sub(handle_action_regex, handle_action_new, content)

# 5. Render Saved Places (Insert before main render or inside render)
# We need to conditionally render the Saved list if activeAction === 'saved' and !selectedPoi
# Finding a good insertion point is tricky. Let's look for where `selectedPoi` is checked.

# Strategy: Replace the main return block's beginning
main_render_start = "return ("
render_logic = """
  if (activeAction === 'saved' && !selectedPoi) {
    return (
       <div className={`fixed top-0 left-0 h-full bg-white shadow-xl transition-all duration-300 z-10 flex flex-col ${isCollapsed ? 'w-0' : 'w-[400px]'}`}>
        <div className="p-4 border-b flex items-center gap-4">
             <button onClick={() => setActiveAction(null)} className="p-2 hover:bg-gray-100 rounded-full">
                <ArrowLeft className="w-5 h-5" />
             </button>
             <h2 className="text-xl font-bold">已保存的地点</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
            {savedPlaces.map((poi, idx) => (
                <div key={idx} className="mb-4 p-4 border rounded-lg hover:shadow-md cursor-pointer" onClick={() => onSelectPoi(poi)}>
                    <h3 className="font-bold">{poi.name}</h3>
                    <p className="text-sm text-gray-500">{poi.address}</p>
                    <div className="flex gap-2 mt-2">
                         {poi.type && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{poi.type.split(';')[0]}</span>}
                    </div>
                </div>
            ))}
        </div>
        <MenuDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} onAction={handleAction} />
       </div>
    );
  }

  return ("""

if 'if (activeAction === \'saved\' && !selectedPoi)' not in content:
    content = content.replace(main_render_start, render_logic)


# 6. Add Tabs and Reviews to Detail View
# Find where selectedPoi details are rendered
# Look for <div className="p-4"> (start of details) or the closing of the image section
detail_render_marker = r'<div className="p-4 space-y-4">'
tabs_logic = """
            <div className="flex border-b">
                <button onClick={() => setActiveTab('overview')} className={`flex-1 py-3 text-sm font-medium ${activeTab === 'overview' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>概览</button>
                <button onClick={() => setActiveTab('reviews')} className={`flex-1 py-3 text-sm font-medium ${activeTab === 'reviews' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>评价 ({reviews.length})</button>
                <button onClick={() => setActiveTab('photos')} className={`flex-1 py-3 text-sm font-medium ${activeTab === 'photos' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>照片</button>
            </div>

            {activeTab === 'overview' ? (
                <div className="p-4 space-y-4">"""

if 'setActiveTab' not in content:
    content = content.replace('<div className="p-4 space-y-4">', tabs_logic)

# Close the overview div and add other tabs before the ActionButtons
# Find the Action Buttons section
action_buttons_marker = r'<div className="flex justify-around border-t border-gray-100 p-4">'
tabs_content_end = """
                </div>
            ) : activeTab === 'reviews' ? (
                <div className="p-4 space-y-4 flex-1 overflow-y-auto">
                    <form onSubmit={handleSubmitReview} className="space-y-3 mb-6">
                        <div className="flex items-center gap-2">
                            {[1,2,3,4,5].map(s => (
                                <Star key={s} className={`w-5 h-5 cursor-pointer ${s <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} onClick={() => setRating(s)} />
                            ))}
                        </div>
                        <textarea 
                            value={reviewContent} 
                            onChange={e => setReviewContent(e.target.value)}
                            placeholder="分享您的体验..."
                            className="w-full border rounded-lg p-2 text-sm"
                            rows={3}
                        />
                        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm">发布评价</button>
                    </form>
                    <div className="space-y-4">
                        {reviews.map((review, idx) => (
                            <div key={idx} className="border-b pb-4">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-bold text-sm">用户 {review.user?.nickname || 'Traveler'}</span>
                                    <span className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex gap-1 mb-2">
                                    {[...Array(review.rating)].map((_, i) => <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />)}
                                </div>
                                <p className="text-sm text-gray-700">{review.content}</p>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="p-4 grid grid-cols-2 gap-2">
                    {selectedPoi.photos?.map((photo: any, idx: number) => (
                        <img key={idx} src={photo.url} alt={photo.title} className="w-full h-32 object-cover rounded-lg" />
                    ))}
                    <div className="col-span-2 text-center text-gray-500 py-8">更多照片功能即将上线</div>
                </div>
            )}
            
            <div className="flex justify-around border-t border-gray-100 p-4">"""

if ') : activeTab === \'reviews\'' not in content:
    content = content.replace('<div className="flex justify-around border-t border-gray-100 p-4">', tabs_content_end)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Sidebar v2 updated")
