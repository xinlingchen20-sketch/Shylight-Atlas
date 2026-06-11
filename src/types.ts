export interface PlatformData {
  profileUrl: string;
  followers: number;
  er: number; // percentage (e.g. 3.5 for 3.5%)
  avgViews: number;
  avgLikes: number;
  avgComments: number;
}

export type CooperationStatus = "已合作" | "已报价未合作" | "沟通中" | "待开发" | "不合作";

export interface Influencer {
  id: string;
  name: string;
  avatarUrl: string;
  country: string;
  city: string;
  email: string;
  phone: string;
  agency: string;
  notes: string;
  
  // Platform Metrics
  instagram: PlatformData;
  tiktok: PlatformData;
  youtube: PlatformData;
  
  // Tag types
  personas: string[];   // 人设标签
  scenarios: string[];  // 场景标签
  categories: string[]; // 品类标签
  abilities: string[];  // 能力标签
  strategies: string[]; // 营销打法标签
  
  // Commercials
  status: CooperationStatus;
  rateCard: number;
  dealPrice: number;
  
  // Recommendations
  recommendedDirections: string;
  
  createdAt: any;
  updatedAt: any;
}

export interface CooperationRecord {
  id: string;
  influencerId: string;
  brandName: string;
  projectName: string;
  date: string; // YYYY-MM-DD
  platform: "Instagram" | "TikTok" | "YouTube" | string;
  link: string;
  screenshotUrl: string;
  rateCard: number;
  dealPrice: number;
  views: number;
  likes: number;
  comments: number;
  customerReview: string;
  internalNotes: string;
}

export type AuthRole = "Admin" | "Member" | "Visitor";
