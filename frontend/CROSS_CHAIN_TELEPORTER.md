# Cross-Chain Teleporter - Multi-Chain Workflow Orchestration

## Overview

The **Cross-Chain Teleporter** enables seamless execution of workflows across multiple blockchain networks (Ethereum, WeilChain, Solana) with intelligent auto-bridging and chain mismatch detection.

### Key Features
- ✅ **Multi-Chain Support**: Execute workflows across Ethereum, WeilChain, and Solana
- ✅ **Auto-Fix Chain Mismatches**: Automatically insert bridge nodes when connecting cross-chain
- ✅ **Visual Chain Indicators**: Color-coded badges show which chain each node runs on
- ✅ **Portal-Style Bridge Node**: Distinctive circular teleporter with gradient animations
- ✅ **Simulation Support**: Temporal debugger includes bridging steps with delay estimates

---

## Architecture

### Chain Configuration System

**Location**: `lib/workflow-types.ts`

#### Supported Chains

```typescript
type Chain = 'ethereum' | 'weilchain' | 'solana';

const CHAIN_CONFIGS = {
  ethereum: {
    id: 'ethereum',
    name: 'Ethereum',
    icon: '🔷',
    color: '#627EEA',
    nativeToken: 'ETH',
    blockTime: 12, // seconds
    bridgeEnabled: true,
  },
  weilchain: {
    id: 'weilchain',
    name: 'WeilChain',
    icon: '💎',
    color: '#39FF14',
    nativeToken: 'WEIL',
    blockTime: 2, // seconds
    bridgeEnabled: true,
  },
  solana: {
    id: 'solana',
    name: 'Solana',
    icon: '◆',
    color: '#9945FF',
    nativeToken: 'SOL',
    blockTime: 0.4, // seconds
    bridgeEnabled: true,
  },
};
```

#### Bridge Configuration

```typescript
interface BridgeConfig {
  sourceChain: Chain;
  destinationChain: Chain;
  tokens: string[]; // e.g., ['USDC', 'ETH']
  estimatedTime: number; // seconds
  fee: number; // USD
  status: 'pending' | 'bridging' | 'completed' | 'failed';
}
```

---

## Component Architecture

### 1. TeleportNode Component

**Location**: `components/nodes/TeleportNode.tsx`

#### Purpose
Specialized bridge node with portal aesthetic for cross-chain asset transfers.

#### Visual Design
- **Shape**: Circular (200px diameter) - distinct from rectangular workflow nodes
- **Border**: Rotating gradient border (`from-purple-500 via-pink-500 to-purple-500`)
- **Color**: Magenta/purple (#FF00FF)
- **Animation**: Rotates when `bridgeStatus === 'bridging'`
- **Particle Effects**: 8 particles emanate from center during bridging

#### Key Props

```typescript
interface TeleportNodeProps {
  nodeId: string;
  sourceChain?: Chain;
  destinationChain?: Chain;
  tokenSymbol?: string; // e.g., 'USDC'
  amount?: number;
  bridgeStatus?: 'pending' | 'bridging' | 'completed' | 'failed';
  estimatedTime?: number; // seconds
  fee?: number; // USD
  onConfigChange?: (config: {...}) => void;
  isSelected?: boolean;
  isActive?: boolean; // Used during simulation
}
```

#### Configuration Modal
- **Source Chain Selector**: Dropdown with all supported chains
- **Destination Chain Selector**: Dropdown with all supported chains
- **Token Symbol**: Input for token to bridge (default: USDC)
- **Amount**: Numeric input for transfer amount
- **Estimates Display**: Shows estimated time and bridge fee

#### Status Display
- **Pending**: ⏱️ "Ready to Bridge" (gold)
- **Bridging**: ⚡ "Bridging... (5m 0s)" (magenta, animated)
- **Completed**: ⚡ "Bridge Complete" (green)
- **Failed**: ⚠️ "Bridge Failed" (red)

---

### 2. WorkflowNode Chain Badges

**Location**: `components/WorkflowNode.tsx`

#### Chain Badge Display
Each workflow node shows a small badge in the top-right corner indicating which blockchain it runs on:

```tsx
<div
  className="flex items-center gap-1 rounded px-2 py-1 text-[10px]"
  style={{
    backgroundColor: chainConfig.color + '15',
    borderColor: chainConfig.color,
    color: chainConfig.color,
    boxShadow: `0 0 8px ${chainConfig.color}40`,
  }}
>
  <span>{chainConfig.icon}</span>
  <span>{chainConfig.name.toUpperCase()}</span>
</div>
```

#### Default Chain Assignment
- All existing nodes default to **WeilChain** if no chain specified
- New node types have `defaultChain` property in `APPLET_DEFINITIONS`:
  - `eth_wallet`: Ethereum
  - `sol_wallet`: Solana
  - `teleport_bridge`: WeilChain (can bridge from/to any chain)
  - Standard applets: WeilChain

---

### 3. WorkflowBuilder Chain Mismatch Detection

**Location**: `components/WorkflowBuilder.tsx`

#### Detection Logic

```typescript
function detectChainMismatch(fromNode, toNode) {
  const fromChain = fromNode.chain || 
    APPLET_DEFINITIONS[fromNode.type].defaultChain || 
    'weilchain';
  const toChain = toNode.chain || 
    APPLET_DEFINITIONS[toNode.type].defaultChain || 
    'weilchain';
  
  return {
    mismatch: fromChain !== toChain,
    sourceChain: fromChain,
    destChain: toChain,
  };
}
```

#### Auto-Detection System
- **useEffect Hook**: Runs whenever `connections` or `nodes` change
- **Tracking**: Stores mismatched connections in `Set<string>` (format: `"fromId->toId"`)
- **Real-time**: Updates immediately when nodes are connected

#### Visual Indicators
Mismatched connections display:
1. **Red dashed line** instead of green solid line
2. **Warning badge** at connection midpoint:
   - Background: Black with red border
   - Text: "⚠ CHAIN MISMATCH"
   - Chain icons: Shows source → destination
3. **Auto-Fix button**: Green button labeled "🌀 INSERT BRIDGE"

---

## Auto-Fix System

### User Experience Flow

1. **User Connects Nodes**: Drags connection from Ethereum node to WeilChain node
2. **System Detects**: `useEffect` identifies chain mismatch immediately
3. **Visual Warning**: Red dashed line appears with warning badge
4. **User Clicks Auto-Fix**: Clicks "🌀 INSERT BRIDGE" button
5. **Bridge Insertion**: System automatically:
   - Creates new TeleportNode positioned between nodes
   - Removes direct connection
   - Adds two new connections: `from → bridge` and `bridge → to`
   - Configures bridge with correct source/destination chains
6. **Confirmation**: Alert shows bridge details (chains, time, fee)

### Auto-Fix Implementation

```typescript
const autoFixChainMismatch = useCallback((fromNodeId, toNodeId) => {
  const fromNode = nodes.find(n => n.id === fromNodeId);
  const toNode = nodes.find(n => n.id === toNodeId);
  
  if (!fromNode || !toNode) return;
  
  const { sourceChain, destChain } = detectChainMismatch(fromNode, toNode);
  
  // Create bridge node at midpoint
  const bridgeNode: WorkflowNode = {
    id: `bridge_${Date.now()}`,
    type: 'teleport_bridge',
    name: 'Teleporter',
    position: {
      x: (fromNode.position.x + toNode.position.x) / 2,
      y: (fromNode.position.y + toNode.position.y) / 2,
    },
    outputs: [toNodeId],
    chain: 'weilchain',
    bridgeConfig: {
      sourceChain,
      destinationChain: destChain,
      tokens: ['USDC'],
      estimatedTime: 300, // 5 minutes
      fee: 2.5,
      status: 'pending',
    },
  };
  
  // Update state
  setNodes(prev => [...prev, bridgeNode]);
  setConnections(prev => {
    const filtered = prev.filter(c => 
      !(c.from === fromNodeId && c.to === toNodeId)
    );
    return [
      ...filtered,
      { from: fromNodeId, to: bridgeNode.id },
      { from: bridgeNode.id, to: toNodeId },
    ];
  });
  
  // Show confirmation
  alert(`✅ TELEPORTER INSERTED\n\n...`);
}, [nodes]);
```

---

## Temporal Debugger Integration

**Location**: `components/TemporalDebugger.tsx`

### Bridge Simulation Step

The temporal debugger includes a dedicated step for cross-chain bridging:

```typescript
{
  id: 2,
  nodeId: 'teleport',
  label: 'Cross-Chain Bridge',
  timestamp: 800,
  description: 'Bridging USDC from WeilChain to Ethereum via Teleporter',
  gasUsed: 250000,
  state: {
    walletBalances: [
      { token: 'USDC', amount: 1000, usdValue: 1000 },
      { token: 'USDC (Bridging)', amount: 1000000, usdValue: 1000000 },
    ],
    positions: [
      { protocol: 'Teleporter', type: 'Bridge', amount: 1000000, health: 100 },
    ],
    logs: [
      '[TELEPORTER] Initiating cross-chain bridge',
      '[BRIDGE] Source: WeilChain → Destination: Ethereum',
      '[BRIDGE] Status: Bridging... (waiting for confirmations)',
      '[BRIDGE] Estimated time: 5 minutes',
      '[GAS] Consumed 250,000 gas (25 WEIL)',
    ],
  },
}
```

### Visual Feedback
During simulation, when the teleporter node is active:
- **Node highlighting**: Cyan border (same as other active nodes)
- **Status display**: Shows "Bridging... (Est: 5 mins)" on the node
- **Timeline label**: "Cross-Chain Bridge" step appears in timeline
- **State viewer**: Logs show bridging progress and chain details

---

## Usage Guide

### Adding Cross-Chain Workflows

#### Method 1: Manual Node Placement
1. Open Workflow Builder (`/workflows`)
2. Add an Ethereum node (e.g., "ETH Vault")
3. Add a WeilChain node (e.g., "Djed Monitor")
4. Connect nodes: Click `[CONNECT →]` on ETH node, then click WEIL node
5. **Warning appears**: Red dashed line with mismatch badge
6. Click `🌀 INSERT BRIDGE` button
7. Bridge node automatically inserted with correct configuration

#### Method 2: Direct Bridge Placement
1. Click "Teleporter" in [AVAILABLE_APPLETS] list
2. Node appears on canvas with portal aesthetic
3. Click "Configure" button on node
4. Select source chain (e.g., Ethereum)
5. Select destination chain (e.g., Solana)
6. Enter token symbol and amount
7. Click "Apply Configuration"
8. Connect nodes before and after teleporter

---

## New Node Types

### Teleporter Bridge
- **Type**: `teleport_bridge`
- **Icon**: 🌀
- **Color**: #FF00FF (Magenta)
- **Description**: "Cross-chain bridge for asset transfers"
- **Output Type**: `bridge`
- **Gas Cost**: 250 WEIL (highest due to bridging complexity)
- **Default Chain**: WeilChain (bridges operate on WEIL infrastructure)

### Ethereum Wallet
- **Type**: `eth_wallet`
- **Icon**: 🔷
- **Color**: #627EEA (Ethereum Blue)
- **Description**: "Ethereum wallet operations and DeFi access"
- **Output Type**: `transaction`
- **Gas Cost**: 80 WEIL
- **Default Chain**: Ethereum

### Solana Wallet
- **Type**: `sol_wallet`
- **Icon**: ◆
- **Color**: #9945FF (Solana Purple)
- **Description**: "Solana wallet operations and DeFi access"
- **Output Type**: `transaction`
- **Gas Cost**: 70 WEIL
- **Default Chain**: Solana

---

## Technical Implementation Details

### Type System Extensions

#### WorkflowNode Interface
```typescript
interface WorkflowNode {
  id: string;
  type: AppletNodeType;
  name: string;
  position: { x: number; y: number };
  outputs: string[];
  condition?: {...};
  
  // NEW: Cross-chain properties
  chain?: Chain;
  bridgeConfig?: BridgeConfig;
}
```

#### WorkflowConnection Interface
```typescript
interface WorkflowConnection {
  from: string;
  to: string;
  
  // NEW: Chain mismatch flags (computed, not stored)
  // Used for UI rendering but not persisted
  chainMismatch?: boolean;
  needsBridge?: boolean;
}
```

### State Management

#### Mismatch Detection State
```typescript
const [mismatchedConnections, setMismatchedConnections] = useState<Set<string>>(new Set());
```
- Stores connection keys in format `"fromId->toId"`
- Updated via `useEffect` hook
- Triggers re-render of connection SVG elements

---

## Best Practices

### When to Use Cross-Chain Workflows
✅ **Good Use Cases**:
- Arbitrage across DEXs on different chains
- Yield farming with cross-chain staking
- Multi-chain portfolio rebalancing
- Leveraging chain-specific DeFi protocols

⚠️ **Avoid When**:
- Single-chain operations (adds unnecessary complexity)
- Time-sensitive trades (bridging adds 5+ min delay)
- Small amounts (bridge fees may exceed profits)

### Chain Selection Guidelines
- **Ethereum**: Use for established DeFi protocols (Aave, Uniswap, Compound)
- **WeilChain**: Use for Djed protocol operations and fast settlements
- **Solana**: Use for high-frequency trading and low-cost operations

### Gas Optimization
- **Bridge once**: Batch operations to minimize bridge crossings
- **Route planning**: Execute as many steps as possible on one chain before bridging
- **Fee awareness**: Bridge fees ($2.50) are fixed regardless of amount

---

## Troubleshooting

### Issue: Chain badge not showing
**Solution**: Nodes default to WeilChain. Set `chain` property explicitly if needed.

### Issue: Auto-fix button not working
**Causes**:
1. Not clicking button precisely (small click target)
2. Nodes don't have valid positions
3. Connection already has bridge

**Solution**: Ensure nodes are positioned on canvas and connection is direct.

### Issue: Bridge node not connecting
**Cause**: Manual bridge placement without proper configuration
**Solution**: Use "Configure" button to set source/destination chains before connecting.

### Issue: Simulation not showing bridge step
**Cause**: Custom simulation steps don't include teleporter
**Solution**: Use default `generateMockSimulationSteps()` or add bridge step manually:
```typescript
{
  nodeId: 'teleport',
  label: 'Cross-Chain Bridge',
  description: 'Bridging...',
  // ... see full example above
}
```

---

## Future Enhancements

### Planned Features
- [ ] Multi-hop bridging (A → B → C)
- [ ] Bridge fee estimation based on network congestion
- [ ] Support for more chains (Polygon, Avalanche, BSC)
- [ ] Token swap during bridge (USDC → USDT while bridging)
- [ ] Bridge failure handling and retry logic
- [ ] Real-time bridge status tracking via websockets
- [ ] Gas cost comparison across chains
- [ ] Automatic route optimization (cheapest path finder)

### Performance Optimizations
- [ ] Cache chain configurations
- [ ] Memoize mismatch detection for large workflows
- [ ] Virtualize node rendering for 100+ node workflows
- [ ] Lazy load TeleportNode component

---

## API Reference

### detectChainMismatch()
```typescript
function detectChainMismatch(
  fromNode: WorkflowNode,
  toNode: WorkflowNode
): {
  mismatch: boolean;
  sourceChain: Chain;
  destChain: Chain;
}
```
**Purpose**: Determines if two nodes are on different chains  
**Returns**: Mismatch status and chain identifiers  
**Usage**: Called by `useEffect` in WorkflowBuilder

### autoFixChainMismatch()
```typescript
const autoFixChainMismatch = useCallback(
  (fromNodeId: string, toNodeId: string) => void
)
```
**Purpose**: Inserts bridge node between mismatched nodes  
**Side Effects**: Creates node, updates connections, shows alert  
**Usage**: Triggered by "INSERT BRIDGE" button click

### CHAIN_CONFIGS
```typescript
const CHAIN_CONFIGS: Record<Chain, ChainConfig>
```
**Purpose**: Central configuration for all supported chains  
**Properties**: id, name, icon, color, nativeToken, blockTime, bridgeEnabled  
**Usage**: Import from `lib/workflow-types.ts`

---

## Credits & References

**Designed by**: DjedOps Team  
**Version**: 1.0.0  
**Last Updated**: 2024  
**Related Docs**:
- [TEMPORAL_DEBUGGER.md](./TEMPORAL_DEBUGGER.md) - Simulation system
- [OPPORTUNITY_HOLODECK.md](./OPPORTUNITY_HOLODECK.md) - Graph visualization
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - System overview

---

## License

MIT License - See [LICENSE](./LICENSE) for details
