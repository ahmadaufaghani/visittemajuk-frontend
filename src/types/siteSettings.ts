export interface SiteHero {
  title: string;
  subtitle?: string;
  image?: string;
  button_text?: string;
  button_link?: string;
}

export interface SiteIntro {
  title: string;
  body?: string;
  image?: string;
}

export interface SiteFeature {
  title: string;
  body: string;
  icon: string;
}

export interface SiteTransportCta {
  title: string;
  body?: string;
  image?: string;
  button_text?: string;
  button_link?: string;
}

export interface SiteSectionTitles {
  destinations?: string;
  accommodations?: string;
  photo_spots?: string;
  testimonials?: string;
  transport_cta?: string;
  features?: string;
  newsletter?: string;
}

export interface FooterBrand {
  tagline?: string;
  brand_text?: string;
}

export interface FooterContact {
  address?: string;
  phone?: string;
  email?: string;
}

export interface SiteSettingsMap {
  'home.hero'?: SiteHero;
  'home.intro'?: SiteIntro;
  'home.section_titles'?: SiteSectionTitles;
  'home.features'?: SiteFeature[];
  'home.transport_cta'?: SiteTransportCta;
  'footer.brand'?: FooterBrand;
  'footer.contact'?: FooterContact;
}

export type SiteSettingKey = keyof SiteSettingsMap;