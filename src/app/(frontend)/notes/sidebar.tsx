"use client"

import Link from 'next/link'
import { useEffect, useState } from 'react'

import type { FolderNode, NoteSummary } from './navigation'

type SidebarProps = {
  activeSlug?: string
  folders: FolderNode[]
  looseNotes: NoteSummary[]
}

const TREE_INDENT = 16

const findActiveFolderPath = (nodes: FolderNode[], activeSlug?: string): number[] => {
  if (!activeSlug) return []

  const walk = (folder: FolderNode): number[] | null => {
    if (folder.notes.some((note) => note.slug === activeSlug)) {
      return [folder.id]
    }

    for (const child of folder.children) {
      const path = walk(child)
      if (path) {
        return [folder.id, ...path]
      }
    }

    return null
  }

  for (const folder of nodes) {
    const path = walk(folder)
    if (path) return path
  }

  return []
}

const NoteLink = ({
  note,
  activeSlug,
  depth = 0,
}: {
  note: NoteSummary
  activeSlug?: string
  depth?: number
}) => {
  const isActive = note.slug === activeSlug
  const className = isActive ? 'note-nav__link note-nav__link--active' : 'note-nav__link'
  const paddingOffset = depth > 0 ? 10 + depth * TREE_INDENT : undefined
  const style = paddingOffset ? { paddingInlineStart: paddingOffset } : undefined

  return (
    <li className="note-nav__item" key={note.id}>
      <Link href={`/notes/${note.slug}`} className={className} style={style} prefetch>
        <span>{note.title}</span>
      </Link>
    </li>
  )
}

const FolderSection = ({
  folder,
  activeSlug,
  depth,
  openFolders,
  onToggle,
}: {
  folder: FolderNode
  activeSlug?: string
  depth: number
  openFolders: Set<number>
  onToggle: (id: number) => void
}) => {
  const isOpen = openFolders.has(folder.id)
  const paddingOffset = 6 + depth * TREE_INDENT

  return (
    <div className="note-nav__section" data-depth={depth}>
      <button
        type="button"
        className="note-nav__folder"
        style={{ paddingInlineStart: paddingOffset }}
        aria-expanded={isOpen}
        onClick={() => onToggle(folder.id)}
      >
        <span className="note-nav__folder-icon" data-open={isOpen} aria-hidden="true">
          <svg viewBox="0 0 12 12" focusable="false" role="presentation">
            <path d="M4.25 2.75L8 6l-3.75 3.25" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </svg>
        </span>
        <span className="note-nav__folder-label">{folder.name}</span>
      </button>
      {isOpen && (
        <div className="note-nav__section-contents">
          {folder.notes.length > 0 && (
            <ul className="note-nav__items">
              {folder.notes.map((note) => (
                <NoteLink key={note.id} note={note} activeSlug={activeSlug} depth={depth + 1} />
              ))}
            </ul>
          )}
          {folder.children.length > 0 && (
            <div className="note-nav__sub">
              {folder.children.map((child) => (
                <FolderSection
                  key={child.id}
                  folder={child}
                  depth={depth + 1}
                  activeSlug={activeSlug}
                  openFolders={openFolders}
                  onToggle={onToggle}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const computeInitialOpenFolders = (folders: FolderNode[], activeSlug?: string): Set<number> => {
  const open = new Set<number>()

  folders.forEach((folder) => {
    open.add(folder.id)
  })

  const activePath = findActiveFolderPath(folders, activeSlug)
  activePath.forEach((id) => open.add(id))

  return open
}

export const Sidebar = ({ folders, looseNotes, activeSlug }: SidebarProps) => {
  const [openFolders, setOpenFolders] = useState<Set<number>>(() =>
    computeInitialOpenFolders(folders, activeSlug),
  )

  useEffect(() => {
    const activePath = findActiveFolderPath(folders, activeSlug)
    if (activePath.length === 0) return

    setOpenFolders((prev) => {
      let changed = false
      const next = new Set(prev)
      activePath.forEach((id) => {
        if (!next.has(id)) {
          next.add(id)
          changed = true
        }
      })
      return changed ? next : prev
    })
  }, [activeSlug, folders])

  const toggleFolder = (id: number) => {
    setOpenFolders((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  return (
    <aside className="note-app__sidebar">
      <div className="note-app__brand">
        <h1>Seph News</h1>
      </div>
      <div className="note-app__sidebar-scroll">
        <nav className="note-nav" aria-label="Note navigation">
          {looseNotes.length > 0 && (
            <section className="note-nav__section note-nav__section--loose">
              <p className="note-nav__heading">All Notes</p>
              <ul className="note-nav__items">
                {looseNotes.map((note) => (
                  <NoteLink key={note.id} note={note} activeSlug={activeSlug} />
                ))}
              </ul>
            </section>
          )}
          {folders.map((folder) => (
            <FolderSection
              key={folder.id}
              folder={folder}
              depth={0}
              activeSlug={activeSlug}
              openFolders={openFolders}
              onToggle={toggleFolder}
            />
          ))}
        </nav>
      </div>
    </aside>
  )
}
