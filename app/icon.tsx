import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

// Favicon — the brand house mark (white house on a near-black rounded square),
// matching the in-app Logo.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#1a1a1a',
          borderRadius: 8,
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 10.7 12 3.2l9 7.5" />
          <path d="M5.2 9.6V20.2h13.6V9.6" />
          <path d="M9.8 20.2v-5.2h4.4v5.2" />
        </svg>
      </div>
    ),
    size,
  )
}
