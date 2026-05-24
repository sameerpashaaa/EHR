const fs = require('fs');
const glob = require('glob');
const files = glob.sync('src/app/api/**/*.ts');
for (const file of files) {
  let content = fs.readFileSync(file, 'utf-8');
  let changed = false;

  if (content.includes('getServerSession()')) {
    content = content.replace(/getServerSession\(\)/g, 'getServerSession(authOptions)');
    if (!content.includes('authOptions')) {
        content = content.replace('import { getServerSession } from "next-auth";', 'import { getServerSession } from "next-auth";\nimport { authOptions } from "@/lib/auth";');
    }
    changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(file, content);
    console.log('Updated ' + file);
  }
}
