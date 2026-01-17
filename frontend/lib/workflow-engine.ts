/**
 * Workflow Execution Engine
 * 
 * Simulates execution of workflow nodes with realistic timing and outputs
 * Includes Sentinel Policy Enforcement to block execution during CRITICAL states
 */

import { Workflow, ExecutionLogEntry, WorkflowNode, APPLET_DEFINITIONS } from './workflow-types';

/**
 * Execute a workflow and return execution log
 * 
 * @param workflow - Workflow to execute
 * @param protocolStatus - Current protocol status from Sentinel ('OPTIMAL' or 'CRITICAL')
 */
export async function executeWorkflow(
  workflow: Workflow, 
  protocolStatus?: 'OPTIMAL' | 'CRITICAL'
): Promise<ExecutionLogEntry> {
  const startTime = Date.now();
  const nodeExecutions: ExecutionLogEntry['nodeExecutions'] = [];

  console.log('🚀 Starting workflow execution:', workflow.name);
  console.log('🛡️ Protocol Status:', protocolStatus || 'UNKNOWN');

  // SENTINEL POLICY ENFORCEMENT
  // Block execution if protocol is in CRITICAL state
  if (protocolStatus === 'CRITICAL') {
    console.error('❌ EXECUTION BLOCKED: Protocol in CRITICAL state');
    
    const blockedExecution = {
      nodeId: 'POLICY_ENFORCEMENT',
      nodeName: '[SENTINEL_POLICY]',
      status: 'failed' as const,
      startTime,
      endTime: Date.now(),
      output: null,
      error: '[BLOCKED] Execution halted by Sentinel Policy: CRITICAL STATE. Workflow cannot execute while protocol security is compromised.',
    };

    return {
      id: `exec_${Date.now()}`,
      workflowId: workflow.id,
      workflowName: workflow.name,
      timestamp: startTime,
      nodeExecutions: [blockedExecution],
      totalDuration: Date.now() - startTime,
      status: 'failed',
    };
  }

  // Find entry node (node with no incoming connections)
  const incomingConnections = new Set(workflow.connections.map(c => c.to));
  const entryNodes = workflow.nodes.filter(n => !incomingConnections.has(n.id));

  if (entryNodes.length === 0 && workflow.nodes.length > 0) {
    // If all nodes have incoming connections, start with the first one
    entryNodes.push(workflow.nodes[0]);
  }

  // Execute nodes starting from entry points
  const executedNodes = new Set<string>();
  
  for (const entryNode of entryNodes) {
    await executeNode(entryNode, workflow, nodeExecutions, executedNodes);
  }

  const totalDuration = Date.now() - startTime;

  const log: ExecutionLogEntry = {
    id: `exec_${Date.now()}`,
    workflowId: workflow.id,
    workflowName: workflow.name,
    timestamp: startTime,
    nodeExecutions,
    totalDuration,
    status: nodeExecutions.some(n => n.status === 'failed') ? 'failed' : 'completed',
  };

  console.log('✅ Workflow execution completed:', log);

  return log;
}

/**
 * Execute a single node and its connected nodes
 */
async function executeNode(
  node: WorkflowNode,
  workflow: Workflow,
  executions: ExecutionLogEntry['nodeExecutions'],
  executedNodes: Set<string>
): Promise<void> {
  // Skip if already executed
  if (executedNodes.has(node.id)) {
    return;
  }

  const nodeStart = Date.now();
  const definition = APPLET_DEFINITIONS[node.type];

  console.log(`  ⚡ Executing node: ${definition.name} (${node.type})`);

  // Simulate execution time
  const executionTime = 300 + Math.random() * 700; // 300-1000ms
  await new Promise(resolve => setTimeout(resolve, executionTime));

  // Check condition
  let shouldExecute = true;
  if (node.condition && node.condition.type !== 'always') {
    shouldExecute = evaluateCondition(node.condition);
    console.log(`    🔍 Condition evaluated: ${shouldExecute}`);
  }

  // Generate mock output based on applet type
  const output = shouldExecute ? generateMockOutput(node.type) : null;

  const execution = {
    nodeId: node.id,
    nodeName: definition.name,
    status: shouldExecute ? ('success' as const) : ('skipped' as const),
    startTime: nodeStart,
    endTime: Date.now(),
    output,
  };

  executions.push(execution);
  executedNodes.add(node.id);

  // Execute connected nodes
  if (shouldExecute) {
    const connectedNodes = workflow.connections
      .filter(c => c.from === node.id)
      .map(c => workflow.nodes.find(n => n.id === c.to))
      .filter((n): n is WorkflowNode => n !== undefined);

    for (const connectedNode of connectedNodes) {
      await executeNode(connectedNode, workflow, executions, executedNodes);
    }
  }
}

/**
 * Evaluate a condition
 */
function evaluateCondition(condition: NonNullable<WorkflowNode['condition']>): boolean {
  // Simulate condition evaluation with mock data
  const mockDSI = 420 + Math.random() * 100; // 420-520%
  const mockPrice = 0.98 + Math.random() * 0.04; // $0.98-$1.02

  switch (condition.type) {
    case 'dsi_below':
      return mockDSI < (condition.value || 400);
    case 'dsi_above':
      return mockDSI > (condition.value || 500);
    case 'price_below':
      return mockPrice < (condition.value || 0.95);
    case 'price_above':
      return mockPrice > (condition.value || 1.05);
    case 'always':
      return true;
    default:
      return true;
  }
}

/**
 * Generate mock output data based on applet type
 */
function generateMockOutput(appletType: string): any {
  const timestamp = Date.now();

  switch (appletType) {
    case 'djed_monitor':
      return {
        reserveRatio: 465 + Math.random() * 50,
        djedSupply: '1,234,567',
        reserveBalance: '5,678,901',
        status: 'OPTIMAL',
        timestamp,
      };

    case 'djed_sim':
      return {
        scenario: 'Price Shock -10%',
        projectedRatio: 420,
        risk: 'MEDIUM',
        recommendation: 'Increase reserves by 5%',
        timestamp,
      };

    case 'djed_sentinel':
      return {
        threatLevel: Math.random() > 0.7 ? 'CRITICAL' : 'NORMAL',
        stressTestResult: 'PASSED',
        vulnerabilities: Math.floor(Math.random() * 3),
        timestamp,
      };

    case 'djed_ledger':
      return {
        transactions: Math.floor(Math.random() * 50) + 10,
        volume: `${(Math.random() * 1000).toFixed(2)} ADA`,
        largestTx: `${(Math.random() * 100).toFixed(2)} ADA`,
        timestamp,
      };

    case 'djed_arbitrage':
      return {
        opportunities: Math.floor(Math.random() * 5),
        bestSpread: `${(Math.random() * 2).toFixed(2)}%`,
        potentialProfit: `${(Math.random() * 50).toFixed(2)} ADA`,
        timestamp,
      };

    default:
      return { status: 'executed', timestamp };
  }
}

/**
 * Get execution history from localStorage
 */
export function getExecutionHistory(): ExecutionLogEntry[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem('workflow_executions');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Clear execution history
 */
export function clearExecutionHistory(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('workflow_executions');
}
