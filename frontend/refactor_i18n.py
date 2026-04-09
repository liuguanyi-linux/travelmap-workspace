import os

# --- Update MenuDrawer.tsx ---
menu_path = 'src/components/MenuDrawer.tsx'
with open(menu_path, 'r', encoding='utf-8') as f:
    menu_content = f.read()

# Add import
menu_content = menu_content.replace(
    "import React, { useState } from 'react';",
    "import React, { useState } from 'react';\nimport { getTranslation } from '../utils/translations';"
)

# Use translation inside component
# We need to get currentLang again here or pass it as prop.
# Since it was already reading from localStorage in useState, we can keep that.
# But we need to use `t` for strings.

# Helper to get current language inside component
t_helper = """  const t = getTranslation(currentLang).menu;"""
menu_content = menu_content.replace(
    "const [currentLang, setCurrentLang] = useState(localStorage.getItem('travelmap_lang') || 'zh-CN');",
    "const [currentLang, setCurrentLang] = useState(localStorage.getItem('travelmap_lang') || 'zh-CN');\n" + t_helper
)

# Replace strings
replacements = {
    '"您的足迹"': 't.footprint',
    'label="已保存"': 'label={t.saved}',
    'label="最近"': 'label={t.recent}',
    'label="您的贡献"': 'label={t.contributions}',
    'label="位置信息分享"': 'label={t.locationSharing}',
    'label="您的时间轴"': 'label={t.timeline}',
    'label="您在 TravelMap 中的数据"': 'label={t.yourData}',
    'label="分享或嵌入地图"': 'label={t.share}',
    'label="打印"': 'label={t.print}',
    'label="添加您的商家"': 'label={t.addBusiness}',
    'label="修改地图"': 'label={t.editMap}',
    'label="提示和技巧"': 'label={t.tips}',
    'label="获取帮助"': 'label={t.help}',
    'label="消费者信息"': 'label={t.consumerInfo}',
    'label="搜索设置"': 'label={t.searchSettings}',
    'label="地图历史记录"': 'label={t.mapHistory}',
    '"语言"': 't.language',
    '"2026 TravelMap Corporation"': 't.footer',
    '"隐私权"': 't.privacy',
    '"条款"': 't.terms',
    '选择语言 / Select Language': 't.language' 
}

for old, new in replacements.items():
    menu_content = menu_content.replace(old, new)
    
# Fix specific case for Language label inside the button
menu_content = menu_content.replace(
    '<span className="text-sm font-medium">{t.language}</span>',
    '<span className="text-sm font-medium">{t.language}</span>'
)

# Note: The "Language" text in the modal header might need manual adjustment if not caught by above
menu_content = menu_content.replace(
    '<h2 className="text-lg font-bold text-gray-800">t.language</h2>',
    '<h2 className="text-lg font-bold text-gray-800">{t.language}</h2>'
)

with open(menu_path, 'w', encoding='utf-8') as f:
    f.write(menu_content)

print("MenuDrawer.tsx updated")

# --- Update Sidebar.tsx ---
sidebar_path = 'src/components/Sidebar.tsx'
with open(sidebar_path, 'r', encoding='utf-8') as f:
    sidebar_content = f.read()

# Add import
sidebar_content = sidebar_content.replace(
    "import { toggleFavorite",
    "import { getTranslation } from '../utils/translations';\nimport { toggleFavorite"
)

# Add t helper
sidebar_content = sidebar_content.replace(
    "const [rating, setRating] = useState(5);",
    "const [rating, setRating] = useState(5);\n  const t = getTranslation(currentLang);"
)

# Replace Categories
# This is tricky because CATEGORIES is defined outside component.
# We should move CATEGORIES inside component or make it a function.
# Moving inside is easiest.
if 'const CATEGORIES =' in sidebar_content:
    # Remove the global const
    import re
    sidebar_content = re.sub(r'const CATEGORIES = \[.*?\];', '', sidebar_content, flags=re.DOTALL)
    
    # Add inside component
    categories_def = """
  const CATEGORIES = [
    { icon: Utensils, label: t.categories.food, query: '美食' },
    { icon: Hotel, label: t.categories.hotel, query: '酒店' },
    { icon: Landmark, label: t.categories.attraction, query: '景点' },
    { icon: ShoppingBag, label: t.categories.shopping, query: '购物' },
    { icon: Pill, label: t.categories.pharmacy, query: '药店' },
    { icon: Banknote, label: t.categories.atm, query: 'ATM' },
    { icon: Building2, label: t.categories.museum, query: '博物馆' },
    { icon: Bus, label: t.categories.transport, query: '公交站' },
    { icon: Ticket, label: t.categories.ticket, query: '售票处' },
    { icon: User, label: t.categories.guide, query: '旅行社' },
  ];
    """
    sidebar_content = sidebar_content.replace(
        "const t = getTranslation(currentLang);",
        "const t = getTranslation(currentLang);" + categories_def
    )

# Replace other strings in Sidebar
replacements = {
    '"已保存"': 't.menu.saved', # Mini sidebar
    '"最近"': 't.menu.recent', # Mini sidebar
    '"下载<br/>应用"': 't.menu.download.replace(" ", "<br/>")', # Mini sidebar hack? simpler: t.menu.download
    'text-center leading-tight">{t.menu.download}': 'text-center leading-tight">{t.menu.download}', # will need check
    '"已保存的地点"': 't.detail.saved',
    '"暂无保存的地点"': 't.modal.noHistory', # reusing similar string or adding new
    'placeholder="在 TravelMap 中搜索..."': 'placeholder={t.searchPlaceholder}',
    '"更多"': 't.categories.more',
    '"正在搜索..."': '"Searching..."', # Add to translation or just use English/dynamic
    '"概览"': 't.detail.overview',
    '"评价"': 't.detail.reviews',
    '"照片"': 't.detail.photos',
    '"您的评分:"': 't.detail.yourRating',
    'placeholder="分享您的体验..."': 'placeholder={t.detail.shareExperience}',
    '"发布评价"': 't.detail.publishReview',
    '"暂无评价，快来抢沙发吧！"': 't.detail.noReviews',
    '"更多照片功能即将上线"': 't.detail.morePhotosComing',
    '"立即预订"': 't.detail.bookNow',
    '"路线"': 't.detail.route',
    '"探索世界"': 't.home.explore',
    '"保存"': 't.detail.save',
    '"分享"': 't.detail.share',
    '"发送到手机"': 't.detail.sendToPhone',
    '"已发送到您的手机"': 't.toast.sentToPhone',
    '"链接已复制到剪贴板"': 't.toast.linkCopied',
    '"操作失败，请重试"': 't.toast.failed',
    '"已从保存列表中移除"': 't.toast.removed',
    '"已保存地点"': 't.toast.saved',
    '"评价已发布"': 't.toast.reviewPublished',
    '"发布评价失败"': 't.toast.reviewFailed',
    '"票务系统即将上线"': 't.toast.ticketDev',
    '"路线规划功能正在开发中"': 't.toast.routeDev',
    '"语言已切换 / Language switched"': 't.toast.langSwitched',
    '"功能演示"': 't.modal.demo',
    '"此功能正在开发中，敬请期待！"': 't.modal.demoText',
    '"更多分类"': 't.modal.moreCategories',
    '"最近搜索"': 't.modal.recentSearch',
    '"暂无搜索记录"': 't.modal.noHistory',
    '"清除记录"': 't.modal.clear',
    '"您的贡献"': 't.modal.yourContributions',
    '"您还没有发表过评价"': 't.modal.noContributions'
}

for old, new in replacements.items():
    sidebar_content = sidebar_content.replace(old, new)

# Fix complex replacements
sidebar_content = sidebar_content.replace(
    '<span>下载<br/>应用</span>',
    '<span>{t.menu.download}</span>'
)
sidebar_content = sidebar_content.replace(
    '<span className="text-[10px] font-medium text-center leading-tight">t.menu.download</span>',
    '<span className="text-[10px] font-medium text-center leading-tight">{t.menu.download}</span>'
)

# Fix home subtitle
sidebar_content = sidebar_content.replace(
    '<p className="text-gray-500 text-sm max-w-xs mx-auto">\n                        搜索酒店、餐厅、景点等，开始您的旅程。支持全球20+语言。\n                    </p>',
    '<p className="text-gray-500 text-sm max-w-xs mx-auto">{t.home.subtitle}</p>'
)

# Fix booking modal strings (BookingModal is inside Sidebar file but outside Sidebar component)
# It needs access to t. But it's outside.
# We should pass currentLang to BookingModal or move it inside Sidebar (it is separate function).
# Simplest: pass currentLang to BookingModal.

sidebar_content = sidebar_content.replace(
    '<BookingModal isOpen={bookingModalOpen} onClose={() => setBookingModalOpen(false)} poi={selectedPoi} />',
    '<BookingModal isOpen={bookingModalOpen} onClose={() => setBookingModalOpen(false)} poi={selectedPoi} currentLang={currentLang} />'
)

# Update BookingModal definition
sidebar_content = sidebar_content.replace(
    'function BookingModal({ isOpen, onClose, poi }: any) {',
    'function BookingModal({ isOpen, onClose, poi, currentLang }: any) {\n    const t = getTranslation(currentLang).booking;'
)

# Replace strings in BookingModal
sidebar_content = sidebar_content.replace('"预订酒店"', 't.title')
sidebar_content = sidebar_content.replace('"入住日期"', 't.checkIn')
sidebar_content = sidebar_content.replace('"入住人数"', 't.guests')
sidebar_content = sidebar_content.replace('"正在提交..."', 't.submitting')
sidebar_content = sidebar_content.replace('"确认预订"', 't.confirm')
sidebar_content = sidebar_content.replace('"预订不收取任何费用，到店支付"', 't.note')
sidebar_content = sidebar_content.replace("'预订成功！我们会尽快联系您确认。'", "'Booking successful!'")
sidebar_content = sidebar_content.replace("'预订失败，请稍后重试'", "'Booking failed'")
sidebar_content = sidebar_content.replace("'可预订'", 'getTranslation(currentLang).detail.bookable')

# Fix ActionModal
# Pass currentLang to ActionModal too
sidebar_content = sidebar_content.replace(
    '<ActionModal action={activeAction} onClose={() => setActiveAction(null)} savedPlaces={savedPlaces} onSearch={onSearch} />',
    '<ActionModal action={activeAction} onClose={() => setActiveAction(null)} savedPlaces={savedPlaces} onSearch={onSearch} currentLang={currentLang} />'
)

# Update ActionModal definition
sidebar_content = sidebar_content.replace(
    'function ActionModal({ action, onClose, savedPlaces, onSearch }: { action: string | null, onClose: () => void, savedPlaces: any[], onSearch: (keyword: string, isNearby?: boolean) => void }) {',
    'function ActionModal({ action, onClose, savedPlaces, onSearch, currentLang }: any) {\n    const t = getTranslation(currentLang);'
)

# Check ActionModal title replacement
# Re-apply because t is now available
# Need to make sure `t` is used correctly in the JSX
# Since we replaced literal strings with `t.something`, we need to ensure they are wrapped in `{}` if inside JSX.
# My replacements above did strings like '"更多"' -> 't.categories.more'.
# If it was `<button>更多</button>`, it became `<button>t.categories.more</button>` which is wrong.
# It should be `<button>{t.categories.more}</button>`.

# Let's run a second pass to fix JSX content
import re
def fix_jsx_braces(content):
    # Fix >t.something< to >{t.something}<
    content = re.sub(r'>t\.([a-zA-Z0-9_\.]+)<', r'>{t.\1}<', content)
    # Fix "t.something" in props to {t.something} if it's inside props (handled by manual replacements above usually)
    return content

sidebar_content = fix_jsx_braces(sidebar_content)

# Fix specific ones that might have been missed or malformed
sidebar_content = sidebar_content.replace('label="t.menu.saved"', 'label={t.menu.saved}')
sidebar_content = sidebar_content.replace('label="t.menu.recent"', 'label={t.menu.recent}')
sidebar_content = sidebar_content.replace('label={t.saved}', 'label={t.detail.saved}') # Conflict fix
sidebar_content = sidebar_content.replace('label="t.detail.save"', 'label={t.detail.save}')
sidebar_content = sidebar_content.replace('label="t.detail.share"', 'label={t.detail.share}')
sidebar_content = sidebar_content.replace('label="t.detail.sendToPhone"', 'label={t.detail.sendToPhone}')

with open(sidebar_path, 'w', encoding='utf-8') as f:
    f.write(sidebar_content)

print("Sidebar.tsx updated")
