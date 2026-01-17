# Semantic Command Bar - AI-Powered Workflow Generation

## Overview

The **Semantic Command Bar** is an AI-powered natural language interface that allows users to describe workflows in plain English and automatically generates the corresponding workflow nodes and connections.

## Features

### 🎨 User Experience
- **Keyboard Shortcut**: `Cmd+K` (Mac) or `Ctrl+K` (Windows/Linux) to activate
- **Floating Command Bar**: Beautiful glassmorphic design matching the site's terminal aesthetic
- **Real-time Examples**: Rotating placeholder examples to guide users
- **Progressive Loading States**: Sophisticated multi-stage animations during processing

### 🧠 AI Integration
- **Gemini AI Parsing**: Uses Google's Gemini Pro model for complex intent understanding
- **Fallback Pattern Matching**: Regex-based parsing when AI is unavailable
- **Smart Node Positioning**: Automatically calculates optimal node placement
- **Edge Generation**: Creates connections between nodes based on workflow logic

### ✨ Loading Animations (Critical UX)

The component features three distinct loading states:

1. **Analyzing Intent** (800ms minimum)
   - Animated sparkles icon
   - Pulsing dots
   - Green theme matching site aesthetic
   - Message: "🧠 [ANALYZING_INTENT]"

2. **Building Workflow** (500ms)
   - Spinning loader icon
   - Progress bar animation
   - Gold theme for construction phase
   - Message: "⚡ [BUILDING_WORKFLOW]"

3. **Success State** (1s before close)
   - Check mark icon
   - Confirmation animation
   - Message: "✓ [WORKFLOW_GENERATED]"

4. **Error State** (3s auto-dismiss)
   - Alert icon
   - Error message display
   - Red theme for errors
   - Auto-reset to idle state

## Setup

### 1. Install Dependencies

```bash
npm install @google/generative-ai
```

### 2. Configure Gemini API Key

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```

Get your API key from: https://makersuite.google.com/app/apikey

### 3. Integration

The Semantic Command Bar is automatically integrated into the Workflow Builder page:

```tsx
import { SemanticCommandBar } from '@/components/SemanticCommandBar';
import { ParsedIntent } from '@/lib/intent-engine';

function WorkflowsPage() {
  const [generatedWorkflow, setGeneratedWorkflow] = useState<ParsedIntent | null>(null);

  const handleWorkflowGenerated = (result: ParsedIntent) => {
    console.log('Workflow generated:', result);
    setGeneratedWorkflow(result);
  };

  return (
    <div>
      <SemanticCommandBar onWorkflowGenerated={handleWorkflowGenerated} />
      <WorkflowBuilder generatedWorkflow={generatedWorkflow} />
    </div>
  );
}
```

## Usage

### Basic Commands

Users can type natural language commands like:

1. **Token Swaps**:
   - `Swap 100 USDC to ETH if price < 2000`
   - `Swap 50 WEIL to USDC when price > 1.5`

2. **Protocol Monitoring**:
   - `Monitor Aave and alert if DSI > 0.8`
   - `Monitor DJED protocol for liquidation risks`

3. **Arbitrage**:
   - `Arbitrage between Uniswap and Curve`
   - `Find arbitrage opportunities on DEXes`

4. **Complex Workflows**:
   - `Monitor ETH price and swap to stablecoin if it drops below 2000`
   - `Track Compound lending rates and alert on changes`

### User Flow

1. User presses `Cmd+K` or clicks the floating trigger button
2. Command bar appears with focus on input
3. User types natural language description
4. Presses Enter or clicks `[EXECUTE]` button
5. **Analyzing State** (min 800ms):
   - Sparkles animate
   - "🧠 [ANALYZING_INTENT]" message
   - Pulsing dots indicator
6. **Building State** (500ms):
   - Loader spins
   - "⚡ [BUILDING_WORKFLOW]" message
   - Progress bar fills
7. **Success State** (1s):
   - Check mark appears
   - "✓ [WORKFLOW_GENERATED]" message
   - Notification at top of screen
8. Nodes automatically appear on canvas with smooth animations
9. Command bar closes automatically

## Architecture

### Components

#### `SemanticCommandBar.tsx`
- Main UI component
- Handles keyboard shortcuts
- Manages state transitions
- Renders loading animations
- Communicates with parent via callback

#### `intent-engine.ts`
- Core parsing logic
- Gemini AI integration
- Fallback regex patterns
- Node position calculation
- Edge generation logic

### Data Flow

```
User Input
    ↓
SemanticCommandBar
    ↓
parseIntent(input)
    ↓
[Try AI Parsing]
    ├─ Success → Return ParsedIntent
    └─ Failure → Try Pattern Matching
        ├─ Success → Return ParsedIntent
        └─ Failure → Return Generic Workflow
    ↓
onWorkflowGenerated(result)
    ↓
WorkflowBuilder receives result
    ↓
Nodes & Edges added to canvas with animation
```

### Types

```typescript
interface ParsedIntent {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  description: string;
}

interface WorkflowEdge {
  from: string;
  to: string;
}

interface WorkflowNode {
  id: string;
  type: AppletNodeType;
  name: string;
  position: { x: number; y: number };
  outputs: string[];
  condition?: {
    type: 'price_below' | 'price_above' | 'dsi_below' | 'dsi_above';
    value: number;
  };
}
```

## Customization

### Adding New Patterns

Add custom regex patterns in `intent-engine.ts`:

```typescript
const INTENT_PATTERNS = [
  {
    pattern: /your regex here/i,
    handler: (matches: RegExpMatchArray): ParsedIntent => {
      // Your parsing logic
      return { nodes, edges, description };
    },
  },
  // ... more patterns
];
```

### Styling

The component uses Tailwind CSS and matches the site's aesthetic:
- **Primary Color**: `#39FF14` (neon green)
- **Background**: Black with border
- **Typography**: Monospace font for terminal feel
- **Animations**: Framer Motion for smooth transitions

### Minimum Processing Time

The minimum processing time is set to 800ms for perceived sophistication:

```typescript
const minDelay = 800; // Never show instant response
```

This can be adjusted in `intent-engine.ts` if needed.

## Gemini AI Integration

### How It Works

1. Constructs a detailed prompt with:
   - User's natural language command
   - Available node types and their purposes
   - Expected JSON output format
   - Spacing rules for node placement

2. Sends request to Gemini Pro model

3. Parses JSON response (handles markdown code blocks)

4. Validates and assigns unique IDs to nodes

5. Returns structured workflow configuration

### Prompt Engineering

The AI receives a carefully crafted prompt:

```
You are a DeFi workflow compiler. Convert the following natural language 
command into a JSON workflow configuration.

User command: "[user input]"

Available node types:
- djed_monitor: Monitor price/DSI conditions
- djed_sim: Simulate protocol scenarios
- djed_sentinel: Alert system for critical conditions
- djed_ledger: Record transactions
- djed_arbitrage: Execute arbitrage trades

Return ONLY valid JSON in this exact format:
{
  "nodes": [...],
  "edges": [...],
  "description": "..."
}

Space nodes 300px apart horizontally. First node starts at x:100, y:200.
```

### Error Handling

If Gemini AI fails:
1. Logs error to console
2. Falls back to regex pattern matching
3. If patterns fail, creates generic monitoring workflow
4. Never shows blank error to user

## Performance Optimization

- **Lazy Import**: Gemini SDK only imported when needed
- **Minimum Delay**: Prevents jarring instant responses
- **Debounced Processing**: Prevents multiple simultaneous requests
- **Memoized Examples**: Example commands cached and rotated
- **Optimistic UI**: Shows building state before complete response

## Accessibility

- ✅ Keyboard navigation (Enter to submit, Escape to close)
- ✅ ARIA labels on interactive elements
- ✅ Focus management (auto-focus on open)
- ✅ Screen reader friendly messages
- ✅ Semantic HTML structure

## Browser Compatibility

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile: ✅ Works with touch (no keyboard shortcut)

## Troubleshooting

### API Key Not Working

1. Check `.env.local` file exists
2. Verify key starts with correct format
3. Restart dev server after adding key
4. Check browser console for specific error

### Fallback Pattern Not Matching

1. Check regex patterns in `INTENT_PATTERNS`
2. Test regex with your input
3. Add new pattern for your use case
4. Generic workflow created as ultimate fallback

### Animation Stuttering

1. Reduce animation duration
2. Check browser performance
3. Disable other heavy animations
4. Use CSS transforms for better performance

## Future Enhancements

- [ ] Voice input support
- [ ] Workflow templates from common patterns
- [ ] Multi-language support
- [ ] Learning from user corrections
- [ ] Workflow complexity estimation
- [ ] Gas cost prediction
- [ ] Cross-chain workflow suggestions
- [ ] Integration with protocol analytics

## Credits

- **AI Model**: Google Gemini Pro
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Design**: Terminal-inspired cyber aesthetic

---

**Built with ❤️ for DjedOps - The Future of DeFi Automation**
