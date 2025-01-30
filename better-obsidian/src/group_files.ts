import * as dotenv from 'dotenv'

dotenv.config({path: '../../.env'})

export interface FileNames {
	inputs: string[] | string;
}

interface ApiResponse {
	[key: string]: any;
}

interface FileMapping {
    [key: string]: number;
}
 

export async function group_files(data: FileNames): Promise<FileMapping>{
	const encoded_files = await encode_files(data);
	console.log(typeof encoded_files)
	// let cluster_data: ClusterData = encode_files;
	// const clustered_files = await cluster_files(encoded_files)

	return encoded_files;

	// const grouped_files = await cluster_files(encode_files);
}


async function encode_files(data: FileNames): Promise<ApiResponse>{
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

async function cluster_files(data: Array<Array<number>>): Promise<{} | number[]> {
    try {
        const response = await fetch('http://localhost:5000/cluster', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result.labels;  // Return the clustering labels
    } catch (error) {
        console.error('Error fetching clustering data:', error);
        return [];
    }
}


let fileName1 = "ABC.txt"
let fileName2 = "CDE.txt"
let data: FileNames;

async function test_encoding(fileName1: string | null, fileName2: string | null) {
    if (fileName1 == null && fileName2 == null) {
        console.log("File names are empty.")
        return
    } else if (fileName1 != null && fileName2 == null) {
        data = {"inputs": `${fileName1}`}
        return await group_files(data);
    } else {
        data = {"inputs": [`${fileName1}`, `${fileName2}`]}
        return await group_files(data);
    }
}


test_encoding(fileName1, fileName2);
