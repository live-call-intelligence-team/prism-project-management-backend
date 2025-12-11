import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { NotificationType } from '../types/enums';

interface NotificationAttributes {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    data: object;
    isRead: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

interface NotificationCreationAttributes extends Optional<NotificationAttributes, 'id' | 'createdAt' | 'updatedAt'> { }

class Notification extends Model<NotificationAttributes, NotificationCreationAttributes> implements NotificationAttributes {
    public id!: string;
    public userId!: string;
    public type!: NotificationType;
    public title!: string;
    public message!: string;
    public data!: object;
    public isRead!: boolean;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Notification.init(
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
                model: 'Users',
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        type: {
            type: DataTypes.ENUM(...Object.values(NotificationType)),
            allowNull: false,
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        data: {
            type: DataTypes.JSONB,
            defaultValue: {},
        },
        isRead: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    },
    {
        sequelize,
        tableName: 'Notifications',
        timestamps: true,
        indexes: [
            {
                fields: ['user_id'],
            },
            {
                fields: ['is_read'],
            },
            {
                fields: ['type'],
            },
        ],
    }
);

export default Notification;
