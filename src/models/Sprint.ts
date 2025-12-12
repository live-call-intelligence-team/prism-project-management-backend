import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { SprintStatus } from '../types/enums';

interface SprintAttributes {
    id: string;
    projectId: string;
    name: string;
    key?: string; // SPRINT-1
    goal?: string;
    notes?: string;
    startDate: Date;
    endDate: Date;
    status: SprintStatus;
    capacity?: number; // Team capacity calculated from members
    plannedPoints?: number;
    totalPoints?: number; // Dynamic total of all issue story points
    completedPoints?: number; // Weighted completion based on status
    burnDownConfig?: any; // JSON config
    velocity?: number;
    createdAt?: Date;
    updatedAt?: Date;
}

interface SprintCreationAttributes extends Optional<SprintAttributes, 'id' | 'createdAt' | 'updatedAt'> { }

class Sprint extends Model<SprintAttributes, SprintCreationAttributes> implements SprintAttributes {
    public id!: string;
    public projectId!: string;
    public name!: string;
    public key?: string;
    public goal?: string;
    public notes?: string;
    public startDate!: Date;
    public endDate!: Date;
    public status!: SprintStatus;
    public capacity?: number;
    public plannedPoints?: number;
    public totalPoints?: number;
    public completedPoints?: number;
    public burnDownConfig?: any;
    public velocity?: number;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    // Association
    public issues?: any[];
    public members?: any[];
}

Sprint.init(
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
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        key: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        goal: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        startDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        endDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM(...Object.values(SprintStatus)),
            allowNull: false,
            defaultValue: SprintStatus.PLANNED,
        },
        capacity: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        plannedPoints: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        // totalPoints: {
        //     type: DataTypes.FLOAT,
        //     allowNull: true,
        //     defaultValue: 0,
        //     field: 'total_points'
        // },
        // completedPoints: {
        //     type: DataTypes.FLOAT,
        //     allowNull: true,
        //     defaultValue: 0,
        //     field: 'completed_points'
        // },
        burnDownConfig: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        velocity: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'Sprints',
        timestamps: true,
        indexes: [
            {
                fields: ['project_id'],
            },
            {
                fields: ['status'],
            },
            {
                fields: ['start_date', 'end_date'],
            },
        ],
    }
);

export default Sprint;
