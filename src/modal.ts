import { App, Modal, Vault, Plugin, TFile, Notice, TFolder } from 'obsidian';

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

export class folderGenerateModal extends TextInputModal {
    constructor(app: App) {
        super(app)
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
