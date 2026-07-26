import { apiRequest } from '../lib/api';
import { Banner } from '../types/banner';
import type {
  AdditionalInformation,
  AdditionalInformationPayload,
  Transportation,
  TransportationListMeta,
  TransportationListParams,
  TransportationListResult,
  TransportationSteps,
  TransportationStepsPayload,
  TransportationTips,
  TransportationTipsPayload,
} from '../types/transportation';

const emptyTransportationListMeta: TransportationListMeta = {
  pagination: {
    current_page: 1,
    per_page: 0,
    last_page: 1,
    total: 0,
    from: null,
    to: null,
  },
  filters : {
    difficulties: []
  }
};

function reviewListPath(path: string, params: TransportationListParams = {}): string {
  const query = new URLSearchParams();
  const search = params.search?.trim();
  const difficulty = params.difficulty;

  if (search) {
    query.set('search', search);
  }

  if (difficulty !== undefined) {
    query.set('difficulty', difficulty);
  }

  if (params.page !== undefined) {
    query.set('page', String(params.page));
  }

  if (params.perPage !== undefined) {
    query.set('per_page', String(params.perPage));
  }

  const queryString = query.toString();

  return queryString ? `${path}?${queryString}` : path;
}

export async function getTransportations(
  params: TransportationListParams = {}
): Promise<TransportationListResult> {
    const response = await apiRequest<Transportation[], TransportationListMeta>(reviewListPath('/transportations', params)
    );

    return {
        transportations : response.data,
        meta: response.meta ?? emptyTransportationListMeta
    }
}

export async function getTransportation(id: number): Promise<Transportation> {
  const response = await apiRequest<Transportation>(`/transportations/${id}`);

  return response.data;
}

export async function createTransportation(
  payload : FormData, token: string
) : Promise<Transportation> {
  const response = await apiRequest<Transportation>('/transportations', {
    method: 'POST',
    body: payload,
    token
  });

  return response.data;
}

export async function createSteps(
  payload : TransportationStepsPayload, token: string
) : Promise<TransportationSteps> {
  const response = await apiRequest<TransportationSteps>('/transportationSteps', {
    method: 'POST',
    body: payload,
    token
  });

  return response.data;
}

export async function createTips(
  payload : TransportationTipsPayload, token: string
) : Promise<TransportationTips> {
  const response = await apiRequest<TransportationTips>('/transportationTips', {
    method: 'POST',
    body: payload,
    token
  });

  return response.data;
}

export async function updateTransportation(
  id: number,
  payload : FormData, 
  token: string
) : Promise<Transportation> {
  const response = await apiRequest<Transportation>(`/transportations/${id}`, {
    method: 'POST',
    body: payload,
    token
  });

  return response.data;
}

export async function updateTransportationSteps(
  id: number,
  payload : TransportationStepsPayload, 
  token: string
) : Promise<TransportationSteps> {
  const response = await apiRequest<TransportationSteps>(`/transportationSteps/${id}`, {
    method: 'PUT',
    body: payload,
    token
  });

  return response.data;
}

export async function updateTransportationTips(
  id: number,
  payload : TransportationTipsPayload, 
  token: string
) : Promise<TransportationTips> {
  const response = await apiRequest<TransportationTips>(`/transportationTips/${id}`, {
    method: 'PUT',
    body: payload,
    token
  });

  return response.data;
}

export async function deleteTransportation(id: number, token: string): Promise<void> {
  await apiRequest<null>(`/transportations/${id}`, {
    method: 'DELETE',
    token,
  });
}

export async function deleteSteps(id: number, token: string): Promise<void> {
  await apiRequest<null>(`/transportationSteps/${id}`, {
    method: 'DELETE',
    token,
  });
}

export async function deleteTips(id: number, token: string): Promise<void> {
  await apiRequest<null>(`/transportationTips/${id}`, {
    method: 'DELETE',
    token,
  });
}


export async function getAdditionalInformation(): Promise<AdditionalInformation[]> {
  const response = await apiRequest<AdditionalInformation[]>('/additionalInformation', {
    method: 'GET'
  });
  return response.data;
}

export async function createAdditionalInformation(
  payload : AdditionalInformationPayload, token: string
) : Promise<AdditionalInformation> {
  const response = await apiRequest<AdditionalInformation>('/additionalInformation', {
    method: 'POST',
    body: payload,
    token
  });

  return response.data;
}

export async function updateAdditionalInformation(
  id: number, payload: AdditionalInformationPayload, token: string
) : Promise<AdditionalInformation> {
  const response = await apiRequest<AdditionalInformation>(`/additionalInformation/${id}`, {
    method: 'PUT',
    body: payload,
    token
  });

  return response.data;
}

export async function deleteAdditionalInformation(
  id: number, token: string
) : Promise<null> {
  const response = await apiRequest<null>(`/additionalInformation/${id}`, {
    method: 'DELETE',
    token
  });

  return response.data;
}

export async function getTransportationBanner() {
  const response = await apiRequest<Banner[]>(`/banners?menu=transportasi`, {
    method: 'GET'
  });

  return response.data;
}

export async function createTransportationBanner(
  payload: FormData,
  token: string
): Promise<Banner> {
  const response = await apiRequest<Banner>('/banners', {
    method: 'POST',
    token,
    body: payload,
  });

  return response.data;
}

export async function updateTransportationBanner(
  id: number,
  payload: FormData,
  token: string
): Promise<Banner> {
  const response = await apiRequest<Banner>(`/banners/${id}`, {
    method: 'POST',
    token,
    body: payload,
  });

  return response.data;
}
