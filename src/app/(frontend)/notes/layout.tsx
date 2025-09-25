import React from 'react'

import { Sidebar } from './sidebar'
import { getNotesNavigation } from './navigation'
import './styles.css'

export const dynamic = 'force-dynamic'

type Props = {
  children: React.ReactNode
  params: { slug?: string }
}

export default async function NotesLayout({ children, params }: Props) {
  const { folders, looseNotes } = await getNotesNavigation()
  const activeSlug = params?.slug

  return (
    <div className="note-app__shell">
      <Sidebar folders={folders} looseNotes={looseNotes} activeSlug={activeSlug} />
      <main className="note-app__main">{children}</main>
    </div>
  )
}
