import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { CustomFieldType } from '../types/enums';

interface CustomFieldAttributes {
    id: string;
    orgId: string;
    name: string;
    fieldKey: string;
    type: CustomFieldType;
    options: object;
    applicableTo: string[];
    isRequired: boolean;
    defaultValue?: any;
    createdAt?: Date;
    updatedAt?: Date;
}

interface CustomFieldCreationAttributes extends Optional<CustomFieldAttributes, 'id' | 'createdAt' | 'updatedAt'> { }

class CustomField extends Model<CustomFieldAttributes, CustomFieldCreationAttributes> implements CustomFieldAttributes {
    public id!: string;
    public orgId!: string;
    public name!: string;
    public fieldKey!: string;
    public type!: CustomFieldType;
    public options!: object;
    public applicableTo!: string[];
    public isRequired!: boolean;
    public defaultValue?: any;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

CustomField.init(
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
        fieldKey: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        type: {
            type: DataTypes.ENUM(...Object.values(CustomFieldType)),
            allowNull: false,
        },
        options: {
            type: DataTypes.JSONB,
            defaultValue: {},
        },
        applicableTo: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            defaultValue: [],
            comment: 'Issue types this field applies to',
        },
        isRequired: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        defaultValue: {
            type: DataTypes.JSONB,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'custom_fields',
        timestamps: true,
        indexes: [
            {
                fields: ['org_id'],
            },
            {
                unique: true,
                fields: ['org_id', 'field_key'],
            },
        ],
    }
);

export default CustomField;
