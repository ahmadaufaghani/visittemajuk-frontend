export interface Specialty {
    id: number,
    menu: string,
}

export interface Gallery {
    id: number,
    image: string,
}

export interface Culinary {
    id: number,
    title: string,
    description:string,
    full_description: string,
    image: string,
    category: string,
    price: string,
    location: string,
    location_map: string,
    open_hours: string,
    contact: string,
    specialties: Specialty[],
    culinary_galleries: Gallery[]
}

export interface CulinaryPayload {
    id: number,
    title: string,
    description:string,
    full_description: string,
    image: File,
    category: string,
    price: string,
    location: string,
    location_map: string,
    open_hours: string,
    contact: string
}

export interface CulinaryPayloadCreate {
  data : CulinaryPayload
}

export interface CulinaryPayloadUpdate {
  data : Culinary
}

export interface SpecialtyPayload {
    menu: string,
    culinary_id : number,
}

export interface GalleryPayload {
    image: File,
    culinary_id : number,
}

export interface CulinaryListParams {
  search?: string;
  category?: string;
  page?: number;
  perPage?: number;
}

export interface CulinaryPaginationMeta {
  current_page: number;
  per_page: number;
  last_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

export interface CulinaryFiltersMeta {
  categories: string[];
}

export interface CulinaryListMeta {
  pagination: CulinaryPaginationMeta;
  filters: CulinaryFiltersMeta;
}

export interface CulinaryListResult {
  culinaries: Culinary[];
  meta: CulinaryListMeta;
}
