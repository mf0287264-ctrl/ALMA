/** Movements demonstrate real state transitions and are deterministic at every seek time. */
import type { SceneProps } from "@/types/Whiteboard.type";
import { COLORS } from "../theme";
import { DrawCodeBlock } from "./code";
import { arr, CenteredLabel, Connector, num, str, TextBlock } from "./helpers";

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const smooth = (value: number) => { const t = clamp(value); return t * t * (3 - 2 * t); };
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
/** Generated lessons can align each operation with its spoken caption. */
function playhead(elapsed: number, p: SceneProps["p"], count: number, seconds: number) {
  const times = arr(p.step_times).map(value => num(value)).slice(0, count);
  const timed = count > 0 && times.length === count;
  const end = timed ? num(p.end_time, times[count-1] + seconds) : count * seconds;
  const done = elapsed >= end;
  let index = Math.min(Math.max(0, count-1), Math.floor(elapsed/seconds));
  if (timed) {
    index = 0;
    for (let i=0; i<times.length; i++) if (times[i] <= elapsed) index = i;
  }
  const start = timed ? times[index] : index * seconds;
  const next = timed ? times[index+1] ?? end : start + seconds;
  return { index, phase: done ? 1 : clamp((elapsed-start)/Math.max(0.1,next-start)), done };
}

function Explanation({ text, x = 70, y = 410, width = 660 }: { text: string; x?: number; y?: number; width?: number }) {
  return <g role="group" aria-label={text}>
    <rect x={x} y={y} width={width} height={48} rx={12} fill={COLORS.mangoSoft} stroke={COLORS.mangoLine} />
    <CenteredLabel cx={x + width / 2} cy={y + 24} text={text} maxWidth={width - 24} size={14} maxLines={2} />
  </g>;
}

function StateBadge({ text, x, y, width = 160 }: { text: string; x: number; y: number; width?: number }) {
  return <g aria-label={text}><rect x={x} y={y} width={width} height={30} rx={10} fill={COLORS.tealSoft} stroke={COLORS.teal} /><CenteredLabel cx={x + width / 2} cy={y + 15} text={text} maxWidth={width - 16} size={12} mono maxLines={1} /></g>;
}

function Cell({ x, y, width, value, index, active = false, muted = false, done = false }: {
  x: number; y: number; width: number; value: string; index?: number; active?: boolean; muted?: boolean; done?: boolean;
}) {
  return <g opacity={muted ? 0.3 : 1}>
    <rect x={x+3} y={y} width={width-6} height={54} rx={10} fill={active ? COLORS.mangoSoft : done ? COLORS.tealSoft : COLORS.paper} stroke={active ? COLORS.mango : done ? COLORS.teal : COLORS.line} strokeWidth={active ? 3 : 2} />
    <CenteredLabel cx={x+width/2} cy={y+27} text={value} maxWidth={width-16} size={16} mono maxLines={1} />
    {index !== undefined && <text x={x+width/2} y={y+73} textAnchor="middle" fontSize={11} fill={COLORS.muted}>{index}</text>}
  </g>;
}

/** Value → assignment → active code line → printed output, once per iteration. */
export function AnimateLoop({ id, p, elapsed = 0, motion = true }: SceneProps) {
  const values = arr(p.values ?? [0, 1, 2]).slice(0, 8).map(value => str(value));
  if (!values.length) return null;
  const seconds = Math.max(1, num(p.step_seconds, 2));
  const moment = playhead(elapsed,p,values.length,seconds);
  const finished = moment.done;
  const iteration = moment.index;
  const phase = moment.phase;
  const width = 660/values.length;
  const prints = finished ? values.length : iteration + (phase >= 0.72 ? 1 : 0);
  const prefix = str(p.prefix, "Hello");
  const variable = str(p.variable, "i");
  const outputFor = (value: string) => p.output_mode === "value" ? value : p.output_mode === "constant" ? prefix : `${prefix} ${value}`.trimStart();
  const start: [number,number] = [70+(iteration+0.5)*width, 169];
  const code: [number,number] = [285, 294];
  const output: [number,number] = [615, 306];
  const leg = motion ? phase < 0.45 ? smooth(phase/0.45) : smooth((phase-0.45)/0.27) : 1;
  const token = phase < 0.45 ? [mix(start[0],code[0],leg), mix(start[1],code[1],leg)] : [mix(code[0],output[0],leg),mix(code[1],output[1],leg)];
  const note = finished ? `Finished: ${values.length} values produced ${values.length} lines. Continue after the loop.` : phase < 0.45 ? `Iteration ${iteration+1}: take ${values[iteration]} from the sequence and assign ${variable} = ${values[iteration]}.` : phase < 0.72 ? `Run the indented body with ${variable} = ${values[iteration]}.` : `Print ${outputFor(values[iteration])}, then check for the next sequence value.`;
  return <g>
    <TextBlock lines={["The sequence"]} x={70} y={115} size={14} color={COLORS.muted} />
    <StateBadge text={finished ? "Loop finished" : `Iteration ${iteration + 1} / ${values.length}`} x={545} y={85} width={185} />
    {values.map((value,index)=><Cell key={index} x={70+index*width} y={133} width={width} value={value} index={index} active={!finished && index===iteration} done={finished || index<iteration} />)}
    <DrawCodeBlock id={`${id}-code`} p={{position:[70,245],width:420,code:str(p.code,`for ${variable} in [${values.join(", ")}]:\n    print("${prefix}", ${variable})`),active_line:finished?undefined:phase<0.45?1:2}} />
    <StateBadge text={`${variable} = ${values[iteration]}`} x={330} y={211} width={160} />
    <DrawCodeBlock id={`${id}-output`} p={{position:[525,245],width:205,language:"output",title:prints>4?"Output · last 4 lines":"Output",code:values.slice(0,prints).slice(-4).map(outputFor).join("\n") || "…",append:true,reveal_from:99}} />
    <Connector from={[495,295]} to={[520,295]} color={COLORS.teal} />
    {!finished && phase<0.77 && <g transform={`translate(${token[0]},${token[1]})`} aria-label={`Value ${values[iteration]} moves to ${phase<0.45?"assignment":"output"}`}>
      <circle r={18} fill={COLORS.mango} stroke={COLORS.ink} strokeWidth={1.5} />
      <text textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={800} fill={COLORS.ink}>{values[iteration]}</text>
    </g>}
    <Explanation text={note} />
  </g>;
}

interface SearchStep { index: number; low: number; high: number; found: boolean }
/** Search cursor, comparisons, and the exact range discarded by binary search. */
export function AnimateSearch({ p, elapsed = 0, motion = true }: SceneProps) {
  const values = arr(p.values ?? [2,4,6,8,10,12,14]).slice(0,10).map(value=>num(value));
  const target = num(p.target,8);
  const binary = p.strategy === "binary";
  const steps: SearchStep[]=[];
  if(binary){
    let low=0,high=values.length-1;
    while(low<=high){
      const index=Math.floor((low+high)/2),found=values[index]===target;
      steps.push({index,low,high,found});
      if(found)break;
      if(values[index]<target)low=index+1;else high=index-1;
    }
  }else for(let index=0;index<values.length;index++){
    const found=values[index]===target;steps.push({index,low:index,high:values.length-1,found});if(found)break;
  }
  if(!steps.length)return null;
  const seconds=Math.max(1,num(p.step_seconds,2.5));
  const moment=playhead(elapsed,p,steps.length,seconds);
  const stepIndex=moment.index;
  const step=steps[stepIndex], phase=moment.phase;
  const done=moment.done;
  const previous=steps[Math.max(0,stepIndex-1)].index;
  const width=660/values.length;
  const cursor=mix(70+(previous+0.5)*width,70+(step.index+0.5)*width,motion?smooth(phase/0.25):1);
  const resolved = phase >= 0.65 || done;
  const low = resolved && !step.found ? binary && values[step.index] > target ? step.low : step.index + 1 : step.low;
  const high = resolved && !step.found && binary && values[step.index] > target ? step.index - 1 : step.high;
  const remaining = Math.max(0, high - low + 1);
  let note=done ? step.found ? `Found ${target} at index ${step.index} in ${steps.length} comparisons.` : `${target} is absent. All candidate positions have been checked.` : `Compare index ${step.index}: ${values[step.index]} ${values[step.index]===target?"=":values[step.index]<target?"<":">"} ${target}.`;
  if(!done && phase>0.45 && !step.found) note+=binary?values[step.index]<target?" Discard this midpoint and every value to its left.":" Discard this midpoint and every value to its right.":" Move one position to the right.";
  return <g>
    <TextBlock lines={[`${binary?"Binary":"Linear"} search · target ${target}`]} x={70} y={135} size={19} weight={700} />
    <StateBadge text={`Comparison ${stepIndex + 1} / ${steps.length}`} x={530} y={94} width={200} />
    {values.map((value,index)=><Cell key={index} x={70+index*width} y={215} width={width} value={str(value)} index={index} active={index===step.index} muted={index<low || index>high} done={done && step.found && index===step.index} />)}
    <g transform={`translate(${cursor},185)`}>
      <path d="M -10 -12 L 10 -12 L 0 0 Z" fill={COLORS.mango} />
      <text y={-22} textAnchor="middle" fontSize={12} fontWeight={700} fill={COLORS.ink}>{done ? step.found?"found":"checked":"compare"}</text>
    </g>
    {binary && <>
      {remaining > 0 && <line x1={70+low*width+5} x2={70+(high+1)*width-5} y1={323} y2={323} stroke={COLORS.teal} strokeWidth={4} strokeLinecap="round" />}
      <TextBlock lines={[remaining ? `Candidate range: indices ${low} to ${high} · ${remaining} values remain` : "No candidate positions remain: the target is absent"]} x={70} y={360} size={14} color={COLORS.teal} />
    </>}
    {!binary && <TextBlock lines={[done && step.found ? `Stop at index ${step.index}: target found` : `${remaining} candidate positions remain`]} x={70} y={360} size={14} color={COLORS.teal} />}
    <Explanation text={note} />
  </g>;
}

interface SortStep { values: number[]; index: number; swap: boolean; sortedFrom: number; pass: number; end: number }
/** Adjacent comparisons and swaps use bubble sort, never a random shuffle. */
export function AnimateSort({ p, elapsed = 0, motion = true }: SceneProps) {
  const initial=arr(p.values ?? [4,2,5,1]).slice(0,7).map(value=>num(value));
  const values=[...initial],steps:SortStep[]=[];
  for(let end=values.length-1;end>0;end--)for(let index=0;index<end;index++){
    const swap=values[index]>values[index+1];
    steps.push({values:[...values],index,swap,sortedFrom:end+1,pass:values.length-end,end});
    if(swap)[values[index],values[index+1]]=[values[index+1],values[index]];
  }
  const seconds=Math.max(0.8,num(p.step_seconds,1.8));
  const moment=playhead(elapsed,p,steps.length,seconds);
  const done=moment.done;
  const step=steps[moment.index];
  const shown=done?values:step?.values??values;
  const phase=moment.phase;
  const t=step?.swap?(motion?smooth((phase-0.35)/0.5):phase>0.5?1:0):0;
  const width=660/Math.max(1,values.length);
  const note=done?"Sorted: every neighboring pair is in ascending order.":step.swap?`${step.values[step.index]} > ${step.values[step.index+1]}: swap this adjacent pair.`:`${step.values[step.index]} ≤ ${step.values[step.index+1]}: keep this pair in place.`;
  const after = [...shown];
  if (!done && step?.swap) [after[step.index], after[step.index + 1]] = [after[step.index + 1], after[step.index]];
  return <g>
    <TextBlock lines={["Compare neighbors → swap if out of order"]} x={70} y={135} size={18} weight={700} />
    <StateBadge text={done ? "Every pass complete" : `Pass ${step?.pass} / ${Math.max(1, initial.length - 1)}`} x={525} y={82} width={205} />
    {shown.map((value,index)=>{
      const moving=!done && step?.swap && (index===step.index || index===step.index+1);
      const direction=index===step?.index?1:-1;
      const x=70+(index+(moving?direction*t:0))*width;
      const y=235+(moving && motion?direction*Math.sin(t*Math.PI)*42:0);
      const sortedFrom = !done && phase >= 0.85 && step.index === step.end - 1 ? step.end : step?.sortedFrom ?? initial.length;
      return <Cell key={index} x={x} y={y} width={width} value={str(value)} active={!done&&(index===step.index || index===step.index+1)} done={done || index>=sortedFrom} />;
    })}
    <TextBlock lines={[`Array ${done ? "sorted" : phase >= 0.85 ? "after this comparison" : "before this comparison"}: [${(done || phase < 0.85 ? shown : after).join(", ")}]`]} x={70} y={355} size={13} color={COLORS.teal} />
    <TextBlock lines={[done?`${steps.length} comparisons completed · green values are settled`:`Comparison ${moment.index+1} of ${steps.length} · green values are in their final positions`]} x={70} y={382} size={12} color={COLORS.muted} />
    <Explanation text={note} />
  </g>;
}

/** Insertions and removals demonstrate LIFO or FIFO while values actually move. */
export function AnimateCollection({ p, elapsed = 0, motion = true }: SceneProps) {
  const stack=p.structure==="stack";
  const initial=arr(p.values).slice(0,6).map(value=>str(value));
  const operations=arr<Record<string,unknown>>(p.operations).filter(op=>op&&typeof op==="object").slice(0,12);
  const seconds=Math.max(1,num(p.step_seconds,2.8));
  const moment=playhead(elapsed,p,operations.length,seconds);
  const step=moment.done?operations.length:moment.index;
  const values=[...initial];
  let lastRemoved: string | undefined;
  for(let i=0;i<step;i++){
    const op=operations[i];
    if(op.type==="push"||op.type==="enqueue")values.push(str(op.value));
    else if(op.type==="pop")lastRemoved=values.pop();else if(op.type==="dequeue")lastRemoved=values.shift();
  }
  const op=operations[step];
  const insert=op?.type==="push"||op?.type==="enqueue";
  const remove=op?.type==="pop"||op?.type==="dequeue";
  const t=motion?smooth(moment.phase/0.8):moment.phase>0.4?1:0;
  const baseX=stack?305:80,baseY=stack?125:235,width=stack?190:100;
  const cellPos=(index:number):[number,number]=>stack?[baseX,baseY+(5-index)*43]:[baseX+index*width,baseY];
  const disappearing=stack?values.length-1:0;
  const note=!op?`${stack?"Stack":"Queue"} operations complete. ${values.length} values remain.`:insert?`${str(op.type)} ${str(op.value)}: add the value at the ${stack?"top":"back"}.`:values.length?`${str(op.type)} removes ${values[disappearing]} from the ${stack?"top":"front"}.`:`${str(op.type)}: the collection is empty, so nothing can be removed.`;
  return <g>
    <TextBlock lines={[stack?"Stack · last in, first out":"Queue · first in, first out"]} x={70} y={105} size={19} weight={700} />
    <StateBadge text={`Size: ${values.length}${op ? insert ? " → " + (values.length + 1) : remove && values.length ? " → " + (values.length - 1) : "" : ""}`} x={70} y={140} width={180} />
    <StateBadge text={op ? `${str(op.type)}${insert ? " " + str(op.value) : "()"}` : "Operations complete"} x={535} y={140} width={195} />
    {stack && values.length > 0 && <TextBlock lines={[`Top: ${values[values.length - 1]}`]} x={535} y={205} size={13} color={COLORS.teal} />}
    {lastRemoved !== undefined && <TextBlock lines={[`Last removed: ${lastRemoved}`]} x={535} y={375} size={12} color={COLORS.muted} />}
    {values.slice(0,6).map((value,index)=>{
      const [x,y]=cellPos(index);
      const leaving=remove && index===disappearing;
      const shift=!stack && remove && index>0?-width*t:0;
      return <g key={index} opacity={leaving?1-t:1} transform={`translate(${leaving?120*t:shift},${leaving&&stack?-70*t:0})`}>
        <Cell x={x} y={y} width={width} value={value} active={leaving} />
      </g>;
    })}
    {insert && values.length<6 && (()=>{
      const [x,y]=cellPos(values.length);
      return <g transform={`translate(${stack?0:(1-t)*100},${stack?-(1-t)*110:0})`} opacity={0.35+0.65*t}><Cell x={x} y={y} width={width} value={str(op.value)} active /></g>;
    })()}
    {!stack && <><TextBlock lines={["front · remove here"]} x={80} y={335} size={12} color={COLORS.teal} /><TextBlock lines={["back · add here"]} x={535} y={335} size={12} color={COLORS.pink} /></>}
    <Explanation text={note} />
  </g>;
}

/** A labeled value follows a real data/control-flow connection and then settles. */
export function AnimateTransfer({ p, elapsed = 0, motion = true }: SceneProps) {
  const from = Array.isArray(p.from) ? [num(p.from[0]), num(p.from[1])] : [100,100];
  const to = Array.isArray(p.to) ? [num(p.to[0]), num(p.to[1])] : [300,100];
  const duration = Math.max(0.4, num(p.duration_seconds,1.4));
  if(elapsed>=duration+0.45)return null;
  const t=motion?smooth(elapsed/duration):1;
  const x=mix(from[0],to[0],t),y=mix(from[1],to[1],t);
  const label=str(p.label).slice(0,28);
  return <g opacity={elapsed>duration?1-(elapsed-duration)/0.45:1} aria-label={label?`${label} moves to its destination`:"Execution advances to the next step"}>
    <circle cx={x} cy={y} r={7} fill={COLORS.mango} stroke={COLORS.ink} strokeWidth={1.5} />
    {label && <>
      <rect x={Math.min(660,Math.max(8,x-60))} y={Math.max(5,y-36)} width={120} height={24} rx={12} fill={COLORS.ink} />
      <CenteredLabel cx={Math.min(660,Math.max(8,x-60))+60} cy={Math.max(5,y-36)+12} text={label} maxWidth={108} size={11} color={COLORS.paper} maxLines={1} />
    </>}
  </g>;
}
