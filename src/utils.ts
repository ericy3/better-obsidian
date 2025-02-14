import { PROMPTS } from './prompts';

export function createPromptFromTemplate(templateType: string, values: Record<string, string>) {
    try {
        console.log(values);

        let template = PROMPTS[templateType];
        if (!template) {
            throw new Error(`Template not found: ${templateType}`);
        }
        
        const matches = template.match(/{(\w+)}/g);
        console.log(matches);

        const prompt = template.replace(/{(\w+)}/g, (_, key) => {
        return values[key] || `{${key}}`; // If the key is not found, leave the placeholder intact
        });

        
        // console.log(`Prompt: ${prompt}`, prompt);
        return prompt;
    } catch(error) {
        console.error('Error generating file:', error);
    }
}

export function parseGeneratedOutput(output: string) {
    
}




// Future file prompt support

// export function createFileFromTemplate(templatePath: string, values: Record<string, string>, promptPath: string) {
//     try {
//         const filePath = path.resolve(__dirname, '../prompt_templates/file_grouping_query.txt');
//         console.log('Trying to access file at:', __dirname);

//         const dirPath = __dirname;

//         const files = fs.readdirSync(dirPath);
//         console.log(files);

//         if (!fs.existsSync(filePath)) {
//             console.error('Error: File does not exist!');
//         }
//         if (fs.existsSync(templatePath)) {
//             console.log('File exists!');
//           } else {
//             console.log('File does not exist!');
//           }
//         console.log(__dirname);
//         const template = fs.readFileSync(templatePath, 'utf8');
        
//         const file = template.replace(/{(\w+)}/g, (_, key) => {
//         return values[key] || `{${key}}`; // If the key is not found, leave the placeholder intact
//         });

//         fs.writeFileSync(promptPath, file, 'utf8');
//         console.log(`File generated successfully: ${promptPath}.txt`, promptPath);
//     } catch(error) {
//         console.error('Error generating file:', error);
//     }



