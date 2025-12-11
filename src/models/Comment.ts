import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface CommentAttributes {
    id: string;
    issueId: string;
    userId: string;
    content: string;
    mentions: string[];
    isClientVisible: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

interface CommentCreationAttributes extends Optional<CommentAttributes, 'id' | 'createdAt' | 'updatedAt'> { }

class Comment extends Model<CommentAttributes, CommentCreationAttributes> implements CommentAttributes {
    public id!: string;
    public issueId!: string;
    public userId!: string;
    public content!: string;
    public mentions!: string[];
    public isClientVisible!: boolean;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Comment.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        issueId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'issues',
                key: 'id',
            },
            onDelete: 'CASCADE',
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
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        mentions: {
            type: DataTypes.ARRAY(DataTypes.UUID),
            defaultValue: [],
        },
        isClientVisible: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: 'comments',
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

export default Comment;
