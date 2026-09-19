import "./LibraryPage.css";

const papers = [ 
  {id: 1, title: "논문 제목", author: "안여진 외 2명", org: "용인대학교", year: "2026", journal: "CVPR2025", progress: 60 },
  { id: 2, title:"논문 제목", status: "준비 완료", author: "안여진 외 2명", org: "용인대학교", year: "2026", journal: "CVPR 2025", progress: 60 },
  { id: 3, title:"논문 제목", status: "준비 완료", author: "안여진 외 2명", org: "용인대학교", year: "2026", journal: "CVPR 2025", progress: 60 },
  { id: 4, title:"논문 제목", status: "준비 완료", author: "안여진 외 2명", org: "용인대학교", year: "", journal: "", progress: 0 },
  { id: 5, title:"논문 제목", status: "준비 완료", author: "안여진 와 2명", org: "용인대학교", year: "", journal: "", progress: 0 },
  { id: 6, title:"논문 제목", status: "준비 완료", author: "안여진 외 2명", org: "용인대학교", year: "", journal: "", progress: 0 },
];


const recentItems = ["논문 관련 질문", "논문 내용 요약", "우선 순위 추천"];
function LibraryPage() {
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
          <span>안여진</span>
        </div>
        </aside>
        <main className="main-content">
          <div className="search-row">
            <input type="text" className="search-input" placeholder="논문 제목, 저자, ID 검색" />
            <button className="upload-button">업로드</button>
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
              <button className="year-dropdown">연도 ▾</button>
              <button className="confirm-button">확인</button> 
               </div>          
               </div>
               <div className="card-grid">
               {papers.map((paper) => (
                <div key={paper.id} className="paper-card">
                  <div className="card-header">
                    <label className="checkbox-laber">
                      <input type="checkbox" />
                      <span className="card-title">{paper.title}</span>
                    </label>
                    <div className="card-header-right">
                      <span className="status-badge">
                        <span className="status-dot" /> {paper.status}
                      </span>
                      <button className="close-button">x</button>
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
        </div>
        )
      }


export default LibraryPage