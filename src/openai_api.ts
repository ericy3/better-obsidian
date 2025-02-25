import { Notice, request } from "obsidian";
import * as fs from 'fs';
import { OpenAI } from "openai";

export class OpenAIAssistant {
	modelName: string;
	model: any;
	maxTokens: number;
	apiKey: string;

	constructor(apiKey: string, modelName: string, maxTokens: number) {
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
        prompt: string,
	): Promise<string | null> => {
		let model = this.modelName;
        let maxTokens = this.maxTokens;
		try {
            // const content = fs.readFileSync(prompt_path, "utf8");
            console.log(prompt)
            const params = {
                messages: [{ role: "developer", content: prompt }],
                model: model,
                max_completion_tokens: maxTokens,
                store: true,
            }
            const completion = await this.model.chat.completions.create(params)
            // console.log(typeof completion.choices[0].message.content)
            return completion.choices[0].message.content
		} catch (err) {
			this.display_error(err);
			return null;
		}
	};

}