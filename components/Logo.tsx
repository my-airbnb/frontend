import Link from 'next/link'
import { cn } from '@/lib/utils'

const SIZES = {
  sm: { box: 'h-8 w-8 rounded-xl', icon: 18, text: 'text-lg' },
  md: { box: 'h-9 w-9 rounded-xl', icon: 20, text: 'text-xl' },
  lg: { box: 'h-12 w-12 rounded-2xl', icon: 26, text: 'text-2xl' },
}

/** Brand mark — a charcoal rounded square with a clean house glyph. */
export function BrandMark({ size = 'sm', className }: { size?: keyof typeof SIZES; className?: string }) {
  const s = SIZES[size]
  return (
    <span className={cn('flex items-center justify-center bg-primary text-primary-foreground', s.box, className)}>
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M3 10.7 12 3.2l9 7.5" />
        <path d="M5.2 9.6V20.2h13.6V9.6" />
        <path d="M9.8 20.2v-5.2h4.4v5.2" />
      </svg>
    </span>
  )
}

/**
 * Full logo: brand mark + optional "Airbnb" wordmark. Defaults to a link home.
 * Pass href={null} to render without a link (e.g. inside another link).
 */
export function Logo({
  size = 'sm',
  withWordmark = true,
  responsiveWordmark = false,
  href = '/',
  className,
}: {
  size?: keyof typeof SIZES
  withWordmark?: boolean
  responsiveWordmark?: boolean
  href?: string | null
  className?: string
}) {
  const s = SIZES[size]
  const content = (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <BrandMark size={size} />
      {withWordmark && (
        <span
          className={cn(
            'font-semibold tracking-tight text-foreground',
            s.text,
            responsiveWordmark && 'hidden sm:inline-block',
          )}
        >
          Airbnb
        </span>
      )}
    </span>
  )
  if (href === null) return content
  return (
    <Link href={href} className="inline-flex items-center">
      {content}
    </Link>
  )
}
