import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { UserRole } from '../types/enums';

interface PermissionAttributes {
    id: string;
    role: UserRole;
    resource: string;
    actions: string[];
    conditions?: object;
    createdAt?: Date;
    updatedAt?: Date;
}

interface PermissionCreationAttributes extends Optional<PermissionAttributes, 'id' | 'createdAt' | 'updatedAt'> { }

class Permission extends Model<PermissionAttributes, PermissionCreationAttributes> implements PermissionAttributes {
    public id!: string;
    public role!: UserRole;
    public resource!: string;
    public actions!: string[];
    public conditions?: object;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Permission.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        role: {
            type: DataTypes.ENUM(...Object.values(UserRole)),
            allowNull: false,
        },
        resource: {
            type: DataTypes.STRING(100),
            allowNull: false,
            comment: 'Resource type (e.g., project, issue, user)',
        },
        actions: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            defaultValue: [],
            comment: 'Allowed actions (e.g., create, read, update, delete)',
        },
        conditions: {
            type: DataTypes.JSONB,
            allowNull: true,
            comment: 'Additional conditions for permission',
        },
    },
    {
        sequelize,
        tableName: 'permissions',
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ['role', 'resource'],
            },
            {
                fields: ['role'],
            },
        ],
    }
);

export default Permission;
