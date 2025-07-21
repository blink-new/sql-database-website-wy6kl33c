import { createClient } from '@blinkdotnew/sdk'

export const blink = createClient({
  projectId: 'sql-database-website-wy6kl33c',
  authRequired: true
})

export default blink