require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');

async function testBOMCreation() {
  try {
    // First, let's test if the server is running
    console.log('Testing server connection...');
    const serverTest = await axios.get('http://localhost:5000/api/projects');
    console.log('✅ Server is running');

    // Test login to get token
    console.log('Testing login...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@rishabh.co.in',
      password: 'admin123'
    });
    const token = loginResponse.data.token;
    console.log('✅ Login successful');

    // Get projects
    console.log('Fetching projects...');
    const projectsResponse = await axios.get('http://localhost:5000/api/projects', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Projects fetched:', projectsResponse.data.projects?.length || 0);
    
    if (projectsResponse.data.projects?.length === 0) {
      console.log('❌ No projects found. Creating sample projects first...');
      return;
    }

    // Get materials
    console.log('Fetching materials...');
    const materialsResponse = await axios.get('http://localhost:5000/api/materials', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Materials fetched:', materialsResponse.data.materials?.length || 0);

    if (materialsResponse.data.materials?.length === 0) {
      console.log('❌ No materials found. Need materials to create BOM');
      return;
    }

    // Try to create a simple BOM
    console.log('Creating test BOM...');
    const project = projectsResponse.data.projects[0];
    const material = materialsResponse.data.materials[0];

    const bomData = {
      project: project._id,
      version: '1.0',
      materials: [{
        material: material._id,
        quantity: 2,
        unit: material.unit,
        unitCost: material.unitPrice,
        supplier: material.supplier?.name || 'Test Supplier',
        leadTime: 5,
        notes: 'Test material'
      }],
      notes: 'Test BOM created via script'
    };

    console.log('BOM data to send:', JSON.stringify(bomData, null, 2));

    const bomResponse = await axios.post('http://localhost:5000/api/bom', bomData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ BOM created successfully:', bomResponse.data);

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testBOMCreation();
