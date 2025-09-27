const slugifyInput = (input: string): string =>
  input
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')

const getString = (source: unknown): string | null => {
  if (typeof source !== 'string') {
    return null
  }

  const trimmed = source.trim()

  return trimmed.length > 0 ? trimmed : null
}

type HookArgs = {
  value?: string | null
  siblingData?: Record<string, unknown>
  data?: Record<string, unknown>
  originalDoc?: Record<string, unknown> | null
}

type SlugHook = (args: HookArgs) => string | null | undefined

export const createSlugHook = (fieldName: string): SlugHook => ({
  siblingData,
  data,
  value,
  originalDoc,
}) => {
  const providedSlug =
    getString(value) ?? getString(siblingData?.slug) ?? getString(data?.slug)

  if (providedSlug) {
    return slugifyInput(providedSlug)
  }

  const existingSlug = getString(originalDoc?.slug)
  if (existingSlug) {
    return existingSlug
  }

  const candidate = getString(siblingData?.[fieldName]) ?? getString(data?.[fieldName])

  if (!candidate) {
    return value ?? undefined
  }

  return slugifyInput(candidate)
}

export const slugify = slugifyInput
