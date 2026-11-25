import repository from "./LessonGenerations.repository.js";
import lessonsService from "../Lessons/Lessons.service.js";
import { prepareLessonWhiteboards } from "../../Whiteboard/prepareLessonWhiteboards.js";
import { validateGeneratedSection } from "./lessonQuality.js";
import { inspectInput } from '../../Security/input.js';

const MODEL = "gemini-2.5-flash";

/** The model credential stays on the backend and is never stored with a generation request. */
export async function generateJson(
  prompt,
  { model = process.env.GEMINI_MODEL || MODEL, signal } = {},
) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey)
    throw new Error(
      "The lesson generation service is not connected. Ask your administrator to configure the model provider.",
    );
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": apiKey },
      signal: signal || AbortSignal.timeout(120000),
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.35,
          responseMimeType: "application/json",
          maxOutputTokens: 16384,
        },
      }),
    },
  );
  if (!response.ok)
    throw new Error(
      `The model provider could not complete the request (HTTP ${response.status}). Check the model connection and retry.`,
    );
  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || "")
    .join("");
  if (!content)
    throw new Error(
      "The model provider returned no lesson content. Try adjusting the lesson specification.",
    );
  try {
    if (content.length > 1000000) throw new Error('Model response too large.');
    const generated = JSON.parse(content);
    inspectInput(generated);
    return generated;
  } catch {
    throw new Error("The model returned incomplete lesson JSON. Please retry.");
  }
}

const SECTION_CONTRACT = `Return one JSON section with order, title, purpose, covers_objectives, blocks, whiteboard: {plan: {beats}}, diagnostic_check, remediation_blocks.
blocks: paragraph {type:"paragraph",text}, code {type:"code",language,code,expected_output}, list {type:"list",items}, callout {type:"callout",callout_type:"tip",text}.
diagnostic_check: {concept_tag,question_text,code_snippet,options:[3-5 distinct strings],correct_answer,misconception_map:{each wrong option: specific feedback},explanation}. Use a different worked question from the whiteboard prediction.
Write at least 2 reading blocks, a 20-word-or-longer step-by-step answer explanation and 8-word-or-longer feedback for each distractor. Ask a precise question of at least 15 words, with all relevant inputs and context.
Use at least 3 beats: concept, worked example, recap. Every beat needs layout, title, steps:[{say,...fields}]. Each spoken step explains one observable change and why it follows. Do not use arbitrary coordinates.
Supported layouts and fields:
statement: {title,steps:[{say,text}]} (at most 3 steps per beat).
code: {title,code:[lines],steps:[{say,lines:[1-based line numbers],note?,output:[complete output so far]?}]} (at most 8 code lines per beat).
boxes: {title,steps:[{say,line?,set:[variableName,displayValue],note?,output?}]} (at most 4 variables, 6 code lines).
trace: {title,columns:[column names],rows:[[cell strings]],steps:[{say,rows:1,note?}]} (at most 6 rows; each step reveals the next row).
algorithm: {title,algorithm:"loop"|"search"|"sort"|"stack"|"queue",values:[actual values],target:number for search,strategy:"binary"|"linear",prefix:string for loop,variable:string for loop,step_seconds:4,operations:[{type:"push"|"pop"|"enqueue"|"dequeue",value?}],steps:[{say}]}.
recap: {title,steps:[{say,text}]} (at most 4 steps).
Any step may include ask:{question,answer,hint?,explanation?,code?}. Include at least one prediction before its result is revealed. Answer must be verified from the example; use the exact output with line breaks, never pretend to execute arbitrary code.
Respect the supplied algorithm limits, sorting preconditions and scope constraints. Use only these supported layout fields. Keep labels short and put longer reasoning in say.`;

/** A real two-pass job: outline, author each section, validate/compile, then save the draft. */
export async function runLessonGeneration(
  job,
  {
    generate = generateJson,
    update = (id, data) => repository.update(id, data),
    save = (data) => lessonsService.createLesson(data),
  } = {},
) {
  const id = job._id || job.job_id;
  const report = (step, progress, message, extra = {}) =>
    update(id, {
      status: "processing",
      current_step: step,
      progress_percent: progress,
      step_message: message,
      ...extra,
    });
  try {
    const specification = {
      topic: job.topic,
      language: job.programming_language,
      grade: job.grade_level,
      objectives: job.objectives,
      prerequisites: job.prerequisites,
      duration_minutes: job.target_duration_minutes || job.duration || 15,
      subject: job.subject_area,
      curriculum: job.curriculum_standard,
      constraints: job.scope_constraints,
      depth: job.desired_depth || "comprehensive",
      instructions: job.special_instructions,
      reference_notes: job.reference_notes,
    };
    const policy = JSON.stringify(job.whiteboard_generation);
    await report(
      "outline",
      0.08,
      "Building an outline around your objectives and prerequisites.",
    );
    const outline = await generate(
      `You are ALMA, a careful secondary-school teacher. Create a coherent lesson outline for this specification: ${JSON.stringify(specification)}. Return JSON {title,introduction:[paragraph blocks],conclusion:[paragraph blocks],sections:[{order,title,purpose,covers_objectives}]}. Use 3-6 sections with a progression from intuition to a concrete worked example, an edge case or common mistake, and guided practice. Do not introduce topics excluded by the scope. The whiteboard teaching policy is ${policy}.`,
      { model: job.model },
    );
    if (
      !Array.isArray(outline.sections) ||
      outline.sections.length < 3 ||
      outline.sections.length > 6
    )
      throw new Error(
        "The generated outline must contain three to six teaching sections.",
      );
    await report(
      "sections",
      0.15,
      `Authoring ${outline.sections.length} sections with worked animations and detailed checks.`,
      { outline: outline.sections },
    );
    const sections = [];
    for (const [index, planned] of outline.sections.entries()) {
      await report(
        "sections",
        0.15 + (index / outline.sections.length) * 0.6,
        `Writing section ${index + 1} of ${outline.sections.length}: ${planned.title}`,
      );
      const prompt = `${SECTION_CONTRACT}\nSpecification: ${JSON.stringify(specification)}\nWhole lesson outline: ${JSON.stringify(outline.sections)}\nAuthor this section: ${JSON.stringify(planned)}\nWhiteboard policy: ${policy}`;
      let section = await generate(prompt, { model: job.model });
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          validateGeneratedSection(section);
          const compiled = prepareLessonWhiteboards({
            sections: [{ ...section, order: index + 1 }],
          }).sections[0];
          sections.push(compiled);
          break;
        } catch (error) {
          if (attempt === 1)
            throw new Error(
              `Section ${index + 1} could not pass quality checks: ${error.message}`,
            );
          section = await generate(
            `${prompt}\nRepair this section without changing its learning goal. Validation errors: ${error.message}\nCurrent section: ${JSON.stringify(section)}`,
            { model: job.model },
          );
        }
      }
    }
    await report(
      "segmenting",
      0.82,
      "Aligning spoken explanations with the completed whiteboard timelines.",
    );
    const segments = sections.map((section) => ({
      order_in_lesson: section.order,
      title: section.title,
      narration_text: section.whiteboard.narration,
      est_seconds: Math.ceil(section.whiteboard.duration_seconds),
      attached_code:
        section.blocks.find((block) => block.type === "code")?.code || null,
    }));
    await report(
      "validating",
      0.93,
      "Checking question answers, feedback, animation timing and supported layouts.",
    );
    const review = await generate(
      `Review the following lesson independently as a careful subject teacher. Trace every worked example and question using its exact inputs. Check that each correct_answer is correct, each distractor is wrong for its stated reason, code output agrees with the code, explanations fit the grade and scope, and animation values match the worked example. Do not execute code or assume omitted inputs. Return JSON {checks:[{section_order:number,passed:boolean,issues:[specific errors]}]}. Include exactly one check for every section; mark passed false if any answer, example or animation cannot be verified from its inputs. Specification: ${JSON.stringify(specification)}. Sections: ${JSON.stringify(sections.map(({ whiteboard, ...section }) => ({ ...section, whiteboard_plan: whiteboard.plan })))}`,
      { model: job.model },
    );
    if (
      !Array.isArray(review.checks) ||
      review.checks.length !== sections.length ||
      sections.some(
        (section) =>
          !review.checks.some(
            (check) =>
              check.section_order === section.order &&
              check.passed === true &&
              Array.isArray(check.issues) &&
              !check.issues.length,
          ),
      )
    ) {
      throw new Error(
        "The teaching review found an unverified example or answer. Refine the specification and regenerate before publishing.",
      );
    }
    const lesson = await save({
      topic: job.topic,
      programming_language: job.programming_language,
      grade_level: job.grade_level,
      target_duration_minutes: specification.duration_minutes,
      course_id: job.course_id || null,
      module_id: job.module_id || null,
      created_by: job.requested_by || null,
      current_version_no: 1,
      approved_version_no: null,
      versions: [
        {
          version_no: 1,
          state: "AWAITING_REVIEW",
          title: outline.title || job.topic,
          introduction: Array.isArray(outline.introduction)
            ? outline.introduction
            : [],
          conclusion: Array.isArray(outline.conclusion)
            ? outline.conclusion
            : [],
          sections,
          segments,
        },
      ],
    });
    await update(id, {
      status: "completed",
      current_step: "completed",
      progress_percent: 1,
      lesson_id: lesson._id.toString(),
      completed_at: new Date(),
      step_message:
        "Your lesson draft is ready. Preview its whiteboards and questions before publishing.",
      quality_report: {
        section_count: sections.length,
        whiteboard_count: sections.length,
        checkpoint_count: sections.length,
        teaching_review: review.checks,
        checks: [
          "Supported layouts compiled",
          "Detailed checkpoint and distractor feedback",
          "Prediction before reveal",
          "Narration aligned with animation",
          "Worked examples reviewed by the model",
        ],
      },
    });
    return lesson;
  } catch (error) {
    await update(id, {
      status: "failed",
      current_step: "failed",
      step_message:
        "The lesson could not be generated. Review the details and try again.",
      error: error.message,
    });
    return null;
  }
}
