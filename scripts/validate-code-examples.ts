#!/usr/bin/env node
/**
 * Script to validate SDK, CLI, and API code examples in MDX documentation files
 * Validates:
 * - SDK examples (TypeScript/JavaScript)
 * - CLI examples (Bash/Shell)
 * - API examples (JSON, HTTP, curl)
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
  severity: 'error' | 'warning';
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
 * Validate JavaScript/TypeScript (SDK) syntax
 */
function validateSDK(example: CodeExample): void {
  const { code, language, file, lineNumber } = example;

  // Only validate JavaScript and TypeScript code blocks
  if (!['javascript', 'js', 'typescript', 'ts'].includes(language)) {
    return;
  }

  // Check for common syntax errors
  const syntaxChecks = [
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
    // Removed overly broad await pattern - it was catching valid code
  ];

  // Check for async/await issues
  if (code.includes('await')) {
    // Check if await is used outside async function
    const hasAsyncFunction = /async\s+(function|\(|\s+\w+\s*\()/.test(code);
    const hasAsyncArrow = /async\s*\([^)]*\)\s*=>/.test(code);
    const hasTopLevelAwait = !hasAsyncFunction && !hasAsyncArrow && 
      !code.match(/^(async\s+)?(function|\w+\s*\(|\([^)]*\)\s*=>)/m);
    
    // Check for function definitions with await but without async
    const functionWithAwait = /(function\s+\w+\s*\([^)]*\)|const\s+\w+\s*=\s*\([^)]*\)\s*=>|const\s+\w+\s*=\s*async\s*\([^)]*\)\s*=>)/;
    if (functionWithAwait.test(code) && code.includes('await') && !hasAsyncFunction && !hasAsyncArrow) {
      warnings.push({
        file,
        lineNumber,
        language,
        error: 'Function uses await but may not be marked as async - verify async keyword is present',
        code: code.substring(0, 200) + (code.length > 200 ? '...' : ''),
        severity: 'warning',
      });
    }
  }

  // Check for SDK API usage patterns
  const sdkPatterns = [
    {
      pattern: /sdk\.(anchor|wallet|intent)\.(read|create|update|drop)\(/,
      message: 'SDK method call detected - verify method name and parameters match SDK API',
      isError: false,
    },
    {
      pattern: /\.(init|data|meta|hash|sign|send)\(/,
      message: 'SDK builder method detected - verify method chaining order is correct',
      isError: false,
    },
  ];

  // Check for import statements
  if (code.includes('import') || code.includes('require')) {
    const hasLedgerSdkImport = /import.*LedgerSdk|require.*ledger-sdk/.test(code);
    const usesSdk = /sdk\./.test(code);
    if (usesSdk && !hasLedgerSdkImport && !code.includes('// Your initialized SDK instance')) {
      warnings.push({
        file,
        lineNumber,
        language,
        error: 'Code uses SDK but import statement may be missing - verify imports are present',
        code: code.substring(0, 200) + (code.length > 200 ? '...' : ''),
        severity: 'warning',
      });
    }
  }

  // Run syntax checks
  syntaxChecks.forEach((check) => {
    if (check.pattern.test(code)) {
      errors.push({
        file,
        lineNumber,
        language,
        error: check.message,
        code: code.substring(0, 200) + (code.length > 200 ? '...' : ''),
        severity: 'error',
      });
    }
  });

  // Run SDK pattern checks (warnings)
  sdkPatterns.forEach((check) => {
    if (check.pattern.test(code) && !check.isError) {
      // Just informational, no error
    }
  });

  // Check for try-catch with async operations
  if (code.includes('await') && !code.includes('try') && code.length > 100) {
    warnings.push({
      file,
      lineNumber,
      language,
      error: 'Async operation without try-catch - consider adding error handling',
      code: code.substring(0, 200) + (code.length > 200 ? '...' : ''),
      severity: 'warning',
    });
  }
}

/**
 * Validate Bash/Shell (CLI) syntax
 */
function validateCLI(example: CodeExample): void {
  const { code, language, file, lineNumber } = example;

  // Only validate bash and shell code blocks
  if (!['bash', 'sh', 'shell'].includes(language)) {
    return;
  }

  const cliChecks = [
    {
      pattern: /minka\s+[a-z]+\s+[a-z]+/,
      message: 'Minka CLI command detected - verify command syntax',
      isError: false,
    },
  ];

  // Check for common bash syntax errors
  // Note: Multi-line commands with quotes are valid, so we check for truly unclosed quotes
  const syntaxChecks = [
    {
      pattern: /`[^`]*$/m,
      message: 'Unclosed backtick in command',
    },
    // Only flag unclosed quotes if they appear on a single line (not multi-line commands)
    // Multi-line bash commands with line continuations (\) are valid
    // Check if quotes are balanced across the entire code block
    {
      pattern: /"/,
      message: 'Unclosed double quote in command',
      validate: (code: string) => {
        // Count quotes - should be even for balanced quotes
        const quoteCount = (code.match(/"/g) || []).length;
        // If odd number of quotes and no line continuation, might be an issue
        // But allow if there are line continuations (multi-line commands)
        if (quoteCount % 2 !== 0 && !code.includes('\\\n')) {
          return true; // Potential issue
        }
        return false; // Likely fine
      },
    },
    {
      pattern: /'/,
      message: 'Unclosed single quote in command',
      validate: (code: string) => {
        // Count quotes - should be even for balanced quotes
        const quoteCount = (code.match(/'/g) || []).length;
        // If odd number of quotes and no line continuation, might be an issue
        if (quoteCount % 2 !== 0 && !code.includes('\\\n')) {
          return true; // Potential issue
        }
        return false; // Likely fine
      },
    },
    {
      pattern: /\$\{[^}]*$/m,
      message: 'Unclosed variable expansion ${...}',
    },
  ];

  // Validate minka CLI command structure
  const minkaCommandPattern = /minka\s+(\w+)\s+(\w+)/;
  const minkaMatch = code.match(minkaCommandPattern);
  if (minkaMatch) {
    const [, command, subcommand] = minkaMatch;
    const validCommands = [
      'server', 'signer', 'ledger', 'wallet', 'anchor', 'intent', 'bridge',
    ];
    if (!validCommands.includes(command)) {
      warnings.push({
        file,
        lineNumber,
        language,
        error: `Unknown minka CLI command: ${command} - verify command name is correct`,
        code: code.substring(0, 200) + (code.length > 200 ? '...' : ''),
        severity: 'warning',
      });
    }
  }

  // Check for curl commands
  if (code.includes('curl')) {
    const curlChecks = [
      {
        pattern: /curl\s+-X\s+\w+\s+[^\s]+/,
        message: 'curl command detected - verify URL and options are correct',
        isError: false,
      },
    ];
    
    // Check for common curl issues
    if (code.includes('curl') && !code.includes('http://') && !code.includes('https://')) {
      warnings.push({
        file,
        lineNumber,
        language,
        error: 'curl command may be missing URL - verify command is complete',
        code: code.substring(0, 200) + (code.length > 200 ? '...' : ''),
        severity: 'warning',
      });
    }
  }

  // Run syntax checks
  syntaxChecks.forEach((check) => {
    if (check.pattern.test(code)) {
      // If there's a custom validate function, use it
      if (check.validate) {
        if (!check.validate(code)) {
          return; // Validation passed, no error
        }
      } else if (check.excludePattern && check.excludePattern.test(code)) {
        return; // Exclude pattern matched, skip
      }
      errors.push({
        file,
        lineNumber,
        language,
        error: check.message,
        code: code.substring(0, 200) + (code.length > 200 ? '...' : ''),
        severity: 'error',
      });
    }
  });
}

/**
 * Validate JSON (API) syntax
 */
function validateJSON(example: CodeExample): void {
  const { code, language, file, lineNumber } = example;

  // Only validate JSON code blocks
  if (language !== 'json') {
    return;
  }

  try {
    // Try to parse JSON
    JSON.parse(code);
  } catch (error) {
    if (error instanceof SyntaxError) {
      errors.push({
        file,
        lineNumber,
        language,
        error: `Invalid JSON syntax: ${error.message}`,
        code: code.substring(0, 200) + (code.length > 200 ? '...' : ''),
        severity: 'error',
      });
    }
  }

  // Check for common JSON issues
  const jsonChecks = [
    {
      pattern: /<[^>]+>/,
      message: 'Placeholder values detected (e.g., <alias-value>) - verify these are replaced in actual usage',
      isError: false,
    },
  ];

  jsonChecks.forEach((check) => {
    if (check.pattern.test(code) && !check.isError) {
      // Just informational for placeholders
    }
  });
}

/**
 * Validate HTTP/curl (API) syntax
 */
function validateHTTP(example: CodeExample): void {
  const { code, language, file, lineNumber } = example;

  // Validate HTTP and curl code blocks
  if (!['http', 'curl'].includes(language)) {
    return;
  }

  // Check for HTTP request structure
  if (language === 'http') {
    const httpChecks = [
      {
        pattern: /^(GET|POST|PUT|DELETE|PATCH)\s+/,
        message: 'HTTP method detected - verify method and endpoint are correct',
        isError: false,
      },
    ];

    // Check for proper HTTP request format
    // Allow for multi-line HTTP requests where method might be on first line
    const firstLine = code.split('\n')[0]?.trim() || '';
    if (!/^(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)\s+/.test(firstLine)) {
      warnings.push({
        file,
        lineNumber,
        language,
        error: 'HTTP request may be missing method - verify request format',
        code: code.substring(0, 200) + (code.length > 200 ? '...' : ''),
        severity: 'warning',
      });
    }
  }

  // Validate curl commands
  if (code.includes('curl')) {
    // Check for common curl issues
    if (code.includes('curl') && !code.match(/curl\s+(-[X]\s+\w+\s+)?https?:\/\//)) {
      warnings.push({
        file,
        lineNumber,
        language,
        error: 'curl command structure may be incomplete - verify URL and method are present',
        code: code.substring(0, 200) + (code.length > 200 ? '...' : ''),
        severity: 'warning',
      });
    }
  }
}

/**
 * Main validation function
 */
function main() {
  const docsDir = join(process.cwd(), 'content', 'docs');
  console.log(`\n🔍 Validating SDK, CLI, and API code examples in ${docsDir}\n`);

  const mdxFiles = findMdxFiles(docsDir);
  console.log(`Found ${mdxFiles.length} MDX files\n`);

  let totalExamples = 0;
  let sdkExamples = 0;
  let cliExamples = 0;
  let apiExamples = 0;

  mdxFiles.forEach((filePath) => {
    try {
      const content = readFileSync(filePath, 'utf-8');
      const codeBlocks = extractCodeBlocks(content, filePath);
      
      codeBlocks.forEach((block) => {
        totalExamples++;
        
        // Validate SDK examples
        if (['javascript', 'js', 'typescript', 'ts'].includes(block.language)) {
          sdkExamples++;
          validateSDK(block);
        }
        
        // Validate CLI examples
        if (['bash', 'sh', 'shell'].includes(block.language)) {
          cliExamples++;
          validateCLI(block);
        }
        
        // Validate API examples
        if (block.language === 'json') {
          apiExamples++;
          validateJSON(block);
        }
        
        if (['http', 'curl'].includes(block.language)) {
          apiExamples++;
          validateHTTP(block);
        }
      });
    } catch (error) {
      console.error(`Error reading file ${filePath}:`, error);
    }
  });

  console.log(`\n📊 Validation Summary:`);
  console.log(`   Total code blocks: ${totalExamples}`);
  console.log(`   SDK examples (JS/TS): ${sdkExamples}`);
  console.log(`   CLI examples (Bash/Shell): ${cliExamples}`);
  console.log(`   API examples (JSON/HTTP/curl): ${apiExamples}`);
  console.log(`   Errors found: ${errors.length}`);
  console.log(`   Warnings: ${warnings.length}\n`);

  if (errors.length > 0) {
    console.log('❌ ERRORS:\n');
    errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error.file}:${error.lineNumber} (${error.language})`);
      console.log(`   ${error.error}`);
      const firstLine = error.code.split('\n')[0];
      if (firstLine) {
        console.log(`   Code preview: ${firstLine.substring(0, 100)}${firstLine.length > 100 ? '...' : ''}`);
      }
      console.log('');
    });
  }

  if (warnings.length > 0) {
    console.log('⚠️  WARNINGS:\n');
    warnings.forEach((warning, index) => {
      console.log(`${index + 1}. ${warning.file}:${warning.lineNumber} (${warning.language})`);
      console.log(`   ${warning.error}`);
      const firstLine = warning.code.split('\n')[0];
      if (firstLine) {
        console.log(`   Code preview: ${firstLine.substring(0, 100)}${firstLine.length > 100 ? '...' : ''}`);
      }
      console.log('');
    });
  }

  if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ All code examples validated successfully!\n');
    process.exit(0);
  } else {
    console.log(`\n${errors.length > 0 ? '❌' : '⚠️'} Found ${errors.length} error(s) and ${warnings.length} warning(s)\n`);
    process.exit(errors.length > 0 ? 1 : 0);
  }
}

main();
