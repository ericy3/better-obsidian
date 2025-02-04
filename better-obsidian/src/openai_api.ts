import { Notice, request } from "obsidian";

import { OpenAI } from "openai";

export class OpenAIAssistant {
	modelName: string;
	model: any;
	maxTokens: number;
	apiKey: string | undefined;

	constructor(apiKey: string | undefined, modelName: string, maxTokens: number) {
		this.model = new OpenAI({
			apiKey: apiKey,
			dangerouslyAllowBrowser: false, //double check
		});
		this.modelName = modelName;
		this.maxTokens = maxTokens;
		this.apiKey = apiKey;
	}

	display_error = (err: any) => {
		if (err instanceof OpenAI.APIError) {
			new Notice(`## OpenAI API Error: ${err}.`);
		} else {
			new Notice(err);
		}
	};

	text_api_call = async (

	) => {
		let model = this.modelName;
		try {
            const completion = await this.model.chat.

		} catch (err) {
			this.display_error(err);
		}
	};

}