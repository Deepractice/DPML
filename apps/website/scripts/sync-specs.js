#!/usr/bin/env node
/**
 * Sync DPML Protocol Specifications to Website Docs
 *
 * This script copies the protocol specifications from specs/ to docs/
 * ensuring the website always displays the authoritative version.
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Paths relative to the script location
const projectRoot = path.resolve(__dirname, '../../..')
const specsDir = path.join(projectRoot, 'specs/v1.0')
const docsDir = path.join(__dirname, '../docs')

// Specification files to sync
const syncMap = [
  {
    source: path.join(specsDir, 'dpml-protocol-v1.zh-CN.md'),
    target: path.join(docsDir, 'zh/protocol/index.md'),
    lang: 'zh'
  },
  {
    source: path.join(specsDir, 'dpml-protocol-v1.md'),
    target: path.join(docsDir, 'en/protocol/index.md'),
    lang: 'en'
  }
]

console.log('📄 Syncing DPML Protocol Specifications...\n')

let success = true

for (const { source, target, lang } of syncMap) {
  try {
    // Check if source exists
    if (!fs.existsSync(source)) {
      console.error(`❌ Source not found: ${source}`)
      success = false
      continue
    }

    // Ensure target directory exists
    const targetDir = path.dirname(target)
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true })
    }

    // Copy file
    fs.copyFileSync(source, target)
    console.log(`✅ [${lang}] ${path.basename(source)} → ${path.relative(projectRoot, target)}`)
  } catch (error) {
    console.error(`❌ Failed to sync ${lang}:`, error.message)
    success = false
  }
}

if (success) {
  console.log('\n✨ All specifications synced successfully!')
} else {
  console.error('\n❌ Some specifications failed to sync')
  process.exit(1)
}
