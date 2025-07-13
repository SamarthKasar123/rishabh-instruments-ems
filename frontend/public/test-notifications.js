// Simple test to check if notifications are working
// Run this in browser console while logged in

async function testNotifications() {
  try {
    console.log('🔍 Testing notification system...');
    
    // Check if we have auth token
    const token = localStorage.getItem('authToken');
    console.log('Auth token exists:', !!token);
    
    if (!token) {
      console.log('❌ No auth token found. Please log in first.');
      return;
    }
    
    // Test API call
    const response = await fetch('http://localhost:5000/api/dashboard/alerts', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      }
    });
    
    console.log('API Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('📊 Notification data received:', data);
      
      const totalNotifications = 
        data.lowStock.length + 
        data.overdueMaintenance.length + 
        data.upcomingMaintenance.length + 
        data.overdueTasks.length;
      
      console.log(`📱 Total notifications: ${totalNotifications}`);
      
      if (totalNotifications > 0) {
        console.log('✅ Notifications should be visible!');
        console.log('🔄 Try refreshing the page or clicking the notification icon');
      } else {
        console.log('❌ No notifications returned from API');
      }
    } else {
      const error = await response.text();
      console.log('❌ API Error:', error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testNotifications();
