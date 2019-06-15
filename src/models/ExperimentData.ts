import mongoose, {Document, Schema} from 'mongoose';

export interface IExperimentData extends Document {
    _id: mongoose.SchemaTypes.ObjectId,
    name: string,
    data: string,
    createdAt: Date,
    updatedAt: Date,
}

const experimentDataSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    data: {
        type: String,
        required: true,
    }
}, {
    timestamps: true,
});

export const ExperimentData = mongoose.model<IExperimentData>('ExperimentData', experimentDataSchema);