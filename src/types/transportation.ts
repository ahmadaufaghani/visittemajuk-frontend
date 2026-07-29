export interface TransportationSteps {
    id: number,
    description: string,
    order:number,
    cost: string,
    duration: string,
    vehicle: string,
    transportation_id: number
}

export interface TransportationTips {
    id: number,
    tip: string,
    order:number,
    transportation_id: number
}

export interface TransportationStepsPayload {
    description: string,
    order: number,
    cost: string,
    duration: string,
    vehicle: string,
    transportation_id: number
}

export interface TransportationTipsPayload {
    tip: string,
    order: number,
    transportation_id: number
}

export interface TransportationStepsList {
    description: string,
    cost: string,
    duration: string,
    vehicle: string,
}

export interface Transportation {
    id: number,
    title: string,
    description: string,
    image: string,
    estimated_time: string,
    estimated_cost: string,
    difficulty: string,
    transportation_steps: TransportationSteps[]
    transportation_tips: TransportationTips[]
}

export interface TransportationPayload {
    id: number,
    title: string,
    description: string,
    image: string,
    estimated_time: string,
    estimated_cost: string,
    difficulty: string,
}

export interface TransportationListParams {
  search?: string;
  difficulty?: string;
  page?: number;
  perPage?: number;
}

export interface TransportationPaginationMeta {
  current_page: number;
  per_page: number;
  last_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

export interface TransportationFiltersMeta {
  difficulties: string[];
}

export interface TransportationListMeta {
  pagination: TransportationPaginationMeta;
  filters: TransportationFiltersMeta;
}

export interface TransportationListResult {
  transportations: Transportation[];
  meta: TransportationListMeta;
}

export interface AdditionalInformation {
  id: number,
  title: string,
  type: string,
  description: string
}

export interface AdditionalInformationPayload {
  title: string,
  type: string,
  description: string
}