import { ContentLoader } from "../../utility";
import { WebLoader } from "./default";
import { GoogleDocLoader } from "./google-doc";

const HTML_LOADERS: { [key: string]: ContentLoader } = {
    'default': new WebLoader(),
    'docs.google.com': new GoogleDocLoader(),
};

export class HTMLLoader implements ContentLoader {
    private states: { [key: string]: any };

    constructor() {
        this.states = HTML_LOADERS;
    }
    async getContent(url: string, options?: { [key: string]: any }) {
        console.log(this.states);
        const parsedURL = new URL(url);

        // Extract the domain (host)
        const domain = parsedURL.hostname;

        // Extract the file extension if it exists
        const pathname = parsedURL.pathname;
        const extension = pathname.includes(".") ? pathname?.split(".")?.pop() : 'html';
        const loader = this.states[domain] || this.states['default'];
        return loader.getContent(url, options);
    }
}






