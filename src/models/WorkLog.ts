import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface WorkLogAttributes {
    id: string;
    issueId: string;
    userId: string;
    timeSpent: number;
    date: Date;
    description?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

interface WorkLogCreationAttributes extends Optional<WorkLogAttributes, 'id' | 'createdAt' | 'updatedAt'> { }

class WorkLog extends Model<WorkLogAttributes, WorkLogCreationAttributes> implements WorkLogAttributes {
    public id!: string;
    public issueId!: string;
    public userId!: string;
    public timeSpent!: number;
    public date!: Date;
    public description?: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

WorkLog.init(
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
        timeSpent: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            comment: 'Time spent in hours',
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'work_logs',
        timestamps: true,
        indexes: [
            {
                fields: ['issue_id'],
            },
            {
                fields: ['user_id'],
            },
            {
                fields: ['date'],
            },
        ],
    }
);

export default WorkLog;
