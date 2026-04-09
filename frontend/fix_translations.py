import os
file_path = 'src/utils/translations.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()
if "navigate: 'Navigate'," not in content:
    content = content.replace("savedPlaces: '已保存的地点',", "savedPlaces: '已保存的地点', book: '预订', navigate: '导航',")
    content = content.replace("savedPlaces: 'Saved Places',", "savedPlaces: 'Saved Places', book: 'Book', navigate: 'Navigate',")
    content = content.replace("savedPlaces: '保存された場所',", "savedPlaces: '保存された場所', book: '予約', navigate: 'ナビ',")
    content = content.replace("savedPlaces: '저장된 장소',", "savedPlaces: '저장된 장소', book: '예약', navigate: '길찾기',")
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print('Translations updated')
else:
    print('Translations already updated')
