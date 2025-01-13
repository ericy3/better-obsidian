import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();

		// This creates an icon in the left ribbon.
		const randomizeIconEl = this.addRibbonIcon('dice', 'Diary Recall', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new Notice('This is what you wrote!');
			
			// An existing leaf that can be navigated to
			const leaf = this.app.workspace.getLeaf(false);
			const dir = "Diary";
			const all_entries = this.app.vault.getFiles().filter(f => f.path.startsWith(dir));
			console.log(all_entries.map(e => e.basename))
			
			// Randomly select an entry
			const entry = all_entries[Math.floor(Math.random() * all_entries.length)];

			leaf.openFile(entry);
		});

		// Perform additional things with the ribbon
		randomizeIconEl.addClass('randomize-ribbon-class');
		

		const organizeIconEl = this.addRibbonIcon('folders', 'Organize', (evt: MouseEvent) => {
			
			// const leaf = this.app.workspace.getLeaf(false);
			const dir = "Diary";
			const all_entries = this.app.vault.getFiles().filter(f => f.path.startsWith(dir));

			const months = [ "January", "February", "March", "April", "May", "June", 
				"July", "August", "September", "October", "November", "December" ];

			// TODO: Create a map of years to months map or entries
			const yearMap = new Map<string, Map<string, string[]>>();


			for (let i = 0; i < all_entries.length; i++) {
				const entry = all_entries[i];

				// Split up title of format "YYYY-MM-DD - Title"
				const entryInfo = entry.basename.split("-");
				console.log(entryInfo);
				const year = entryInfo[0];
				const month = entryInfo[1];				
				
				// Check if folder for given year exists and create one if not
				const yearFolderExists = this.app.vault.getFolderByPath(`${dir}/${year}`);
				if (!yearFolderExists) {
					this.app.vault.createFolder(`${dir}/${year}`);
				}

				// Create a map of months to entries for given year if doesn't exist
				if (!yearMap.has(year)) {
					yearMap.set(year, new Map<string, string[]>());
				} 

				// Create a month entry for given year if doesn't exist
				const currYearMonthMap = yearMap.get(year);
				if (!currYearMonthMap?.has(months[parseInt(month)])) {
					currYearMonthMap?.set(months[parseInt(month)], []);
				}

				// Add entry to month
				currYearMonthMap?.get(months[parseInt(month)])?.push(entry.basename);

				// Check if folder for given month exists and create one if not
				const monthFolderExists = this.app.vault.getFolderByPath(`${dir}/${year}/${months[parseInt(month)]}`);
				if (!monthFolderExists) {
					this.app.vault.createFolder(`${dir}/${year}/${months[parseInt(month)]}`);
				}

				// Move entry to month folder
				this.app.vault.rename(entry, `${dir}/${year}/${months[parseInt(month)]}/${entry.basename}`);
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
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
