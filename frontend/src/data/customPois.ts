
// Custom curated POI data
// Structure matches AMap POI object
export interface CustomPoi {
    id: string;
    name: string;
    type: string;
    address: string;
    location: {
        lng: number;
        lat: number;
    };
    photos: Array<{
        url: string;
        title?: string;
    }>;
    tel?: string;
}

/**
 * ==============================================================================
 * 📝 如何添加新地点？ (How to add new POIs)
 * 请提供以下信息，复制并填写给开发人员即可：
 * 
 * 1. 城市 (City): 例如 "首尔"
 * 2. 类型 (Category): "attraction"(景点) / "hotel"(酒店) / "food"(美食) / "shopping"(购物)
 * 3. 名称 (Name): 
 * 4. 地址 (Address): 
 * 5. 坐标 (Location): 经度(lng), 纬度(lat) - 可在高德地图拾取坐标系统查询
 * 6. 图片 (Photo URL): 
 * 7. 电话 (Phone): (可选)
 * ==============================================================================
 */

export const CUSTOM_POIS: Record<string, Record<string, CustomPoi[]>> = {
    '上海': {
        'attraction': [
            {
                id: 'custom_sh_attr_1',
                name: '东方明珠广播电视塔',
                type: '风景名胜;公园广场;公园广场',
                address: '上海市浦东新区世纪大道1号',
                location: { lng: 121.499809, lat: 31.239666 },
                photos: [{ url: 'https://images.unsplash.com/photo-1536526182902-60281b369528?q=80&w=1000&auto=format&fit=crop' }],
                tel: '021-58791888'
            },
            {
                id: 'custom_sh_attr_2',
                name: '外滩',
                type: '风景名胜;风景名胜;风景名胜',
                address: '上海市黄浦区中山东一路',
                location: { lng: 121.490517, lat: 31.232306 },
                photos: [{ url: 'https://images.unsplash.com/photo-1548919973-5cef591cdbc9?q=80&w=1000&auto=format&fit=crop' }],
                tel: ''
            },
            {
                id: 'custom_sh_attr_3',
                name: '上海迪士尼度假区',
                type: '风景名胜;公园广场;游乐场',
                address: '上海市浦东新区川沙新镇',
                location: { lng: 121.667917, lat: 31.149712 },
                photos: [{ url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000&auto=format&fit=crop' }],
                tel: '400-180-0000'
            }
        ],
        'hotel': [
            {
                id: 'custom_sh_hotel_1',
                name: '和平饭店',
                type: '住宿服务;宾馆酒店;五星级宾馆',
                address: '上海市黄浦区南京东路20号',
                location: { lng: 121.488338, lat: 31.240755 },
                photos: [{ url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000&auto=format&fit=crop' }],
                tel: '021-63216888'
            },
            {
                id: 'custom_sh_hotel_2',
                name: '上海金茂君悦大酒店',
                type: '住宿服务;宾馆酒店;五星级宾馆',
                address: '上海市浦东新区世纪大道88号金茂大厦',
                location: { lng: 121.505672, lat: 31.235178 },
                photos: [{ url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=1000&auto=format&fit=crop' }],
                tel: '021-50491234'
            }
        ],
        'food': [
            {
                id: 'custom_sh_food_1',
                name: '南翔馒头店(豫园路店)',
                type: '餐饮服务;中餐厅;中餐厅',
                address: '上海市黄浦区豫园路85号',
                location: { lng: 121.492582, lat: 31.227466 },
                photos: [{ url: 'https://images.unsplash.com/photo-1626804475297-411dbe655c63?q=80&w=1000&auto=format&fit=crop' }],
                tel: '021-63553777'
            },
            {
                id: 'custom_sh_food_2',
                name: '老正兴菜馆(福州路店)',
                type: '餐饮服务;中餐厅;上海菜',
                address: '上海市黄浦区福州路556号',
                location: { lng: 121.480283, lat: 31.232378 },
                photos: [{ url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1000&auto=format&fit=crop' }],
                tel: '021-63222624'
            }
        ]
    },
    '青岛': {
        'attraction': [
            {
                id: 'custom_qd_attr_1',
                name: '栈桥',
                type: '风景名胜;风景名胜;风景名胜',
                address: '青岛市市南区太平路12号',
                location: { lng: 120.316885, lat: 36.061732 },
                photos: [{ url: 'https://images.unsplash.com/photo-1615886695669-02d242490b4d?q=80&w=1000&auto=format&fit=crop' }],
                tel: ''
            }
        ],
        'hotel': [],
        'food': []
    }
};
