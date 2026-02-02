import os

file_path = 'src/components/Sidebar.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add isBookable function
is_bookable_func = """
  const isBookable = (type: string) => {
    if (!type) return false;
    return type.includes('酒店') || type.includes('住宿') || type.includes('宾馆') || 
           type.includes('餐饮') || type.includes('餐厅') || type.includes('美食');
  };

"""
if "const isBookable" not in content:
    target = "const handleToggleFavorite"
    if target in content:
        content = content.replace(target, is_bookable_func + target)
    else:
        print("Warning: Could not find insertion point for isBookable")

# 2. Replace Action Buttons
old_btn_start = 'button onClick={() => setBookingModalOpen(true)}'
start_idx = content.find(old_btn_start)
if start_idx != -1:
    next_btn_marker = 'onClick={handleToggleFavorite}'
    end_idx = content.find(next_btn_marker)
    if end_idx != -1:
        btn_end = content.rfind('</button>', 0, end_idx)
        if btn_end != -1:
             real_start = content.rfind('<', 0, start_idx)
             new_block = """{isBookable(selectedPoi.type) ? (
                   <button onClick={() => setBookingModalOpen(true)} className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-2xl font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
                     <Calendar size={18} /> {t.common.book || 'Book'}
                   </button>
                 ) : (
                   <button onClick={() => window.open(https://www.amap.com/search?query=, '_blank')} className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 rounded-2xl font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
                     <Navigation size={18} /> {t.common.navigate || 'Navigate'}
                   </button>
                 )}"""
             content = content[:real_start] + new_block + content[btn_end+9:]
             print("Buttons updated")
    else:
        print("Could not find next button to delimit")
else:
    print("Could not find Book button start")

# 3. Replace Opening Hours
old_hours_snippet = '<span className="text-green-600 font-medium">Open</span>  Closes 10PM'
if old_hours_snippet in content:
    new_hours = '{selectedPoi.biz_ext?.open_time ? (<span>{selectedPoi.biz_ext.open_time}</span>) : (<span className="text-gray-400">Opening hours not available</span>)}'
    content = content.replace(old_hours_snippet, new_hours)
    print("Opening hours updated")
else:
    print("Opening hours snippet not found")

# 4. Replace Website
old_web_snippet = '<div className="text-blue-600 hover:underline cursor-pointer mt-1 font-medium">Visit website</div>'
if old_web_snippet in content:
    globe_idx = content.find('<Globe size={20} />')
    if globe_idx != -1:
        parent_start = content.rfind('<div className="flex gap-4 items-start group">', 0, globe_idx)
        if parent_start != -1:
            visit_idx = content.find(old_web_snippet, globe_idx)
            if visit_idx != -1:
                parent_end = content.find('</div>', visit_idx + len(old_web_snippet)) + 6
                old_block = content[parent_start:parent_end]
                new_block = """{selectedPoi.website && (
                     <div className="flex gap-4 items-start group">
                       <div className="p-2.5 bg-pink-50 rounded-2xl text-pink-600 group-hover:bg-pink-100 transition-colors">
                         <Globe size={20} />
                       </div>
                       <a href={selectedPoi.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline cursor-pointer mt-1 font-medium">Visit website</a>
                     </div>
                   )}"""
                content = content.replace(old_block, new_block)
                print("Website block updated")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
