export interface TransportationSteps {
    id: number,
    description: string,
    cost: string,
    duration: string,
    vehicle: string,
    transportation_id: number
}

export interface TransportationTips {
    id: number,
    tip: string,
    transportation_id: number
}

export type TransportationStepsPayload = Omit<TransportationSteps, "id">
export type TransportationTipsPayload = Omit<TransportationTips, "id">

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