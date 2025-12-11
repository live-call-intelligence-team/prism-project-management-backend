import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { ProjectStatus } from '../types/enums';

export enum ProjectType {
    SCRUM = 'SCRUM',
    KANBAN = 'KANBAN',
    WATERFALL = 'WATERFALL'
}

interface ProjectAttributes {
    id: string;
    name: string;
    key: string;
    description?: string;
    orgId: string;
    leadId: string;
    clientId?: string | null;
    projectManagerId?: string | null;
    scrumMasterId?: string | null;
    settings: object;
    clientConfig: object;
    status: ProjectStatus;
    visibility: 'PUBLIC' | 'PRIVATE' | 'RESTRICTED';
    startDate?: Date;
    endDate?: Date;
    budget?: number;
    createdAt?: Date;
    updatedAt?: Date;
    usesEpics: boolean;
    type: ProjectType;
    usesSprints: boolean;
}

interface ProjectCreationAttributes extends Optional<ProjectAttributes, 'id' | 'createdAt' | 'updatedAt' | 'usesEpics' | 'usesSprints' | 'type'> { }

class Project extends Model<ProjectAttributes, ProjectCreationAttributes> implements ProjectAttributes {
    public id!: string;
    public name!: string;
    public key!: string;
    public description?: string;
    public orgId!: string;
    public leadId!: string;
    public settings!: object;
    public clientConfig!: object;
    public status!: ProjectStatus;
    public visibility!: 'PUBLIC' | 'PRIVATE' | 'RESTRICTED';
    public startDate?: Date;
    public endDate?: Date;
    public budget?: number;
    public clientId?: string | null;
    public projectManagerId?: string | null;
    public scrumMasterId?: string | null;
    public usesEpics!: boolean;
    public type!: ProjectType;
    public usesSprints!: boolean;
}

Project.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        key: {
            type: DataTypes.STRING(10),
            allowNull: false,
            unique: true,
            validate: {
                isUppercase: true,
                len: [2, 10],
            },
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
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
        leadId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id',
            },
            onDelete: 'RESTRICT',
        },
        clientId: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'users',
                key: 'id',
            },
            onDelete: 'SET NULL',
        },
        projectManagerId: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'users',
                key: 'id',
            },
            onDelete: 'SET NULL',
            field: 'project_manager_id'
        },
        scrumMasterId: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'users',
                key: 'id',
            },
            onDelete: 'SET NULL',
            field: 'scrum_master_id'
        },
        settings: {
            type: DataTypes.JSONB,
            defaultValue: {},
        },
        clientConfig: {
            type: DataTypes.JSONB,
            defaultValue: { showBudget: false, allowTaskCreation: false },
        },
        status: {
            type: DataTypes.ENUM(...Object.values(ProjectStatus)),
            allowNull: false,
            defaultValue: ProjectStatus.ACTIVE,
        },
        visibility: {
            type: DataTypes.ENUM('PUBLIC', 'PRIVATE', 'RESTRICTED'),
            defaultValue: 'PRIVATE',
        },
        usesEpics: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            allowNull: false
        },
        type: {
            type: DataTypes.ENUM(...Object.values(ProjectType)),
            defaultValue: ProjectType.SCRUM,
            allowNull: false
        },
        usesSprints: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            allowNull: false,
            field: 'uses_sprints'
        },
        startDate: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        endDate: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        budget: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'projects',
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ['key'],
            },
            {
                fields: ['org_id'],
            },
            {
                fields: ['lead_id'],
            },
            {
                fields: ['status'],
            },
            {
                fields: ['client_id'],
            },
        ],
    }
);

export default Project;
