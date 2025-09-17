## Component Interface
- **Props:**
  - `tasks: Task[]`: An array of task objects to be rendered.
  - `onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void`: Optional callback for task updates.
  - `onTaskClick?: (task: Task) => void`: Optional callback triggered when a task is clicked.
  - `startDate?: Date`: Optional start date for the chart.
  - `endDate?: Date`: Optional end date for the chart.
  - `'data-id'?: string`: Optional data attribute for testing purposes.
- **Default values:** 
  - If `startDate` and `endDate` are not provided, the chart will default to a range of 30 days from today if `tasks` is empty.
- **Recommended prop combinations:** 
  - Providing both `startDate` and `endDate` is recommended for accurate chart rendering.

## Exported Components
- `GanttChart`
- `Task`
- `GanttChartProps`

## Usage Examples
```javascript
import { GanttChart } from './src/GanttChart';
import { addDays } from 'date-fns';

const tasks = [
  {
    id: '1',
    name: 'Task One',
    startDate: new Date(),
    endDate: addDays(new Date(), 5),
    progress: 50,
    assignee: 'John Doe',
    color: '#F59E0B',
  },
];

const handleTaskClick = (task) => {
  console.log('Task clicked:', task);
};

<GanttChart tasks={tasks} onTaskClick={handleTaskClick} />
```

```javascript
<GanttChart tasks={[]} onTaskClick={handleTaskClick} />
```

## Design Guidelines
- **Spacing & Layout Patterns:** Utilize consistent padding and margins. Use Tailwind's utility classes for spacing.
- **Color Schemes:** Use a modern palette aligned with brand guidelines; allow customization through task colors.
- **Typography:** Base typography on the default Tailwind typography settings; headings, and important texts should be bold for emphasis.
- **Visual Hierarchy:** Ensure important elements like task names and progress bars have distinct sizes and colors to improve visibility.
- **Responsive Design:** The component should maintain usability across devices. Using `flex` and `overflow-auto` ensures proper scaling.
- **Accessibility:** Ensure tasks can be navigated and activated through keyboard interactions; utilize ARIA roles appropriately.

## Styling & Behavior
- **Key Styling Props:** Styling is primarily managed through Tailwind CSS, especially through classes such as `bg-gray-50`, `border-gray-200`, and utility modifiers for responsiveness.
- **Interactive States:** The component should provide visual cues on hover (e.g., shadows).
- **Responsive Behavior:** The GanttChart adjusts its dimensions based on screen size due to the use of flexible layouts.
- **Dark/Light Mode:** The component adheres to the chosen Tailwind color scheme, which can easily be swapped with mode toggles.
- **Edge Cases:** Handle cases where no tasks are provided gracefully by displaying a compatible empty state.

## Integration Notes
- **CSS Variables:** Ensure Tailwind CSS is properly integrated to utilize necessary classes.
- **Context Providers:** No specific context providers are required; only props need to be passed down.
- **Integration Patterns:** The `GanttChart` can be integrated within any parent component and should provide user interaction through callbacks.
  
## Best Practices
- **Recommended Usage Patterns:** Use callbacks for task interactions; ensure to validate props to avoid rendering issues.
- **Common Pitfalls:** Overloading the tasks array with too many tasks can lead to performance issues. Consider pagination for larger datasets.
- **Performance Optimization:** Use React's `memo` to prevent unnecessary renders when props haven’t changed.
- **Testing Recommendations:** Leverage testing libraries to simulate user interaction and validate that callbacks trigger correctly.
- **Accessibility Guidelines:** Ensure screen reader compatibility and provide clear focus states for interactive elements.