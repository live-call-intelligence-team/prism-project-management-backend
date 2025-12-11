import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

export enum EpicStatus {
    OPEN = 'OPEN',
    IN_PROGRESS = 'IN_PROGRESS',
    CLOSED = 'CLOSED',
    ON_HOLD = 'ON_HOLD'
}

export enum EpicPriority {
    CRITICAL = 'CRITICAL',
    HIGH = 'HIGH',
    MEDIUM = 'MEDIUM',
    LOW = 'LOW'
}

export class Epic extends Model {
    public id!: string;
    public projectId!: string;
    public name!: string;
    public description!: string | null;
    public key!: string | null;
    public status!: EpicStatus;
    public priority!: EpicPriority;
    public ownerId!: string | null;
    public startDate!: Date | null;
    public endDate!: Date | null;
    public color!: string | null;
    public goals!: string | null;
    public tags!: string[];
    // New fields
    public businessValue!: 'LOW' | 'MEDIUM' | 'HIGH' | null;
    public isVisibleToClient!: boolean;
    public completedAt!: Date | null;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Epic.init(
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
        status: {
            type: DataTypes.ENUM(...Object.values(EpicStatus)),
            defaultValue: EpicStatus.OPEN,
        },
        priority: {
            type: DataTypes.ENUM(...Object.values(EpicPriority)),
            defaultValue: EpicPriority.MEDIUM,
        },
        ownerId: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'Users',
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
        color: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        goals: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        tags: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            defaultValue: [],
            allowNull: false
        },
        businessValue: {
            type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH'),
            allowNull: true,
            field: 'business_value'
        },
        isVisibleToClient: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false,
            field: 'is_visible_to_client'
        },
        completedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'completed_at'
        }
    },
    {
        sequelize,
        tableName: 'Epics',
        underscored: true,
    }
);
