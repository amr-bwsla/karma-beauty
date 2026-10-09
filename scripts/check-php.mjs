import fs from 'node:fs/promises';
import path from 'node:path';
import php from 'php-parser';
const parser=new php.Engine({parser:{version:'8.0',suppressErrors:false},ast:{withPositions:true}});
let count=0;
async function walk(folder){for(const ent of await fs.readdir(folder,{withFileTypes:true})){const file=path.join(folder,ent.name);if(ent.isDirectory())await walk(file);else if(file.endsWith('.php')){parser.parseCode(await fs.readFile(file,'utf8'),file);count++;}}}
await walk('release');console.log(`Parsed ${count} PHP files successfully (PHP 8 syntax). This is not a WordPress runtime test.`);
