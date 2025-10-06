import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const size = {
  width: 180,
  height: 180,
};

export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0ea5e9 0%, #d946ef 50%, #f97316 100%)',
        }}
      >
        <svg
          width="120"
          height="120"
          viewBox="0 0 256 256"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* 本のアイコン */}
          <g transform="translate(32, 32)">
            {/* 背表紙 */}
            <path
              d="M16 0 L32 8 L32 176 L16 184 Z"
              fill="rgba(14, 165, 233, 0.8)"
            />

            {/* 左ページ */}
            <rect x="32" y="8" width="64" height="168" fill="white" opacity="0.95" />

            {/* 右ページ */}
            <rect x="96" y="8" width="64" height="168" fill="white" opacity="0.95" />

            {/* ページの線 */}
            <line x1="48" y1="32" x2="80" y2="32" stroke="#0ea5e9" strokeWidth="2" opacity="0.5" />
            <line x1="48" y1="56" x2="80" y2="56" stroke="#0ea5e9" strokeWidth="2" opacity="0.5" />
            <line x1="48" y1="80" x2="80" y2="80" stroke="#0ea5e9" strokeWidth="2" opacity="0.5" />

            <line x1="112" y1="32" x2="144" y2="32" stroke="#d946ef" strokeWidth="2" opacity="0.5" />
            <line x1="112" y1="56" x2="144" y2="56" stroke="#d946ef" strokeWidth="2" opacity="0.5" />
            <line x1="112" y1="80" x2="144" y2="80" stroke="#d946ef" strokeWidth="2" opacity="0.5" />
          </g>
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
