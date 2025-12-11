import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface OrganizationAttributes {
    id: string;
    name: string;
    settings: object;
    subscriptionPlan: string;
    customDomain?: string;
    ssoEnabled: boolean;
    maxUsers: number;
    createdAt?: Date;
    updatedAt?: Date;
}

interface OrganizationCreationAttributes extends Optional<OrganizationAttributes, 'id' | 'createdAt' | 'updatedAt'> { }

class Organization extends Model<OrganizationAttributes, OrganizationCreationAttributes> implements OrganizationAttributes {
    public id!: string;
    public name!: string;
    public settings!: object;
    public subscriptionPlan!: string;
    public customDomain?: string;
    public ssoEnabled!: boolean;
    public maxUsers!: number;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Organization.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
        },
        settings: {
            type: DataTypes.JSONB,
            defaultValue: {},
        },
        subscriptionPlan: {
            type: DataTypes.STRING(50),
            allowNull: false,
            defaultValue: 'FREE',
        },
        customDomain: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        ssoEnabled: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        maxUsers: {
            type: DataTypes.INTEGER,
            defaultValue: 10,
        },
    },
    {
        sequelize,
        tableName: 'organizations',
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ['name'],
            },
        ],
    }
);

export default Organization;
