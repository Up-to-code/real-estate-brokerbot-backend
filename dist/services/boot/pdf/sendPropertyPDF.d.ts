import { SendPDFParams, SendPDFResult } from './types';
declare function sendPropertyPDF({ property, phoneNumber }: SendPDFParams): Promise<SendPDFResult>;
export default sendPropertyPDF;
export { sendPropertyPDF };
export type { Property, SendPDFParams, SendPDFResult } from './types';
