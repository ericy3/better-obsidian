import { Notice, request } from "obsidian";
import * as fs from 'fs';
import { OpenAI } from "openai";

export class OpenAIAssistant {
	modelName: string;
	model: any;
	maxTokens: number;
	apiKey: string | undefined;

	constructor(apiKey: string | undefined, modelName: string, maxTokens: number) {
		this.model = new OpenAI({
			apiKey: apiKey,
			dangerouslyAllowBrowser: true, //double check
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
        prompt_path: string,
	) => {
		let model = this.modelName;
        let maxTokens = this.maxTokens;
		try {
            const content = fs.readFileSync(prompt_path, "utf8");
            console.log(content)
            const params = {
                messages: [{ role: "developer", content: content }],
                model: model,
                max_completion_tokens: maxTokens,
                store: true,
            }
            const completion = await this.model.chat.completions.create(params)
            console.log(completion.choices[0].message.content)
            return completion
		} catch (err) {
			this.display_error(err);
		}
	};

}