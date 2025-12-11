import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

interface MilestoneAttributes {
    id: string;
    projectId: string;
    name: string;
    description?: string;
    dueDate?: Date;
    status: 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED';
    tasksTotal: number;
    tasksCompleted: number;
    createdAt?: Date;
    updatedAt?: Date;
}

interface MilestoneCreationAttributes extends Optional<MilestoneAttributes, 'id' | 'description' | 'dueDate' | 'tasksTotal' | 'tasksCompleted' | 'createdAt' | 'updatedAt'> { }

class Milestone extends Model<MilestoneAttributes, MilestoneCreationAttributes> implements MilestoneAttributes {
    declare id: string;
    declare projectId: string;
    declare name: string;
    declare description?: string;
    declare dueDate?: Date;
    declare status: 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED';
    declare tasksTotal: number;
    declare tasksCompleted: number;
    declare readonly createdAt?: Date;
    declare readonly updatedAt?: Date;

    // Helper method to calculate progress
    get progress(): number {
        if (this.tasksTotal === 0) return 0;
        return Math.round((this.tasksCompleted / this.tasksTotal) * 100);
    }
}

Milestone.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        projectId: {
            type: DataTypes.UUID,
            allowNull: false,
            field: 'project_id',
            references: {
                model: 'Projects',
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        dueDate: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'due_date',
        },
        status: {
            type: DataTypes.STRING(50),
            defaultValue: 'UPCOMING',
            allowNull: false,
            validate: {
                isIn: [['UPCOMING', 'IN_PROGRESS', 'COMPLETED', 'DELAYED']],
            },
        },
        tasksTotal: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false,
            field: 'tasks_total',
        },
        tasksCompleted: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false,
            field: 'tasks_completed',
        },
    },
    {
        sequelize,
        tableName: 'Milestones',
        modelName: 'Milestone',
        underscored: true,
        timestamps: true,
    }
);

export default Milestone;
