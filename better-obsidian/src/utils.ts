import * as fs from 'fs';
import * as readline from 'readline';
import { TEMPLATES_PATH } from './settings';


export function createFileFromTemplate(templateName: string, values: Record<string, string>, newName: string) {

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
    
    try {
        const template = fs.readFileSync(TEMPLATES_PATH + templateName, 'utf8');
        
        const file = template.replace(/{(\w+)}/g, (_, key) => {
        return values[key] || `{${key}}`; // If the key is not found, leave the placeholder intact
        });

        fs.writeFileSync(newName, file, 'utf8');
        console.log(`File generated successfully: ${newName}.txt`, newName);
    } catch(error) {
        console.error('Error generating file:', error);
    }

    rl.close();

  }

