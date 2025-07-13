require('dotenv').config();
const axios = require('axios');

const testBOMCreationWithAuth = async () => {
  try {
    console.log('🔍 Testing BOM creation with authentication...\n');

    // Step 1: Login to get token
    console.log('Step 1: Logging in...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@rishabh.co.in',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful');

    // Step 2: Get available projects
    console.log('\nStep 2: Fetching projects...');
    const projectsResponse = await axios.get('http://localhost:5000/api/projects', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const projects = projectsResponse.data.projects || [];
    console.log(`✅ Found ${projects.length} projects`);
    
    if (projects.length === 0) {
      console.log('❌ No projects found. Creating sample projects first...');
      // Run the create sample projects script
      const { execSync } = require('child_process');
      execSync('node create-sample-projects.js', { stdio: 'inherit' });
      
      // Retry getting projects
      const retryProjectsResponse = await axios.get('http://localhost:5000/api/projects', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      projects = retryProjectsResponse.data.projects || [];
      console.log(`✅ Now found ${projects.length} projects after creation`);
    }

    // Step 3: Get available materials
    console.log('\nStep 3: Fetching materials...');
    const materialsResponse = await axios.get('http://localhost:5000/api/materials', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const materials = materialsResponse.data.materials || [];
    console.log(`✅ Found ${materials.length} materials`);

    if (materials.length === 0) {
      console.log('❌ No materials found. Please add some materials first.');
      return;
    }

    // Step 4: Test BOM creation
    console.log('\nStep 4: Creating test BOM...');
    
    const testBOMData = {
      project: projects[0]._id,
      version: '1.0',
      status: 'Draft',
      materials: [
        {
          material: materials[0]._id,
          quantity: 2,
          unit: materials[0].unit,
          unitCost: materials[0].unitPrice,
          supplier: materials[0].supplier?.name || 'Test Supplier',
          leadTime: 7,
          notes: 'Test material for BOM creation'
        }
      ],
      notes: 'This is a test BOM created for testing purposes',
      priority: 'Medium'
    };

    console.log('📤 Sending BOM data:', JSON.stringify(testBOMData, null, 2));

    const bomResponse = await axios.post('http://localhost:5000/api/bom', testBOMData, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ BOM created successfully!');
    console.log('📋 Created BOM:', bomResponse.data.bom.bomId);
    console.log('💰 Total Cost:', bomResponse.data.bom.totalCost);

    // Step 5: Verify BOM was created
    console.log('\nStep 5: Verifying BOM creation...');
    const bomsResponse = await axios.get('http://localhost:5000/api/bom', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log(`✅ Total BOMs in system: ${bomsResponse.data.boms.length}`);

  } catch (error) {
    console.error('❌ Error during BOM creation test:');
    console.error('Message:', error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
    
    if (error.request) {
      console.error('Request failed - no response received');
    }
  }
};

testBOMCreationWithAuth();
