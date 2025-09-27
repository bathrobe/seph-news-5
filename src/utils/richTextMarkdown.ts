import type { SanitizedServerEditorConfig } from '@payloadcms/richtext-lexical'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import {
  convertLexicalToMarkdown,
  convertMarkdownToLexical,
  editorConfigFactory,
} from '@payloadcms/richtext-lexical'
import type { FieldHook, PayloadRequest, RichTextField } from 'payload'

const isSerializedEditorState = (value: unknown): value is SerializedEditorState => {
  return typeof value === 'object' && value !== null
}

const isMarkdownString = (value: unknown): value is string => {
  return typeof value === 'string'
}

const shouldServeMarkdown = (req: PayloadRequest | undefined): boolean => {
  if (!req || !req.query) {
    return false
  }

  const query = req.query
  let formatValue: unknown

  if (typeof query === 'object' && query !== null) {
    if ('get' in query && typeof query.get === 'function') {
      formatValue = query.get('format')
    } else {
      formatValue = (query as Record<string, unknown>).format
    }
  }

  if (Array.isArray(formatValue)) {
    return formatValue.some((entry) => typeof entry === 'string' && entry.toLowerCase() === 'markdown')
  }

  if (typeof formatValue === 'string') {
    return formatValue.toLowerCase() === 'markdown'
  }

  return false
}

const createEditorConfigResolver = () => {
  let cachedConfigPromise: Promise<SanitizedServerEditorConfig> | undefined

  const resolveConfig = async (
    field: RichTextField,
    req: PayloadRequest,
  ): Promise<SanitizedServerEditorConfig> => {
    const loadConfig = async () => {
      if (field?.editor) {
        return editorConfigFactory.fromField({ field })
      }

      if (req?.payload?.config) {
        return editorConfigFactory.default({ config: req.payload.config })
      }

      throw new Error('Unable to resolve lexical editor config for Markdown conversion.')
    }

    if (!cachedConfigPromise) {
      cachedConfigPromise = loadConfig().catch((error) => {
        cachedConfigPromise = undefined
        throw error
      })
    }

    return cachedConfigPromise
  }

  return resolveConfig
}

export const createMarkdownAfterReadHook = (): FieldHook => {
  const resolveEditorConfig = createEditorConfigResolver()

  return async ({ field, req, value }) => {
    if (!shouldServeMarkdown(req) || !isSerializedEditorState(value) || field?.type !== 'richText') {
      return value
    }

    try {
      const editorConfig = await resolveEditorConfig(field as RichTextField, req as PayloadRequest)

      return convertLexicalToMarkdown({
        data: value,
        editorConfig,
      })
    } catch (error) {
      req?.payload?.logger?.error({
        err: error,
        message: 'Failed to convert rich text to Markdown. Returning original value.',
      })

      return value
    }
  }
}

export const createMarkdownBeforeValidateHook = (): FieldHook => {
  const resolveEditorConfig = createEditorConfigResolver()

  return async ({ field, req, value }) => {
    if (field?.type !== 'richText' || !req || !isMarkdownString(value)) {
      return value
    }

    const trimmed = value.trim()

    if (trimmed.length === 0) {
      return value
    }

    try {
      const editorConfig = await resolveEditorConfig(field as RichTextField, req)

      return convertMarkdownToLexical({
        editorConfig,
        markdown: value,
      })
    } catch (error) {
      req.payload.logger?.error({
        err: error,
        message: 'Failed to convert Markdown payload into Lexical JSON.',
      })

      throw error
    }
  }
}
