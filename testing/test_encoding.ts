import { group_files, FileNames } from "../src/group_files";

let fileName1 = prompt("Enter a file name.")
let fileName2 = prompt("Enter another file name.")
let data: FileNames;

async function test_encoding(fileName1: string | null, fileName2: string | null) {
    if (fileName1 == null && fileName2 == null) {
        console.log("File names are empty.")
        return
    } else if (fileName1 != null && fileName2 == null) {
        data = {"inputs": [`${fileName1}`]}
        return await group_files(data);
    } else {
        data = {"inputs": [`${fileName1}`, `${fileName2}`]}
        return await group_files(data);
    }
}

test_encoding(fileName1, fileName2).then((response) => {
	console.log(JSON.stringify(response));
});