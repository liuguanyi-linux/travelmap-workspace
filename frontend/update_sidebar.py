import os
import re

file_path = 'src/components/Sidebar.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add Imports
imports_old = "import MenuDrawer from './MenuDrawer';"
imports_new = "import MenuDrawer from './MenuDrawer';\nimport { toggleFavorite, getFavorites, createOrUpdatePoi, createBooking, Poi } from '../api';\n\nconst USER_ID = 1;"
if 'import { toggleFavorite' not in content:
    content = content.replace(imports_old, imports_new)

# 2. Add State and Load Logic
state_old = "const [toastMessage, setToastMessage] = useState<string | null>(null);"
state_new = """const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const favs = await getFavorites(USER_ID);
      setSavedPlaces(favs.map((f: any) => ({ 
          ...f.poi, 
          id: f.poi.amapId, 
          photos: JSON.parse(f.poi.photos || '[]'),
          biz_ext: JSON.parse(f.poi.description || '{}')
      }))); 
    } catch (error) {
      console.error('Failed to load favorites', error);
    }
  };"""
if 'loadFavorites();' not in content:
    content = content.replace(state_old, state_new)

# 3. Update toggleSave
toggle_save_regex = r"const toggleSave = \(poi: any\) => \{[\s\S]*?\};"
toggle_save_new = """const toggleSave = async (poi: any) => {
    try {
        const poiData: Poi = {
            amapId: poi.id, 
            name: poi.name,
            type: poi.type,
            address: poi.address,
            tel: poi.tel,
            location: poi.location ? (typeof poi.location === 'object' ? `${poi.location.lng},${poi.location.lat}` : poi.location) : undefined,
            photos: poi.photos,
            biz_ext: poi.biz_ext
        };
        const savedPoi = await createOrUpdatePoi(poiData);
        
        await toggleFavorite(USER_ID, savedPoi.id!);
        
        showToast(savedPlaces.some(p => p.id === poi.id) ? '已从保存列表中移除' : '已保存地点');
        loadFavorites();
    } catch (error) {
        console.error('Failed to toggle favorite', error);
        showToast('操作失败，请重试');
    }
  };"""

if 'const toggleSave = async' not in content:
    content = re.sub(toggle_save_regex, toggle_save_new, content)

# 4. Update Buttons (Add Booking)
nav_btn_regex = r'<ActionButton \s+icon=\{Navigation\} \s+label="路线" \s+primary \s+onClick=\{\(\) => showToast\(\'路线规划功能正在开发中\'\)\} \s+\/>'
nav_btn_new = """{selectedPoi.type?.includes('酒店') && (
                    <ActionButton 
                      icon={Calendar} 
                      label="预订" 
                      primary
                      onClick={() => setBookingModalOpen(true)} 
                    />
                  )}
                  <ActionButton 
                    icon={Navigation} 
                    label="路线" 
                    primary={!selectedPoi.type?.includes('酒店')}
                    onClick={() => showToast('路线规划功能正在开发中')} 
                  />"""
if 'label="预订"' not in content:
    content = re.sub(nav_btn_regex, nav_btn_new, content)

# 5. Add Modal to Render
render_old = "{toastMessage && <Toast message={toastMessage} />}"
render_new = "{toastMessage && <Toast message={toastMessage} />}\n      <BookingModal isOpen={bookingModalOpen} onClose={() => setBookingModalOpen(false)} poi={selectedPoi} />"
if '<BookingModal' not in content:
    content = content.replace(render_old, render_new)

# 6. Add BookingModal Component
modal_code = """

function BookingModal({ isOpen, onClose, poi }: any) {
    const [date, setDate] = useState('');
    const [guests, setGuests] = useState(1);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const poiData: Poi = {
                amapId: poi.id, 
                name: poi.name,
                type: poi.type,
                address: poi.address,
                tel: poi.tel,
                location: poi.location ? (typeof poi.location === 'object' ? `${poi.location.lng},${poi.location.lat}` : poi.location) : undefined,
                photos: poi.photos,
                biz_ext: poi.biz_ext
            };
            const savedPoi = await createOrUpdatePoi(poiData);
            
            await createBooking(USER_ID, savedPoi.id!, new Date(date), guests);
            alert('预订成功！');
            onClose();
        } catch (error) {
            console.error(error);
            alert('预订失败');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm relative z-10 p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg">预订 {poi.name}</h3>
                    <button onClick={onClose}><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleBooking} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">日期</label>
                        <input 
                            type="date" 
                            required 
                            className="w-full border rounded-lg p-2"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">人数</label>
                        <input 
                            type="number" 
                            min="1" 
                            required 
                            className="w-full border rounded-lg p-2"
                            value={guests}
                            onChange={e => setGuests(parseInt(e.target.value))}
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? '提交中...' : '确认预订'}
                    </button>
                </form>
            </div>
        </div>
    );
}
"""

# FIX BROKEN REPLACEMENTS from previous run
broken_str_1 = "location: poi.location ? (typeof poi.location === 'object' ? , : poi.location) : undefined,"
broken_str_2 = "location: poi.location ? (typeof poi.location === 'object' ? ${poi.location.lng}, : poi.location) : undefined,"
fixed_str = "location: poi.location ? (typeof poi.location === 'object' ? `${poi.location.lng},${poi.location.lat}` : poi.location) : undefined,"

if broken_str_1 in content:
    content = content.replace(broken_str_1, fixed_str)
if broken_str_2 in content:
    content = content.replace(broken_str_2, fixed_str)

if 'function BookingModal' not in content:
    content += modal_code

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Sidebar.tsx updated successfully via Python")
