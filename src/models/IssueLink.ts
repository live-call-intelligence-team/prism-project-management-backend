import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export enum LinkType {
    BLOCKS = 'BLOCKS',
    IS_BLOCKED_BY = 'IS_BLOCKED_BY',
    RELATES_TO = 'RELATES_TO',
    DUPLICATES = 'DUPLICATES',
    CLONED_FROM = 'CLONED_FROM',
    CLONED_TO = 'CLONED_TO'
}

interface IssueLinkAttributes {
    id: string;
    sourceIssueId: string;
    targetIssueId: string;
    type: LinkType;
    createdAt?: Date;
    updatedAt?: Date;
}

interface IssueLinkCreationAttributes extends Optional<IssueLinkAttributes, 'id' | 'createdAt' | 'updatedAt'> { }

class IssueLink extends Model<IssueLinkAttributes, IssueLinkCreationAttributes> implements IssueLinkAttributes {
    public id!: string;
    public sourceIssueId!: string;
    public targetIssueId!: string;
    public type!: LinkType;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

IssueLink.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        sourceIssueId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'Issues',
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        targetIssueId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'Issues',
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        type: {
            type: DataTypes.ENUM(...Object.values(LinkType)),
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: 'IssueLinks',
        timestamps: true,
        indexes: [
            {
                fields: ['source_issue_id'],
            },
            {
                fields: ['target_issue_id'],
            },
        ],
    }
);

export default IssueLink;
