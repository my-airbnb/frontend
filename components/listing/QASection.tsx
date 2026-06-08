'use client'

import { useState } from 'react'
import Link from 'next/link'
import { format, parseISO } from 'date-fns'
import { MessageCircleQuestion, Loader as Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useQa, useAskQuestion, useAnswerQuestion } from '@/hooks/useQa'
import useAuthStore from '@/store/authStore'

function when(iso: string | null) {
  if (!iso) return ''
  try { return format(parseISO(iso), 'MMM d, yyyy') } catch { return '' }
}

export default function QASection({ listingId, hostId }: { listingId: string; hostId: string }) {
  const { user, isAuthenticated } = useAuthStore()
  const { data: questions = [], isLoading } = useQa(listingId)
  const ask = useAskQuestion(listingId)
  const answer = useAnswerQuestion(listingId)

  const isHost = !!user && user.email === hostId
  const [draft, setDraft] = useState('')
  const [answerDrafts, setAnswerDrafts] = useState<Record<string, string>>({})

  const submitQuestion = () => {
    const q = draft.trim()
    if (!q) return
    ask.mutate(
      { question: q, askerName: user ? `${user.firstName ?? ''}`.trim() || undefined : undefined },
      {
        onSuccess: () => { setDraft(''); toast.success('Question posted') },
        onError: () => toast.error('Could not post your question'),
      }
    )
  }

  const submitAnswer = (questionId: string) => {
    const a = (answerDrafts[questionId] ?? '').trim()
    if (!a) return
    answer.mutate(
      { questionId, answer: a },
      {
        onSuccess: () => { setAnswerDrafts((p) => ({ ...p, [questionId]: '' })); toast.success('Answer posted') },
        onError: () => toast.error('Could not post your answer'),
      }
    )
  }

  return (
    <div className="pb-6 border-b border-border">
      <h3 className="text-xl font-semibold mb-1 flex items-center gap-2">
        <MessageCircleQuestion className="h-5 w-5" />
        Questions &amp; answers
      </h3>
      <p className="text-muted-foreground text-sm mb-4">Ask the host anything about the place</p>

      {/* Ask box */}
      {isAuthenticated && !isHost ? (
        <div className="mb-6">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Have a question for the host?"
            maxLength={500}
            rows={2}
          />
          <div className="mt-2 flex justify-end">
            <Button size="sm" onClick={submitQuestion} disabled={ask.isPending || !draft.trim()}>
              {ask.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Post question'}
            </Button>
          </div>
        </div>
      ) : !isAuthenticated ? (
        <p className="mb-6 text-sm text-muted-foreground">
          <Link href="/login" className="underline font-medium">Log in</Link> to ask a question.
        </p>
      ) : null}

      {/* Thread */}
      {isLoading ? (
        <div className="flex py-6 justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : questions.length === 0 ? (
        <p className="text-sm text-muted-foreground">No questions yet — be the first to ask.</p>
      ) : (
        <ul className="space-y-5">
          {questions.map((q) => (
            <li key={q.id} className="rounded-xl border border-border p-4">
              <p className="font-medium">{q.question}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {q.askedByName || 'Guest'}{when(q.createdAt) ? ` · ${when(q.createdAt)}` : ''}
              </p>

              {q.answer ? (
                <div className="mt-3 rounded-lg bg-muted/50 p-3">
                  <p className="text-sm">{q.answer}</p>
                  <p className="text-xs text-muted-foreground mt-1">Host&apos;s reply{when(q.answeredAt) ? ` · ${when(q.answeredAt)}` : ''}</p>
                </div>
              ) : isHost ? (
                <div className="mt-3">
                  <Textarea
                    value={answerDrafts[q.id] ?? ''}
                    onChange={(e) => setAnswerDrafts((p) => ({ ...p, [q.id]: e.target.value }))}
                    placeholder="Write a reply…"
                    maxLength={1000}
                    rows={2}
                  />
                  <div className="mt-2 flex justify-end">
                    <Button size="sm" variant="outline" onClick={() => submitAnswer(q.id)}
                      disabled={answer.isPending || !(answerDrafts[q.id] ?? '').trim()}>
                      {answer.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Post answer'}
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-xs text-muted-foreground italic">Awaiting host reply</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
