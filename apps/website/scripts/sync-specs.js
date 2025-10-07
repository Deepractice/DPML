#!/usr/bin/env node
/**
 * Sync DPML Protocol Specifications to Website Docs
 *
 * This script mirrors the specs/ directory structure to docs/
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

/**
 * Recursively copy directory contents
 */
function copyDirectory(src, dest) {
  const stats = []

  function copyRecursive(source, destination) {
    // Create destination directory if it doesn't exist
    if (!fs.existsSync(destination)) {
      fs.mkdirSync(destination, { recursive: true })
    }

    // Read directory contents
    const entries = fs.readdirSync(source, { withFileTypes: true })

    for (const entry of entries) {
      const sourcePath = path.join(source, entry.name)
      const destPath = path.join(destination, entry.name)

      if (entry.isDirectory()) {
        // Recursively copy subdirectories
        copyRecursive(sourcePath, destPath)
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        // Only copy markdown files
        fs.copyFileSync(sourcePath, destPath)
        stats.push({
          source: sourcePath,
          target: destPath,
          name: entry.name
        })
      }
    }
  }

  copyRecursive(src, dest)
  return stats
}

console.log('📄 Syncing DPML Documentation...\n')

let success = true

// Sync directories by language
const languages = ['zh', 'en']

for (const lang of languages) {
  try {
    const sourceLangDir = path.join(specsDir, lang)
    const targetLangDir = path.join(docsDir, lang)

    // Check if source language directory exists
    if (!fs.existsSync(sourceLangDir)) {
      console.log(`⏭️  Skipping ${lang}: source directory not found`)
      continue
    }

    console.log(`📂 Syncing [${lang}] ...`)

    // Copy the entire language directory
    const copiedFiles = copyDirectory(sourceLangDir, targetLangDir)

    // Report copied files
    for (const file of copiedFiles) {
      const relativePath = path.relative(targetLangDir, file.target)
      const type = relativePath.startsWith('protocol') ? '📋' : '📖'
      console.log(`   ✅ ${type} ${relativePath}`)
    }

    console.log(`   ${copiedFiles.length} file(s) synced\n`)
  } catch (error) {
    console.error(`❌ Failed to sync ${lang}:`, error.message)
    success = false
  }
}

if (success) {
  console.log('✨ All documentation synced successfully!')
} else {
  console.error('\n❌ Some documentation failed to sync')
  process.exit(1)
}
