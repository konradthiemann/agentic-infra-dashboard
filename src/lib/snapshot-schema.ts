import { z } from "zod";

export const repoCiStatusSchema = z.object({
  workflow: z.string(),
  status: z.string(),
  conclusion: z.string().nullable(),
  updatedAt: z.string(),
  url: z.string(),
});
export type RepoCiStatus = z.infer<typeof repoCiStatusSchema>;

export const repoInfoSchema = z.object({
  slug: z.string(),
  name: z.string(),
  role: z.string(),
  stack: z.array(z.string()),
  githubUrl: z.string().nullable(),
  deployTarget: z.string().nullable(),
  defaultBranch: z.string(),
  hasOwnClaudeConfig: z.boolean(),
  lastCommit: z
    .object({
      sha: z.string(),
      message: z.string(),
      date: z.string(),
      author: z.string(),
    })
    .nullable(),
  ci: repoCiStatusSchema.nullable(),
});
export type RepoInfo = z.infer<typeof repoInfoSchema>;

export const agentInfoSchema = z.object({
  name: z.string(),
  description: z.string(),
  tools: z.array(z.string()),
  model: z.string().nullable(),
  example: z.string().nullable(),
});
export type AgentInfo = z.infer<typeof agentInfoSchema>;

export const skillInfoSchema = z.object({
  name: z.string(),
  description: z.string(),
  triggerHint: z.string().nullable(),
  example: z.string().nullable(),
});
export type SkillInfo = z.infer<typeof skillInfoSchema>;

export const ruleInfoSchema = z.object({
  slug: z.string(),
  title: z.string(),
  summary: z.string(),
});
export type RuleInfo = z.infer<typeof ruleInfoSchema>;

export const hookInfoSchema = z.object({
  name: z.string(),
  file: z.string(),
  events: z.array(z.string()),
  purpose: z.string(),
});
export type HookInfo = z.infer<typeof hookInfoSchema>;

export const tddGateAggregateSchema = z.object({
  windowDays: z.number(),
  totalBlocks: z.number(),
  byRepo: z.record(z.string(), z.number()),
  byGate: z.record(z.string(), z.number()),
  recentEvents: z.array(
    z.object({
      timestamp: z.string(),
      repo: z.string(),
      gate: z.string(),
      command: z.string(),
    }),
  ),
});
export type TddGateAggregate = z.infer<typeof tddGateAggregateSchema>;

export const monitoringDataSchema = z.object({
  tddGate: tddGateAggregateSchema,
  ci: z.array(repoCiStatusSchema.extend({ repo: z.string() })),
});
export type MonitoringData = z.infer<typeof monitoringDataSchema>;

export const workflowStepSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string().nullable(),
  branch: z.string().nullable(),
});
export type WorkflowStep = z.infer<typeof workflowStepSchema>;

export const workflowEdgeSchema = z.object({
  from: z.string(),
  to: z.string(),
  label: z.string().nullable(),
});
export type WorkflowEdge = z.infer<typeof workflowEdgeSchema>;

export const workflowDiagramSchema = z.object({
  slug: z.string(),
  title: z.string(),
  description: z.string(),
  steps: z.array(workflowStepSchema),
  edges: z.array(workflowEdgeSchema),
});
export type WorkflowDiagram = z.infer<typeof workflowDiagramSchema>;

export const snapshotSchema = z.object({
  generatedAt: z.string(),
  workspace: z.object({
    repoCount: z.number(),
    agentCount: z.number(),
    skillCount: z.number(),
  }),
  repos: z.array(repoInfoSchema),
  agents: z.array(agentInfoSchema),
  skills: z.array(skillInfoSchema),
  rules: z.array(ruleInfoSchema),
  hooks: z.array(hookInfoSchema),
  workflows: z.array(workflowDiagramSchema),
  monitoring: monitoringDataSchema,
});
export type Snapshot = z.infer<typeof snapshotSchema>;
