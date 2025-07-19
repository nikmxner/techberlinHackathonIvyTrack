const fetch = require('node-fetch');

async function testMCPRoute() {
    const baseUrl = 'http://localhost:3000';
    const endpoint = '/api/mcp-query';
    
    const testPrompts = [
        "How many unique users do we have?",
        "Show me the total revenue from payment flows",
        "What's the average transaction amount?",
        "How many crypto transactions do we have?"
    ];

    console.log('🧪 Testing MCP Query Route...\n');

    for (let i = 0; i < testPrompts.length; i++) {
        const prompt = testPrompts[i];
        console.log(`📝 Test ${i + 1}: "${prompt}"`);
        
        try {
            const response = await fetch(`${baseUrl}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt })
            });

            const data = await response.json();
            
            if (response.ok) {
                console.log('✅ Success!');
                console.log('📊 Response:');
                console.log(`   - Query: ${data.query || 'N/A'}`);
                console.log(`   - Row Count: ${data.metadata?.rowCount || 0}`);
                console.log(`   - Execution Time: ${data.metadata?.executionTime || 0}ms`);
                console.log(`   - Suggested Charts: ${data.visualization?.suggestedCharts?.join(', ') || 'N/A'}`);
                console.log(`   - Data Preview: ${JSON.stringify(data.data?.slice(0, 2) || [], null, 2)}`);
            } else {
                console.log('❌ Error:');
                console.log(`   - Status: ${response.status}`);
                console.log(`   - Message: ${data.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.log('❌ Network Error:');
            console.log(`   - ${error.message}`);
        }
        
        console.log(''); // Empty line for readability
    }
}

// Check if server is running
async function checkServer() {
    try {
        const response = await fetch('http://localhost:3000');
        if (response.ok) {
            console.log('✅ Server is running on http://localhost:3000');
            return true;
        }
    } catch (error) {
        console.log('❌ Server is not running. Please start it with: npm run dev');
        return false;
    }
}

async function main() {
    const serverRunning = await checkServer();
    if (serverRunning) {
        await testMCPRoute();
    }
}

main().catch(console.error); 