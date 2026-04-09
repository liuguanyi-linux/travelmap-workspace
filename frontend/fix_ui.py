import os

# --- MenuDrawer.tsx ---
menu_drawer_path = 'src/components/MenuDrawer.tsx'
with open(menu_drawer_path, 'r', encoding='utf-8') as f:
    menu_content = f.read()

# Update state initialization
menu_content = menu_content.replace(
    "const [currentLang, setCurrentLang] = useState('zh-CN');",
    "const [currentLang, setCurrentLang] = useState(localStorage.getItem('travelmap_lang') || 'zh-CN');"
)

# Update onClick handler
menu_content = menu_content.replace(
    "setCurrentLang(lang.code);\n                    setShowLanguages(false);\n                    handleAction('language');",
    "setCurrentLang(lang.code);\n                    localStorage.setItem('travelmap_lang', lang.code);\n                    setShowLanguages(false);\n                    handleAction('language:' + lang.code);"
)

with open(menu_drawer_path, 'w', encoding='utf-8') as f:
    f.write(menu_content)

print("MenuDrawer.tsx updated")

# --- Sidebar.tsx ---
sidebar_path = 'src/components/Sidebar.tsx'
with open(sidebar_path, 'r', encoding='utf-8') as f:
    sidebar_content = f.read()

# Update ActionModal signature
sidebar_content = sidebar_content.replace(
    "function ActionModal({ action, onClose, savedPlaces }: { action: string | null, onClose: () => void, savedPlaces: any[] }) {",
    "function ActionModal({ action, onClose, savedPlaces, onSearch }: { action: string | null, onClose: () => void, savedPlaces: any[], onSearch: (keyword: string, isNearby?: boolean) => void }) {"
)

# Update ActionModal usage (2 occurrences)
sidebar_content = sidebar_content.replace(
    "<ActionModal action={activeAction} onClose={() => setActiveAction(null)} savedPlaces={savedPlaces} />",
    "<ActionModal action={activeAction} onClose={() => setActiveAction(null)} savedPlaces={savedPlaces} onSearch={onSearch} />"
)

# Update Category Buttons in ActionModal
# We use a regex or string replacement for the button part
old_button = 'button key={idx} className="flex flex-col items-center gap-2"'
new_button = 'button key={idx} className="flex flex-col items-center gap-2" onClick={() => { onSearch(cat.query, true); onClose(); }}'
sidebar_content = sidebar_content.replace(old_button, new_button)

# Update handleAction to handle language
handle_action_logic = """    } else if (action === 'saved') {
      onClear(); // Clear current selection to show saved list
    }"""
new_handle_action_logic = """    } else if (action === 'saved') {
      onClear(); // Clear current selection to show saved list
    } else if (action && action.startsWith('language')) {
      const langCode = action.split(':')[1];
      showToast('语言已切换 / Language switched');
      setActiveAction(null);
    }"""
sidebar_content = sidebar_content.replace(handle_action_logic, new_handle_action_logic)

with open(sidebar_path, 'w', encoding='utf-8') as f:
    f.write(sidebar_content)

print("Sidebar.tsx updated")
