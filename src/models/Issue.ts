import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { IssueType, IssueStatus, IssuePriority, ClientApprovalStatus } from '../types/enums';

interface IssueAttributes {
    id: string;
    projectId: string;
    issueNumber: number;
    key: string;
    type: IssueType;
    status: IssueStatus;
    priority: IssuePriority;
    title: string;
    description?: string;
    assigneeId?: string;
    reporterId: string;
    sprintId?: string | null;
    parentId?: string;
    epicId?: string | null;
    featureId?: string | null;
    storyPoints?: number;
    estimatedHours?: number;
    actualHours?: number;
    dueDate?: Date;
    fixVersion?: string;
    orderIndex: number;
    labels: string[];
    customFields: object;
    isClientVisible: boolean;
    clientApprovalStatus?: ClientApprovalStatus | null;
    clientFeedback?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

interface IssueCreationAttributes extends Optional<IssueAttributes, 'id' | 'createdAt' | 'updatedAt'> { }

class Issue extends Model<IssueAttributes, IssueCreationAttributes> implements IssueAttributes {
    public id!: string;
    public projectId!: string;
    public issueNumber!: number;
    public key!: string;
    public type!: IssueType;
    public status!: IssueStatus;
    public priority!: IssuePriority;
    public title!: string;
    public description?: string;
    public assigneeId?: string;
    public reporterId!: string;
    public sprintId?: string | null;
    public parentId?: string;
    public epicId?: string | null;
    public featureId?: string | null;
    public storyPoints?: number;
    public estimatedHours?: number;
    public actualHours?: number;
    public dueDate?: Date;
    public fixVersion?: string;
    public orderIndex!: number;
    public labels!: string[];
    public customFields!: object;
    public isClientVisible!: boolean;
    public clientApprovalStatus?: ClientApprovalStatus | null;
    public clientFeedback?: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Issue.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        projectId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'Projects',
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        issueNumber: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        key: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
        },
        type: {
            type: DataTypes.ENUM(...Object.values(IssueType)),
            allowNull: false,
            defaultValue: IssueType.TASK,
        },
        status: {
            type: DataTypes.ENUM(...Object.values(IssueStatus)),
            allowNull: false,
            defaultValue: IssueStatus.TODO,
        },
        priority: {
            type: DataTypes.ENUM(...Object.values(IssuePriority)),
            allowNull: false,
            defaultValue: IssuePriority.MEDIUM,
        },
        title: {
            type: DataTypes.STRING(500),
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        assigneeId: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'Users',
                key: 'id',
            },
            onDelete: 'SET NULL',
        },
        reporterId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id',
            },
            onDelete: 'RESTRICT',
        },
        sprintId: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'Sprints',
                key: 'id',
            },
            onDelete: 'SET NULL',
        },
        parentId: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'Issues',
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        epicId: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'Epics',
                key: 'id',
            },
            onDelete: 'SET NULL',
            field: 'epic_id'
        },
        featureId: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'Features',
                key: 'id',
            },
            onDelete: 'SET NULL',
            field: 'feature_id'
        },
        storyPoints: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        estimatedHours: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
        },
        actualHours: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            defaultValue: 0,
        },
        dueDate: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        fixVersion: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        orderIndex: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        labels: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            defaultValue: [],
        },
        customFields: {
            type: DataTypes.JSONB,
            defaultValue: {},
        },
        isClientVisible: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false,
        },
        clientApprovalStatus: {
            type: DataTypes.ENUM(...Object.values(ClientApprovalStatus)),
            allowNull: true,
            defaultValue: null,
        },
        clientFeedback: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'Issues',
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ['key'],
            },
            {
                fields: ['project_id'],
            },
            {
                fields: ['assignee_id'],
            },
            {
                fields: ['reporter_id'],
            },
            {
                fields: ['sprint_id'],
            },
            {
                fields: ['status'],
            },
            {
                fields: ['priority'],
            },
            {
                fields: ['type'],
            },
        ],
    }
);

export default Issue;
