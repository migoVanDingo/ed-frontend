// types
type Task = {
  name: string;
  callback: () => void;
};
type TaskGroup = {
  name: string;
  duration: number; // milliseconds to wait *before* running this group's tasks
  tasks: Task[];
};

interface SequenceController {
  /** Call this to clear all pending timeouts immediately */
  cancel: () => void;
}

/**
 * runTaskSequence
 * @param groups list of task-groups to run in order
 * @returns an object with a `cancel()` method
 */
export function runTaskSequence(groups: TaskGroup[]): SequenceController {
  const timeouts: number[] = [];
  let cumulativeDelay = 0;

  groups.forEach((group) => {
    // add this group's wait time onto the running total
    cumulativeDelay += group.duration;

    const id = window.setTimeout(() => {
      console.log(`▶ [${group.name}] after ${group.duration}ms`);
      group.tasks.forEach((task) => {
        console.log(`   • executing task "${task.name}"`);
        task.callback();
      });
    }, cumulativeDelay);

    timeouts.push(id);
  });

  // after the last group has fired, clear all timeouts
  const clearId = window.setTimeout(() => {
    timeouts.forEach(window.clearTimeout);
    console.log("All timeouts cleared");
  }, cumulativeDelay);

  return {
    cancel: () => {
      timeouts.forEach(window.clearTimeout);
      window.clearTimeout(clearId);
      console.log("❌ Sequence cancelled, all timeouts cleared");
    },
  };
}
