const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
const PEXELS_API_URL = 'https://api.pexels.com/v1/collections';
const DOWNLOAD_DIR = path.join(__dirname, 'downloads');

async function fetchCollections() {
    try {
        const response = await axios.get(PEXELS_API_URL, {
            headers: {
                Authorization: PEXELS_API_KEY
            }
        });
        console.log('Response from fetchCollections:', response.data); // Debug log
        return response.data.collections;
    } catch (error) {
        console.error('Error fetching collections:', error);
        return [];
    }
}

async function fetchCollectionMedia(collectionId, page = 1, perPage = 80) {
    try {
        const response = await axios.get(`${PEXELS_API_URL}/${collectionId}`, {
            headers: {
                Authorization: PEXELS_API_KEY
            },
            params: {
                page,
                per_page: perPage
            }
        });
        return response.data;
    } catch (error) {
        console.error(`Error fetching media for collection ${collectionId}:`, error);
        return { media: [], next_page: null };
    }
}

async function downloadImage(url, filepath) {
    const writer = fs.createWriteStream(filepath);
    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream'
    });
    response.data.pipe(writer);
    return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
    });
}

function cleanFileName(url) {
    const urlObj = new URL(url);
    const extension = path.extname(urlObj.pathname);
    const baseName = path.basename(urlObj.pathname, extension);
    return baseName + extension;
}

async function listCollections() {
    const collections = await fetchCollections();
    collections.forEach(collection => {
        console.log(`ID: ${collection.id}, Title: ${collection.title}`);
    });
}

async function pullCollection(collectionId, size) {
    let page = 1;
    let hasNextPage = true;

    if (!fs.existsSync(DOWNLOAD_DIR)) {
        fs.mkdirSync(DOWNLOAD_DIR);
    }

    const attributionFile = path.join(DOWNLOAD_DIR, 'attributions.txt');
    const attributionStream = fs.createWriteStream(attributionFile, { flags: 'a' });

    while (hasNextPage) {
        const { media, next_page } = await fetchCollectionMedia(collectionId, page);

        for (const item of media) {
            if (item.type === 'Photo') {
                const imageUrl = item.src[size];
                const cleanedFileName = cleanFileName(imageUrl);
                const imageFilepath = path.join(DOWNLOAD_DIR, cleanedFileName);

                try {
                    await downloadImage(imageUrl, imageFilepath);
                    console.log(`Downloaded ${cleanedFileName}`);
                    attributionStream.write(`${item.url}\n`);
                    attributionStream.write(`${item.photographer}: ${item.photographer_url}\n\n`);
                } catch (error) {
                    console.error(`Error downloading ${cleanedFileName}:`, error);
                }
            }
        }

        hasNextPage = !!next_page;
        page++;
    }

    attributionStream.end();
    console.log('Download and attribution process completed.');
}

async function main() {
    const command = process.argv[2];
    if (command === 'collections') {
        await listCollections();
    } else if (command === 'pull') {
        const collectionId = process.argv[3];
        const size = process.argv[4] || 'large2x'; // Default size is 'large2x'
        if (!collectionId) {
            console.error('Please provide a collection ID.');
            return;
        }
        await pullCollection(collectionId, size);
    } else {
        console.error('Invalid command. Use "collections" to list collections or "pull" to download a collection.');
    }
}

main();