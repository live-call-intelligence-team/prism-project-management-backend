import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { AuditAction } from '../types/enums';

interface AuditLogAttributes {
    id: string;
    userId: string;
    action: AuditAction;
    resource: string;
    resourceId?: string;
    details: object;
    ipAddress?: string;
    userAgent?: string;
    createdAt?: Date;
}

interface AuditLogCreationAttributes extends Optional<AuditLogAttributes, 'id' | 'createdAt'> { }

class AuditLog extends Model<AuditLogAttributes, AuditLogCreationAttributes> implements AuditLogAttributes {
    public id!: string;
    public userId!: string;
    public action!: AuditAction;
    public resource!: string;
    public resourceId?: string;
    public details!: object;
    public ipAddress?: string;
    public userAgent?: string;
    public readonly createdAt!: Date;
}

AuditLog.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
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
        action: {
            type: DataTypes.ENUM(...Object.values(AuditAction)),
            allowNull: false,
        },
        resource: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        resourceId: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        details: {
            type: DataTypes.JSONB,
            defaultValue: {},
        },
        ipAddress: {
            type: DataTypes.STRING(45),
            allowNull: true,
        },
        userAgent: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'audit_logs',
        timestamps: true,
        updatedAt: false,
        indexes: [
            {
                fields: ['user_id'],
            },
            {
                fields: ['action'],
            },
            {
                fields: ['resource'],
            },
            {
                fields: ['created_at'],
            },
        ],
    }
);

export default AuditLog;
