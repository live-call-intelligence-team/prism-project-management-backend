import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface SprintMemberAttributes {
    id: string;
    sprintId: string;
    userId: string;
    capacityHours?: number;
    role?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

interface SprintMemberCreationAttributes extends Optional<SprintMemberAttributes, 'id' | 'createdAt' | 'updatedAt'> { }

class SprintMember extends Model<SprintMemberAttributes, SprintMemberCreationAttributes> implements SprintMemberAttributes {
    public id!: string;
    public sprintId!: string;
    public userId!: string;
    public capacityHours?: number;
    public role?: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

SprintMember.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        sprintId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'Sprints',
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        capacityHours: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
        },
        role: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'SprintMembers',
        timestamps: true,
        underscored: false,
        indexes: [
            {
                unique: true,
                fields: ['sprintId', 'userId'],
            },
        ],
    }
);

export default SprintMember;
