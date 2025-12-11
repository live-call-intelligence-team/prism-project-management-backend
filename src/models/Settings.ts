import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface SettingsAttributes {
    key: string;
    value: any;
    description?: string;
    updatedBy?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

interface SettingsCreationAttributes extends Optional<SettingsAttributes, 'description' | 'updatedBy' | 'createdAt' | 'updatedAt'> { }

class Settings extends Model<SettingsAttributes, SettingsCreationAttributes> implements SettingsAttributes {
    public key!: string;
    public value!: any;
    public description!: string;
    public updatedBy!: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Settings.init(
    {
        key: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        value: {
            type: DataTypes.JSONB,
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        updatedBy: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'Users',
                key: 'id',
            },
        },
    },
    {
        sequelize,
        tableName: 'Settings',
        timestamps: true,
    }
);

export default Settings;
