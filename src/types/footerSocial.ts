export type FooterSocialPlatform =
  | 'instagram'
  | 'facebook'
  | 'twitter'
  | 'tiktok'
  | 'youtube'
  | 'threads'
  | 'other';

export interface FooterSocial {
  id: number;
  platform: FooterSocialPlatform;
  label: string | null;
  url: string;
  order: number;
}

export interface FooterSocialPayload {
  platform: FooterSocialPlatform;
  label?: string | null;
  url: string;
  order?: number;
}

export interface FooterSocialListResult {
  socials: FooterSocial[];
}