import type { Access } from 'payload'

// Allow any request through.
export const allowAnyone: Access = () => true

// Require an authenticated user (API key or session) to proceed.
export const requireAuthenticated: Access = ({ req }) => Boolean(req.user)
