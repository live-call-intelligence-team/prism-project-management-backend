
// @ts-nocheck
import axios from 'axios';

// Enums locally defined to avoid import issues
const IssueType = {
    BUG: 'BUG',
    FEATURE: 'FEATURE',
    TASK: 'TASK',
    STORY: 'STORY',
    EPIC: 'EPIC',
    SUBTASK: 'SUBTASK',
    SUPPORT: 'SUPPORT',
};

const API_URL = 'http://localhost:5000/api';
let token: string;
let projectId: string;
let epicId: string;
let storyId: string;

async function login() {
    try {
        // Login as admin
        const response = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@test.com', // Assuming this user exists from previous seeds/tests
            password: 'password123'
        });
        token = response.data.token;
        console.log('Login successful');
    } catch (error) {
        console.error('Login failed. Please ensure server is running and admin@test.com exists.');
        process.exit(1);
    }
}

async function getProject() {
    try {
        const response = await axios.get(`${API_URL}/projects`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.data.projects.length > 0) {
            projectId = response.data.data.projects[0].id;
            console.log('Using Project:', projectId);
        } else {
            console.error('No projects found. Create one first.');
            process.exit(1);
        }
    } catch (error) {
        console.error('Get Projects failed', error.response?.data || error.message);
    }
}

async function createEpic() {
    try {
        const response = await axios.post(`${API_URL}/issues`, {
            projectId,
            title: 'Test Epic ' + Date.now(),
            type: IssueType.EPIC,
            priority: 'HIGH',
            reporterId: 'ignored' // Handled by backend
        }, { headers: { Authorization: `Bearer ${token}` } });
        epicId = response.data.data.issue.id;
        console.log('Created Epic:', epicId);
    } catch (error) {
        console.error('Create Epic failed', error.response?.data || error.message);
    }
}

async function createStory() {
    try {
        const response = await axios.post(`${API_URL}/issues/create-story`, {
            projectId, // Needed for key generation? Controller uses it.
            title: 'Test Story',
            epicId: epicId,
            priority: 'MEDIUM'
        }, { headers: { Authorization: `Bearer ${token}` } });
        storyId = response.data.data.issue.id;
        console.log('Created Story:', storyId);
    } catch (error) {
        console.error('Create Story failed', error.response?.data || error.message);
    }
}

async function createSubtask() {
    try {
        const response = await axios.post(`${API_URL}/issues/create-subtask`, {
            title: 'Test Subtask',
            parentId: storyId
        }, { headers: { Authorization: `Bearer ${token}` } });
        console.log('Created Subtask:', response.data.data.issue.id);
    } catch (error) {
        console.error('Create Subtask failed', error.response?.data || error.message);
    }
}

async function getHierarchy() {
    try {
        const response = await axios.get(`${API_URL}/issues/hierarchy/${projectId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Hierarchy Fetched. Epics count:', response.data.data.epics.length);
        const myEpic = response.data.data.epics.find((e: any) => e.id === epicId);
        if (myEpic) {
            console.log('My Epic found. Children count:', myEpic.childIssues?.length || 0);
            if (myEpic.childIssues?.[0]?.subtasks) {
                console.log('Subtasks count in first story:', myEpic.childIssues[0].subtasks.length);
            }
        }
    } catch (error) {
        console.error('Get Hierarchy failed', error.response?.data || error.message);
    }
}

async function run() {
    await login();
    await getProject();
    await createEpic();
    await createStory();
    await createSubtask();
    await getHierarchy();
}

run();
