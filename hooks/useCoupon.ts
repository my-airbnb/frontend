'use client'

import { useMutation } from '@tanstack/react-query'
import apiClient from '@/lib/axios'

export interface CouponResult {
  valid: boolean
  code: string
  message: string
  discount: number
  finalAmount: number
}

/** Validate a promo code against a subtotal at checkout. Public endpoint. */
export function useValidateCoupon() {
  return useMutation({
    mutationFn: async (vars: { code: string; amount: number }): Promise<CouponResult> => {
      const res = await apiClient.post<CouponResult>('/coupons/validate', vars)
      return res.data
    },
  })
}
