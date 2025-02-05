import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { TextInputModal, folderGenerateModal } from './modal';
import { DEFAULT_OAI_MODEL, DEFAULT_MAX_TOKENS } from './settings'
import { OpenAIAssistant } from './openai_api';
import { HuggingFaceAssistant } from './hf_api';
import * as dotenv from 'dotenv'

dotenv.config({path: '../.env'})

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	journalFolder: string;
	recallFolder: string;
	huggingfaceApiKey: string;
	openaiApiKey: string;
	openaiModelName: string;
	maxTokenCount: number;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	journalFolder: 'N/A',
	recallFolder: 'N/A',
	huggingfaceApiKey: '',
	openaiApiKey: process.env.OAI_API_KEY || "",
	openaiModelName: DEFAULT_OAI_MODEL,
	maxTokenCount: DEFAULT_MAX_TOKENS,
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;
	mlAssistant: HuggingFaceAssistant;
	aiAssistant: OpenAIAssistant;

	build_api() {
		this.aiAssistant = new OpenAIAssistant(
			this.settings.openaiApiKey,
			this.settings.openaiModelName,
			this.settings.maxTokenCount,
		);
		this.mlAssistant = new HuggingFaceAssistant(
			this.settings.huggingfaceApiKey,
		);
	}

	async onload() {
		await this.loadSettings();
		this.build_api();

		// This creates an icon in the left ribbon.
		const randomizeIconEl = this.addRibbonIcon('dice', 'Diary Recall', (evt: MouseEvent) => {
			// An existing leaf that can be navigated to
			const leaf = this.app.workspace.getLeaf(false);
			const dir = this.settings.recallFolder;
			if (this.app.vault.getFolderByPath(dir) == null) {
				new Notice('Your journal folder can\'t be found.')
				return;
			}
			
			// Fetch all entries in the journal
			const all_entries = this.app.vault.getFiles().filter(f => f.path.startsWith(dir));
			console.log(all_entries.map(e => e.basename))
			if (all_entries.length <= 0) {
				new Notice('There are no entries!')
				return;
			}

			// Randomly select an entry
			const entry = all_entries[Math.floor(Math.random() * all_entries.length)];

			// Called when the user clicks the icon and the file exists.
			new Notice('This is what you wrote!');

			leaf.openFile(entry);
		});

		// Perform additional things with the ribbon
		randomizeIconEl.addClass('randomize-ribbon-class');
		

		const organizeIconEl = this.addRibbonIcon('folders', 'Organize', async (evt: MouseEvent) => {
			
			const dir = this.settings.journalFolder;
			if (this.app.vault.getFolderByPath(dir) == null) {
				new Notice("Your journal folder can't be found!")
				return
			}

			const all_entries = this.app.vault.getFiles().filter(f => f.path.startsWith(dir));

			const months = [ "1", "2", "3", "4", "5", "6", 
				"7", "8", "9", "10", "11", "12" ];

			const yearMap = new Map<string, Map<string, string[]>>();


			for (let i = 0; i < all_entries.length; i++) {
				const entry = all_entries[i];

				// Split up title of format "YYYY-MM-DD - Title"
				const entryInfo = entry.basename.split("-");
				if (entryInfo.length < 2) {
					continue;
				}
				const year = entryInfo[0];
				const month = entryInfo[1];			
				
				// Check if folder for given year exists and create one if not
				const yearFolderPath = `${dir}/${year}`;
				const yearFolderExists = await this.app.vault.getFolderByPath(yearFolderPath);
				if (!yearFolderExists) {
					await this.app.vault.createFolder(yearFolderPath);
				}

				// Create a map of months to entries for given year if doesn't exist
				if (!yearMap.has(year)) {
					yearMap.set(year, new Map<string, string[]>());
				} 
				
				const monthNum = parseInt(month) - 1;
				// Create a month entry for given year if doesn't exist
				const currYearMonthMap = yearMap.get(year);
				if (!currYearMonthMap?.has(months[monthNum])) {
					currYearMonthMap?.set(months[monthNum], []);
				}

				// Add entry to month
				currYearMonthMap?.get(months[monthNum])?.push(entry.basename);
				const monthFolderPath = `${yearFolderPath}/${months[monthNum]}`;
				// Check if folder for given month exists and create one if not
				const monthFolderExists = await this.app.vault.getFolderByPath(monthFolderPath);
				if (monthFolderExists == null) {
					await this.app.vault.createFolder(monthFolderPath);
				}

				const newFilePath = `${monthFolderPath}/${entry.basename}.${entry.extension}`;
				// new Notice(String(newFilePath), 0);
				await this.app.vault.rename(entry, newFilePath);
				
			}

		});

		organizeIconEl.addClass('organize-ribbon-class');
		

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Status Bar Text');

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-sample-modal-simple',
			name: 'Open sample modal (simple)',
			callback: () => {
				new SampleModal(this.app).open();
			}
		});
		// Takes all the files out of folders and deletes folders in a given directory 
		this.addCommand({
			id: 'unpack-folder',
			name: 'Unpack folder',
			icon: 'folder-open',
			callback: () => {
				new TextInputModal(this.app).open();
			}
		});

		// Given a folder or directory utilize algorithm to create folder names and organize
		this.addCommand({
			id: 'generate-folders',
			name: 'Generate Folders',
			callback: () => {
				new folderGenerateModal(this.app, this.aiAssistant, this.mlAssistant).open()
			}
		});

		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'sample-editor-command',
			name: 'Sample editor command',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection('Sample Editor Command');
			}
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-sample-modal-complex',
			name: 'Open sample modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Journal Folder')
			.setDesc('Name of folder that holds your daily notes.')
			.addText(text => text
				.setPlaceholder('N/A')
				.setValue(this.plugin.settings.journalFolder)
				.onChange(async (value) => {
					this.plugin.settings.journalFolder = value;
					await this.plugin.saveSettings();
				}));
		
		
		new Setting(containerEl)
			.setName('Recall Folder')
			.setDesc('Name of the folder you want to recall from.')
			.addText(text => text
				.setPlaceholder('N/A')
				.setValue(this.plugin.settings.recallFolder)
				.onChange(async (value) => {
					this.plugin.settings.recallFolder = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('HuggingFace API Token')
			.addText(text => text
				.setPlaceholder('N/A')
				.setValue(this.plugin.settings.huggingfaceApiKey)
				.onChange(async (value) => {
					this.plugin.settings.huggingfaceApiKey = value;
					await this.plugin.saveSettings();
					this.plugin.build_api();
				}));
		
		new Setting(containerEl)
			.setName('OpenAI API Token')
			.addText(text => text
				.setPlaceholder('N/A')
				.setValue(this.plugin.settings.openaiApiKey)
				.onChange(async (value) => {
					this.plugin.settings.openaiApiKey = value;
					await this.plugin.saveSettings();
					this.plugin.build_api();
				}));
		
		new Setting(containerEl)
		.setName('OpenAI Max Token Count')
		.addText(text => text
			.setPlaceholder("500")
			.setValue(this.plugin.settings.maxTokenCount.toString())
			.onChange(async (value) => {
				const int_value = parseInt(value);
				if (!int_value || int_value <= 0) {
					new Notice("Error while parsing maxTokens ");
				} else {
					this.plugin.settings.maxTokenCount = int_value;
					await this.plugin.saveSettings();
					this.plugin.build_api();
				}
			}));
			
		new Setting(containerEl)
		.setName('OpenAI Model Name')
		.addText(text => text
			.setPlaceholder(DEFAULT_OAI_MODEL)
			.setValue(this.plugin.settings.openaiModelName)
			.onChange(async (value) => {
				this.plugin.settings.openaiModelName = value;
				await this.plugin.saveSettings();
				this.plugin.build_api();
			}));
	}
}
