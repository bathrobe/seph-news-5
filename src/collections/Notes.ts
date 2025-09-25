import type { CollectionConfig } from 'payload'

import { allowAnyone, requireAuthenticated } from '../access/permissions'

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
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
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
