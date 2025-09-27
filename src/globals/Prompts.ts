import type { GlobalConfig } from 'payload'

import { allowAnyone, requireAuthenticated } from '../access/permissions'
import {
  createMarkdownAfterReadHook,
  createMarkdownBeforeValidateHook,
} from '../utils/richTextMarkdown'

export const Prompts: GlobalConfig = {
  slug: 'prompts',
  label: 'Prompts',
  access: {
    read: allowAnyone,
    update: requireAuthenticated,
  },
  fields: [
    {
      name: 'prompts',
      label: 'Prompts',
      type: 'richText',
      required: true,
      hooks: {
        beforeValidate: [createMarkdownBeforeValidateHook()],
        afterRead: [createMarkdownAfterReadHook()],
      },
    },
  ],
}

export default Prompts
