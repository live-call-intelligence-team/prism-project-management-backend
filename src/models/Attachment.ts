import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface AttachmentAttributes {
    id: string;
    issueId: string | null;
    projectId: string | null;
    userId: string;
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    fileUrl: string;
    createdAt?: Date;
    updatedAt?: Date;
}

interface AttachmentCreationAttributes extends Optional<AttachmentAttributes, 'id' | 'createdAt' | 'updatedAt'> { }

class Attachment extends Model<AttachmentAttributes, AttachmentCreationAttributes> implements AttachmentAttributes {
    public id!: string;
    public issueId!: string | null;
    public projectId!: string | null;
    public userId!: string;
    public filename!: string;
    public originalName!: string;
    public mimetype!: string;
    public size!: number;
    public fileUrl!: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Attachment.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        issueId: {
            type: DataTypes.UUID,
            allowNull: true, // Now nullable
            references: {
                model: 'issues',
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        projectId: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'projects',
                key: 'id',
            },
            onDelete: 'CASCADE',
            field: 'project_id',
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        filename: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        originalName: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        mimetype: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        size: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        fileUrl: {
            type: DataTypes.STRING(500),
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: 'attachments',
        timestamps: true,
        indexes: [
            {
                fields: ['issue_id'],
            },
            {
                fields: ['user_id'],
            },
        ],
    }
);

export default Attachment;
