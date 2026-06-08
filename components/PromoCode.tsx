'use client'

import { useState } from 'react'
import { Tag, Check, Loader as Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useValidateCoupon } from '@/hooks/useCoupon'

interface PromoCodeProps {
  /** Subtotal the discount applies to. */
  amount: number
  appliedCode: string | null
  /** Called with the code + discount amount when a valid code is applied, or nulls when removed. */
  onApply: (code: string | null, discount: number) => void
}

export default function PromoCode({ amount, appliedCode, onApply }: PromoCodeProps) {
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const validate = useValidateCoupon()

  const apply = () => {
    const trimmed = code.trim()
    if (!trimmed) return
    setError(null)
    validate.mutate(
      { code: trimmed, amount },
      {
        onSuccess: (res) => {
          if (res.valid) {
            onApply(res.code, res.discount)
          } else {
            setError(res.message || 'This code is not valid')
          }
        },
        onError: () => setError('Could not check that code. Try again.'),
      }
    )
  }

  if (appliedCode) {
    return (
      <div className="mb-6 flex items-center justify-between rounded-xl border border-border bg-muted/40 px-4 py-3">
        <span className="flex items-center gap-2 text-sm font-medium">
          <Check className="h-4 w-4" />
          Code <span className="font-semibold">{appliedCode}</span> applied
        </span>
        <button
          type="button"
          onClick={() => { onApply(null, 0); setCode(''); setError(null) }}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" /> Remove
        </button>
      </div>
    )
  }

  return (
    <div className="mb-6">
      <label className="mb-2 flex items-center gap-2 text-sm font-medium">
        <Tag className="h-4 w-4" /> Have a promo code?
      </label>
      <div className="flex gap-2">
        <Input
          value={code}
          onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(null) }}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); apply() } }}
          placeholder="Enter code"
          className="uppercase"
          aria-label="Promo code"
        />
        <Button type="button" variant="outline" onClick={apply} disabled={validate.isPending || !code.trim()}>
          {validate.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
        </Button>
      </div>
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </div>
  )
}
