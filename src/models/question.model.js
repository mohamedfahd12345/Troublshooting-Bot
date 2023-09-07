import { DataTypes } from 'sequelize';
import {sequelize} from '../datastores/db.js';


export const Question = sequelize.define("questions", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    question_text: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    tag: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    has_answer: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: true,
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