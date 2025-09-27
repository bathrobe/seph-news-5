import { convertLexicalToHTML, defaultHTMLConverters } from '@payloadcms/richtext-lexical/html'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import React from 'react'

import { getNoteBySlug, type LinkedNote } from '../note-data'

export const dynamic = 'force-dynamic'

type RouteParams = Promise<{
  slug: string
}>

type Args = {
  params: RouteParams
}

type RelationshipValue = number | LinkedNote | null | undefined

const toNote = (value: RelationshipValue): LinkedNote | null => {
  if (!value || typeof value === 'number') return null
  return value
}

const formatDate = (value: string) => {
  try {
    return new Intl.DateTimeFormat('en', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(value))
  } catch (_error) {
    return value
  }
}

const renderRichText = (content: unknown) => {
  if (!content) return null

  try {
    // Ensure content has the proper structure for Lexical
    const lexicalData = content && typeof content === 'object' && 'root' in content
      ? content
      : { root: { type: 'root', children: [], direction: null, format: '', indent: 0, version: 1 } }

    return convertLexicalToHTML({
      converters: defaultHTMLConverters,
      data: lexicalData as any,
    })
  } catch (_error) {
    return null
  }
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  const note = await getNoteBySlug(slug)

  if (!note) {
    return {
      title: 'Note Not Found · Seph News',
    }
  }

  return {
    title: `${note.title} · Seph News`,
    description: `Created ${formatDate(note.createdAt)}`,
  }
}

export default async function NotePage({ params }: Args) {
  const { slug } = await params
  const note = await getNoteBySlug(slug)

  if (!note) {
    notFound()
  }

  const html = renderRichText(note.content)

  const outgoingLinks = Array.isArray(note.links) ? note.links : []
  const backlinks = Array.isArray(note.backlinks?.docs) ? note.backlinks?.docs : []

  return (
    <article className="note-content">
      <header className="note-content__header">
        <p className="note-content__meta">Created {formatDate(note.createdAt)}</p>
        <h1 className="note-content__title">{note.title}</h1>
      </header>
      <section className="note-content__body">
        {html ? <div dangerouslySetInnerHTML={{ __html: html }} /> : <p>No content yet.</p>}
      </section>
      {(outgoingLinks.length > 0 || backlinks.length > 0) && (
        <section className="note-links">
          <h2 className="note-links__title">Links</h2>
          <ul className="note-links__list">
            {outgoingLinks.map((link) => {
              const linkedNote = toNote(link.note)
              if (!linkedNote) return null

              return (
                <li key={`out-${link.id ?? linkedNote.id}`} className="note-links__item">
                  <span aria-hidden="true">→</span>{' '}
                  <Link href={`/notes/${linkedNote.slug}`}>{linkedNote.title}</Link>
                  {link.description ? <span> · {link.description}</span> : null}
                </li>
              )
            })}
            {backlinks.map((item, index) => {
              const linkedNote = toNote(item)
              if (!linkedNote) return null

              return (
                <li key={`back-${linkedNote.id}-${index}`} className="note-links__item">
                  <span aria-hidden="true">←</span>{' '}
                  <Link href={`/notes/${linkedNote.slug}`}>{linkedNote.title}</Link>
                </li>
              )
            })}
          </ul>
        </section>
      )}
    </article>
  )
}
