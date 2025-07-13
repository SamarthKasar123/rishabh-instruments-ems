const axios = require('axios');

const testMaterialCreation = async () => {
  try {
    // Step 1: Login to get token
    console.log('Step 1: Logging in...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@rishabh.co.in',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful, token received');
    
    // Step 2: Test GET materials
    console.log('\nStep 2: Testing GET materials...');
    const getMaterialsResponse = await axios.get('http://localhost:5000/api/materials', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ GET materials successful, count:', getMaterialsResponse.data.materials.length);
    
    // Step 3: Test POST material creation
    console.log('\nStep 3: Testing POST material creation...');
    const testMaterial = {
      name: 'Test Material',
      description: 'This is a test material',
      category: 'Electronic Components',
      subCategory: 'Test Components',
      unit: 'pcs',
      quantityAvailable: 100,
      minStockLevel: 20,
      maxStockLevel: 200,
      unitPrice: 15.50,
      supplier: {
        name: 'Test Supplier',
        contact: '+91-9876543210',
        email: 'test@supplier.com',
        address: 'Test Address'
      },
      location: {
        warehouse: 'WH-TEST',
        rack: 'R-01',
        bin: 'B-01'
      },
      qualityGrade: 'A'
    };
    
    const createResponse = await axios.post('http://localhost:5000/api/materials', testMaterial, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Material creation successful!');
    console.log('Created material:', createResponse.data.material.name);
    console.log('Serial number:', createResponse.data.material.serialNumber);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
};

testMaterialCreation();
