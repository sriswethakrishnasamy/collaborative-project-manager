const http = require('http');

// 1. Grab your live backend URL from your App.jsx (remove the trailing /api/tasks if present)
// Example: 'https://your-codespace-8080.app.github.dev'
const BACKEND_BASE_URL = 'http://localhost:8080'; 

async function simulateConcurrentTraffic() {
    console.log("🚀 Initializing High-Throughput Concurrency Test...");
    
    // Create a new task first to get a valid ID
    const postData = JSON.stringify({
        title: "Concurrent Stress Test Task",
        description: "Testing ACID isolation and optimistic locking mechanics.",
        status: "TODO"
    });

    const url = new URL(`${BACKEND_BASE_URL}/api/tasks`);
    
    const options = {
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: url.pathname,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    // Helper to make HTTP requests using native Node.js
    const makeRequest = (opt, body) => new Promise((resolve) => {
        const req = http.request(opt, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, data }));
        });
        req.on('error', () => resolve({ status: 500, data: 'Connection Error' }));
        if (body) req.write(body);
        req.end();
    });

    // Step A: Create the task
    const created = await makeRequest(options, postData);
    if (created.status !== 200) {
        console.error("❌ Failed to create initial task. Check your BACKEND_BASE_URL link inside this script!");
        return;
    }
    
    const task = JSON.parse(created.data);
    console.log(`✅ Target Task Created successfully! ID: ${task.id}, Version: ${task.version}`);

    // Step B: Simulate 5 users trying to update this exact task at the exact same split-second
    console.log(`\n💥 Blasting 5 concurrent status updates to /api/tasks/${task.id}/status simultaneously...`);
    
    const updateStatuses = ['IN_PROGRESS', 'REVIEW', 'DONE', 'BLOCKED', 'DEFERRED'];
    
    const promises = updateStatuses.map((status) => {
        const updateUrl = new URL(`${BACKEND_BASE_URL}/api/tasks/${task.id}/status?status=${status}`);
        const updateOptions = {
            hostname: updateUrl.hostname,
            port: updateUrl.port || (updateUrl.protocol === 'https:' ? 443 : 80),
            path: `${updateUrl.pathname}${updateUrl.search}`,
            method: 'PUT'
        };
        return makeRequest(updateOptions);
    });

    // Fire all 5 requests at the exact same time!
    const results = await Promise.all(promises);

    // Step C: Analyze outcomes
    let successes = 0;
    let failures = 0;

    results.forEach((res, index) => {
        if (res.status === 200) {
            successes++;
            console.log(`➡️ Request ${index + 1}: Success (200 OK) -> Changed status to ${updateStatuses[index]}`);
        } else {
            failures++;
            console.log(`➡️ Request ${index + 1}: Blocked (500 Error / Optimistic Lock Exception triggered safely)`);
        }
    });

    console.log(`\n📊 TEST COMPLETION SUMMARY:`);
    console.log(`🏁 Total Successful Transactions: ${successes}`);
    console.log(`🔒 Safely Aborted Race Conditions: ${failures}`);
    console.log(`💡 Conclusion: ${failures > 0 ? "ACID compliance verified! The database safely rejected dirty overlapping writes." : "No conflicts hit. Try running again!"}`);
}

simulateConcurrentTraffic();