import { App, Modal, TFile, Notice, TFolder } from 'obsidian';
import { HuggingFaceAssistant } from './hf_api';
import { createPromptFromTemplate } from './utils';
import { OpenAIAssistant } from './openai_api';
import { TEMPLATES_PATH, PROMPT_OUTPUT_PATH } from './settings';
import { error } from 'console';

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
            // console.log('User input:', inputText);
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
                let file_label_tuples = new Array<[string, number]>();
                console.log(file_names);
                if (name_labels) {
                    for (let i = 0; i < name_labels.length; i++) {
                        const file_label_tuple: [string, number] = [file_names[i], name_labels[i]];
                        file_label_tuples.push(file_label_tuple);
                    }
                    console.log(file_label_tuples.toString());
                    template_values["INPUT_VALUES"] = file_label_tuples.toString();
                    // const template_file = TEMPLATES_PATH + "file_grouping_query.txt"
                    const template_type = "file_grouping_query"
                    // const prompt_file = PROMPT_OUTPUT_PATH + "folder_generate_prompt.txt"
                    const prompt = createPromptFromTemplate(template_type, template_values)
                    if (prompt) {
                        const response = this.aiAssistant.text_api_call(prompt);
                        console.log(response);
                    } else {
                        console.log("Error creating prompt.")
                        new Notice("Error creating prompt.")
                    }
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
