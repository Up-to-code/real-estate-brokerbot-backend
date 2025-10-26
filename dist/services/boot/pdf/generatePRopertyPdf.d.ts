import { EventDetails } from '../ai';
interface GeneratePdfRequest {
    type: "event";
    name: string;
    details: EventDetails;
}
declare const generatePropertyPdf: (request: GeneratePdfRequest) => Promise<{
    success: boolean;
    message: any;
}>;
export default generatePropertyPdf;
