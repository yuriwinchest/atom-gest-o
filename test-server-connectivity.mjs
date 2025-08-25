import http from 'http';

console.log('🔍 Testing server connectivity...');

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'GET',
      timeout: 5000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => reject(new Error('Request timeout')));
    req.end();
  });
}

async function testServer() {
  try {
    console.log('Testing main route (/)...');
    const response = await makeRequest('/');

    console.log('✅ Main route status:', response.status);
    console.log('✅ Content-Type:', response.headers['content-type']);

    if (response.status === 200) {
      console.log('✅ Response length:', response.data.length);
      console.log('✅ Response preview:', response.data.substring(0, 200) + '...');
    } else {
      console.log('❌ Response data:', response.data);
    }

  } catch (error) {
    console.error('❌ Error testing main route:', error.message);
  }

  try {
    console.log('\nTesting API route (/api/documents/category-counts)...');
    const apiResponse = await makeRequest('/api/documents/category-counts');

    console.log('✅ API route status:', apiResponse.status);

    if (apiResponse.status === 200) {
      try {
        const data = JSON.parse(apiResponse.data);
        console.log('✅ API response:', data);
      } catch (e) {
        console.log('✅ API raw response:', apiResponse.data);
      }
    } else {
      console.log('❌ API error response:', apiResponse.data);
    }

  } catch (error) {
    console.error('❌ Error testing API route:', error.message);
  }
}

testServer();