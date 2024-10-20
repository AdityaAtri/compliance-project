import axios from 'axios';
import { JSDOM } from 'jsdom';

const scrapeContentFromWebsiteURL = async (websiteURL: string): Promise<any> => {
    try {
        const response = await axios.get(websiteURL);
        const dom = new JSDOM(JSON.stringify(response.data));
        const document = dom.window.document;
        const unwantedTags = ['script', 'style', 'noscript'];
        unwantedTags.forEach(tag => {
            const elements = document.querySelectorAll(tag);
            elements.forEach(el => el.remove());
        });
        const visibleText = document.body.textContent || '';
        return visibleText.trim();
    } catch (error: any) {
        return error(`Error scraping webpage: ${error.message}`);
    }
};

export const Scrapper = {
    scrapeContentFromWebsiteURL
}
