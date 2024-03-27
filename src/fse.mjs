import fs from 'node:fs/promises'

export function exists(filePath) {
  return fs.access(filePath).then(() => true).catch(() => false)
}
