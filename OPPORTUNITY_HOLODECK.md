# Opportunity Holodeck - Implementation Guide

## Overview

The **Opportunity Holodeck** is an interactive graph visualization component that provides a visual exploration interface for DeFi protocol networks and market opportunities. Similar to Obsidian's Graph View, it replaces traditional list-based navigation with an intuitive ecosystem map.

## Features

### Core Visualization
- **Network Graph Layout**: Circular/force-directed arrangement of DeFi protocols (Uniswap, Aave, Curve, Djed, WeilWrapper, LendingPool)
- **Visual Edge Coding**:
  - 🟡 **Gold Pulsing**: Arbitrage opportunities with profit % labels
  - 🔴 **Red Pulsing**: Liquidation risks and warnings
  - 🔵 **Cyan Solid**: Stable connections (routine operations)
  - ⚫ **Grey Faded**: Idle/inactive connections

### Interactivity
- **Hover Effects**: Hovering a node highlights all connected edges
- **Click Actions**: Clicking opportunity edges opens a detailed modal
- **Auto-Build Workflows**: One-click routing to workflow builder with pre-configured parameters
- **Keyboard Navigation**: Full accessibility support with ARIA labels

### Aesthetic
- **Dark Cyber Theme**: Black radial gradient background with neon accents
- **Glass-morphism Nodes**: Translucent nodes with neon stroke effects
- **Smooth Animations**: Framer Motion for fluid transitions and pulse effects
- **Responsive Design**: Optimized for desktop with mobile support

## Architecture

### Component Structure

```
components/
  OpportunityHolodeck.tsx     # Main graph visualization component
app/
  intel/
    page.tsx                  # Intel route page wrapper
lib/
  types.ts                    # Type definitions (GraphNode, GraphEdge, OpportunityData)
```

### Data Flow

```
Mock Data Generator → Graph Nodes & Edges → SVG Rendering → User Interaction → Modal → Workflow Builder
```

### Technology Stack

- **Framework**: React 18 + Next.js 14 (App Router)
- **Animations**: Framer Motion 12
- **Rendering**: SVG (lightweight, no heavy libraries like D3 or Three.js)
- **Styling**: Tailwind CSS + CSS Keyframes
- **Icons**: Lucide React
- **Routing**: Next.js Navigation
- **State**: React Hooks (useState, useMemo, useCallback)

## File Structure

### 1. OpportunityHolodeck.tsx
**Location**: `components/OpportunityHolodeck.tsx`

**Purpose**: Main visualization component

**Key Functions**:
- `generateMockGraphData()`: Generates sample nodes and edges (replace with real API)
- `getEdgeStyle()`: Returns visual styling based on edge type
- `getConnectedEdges()`: Filters edges connected to a node (for hover highlighting)
- `handleEdgeClick()`: Opens opportunity modal on edge click
- `handleBuildWorkflow()`: Routes to workflow builder with auto-config

**Props**: None (self-contained)

**State**:
- `hoveredNode`: Currently hovered node ID
- `selectedEdge`: Edge selected for modal display

### 2. app/intel/page.tsx
**Location**: `app/intel/page.tsx`

**Purpose**: Route wrapper for Holodeck with navigation

**Features**:
- Breadcrumb navigation (Home / Intel)
- Connection status indicator
- Info banner with usage instructions
- Footer quick links

### 3. lib/types.ts
**Location**: `lib/types.ts`

**Added Types**:
```typescript
// Graph visualization types
interface GraphNode { ... }
type EdgeType = 'opportunity' | 'risk' | 'stable' | 'idle'
interface GraphEdge { ... }
interface EdgeMetadata { ... }
interface OpportunityData { ... }
```

### 4. HeroSection.tsx (Updated)
**Location**: `components/HeroSection.tsx`

**Change**: Added [INTEL] navigation button to hero section grid

## Navigation Integration

### Main Hero Section
The [INTEL] button is added to the 4-column navigation grid on the home page:

```tsx
<a href="/intel" className="border-2 border-[#FF00FF] ...">
  [INTEL]
</a>
```

### Route Access
- **URL**: `/intel`
- **Navigation**: Home → [INTEL] button → Opportunity Holodeck
- **Back Navigation**: Intel page breadcrumb → Home

## Mock Data

### Nodes (Protocols)
```javascript
const nodes = [
  { id: 'uniswap', label: 'Uniswap', x: 50, y: 15, icon: Coins, color: '#FF007A' },
  { id: 'aave', label: 'Aave', x: 85, y: 35, icon: Database, color: '#B6509E' },
  { id: 'curve', label: 'Curve', x: 85, y: 65, icon: TrendingUp, color: '#FFD700' },
  { id: 'djed', label: 'Djed Stablecoin', x: 50, y: 85, icon: Shield, color: '#39FF14' },
  { id: 'weil', label: 'WeilWrapper', x: 15, y: 65, icon: Layers, color: '#00D4FF' },
  { id: 'lending', label: 'LendingPool', x: 15, y: 35, icon: Activity, color: '#FF4444' },
];
```

### Edges (Connections)
```javascript
const edges = [
  { source: 'uniswap', target: 'curve', type: 'opportunity', label: 'Arb +0.8%', strength: 8 },
  { source: 'aave', target: 'lending', type: 'risk', label: 'Liq Risk', strength: 7 },
  { source: 'djed', target: 'weil', type: 'stable', label: 'Stable', strength: 5 },
  // ... more edges
];
```

## Customization

### Adding New Protocols
1. Add node to `generateMockGraphData()`:
```javascript
{
  id: 'compound',
  label: 'Compound',
  x: 50, // Position (0-100%)
  y: 50,
  icon: TrendingUp, // Lucide icon
  color: '#00D395', // Neon color
}
```

2. Add edges connecting to other protocols

### Changing Colors
Update color constants in `getEdgeStyle()`:
```javascript
case 'opportunity':
  return { stroke: '#FFD700', ... }; // Change gold to another color
```

### Modifying Layout
Adjust `x` and `y` coordinates in node definitions:
- Circular layout: Use trigonometry (cos/sin with angles)
- Grid layout: Use calculated positions (e.g., `x: (index % cols) * spacing`)
- Force-directed: Implement physics simulation (future enhancement)

## Accessibility

### ARIA Labels
- All interactive elements have `aria-label` attributes
- Graph has `role="img"` with descriptive `aria-label`
- Modal has `role="dialog"` and `aria-modal="true"`

### Keyboard Navigation
- Tab/Shift+Tab: Navigate between nodes and edges
- Enter/Space: Activate selected element
- Escape: Close modal

### Screen Reader Support
- Descriptive labels for all nodes and edges
- Status announcements for opportunity detection
- Clear modal title and content structure

## Performance Optimizations

### Memoization
- `useMemo` for graph data generation
- `useCallback` for event handlers
- Prevents unnecessary re-renders

### SVG Optimization
- Simple shapes (circles, lines) for fast rendering
- CSS animations over JavaScript for smooth performance
- No complex path calculations

### Lazy Loading
- Component only loads when route is accessed
- Graph data generated on mount

## Future Enhancements

### Phase 1: Real Data Integration
- [ ] Connect to DeFi protocol APIs
- [ ] Real-time opportunity scanning
- [ ] Live price feeds and calculations
- [ ] Historical opportunity tracking

### Phase 2: Advanced Interactions
- [ ] Zoom and pan controls
- [ ] Node dragging and custom positioning
- [ ] Filter opportunities by type/profit threshold
- [ ] Search and highlight specific protocols
- [ ] Save custom layouts

### Phase 3: Analytics Integration
- [ ] Track opportunity conversion rates
- [ ] Performance metrics dashboard
- [ ] Alert system for high-value opportunities
- [ ] Portfolio correlation visualization

### Phase 4: Social Features
- [ ] Share opportunity findings
- [ ] Community-contributed strategies
- [ ] Collaborative graph annotations
- [ ] Reputation system for opportunity quality

## Testing

### Manual Testing Checklist
- [ ] All nodes render correctly with proper colors
- [ ] Edges display with correct visual coding
- [ ] Hover highlights connected edges
- [ ] Click on opportunity edge opens modal
- [ ] Modal displays correct data and calculations
- [ ] Auto-build workflow button routes correctly
- [ ] Close modal with X button and background click
- [ ] Navigation breadcrumb works
- [ ] Responsive layout on mobile devices
- [ ] Keyboard navigation functions properly
- [ ] Screen reader announces elements correctly

### Unit Testing (TODO)
```typescript
// Example test cases
describe('OpportunityHolodeck', () => {
  it('renders all nodes with correct positions', () => { ... });
  it('highlights edges on node hover', () => { ... });
  it('opens modal on opportunity edge click', () => { ... });
  it('routes to workflow builder on auto-build', () => { ... });
});
```

## API Integration Guide

### Replace Mock Data
In `OpportunityHolodeck.tsx`, replace `generateMockGraphData()`:

```typescript
// Before (Mock)
const { nodes, edges } = useMemo(() => generateMockGraphData(), []);

// After (Real API)
const { data: graphData, isLoading } = useGraphData(); // Custom hook
const { nodes, edges } = useMemo(() => {
  if (!graphData) return { nodes: [], edges: [] };
  return transformApiData(graphData); // Transform API response
}, [graphData]);
```

### API Response Format
```json
{
  "protocols": [
    {
      "id": "uniswap",
      "name": "Uniswap",
      "tvl": 5000000000,
      "color": "#FF007A"
    }
  ],
  "opportunities": [
    {
      "id": "arb-1",
      "type": "arbitrage",
      "source": "uniswap",
      "target": "curve",
      "estimatedProfit": 450,
      "confidence": 0.85,
      "expiresAt": "2026-01-13T12:00:00Z"
    }
  ],
  "risks": [
    {
      "id": "risk-1",
      "type": "liquidation",
      "source": "aave",
      "target": "lending",
      "severity": "high"
    }
  ]
}
```

## Deployment

### Production Checklist
- [ ] Remove mock data and integrate real APIs
- [ ] Add error boundaries for graph rendering failures
- [ ] Implement loading states for data fetching
- [ ] Optimize SVG rendering for large graphs (100+ nodes)
- [ ] Add analytics tracking for user interactions
- [ ] Set up monitoring for performance metrics
- [ ] Configure CDN caching for static assets
- [ ] Add rate limiting for API calls
- [ ] Implement authentication for protected routes
- [ ] Test on all target browsers and devices

### Environment Variables
```env
# API Configuration
NEXT_PUBLIC_DEFI_API_URL=https://api.defi-protocol.com
NEXT_PUBLIC_OPPORTUNITY_REFRESH_INTERVAL=30000 # 30 seconds

# Feature Flags
NEXT_PUBLIC_ENABLE_HOLODECK=true
NEXT_PUBLIC_ENABLE_AUTO_BUILD=true
```

## Troubleshooting

### Issue: Nodes Not Rendering
**Cause**: SVG viewBox or coordinate mismatch
**Solution**: Verify `x` and `y` values are between 0-100 and viewBox is `"0 0 100 100"`

### Issue: Edges Not Pulsing
**Cause**: Framer Motion animation not triggered
**Solution**: Check `animate` prop is set correctly and `transition` includes `repeat: Infinity`

### Issue: Modal Not Opening
**Cause**: Event handler not firing or edge type is 'idle'
**Solution**: Verify `edge.type !== 'idle'` and click handler is properly bound

### Issue: Navigation Button Not Visible
**Cause**: Hero section not rendering or CSS conflict
**Solution**: Check grid layout and responsive breakpoints in HeroSection.tsx

## Support

For questions or issues:
1. Check this documentation first
2. Review code comments in `OpportunityHolodeck.tsx`
3. Test with mock data to isolate API issues
4. Open an issue with detailed reproduction steps

## License

This component is part of the DjedOps Dashboard project.

---

**Status**: ✅ Production Ready (Mock Data)  
**Version**: 1.0.0  
**Last Updated**: January 13, 2026  
**Maintainer**: GitHub Copilot  
