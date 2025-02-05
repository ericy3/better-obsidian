import { App, Modal, TFile, Notice, TFolder } from 'obsidian';
import { HuggingFaceAssistant } from './hf_api';
import { createFileFromTemplate } from './utils';
import { OpenAIAssistant } from './openai_api';
import { TEMPLATES_PATH, PROMPT_OUTPUT_PATH } from './settings';

export class TextInputModal extends Modal {
    inputField: HTMLInputElement;

    constructor(app: App) {
        super(app);
        this.inputField = document.createElement('input');
        this.inputField.type = 'text';
        this.inputField.placeholder = 'Enter your text here';
        this.inputField.style.width = '100%';
        this.inputField.style.marginTop = "10px";

        const submitButton = document.createElement('button');
        submitButton.textContent = 'Submit';
        submitButton.addEventListener('click', () => this.onSubmit());

        submitButton.style.marginTop = '10px';  
        submitButton.style.padding = '10px 20px';
        
        this.contentEl.appendChild(this.inputField);
        this.contentEl.appendChild(submitButton);
    }

    onOpen() {
        this.inputField.focus();

        this.inputField.addEventListener('keypress', (event) => {
            if (event.key == "Enter") {
                event.preventDefault();
                this.onSubmit()
            }
        });
    }

    onClose() {
        this.inputField.value = '';
    }

    // Function to be triggered on submit
    onSubmit() {
        const inputText = this.inputField.value;
        if (inputText) {
            console.log('User input:', inputText);
            
            const dir = inputText;
            if (this.app.vault.getFolderByPath(dir) != null) {
                const all_entries = this.app.vault.getFiles().filter(f => f.path.startsWith(dir));
                for (const entry of all_entries) {
                    moveFile(entry, dir)
                }
                const all_folders = this.app.vault.getAllFolders().filter(f => f.path.startsWith(dir));
                all_folders.sort(pathLengthCompare)
                for (const folder of [...all_folders]) {
                    if (folder.path == inputText) {
                        continue;
                    }
                    // new Notice(String(folder.path))
                    this.app.vault.delete(folder, true);
                }
            }

        }
        this.close();
    }
}

// Current folder generation does not create folders for files already in folders
export class folderGenerateModal extends TextInputModal {
    aiAssistant: any;
    mlAssistant: any;

    constructor(
        app: App, 
        aiAssistant: OpenAIAssistant,
        mlAssistant: HuggingFaceAssistant
    ) {
        super(app)
        this.aiAssistant = aiAssistant
        this.mlAssistant = mlAssistant
    }
    async onSubmit() {
        const inputText = this.inputField.value;
        if (inputText) {
            console.log('User input:', inputText);
            const dir = inputText;
            if (this.app.vault.getFolderByPath(dir) != null) {
                const name_to_files: { [key: string]: TFile } = {}
                const template_values: { [key: string]: string } = {}
                const shallow_entries = this.app.vault.getFiles().filter(f => {
                    const relativePath = f.path.slice(dir.length); // Get path after the given directory
                    return relativePath.startsWith('/') && !relativePath.slice(1).includes('/');
                });
                for (const entry of shallow_entries) {
                    name_to_files[entry.basename] = entry;
                }
                const file_names = Object.keys(name_to_files)
                const name_labels: Array<number> | null = await this.mlAssistant.group_files({inputs: file_names});
                let file_label_tuples = new Array<number>;
                if (name_labels) {
                    for (let i = 0; i < name_labels.length; i++) {
                        file_label_tuples.push((file_names[i], name_labels[i]));
                    }
                    template_values["INPUT VALUES"] = String(file_label_tuples);
                    const template_file = TEMPLATES_PATH + "file_grouping_query.txt"
                    const prompt_file = PROMPT_OUTPUT_PATH + "folder_generate_prompt.txt"
                    createFileFromTemplate(template_file, template_values, prompt_file)
                    const response = this.aiAssistant.text_api_call(prompt_file);
                    console.log(response);
                } else {
                    new Notice("Error clustering file names.")
                }
            }

        }
        this.close();
    }
}

function pathLengthCompare(a: TFolder, b: TFolder) {
    if (a.path.length < b.path.length) {
        return 1;
    } else if (a.path.length > b.path.length) {
        return -1;
    } else {
        return 0;
    }
}

async function moveFile(file: TFile, newDir: String) {
    const newFilePath = `${newDir}/${file.basename}.${file.extension}`;
    await this.app.vault.rename(file, newFilePath);

}
