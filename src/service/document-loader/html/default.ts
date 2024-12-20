import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { ContentLoader } from "../../utility";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export class WebLoader implements ContentLoader {
    async getContent(url: string, options?: { [key: string]: any }): Promise<string> {
        const loader = new CheerioWebBaseLoader(url);
        const docs = await loader.load();
        return docs[0].pageContent;
    }
}