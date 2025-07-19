const { NextRequest } = require('next/server');

// Mock the Superglue client
jest.mock('@superglue/client', () => {
    return {
        SuperglueClient: jest.fn().mockImplementation(() => ({
            buildWorkflow: jest.fn().mockResolvedValue({
                id: 'test-workflow',
                steps: [],
                integrationIds: ['supabase_postgres-1']
            }),
            executeWorkflow: jest.fn().mockResolvedValue({
                success: true,
                data: {
                    query: "SELECT COUNT(DISTINCT user_id) FROM public.basic_paying_flow",
                    data: [{ user_count: 17974 }],
                    metadata: {
                        rowCount: 1,
                        columns: ["user_count"],
                        dataTypes: ["integer"]
                    },
                    visualization: {
                        suggestedCharts: ["metric", "table"],
                        chartConfig: { type: "metric" }
                    }
                },
                startedAt: new Date(),
                completedAt: new Date()
            })
        }))
    };
});

// Mock environment variables
process.env.SUPERGLUE_API_KEY = 'test-api-key';
process.env.GRAPHQL_ENDPOINT = 'https://api.superglue.ai/graphql';

describe('MCP Query Route', () => {
    let route;

    beforeAll(async () => {
        // Import the route dynamically
        const module = await import('../src/app/api/mcp-query/route.ts');
        route = module.POST;
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should return 400 for missing prompt', async () => {
        const request = new NextRequest('http://localhost:3000/api/mcp-query', {
            method: 'POST',
            body: JSON.stringify({})
        });

        const response = await route(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Prompt is required');
    });

    test('should return 500 for missing API key', async () => {
        // Temporarily remove API key
        const originalKey = process.env.SUPERGLUE_API_KEY;
        delete process.env.SUPERGLUE_API_KEY;

        const request = new NextRequest('http://localhost:3000/api/mcp-query', {
            method: 'POST',
            body: JSON.stringify({ prompt: 'How many users do we have?' })
        });

        const response = await route(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toContain('Superglue API key not configured');

        // Restore API key
        process.env.SUPERGLUE_API_KEY = originalKey;
    });

    test('should successfully process a valid query', async () => {
        const request = new NextRequest('http://localhost:3000/api/mcp-query', {
            method: 'POST',
            body: JSON.stringify({ prompt: 'How many unique users do we have?' })
        });

        const response = await route(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toHaveProperty('query');
        expect(data).toHaveProperty('data');
        expect(data).toHaveProperty('metadata');
        expect(data).toHaveProperty('visualization');
        expect(data.metadata.rowCount).toBe(1);
        expect(data.data).toHaveLength(1);
        expect(data.data[0]).toHaveProperty('user_count');
    });

    test('should handle workflow execution errors', async () => {
        const { SuperglueClient } = require('@superglue/client');
        const mockClient = SuperglueClient.mock.instances[0];
        
        mockClient.executeWorkflow.mockRejectedValueOnce(new Error('Workflow execution failed'));

        const request = new NextRequest('http://localhost:3000/api/mcp-query', {
            method: 'POST',
            body: JSON.stringify({ prompt: 'How many users do we have?' })
        });

        const response = await route(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe('Failed to execute MCP query');
    });

    test('should handle workflow build errors', async () => {
        const { SuperglueClient } = require('@superglue/client');
        const mockClient = SuperglueClient.mock.instances[0];
        
        mockClient.buildWorkflow.mockRejectedValueOnce(new Error('Build failed'));

        const request = new NextRequest('http://localhost:3000/api/mcp-query', {
            method: 'POST',
            body: JSON.stringify({ prompt: 'How many users do we have?' })
        });

        const response = await route(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe('Failed to execute MCP query');
    });
}); 