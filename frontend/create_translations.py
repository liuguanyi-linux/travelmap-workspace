import os

# Create src/utils if not exists
os.makedirs('src/utils', exist_ok=True)

translation_content = """
export const TRANSLATIONS: any = {
  'zh-CN': {
    searchPlaceholder: '在 TravelMap 中搜索...',
    categories: {
      food: '美食', hotel: '酒店', attraction: '景点', shopping: '购物',
      pharmacy: '药店', atm: 'ATM', museum: '博物馆', transport: '交通',
      ticket: '票务', guide: '导游', more: '更多'
    },
    menu: {
      saved: '已保存', recent: '最近', download: '下载应用',
      contributions: '您的贡献', locationSharing: '位置信息分享', timeline: '您的时间轴',
      yourData: '您在 TravelMap 中的数据', share: '分享或嵌入地图', print: '打印',
      addBusiness: '添加您的商家', editMap: '修改地图', tips: '提示和技巧',
      help: '获取帮助', consumerInfo: '消费者信息', language: '语言',
      searchSettings: '搜索设置', mapHistory: '地图历史记录',
      privacy: '隐私权', terms: '条款', footer: '2026 TravelMap Corporation',
      footprint: '您的足迹'
    },
    detail: {
      overview: '概览', reviews: '评价', photos: '照片',
      save: '保存', saved: '已保存', share: '分享', sendToPhone: '发送到手机',
      bookNow: '立即预订', route: '路线', openTime: '营业时间',
      contact: '联系方式', ticketBooking: '门票预订',
      yourRating: '您的评分', shareExperience: '分享您的体验...',
      publishReview: '发布评价', noReviews: '暂无评价，快来抢沙发吧！',
      morePhotosComing: '更多照片功能即将上线',
      pricePerPerson: '人', moderatePrice: '价格适中',
      bookable: '可预订'
    },
    home: {
      explore: '探索世界',
      subtitle: '搜索酒店、餐厅、景点等，开始您的旅程。支持全球20+语言。'
    },
    modal: {
      recentSearch: '最近搜索', noHistory: '暂无搜索记录', clear: '清除记录',
      yourContributions: '您的贡献', noContributions: '您还没有发表过评价',
      moreCategories: '更多分类', demo: '功能演示',
      demoText: '此功能正在开发中，敬请期待！'
    },
    booking: {
      title: '预订酒店', checkIn: '入住日期', guests: '入住人数',
      confirm: '确认预订', submitting: '正在提交...',
      note: '预订不收取任何费用，到店支付'
    },
    toast: {
      saved: '已保存地点', removed: '已从保存列表中移除',
      failed: '操作失败，请重试', reviewPublished: '评价已发布',
      reviewFailed: '发布评价失败', sentToPhone: '已发送到您的手机',
      linkCopied: '链接已复制到剪贴板', routeDev: '路线规划功能正在开发中',
      ticketDev: '票务系统即将上线', langSwitched: '语言已切换'
    }
  },
  'en-US': {
    searchPlaceholder: 'Search in TravelMap...',
    categories: {
      food: 'Food', hotel: 'Hotels', attraction: 'Attractions', shopping: 'Shopping',
      pharmacy: 'Pharmacy', atm: 'ATM', museum: 'Museum', transport: 'Transit',
      ticket: 'Tickets', guide: 'Guides', more: 'More'
    },
    menu: {
      saved: 'Saved', recent: 'Recent', download: 'Download App',
      contributions: 'Your Contributions', locationSharing: 'Location Sharing', timeline: 'Your Timeline',
      yourData: 'Your Data in TravelMap', share: 'Share or Embed Map', print: 'Print',
      addBusiness: 'Add Your Business', editMap: 'Edit Map', tips: 'Tips & Tricks',
      help: 'Get Help', consumerInfo: 'Consumer Info', language: 'Language',
      searchSettings: 'Search Settings', mapHistory: 'Map History',
      privacy: 'Privacy', terms: 'Terms', footer: '2026 TravelMap Corporation',
      footprint: 'Your Footprint'
    },
    detail: {
      overview: 'Overview', reviews: 'Reviews', photos: 'Photos',
      save: 'Save', saved: 'Saved', share: 'Share', sendToPhone: 'Send to Phone',
      bookNow: 'Book Now', route: 'Directions', openTime: 'Hours',
      contact: 'Contact', ticketBooking: 'Book Tickets',
      yourRating: 'Your Rating', shareExperience: 'Share your experience...',
      publishReview: 'Post Review', noReviews: 'No reviews yet. Be the first!',
      morePhotosComing: 'More photos coming soon',
      pricePerPerson: 'pp', moderatePrice: 'Moderate',
      bookable: 'Bookable'
    },
    home: {
      explore: 'Explore the World',
      subtitle: 'Search for hotels, restaurants, attractions and more. Supporting 20+ languages.'
    },
    modal: {
      recentSearch: 'Recent Searches', noHistory: 'No search history', clear: 'Clear History',
      yourContributions: 'Your Contributions', noContributions: 'You haven\'t posted any reviews yet',
      moreCategories: 'More Categories', demo: 'Feature Demo',
      demoText: 'This feature is under development. Stay tuned!'
    },
    booking: {
      title: 'Book Hotel', checkIn: 'Check-in Date', guests: 'Guests',
      confirm: 'Confirm Booking', submitting: 'Submitting...',
      note: 'No payment required now. Pay at the property.'
    },
    toast: {
      saved: 'Place saved', removed: 'Removed from saved list',
      failed: 'Operation failed, please try again', reviewPublished: 'Review posted',
      reviewFailed: 'Failed to post review', sentToPhone: 'Sent to your phone',
      linkCopied: 'Link copied to clipboard', routeDev: 'Directions feature under development',
      ticketDev: 'Ticketing system coming soon', langSwitched: 'Language switched'
    }
  },
  'ja-JP': {
    searchPlaceholder: 'TravelMapを検索...',
    categories: {
      food: '食事', hotel: 'ホテル', attraction: '観光スポット', shopping: '買い物',
      pharmacy: '薬局', atm: 'ATM', museum: '博物館', transport: '交通機関',
      ticket: 'チケット', guide: 'ガイド', more: 'その他'
    },
    menu: {
      saved: '保存済み', recent: '最近', download: 'アプリをダウンロード',
      contributions: '投稿', locationSharing: '現在地の共有', timeline: 'タイムライン',
      yourData: 'TravelMapのデータ', share: '地図を共有または埋め込む', print: '印刷',
      addBusiness: 'ビジネス情報を追加', editMap: '地図を編集', tips: 'ヒントとコツ',
      help: 'ヘルプ', consumerInfo: '消費者情報', language: '言語',
      searchSettings: '検索設定', mapHistory: '地図の履歴',
      privacy: 'プライバシー', terms: '規約', footer: '2026 TravelMap Corporation',
      footprint: 'あなたの足跡'
    },
    detail: {
      overview: '概要', reviews: 'クチコミ', photos: '写真',
      save: '保存', saved: '保存済み', share: '共有', sendToPhone: 'スマホに送信',
      bookNow: '今すぐ予約', route: 'ルート', openTime: '営業時間',
      contact: '連絡先', ticketBooking: 'チケット予約',
      yourRating: 'あなたの評価', shareExperience: '体験を共有...',
      publishReview: '投稿する', noReviews: 'クチコミはまだありません。',
      morePhotosComing: '写真は近日公開予定',
      pricePerPerson: '人', moderatePrice: 'お手頃',
      bookable: '予約可能'
    },
    home: {
      explore: '世界を探索',
      subtitle: 'ホテル、レストラン、観光スポットなどを検索。20以上の言語に対応。'
    },
    modal: {
      recentSearch: '最近の検索', noHistory: '検索履歴はありません', clear: '履歴を消去',
      yourContributions: 'あなたの投稿', noContributions: 'まだクチコミを投稿していません',
      moreCategories: 'その他のカテゴリ', demo: '機能デモ',
      demoText: 'この機能は開発中です。お楽しみに！'
    },
    booking: {
      title: 'ホテルを予約', checkIn: 'チェックイン日', guests: '人数',
      confirm: '予約を確定', submitting: '送信中...',
      note: '事前決済は不要です。現地でお支払いください。'
    },
    toast: {
      saved: '場所を保存しました', removed: '保存済みリストから削除しました',
      failed: '操作に失敗しました。再試行してください', reviewPublished: 'クチコミを投稿しました',
      reviewFailed: '投稿に失敗しました', sentToPhone: 'スマートフォンに送信しました',
      linkCopied: 'リンクをクリップボードにコピーしました', routeDev: 'ルート機能は開発中です',
      ticketDev: 'チケットシステムは近日公開予定', langSwitched: '言語を切り替えました'
    }
  }
};

// Fallback for other languages (defaulting to English for now, or Chinese if preferred)
const SUPPORTED_LANGS = [
  'zh-CN', 'en-US', 'ja-JP', 'ko-KR', 'fr-FR', 'de-DE', 'es-ES', 'pt-BR', 'ru-RU', 'it-IT',
  'ar-SA', 'hi-IN', 'th-TH', 'vi-VN', 'id-ID', 'ms-MY', 'tr-TR', 'nl-NL', 'pl-PL', 'sv-SE'
];

SUPPORTED_LANGS.forEach(lang => {
  if (!TRANSLATIONS[lang]) {
    TRANSLATIONS[lang] = TRANSLATIONS['en-US']; // Default to English for others
  }
});

export const getTranslation = (lang: string) => {
  return TRANSLATIONS[lang] || TRANSLATIONS['zh-CN'];
};
"""

with open('src/utils/translations.ts', 'w', encoding='utf-8') as f:
    f.write(translation_content)

print("Translations created")
