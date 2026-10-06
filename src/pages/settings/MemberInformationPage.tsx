import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../../styles/memberInformation.css'

function MemberInformationPage() {
  const navigate = useNavigate()

  const [showNicknameModal, setShowNicknameModal] = useState(false)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [showEmailCodeSentModal, setShowEmailCodeSentModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false)

  const [currentNickname, setCurrentNickname] = useState('')
  const [currentEmail, setCurrentEmail] = useState('')

  const [newNickname, setNewNickname] = useState('')
  const [nicknameError, setNicknameError] = useState('')

  const [newEmail, setNewEmail] = useState('')
  const [emailCode, setEmailCode] = useState('')
  const [emailCodeSent, setEmailCodeSent] = useState(false)
  const [emailError, setEmailError] = useState('')

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const [isLoading, setIsLoading] = useState(true)
  const [isSavingNickname, setIsSavingNickname] = useState(false)
  const [isSavingPassword, setIsSavingPassword] = useState(false)

  const [deletePassword, setDeletePassword] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const fetchMemberInfo = async () => {
      try {
        const response = await fetch(
          'http://localhost:8080/api/me',
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
          }
        )

        if (!response.ok) {
          const result = await response.json()

          setNicknameError(
            result?.error?.message ??
              '회원정보를 불러오지 못했습니다.'
          )

          return
        }

        const result = await response.json()

        setCurrentNickname(result.data.nickname ?? '')
        setCurrentEmail(result.data.email ?? '')
      } catch {
        setNicknameError(
          '서버와 연결할 수 없습니다. 잠시 후 다시 시도해주세요.'
        )
      } finally {
        setIsLoading(false)
      }
    }

    fetchMemberInfo()
  }, [])

  const isValidEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  }

  const handleNicknameSave = async () => {
    if (!newNickname.trim()) {
      setNicknameError('새 닉네임을 입력해주세요.')
      return
    }

    if (newNickname.trim() === currentNickname) {
      setNicknameError('현재 닉네임과 다른 닉네임을 입력해주세요.')
      return
    }

    try {
      setIsSavingNickname(true)
      setNicknameError('')

      const response = await fetch(
        'http://localhost:8080/api/me/nickname',
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
          body: JSON.stringify({
            nickname: newNickname.trim(),
          }),
        }
      )

      if (!response.ok) {
        const result = await response.json()

        setNicknameError(
          result?.error?.message ??
            '닉네임 변경에 실패했습니다.'
        )

        return
      }

      const result = await response.json()

      setCurrentNickname(result.data.nickname)
      setNewNickname('')
      setShowNicknameModal(false)
    } catch {
      setNicknameError(
        '서버와 연결할 수 없습니다. 잠시 후 다시 시도해주세요.'
      )
    } finally {
      setIsSavingNickname(false)
    }
  }

  const handleSendEmailCode = () => {
    if (!newEmail.trim()) {
      setEmailError('새 이메일을 입력해주세요.')
      return
    }

    if (!isValidEmail(newEmail)) {
      setEmailError('올바른 이메일 형식을 입력해주세요.')
      return
    }

    setEmailError('')
    setEmailCodeSent(true)
    setShowEmailCodeSentModal(true)
  }

  const handleEmailSave = () => {
    if (!newEmail.trim()) {
      setEmailError('새 이메일을 입력해주세요.')
      return
    }

    if (!isValidEmail(newEmail)) {
      setEmailError('올바른 이메일 형식을 입력해주세요.')
      return
    }

    if (!emailCodeSent) {
      setEmailError('인증번호를 먼저 받아주세요.')
      return
    }

    if (!emailCode.trim()) {
      setEmailError('인증번호를 입력해주세요.')
      return
    }

    setEmailError('')
    setNewEmail('')
    setEmailCode('')
    setEmailCodeSent(false)
    setShowEmailModal(false)
  }

  const handlePasswordSave = async () => {
    if (!currentPassword.trim()) {
      setPasswordError('현재 비밀번호를 입력해주세요.')
      return
    }

    if (!newPassword.trim()) {
      setPasswordError('새 비밀번호를 입력해주세요.')
      return
    }

    if (!confirmPassword.trim()) {
      setPasswordError('새 비밀번호 확인을 입력해주세요.')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('새 비밀번호가 일치하지 않습니다.')
      return
    }

    if (currentPassword === newPassword) {
      setPasswordError('현재 비밀번호와 다른 비밀번호를 입력해주세요.')
      return
    }

    try {
      setIsSavingPassword(true)
      setPasswordError('')

      const response = await fetch(
        'http://localhost:8080/api/me/password',
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        }
      )

      if (!response.ok) {
        const result = await response.json()

        setPasswordError(
          result?.error?.message ??
            '비밀번호 변경에 실패했습니다.'
        )

        return
      }

      // 성공 응답은 204 No Content
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setShowPasswordModal(false)
    } catch {
      setPasswordError(
        '서버와 연결할 수 없습니다. 잠시 후 다시 시도해주세요.'
      )
    } finally {
      setIsSavingPassword(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!deletePassword.trim()) {
      setDeleteError('현재 비밀번호를 입력해주세요.')
      return
    }

    try {
      setIsDeleting(true)
      setDeleteError('')

      const response = await fetch(
        'http://localhost:8080/api/me',
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
          body: JSON.stringify({
            password: deletePassword,
          }),
        }
      )

      if (!response.ok) {
        const result = await response.json()

        setDeleteError(
          result?.error?.message ??
            '회원 탈퇴에 실패했습니다.'
        )

        return
      }

      // 성공 응답은 204 No Content
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')

      setDeletePassword('')
      setShowDeleteModal(false)
      setShowDeleteSuccessModal(true)
    } catch {
      setDeleteError(
        '서버와 연결할 수 없습니다. 잠시 후 다시 시도해주세요.'
      )
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteSuccessConfirm = () => {
    setShowDeleteSuccessModal(false)
    navigate('/login')
  }

  const closeNicknameModal = () => {
    setShowNicknameModal(false)
    setNewNickname('')
    setNicknameError('')
  }

  const closeEmailModal = () => {
    setShowEmailModal(false)
    setShowEmailCodeSentModal(false)
    setNewEmail('')
    setEmailCode('')
    setEmailCodeSent(false)
    setEmailError('')
  }

  const closePasswordModal = () => {
    setShowPasswordModal(false)
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setPasswordError('')
  }

  return (
    <main className="member-info-page">
      <aside className="member-info-sidebar">
        <div className="member-info-sidebar-title">논문 챗봇</div>

        <nav className="member-info-sidebar-menu">
          <button type="button">▤ 모든 문서함</button>
          <button type="button">☆ 중요 문서함</button>
          <button type="button">☷ 읽는 중</button>
          <button type="button">✦ AI 챗봇</button>
        </nav>

        <div className="member-info-sidebar-divider" />
        <span className="member-info-sidebar-recent">Recent</span>
      </aside>

      <section className="member-info-content">
        <header className="member-info-header">
          <h1>회원정보</h1>
          <p>닉네임, 이메일, 비밀번호를 변경할 수 있습니다.</p>
        </header>

        <div className="member-info-list">
          <div className="member-info-card">
            <div>
              <span className="member-info-label">닉네임</span>
              <strong>
                {isLoading ? '불러오는 중...' : currentNickname}
              </strong>
            </div>

            <button
              type="button"
              onClick={() => setShowNicknameModal(true)}
              disabled={isLoading}
            >
              변경
            </button>
          </div>

          <div className="member-info-card">
            <div>
              <span className="member-info-label">이메일</span>
              <strong>
                {isLoading ? '불러오는 중...' : currentEmail}
              </strong>
            </div>

            <button
              type="button"
              onClick={() => setShowEmailModal(true)}
            >
              변경
            </button>
          </div>

          <div className="member-info-card">
            <div>
              <span className="member-info-label">비밀번호</span>
              <strong>••••••••</strong>
            </div>

            <button
              type="button"
              onClick={() => setShowPasswordModal(true)}
            >
              변경
            </button>
          </div>

          <div className="member-info-delete">
            <button
              type="button"
              onClick={() => {
                setDeletePassword('')
                setDeleteError('')
                setShowDeleteModal(true)
              }}
            >
              회원 탈퇴
            </button>
          </div>
        </div>
      </section>

      {showNicknameModal && (
        <div className="member-modal-overlay">
          <div className="member-modal">
            <div className="member-modal-header">
              <h2>닉네임 변경</h2>

              <button
                type="button"
                onClick={closeNicknameModal}
              >
                ✕
              </button>
            </div>

            <div className="member-modal-body">
              <div className="member-modal-current">
                <span>현재 닉네임</span>
                <strong>{currentNickname}</strong>
              </div>

              <div className="member-modal-field">
                <label htmlFor="newNickname">
                  새 닉네임
                </label>

                <input
                  id="newNickname"
                  type="text"
                  placeholder="새 닉네임 입력"
                  value={newNickname}
                  onChange={(e) => {
                    setNewNickname(e.target.value)
                    setNicknameError('')
                  }}
                  disabled={isSavingNickname}
                />

                {nicknameError && (
                  <p className="member-modal-error">
                    {nicknameError}
                  </p>
                )}
              </div>
            </div>

            <div className="member-modal-footer">
              <button
                className="member-modal-cancel"
                type="button"
                onClick={closeNicknameModal}
                disabled={isSavingNickname}
              >
                취소
              </button>

              <button
                className="member-modal-save"
                type="button"
                onClick={handleNicknameSave}
                disabled={isSavingNickname}
              >
                {isSavingNickname ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showEmailModal && (
        <div className="member-modal-overlay">
          <div className="member-modal">
            <div className="member-modal-header">
              <h2>이메일 변경</h2>

              <button
                type="button"
                onClick={closeEmailModal}
              >
                ✕
              </button>
            </div>

            <div className="member-modal-body">
              <div className="member-modal-field">
                <label htmlFor="newEmail">새 이메일</label>

                <input
                  id="newEmail"
                  type="email"
                  placeholder="새 이메일 입력"
                  value={newEmail}
                  onChange={(e) => {
                    setNewEmail(e.target.value)
                    setEmailCodeSent(false)
                    setEmailError('')
                  }}
                />
              </div>

              <div className="member-modal-field">
                <label htmlFor="emailCode">
                  인증번호
                </label>

                <div className="member-email-verification-row">
                  <input
                    id="emailCode"
                    type="text"
                    placeholder="인증번호 입력"
                    value={emailCode}
                    onChange={(e) => {
                      setEmailCode(e.target.value)
                      setEmailError('')
                    }}
                  />

                  <button
                    type="button"
                    onClick={handleSendEmailCode}
                  >
                    인증번호 보내기
                  </button>
                </div>

                {emailError && (
                  <p className="member-modal-error">
                    {emailError}
                  </p>
                )}
              </div>
            </div>

            <div className="member-modal-footer">
              <button
                className="member-modal-cancel"
                type="button"
                onClick={closeEmailModal}
              >
                취소
              </button>

              <button
                className="member-modal-save"
                type="button"
                onClick={handleEmailSave}
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}

      {showEmailCodeSentModal && (
        <div className="member-modal-overlay">
          <div className="member-success-modal">
            <p>인증번호가 전송되었습니다.</p>

            <button
              type="button"
              onClick={() => setShowEmailCodeSentModal(false)}
            >
              확인
            </button>
          </div>
        </div>
      )}

      {showPasswordModal && (
        <div className="member-modal-overlay">
          <div className="member-modal">
            <div className="member-modal-header">
              <h2>비밀번호 변경</h2>

              <button
                type="button"
                onClick={closePasswordModal}
                disabled={isSavingPassword}
              >
                ✕
              </button>
            </div>

            <div className="member-modal-body">
              <div className="member-modal-field">
                <label htmlFor="currentPassword">
                  현재 비밀번호
                </label>

                <input
                  id="currentPassword"
                  type="password"
                  placeholder="현재 비밀번호"
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value)
                    setPasswordError('')
                  }}
                  disabled={isSavingPassword}
                />
              </div>

              <div className="member-modal-field">
                <label htmlFor="newPassword">
                  새 비밀번호
                </label>

                <input
                  id="newPassword"
                  type="password"
                  placeholder="새 비밀번호"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value)
                    setPasswordError('')
                  }}
                  disabled={isSavingPassword}
                />
              </div>

              <div className="member-modal-field">
                <label htmlFor="confirmPassword">
                  새 비밀번호 확인
                </label>

                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="새 비밀번호 확인"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value)
                    setPasswordError('')
                  }}
                  disabled={isSavingPassword}
                />
              </div>

              {passwordError && (
                <p className="member-modal-error">
                  {passwordError}
                </p>
              )}
            </div>

            <div className="member-modal-footer">
              <button
                className="member-modal-cancel"
                type="button"
                onClick={closePasswordModal}
                disabled={isSavingPassword}
              >
                취소
              </button>

              <button
                className="member-modal-save"
                type="button"
                onClick={handlePasswordSave}
                disabled={isSavingPassword}
              >
                {isSavingPassword ? '변경 중...' : '변경'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="member-modal-overlay">
          <div className="member-delete-modal">
            <div className="member-modal-header">
              <h2>회원 탈퇴</h2>

              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false)
                  setDeletePassword('')
                  setDeleteError('')
                }}
                disabled={isDeleting}
              >
                ✕
              </button>
            </div>

            <div className="member-delete-body">
              <p>정말 회원 탈퇴를 진행하시겠습니까?</p>
              <p>탈퇴 시 계정 정보는 복구할 수 없습니다.</p>

              <div className="member-modal-field">
                <label htmlFor="deletePassword">
                  현재 비밀번호
                </label>

                <input
                  id="deletePassword"
                  type="password"
                  placeholder="현재 비밀번호"
                  value={deletePassword}
                  onChange={(e) => {
                    setDeletePassword(e.target.value)
                    setDeleteError('')
                  }}
                  disabled={isDeleting}
                />

                {deleteError && (
                  <p className="member-modal-error">
                    {deleteError}
                  </p>
                )}
              </div>
            </div>

            <div className="member-modal-footer">
              <button
                className="member-modal-cancel"
                type="button"
                onClick={() => {
                  setShowDeleteModal(false)
                  setDeletePassword('')
                  setDeleteError('')
                }}
                disabled={isDeleting}
              >
                취소
              </button>

              <button
                className="member-delete-confirm"
                type="button"
                onClick={handleDeleteAccount}
                disabled={isDeleting}
              >
                {isDeleting ? '탈퇴 처리 중...' : '탈퇴'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteSuccessModal && (
        <div className="member-modal-overlay">
          <div className="member-success-modal member-delete-success-modal">
            <p>회원 탈퇴가 완료되었습니다.</p>

            <button
              type="button"
              onClick={handleDeleteSuccessConfirm}
            >
              확인
            </button>
          </div>
        </div>
      )}
    </main>
  )
}

export default MemberInformationPage