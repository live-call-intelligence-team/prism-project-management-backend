import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface WorkflowAttributes {
    id: string;
    orgId: string;
    name: string;
    description?: string;
    statuses: object[];
    transitions: object[];
    rules: object;
    isDefault: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

interface WorkflowCreationAttributes extends Optional<WorkflowAttributes, 'id' | 'createdAt' | 'updatedAt'> { }

class Workflow extends Model<WorkflowAttributes, WorkflowCreationAttributes> implements WorkflowAttributes {
    public id!: string;
    public orgId!: string;
    public name!: string;
    public description?: string;
    public statuses!: object[];
    public transitions!: object[];
    public rules!: object;
    public isDefault!: boolean;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Workflow.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        orgId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'organizations',
                key: 'id',
            },
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
        statuses: {
            type: DataTypes.JSONB,
            defaultValue: [],
            comment: 'Array of status objects',
        },
        transitions: {
            type: DataTypes.JSONB,
            defaultValue: [],
            comment: 'Array of transition rules',
        },
        rules: {
            type: DataTypes.JSONB,
            defaultValue: {},
            comment: 'Workflow automation rules',
        },
        isDefault: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    },
    {
        sequelize,
        tableName: 'workflows',
        timestamps: true,
        indexes: [
            {
                fields: ['org_id'],
            },
            {
                fields: ['is_default'],
            },
        ],
    }
);

export default Workflow;
