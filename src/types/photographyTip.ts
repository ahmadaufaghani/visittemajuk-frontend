export interface PhotographyTip {
  id: number;
  title: string;
  description: string;
  image: string | null;
  order: number;
}

export interface PhotographyTipPayload {
  title: string;
  description: string;
  image?: File | null;
  order?: number;
}
