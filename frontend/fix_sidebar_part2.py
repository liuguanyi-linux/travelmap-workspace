import os

file_path = 'src/components/Sidebar.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 3. Replace Opening Hours - Retry
idx = content.find('Closes 10PM')
if idx != -1:
    div_start = content.rfind('<div className="text-gray-600 mt-1">', 0, idx)
    if div_start != -1:
        div_end = content.find('</div>', idx)
        if div_end != -1:
             old_block = content[div_start:div_end+6]
             new_block = '<div className="text-gray-600 mt-1">{selectedPoi.biz_ext?.open_time ? (<span>{selectedPoi.biz_ext.open_time}</span>) : (<span className="text-gray-400">Opening hours not available</span>)}</div>'
             content = content.replace(old_block, new_block)
             print("Opening hours updated")
    else:
        print("Could not find opening hours div start")
else:
    print("Could not find Closes 10PM")

# 4. Replace Website - Retry
idx = content.find('>Visit website</div>')
if idx != -1:
    div_end = idx + len('>Visit website</div>')
    div_start = content.rfind('<div', 0, idx)
    
    globe_idx = content.rfind('<Globe size={20} />', 0, div_start)
    if globe_idx != -1:
         parent_start = content.rfind('<div className="flex gap-4 items-start group">', 0, globe_idx)
         if parent_start != -1:
             parent_end = content.find('</div>', div_end) + 6
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
             print("Website updated")
         else:
             print("Could not find parent start")
    else:
        print("Could not find Globe icon")
else:
    print("Could not find Visit website div")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
