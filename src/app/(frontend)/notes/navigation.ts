import { getPayload } from 'payload'

import type { Folder, Note } from '@/payload-types'
import payloadConfig from '@/payload.config'

export type NoteSummary = {
  id: number
  title: string
  slug: string
  createdAt: string
}

export type FolderNode = {
  id: number
  name: string
  slug: string
  notes: NoteSummary[]
  children: FolderNode[]
}

type FolderDoc = Pick<Folder, 'id' | 'name' | 'slug' | 'parent'>
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type NoteDoc = Pick<Note, 'id' | 'title' | 'slug' | 'createdAt' | 'folder'>

type NavigationResult = {
  folders: FolderNode[]
  looseNotes: NoteSummary[]
}

const toFolderId = (value: FolderDoc['parent']): number | null => {
  if (value === null || typeof value === 'undefined') return null
  if (typeof value === 'number') return value
  if (typeof value === 'object' && value !== null) {
    const identifier = value.id
    if (typeof identifier === 'number') return identifier
  }
  return null
}

const sortFolders = (nodes: FolderNode[]): void => {
  nodes.sort((a, b) => a.name.localeCompare(b.name))
  nodes.forEach((node) => sortFolders(node.children))
}

export const getNotesNavigation = async (): Promise<NavigationResult> => {
  const config = await payloadConfig
  const payload = await getPayload({ config })

  const [folderQuery, noteQuery] = await Promise.all([
    payload.find({
      collection: 'folders',
      depth: 0,
      pagination: false,
      sort: 'name',
      select: {
        id: true,
        name: true,
        slug: true,
        parent: true,
      },
    }),
    payload.find({
      collection: 'notes',
      depth: 0,
      pagination: false,
      sort: 'title',
      select: {
        id: true,
        title: true,
        slug: true,
        createdAt: true,
        folder: true,
      },
    }),
  ])

  const folderMap = new Map<number, FolderNode>()

  folderQuery.docs.forEach((folder) => {
    folderMap.set(folder.id, {
      id: folder.id,
      name: folder.name,
      slug: folder.slug,
      notes: [],
      children: [],
    })
  })

  const roots: FolderNode[] = []

  folderQuery.docs.forEach((folder) => {
    const node = folderMap.get(folder.id)
    if (!node) return

    const parentId = toFolderId(folder.parent)
    if (parentId !== null && folderMap.has(parentId)) {
      folderMap.get(parentId)?.children.push(node)
      return
    }

    roots.push(node)
  })

  const looseNotes: NoteSummary[] = []

  noteQuery.docs.forEach((note) => {
    const summary: NoteSummary = {
      id: note.id,
      title: note.title,
      slug: note.slug,
      createdAt: note.createdAt,
    }

    const folderId = toFolderId(note.folder)
    if (folderId !== null && folderMap.has(folderId)) {
      folderMap.get(folderId)?.notes.push(summary)
      return
    }

    looseNotes.push(summary)
  })

  folderMap.forEach((node) => {
    node.notes.sort((a, b) => a.title.localeCompare(b.title))
  })

  sortFolders(roots)
  looseNotes.sort((a, b) => a.title.localeCompare(b.title))

  return {
    folders: roots,
    looseNotes,
  }
}
