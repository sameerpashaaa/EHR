const { Project, SyntaxKind } = require("ts-morph");

const project = new Project();
project.addSourceFilesAtPaths("src/app/api/**/*.ts");

const sourceFiles = project.getSourceFiles();

const methodNames = ["GET", "POST", "PUT", "PATCH", "DELETE"];

for (const sourceFile of sourceFiles) {
  const filePath = sourceFile.getFilePath();
  
  if (filePath.includes("api/auth/[...nextauth]") || filePath.includes("api\\auth\\[...nextauth]")) {
    continue;
  }

  // Get exported handlers
  const functions = sourceFile.getFunctions();
  const handlers = functions.filter(f => f.isExported() && methodNames.includes(f.getName()));
  
  const variables = sourceFile.getVariableDeclarations();
  const arrowHandlers = [];
  for (const v of variables) {
    if (v.isExported() && methodNames.includes(v.getName())) {
       const init = v.getInitializer();
       if (init && (init.getKind() === SyntaxKind.ArrowFunction || init.getKind() === SyntaxKind.FunctionExpression)) {
         arrowHandlers.push(init);
       }
    }
  }

  if (handlers.length === 0 && arrowHandlers.length === 0) {
    continue;
  }

  let modified = false;

  // 1. Ensure getServerSession is imported
  let hasGetServerSession = false;
  const nextAuthImports = sourceFile.getImportDeclarations().filter(i => i.getModuleSpecifierValue() === "next-auth");
  for (const imp of nextAuthImports) {
    if (imp.getNamedImports().some(n => n.getName() === "getServerSession")) {
      hasGetServerSession = true; break;
    }
  }
  if (!hasGetServerSession) {
    if (nextAuthImports.length > 0) {
      nextAuthImports[0].addNamedImport("getServerSession");
    } else {
      sourceFile.addImportDeclaration({
        namedImports: ["getServerSession"],
        moduleSpecifier: "next-auth"
      });
    }
    modified = true;
  }

  // 2. Ensure authOptions is imported
  const hasAuthOptions = sourceFile.getImportDeclarations().some(i => 
    i.getNamedImports().some(n => n.getName() === "authOptions")
  );
  if (!hasAuthOptions) {
    sourceFile.addImportDeclaration({
      namedImports: ["authOptions"],
      moduleSpecifier: "@/lib/auth"
    });
    modified = true;
  }

  // 3. Ensure NextResponse is imported
  let hasNextResponse = false;
  const nextServerImports = sourceFile.getImportDeclarations().filter(i => i.getModuleSpecifierValue() === "next/server");
  for (const imp of nextServerImports) {
    if (imp.getNamedImports().some(n => n.getName() === "NextResponse")) {
      hasNextResponse = true; break;
    }
  }
  if (!hasNextResponse) {
    if (nextServerImports.length > 0) {
      nextServerImports[0].addNamedImport("NextResponse");
    } else {
      sourceFile.addImportDeclaration({
        namedImports: ["NextResponse"],
        moduleSpecifier: "next/server"
      });
    }
    modified = true;
  }

  const isAdminRoute = filePath.includes("/api/admin/") || filePath.includes("\\api\\admin\\");
  const roleCheckBase = isAdminRoute 
    ? `if (!['ADMIN'].includes(session.user?.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });`
    : `if (!['PHYSICIAN', 'ADMIN', 'NURSE', 'MEDICAL_ASSISTANT'].includes(session.user?.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });`;

  const processHandler = (handler) => {
    const calls = handler.getDescendantsOfKind(SyntaxKind.CallExpression);
    let sessionCall = calls.find(c => c.getExpression().getText() === "getServerSession");

    if (sessionCall) {
      if (sessionCall.getArguments().length === 0) {
        sessionCall.addArgument("authOptions");
        modified = true;
      }

      const varDecl = sessionCall.getFirstAncestorByKind(SyntaxKind.VariableDeclaration);
      if (varDecl) {
        const sessionVarName = varDecl.getName();
        const statement = varDecl.getFirstAncestorByKind(SyntaxKind.VariableStatement);
        
        if (statement) {
          const block = statement.getParentIfKind(SyntaxKind.Block);
          if (block) {
            const statements = block.getStatements();
            const stmtIndex = statements.indexOf(statement);
            
            // role check
            const hasRoleCheck = statements.some(s => s.getText().includes(`${sessionVarName}.user?.role`) || s.getText().includes(`${sessionVarName}.user.role`) || s.getText().includes(`${sessionVarName}?.user?.role`));
            
            if (!hasRoleCheck) {
              let insertIndex = stmtIndex + 1;
              const nextStmt = statements[insertIndex];
              
              if (nextStmt && nextStmt.getKind() === SyntaxKind.IfStatement) {
                 const ifText = nextStmt.getText();
                 if (ifText.includes(`!${sessionVarName}`)) {
                   insertIndex++;
                 }
              }
              
              const roleCheckStr = roleCheckBase.replace(/session\.user/g, `${sessionVarName}.user`);
              block.insertStatements(insertIndex, roleCheckStr);
              modified = true;
            }
          }
        }
      }
    } else {
      // Add from scratch
      let block = null;
      if (handler.getBody && typeof handler.getBody === 'function') {
         block = handler.getBody();
      } else if (handler.getBlock && typeof handler.getBlock === 'function') {
         block = handler.getBlock();
      }
      
      // For ArrowFunction, body can be Expression instead of Block.
      if (block && block.getKind() !== SyntaxKind.Block) {
          // If it's an expression body, we might need to convert it to a block to inject statements safely.
          // For simplicity, let's skip for now unless we see it fail. Usually handlers are blocks.
          console.log(`Skipping injection for ${handler.getName ? handler.getName() : 'arrow function'} because body is not a Block.`);
      }

      if (block && block.getKind() === SyntaxKind.Block) {
        let targetBlock = block;
        let insertIndex = 0;
        
        const firstStmt = block.getStatements()[0];
        if (firstStmt && firstStmt.getKind() === SyntaxKind.TryStatement) {
          targetBlock = firstStmt.getTryBlock();
        }
        
        const injectStr = `
const session = await getServerSession(authOptions);
if (!session?.user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
${roleCheckBase}
`;
        targetBlock.insertStatements(insertIndex, injectStr);
        
        if (handler.setIsAsync && typeof handler.setIsAsync === 'function') {
          handler.setIsAsync(true);
        }
        modified = true;
      }
    }
  };

  handlers.forEach(processHandler);
  arrowHandlers.forEach(processHandler);

  if (modified) {
    sourceFile.saveSync();
    console.log(`Updated ${filePath}`);
  }
}
