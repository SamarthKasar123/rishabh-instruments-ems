const mongoose = require('mongoose');
const Material = require('./models/Material');
const User = require('./models/User');
require('dotenv').config();

const createSampleMaterials = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get an admin user to set as creator
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('No admin user found. Please create users first.');
      return;
    }

    // Clear existing materials
    await Material.deleteMany({});
    console.log('Cleared existing materials');

    // Sample materials data
    const sampleMaterials = [
      {
        name: 'Resistor 10K Ohm',
        description: 'Carbon film resistor, 1/4W, 5% tolerance',
        category: 'Electronic Components',
        subCategory: 'Resistors',
        unit: 'pcs',
        quantityAvailable: 500,
        minStockLevel: 100,
        maxStockLevel: 1000,
        unitPrice: 2.50,
        supplier: {
          name: 'Electronics Supply Co.',
          contact: '+91-9876543210',
          email: 'sales@electronicsupply.com',
          address: 'Electronic City, Bangalore'
        },
        location: {
          warehouse: 'WH-A',
          rack: 'R-01',
          bin: 'B-05'
        },
        qualityGrade: 'A',
        createdBy: adminUser._id
      },
      {
        name: 'Microcontroller ATmega328P',
        description: 'Low-power CMOS 8-bit microcontroller',
        category: 'Electronic Components',
        subCategory: 'Microcontrollers',
        unit: 'pcs',
        quantityAvailable: 50,
        minStockLevel: 20,
        maxStockLevel: 100,
        unitPrice: 180.00,
        supplier: {
          name: 'Microchip Distributors',
          contact: '+91-9876543211',
          email: 'orders@microchipdist.com',
          address: 'Tech Park, Pune'
        },
        location: {
          warehouse: 'WH-A',
          rack: 'R-02',
          bin: 'B-01'
        },
        qualityGrade: 'A',
        createdBy: adminUser._id
      },
      {
        name: 'Steel Sheet 2mm',
        description: 'Cold rolled steel sheet, 2mm thickness',
        category: 'Raw Materials',
        subCategory: 'Metal Sheets',
        unit: 'sheet',
        quantityAvailable: 25,
        minStockLevel: 10,
        maxStockLevel: 50,
        unitPrice: 1200.00,
        supplier: {
          name: 'Steel Industries Ltd.',
          contact: '+91-9876543212',
          email: 'sales@steelindustries.com',
          address: 'Industrial Area, Chennai'
        },
        location: {
          warehouse: 'WH-B',
          rack: 'R-10',
          bin: 'B-01'
        },
        qualityGrade: 'A',
        createdBy: adminUser._id
      },
      {
        name: 'Plastic Enclosure',
        description: 'ABS plastic enclosure, IP65 rated',
        category: 'Mechanical Parts',
        subCategory: 'Enclosures',
        unit: 'pcs',
        quantityAvailable: 15,
        minStockLevel: 25,
        maxStockLevel: 100,
        unitPrice: 450.00,
        supplier: {
          name: 'Plastic Solutions',
          contact: '+91-9876543213',
          email: 'info@plasticsolutions.com',
          address: 'Polymer Hub, Mumbai'
        },
        location: {
          warehouse: 'WH-A',
          rack: 'R-05',
          bin: 'B-03'
        },
        qualityGrade: 'B',
        createdBy: adminUser._id
      },
      {
        name: 'PCB Double Layer',
        description: 'FR4 PCB, 1.6mm thickness, double layer',
        category: 'Electronic Components',
        subCategory: 'PCBs',
        unit: 'pcs',
        quantityAvailable: 100,
        minStockLevel: 50,
        maxStockLevel: 200,
        unitPrice: 25.00,
        supplier: {
          name: 'PCB Manufacturing Co.',
          contact: '+91-9876543214',
          email: 'orders@pcbmanufacturing.com',
          address: 'Electronic Zone, Hyderabad'
        },
        location: {
          warehouse: 'WH-A',
          rack: 'R-03',
          bin: 'B-02'
        },
        qualityGrade: 'A',
        createdBy: adminUser._id
      }
    ];

    // Create materials
    for (const materialData of sampleMaterials) {
      const material = new Material(materialData);
      await material.save();
      console.log(`Created material: ${material.name} (${material.serialNumber})`);
    }

    console.log('\n✅ Sample materials created successfully!');
    console.log(`Total materials created: ${sampleMaterials.length}`);
    
  } catch (error) {
    console.error('❌ Error creating sample materials:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the script
createSampleMaterials();
