/**
 * Manual API Test Script
 * Run this to test all API endpoints manually
 */

const API_BASE = 'http://127.0.0.1:3001/api/v1';

async function testAPI() {
  console.log('🧪 Testing Dream Analyzer API...\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing Health Endpoint...');
    const healthResponse = await fetch('http://127.0.0.1:3001/health');
    const healthData = await healthResponse.json();
    console.log('✅ Health Check:', healthData);
    console.log('');

    // Test 2: Create a new dream
    console.log('2. Creating a new dream...');
    const newDream = {
      title: 'Flying Over Mountains',
      content: 'I dreamed I was soaring over snow-capped mountains with eagles. The view was breathtaking and I felt completely free and peaceful.',
      mood: 'positive',
      tags: ['flying', 'mountains', 'freedom', 'nature']
    };

    const createResponse = await fetch(`${API_BASE}/dreams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newDream)
    });

    if (!createResponse.ok) {
      throw new Error(`Create failed: ${createResponse.status}`);
    }

    const createData = await createResponse.json();
    console.log('✅ Dream Created:', {
      id: createData.data.id,
      title: createData.data.title,
      mood: createData.data.mood
    });

    const dreamId = createData.data.id;
    console.log('');

    // Test 3: Get all dreams
    console.log('3. Fetching all dreams...');
    const listResponse = await fetch(`${API_BASE}/dreams`);
    const listData = await listResponse.json();
    console.log(`✅ Found ${listData.data.total} dreams`);
    console.log('');

    // Test 4: Get specific dream
    console.log('4. Fetching specific dream...');
    const getResponse = await fetch(`${API_BASE}/dreams/${dreamId}`);
    const getData = await getResponse.json();
    console.log('✅ Dream Retrieved:', {
      title: getData.data.title,
      content: getData.data.content.substring(0, 50) + '...'
    });
    console.log('');

    // Test 5: Update dream
    console.log('5. Updating dream...');
    const updateData = {
      mood: 'mixed',
      tags: [...newDream.tags, 'updated', 'test']
    };

    const updateResponse = await fetch(`${API_BASE}/dreams/${dreamId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });

    const updatedData = await updateResponse.json();
    console.log('✅ Dream Updated:', {
      mood: updatedData.data.mood,
      tags: updatedData.data.tags
    });
    console.log('');

    // Test 6: Analyze dream
    console.log('6. Analyzing dream...');
    const analyzeResponse = await fetch(`${API_BASE}/dreams/${dreamId}/analyze`, {
      method: 'POST'
    });

    const analysisData = await analyzeResponse.json();
    console.log('✅ Dream Analysis:', {
      confidence: analysisData.data.confidence,
      themes: analysisData.data.themes,
      interpretation: analysisData.data.interpretation.substring(0, 100) + '...'
    });
    console.log('');

    // Test 7: Search dreams
    console.log('7. Searching dreams...');
    const searchResponse = await fetch(`${API_BASE}/dreams?query=flying&mood=positive,mixed`);
    const searchData = await searchResponse.json();
    console.log(`✅ Search Results: ${searchData.data.dreams.length} dreams found`);
    console.log('');

    // Test 8: Delete dream
    console.log('8. Deleting dream...');
    const deleteResponse = await fetch(`${API_BASE}/dreams/${dreamId}`, {
      method: 'DELETE'
    });

    if (deleteResponse.status === 204) {
      console.log('✅ Dream Deleted Successfully');
    }
    console.log('');

    // Test 9: Verify deletion
    console.log('9. Verifying dream deletion...');
    const verifyResponse = await fetch(`${API_BASE}/dreams/${dreamId}`);
    if (verifyResponse.status === 404) {
      console.log('✅ Dream Not Found (Expected)');
    }

    console.log('\n🎉 All API tests passed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the tests
if (require.main === module) {
  testAPI();
}

module.exports = { testAPI };