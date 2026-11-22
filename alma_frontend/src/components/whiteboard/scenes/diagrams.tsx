/** Animated data structures, flowcharts and science figures. */
import type { SceneProps } from "@/types/Whiteboard.type";
import { ACCENTS, COLORS } from "../theme";
import { arr, CenteredLabel, Connector, num, point, stagger, str, TextBlock } from "./helpers";

/** draw_array / draw_stack / draw_queue: values, position, width, active_index, label. */
export function DrawStructure({ p }: SceneProps) {
  const [x, y] = point(p.position, [80, 190]);
  const values = arr(p.values ?? p.items).slice(0, 16).map((value) => str(value));
  const vertical = p.structure === "stack";
  const width = Math.max(40, Math.min(num(p.width, vertical ? 160 : 640), 780 - x));
  const cellW = vertical ? width : width / Math.max(1, values.length);
  const cellH = vertical ? Math.min(44, (440 - y) / Math.max(1, values.length)) : 58;
  const active = num(p.active_index, -1);
  return (
    <g>
      <TextBlock lines={[str(p.label, vertical ? "Stack · last in, first out" : p.structure === "queue" ? "Queue · first in, first out" : "Array · access by index")]} x={x} y={y - 22} size={17} weight={700} />
      {values.map((value, i) => {
        const left = vertical ? x : x + i * cellW;
        const top = vertical ? y + (values.length - i - 1) * cellH : y;
        const color = i === active ? COLORS.mango : ACCENTS[i % ACCENTS.length];
        return (
          <g key={i} className="wb-item" style={stagger(i, 120)}>
            <rect x={left + 2} y={top + 2} width={cellW - 4} height={cellH - 4} rx={9} fill={i === active ? COLORS.mangoSoft : COLORS.paper} stroke={color} strokeWidth={i === active ? 3 : 2} />
            <CenteredLabel cx={left + cellW / 2} cy={top + cellH / 2} text={value} maxWidth={cellW - 12} size={14} mono maxLines={2} />
            <text x={vertical ? left - 12 : left + cellW / 2} y={vertical ? top + cellH / 2 + 4 : top + cellH + 19} textAnchor={vertical ? "end" : "middle"} fontSize={11} fill={COLORS.muted}>{i}</text>
          </g>
        );
      })}
      {p.structure === "queue" && values.length > 0 && <>
        <TextBlock lines={["front"]} x={x} y={y + cellH + 45} size={12} color={COLORS.teal} />
        <TextBlock lines={["back"]} x={x + width - 40} y={y + cellH + 45} size={12} color={COLORS.pink} />
      </>}
    </g>
  );
}

/** draw_flowchart / draw_tree / draw_network: nodes [{id,label,position?,kind?}], edges [{from,to,label?}]. */
export function DrawDiagram({ p }: SceneProps) {
  const [x, y] = point(p.position, [70, 160]);
  const nodes = arr<unknown>(p.nodes).filter((node) => node && typeof node === "object").slice(0, 20).map((node, index) => {
    const value = node as Record<string, unknown>;
    const columns = Math.min(4, num(p.columns, 4));
    return { id: str(value.id, String(index)), label: str(value.label, `Step ${index + 1}`), kind: str(value.kind), at: point(value.position, [x + (index % columns) * 174, y + Math.floor(index / columns) * 112]) };
  });
  const edges = arr<Record<string, unknown>>(p.edges).filter((edge) => edge && typeof edge === "object");
  return (
    <g>
      {edges.map((edge, i) => {
        const from = nodes.find((node) => node.id === str(edge.from));
        const to = nodes.find((node) => node.id === str(edge.to));
        if (!from || !to) return null;
        const dx = to.at[0] - from.at[0], dy = to.at[1] - from.at[1];
        const distance = Math.hypot(dx, dy) || 1;
        const inset = Math.min(70, distance / 3);
        const start: [number, number] = [from.at[0] + 65 + dx / distance * inset, from.at[1] + 30 + dy / distance * inset];
        const end: [number, number] = [to.at[0] + 65 - dx / distance * inset, to.at[1] + 30 - dy / distance * inset];
        return <g key={i} className="wb-fade" style={stagger(i, 150)}>
          <Connector from={start} to={end} color={COLORS.teal} />
          {edge.label != null && <text x={(start[0] + end[0]) / 2} y={(start[1] + end[1]) / 2 - 8} textAnchor="middle" fontSize={11} fill={COLORS.muted}>{str(edge.label)}</text>}
        </g>;
      })}
      {nodes.map((node, i) => <g key={`${node.id}-${i}`} className="wb-item" style={stagger(i, 140)}>
        {node.kind === "decision" ? <path d={`M ${node.at[0]+65} ${node.at[1]-10} L ${node.at[0]+140} ${node.at[1]+30} L ${node.at[0]+65} ${node.at[1]+70} L ${node.at[0]-10} ${node.at[1]+30} Z`} fill={COLORS.mangoSoft} stroke={COLORS.mango} strokeWidth={2} /> :
          <rect x={node.at[0]} y={node.at[1]} width={130} height={60} rx={node.kind === "terminal" ? 30 : 12} fill={COLORS.tealSoft} stroke={COLORS.teal} strokeWidth={2} />}
        <CenteredLabel cx={node.at[0]+65} cy={node.at[1]+30} text={node.label} maxWidth={110} size={13} maxLines={2} />
      </g>)}
    </g>
  );
}

/** draw_physics_shape: shape_type (pendulum, spring, wave, triangle), position, size, label. */
export function DrawPhysicsShape({ p, elapsed = 0, motion = true }: SceneProps) {
  const [x, y] = point(p.position, [180, 160]);
  const [w, h] = point(p.size, [300, 200]);
  const kind = str(p.shape_type, "wave");
  const label = str(p.label);
  const phase = motion ? elapsed * Math.PI * 2 / Math.max(0.5, num(p.period_seconds, 3)) : 0;
  const wave = Array.from({ length: 65 }, (_, i) => `${x + w*i/64},${y + h/2 + Math.sin(i/64*Math.PI*4-phase)*h/3}`).join(" ");
  const springW = w * (0.75 + Math.sin(phase) * 0.18);
  const spring = Array.from({ length: 21 }, (_, i) => `${x + springW*i/20},${y + h/2 + (i===0 || i===20 ? 0 : i%2 ? -h/5 : h/5)}`).join(" ");
  const angle = Math.sin(phase) * 18;
  return <g>
    {kind === "pendulum" ? <>
      <line x1={x+w/2-55} x2={x+w/2+55} y1={y} y2={y} stroke={COLORS.ink} strokeWidth={4} />
      <line x1={x+w/2} x2={x+w/2} y1={y} y2={y+h} stroke={COLORS.line} strokeWidth={2} strokeDasharray="4 5" />
      <g className="wb-pendulum" style={{ transformOrigin: `${x+w/2}px ${y}px`, transform: `rotate(${angle}deg)` }}>
        <Connector from={[x+w/2,y]} to={[x+w/2,y+h-24]} arrow={false} color={COLORS.muted} />
        <circle cx={x+w/2} cy={y+h-24} r={22} fill={COLORS.mango} stroke={COLORS.ink} strokeWidth={2} />
      </g>
      <circle cx={x+w/2} cy={y} r={4} fill={COLORS.ink} />
      <text x={x+w/2+10} y={y+22} fontSize={11} fill={COLORS.muted}>θ = {angle.toFixed(0)}°</text>
    </> : kind === "triangle" ? <path className="wb-outline" pathLength={1} d={`M ${x} ${y+h} L ${x+w/2} ${y} L ${x+w} ${y+h} Z`} fill={COLORS.tealSoft} stroke={COLORS.teal} strokeWidth={3} /> :
      <>
        <line x1={x} x2={x+w} y1={y+h/2} y2={y+h/2} stroke={COLORS.line} strokeDasharray="5 5" />
        <polyline className="wb-stroke" pathLength={1} points={kind === "spring" ? spring : wave} fill="none" stroke={COLORS.teal} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
        {kind === "spring" ? <rect x={x+springW} y={y+h/2-20} width={35} height={40} rx={5} fill={COLORS.mango} stroke={COLORS.ink} /> : <>
          <circle cx={x+w/2} cy={y+h/2+Math.sin(-phase)*h/3} r={5} fill={COLORS.mango} />
          <Connector from={[x+w*0.25,y-14]} to={[x+w*0.75,y-14]} color={COLORS.muted} />
          <text x={x+w/2} y={y-23} textAnchor="middle" fontSize={11} fill={COLORS.muted}>Wave travels →</text>
        </>}
      </>}
    {label && <CenteredLabel cx={x+w/2} cy={y+h+26} text={label} maxWidth={w} size={15} />}
  </g>;
}
