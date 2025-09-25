import Link from 'next/link'
import React from 'react'

import type { FolderNode, NoteSummary } from './navigation'

type SidebarProps = {
  activeSlug?: string
  folders: FolderNode[]
  looseNotes: NoteSummary[]
}

const formatDate = (value: string) => {
  try {
    return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(value))
  } catch (error) {
    return ''
  }
}

const NoteLink = ({ note, activeSlug }: { note: NoteSummary; activeSlug?: string }) => {
  const isActive = note.slug === activeSlug
  const className = isActive ? 'note-nav__link note-nav__link--active' : 'note-nav__link'

  return (
    <li className="note-nav__item" key={note.id}>
      <Link href={`/notes/${note.slug}`} className={className} prefetch>
        <span>{note.title}</span>
        <span className="note-nav__meta">{formatDate(note.createdAt)}</span>
      </Link>
    </li>
  )
}

const FolderSection = ({ folder, activeSlug }: { folder: FolderNode; activeSlug?: string }) => (
  <div className="note-nav__section" key={folder.id}>
    <p className="note-nav__heading">{folder.name}</p>
    <ul className="note-nav__items">
      {folder.notes.map((note) => (
        <NoteLink key={note.id} note={note} activeSlug={activeSlug} />
      ))}
    </ul>
    {folder.children.length > 0 && (
      <div className="note-nav__sub">
        {folder.children.map((child) => (
          <FolderSection key={child.id} folder={child} activeSlug={activeSlug} />
        ))}
      </div>
    )}
  </div>
)

export const Sidebar = ({ folders, looseNotes, activeSlug }: SidebarProps) => (
  <aside className="note-app__sidebar">
    <div className="note-app__brand">
      <h1>Seph News</h1>
    </div>
    <div className="note-app__sidebar-scroll">
      <nav className="note-nav" aria-label="Note navigation">
        {looseNotes.length > 0 && (
          <section className="note-nav__section">
            <p className="note-nav__heading">All Notes</p>
            <ul className="note-nav__items">
              {looseNotes.map((note) => (
                <NoteLink key={note.id} note={note} activeSlug={activeSlug} />
              ))}
            </ul>
          </section>
        )}
        {folders.map((folder) => (
          <FolderSection key={folder.id} folder={folder} activeSlug={activeSlug} />
        ))}
      </nav>
    </div>
  </aside>
)
