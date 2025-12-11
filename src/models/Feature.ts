import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

export enum FeatureStatus {
    TO_DO = 'TO_DO',
    IN_PROGRESS = 'IN_PROGRESS',
    IN_REVIEW = 'IN_REVIEW',
    DONE = 'DONE',
    CLOSED = 'CLOSED' // Keeping for backward compatibility if needed, or remove? Req says "Done".
}

export enum FeaturePriority {
    CRITICAL = 'CRITICAL',
    HIGH = 'HIGH',
    MEDIUM = 'MEDIUM',
    LOW = 'LOW'
}

export class Feature extends Model {
    public id!: string;
    public epicId!: string | null;
    public projectId!: string;
    public name!: string;
    public description!: string | null;
    public acceptanceCriteria!: string | null;
    public key!: string | null;
    public status!: FeatureStatus;
    public priority!: FeaturePriority;
    public ownerId!: string | null;
    public startDate!: Date | null;
    public endDate!: Date | null;
    public storyPoints!: number | null;
    public color!: string | null;
    public tags!: string[];

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Feature.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        epicId: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'epics',
                key: 'id',
            },
        },
        projectId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'projects',
                key: 'id',
            },
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        key: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        acceptanceCriteria: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM(...Object.values(FeatureStatus)),
            defaultValue: FeatureStatus.TO_DO,
        },
        priority: {
            type: DataTypes.ENUM(...Object.values(FeaturePriority)),
            defaultValue: FeaturePriority.MEDIUM,
        },
        ownerId: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'users',
                key: 'id',
            },
        },
        startDate: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        endDate: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        storyPoints: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        color: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        tags: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            defaultValue: [],
            allowNull: false
        },
    },
    {
        sequelize,
        tableName: 'features',
        underscored: true,
    }
);
