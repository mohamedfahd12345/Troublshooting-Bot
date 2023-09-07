import { DataTypes } from 'sequelize';
import {sequelize} from '../datastores/db.js';
import { Question } from './question.model.js';


export const Answer = sequelize.define("answers", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    answer_text: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    rate: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    question_id: {
        type: DataTypes.UUID,
        references: {
            model: Question,
            key: 'id'
        }
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: true,
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: true,
    },
});