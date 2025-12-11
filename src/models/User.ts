import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { UserRole } from '../types/enums';
import bcrypt from 'bcryptjs';

interface UserAttributes {
    id: string;
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    orgId: string;
    profileData: object;
    mfaEnabled: boolean;
    mfaSecret?: string;
    isActive: boolean;
    lastLogin?: Date;
    refreshToken?: string | null;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    createdAt?: Date;
    updatedAt?: Date;
    username?: string;
    phone?: string;
    forcePasswordChange?: boolean;
    createdBy?: string; // Admin who created this user
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'createdAt' | 'updatedAt'> { }

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    public id!: string;
    public email!: string;
    public passwordHash!: string;
    public firstName!: string;
    public lastName!: string;
    public role!: UserRole;
    public orgId!: string;
    public profileData!: object;
    public mfaEnabled!: boolean;
    public mfaSecret?: string;
    public isActive!: boolean;
    public lastLogin?: Date;
    public refreshToken?: string;
    public resetPasswordToken?: string;
    public resetPasswordExpires?: Date;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
    public username!: string;
    public phone!: string;
    public forcePasswordChange!: boolean;
    public createdBy?: string;

    // Instance methods
    public async comparePassword(password: string): Promise<boolean> {
        return bcrypt.compare(password, this.passwordHash);
    }

    public async setPassword(password: string): Promise<void> {
        const salt = await bcrypt.genSalt(10);
        this.passwordHash = await bcrypt.hash(password, salt);
    }

    public get fullName(): string {
        return `${this.firstName} ${this.lastName}`;
    }

    public toJSON(): object {
        const values: any = { ...this.get() };
        delete values.passwordHash;
        delete values.mfaSecret;
        delete values.refreshToken;
        delete values.resetPasswordToken;
        return values;
    }
}

User.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            },
        },
        username: {
            type: DataTypes.STRING(50),
            allowNull: true,
            unique: true,
        },
        phone: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },
        forcePasswordChange: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            field: 'force_password_change'
        },
        createdBy: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'users',
                key: 'id',
            },
            field: 'created_by'
        },
        passwordHash: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        firstName: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        lastName: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        role: {
            type: DataTypes.ENUM(...Object.values(UserRole)),
            allowNull: false,
            defaultValue: UserRole.EMPLOYEE,
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
        profileData: {
            type: DataTypes.JSONB,
            defaultValue: {},
        },
        mfaEnabled: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        mfaSecret: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        lastLogin: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        refreshToken: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        resetPasswordToken: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        resetPasswordExpires: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'users',
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ['email'],
            },
            {
                fields: ['org_id'],
            },
            {
                fields: ['role'],
            },
        ],
    }
);

export default User;
