export function getApiErrorMessage(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  const axiosError = err as { response?: { data?: { message?: string } } }
  return axiosError?.response?.data?.message || fallback
}

export function stripHtml(html: string): string {
  if (typeof document === 'undefined') {
    return html.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '')
  }
  const div = document.createElement('div')
  div.innerHTML = html.replace(/<br\s*\/?>/gi, '\n')
  return div.textContent || div.innerText || ''
}

export function normalizeListingsResponse<T>(data: T[] | { content?: T[] }): T[] {
  if (Array.isArray(data)) return data
  return (data as { content?: T[] }).content || []
}
