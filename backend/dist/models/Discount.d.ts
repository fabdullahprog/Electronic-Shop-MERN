import mongoose from 'mongoose';
import { IDiscount } from '../types';
declare const _default: mongoose.Model<IDiscount, {}, {}, {}, mongoose.Document<unknown, {}, IDiscount, {}, {}> & IDiscount & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
