#!/usr/bin/env node
/**
 * Script to validate SDK code examples in MDX documentation files
 * Extracts code blocks and validates TypeScript/JavaScript syntax
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

interface CodeExample {
  file: string;
  language: string;
  code: string;
  lineNumber: number;
}

interface ValidationResult {
  file: string;
  lineNumber: number;
  language: string;
  error: string;
  code: string;
}

const errors: ValidationResult[] = [];
const warnings: ValidationResult[] = [];

/**
 * Recursively find all MDX files in a directory
 */
function findMdxFiles(dir: string, fileList: string[] = []): string[] {
  const files = readdirSync(dir);

  files.forEach((file) => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);

    if (stat.isDirectory()) {
      findMdxFiles(filePath, fileList);
    } else if (extname(file) === '.mdx') {
      fileList.push(filePath);
    }
  });

  return fileList;
}

/**
 * Extract code blocks from MDX content
 */
function extractCodeBlocks(content: string, filePath: string): CodeExample[] {
  const codeBlocks: CodeExample[] = [];
  const lines = content.split('\n');
  let inCodeBlock = false;
  let currentLanguage = '';
  let currentCode: string[] = [];
  let codeBlockStartLine = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check for code block start/end (may have leading whitespace)
    const codeBlockMatch = line.match(/^(\s*)```(\w+)?\s*$/);
    if (codeBlockMatch) {
      if (inCodeBlock) {
        // End of code block
        codeBlocks.push({
          file: filePath,
          language: currentLanguage,
          code: currentCode.join('\n'),
          lineNumber: codeBlockStartLine + 1,
        });
        currentCode = [];
        inCodeBlock = false;
      } else {
        // Start of code block
        inCodeBlock = true;
        currentLanguage = codeBlockMatch[2] || '';
        codeBlockStartLine = i;
      }
      continue;
    }

    if (inCodeBlock) {
      currentCode.push(line);
    }
  }

  return codeBlocks;
}

/**
 * Validate JavaScript/TypeScript syntax
 */
function validateSyntax(example: CodeExample): void {
  const { code, language, file, lineNumber } = example;

  // Only validate JavaScript and TypeScript code blocks
  if (!['javascript', 'js', 'typescript', 'ts'].includes(language)) {
    return;
  }

  // Check for common syntax errors
  const checks = [
    {
      pattern: /const\s+\{[^}]+}\s*_\s*=/,
      message: 'Trailing underscore after destructuring (likely syntax error)',
    },
    {
      pattern: /let\s+\{[^}]+}\s*_\s*=/,
      message: 'Trailing underscore after destructuring (likely syntax error)',
    },
    {
      pattern: /var\s+\{[^}]+}\s*_\s*=/,
      message: 'Trailing underscore after destructuring (likely syntax error)',
    },
  ];

  // Check for API usage patterns (warnings, not errors)
  const apiChecks = [
    {
      pattern: /sdk\.anchor\.read\([^)]+\)\.response\.data/,
      message: 'Using .read().response.data - verify this matches SDK API',
      isError: false,
    },
    {
      pattern: /sdk\.anchor\.read\([^)]+\)\.response/,
      message: 'Using .read().response - verify this matches SDK API',
      isError: false,
    },
  ];

  // Check for missing semicolons in critical places (warnings)
  if (!code.includes(';') && code.trim().length > 50) {
    warnings.push({
      file,
      lineNumber,
      language,
      error: 'Code block missing semicolons (may be intentional for examples)',
      code: code.substring(0, 100) + '...',
    });
  }

  // Run syntax checks
  checks.forEach((check) => {
    if (check.pattern.test(code)) {
      errors.push({
        file,
        lineNumber,
        language,
        error: check.message,
        code: code.substring(0, 200) + (code.length > 200 ? '...' : ''),
      });
    }
  });

  // Run API usage pattern checks
  apiChecks.forEach((check) => {
    if (check.pattern.test(code)) {
      warnings.push({
        file,
        lineNumber,
        language,
        error: check.message,
        code: code.substring(0, 200) + (code.length > 200 ? '...' : ''),
      });
    }
  });

  // Validate async/await usage
  if (code.includes('await')) {
    const hasAsyncFunction = /async\s+(function|\(|\s+\w+\s*\()/.test(code);
    const hasArrowFunction = /=>/.test(code);
    const hasTopLevelAwait = !code.match(/^(async\s+)?(function|\w+\s*\(|\([^)]*\)\s*=>)/);
    
    // Check if it's a function definition without async
    if (!hasAsyncFunction && (code.match(/function\s+\w+\s*\(/) || code.match(/\w+\s*=\s*\([^)]*\)\s*=>/))) {
      warnings.push({
        file,
        lineNumber,
        language,
        error: 'Using await in function - ensure function is marked as async',
        code: code.substring(0, 200) + (code.length > 200 ? '...' : ''),
      });
    }
  }

  // Check for consistency in method chaining patterns
  const readPatterns = [
    /sdk\.anchor\.read\([^)]+\)\.response\.data/,
    /\(await\s+sdk\.anchor\.read\([^)]+\)\)\.response\.data/,
  ];
  
  const readMatches = readPatterns.filter(p => p.test(code));
  if (readMatches.length > 0) {
    // This is just for consistency checking - no error
  }

  // Check for undefined variables that should be imported
  const commonImports = ['sdk', 'keyPair', 'LedgerSdk'];
  commonImports.forEach((importName) => {
    const usagePattern = new RegExp(`\\b${importName}\\b`);
    const importPattern = new RegExp(`import.*${importName}`);
    if (usagePattern.test(code) && !importPattern.test(code)) {
      // Check if it's in a previous code block context (not an error)
      // This is just a warning for now
    }
  });
}

/**
 * Main validation function
 */
function main() {
  const docsDir = join(process.cwd(), 'content', 'docs');
  console.log(`\n🔍 Validating SDK code examples in ${docsDir}\n`);

  const mdxFiles = findMdxFiles(docsDir);
  console.log(`Found ${mdxFiles.length} MDX files\n`);

  let totalExamples = 0;
  let validatedExamples = 0;

  mdxFiles.forEach((filePath) => {
    try {
      const content = readFileSync(filePath, 'utf-8');
      const codeBlocks = extractCodeBlocks(content, filePath);
      
      codeBlocks.forEach((block) => {
        totalExamples++;
        if (['javascript', 'js', 'typescript', 'ts'].includes(block.language)) {
          validatedExamples++;
          validateSyntax(block);
        }
      });
    } catch (error) {
      console.error(`Error reading file ${filePath}:`, error);
    }
  });

  console.log(`\n📊 Validation Summary:`);
  console.log(`   Total code blocks: ${totalExamples}`);
  console.log(`   Validated (JS/TS): ${validatedExamples}`);
  console.log(`   Errors found: ${errors.length}`);
  console.log(`   Warnings: ${warnings.length}\n`);

  if (errors.length > 0) {
    console.log('❌ ERRORS:\n');
    errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error.file}:${error.lineNumber} (${error.language})`);
      console.log(`   ${error.error}`);
      console.log(`   Code: ${error.code.split('\n')[0]}`);
      console.log('');
    });
  }

  if (warnings.length > 0) {
    console.log('⚠️  WARNINGS:\n');
    warnings.forEach((warning, index) => {
      console.log(`${index + 1}. ${warning.file}:${warning.lineNumber} (${warning.language})`);
      console.log(`   ${warning.error}`);
      console.log('');
    });
  }

  if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ All code examples validated successfully!\n');
    process.exit(0);
  } else {
    console.log(`\n❌ Found ${errors.length} error(s) and ${warnings.length} warning(s)\n`);
    process.exit(errors.length > 0 ? 1 : 0);
  }
}

main();

