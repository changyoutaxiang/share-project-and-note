# Personal Project Management App Design Guidelines

## Design Approach
**Selected Approach**: Design System (Material Design-inspired)
**Justification**: Utility-focused productivity tool requiring efficiency, consistency, and information-dense displays. The app prioritizes function over visual flair, making a systematic approach ideal for task management workflows.

## Core Design Elements

### Color Palette
**Primary Colors**:
- Light Mode: 220 85% 25% (Deep blue for trust and productivity)
- Dark Mode: 220 85% 75% (Lighter blue for dark backgrounds)

**Accent Colors**:
- Success: 142 69% 45% (Green for completed tasks)
- Warning: 38 92% 50% (Orange for overdue items)
- Neutral: 220 15% 95% (Light backgrounds)
- Dark Neutral: 220 15% 15% (Dark mode backgrounds)

**Background Treatments**:
- Clean, minimal solid colors
- Subtle card shadows for component separation
- No gradients - focus on functional clarity

### Typography
**Font Stack**: Inter (Google Fonts)
- Headers: 600-700 weight, sizes from text-lg to text-3xl
- Body: 400 weight, text-sm to text-base
- Code/Labels: 500 weight, text-xs to text-sm

### Layout System
**Spacing Units**: Tailwind 2, 4, 6, 8, 12, 16
- Consistent 4-unit (1rem) grid system
- Cards with p-6, lists with p-4
- Section spacing with gap-8 or gap-12

### Component Library

**Navigation**: 
- Left sidebar with project tree and quick actions
- Top bar with search, user menu, and breadcrumbs
- Collapsible sidebar for mobile responsiveness

**Task Management**:
- Kanban cards with drag-drop zones
- List view with sortable columns
- Task detail modals with form inputs
- Priority indicators using color-coded badges

**Data Displays**:
- Progress bars for project completion
- Status badges with semantic colors
- Date pickers with calendar overlays
- Charts using minimal, functional styling

**Forms**:
- Clean input fields with subtle borders
- Dropdown selectors for categories/priorities
- Toggle switches for task completion
- Form validation with inline error messages

## Key Design Principles

1. **Information Hierarchy**: Clear visual hierarchy using typography scale and spacing
2. **Functional Focus**: Every visual element serves a productivity purpose
3. **Consistent Patterns**: Reusable component patterns across all views
4. **Accessibility First**: High contrast ratios, keyboard navigation support
5. **Mobile Responsive**: Adaptive layouts that work on all screen sizes

## Critical Constraints
- No decorative animations - focus on functional micro-interactions
- Maintain consistent spacing throughout using the defined unit system
- Dark mode implementation must be comprehensive across all components
- Prioritize loading speed over visual effects

This systematic approach ensures a professional, efficient tool that enhances personal productivity rather than distracting from it.