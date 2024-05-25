const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const port = 3000;

const getCleanImageUrl = (url) => {
    return url.trim();
};

app.get('/manga', async (req, res) => {
    const mangaUrl = req.query.url;

    if (!mangaUrl) {
        return res.status(400).json({ error: 'Please provide a manga URL.' });
    }

    try {
        const response = await axios.get(mangaUrl);
        const $ = cheerio.load(response.data);
        const imageUrls = [];

        // استخراج روابط الصور من العناصر img داخل عناصر div بالفئة page-break
        $('div.page-break img').each((index, element) => {
            let imageUrl = $(element).attr('data-src');
            if (imageUrl && imageUrl.toLowerCase().endsWith('.jpg')) {
                imageUrls.push(getCleanImageUrl(imageUrl));
            }
        });

        if (imageUrls.length === 0) {
            return res.status(404).json({ error: 'No JPEG images found on the specified page.' });
        }

        // إرسال روابط الصور
        return res.json({ images: imageUrls });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'An error occurred while fetching the manga images. Please try again later.' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});