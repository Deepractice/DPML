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
  // Protocol specifications
  {
    source: path.join(specsDir, 'protocol/index.zh-CN.md'),
    target: path.join(docsDir, 'zh/protocol/index.md'),
    lang: 'zh',
    type: 'protocol'
  },
  {
    source: path.join(specsDir, 'protocol/index.en.md'),
    target: path.join(docsDir, 'en/protocol/index.md'),
    lang: 'en',
    type: 'protocol'
  },
  // Whitepapers
  {
    source: path.join(specsDir, 'whitepaper/index.zh-CN.md'),
    target: path.join(docsDir, 'zh/whitepaper/index.md'),
    lang: 'zh',
    type: 'whitepaper'
  },
  {
    source: path.join(specsDir, 'whitepaper/index.en.md'),
    target: path.join(docsDir, 'en/whitepaper/index.md'),
    lang: 'en',
    type: 'whitepaper'
  }
]

console.log('📄 Syncing DPML Documentation (Protocols & Whitepapers)...\n')

let success = true

for (const { source, target, lang, type } of syncMap) {
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
    const emoji = type === 'protocol' ? '📋' : '📖'
    console.log(`✅ ${emoji} [${lang}] ${path.basename(source)} → ${path.relative(projectRoot, target)}`)
  } catch (error) {
    console.error(`❌ Failed to sync ${lang}:`, error.message)
    success = false
  }
}

if (success) {
  console.log('\n✨ All documentation synced successfully!')
} else {
  console.error('\n❌ Some documentation failed to sync')
  process.exit(1)
}
