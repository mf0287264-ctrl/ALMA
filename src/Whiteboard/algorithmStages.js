/** Derives explanations from actual algorithm states, without executing user code. */
export function algorithmStages(beat) {
  const values = beat.values ?? [];
  if (beat.algorithm === 'loop') return values.map((value, index) => ({ say: `Iteration ${index + 1}: assign ${beat.variable ?? 'i'} the value ${value}, run the loop body, and print ${beat.prefix ?? 'Hello'} ${value}.` }));
  if (beat.algorithm === 'sort') {
    const current = [...values], stages = [];
    for (let end = current.length - 1; end > 0; end--) for (let index = 0; index < end; index++) {
      const a = current[index], b = current[index + 1];
      stages.push({ say: a > b ? `Compare ${a} with ${b}. ${a} is larger, so swap this neighboring pair.` : `Compare ${a} with ${b}. This pair is already in order, so keep it in place.` });
      if (a > b) [current[index], current[index + 1]] = [b, a];
    }
    return stages;
  }
  if (beat.algorithm === 'search') {
    const stages = [], target = beat.target;
    if (beat.strategy === 'binary') {
      let low = 0, high = values.length - 1;
      while (low <= high) {
        const mid = Math.floor((low + high) / 2), value = values[mid];
        stages.push({ say: value === target ? `The middle value is ${value}, at index ${mid}. It matches ${target}, so the search is complete.` : value < target ? `The middle value ${value} is smaller than ${target}. Discard index ${mid} and everything to its left.` : `The middle value ${value} is larger than ${target}. Discard index ${mid} and everything to its right.` });
        if (value === target) break;
        if (value < target) low = mid + 1; else high = mid - 1;
      }
    } else for (let index = 0; index < values.length; index++) {
      stages.push({ say: values[index] === target ? `Compare index ${index}. Its value ${values[index]} matches ${target}, so we have found the target.` : `Compare index ${index}. ${values[index]} is not ${target}, so move to the next position.` });
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
        return { say: `${op.type === 'push' ? 'Push' : 'Enqueue'} ${op.value} at the ${beat.algorithm === 'stack' ? 'top of the stack' : 'back of the queue'}. The collection now contains ${current.length} values.` };
      }
      const removed = op.type === 'pop' ? current.pop() : current.shift();
      return { say: removed === undefined ? 'The collection is empty. There is no value to remove.' : `Remove ${removed} from the ${beat.algorithm === 'stack' ? 'top of the stack, because it was added last' : 'front of the queue, because it was added first'}.` };
    });
  }
  return [];
}
