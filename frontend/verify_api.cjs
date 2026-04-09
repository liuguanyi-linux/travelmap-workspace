
const axios = require('axios');

const API_URL = 'http://110.42.143.48/api';

async function verifyApi() {
  console.log('--- Verifying Backend API ---');

  try {
    // 1. List existing spots
    console.log('1. Fetching existing spots...');
    const listRes = await axios.get(`${API_URL}/spots`);
    console.log(`   Found ${listRes.data.length} spots.`);
    if (listRes.data.length > 0) {
      const firstSpot = listRes.data[0];
      console.log('   Sample Spot structure:', JSON.stringify(firstSpot, null, 2));
      
      // Check if tags is array
      if (Array.isArray(firstSpot.tags)) {
        console.log('   [PASS] Tags field is an Array.');
      } else {
        console.error('   [FAIL] Tags field is NOT an Array:', typeof firstSpot.tags);
      }
    }

    // 2. Create a test shopping spot
    console.log('\n2. Creating test shopping spot...');
    const testSpot = {
      name: "Test Shopping Mall " + Date.now(),
      content: "A test shopping mall content", // Use content, not description
      address: "123 Test St",
      city: "青岛",
      tags: ["shopping", "test"],
      photos: ["http://example.com/photo.jpg"],
      videos: [],
      reviews: [], // Send empty array as frontend does
      location: { lng: 120.38, lat: 36.06 },
      lng: 120.38,
      lat: 36.06
    };

    const createRes = await axios.post(`${API_URL}/spots`, testSpot);
    console.log('   Create response status:', createRes.status);
    console.log('   Created Spot:', JSON.stringify(createRes.data, null, 2));
    
    if (Array.isArray(createRes.data.tags)) {
       console.log('   [PASS] Created spot tags is Array.');
    } else {
       console.error('   [FAIL] Created spot tags is NOT Array:', typeof createRes.data.tags);
    }

    const newSpotId = createRes.data.id;

    // 3. Verify it appears in list
    console.log('\n3. Verifying new spot in list...');
    const listRes2 = await axios.get(`${API_URL}/spots`);
    const found = listRes2.data.find(s => s.id === newSpotId);
    
    if (found) {
        console.log('   [PASS] New spot found in list.');
        if (Array.isArray(found.tags)) {
            console.log('   [PASS] List item tags is Array.');
             // Check if "shopping" tag is present
             if (found.tags.includes('shopping')) {
                 console.log('   [PASS] "shopping" tag is present.');
             } else {
                 console.error('   [FAIL] "shopping" tag missing.');
             }
        } else {
            console.error('   [FAIL] List item tags is NOT Array.');
        }
    } else {
        console.error('   [FAIL] New spot NOT found in list.');
    }

    // 4. Delete test spot
    console.log('\n4. Deleting test spot...');
    await axios.delete(`${API_URL}/spots/${newSpotId}`);
    console.log('   [PASS] Deleted test spot.');

  } catch (error) {
    console.error('Error verifying API:', error.message);
    if (error.response) {
        console.error('Response data:', error.response.data);
    }
  }
}

verifyApi();
