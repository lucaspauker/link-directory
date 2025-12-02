const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 9000;
const DATA_FILE = path.join(__dirname, 'projects.json');

// Middleware
app.use(express.json());
app.use(express.static(__dirname));

// Initialize projects file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

// Get all projects
app.get('/api/projects', (req, res) => {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        res.status(500).json({ error: 'Failed to read projects' });
    }
});

// Add new project
app.post('/api/projects', (req, res) => {
    try {
        const { name, link } = req.body;

        if (!name || !link) {
            return res.status(400).json({ error: 'Name and link are required' });
        }

        const data = fs.readFileSync(DATA_FILE, 'utf8');
        const projects = JSON.parse(data);

        const newProject = {
            id: Date.now(),
            name: name,
            link: link,
            favorite: false,
            created: new Date().toISOString()
        };

        projects.push(newProject);
        fs.writeFileSync(DATA_FILE, JSON.stringify(projects, null, 2));

        res.json(newProject);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add project' });
    }
});

// Update project
app.put('/api/projects/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { name, link } = req.body;

        if (!name || !link) {
            return res.status(400).json({ error: 'Name and link are required' });
        }

        const data = fs.readFileSync(DATA_FILE, 'utf8');
        let projects = JSON.parse(data);

        const projectIndex = projects.findIndex(p => p.id === id);
        if (projectIndex === -1) {
            return res.status(404).json({ error: 'Project not found' });
        }

        projects[projectIndex] = {
            ...projects[projectIndex],
            name,
            link,
            updated: new Date().toISOString()
        };

        fs.writeFileSync(DATA_FILE, JSON.stringify(projects, null, 2));
        res.json(projects[projectIndex]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update project' });
    }
});

// Reorder projects
app.put('/api/projects/reorder', (req, res) => {
    try {
        const projects = req.body;
        fs.writeFileSync(DATA_FILE, JSON.stringify(projects, null, 2));
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to reorder projects' });
    }
});

// Toggle favorite
app.patch('/api/projects/:id/favorite', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        let projects = JSON.parse(data);

        const projectIndex = projects.findIndex(p => p.id === id);
        if (projectIndex === -1) {
            return res.status(404).json({ error: 'Project not found' });
        }

        projects[projectIndex].favorite = !projects[projectIndex].favorite;
        fs.writeFileSync(DATA_FILE, JSON.stringify(projects, null, 2));
        res.json(projects[projectIndex]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to toggle favorite' });
    }
});

// Delete project
app.delete('/api/projects/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        let projects = JSON.parse(data);

        projects = projects.filter(p => p.id !== id);
        fs.writeFileSync(DATA_FILE, JSON.stringify(projects, null, 2));

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete project' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Open your browser to http://localhost:${PORT} to view the project directory`);
});
