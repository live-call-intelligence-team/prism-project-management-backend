import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface ProjectMemberAttributes {
    id: string;
    projectId: string;
    userId: string;
    role: string;
    createdAt?: Date;
    updatedAt?: Date;
    accessLevel?: 'VIEW_ONLY' | 'COMMENTER' | 'APPROVER';
}

interface ProjectMemberCreationAttributes extends Optional<ProjectMemberAttributes, 'id' | 'createdAt' | 'updatedAt'> { }

class ProjectMember extends Model<ProjectMemberAttributes, ProjectMemberCreationAttributes> implements ProjectMemberAttributes {
    public id!: string;
    public projectId!: string;
    public userId!: string;
    public role!: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
    public accessLevel!: 'VIEW_ONLY' | 'COMMENTER' | 'APPROVER';
}

ProjectMember.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        projectId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'Projects',
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
        role: {
            type: DataTypes.STRING(50),
            allowNull: false,
            defaultValue: 'MEMBER',
        },
        accessLevel: {
            type: DataTypes.STRING(20),
            defaultValue: 'VIEW_ONLY',
            field: 'access_level'
        }
    },
    {
        sequelize,
        tableName: 'ProjectMembers',
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ['project_id', 'user_id'],
            },
            {
                fields: ['project_id'],
            },
            {
                fields: ['user_id'],
            },
        ],
    }
);

export default ProjectMember;
