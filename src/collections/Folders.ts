import type { CollectionConfig } from 'payload'

import { allowAnyone, requireAuthenticated } from '../access/permissions'
import { createSlugHook } from './utils/formatSlug'

const formatFolderSlug = createSlugHook('name')

export const Folders: CollectionConfig = {
  slug: 'folders',
  admin: {
    useAsTitle: 'name',
  },
  access: {
    read: allowAnyone,
    create: requireAuthenticated,
    update: requireAuthenticated,
    delete: requireAuthenticated,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      hooks: {
        beforeValidate: [formatFolderSlug],
      },
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'folders',
      required: false,
    },
  ],
}

export default Folders
