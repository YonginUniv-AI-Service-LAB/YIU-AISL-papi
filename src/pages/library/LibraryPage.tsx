import { useState, useRef, useEffect } from "react";
import type { KeyboardEvent, ChangeEvent, DragEvent } from "react";
import { useNavigate } from "react-router-dom";
import "./LibraryPage.css";
import {
  getPapers,
  getYearFilters,
  updatePaperTitle,
  deletePaper,
  registerPaperByUrl,
  registerPaperByFile,
  updateReadStatus,
  getProcessingStatuses,
  retryProcessing,
  type LibraryPaper,
  type YearCount,
} from "./libraryApi";

// 화면에 보여줄 처리 상태 이름 (백엔드 processingStatus → 한글)
const statusLabel: Record<string, string> = {
  ready: "준비 완료",
  failed: "처리 실패",
};

// 아직 처리가 끝나지 않은 상태인지 (queued / parsing / embedding)
const isProcessing = (status: string) => status !== "ready" && status !== "failed";

// 사용자가 바꾼 제목이 있으면 그걸, 없으면 원제를 보여줍니다.
const getTitle = (paper: LibraryPaper) => paper.displayTitle ?? paper.title;

// 읽은 페이지 / 전체 페이지 → 진행률(%)
const getProgress = (paper: LibraryPaper) =>
  paper.pageCount && paper.readingProgressPage
    ? Math.round((paper.readingProgressPage / paper.pageCount) * 100)
    : 0;

// 읽기 상태 체크박스 (화면 이름 → 백엔드 값)
const readStatusOptions = [
  { label: "읽음", value: "read" },
  { label: "안읽음", value: "unread" },
  { label: "읽는중", value: "reading" },
];

// 정렬 선택지 (화면 이름 → 백엔드 sort 값)
const sortOptions = [
  { label: "최신순", value: "recent" },
  { label: "오래된순", value: "oldest" },
  { label: "제목순", value: "title" },
  { label: "최근 열람순", value: "lastOpened" },
];

const recentItems = ["논문 관련 질문", "논문 내용 요약", "우선 순위 추천"];
function LibraryPage() {
  const navigate = useNavigate();
  const [paperList, setPaperList] = useState<LibraryPaper[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [isUploadOpen, setIsUploadOpen ] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isYearOpen, setIsYearOpen] = useState(false);
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [yearSearch, setYearSearch] = useState("");
  const ignoreNextClickRef = useRef (false) ;

  // 검색 / 필터 / 정렬 조건 (바뀌면 목록을 다시 불러와요)
  const [searchText, setSearchText] = useState(""); // 입력창에 치는 중인 글자
  const [query, setQuery] = useState(""); // 엔터를 눌러 실제로 검색할 글자
  const [readStatuses, setReadStatuses] = useState<string[]>([]);
  const [appliedYears, setAppliedYears] = useState<number[]>([]); // 연도 팝업에서 "확인"을 누른 값
  const [sort, setSort] = useState("recent");
  const [reloadKey, setReloadKey] = useState(0); // 업로드 후 목록을 새로 불러올 때 1씩 올려요
  const [yearOptions, setYearOptions] = useState<YearCount[]>([]);
  const years = yearOptions.map((item) => String(item.year));

  // 삭제할 논문 / 업로드할 파일·URL
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadUrl, setUploadUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 페이지가 열릴 때, 그리고 검색/필터/정렬 조건이 바뀔 때마다 목록을 불러옵니다.
  useEffect(() => {
    let ignore = false; // 조건이 빨리 바뀌면 이전 요청 결과는 무시해요

    getPapers({ q: query, readStatus: readStatuses, year: appliedYears, sort })
      .then((papers) => {
        if (ignore) return;
        setPaperList(papers);
        setLoadError("");
      })
      .catch((error: Error) => {
        if (!ignore) setLoadError(error.message);
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [query, readStatuses, appliedYears, sort, reloadKey]);

  // 처리 중인 카드가 있으면 5초마다 상태를 확인해서, 새로고침 없이 "준비 완료"로 바꿔요.
  const processingIds = paperList
    .filter((paper) => isProcessing(paper.processingStatus))
    .map((paper) => paper.userPaperId)
    .join(",");
  const [progressById, setProgressById] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!processingIds) return; // 처리 중인 카드가 없으면 확인하지 않아요

    const timer = setInterval(async () => {
      try {
        const items = await getProcessingStatuses(processingIds.split(","));
        setProgressById((prev) => {
          const next = { ...prev };
          items.forEach((item) => (next[item.userPaperId] = item.progress));
          return next;
        });
        setPaperList((prev) =>
          prev.map((paper) => {
            const item = items.find((i) => i.userPaperId === paper.userPaperId);
            return item ? { ...paper, processingStatus: item.processingStatus } : paper;
          })
        );
        // 하나라도 "준비 완료"가 되면 페이지 수 같은 정보도 새로 받도록 목록을 다시 불러와요
        if (items.some((item) => item.processingStatus === "ready")) {
          setReloadKey((key) => key + 1);
        }
      } catch {
        // 잠깐 실패해도 다음 5초에 다시 확인해요
      }
    }, 5000);

    return () => clearInterval(timer);
  }, [processingIds]);

  // 처리 실패한 논문 다시 시도
  const handleRetry = async (userPaperId: string) => {
    try {
      await retryProcessing(userPaperId);
      setPaperList((prev) =>
        prev.map((paper) =>
          paper.userPaperId === userPaperId ? { ...paper, processingStatus: "queued" } : paper
        )
      );
    } catch (error) {
      alert((error as Error).message);
    }
  };

  // 카드의 읽기 상태 바꾸기
  const handleReadStatusChange = async (userPaperId: string, readStatus: string) => {
    try {
      await updateReadStatus(userPaperId, readStatus);
      setPaperList((prev) =>
        prev.map((paper) => (paper.userPaperId === userPaperId ? { ...paper, readStatus } : paper))
      );
    } catch (error) {
      alert((error as Error).message);
    }
  };

  // 연도 필터에 보여줄 연도 목록을 불러옵니다.
  useEffect(() => {
    getYearFilters()
      .then((items) => setYearOptions(items))
      .catch(() => setYearOptions([]));
  }, [reloadKey]);

  // 읽기 상태 체크박스를 누르면 목록 조건에 넣거나 뺍니다.
  const toggleReadStatus = (value: string) => {
    setReadStatuses((prev) =>
      prev.includes(value) ? prev.filter((status) => status !== value) : [...prev, value]
    );
  };

  // 검색창에서 엔터를 누르면 검색합니다.
  const handleSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === "Enter") setQuery(searchText.trim());
  };

  // 연도 팝업의 "확인": 고른 연도로 목록을 다시 불러옵니다.
  const applyYears = () => {
    setAppliedYears(selectedYears.map(Number));
    setIsYearOpen(false);
  };

  // 삭제 모달의 "삭제"
  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await deletePaper(deleteTargetId);
      setPaperList((prev) => prev.filter((paper) => paper.userPaperId !== deleteTargetId));
      setSelectedIds((prev) => prev.filter((id) => id !== deleteTargetId));
    } catch (error) {
      alert((error as Error).message);
    }
    setDeleteTargetId(null);
    setIsDeleteOpen(false);
  };

  // 업로드 모달 닫기 (입력값도 비워요)
  const closeUpload = () => {
    setIsUploadOpen(false);
    setUploadFile(null);
    setUploadUrl("");
  };

  // 파일 선택 / 끌어다 놓기
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUploadFile(e.target.files?.[0] ?? null);
  };
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setUploadFile(e.dataTransfer.files[0] ?? null);
  };

  // 업로드 모달의 "저장": 파일이 있으면 파일로, 없으면 URL로 등록해요.
  const handleUpload = async () => {
    const url = uploadUrl.trim();
    if (!uploadFile && !url) {
      alert("PDF 파일을 고르거나 arXiv URL을 입력해 주세요.");
      return;
    }
    setIsUploading(true);
    try {
      if (uploadFile) {
        await registerPaperByFile(uploadFile);
      } else {
        await registerPaperByUrl(url);
      }
      closeUpload();
      setReloadKey((key) => key + 1); // 목록 새로고침
    } catch (error) {
      alert((error as Error).message);
    }
    setIsUploading(false);
  };

  const startEditTitle = (id: string, title: string) => {
    setEditingId(id);
    setNewTitle(title);
  };

  const cancelEditTitle = () => {
    setEditingId(null);
  };

  const saveTitle = async () => {
    const title = newTitle.trim();
    const id = editingId;
    setEditingId(null);

    if (!id || title === "") return;

    try {
      await updatePaperTitle(id, title); // 백엔드에 저장하고
      setPaperList((prev) =>
        prev.map((paper) => (paper.userPaperId === id ? { ...paper, displayTitle: title } : paper))
      ); // 성공하면 화면에도 반영
    } catch (error) {
      alert((error as Error).message);
    }
  };

  const handleTitleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return;

    if (e.key === "Enter") saveTitle();
    if (e.key === "Escape") cancelEditTitle();
  };

  return (
    <div className="library-layout">
      <aside className="sidebar">
      <h1 className="sidebar-title">논문 챗봇</h1>
      <button className="sidebar-menu-item">
        <span className="icon">📁</span>
        모든 문서함
      </button>
      <div className="sidebar-section">
        
        <p className="sidebar-section-title">Recent</p>
        
        <ul className="sidebar-list">
        
          {recentItems.map((item) => (
            <li key={item} className="sidebar-list-item">
            <span>+ {item}</span>
            <span className="more-icon">...</span>
          </li>
          ))}
          
        </ul>
      
        </div>
        <div className="sidebar-footer">
          <div className="avatar" />
          <span>용용이</span>
        </div>
        </aside>
        <main className="main-content">
          <div className="search-row">
            <input
              type="text"
              className="search-input"
              placeholder="논문 제목, 저자, ID 검색"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
            <button className="upload-button" onClick={() => setIsUploadOpen(true)}>업로드</button>
          </div>
          <div className="filter-row">
            {readStatusOptions.map((option) => (
              <label key={option.value} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={readStatuses.includes(option.value)}
                  onChange={() => toggleReadStatus(option.value)}
                />{" "}
                {option.label}
              </label>
            ))}
          </div>
          <div 
          className="sort-row">
            <select className="sort-dropdown" value={sort} onChange={(e) => setSort(e.target.value)}>
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="sort-right">
              <button 
                 className="year-dropdown"
                 onClick={() => setIsYearOpen(!isYearOpen)}
              >
                 연도 ▾
              </button>
              <button className="confirm-button" onClick={applyYears}>확인</button> 
              {isYearOpen && (
                <div className="year-popup">
                  <input
                    type="text"
                    className="year-search"
                    placeholder="Search"
                    value={yearSearch}
                    onChange={(e) => setYearSearch(e.target.value)}
    />
    <ul className="year-list">
      {years
        .filter((year) => year.includes(yearSearch))
        .map((year) => (
          <li key={year} className="year-item">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={selectedYears.includes(year)}
                onChange={() => {
                  if (selectedYears.includes(year)) {
                    setSelectedYears(selectedYears.filter((y) => y !== year));
                  } else {
                    setSelectedYears([...selectedYears, year]);
                  }
                }}
              />
              {year}
            </label>
          </li>
        ))}
    </ul>
  </div>
)}
               </div>          
               </div>
               {isLoading && <p>논문 목록을 불러오는 중...</p>}
               {loadError && <p>{loadError}</p>}
               <div className="card-grid">
               {paperList.map((paper) => (
                <div 
                  key={paper.userPaperId} 
                  className={`paper-card ${selectedIds.includes(paper.userPaperId) ? "selected" : ""}`}
                  onMouseDown={() => {
                   ignoreNextClickRef.current = editingId !== null;
                  }}
                  onClick={() => {
                    if (ignoreNextClickRef.current) {
                       ignoreNextClickRef.current = false;
                       return;
                    }
                    navigate(`/reader/${paper.userPaperId}`);
                  }}
                  >
                  <div className="card-header">
                    {editingId === paper.userPaperId ? (
                      <div className="card-title-edit" onClick={(e) => e.stopPropagation()}>
                        <input
                          className="card-title-input"
                          value={newTitle}
                          maxLength={100}
                          autoFocus
                          onFocus={(e) => e.target.select()}
                          onChange={(e) => setNewTitle(e.target.value)}
                          onKeyDown={handleTitleKeyDown}
                          onBlur={cancelEditTitle}
                        />
                        <button
                          type="button"
                          className="card-title-save"
                          aria-label="제목 저장"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={saveTitle}
                        >
                          ✓
                        </button>
                        <button
                          type="button"
                          className="card-title-cancel"
                          aria-label="제목 변경 취소"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={cancelEditTitle}
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                    <label className="card-title-label" onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="checkbox"
                        checked={selectedIds.includes(paper.userPaperId)}
                        onChange={ () => {
                          if (selectedIds.includes(paper.userPaperId)) {
                            setSelectedIds(selectedIds.filter((id) => id !== paper.userPaperId));
                        } else {
                          setSelectedIds([...selectedIds, paper.userPaperId]);
                        }
                       }}
                      />
                      <span className="card-title">{getTitle(paper)}</span>
                      <button
                        type="button"
                        className="card-title-edit-button"
                        aria-label="제목 변경"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          startEditTitle(paper.userPaperId, getTitle(paper));
                        }}
                      >
                        ✎
                      </button>
                    </label>
                    )}
                    <div className="card-header-right">
                      <span className="status-badge">
                        <span className="status-dot" /> {statusLabel[paper.processingStatus] ?? "처리 중"}
                        {isProcessing(paper.processingStatus) && progressById[paper.userPaperId] !== undefined &&
                          ` ${progressById[paper.userPaperId]}%`}
                      </span>
                      {paper.processingStatus === "failed" && (
                        <button
                          type="button"
                          className="retry-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRetry(paper.userPaperId);
                          }}
                        >
                          다시 시도
                        </button>
                      )}
                      <button
                        className="close-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTargetId(paper.userPaperId);
                          setIsDeleteOpen(true);
                        }}
                      >
                        x
                      </button>
                    </div>
                  </div>

                  <div className="thumbnail" />
                  
                  <div className="card-info">
                    {paper.authors.length > 0 && (
                      <div className="info-row">
                        <span className="info-label">저자</span>
                        <span>{paper.authors.join(", ")}</span>
                      </div>
                    )}
                    {/* TODO: 소속 기관은 GET /api/papers 응답에 없어서 잠시 숨김 (백엔드 확인 필요)
                    <div className="info-row">
                      <span className="info-label">소속 기관</span>
                      <span>{paper.org}</span>
                    </div>
                    */}
                    {paper.publishedYear && (
                      <div className="info-row">
                        <span className="info-label">발행연도</span>
                        <span>{paper.publishedYear}</span>
                      </div>
                    )}
                    <div className="info-row">
                      <span className="info-label">읽기 상태</span>
                      <select
                        className="read-status-select"
                        value={paper.readStatus}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => handleReadStatusChange(paper.userPaperId, e.target.value)}
                      >
                        {readStatusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    {/* TODO: 학회 / 저널은 GET /api/papers 응답에 없어서 잠시 숨김 (백엔드 확인 필요)
                    {paper.journal && (
                      <div className="info-row">
                        <span className="info-label">학회 / 저널</span>
                        <span>{paper.journal}</span>
                      </div>
                    )}
                    */}
                  </div>


                  {getProgress(paper) > 0 && (
                    <>
                      <a href="#" className="summary-link">요약 보기 &gt;</a>
                      <div className="progress-row">
                        <span>읽는 중</span>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${getProgress(paper)}%` }} />
                        </div>
                        <span>{getProgress(paper)}%</span>
                      </div>
                    </>
                  )}
                      </div>
                  
                                 ))}
          </div>
        </main>
        {isUploadOpen && (
          <div className="modal-overlay">
            <div className="modal-box">
              <div className="modal-header">
                <span className="modal-title">PDF 업로드</span>
                <button className="modal-close" onClick={closeUpload}>x</button>
              </div>

              <div
                className="upload-dropzone"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
              >
                <div className="upload-icon">⬆️</div>
                {uploadFile ? (
                  <div>{uploadFile.name}</div>
                ) : (
                  <>
                    <div>Drag&Drop</div>
                    <div>또는 파일 선택</div>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  hidden
                  onChange={handleFileChange}
                />
            </div>

            <div className="upload-divider">
              <div className="upload-divider-line" />
              Or
              <div className="upload-divider-line" />
            </div>

            <input
              type="text"
              className="url-input"
              placeholder="https://arxiv.org/abs/..."
              value={uploadUrl}
              onChange={(e) => setUploadUrl(e.target.value)}
            />

            <div className="modal-footer">
              <button className="modal-cancel" onClick={closeUpload}>취소</button>
              <button className="modal-save" onClick={handleUpload} disabled={isUploading}>
                {isUploading ? "등록 중..." : "저장"}
              </button>
            </div>
        </div>
      </div>
    )}
    {isDeleteOpen && (
      <div className="modal-overlay">
        <div className="modal-box">
          <div className="modal-header">
            <span className="modal-title">삭제 확인</span>
            <button className="modal-close" onClick={() => setIsDeleteOpen(false)}>x</button>
          </div>

          <p>이 논문을 삭제하시겠습니까?</p>
          <p>삭제 후 복구할 수 없습니다.</p>
          
          <div className="modal-footer">
            <button className="modal-cancel" onClick={() => setIsDeleteOpen(false)}>취소</button>
            <button className="modal-save" onClick={handleDelete}>삭제</button> 
          </div>
        </div>
      </div> 
    )}
    </div>
    )
}

export default LibraryPage