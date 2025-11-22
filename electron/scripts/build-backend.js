#!/usr/bin/env node

/**
 * Build backend binary using PyInstaller
 * Runs on the current platform only
 */

import { execSync } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const backendDir = path.join(__dirname, '../../backend')
const bundleDir = path.join(backendDir, 'bundle')

// Create bundle directory
if (!fs.existsSync(bundleDir)) {
  fs.mkdirSync(bundleDir, { recursive: true })
}

console.log('[Build] Building backend binary...')
console.log(`[Build] Backend dir: ${backendDir}`)
console.log(`[Build] Bundle dir: ${bundleDir}`)

try {
  // Install PyInstaller if not present
  console.log('[Build] Installing PyInstaller...')
  execSync('pip install pyinstaller', { stdio: 'inherit' })

  // Build backend binary
  const binaryName = process.platform === 'win32' ? 'fastapi_backend.exe' : 'fastapi_backend'
  const outputPath = path.join(bundleDir, binaryName)

  console.log(`[Build] Creating ${binaryName}...`)

  const pyInstallerCmd = [
    'pyinstaller',
    '--onefile',
    '--name', binaryName.replace('.exe', ''),
    '--distpath', bundleDir,
    '--workpath', path.join(bundleDir, 'build'),
    '--specpath', path.join(bundleDir, 'spec'),
    '--add-data', `${path.join(backendDir, 'ml', 'models')}${process.platform === 'win32' ? ';' : ':'}models`,
    '--hidden-import=uvicorn',
    '--hidden-import=fastapi',
    '--hidden-import=sklearn',
    '--hidden-import=joblib',
    path.join(backendDir, 'app', 'main.py'),
  ].join(' ')

  execSync(pyInstallerCmd, { stdio: 'inherit', cwd: backendDir })

  if (fs.existsSync(outputPath)) {
    console.log(`[Build] ✓ Backend binary created: ${outputPath}`)
  } else {
    console.error(`[Build] ✗ Backend binary not found at ${outputPath}`)
    process.exit(1)
  }
} catch (error) {
  console.error('[Build] Error building backend:', error.message)
  process.exit(1)
}
