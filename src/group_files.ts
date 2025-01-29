import * as dotenv from 'dotenv'
dotenv.config({path: '../.env'})

export interface FileNames {
	inputs: string[] | string;
}

interface ApiResponse {
	[key: string]: any;
  }  

console.log(String(process.env.HF_API_KEY))

export async function encode_files(data: FileNames): Promise<ApiResponse>{
	const response = await fetch(
		"https://api-inference.huggingface.co/models/BAAI/bge-base-en-v1.5",
		{
			headers: {
				Authorization: `Bearer ${process.env.HF_API_KEY}`,
				"Content-Type": "application/json",
			},
			method: "POST",
			body: JSON.stringify(data),
		}
	);
	const result = await response.json();
	return result;
} 

let fileName1 = "ABC.txt"
let fileName2 = null
let data: FileNames;

async function test_encoding(fileName1: string | null, fileName2: string | null) {
    if (fileName1 == null && fileName2 == null) {
        console.log("File names are empty.")
        return
    } else if (fileName1 != null && fileName2 == null) {
        data = {"inputs": `${fileName1}`}
        return await encode_files(data);
    } else {
        data = {"inputs": [`${fileName1}`, `${fileName2}`]}
        return await encode_files(data);
    }
}

test_encoding(fileName1, fileName2).then((response) => {
	console.log(JSON.stringify(response));
});
