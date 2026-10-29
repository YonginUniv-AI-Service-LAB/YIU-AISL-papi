// 라이브러리(서재) 화면에서 쓰는 백엔드 API 모음입니다.
// 기준: 백엔드 develop 브랜치의 PaperController (스웨거의 Paper 영역)

const API_BASE_URL = 'http://localhost:8080'

// ===== 타입 =====

// 논문 카드 1장의 모양 (백엔드 PaperListItemResponse)
export type LibraryPaper = {
  userPaperId: string // 내 서재에 담긴 논문의 id → 리더로 넘길 때 이걸 씁니다
  paperId: string // 논문 자체의 id (리더 이동에는 쓰지 않아요)
  displayTitle: string | null // 사용자가 바꾼 제목. 없으면 null
  title: string // 논문 원제
  authors: string[]
  publishedYear: number | null
  arxivId: string | null
  pageCount: number | null
  processingStatus: string // queued | ... | ready | failed
  readStatus: string // unread | reading | read
  readingProgressPage: number | null
  noveltyScore: number | null
  isLowConfidence: boolean
  chatRooms: { chatRoomId: string; title: string }[]
  addedAt: string
  lastOpenedAt: string | null
}

// 목록 응답 전체의 모양: { data: [...], nextCursor, hasNext }
type PaperListResponse = {
  data: LibraryPaper[]
  nextCursor: string | null
  hasNext: boolean
}

// 연도 필터 항목 (GET /api/papers/filters/years)
export type YearCount = {
  year: number
  count: number
}

// 논문 등록(파일/URL) 결과
export type PaperRegisterResult = {
  userPaperId: string
  paperId: string
  processingStatus: string
  alreadyProcessed: boolean
}

// 목록 조회 조건 (모두 선택 사항)
export type PaperListQuery = {
  q?: string // 검색어
  readStatus?: string[] // unread | reading | read
  year?: number[] // 발행연도
  sort?: string // recent | oldest | title | lastOpened ...
}

// ===== 공통 요청 함수 =====

// 모든 요청에 로그인 토큰을 붙이고, 실패하면 백엔드가 준 에러 메시지로 에러를 던집니다.
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      ...options.headers,
    },
  })

  // 삭제처럼 응답 본문이 없는 성공(204)
  if (response.status === 204) {
    return undefined as T
  }

  const result = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(result?.error?.message ?? `요청에 실패했어요. (${response.status})`)
  }

  return result as T
}

// ===== API =====

// 내 서재 논문 목록 (GET /api/papers)
export async function getPapers(query: PaperListQuery = {}): Promise<LibraryPaper[]> {
  const params = new URLSearchParams()
  if (query.q) params.append('q', query.q)
  query.readStatus?.forEach((status) => params.append('readStatus', status))
  query.year?.forEach((year) => params.append('year', String(year)))
  if (query.sort) params.append('sort', query.sort)
  params.append('limit', '50')

  const result = await request<PaperListResponse>(`/api/papers?${params.toString()}`)
  return result.data
}

// 연도 필터에 보여줄 연도 목록 (GET /api/papers/filters/years)
export async function getYearFilters(): Promise<YearCount[]> {
  const result = await request<{ data: YearCount[] }>('/api/papers/filters/years')
  return result.data
}

// 카드 제목 바꾸기 (PATCH /api/papers/{userPaperId}/title)
export async function updatePaperTitle(userPaperId: string, title: string): Promise<void> {
  await request(`/api/papers/${userPaperId}/title`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  })
}

// 논문 삭제 (DELETE /api/papers/{userPaperId})
export async function deletePaper(userPaperId: string): Promise<void> {
  await request(`/api/papers/${userPaperId}`, { method: 'DELETE' })
}

// arXiv URL로 논문 등록 (POST /api/papers/by-url)
export async function registerPaperByUrl(url: string): Promise<PaperRegisterResult> {
  const result = await request<{ data: PaperRegisterResult }>('/api/papers/by-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  })
  return result.data
}

// PDF 파일로 논문 등록 (POST /api/papers/by-file)
// 파일은 FormData로 보내요. 이때 Content-Type은 브라우저가 알아서 정하니까 직접 넣지 않아요.
export async function registerPaperByFile(file: File): Promise<PaperRegisterResult> {
  const formData = new FormData()
  formData.append('file', file)

  const result = await request<{ data: PaperRegisterResult }>('/api/papers/by-file', {
    method: 'POST',
    body: formData,
  })
  return result.data
}

// ===== 읽기 상태 / 처리 상태 =====

// 처리 상태 일괄 조회 결과 1개 (GET /api/papers/processing)
export type ProcessingItem = {
  userPaperId: string
  processingStatus: string // queued | parsing | embedding | ready | failed
  progress: number // 0~100
  currentStep: string | null
  errorCode: string | null
  canRetry: boolean
}

// 읽기 상태 바꾸기 (PATCH /api/papers/{userPaperId}/read-status)
export async function updateReadStatus(userPaperId: string, readStatus: string): Promise<void> {
  await request(`/api/papers/${userPaperId}/read-status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ readStatus }),
  })
}

// 처리 중인 논문들의 상태를 한 번에 조회 (GET /api/papers/processing?userPaperIds=...)
export async function getProcessingStatuses(userPaperIds: string[]): Promise<ProcessingItem[]> {
  const params = new URLSearchParams()
  userPaperIds.forEach((id) => params.append('userPaperIds', id))
  const result = await request<{ data: { items: ProcessingItem[]; allSettled: boolean } }>(
    `/api/papers/processing?${params.toString()}`
  )
  return result.data.items
}

// 처리 실패한 논문 다시 시도 (POST /api/papers/{userPaperId}/processing/retry)
export async function retryProcessing(userPaperId: string): Promise<void> {
  await request(`/api/papers/${userPaperId}/processing/retry`, { method: 'POST' })
}
