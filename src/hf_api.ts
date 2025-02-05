import * as dotenv from 'dotenv'

dotenv.config({path: '../.env'})

export interface FileNames {
	inputs: string[];
}

interface FileLabels {
    [key: string]: Array<number>;
}
 
export class HuggingFaceAssistant {
    modelName: string;
    apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    async group_files(data: FileNames): Promise<Array<number> | null> {
        const encoded_files = await this.encode_files(data);
        // let cluster_data: ClusterData = encode_files;
        const file_labels: Array<number> = await this.cluster_files(encoded_files)

        return file_labels;
        // const grouped_files = await cluster_files(encode_files);
    };


    async encode_files(data: FileNames): Promise<Array<Array<number>>>{
        console.log("KEY: " + this.apiKey)
        const response = await fetch(
            "https://api-inference.huggingface.co/models/BAAI/bge-base-en-v1.5",
            {
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    "Content-Type": "application/json",
                },
                method: "POST",
                body: JSON.stringify(data),
            }
        );
        const result = await response.json();
        console.log(result);
        return result;
    }; 

    async cluster_files(data: Array<Array<number>>): Promise<number[]| Array<number>> {
        try {
            const requestBody = { inputs: data };
            const response = await fetch('http://localhost:8000/cluster', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result: FileLabels = await response.json();
            return result.labels;  // Return the clustering labels
        } catch (error) {
            console.error('Error fetching clustering data:', error);
            return [];
        }
    };

}


// let fileName1 = "ABC.txt"
// let fileName2 = "CDE.txt"
// let data: FileNames;

// async function test_encoding(fileName1: string | null, fileName2: string | null) {
//     if (fileName1 == null && fileName2 == null) {
//         console.log("File names are empty.")
//         return
//     } else if (fileName1 != null && fileName2 == null) {
//         data = {"inputs": [`${fileName1}`]}
//         return await group_files(data);
//     } else {
//         data = {"inputs": [`${fileName1}`, `${fileName2}`]}
//         return await group_files(data);
//     }
// }


// test_encoding(fileName1, fileName2);
