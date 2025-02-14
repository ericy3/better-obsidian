const prompts: Record<string, string> = {
    "file_grouping_query":

    `You are tasked with determining the best possible folder names for a given set of file names. These file names are grouped into clusters based on their semantic similarity. Each cluster contains a set of file names, and your goal is to provide a meaningful folder name for each cluster, as well as the corresponding list of files for each folder.

    Input Data:
    A list of file names and the associated cluster label immediately following each file name.
    A result from an embedding model that has clustered the file names into groups based on their semantic similarity.
    The format for the input data is as follows:

    File Names and Labels Format:

    [file_name_1, cluster_label_1, file_name_2, cluster_label_2, file_name_3, cluster_label_3, ...]
    ...

    The actual file names and labels inputs:

    [{INPUT_VALUES}]


    Embedding and clustering result: A set of file names grouped into clusters.
    Output:
    For each cluster, you need to:

    Determine a relevant folder name that best describes the contents of the cluster.
    List all the file names that belong to that folder, in the same order as they appear in the input.
    Given that this prompt will be sent to you through API requests, do not bother with any extra formatting.
    Example of Output Format:
    For each cluster, output the following with no special nor extra formatting besides given structure:

    Folder Name: [folder_name] - [file_name_1, file_name_2, file_name_3]
    ...

    Task:
    Based on the provided file names and their clustering information, you should:

    Analyze the semantic meaning of the files in each cluster.
    Choose a folder name that best represents the collective content of the files in the cluster.
    Output the folder name followed by the list of files in that cluster, maintaining the format above.
    Constraints:
    Ensure the folder names are meaningful and reflect the content of the files in each cluster.
    Each folder name must be concise but descriptive enough to give a clear idea of the files it contains.
    Maintain consistency in the formatting of the output (each folder name followed by a list of files).`,

}

export const PROMPTS = prompts;