// 리더(ReaderIcons.tsx, 진서 브랜치)의 FolderIcon과 같은 아이콘이에요.
// 브랜치를 합칠 때 충돌이 나지 않도록 라이브러리 폴더에 따로 둡니다.
type IconProps = {
  size?: number
}

export function FolderIcon({ size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6a1 1 0 0 1 1-1h5l2 2h9a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" />
    </svg>
  )
}
