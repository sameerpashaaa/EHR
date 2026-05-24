const fs = require('fs');
const glob = require('glob');
const path = require('path');

const files = glob.sync('src/app/api/**/*.ts');
for (const file of files) {
  if (file.includes('auth/[...nextauth]')) continue;
  
  let content = fs.readFileSync(file, 'utf-8');
  let changed = false;

  // Fix authOptions import missing
  if (content.includes('getServerSession(authOptions)') && !content.includes('authOptions')) {
      content = content.replace('import { getServerSession } from "next-auth";', 'import { getServerSession } from "next-auth";\nimport { authOptions } from "@/lib/auth/index";');
      changed = true;
  }
  
  // Also add missing import if generalist script failed to add it
  if (content.includes('getServerSession(authOptions)') && !content.includes('import { authOptions }')) {
    if (!content.includes('import { authOptions } from "@/lib/auth";') && !content.includes('import { authOptions } from "@/lib/auth/index";')) {
      content = content.replace('import { getServerSession } from "next-auth";', 'import { getServerSession } from "next-auth";\nimport { authOptions } from "@/lib/auth/index";');
      changed = true;
    }
  }

  // Fix TS error on includes
  if (content.includes('includes(session?.user?.role)')) {
    content = content.replace(/includes\(session\?\.user\?\.role\)/g, 'includes((session?.user as any)?.role || "")');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content);
    console.log('Fixed ' + file);
  }
}
