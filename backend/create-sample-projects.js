require('dotenv').config();
const mongoose = require('mongoose');
const Project = require('./models/Project');
const User = require('./models/User');

async function createSampleProjects() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rishabh-instruments');
    console.log('Connected to MongoDB');

    // Find a user to assign as project creator
    const adminUser = await User.findOne({ email: 'admin@rishabh.co.in' });
    if (!adminUser) {
      console.log('❌ Admin user not found. Please create users first.');
      return;
    }

    // Check if projects already exist
    const existingProjects = await Project.countDocuments();
    if (existingProjects > 0) {
      console.log('✅ Projects already exist. Skipping creation.');
      return;
    }

    const sampleProjects = [
      {
        projectName: 'Digital Multimeter Enhancement',
        description: 'Upgrade existing digital multimeter with new features and improved accuracy',
        department: 'MID',
        projectType: 'Development',
        status: 'In Progress',
        priority: 'High',
        startDate: new Date('2025-01-01'),
        expectedEndDate: new Date('2025-06-30'),
        budget: {
          allocated: 500000,
          spent: 125000
        },
        projectManager: adminUser._id,
        teamMembers: [
          {
            user: adminUser._id,
            role: 'Lead',
            assignedDate: new Date('2025-01-01')
          }
        ],
        createdBy: adminUser._id
      },
      {
        projectName: 'CAM Switch Automation System',
        description: 'Automated testing system for CAM switch quality control',
        department: 'CAM Switch',
        projectType: 'Automation',
        status: 'Planning',
        priority: 'Medium',
        startDate: new Date('2025-02-15'),
        expectedEndDate: new Date('2025-08-15'),
        budget: {
          allocated: 750000,
          spent: 0
        },
        projectManager: adminUser._id,
        teamMembers: [
          {
            user: adminUser._id,
            role: 'Lead',
            assignedDate: new Date('2025-02-15')
          }
        ],
        createdBy: adminUser._id
      },
      {
        projectName: 'Transducer Calibration Equipment',
        description: 'New equipment for precise transducer calibration and testing',
        department: 'Transducer',
        projectType: 'Testing',
        status: 'Planning',
        priority: 'High',
        startDate: new Date('2025-03-01'),
        expectedEndDate: new Date('2025-09-30'),
        budget: {
          allocated: 1200000,
          spent: 0
        },
        projectManager: adminUser._id,
        teamMembers: [
          {
            user: adminUser._id,
            role: 'Lead',
            assignedDate: new Date('2025-03-01')
          }
        ],
        createdBy: adminUser._id
      },
      {
        projectName: 'Power Quality Analyzer Upgrade',
        description: 'Software and hardware upgrade for power quality analyzers',
        department: 'PQ',
        projectType: 'Development',
        status: 'In Progress',
        priority: 'Medium',
        startDate: new Date('2024-12-01'),
        expectedEndDate: new Date('2025-05-31'),
        budget: {
          allocated: 800000,
          spent: 320000
        },
        projectManager: adminUser._id,
        teamMembers: [
          {
            user: adminUser._id,
            role: 'Lead',
            assignedDate: new Date('2024-12-01')
          }
        ],
        createdBy: adminUser._id
      },
      {
        projectName: 'SMT Line Maintenance System',
        description: 'Preventive maintenance tracking system for SMT production line',
        department: 'SMT',
        projectType: 'Maintenance',
        status: 'Completed',
        priority: 'Low',
        startDate: new Date('2024-10-01'),
        expectedEndDate: new Date('2024-12-31'),
        actualEndDate: new Date('2024-12-20'),
        budget: {
          allocated: 300000,
          spent: 285000
        },
        projectManager: adminUser._id,
        teamMembers: [
          {
            user: adminUser._id,
            role: 'Lead',
            assignedDate: new Date('2024-10-01')
          }
        ],
        createdBy: adminUser._id
      }
    ];

    // Auto-generate project IDs
    for (let i = 0; i < sampleProjects.length; i++) {
      const count = await Project.countDocuments();
      sampleProjects[i].projectId = `PROJ-${String(count + i + 1).padStart(6, '0')}`;
    }

    const createdProjects = await Project.insertMany(sampleProjects);
    console.log(`✅ Created ${createdProjects.length} sample projects:`);
    createdProjects.forEach(project => {
      console.log(`   - ${project.projectId}: ${project.projectName} (${project.department})`);
    });

  } catch (error) {
    console.error('❌ Error creating sample projects:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createSampleProjects();
