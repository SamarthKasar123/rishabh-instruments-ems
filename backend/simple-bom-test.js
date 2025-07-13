require('dotenv').config();
const axios = require('axios');

async function testBOMCreation() {
  try {
    console.log('Testing BOM API endpoints...');
    
    // First, test login
    console.log('\n1. Testing login...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@rishabh.co.in',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful');

    // Test get BOMs
    console.log('\n2. Testing GET BOMs...');
    const getResponse = await axios.get('http://localhost:5000/api/bom', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ GET BOMs successful, count:', getResponse.data.boms?.length || 0);

    // Test get Projects 
    console.log('\n3. Testing GET Projects...');
    const projectsResponse = await axios.get('http://localhost:5000/api/projects', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ GET Projects successful, count:', projectsResponse.data.projects?.length || 0);
    
    if (projectsResponse.data.projects?.length === 0) {
      console.log('❌ No projects found. Cannot create BOM without projects.');
      return;
    }

    // Test get Materials
    console.log('\n4. Testing GET Materials...');
    const materialsResponse = await axios.get('http://localhost:5000/api/materials', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ GET Materials successful, count:', materialsResponse.data.materials?.length || 0);

    if (materialsResponse.data.materials?.length === 0) {
      console.log('❌ No materials found. Cannot create BOM without materials.');
      return;
    }

    // Create a test BOM
    console.log('\n5. Testing POST BOM creation...');
    const testBOM = {
      project: projectsResponse.data.projects[0]._id,
      version: '1.0',
      materials: [
        {
          material: materialsResponse.data.materials[0]._id,
          quantity: 2,
          unit: materialsResponse.data.materials[0].unit,
          unitCost: materialsResponse.data.materials[0].unitPrice,
          supplier: materialsResponse.data.materials[0].supplier?.name || 'Test Supplier',
          leadTime: 5,
          notes: 'Test material for BOM'
        }
      ],
      notes: 'Test BOM created via API test'
    };

    console.log('BOM data to send:', JSON.stringify(testBOM, null, 2));

    const createResponse = await axios.post('http://localhost:5000/api/bom', testBOM, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ BOM created successfully!');
    console.log('BOM ID:', createResponse.data.bom.bomId);
    console.log('Total Cost:', createResponse.data.bom.totalCost);

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    console.log('Status:', error.response?.status);
    console.log('Full error:', error.response?.data);
  }
}

testBOMCreation();
