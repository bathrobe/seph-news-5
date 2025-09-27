import type { CollectionConfig } from 'payload'

import { allowAnyone, requireAuthenticated } from '../access/permissions'
import {
  createMarkdownAfterReadHook,
  createMarkdownBeforeValidateHook,
} from '../utils/richTextMarkdown'
import { createSlugHook } from './utils/formatSlug'

const formatNoteSlug = createSlugHook('title')

export const Notes: CollectionConfig = {
  slug: 'notes',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'folder', 'updatedAt'],
  },
  access: {
    read: allowAnyone,
    create: requireAuthenticated,
    update: requireAuthenticated,
    delete: requireAuthenticated,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'url',
      type: 'text',
    },
    {
      name: 'author',
      type: 'text',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      hooks: {
        beforeValidate: [formatNoteSlug],
      },
    },
    {
      name: 'folder',
      type: 'relationship',
      relationTo: 'folders',
      required: false,
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
      hooks: {
        beforeValidate: [createMarkdownBeforeValidateHook()],
        afterRead: [createMarkdownAfterReadHook()],
      },
    },
    {
      name: 'links',
      type: 'array',
      label: 'Links',
      interfaceName: 'NoteLink',
      admin: {
        description: 'Relationships to other notes with context about the connection.',
      },
      fields: [
        {
          name: 'note',
          type: 'relationship',
          relationTo: 'notes',
          required: true,
        },
        {
          name: 'description',
          type: 'text',
          required: false,
        },
      ],
    },
    {
      name: 'backlinks',
      label: 'Backlinks',
      type: 'join',
      collection: 'notes',
      on: 'links.note',
      admin: {
        description: 'Other notes that reference this note.',
      },
    },
  ],
}

export default Notes
