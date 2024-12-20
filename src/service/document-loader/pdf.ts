import { ContentLoader } from "../utility";
export class PDFLoader implements ContentLoader {
    async getContent() {
        throw new Error("PDF Not Supported.");
        return "PDF Not Supported";
    }
}