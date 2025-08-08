// Configuration Modal JavaScript
// Include this file in your HTML pages

let currentConfigAgent = null;
let agentCapabilities = [];
let knowledgeSources = [];

// Configuration Modal Functions
function openConfigModal(agentId) {
    currentConfigAgent = agentId;
    document.getElementById('configModal').classList.add('active');
    loadAgentConfiguration(agentId);
}

function closeConfigModal() {
    document.getElementById('configModal').classList.remove('active');
    currentConfigAgent = null;
}

function switchConfigTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.config-tab').forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.config-tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(tabName + '-content').classList.add('active');
}

async function loadAgentConfiguration(agentId) {
    showConfigLoading(true);
    
    try {
        // Load from backend API
        const response = await fetch(`http://localhost:8000/api/agents/${agentId}/config`);
        const config = await response.json();
        
        if (config.error) {
            showConfigAlert('Error loading configuration: ' + config.error, 'error');
            // Load default as fallback
            loadDefaultConfiguration(agentId);
            return;
        }
        
        // Populate configuration fields
        populateConfigurationFields(config);
        showConfigAlert('Configuration loaded successfully', 'success');
        
    } catch (error) {
        console.error('Error loading configuration:', error);
        // Load default configuration for demo
        loadDefaultConfiguration(agentId);
        showConfigAlert('Loaded default configuration (backend not connected)', 'error');
    } finally {
        showConfigLoading(false);
    }
}

function loadDefaultConfiguration(agentId) {
    // Load from our local agent configs for demo
    const agentConfigs = {
        wally: {
            id: 'wally',
            name: 'Wally',
            title: 'Master Procurement Coordinator',
            description: 'Master AI coordinator that intelligently routes requests to specialized agents and coordinates responses as an expert procurement specialist.',
            avatar: '🏪',
            color: '#0071ce',
            capabilities: ['Query Routing', 'Multi-Agent Coordination', 'Response Synthesis', 'Procurement Expertise'],
            prompt: `You are Wally, the Master Procurement Coordinator for Walmart. Your role is to intelligently route procurement requests to the most appropriate specialized agents and coordinate their responses to provide comprehensive solutions.

Key Responsibilities:
1. Analyze incoming procurement requests and determine which specialized agents should handle them
2. Route complex queries that require multiple expertise areas to relevant agents
3. Synthesize responses from multiple agents into coherent, actionable insights
4. Maintain awareness of Walmart's procurement policies, goals, and strategic priorities
5. Ensure all responses align with Walmart's values and business objectives

Guidelines:
- Always prioritize Walmart's business interests and cost efficiency
- Ensure compliance with procurement policies and regulatory requirements
- Provide clear, actionable guidance that procurement professionals can implement
- When routing to other agents, provide context about Walmart's specific needs
- Coordinate responses to avoid contradictions between different agents' recommendations

You have access to common knowledge that all agents can reference, and you should leverage insights from specialized agents to provide the most comprehensive and accurate guidance possible.`,
            model: 'claude-3-5-sonnet-20241022',
            maxTokens: 4096,
            temperature: 0.7,
            knowledgeSources: [
                { id: '1', name: 'Walmart Procurement Policies', type: 'document', size: '2.3 MB' },
                { id: '2', name: 'Industry Best Practices', type: 'url', url: 'https://procurement-best-practices.com' }
            ]
        },
        butler: {
            id: 'butler',
            name: 'Butler',
            title: 'AI Assistant & Helper',
            description: 'General-purpose AI assistant that helps with various tasks and provides support across different procurement activities.',
            avatar: '🤖',
            color: '#28a745',
            capabilities: ['Task Assistance', 'General Queries', 'Process Guidance', 'Documentation'],
            prompt: `You are Butler, a helpful AI assistant specializing in procurement support for Walmart. You provide general assistance, process guidance, and support across various procurement activities.

Your role includes:
- Answering general procurement questions
- Providing process guidance and documentation help
- Assisting with routine tasks and inquiries
- Supporting users with navigation and system usage

Always be helpful, professional, and aligned with Walmart's procurement standards.`,
            model: 'claude-3-5-sonnet-20241022',
            maxTokens: 4096,
            temperature: 0.7,
            knowledgeSources: []
        },
        catm: {
            id: 'catm',
            name: 'CatM',
            title: 'Category Management Specialist',
            description: 'Expert in category strategy, market analysis, and supplier performance optimization for specific product categories.',
            avatar: '📊',
            color: '#17a2b8',
            capabilities: ['Category Strategy', 'Market Analysis', 'Supplier Optimization', 'Cost Management'],
            prompt: `You are CatM, a Category Management Specialist for Walmart's procurement team. You excel in category strategy, market analysis, supplier optimization, and cost management.

Your expertise includes:
- Developing comprehensive category strategies
- Conducting market analysis and trend identification
- Optimizing supplier portfolios and performance
- Managing cost reduction initiatives
- Analyzing category spend and performance metrics

Focus on data-driven insights and strategic recommendations that drive value for Walmart.`,
            model: 'claude-3-5-sonnet-20241022',
            maxTokens: 4096,
            temperature: 0.7,
            knowledgeSources: []
        }
        // Add other agents as needed
    };
    
    const config = agentConfigs[agentId] || agentConfigs.wally;
    populateConfigurationFields(config);
}

function populateConfigurationFields(config) {
    // Update header
    document.getElementById('configAgentName').textContent = config.name;
    document.getElementById('configAgentTitle').textContent = config.title;
    document.getElementById('configAgentAvatar').textContent = config.avatar || '🤖';
    document.getElementById('configAgentAvatar').style.background = config.color || '#0071ce';
    
    // General tab
    document.getElementById('configNameInput').value = config.name || '';
    document.getElementById('configTitleInput').value = config.title || '';
    document.getElementById('configDescriptionInput').value = config.description || '';
    
    // Capabilities
    agentCapabilities = config.capabilities || [];
    updateCapabilitiesDisplay();
    
    // Prompt tab
    document.getElementById('configSystemPrompt').value = config.prompt || '';
    
    // Model tab
    document.getElementById('configModel').value = config.model || 'claude-3-5-sonnet-20241022';
    document.getElementById('configMaxTokens').value = config.maxTokens || 4096;
    document.getElementById('configTemperature').value = config.temperature || 0.7;
    
    // Knowledge sources
    knowledgeSources = config.knowledgeSources || [];
    updateKnowledgeSourcesDisplay();
}

function updateCapabilitiesDisplay() {
    const container = document.getElementById('configCapabilities');
    container.innerHTML = agentCapabilities.map(capability => `
        <div class="config-capability-tag" onclick="removeCapability('${capability}')">
            ${capability} ×
        </div>
    `).join('');
}

function addCapability() {
    const input = document.getElementById('newCapabilityInput');
    const capability = input.value.trim();
    
    if (capability && !agentCapabilities.includes(capability)) {
        agentCapabilities.push(capability);
        updateCapabilitiesDisplay();
        input.value = '';
        showConfigAlert('Capability added successfully', 'success');
    }
}

function removeCapability(capability) {
    agentCapabilities = agentCapabilities.filter(cap => cap !== capability);
    updateCapabilitiesDisplay();
    showConfigAlert('Capability removed', 'success');
}

function updateKnowledgeSourcesDisplay() {
    const container = document.getElementById('knowledgeSourcesList');
    
    if (knowledgeSources.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 40px; color: #9ca3af;">No knowledge sources added yet</div>';
        return;
    }
    
    container.innerHTML = knowledgeSources.map(source => `
        <div class="config-knowledge-item">
            <div class="config-knowledge-info">
                <div class="config-knowledge-name">${source.name}</div>
                <div class="config-knowledge-details">
                    <span class="config-knowledge-type">${source.type}</span>
                    ${source.type === 'url' ? source.url : (source.size || 'Unknown size')}
                </div>
            </div>
            <div class="config-knowledge-actions">
                <button class="config-btn config-btn-small config-btn-secondary" onclick="refreshKnowledgeSource('${source.id}')">
                    🔄 Refresh
                </button>
                <button class="config-btn config-btn-small config-btn-danger" onclick="removeKnowledgeSource('${source.id}')">
                    🗑️ Remove
                </button>
            </div>
        </div>
    `).join('');
}

function setupFileUpload() {
    const uploadArea = document.getElementById('fileUploadArea');
    const fileInput = document.getElementById('fileUploadInput');
    
    if (!uploadArea || !fileInput) return;
    
    uploadArea.addEventListener('click', () => fileInput.click());
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        fileInput.files = e.dataTransfer.files;
    });
}

async function uploadFiles() {
    const fileInput = document.getElementById('fileUploadInput');
    const fileNameInput = document.getElementById('fileNameInput');
    
    if (fileInput.files.length === 0) {
        showConfigAlert('Please select files to upload', 'error');
        return;
    }
    
    for (let file of fileInput.files) {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('name', fileNameInput.value || file.name);
            
            const response = await fetch(`http://localhost:8000/api/agents/${currentConfigAgent}/upload-file`, {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Add to local list for immediate UI update
                const newSource = {
                    id: result.knowledge_id || Date.now().toString(),
                    name: fileNameInput.value || file.name,
                    type: 'document',
                    size: (file.size / 1024 / 1024).toFixed(2) + ' MB'
                };
                
                knowledgeSources.push(newSource);
                updateKnowledgeSourcesDisplay();
                showConfigAlert(`File "${file.name}" uploaded successfully`, 'success');
            } else {
                showConfigAlert(`Error uploading "${file.name}": ${result.error}`, 'error');
            }
            
        } catch (error) {
            // For demo, add to local list
            const newSource = {
                id: Date.now().toString(),
                name: fileNameInput.value || file.name,
                type: 'document',
                size: (file.size / 1024 / 1024).toFixed(2) + ' MB'
            };
            
            knowledgeSources.push(newSource);
            updateKnowledgeSourcesDisplay();
            showConfigAlert(`File "${file.name}" uploaded (demo mode)`, 'success');
        }
    }
    
    // Clear inputs
    fileInput.value = '';
    fileNameInput.value = '';
}

async function addURL() {
    const urlNameInput = document.getElementById('urlNameInput');
    const urlInput = document.getElementById('urlInput');
    
    const name = urlNameInput.value.trim();
    const url = urlInput.value.trim();
    
    if (!name || !url) {
        showConfigAlert('Please enter both name and URL', 'error');
        return;
    }
    
    try {
        const response = await fetch(`http://localhost:8000/api/agents/${currentConfigAgent}/add-url`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, url })
        });
        
        const result = await response.json();
        
        if (result.success) {
            const newSource = {
                id: result.knowledge_id,
                name: name,
                type: 'url',
                url: url
            };
            
            knowledgeSources.push(newSource);
            updateKnowledgeSourcesDisplay();
            showConfigAlert('URL added successfully', 'success');
        } else {
            showConfigAlert('Error adding URL: ' + result.error, 'error');
        }
        
    } catch (error) {
        // For demo, add to local list
        const newSource = {
            id: Date.now().toString(),
            name: name,
            type: 'url',
            url: url
        };
        
        knowledgeSources.push(newSource);
        updateKnowledgeSourcesDisplay();
        showConfigAlert('URL added (demo mode)', 'success');
    }
    
    // Clear inputs
    urlNameInput.value = '';
    urlInput.value = '';
}

function removeKnowledgeSource(sourceId) {
    if (confirm('Are you sure you want to remove this knowledge source?')) {
        knowledgeSources = knowledgeSources.filter(source => source.id !== sourceId);
        updateKnowledgeSourcesDisplay();
        showConfigAlert('Knowledge source removed', 'success');
        
        // Also call backend to remove
        fetch(`http://localhost:8000/api/agents/${currentConfigAgent}/knowledge/${sourceId}`, {
            method: 'DELETE'
        }).catch(error => console.warn('Backend removal failed:', error));
    }
}

async function refreshKnowledgeSource(sourceId) {
    const source = knowledgeSources.find(s => s.id === sourceId);
    if (!source) return;
    
    try {
        if (source.type === 'url') {
            const response = await fetch(`http://localhost:8000/api/knowledge/refresh-url`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: source.url })
            });
        }
        
        showConfigAlert(`Knowledge source "${source.name}" refreshed successfully`, 'success');
        
    } catch (error) {
        showConfigAlert('Error refreshing knowledge source: ' + error.message, 'error');
    }
}

async function savePrompt() {
    const prompt = document.getElementById('configSystemPrompt').value;
    
    try {
        const response = await fetch(`http://localhost:8000/api/agents/${currentConfigAgent}/update`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: prompt })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showConfigAlert('Prompt saved successfully', 'success');
        } else {
            showConfigAlert('Error saving prompt: ' + result.error, 'error');
        }
        
    } catch (error) {
        showConfigAlert('Prompt saved (demo mode)', 'success');
    }
}

function resetPrompt() {
    if (confirm('Are you sure you want to reset the prompt to default?')) {
        document.getElementById('configSystemPrompt').value = getDefaultPrompt(currentConfigAgent);
        showConfigAlert('Prompt reset to default', 'success');
    }
}

function previewPrompt() {
    const prompt = document.getElementById('configSystemPrompt').value;
    
    // Open prompt preview in new window
    const previewWindow = window.open('', 'promptPreview', 'width=800,height=600');
    previewWindow.document.write(`
        <html>
        <head>
            <title>Prompt Preview</title>
            <style>
                body { font-family: monospace; padding: 20px; line-height: 1.6; }
                pre { background: #f5f5f5; padding: 20px; border-radius: 8px; white-space: pre-wrap; }
            </style>
        </head>
        <body>
            <h2>System Prompt Preview</h2>
            <pre>${prompt}</pre>
        </body>
        </html>
    `);
}

async function saveModelSettings() {
    const modelSettings = {
        model: document.getElementById('configModel').value,
        maxTokens: parseInt(document.getElementById('configMaxTokens').value),
        temperature: parseFloat(document.getElementById('configTemperature').value)
    };
    
    try {
        const response = await fetch(`http://localhost:8000/api/agents/${currentConfigAgent}/update`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model_settings: modelSettings })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showConfigAlert('Model settings saved successfully', 'success');
        } else {
            showConfigAlert('Error saving model settings: ' + result.error, 'error');
        }
        
    } catch (error) {
        showConfigAlert('Model settings saved (demo mode)', 'success');
    }
}

async function saveAllSettings() {
    const allSettings = {
        name: document.getElementById('configNameInput').value,
        title: document.getElementById('configTitleInput').value,
        description: document.getElementById('configDescriptionInput').value,
        capabilities: agentCapabilities,
        prompt: document.getElementById('configSystemPrompt').value,
        model_settings: {
            model: document.getElementById('configModel').value,
            maxTokens: parseInt(document.getElementById('configMaxTokens').value),
            temperature: parseFloat(document.getElementById('configTemperature').value)
        }
    };
    
    try {
        const response = await fetch(`http://localhost:8000/api/agents/${currentConfigAgent}/update`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(allSettings)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showConfigAlert('All settings saved successfully', 'success');
        } else {
            showConfigAlert('Error saving settings: ' + result.error, 'error');
        }
        
    } catch (error) {
        showConfigAlert('All settings saved (demo mode)', 'success');
    }
}

function resetAgent() {
    if (confirm('Are you sure you want to reset this agent to default settings? This action cannot be undone.')) {
        loadDefaultConfiguration(currentConfigAgent);
        showConfigAlert('Agent reset to default configuration', 'success');
    }
}

function showConfigAlert(message, type) {
    const alert = document.getElementById('configAlert');
    alert.textContent = message;
    alert.className = `config-alert ${type} active`;
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        alert.classList.remove('active');
    }, 5000);
}

function showConfigLoading(show) {
    const loading = document.getElementById('configLoading');
    const content = document.querySelectorAll('.config-tab-content');
    
    if (show) {
        loading.classList.add('active');
        content.forEach(c => c.style.display = 'none');
    } else {
        loading.classList.remove('active');
        content.forEach(c => c.style.display = '');
        // Show active tab
        const activeTab = document.querySelector('.config-tab-content.active');
        if (activeTab) activeTab.style.display = 'block';
    }
}

function getDefaultPrompt(agentId) {
    const defaultPrompts = {
        wally: `You are Wally, the Master Procurement Coordinator for Walmart. Your role is to intelligently route procurement requests to the most appropriate specialized agents and coordinate their responses to provide comprehensive solutions.

Key Responsibilities:
1. Analyze incoming procurement requests and determine which specialized agents should handle them
2. Route complex queries that require multiple expertise areas to relevant agents
3. Synthesize responses from multiple agents into coherent, actionable insights
4. Maintain awareness of Walmart's procurement policies, goals, and strategic priorities
5. Ensure all responses align with Walmart's values and business objectives

Guidelines:
- Always prioritize Walmart's business interests and cost efficiency
- Ensure compliance with procurement policies and regulatory requirements
- Provide clear, actionable guidance that procurement professionals can implement
- When routing to other agents, provide context about Walmart's specific needs
- Coordinate responses to avoid contradictions between different agents' recommendations

You have access to common knowledge that all agents can reference, and you should leverage insights from specialized agents to provide the most comprehensive and accurate guidance possible.`,
        
        butler: `You are Butler, a helpful AI assistant specializing in procurement support for Walmart. You provide general assistance, process guidance, and support across various procurement activities.

Your role includes:
- Answering general procurement questions
- Providing process guidance and documentation help
- Assisting with routine tasks and inquiries
- Supporting users with navigation and system usage

Always be helpful, professional, and aligned with Walmart's procurement standards.`,
        
        catm: `You are CatM, a Category Management Specialist for Walmart's procurement team. You excel in category strategy, market analysis, supplier optimization, and cost management.

Your expertise includes:
- Developing comprehensive category strategies
- Conducting market analysis and trend identification
- Optimizing supplier portfolios and performance
- Managing cost reduction initiatives
- Analyzing category spend and performance metrics

Focus on data-driven insights and strategic recommendations that drive value for Walmart.`
    };
    
    return defaultPrompts[agentId] || defaultPrompts.wally;
}

// Initialize configuration modal functionality
document.addEventListener('DOMContentLoaded', function() {
    // Setup file upload if elements exist
    if (document.getElementById('fileUploadArea')) {
        setupFileUpload();
    }
    
    // Close modal when clicking outside
    const modal = document.getElementById('configModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeConfigModal();
            }
        });
    }
    
    // Add Enter key handling for capability input
    const capabilityInput = document.getElementById('newCapabilityInput');
    if (capabilityInput) {
        capabilityInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                addCapability();
            }
        });
    }
});