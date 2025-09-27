import { getPayload } from 'payload'

import payloadConfig from '@/payload.config'

export type LinkedNote = {
  id: number
  title: string
  slug: string
}

export type PopulatedNote = {
  id: number
  title: string
  slug: string
  createdAt: string
  updatedAt: string
  content?: unknown
  links?: {
    id?: string | null
    description?: string | null
    note: number | LinkedNote | null
  }[] | null
  backlinks?: {
    docs?: (number | LinkedNote | null)[]
    totalDocs?: number
  } | null
}

export const getNoteBySlug = async (slug: string): Promise<PopulatedNote | null> => {
  const config = await payloadConfig
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'notes',
    depth: 2,
    limit: 1,
    pagination: false,
    select: {
      id: true,
      title: true,
      slug: true,
      createdAt: true,
      updatedAt: true,
      content: true,
      links: true,
      backlinks: true,
    },
    where: {
      slug: {
        equals: slug,
      },
    },
    joins: {
      backlinks: {
        limit: 25,
      },
    },
  }) as { docs: PopulatedNote[] }

  return docs.at(0) ?? null
}
