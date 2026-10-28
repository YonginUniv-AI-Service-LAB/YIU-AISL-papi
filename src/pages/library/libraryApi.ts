// 라이브러리(서재) 화면에서 쓰는 백엔드 API 모음입니다.
// 기준: 백엔드 develop 브랜치의 PaperController (스웨거의 Paper 영역)

const API_BASE_URL = 'http://localhost:8080'

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

// 내 서재 논문 목록을 가져옵니다. (GET /api/papers)
export async function getPapers(): Promise<LibraryPaper[]> {
  const response = await fetch(`${API_BASE_URL}/api/papers`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
    },
  })

  if (!response.ok) {
    throw new Error(`논문 목록을 불러오지 못했어요. (${response.status})`)
  }

  const result: PaperListResponse = await response.json()
  return result.data
}
