/** Derives explanations from actual algorithm states, without executing user code. */
export function algorithmStages(beat) {
  const values = beat.values ?? [];
  if (beat.algorithm === 'loop') return values.map((value, index) => {
    const output = beat.output_mode === 'value' ? value : beat.output_mode === 'constant' ? beat.prefix : `${beat.prefix ?? 'Hello'} ${value}`.trimStart();
    return { say: `Iteration ${index + 1} of ${values.length}: the next sequence value is ${value}. Assign ${beat.variable ?? 'i'} = ${value}${index ? `, replacing ${values[index - 1]}` : ''}. Now the indented print uses that value and produces ${output}. ${index === values.length - 1 ? 'This is the final value, so execution leaves the loop after this output.' : 'The output stays on screen while the loop moves to its next value.'}` };
  });
  if (beat.algorithm === 'sort') {
    const current = [...values], stages = [];
    for (let end = current.length - 1; end > 0; end--) for (let index = 0; index < end; index++) {
      const a = current[index], b = current[index + 1];
      if (a > b) [current[index], current[index + 1]] = [b, a];
      stages.push({ say: `Pass ${values.length - end}, indices ${index} and ${index + 1}. Compare ${a} with ${b}. ${a > b ? `${a} is larger, so swap this neighboring pair.` : 'The left value is no larger: this pair is already in order, so keep it in place.'} The array is now ${current.join(', ')}.${index === end - 1 ? ` This pass is complete: ${current[end]} is in its final position at index ${end}.` : ' Continue with the next neighboring pair.'}` });
    }
    return stages;
  }
  if (beat.algorithm === 'search') {
    const stages = [], target = beat.target;
    if (beat.strategy === 'binary') {
      let low = 0, high = values.length - 1;
      while (low <= high) {
        const mid = Math.floor((low + high) / 2), value = values[mid];
        stages.push({ say: `The candidate range runs from index ${low} to ${high}. Its middle index is ${mid}, containing ${value}. ${value === target ? `It matches ${target}, so the search stops after ${stages.length + 1} comparisons.` : value < target ? `${value} is smaller than ${target}. Because the array is sorted, every value at or left of this midpoint is too small. Move the lower bound to ${mid + 1}.` : `${value} is larger than ${target}. Because the array is sorted, every value at or right of this midpoint is too large. Move the upper bound to ${mid - 1}.`}` });
        if (value === target) break;
        if (value < target) low = mid + 1; else high = mid - 1;
      }
    } else for (let index = 0; index < values.length; index++) {
      stages.push({ say: values[index] === target ? `Comparison ${index + 1}: index ${index} contains ${values[index]}. It matches the target ${target}, so stop here. The earlier comparisons ruled out every preceding position.` : `Comparison ${index + 1}: index ${index} contains ${values[index]}, which is not the target ${target}. Rule out only this position. ${index === values.length - 1 ? 'There are no positions left, so the target is absent.' : 'Linear search must check the next position; the remaining values are still candidates.'}` });
      if (values[index] === target) break;
    }
    return stages;
  }
  if (beat.algorithm === 'stack' || beat.algorithm === 'queue') {
    const current = [...values];
    return (Array.isArray(beat.operations) ? beat.operations.slice(0,12) : []).map(op => {
      if (!op || typeof op !== 'object') return { say: 'Choose a valid collection operation.' };
      if (op.type === 'push' || op.type === 'enqueue') {
        current.push(op.value);
        return { say: `${op.type === 'push' ? 'Push' : 'Enqueue'} ${op.value} at the ${beat.algorithm === 'stack' ? 'top of the stack' : 'back of the queue'}. The collection now contains ${current.length} values: ${current.join(', ')}. ${beat.algorithm === 'stack' ? `The next pop would remove ${current[current.length - 1]}, the most recently added value.` : `The next dequeue would remove ${current[0]}, the earliest value still waiting.`}` };
      }
      const removed = op.type === 'pop' ? current.pop() : current.shift();
      return { say: removed === undefined ? 'The collection is empty. There is no value to remove, so its size remains zero.' : `Remove ${removed} from the ${beat.algorithm === 'stack' ? 'top of the stack, because it was added last' : 'front of the queue, because it was added first'}. ${current.length ? `The remaining values are ${current.join(', ')}; the size is now ${current.length}.` : 'No values remain; the collection is now empty.'}` };
    });
  }
  return [];
}
