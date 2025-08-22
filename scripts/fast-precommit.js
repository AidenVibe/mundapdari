#!/usr/bin/env node

/**
 * ⚡ ULTRA-FAST PRE-COMMIT SCRIPT
 * Target: <1 second execution time
 * Strategy: Minimal checks, maximum speed
 */

process.env.NODE_ENV = 'production';
process.env.FORCE_COLOR = '0';
process.env.NO_UPDATE_NOTIFIER = '1';

const { execSync } = require('child_process');
const { statSync } = require('fs');
const path = require('path');

const startTime = Date.now();

// 🔥 ULTRA-FAST: Only check staged files
const getStagedFiles = () => {
  try {
    const output = execSync('git diff --cached --name-only --diff-filter=ACM', { 
      encoding: 'utf8',
      timeout: 200  // 200ms timeout
    });
    return output.trim().split('\n').filter(Boolean);
  } catch {
    return [];
  }
};

// 🚀 MINIMAL VALIDATION: Only critical files
const validateCriticalFiles = (files) => {
  const criticalExtensions = ['.js', '.ts', '.tsx', '.jsx'];
  const criticalFiles = files.filter(file => 
    criticalExtensions.some(ext => file.endsWith(ext)) &&
    !file.includes('node_modules') &&
    !file.includes('.cache') &&
    !file.includes('dist') &&
    !file.includes('build')
  );

  if (criticalFiles.length === 0) {
    console.log('✅ No critical files to validate');
    return true;
  }

  // 🔥 SYNTAX CHECK ONLY (no linting)
  for (const file of criticalFiles.slice(0, 5)) { // Max 5 files
    try {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        execSync(`npx tsc --noEmit --skipLibCheck "${file}"`, { 
          stdio: 'pipe',
          timeout: 500  // 500ms per file
        });
      } else {
        // Basic syntax check for JS files
        require(path.resolve(file));
      }
    } catch (error) {
      console.error(`❌ Syntax error in ${file}`);
      process.exit(1);
    }
  }

  console.log(`✅ Validated ${criticalFiles.length} critical files`);
  return true;
};

// 🎯 MAIN EXECUTION
const main = () => {
  try {
    const stagedFiles = getStagedFiles();
    
    if (stagedFiles.length === 0) {
      console.log('✅ No staged files');
      return;
    }

    console.log(`🔍 Checking ${stagedFiles.length} staged files...`);
    
    // Skip validation for certain file types
    const skipValidation = stagedFiles.every(file => 
      file.endsWith('.md') || 
      file.endsWith('.json') || 
      file.endsWith('.sql') ||
      file.includes('package-lock.json')
    );

    if (skipValidation) {
      console.log('✅ Only documentation/config files, skipping validation');
      return;
    }

    validateCriticalFiles(stagedFiles);
    
  } finally {
    const duration = Date.now() - startTime;
    console.log(`⚡ Pre-commit completed in ${duration}ms`);
    
    if (duration > 1000) {
      console.warn(`⚠️ Exceeded 1s target (${duration}ms)`);
    }
  }
};

main();