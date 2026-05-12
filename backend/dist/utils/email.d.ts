import { IOrder } from '../types';
interface EmailOptions {
    to: string;
    subject: string;
    html: string;
}
export declare const sendEmail: (options: EmailOptions) => Promise<void>;
export declare const emailTemplates: {
    verifyEmail: (name: string, verificationUrl: string) => {
        subject: string;
        html: string;
    };
    orderConfirmation: (name: string, order: IOrder) => {
        subject: string;
        html: string;
    };
    orderApproved: (name: string, order: IOrder) => {
        subject: string;
        html: string;
    };
    orderShipped: (name: string, order: IOrder, trackingNumber?: string) => {
        subject: string;
        html: string;
    };
    resetPassword: (name: string, resetUrl: string) => {
        subject: string;
        html: string;
    };
};
export {};
