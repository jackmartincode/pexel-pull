# Pexel Pull - A Pexel Collection Downloader

This script allows you to interact with your personal collections on Pexels. You can list all your collections and download all images from a specified collection with proper attributions.

## Prerequisites

- Node.js installed on your machine
- Pexels API key

## Installation

1. Clone the repository:
    ```sh
    git clone <repository_url>
    cd <repository_directory>
    ```

2. Install the required packages:
    ```sh
    npm install
    ```

3. Copy the `.env.example` file to `.env` in the root directory:
    ```sh
    cp .env.example .env
    ```
   Then, open the `.env` file and add your Pexels API key:
    ```env
    PEXELS_API_KEY=your_pexels_api_key_here
    ```

## Usage

### List Collections

To list all your collections with their IDs and titles, run:
```sh
node index.js collections
```

### Download Collection

To download all images from a specified collection, run:
```sh
node index.js pull <collection_id> <image_size>
```
- `<collection_id>`: The ID of the collection you want to download.
- `<image_size>`: The size of the images you want to download (e.g., `original`, `large2x`, `large`, `medium`, `small`, `portrait`, `landscape`, `tiny`).

Example:
```sh
node index.js pull 123456 large2x
```

## Output

- Images will be downloaded to the `downloads` directory.
- An `attributions.txt` file will be created in the `downloads` directory with a list of attributions to use, if needed.

## Notes

- The script handles pagination to ensure all images from the collection are downloaded.
- Ensure you have sufficient API request limits to download large collections.

## License

This project is licensed under the MIT License.
