import { NextRequest, NextResponse } from 'next/server'
import { SuperglueClient } from '@superglue/client'

// Superglue client integration
class SuperglueMCPClient {
    private client: SuperglueClient
    private superglueKey: string

    constructor(superglueKey: string) {
        this.superglueKey = superglueKey
        this.client = new SuperglueClient({
            endpoint: "https://graphql.superglue.ai", // Use the correct GraphQL endpoint
            apiKey: superglueKey,
        })
    }

    async executeQuery(userPrompt: string): Promise<any> {
        try {
            // Minimal prompt enhancement
            const enhancedPrompt = `${userPrompt}

Please return results in JSON format suitable for visualization.`;

            // Use Superglue's buildWorkflow to execute the query
            const workflow = await this.client.buildWorkflow({
                instruction: enhancedPrompt,
                integrationIds: ['supabase_postgres-1'], // Your existing Supabase integration
                payload: {},
                responseSchema: {
                    type: "object",
                    properties: {
                        query: { type: "string" },
                        data: { type: "array" },
                        metadata: {
                            type: "object",
                            properties: {
                                rowCount: { type: "number" },
                                columns: { type: "array" },
                                dataTypes: { type: "array" },
                                executionTime: { type: "number" }
                            }
                        },
                        visualization: {
                            type: "object",
                            properties: {
                                suggestedCharts: { type: "array" },
                                chartConfig: { type: "object" }
                            }
                        }
                    }
                }
            })

            // Execute the built workflow
            const result = await this.client.executeWorkflow({
                workflow: workflow,
                payload: {},
                verbose: true
            })

            return result

        } catch (error) {
            console.error('Superglue query execution error:', error)
            throw error
        }
    }
}

// Enhanced system prompt with database context
const SYSTEM_PROMPT = `You are an AI assistant with access to Superglue tools for querying a business database.

DATABASE SCHEMA:
- auth.users: User authentication and profile data (id, email, created_at, etc.)
- public.basic_paying_flow: Payment processing events and user interactions
  * user_id: User identifier (text)
  * total_amount: Payment amount (double precision)
  * currency: Payment currency (text)
  * event_type: Type of payment event (text)
  * time: Event timestamp (timestamp)
  * merchant_name: Merchant name (text)
  * is_returning_user: Boolean indicating returning user
  * device_type: Device type (text)
  * language: User language (text)
  * user_location: User location (text)
- public.onchain_fiat_transaction: Cryptocurrency to fiat currency transactions
  * user_id: User identifier (text)
  * crypto_amount: Cryptocurrency amount (text)
  * fiat_amount: Fiat currency amount (double precision)
  * crypto_token: Cryptocurrency type (text)
  * fiat_currency: Fiat currency type (text)
  * timestamp: Transaction timestamp (timestamp)
  * user_tier: User tier level (text)
  * flow_type: Transaction flow type (text)
  * kyc_status: KYC verification status (text)

BUSINESS CONTEXT:
- "users" typically refers to unique user_id values in basic_paying_flow
- "revenue" refers to total_amount in basic_paying_flow
- "transactions" can mean either payment flows or crypto transactions
- "crypto volume" refers to crypto_amount in onchain_fiat_transaction
- "payment volume" refers to total_amount in basic_paying_flow
- "unique users" means COUNT(DISTINCT user_id)
- "returning users" refers to is_returning_user = true

RESPONSE FORMAT:
Always return results in this JSON structure:
{
  "query": "The SQL query executed",
  "data": [...], // The actual data rows
  "metadata": {
    "rowCount": number,
    "columns": [...], // Column names
    "dataTypes": [...], // Data types
    "executionTime": number // Query execution time in ms
  },
  "visualization": {
    "suggestedCharts": [...], // Suggested chart types
    "chartConfig": {...} // Chart configuration
  }
}

AGENT WORKFLOW:
1. DISCOVER: Use 'superglue_find_relevant_integrations' to find available integrations for your task.
2. PREPARE: If all needed integrations are found, continue with building and testing. If not, create the missing integrations with 'superglue_create_integration'.
3. BUILD & TEST: Use 'superglue_build_and_run' with instruction and integrations. Iterate until successful.
4. SAVE (Optional): Ask user if they want to save the workflow, then use 'superglue_save_workflow'.
5. EXECUTE: Use 'superglue_execute_workflow' for saved workflows.

BEST PRACTICES:
- Always start with 'superglue_find_relevant_integrations' for discovery.
- Create integrations and store credentials in integrations using 'superglue_create_integration'.
- For build_and_run, always add a response schema for fetching tasks to the request to get the correct data without fluff.
- Keep the response schema simple and aligned with the task.
- If build_and_run returns an error, use the error message to fix the workflow.
- Copy actual values from build_and_run results, don't assume fields are empty.
- Important: Be aware that the data you receive from workflows can be truncated - do not hallucinate or make assumptions about the whole data from the truncated snippet alone.

CAPABILITIES:
- Connect to any REST API, database, or web service
- Transform data between different formats and schemas
- Build custom tools from natural language instructions
- Generate production-ready code in TypeScript, Python, Go

Limitations:
- superglue always returns structured data as json.
- superglue does not handle the full oauth flow, so you need the user to get a valid token first.`;

// Request/Response types
interface MCPQueryRequest {
    prompt: string
    context?: Record<string, any>
}

interface MCPQueryResponse {
    prompt: string
    query?: string
    data: any[]
    metadata: {
        rowCount: number
        columns: string[]
        dataTypes: string[]
        executionTime: number
    }
    visualization: {
        suggestedCharts: string[]
        chartConfig: any
    }
    error?: string
}

export async function POST(request: NextRequest) {
    try {
        const body: MCPQueryRequest = await request.json()
        
        if (!body.prompt) {
            return NextResponse.json(
                { error: 'Prompt is required' },
                { status: 400 }
            )
        }

        // Validate API key
        const apiKey = process.env.SUPERGLUE_API_KEY
        if (!apiKey) {
            return NextResponse.json(
                { error: 'Superglue API key not configured. Please set SUPERGLUE_API_KEY environment variable.' },
                { status: 500 }
            )
        }

        const startTime = Date.now()
        
        // Create MCP client and execute query
        const mcpClient = new SuperglueMCPClient(apiKey)
        const results = await mcpClient.executeQuery(body.prompt)
        
        const executionTime = Date.now() - startTime

        // Process results and format response
        let response: MCPQueryResponse

        if (results && results.success && results.data) {
            try {
                // Try to parse the workflow result data
                const workflowData = results.data
                
                // Extract SQL query from workflow steps if available
                let actualQuery = "Generated SQL query"
                if (results.config && results.config.steps && results.config.steps.length > 0) {
                    // Look for SQL query in the workflow steps
                    const sqlStep = results.config.steps.find((step: any) => 
                        step.apiConfig && step.apiConfig.body && 
                        step.apiConfig.body.toLowerCase().includes('select')
                    )
                    if (sqlStep && sqlStep.apiConfig.body) {
                        try {
                            // Try to parse the body as JSON and extract the query
                            const bodyObj = JSON.parse(sqlStep.apiConfig.body)
                            actualQuery = bodyObj.query || sqlStep.apiConfig.body
                        } catch {
                            // If not JSON, use the body directly
                            actualQuery = sqlStep.apiConfig.body
                        }
                    }
                }
                
                response = {
                    prompt: body.prompt,
                    query: actualQuery,
                    data: workflowData.data || [],
                    metadata: {
                        rowCount: workflowData.metadata?.rowCount || 0,
                        columns: workflowData.metadata?.columns || [],
                        dataTypes: workflowData.metadata?.dataTypes || [],
                        executionTime: executionTime
                    },
                    visualization: {
                        suggestedCharts: workflowData.visualization?.suggestedCharts || ["table"],
                        chartConfig: workflowData.visualization?.chartConfig || {}
                    }
                }
            } catch (parseError) {
                // If parsing fails, treat as raw data
                response = {
                    prompt: body.prompt,
                    query: "Generated SQL query (parsing failed)",
                    data: Array.isArray(results.data) ? results.data : [{ result: results.data }],
                    metadata: {
                        rowCount: Array.isArray(results.data) ? results.data.length : 1,
                        columns: Array.isArray(results.data) && results.data.length > 0 ? Object.keys(results.data[0]) : ["result"],
                        dataTypes: Array.isArray(results.data) && results.data.length > 0 ? Object.values(results.data[0]).map(() => "string") : ["text"],
                        executionTime: executionTime
                    },
                    visualization: {
                        suggestedCharts: ["table"],
                        chartConfig: { type: "table" }
                    }
                }
            }
        } else if (results && !results.success) {
            return NextResponse.json(
                { error: `Workflow execution failed: ${results.error || 'Unknown error'}` },
                { status: 500 }
            )
        } else {
            // Handle case where no data was returned
            response = {
                prompt: body.prompt,
                data: [{ message: "No data available" }],
                metadata: {
                    rowCount: 1,
                    columns: ["message"],
                    dataTypes: ["text"],
                    executionTime: executionTime
                },
                visualization: {
                    suggestedCharts: ["text"],
                    chartConfig: { type: "text" }
                }
            }
        }

        return NextResponse.json(response)
        
    } catch (error) {
        console.error('MCP query API error:', error)
        return NextResponse.json(
            { 
                error: 'Failed to execute MCP query',
                details: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        )
    }
} 