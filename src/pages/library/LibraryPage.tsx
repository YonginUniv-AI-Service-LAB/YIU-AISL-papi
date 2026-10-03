import { useState } from "react";
import type { KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import "./LibraryPage.css";

const papers = [ 
  {id: 1, title: "논문 제목", author: "안여진 외 2명", org: "용인대학교", year: "2026", journal: "CVPR2025", progress: 60 },
  { id: 2, title:"논문 제목", status: "준비 완료", author: "안여진 외 2명", org: "용인대학교", year: "2026", journal: "CVPR 2025", progress: 60 },
  { id: 3, title:"논문 제목", status: "준비 완료", author: "안여진 외 2명", org: "용인대학교", year: "2026", journal: "CVPR 2025", progress: 60 },
  { id: 4, title:"논문 제목", status: "준비 완료", author: "안여진 외 2명", org: "용인대학교", year: "", journal: "", progress: 0 },
  { id: 5, title:"논문 제목", status: "준비 완료", author: "안여진 와 2명", org: "용인대학교", year: "", journal: "", progress: 0 },
  { id: 6, title:"논문 제목", status: "준비 완료", author: "안여진 외 2명", org: "용인대학교", year: "", journal: "", progress: 0 },
];

const years = ["2026", "2025", "2024", "2023", "2022", "2021"];

const recentItems = ["논문 관련 질문", "논문 내용 요약", "우선 순위 추천"];
function LibraryPage() {
  const navigate = useNavigate();
  const [paperList, setPaperList] = useState(papers);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [isUploadOpen, setIsUploadOpen ] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isYearOpen, setIsYearOpen] = useState(false);
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [yearSearch, setYearSearch] = useState("");

  const startEditTitle = (id: number, title: string) => {
    setEditingId(id);
    setNewTitle(title);
  };

  const cancelEditTitle = () => {
    setEditingId(null);
  };

  const saveTitle = () => {
    const title = newTitle.trim();

    if (title !== "") {
      setPaperList(paperList.map((paper) => (paper.id === editingId ? { ...paper, title } : paper)));
    }

    setEditingId(null);
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
            <input type="text" className="search-input" placeholder="논문 제목, 저자, ID 검색" />
            <button className="upload-button" onClick={() => setIsUploadOpen(true)}>업로드</button>
          </div>
          <div className="filter-row">
            <label className="checkbox-label">
              <input type="checkbox" /> 읽음
            </label>
            <label className="checkbox-label">
              <input type="checkbox" /> 안읽음
            </label>
            <label className="checkbox-label">
              <input type="checkbox" /> 읽는중
            </label>
          </div>
          <div 
          className="sort-row">
            <button className="sort-dropdown">최신순 ▾</button>
            <div className="sort-right">
              <button 
                 className="year-dropdown"
                 onClick={() => setIsYearOpen(!isYearOpen)}
              >
                 연도 ▾
              </button>
              <button className="confirm-button">확인</button> 
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
               <div className="card-grid">
               {paperList.map((paper) => (
                <div 
                  key={paper.id} 
                  className={`paper-card ${selectedIds.includes(paper.id) ? "selected" : ""}`}
                  onClick={() => navigate(`/reader/${paper.id}`)}
                  >
                  <div className="card-header">
                    {editingId === paper.id ? (
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
                    <label className="checkbox-laber" onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="checkbox"
                        checked={selectedIds.includes(paper.id)}
                        onChange={ () => {
                          if (selectedIds.includes(paper.id)) {
                            setSelectedIds(selectedIds.filter((id) => id !== paper.id));
                        } else {
                          setSelectedIds([...selectedIds, paper.id]);
                        }
                       }}
                      />
                      <span className="card-title">{paper.title}</span>
                      <button
                        type="button"
                        className="card-title-edit-button"
                        aria-label="제목 변경"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          startEditTitle(paper.id, paper.title);
                        }}
                      >
                        ✎
                      </button>
                    </label>
                    )}
                    <div className="card-header-right">
                      <span className="status-badge">
                        <span className="status-dot" /> {paper.status}
                      </span>
                      <button
                        className="close-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsDeleteOpen(true);
                        }}
                      >
                        x
                      </button>
                    </div>
                  </div>

                  <div className="thumbnail" />
                  
                  <div className="card-info">
                    <div className="info-row">
                      <span className="info-laber">저자</span>
                      <span>{paper.author}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-laber">소속 기관</span>
                      <span>{paper.org}</span>
                    </div>
                    {paper.year && (
                      <div className="info-row">
                        <span className="info-laber">발행연도</span>
                        <span>{paper.year}</span>
                      </div>
                    )}
                    {paper.journal && (
                      <div className="info-row">
                        <span className="info-laber">학회 / 저널</span>
                        <span>{paper.journal}</span>
                      </div>
                    )}
                  </div>


                  {paper.progress > 0 && (
                    <>
                      <a href="#" className="summary-link">요약 보기 &gt;;</a>
                      <div className="progress-row">
                        <span>읽는 중</span>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${paper.progress}%` }} />
                        </div>
                        <span>{paper.progress}%</span>
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
                <button className="modal-close" onClick={() => setIsUploadOpen(false)}>x</button>
              </div>

              <div className="upload-dropzone">
                <div className="upload-icon">⬆️</div>
                <div>Drag&Drop</div>
                <div>또는 파일 선택</div>
            </div>

            <div className="upload-divider">
              <div className="upload-divider-line" />
              Or
              <div className="upload-divider-line" />
            </div>

            <input type="text" className="url-input" placeholder="http://example.com" />

            <div className="modal-footer">
              <button className="modal-cancel" onClick={() => setIsUploadOpen(false)}>취소</button>
              <button className="modal-save" onClick={() => setIsUploadOpen(false)}>저장</button>
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
            <button className="modal-save" onClick ={() => setIsDeleteOpen(false)}>삭제</button> 
          </div>
        </div>
      </div> 
    )}
    </div>
    )
}

export default LibraryPage