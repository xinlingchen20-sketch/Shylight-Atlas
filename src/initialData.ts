import { Influencer, CooperationRecord } from "./types";

export const PRESET_PERSONAS = [
  "华尔街金融男",
  "洛杉矶派对女王",
  "精致生活旅游男",
  "科技极客",
  "健身达人"
];

export const PRESET_SCENARIOS = [
  "居家",
  "办公",
  "健身",
  "旅行",
  "开车",
  "婚礼",
  "世界杯观赛",
  "派对",
  "露营",
  "圣诞节"
];

export const PRESET_CATEGORIES = [
  "投影仪",
  "耳机",
  "音响",
  "鞋子",
  "家居",
  "汽车"
];

export const PRESET_ABILITIES = [
  "家庭影院场景",
  "长期合作能力",
  "Storytelling能力强",
  "产品长期露出",
  "高端消费人群",
  "夫妻内容"
];

export const PRESET_STRATEGIES = [
  "Seeding",
  "Affiliate",
  "产品植入",
  "系列短片",
  "锁3个月",
  "锁6个月",
  "品牌大使"
];

// Seed Data
export const SEED_INFLUENCERS: Omit<Influencer, "createdAt" | "updatedAt">[] = [
  {
    id: "alex_costa",
    name: "Alex Costa",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250&h=250",
    country: "United States",
    city: "Los Angeles",
    email: "alex@costacreative.co",
    phone: "+1 (310) 555-0142",
    agency: "Costa Media Group",
    notes: "Very professional workflow, high production quality in video content. Fits clean lifestyle and tech brands well.",
    instagram: {
      profileUrl: "https://instagram.com/alexcosta",
      followers: 1800000,
      er: 2.8,
      avgViews: 240000,
      avgLikes: 50400,
      avgComments: 1200
    },
    tiktok: {
      profileUrl: "https://tiktok.com/@alexcosta",
      followers: 2400000,
      er: 4.2,
      avgViews: 450000,
      avgLikes: 100800,
      avgComments: 2100
    },
    youtube: {
      profileUrl: "https://youtube.com/c/AlexCosta",
      followers: 3800000,
      er: 1.5,
      avgViews: 320000,
      avgLikes: 48000,
      avgComments: 850
    },
    personas: ["精致生活旅游男", "健身达人"],
    scenarios: ["居家", "办公", "旅行", "派对"],
    categories: ["耳机", "鞋子", "家居", "投影仪"],
    abilities: ["高端消费人群", "长期合作能力", "Storytelling能力强"],
    strategies: ["产品植入", "品牌大使", "锁3个月"],
    status: "已合作",
    rateCard: 12000,
    dealPrice: 9500,
    recommendedDirections: "适合：投影仪、高端耳机、精致家具、高端潮流服饰。 推荐打法：主推居家高逼格投影仪观影场景，或者在YouTube进行整期穿搭/好物推荐中自然植入。"
  },
  {
    id: "tech_review_guy",
    name: "Marcus Techson (MKBHD Fan)",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250&h=250",
    country: "United States",
    city: "New York",
    email: "marcus@techreviews.net",
    phone: "+1 (212) 555-1492",
    agency: "Indie Creator",
    notes: "Direct, analytical video setups. Outstanding dark studio lighting. High tech engagement rate.",
    instagram: {
      profileUrl: "https://instagram.com/marcustech",
      followers: 320000,
      er: 4.5,
      avgViews: 55000,
      avgLikes: 14400,
      avgComments: 450
    },
    tiktok: {
      profileUrl: "https://tiktok.com/@marcustech",
      followers: 650000,
      er: 5.8,
      avgViews: 120000,
      avgLikes: 37700,
      avgComments: 1100
    },
    youtube: {
      profileUrl: "https://youtube.com/marcustech",
      followers: 1200000,
      er: 3.1,
      avgViews: 195000,
      avgLikes: 37200,
      avgComments: 1540
    },
    personas: ["科技极客"],
    scenarios: ["办公", "居家", "世界杯观赛"],
    categories: ["投影仪", "耳机", "音响"],
    abilities: ["家庭影院场景", "Storytelling能力强"],
    strategies: ["产品植入", "系列短片"],
    status: "已合作",
    rateCard: 8000,
    dealPrice: 6800,
    recommendedDirections: "适合：各类投影仪首发测评、高端回音壁音响、降噪耳机。推荐打法：进行10分钟深度测评，重点展示画面亮度和色彩还原能力，适用于世界杯观赛或家庭影院场景。"
  },
  {
    id: "clara_travels",
    name: "Clara Jenkins",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250&h=250",
    country: "United Kingdom",
    city: "London",
    email: "clara@worldexplorer.com",
    phone: "+44 20 7946 0912",
    agency: "Vanguard Talent",
    notes: "Gorgeous outdoor scenic footage, camps in remote areas. Perfect fit for outdoor, camping projector concepts.",
    instagram: {
      profileUrl: "https://instagram.com/clarajenkins",
      followers: 950000,
      er: 5.1,
      avgViews: 180000,
      avgLikes: 48450,
      avgComments: 920
    },
    tiktok: {
      profileUrl: "https://tiktok.com/@claratravels",
      followers: 1500000,
      er: 6.5,
      avgViews: 380000,
      avgLikes: 97500,
      avgComments: 2800
    },
    youtube: {
      profileUrl: "https://youtube.com/claratravels",
      followers: 480000,
      er: 3.8,
      avgViews: 110000,
      avgLikes: 18240,
      avgComments: 1120
    },
    personas: ["精致生活旅游男", "洛杉矶派对女王"],
    scenarios: ["旅行", "露营", "派对"],
    categories: ["投影仪", "音响", "汽车"],
    abilities: ["家庭影院场景", "高端消费人群"],
    strategies: ["产品植入", "Seeding"],
    status: "沟通中",
    rateCard: 7500,
    dealPrice: 0,
    recommendedDirections: "适合：便携式户外投影仪、三防蓝牙音箱、户外装备。 推荐打法：在精致露营（Glamping）场景下，黄昏时刻拉起幕布用汽车电源点亮投影仪，看一部经典浪漫影片，突出便携与高亮度。"
  },
  {
    id: "finance_henry",
    name: "Henry Sterling",
    avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=250&h=250",
    country: "United States",
    city: "New York",
    email: "henry@sterlingwealth.co",
    phone: "+1 (646) 555-0188",
    agency: "In-House Management",
    notes: "High income demographic, clean desk setups, minimalist apartment. Focuses on finance, career growth and lifestyle.",
    instagram: {
      profileUrl: "https://instagram.com/henrysterling",
      followers: 410000,
      er: 1.9,
      avgViews: 42000,
      avgLikes: 7800,
      avgComments: 180
    },
    tiktok: {
      profileUrl: "https://tiktok.com/@henrysterling",
      followers: 220000,
      er: 2.1,
      avgViews: 35000,
      avgLikes: 4620,
      avgComments: 110
    },
    youtube: {
      profileUrl: "https://youtube.com/henrysterling",
      followers: 680000,
      er: 2.4,
      avgViews: 85000,
      avgLikes: 16320,
      avgComments: 750
    },
    personas: ["华尔街金融男"],
    scenarios: ["办公", "居家"],
    categories: ["耳机", "家居", "汽车"],
    abilities: ["高端消费人群", "Storytelling能力强"],
    strategies: ["Affiliate", "产品植入"],
    status: "已报价未合作",
    rateCard: 5000,
    dealPrice: 0,
    recommendedDirections: "适合：高档真皮办公椅、自降噪封闭耳机、高端智能电动汽车。 推荐打法：分享‘华尔街金融分析师的日常’，在清晨静音办公或夜晚居家休闲时自然融入减压产品。"
  },
  {
    id: "party_cloe",
    name: "Cloe Mitchell",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250&h=250",
    country: "United States",
    city: "Los Angeles",
    email: "cloe.party@gmail.com",
    phone: "+1 (213) 555-0982",
    agency: "NextGen Management",
    notes: "Extremely energetic, hosting events daily. Excellent for massive pool party or nightclub lifestyle integrations.",
    instagram: {
      profileUrl: "https://instagram.com/cloemitchell",
      followers: 1200000,
      er: 6.2,
      avgViews: 450000,
      avgLikes: 74400,
      avgComments: 3100
    },
    tiktok: {
      profileUrl: "https://tiktok.com/@party_cloe",
      followers: 3200000,
      er: 8.4,
      avgViews: 980000,
      avgLikes: 268000,
      avgComments: 5800
    },
    youtube: {
      profileUrl: "https://youtube.com/cloemitchell",
      followers: 350000,
      er: 4.1,
      avgViews: 90000,
      avgLikes: 14350,
      avgComments: 890
    },
    personas: ["洛杉矶派对女王"],
    scenarios: ["派对", "居家", "圣诞节"],
    categories: ["音响", "鞋子", "投影仪"],
    abilities: ["高端消费人群", "长期合作能力"],
    strategies: ["系列短片", "Seeding"],
    status: "待开发",
    rateCard: 10000,
    dealPrice: 0,
    recommendedDirections: "适合：大功率派对音响、酷炫声光氛围灯、节日聚会投影。推荐打法：在万圣节或圣诞节派对狂欢视频中，利用音箱和投影打在墙面的炫彩动效，烘托全场高潮气氛。"
  }
];

export const SEED_RECORDS: CooperationRecord[] = [
  {
    id: "rec_awol_fifa_1",
    influencerId: "alex_costa",
    brandName: "AWOL Vision",
    projectName: "FIFA Campaign",
    date: "2025-11-20",
    platform: "YouTube",
    link: "https://youtube.com/watch?v=alex_test_awol",
    screenshotUrl: "https://images.unsplash.com/photo-1543536448-d209d2d13a1c?auto=format&fit=crop&q=80&w=600",
    rateCard: 12000,
    dealPrice: 9500,
    views: 520000,
    likes: 48000,
    comments: 1100,
    customerReview: "The AWOL Vision project was a major success. Alex integrated the projector beautifully in his living room, setting up a virtual stadium effect for the World Cup. Views and comments reached record numbers.",
    internalNotes: "Alex was extremely responsive. The video draft was delivered 2 days ahead of schedule. Highly recommended for premium projector activations."
  },
  {
    id: "rec_sony_anc_1",
    influencerId: "tech_review_guy",
    brandName: "Sony",
    projectName: "WH-1000XM5 Launch",
    date: "2026-02-15",
    platform: "YouTube",
    link: "https://youtube.com/watch?v=marcus_sony_review",
    screenshotUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600",
    rateCard: 8000,
    dealPrice: 6500,
    views: 240000,
    likes: 31000,
    comments: 1450,
    customerReview: "Marcus did an excellent technical breakdown of the noise-cancelling performance in an office scenario. Sales attribution codes had higher conversion rates than expected.",
    internalNotes: "Great editing, provided direct feedback on the product casing. Marcus is excellent for tech-heavy target audiences."
  }
];
