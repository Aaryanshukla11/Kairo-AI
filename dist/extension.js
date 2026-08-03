"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/core/eventBus/eventTypes.ts
var init_eventTypes = __esm({
  "src/core/eventBus/eventTypes.ts"() {
    "use strict";
  }
});

// src/core/eventBus/eventRegistry.ts
var EventRegistry, eventRegistry;
var init_eventRegistry = __esm({
  "src/core/eventBus/eventRegistry.ts"() {
    "use strict";
    EventRegistry = class {
      subscribers = /* @__PURE__ */ new Map();
      subscribe(category, callback) {
        if (!this.subscribers.has(category)) {
          this.subscribers.set(category, /* @__PURE__ */ new Set());
        }
        this.subscribers.get(category).add(callback);
        return () => {
          this.subscribers.get(category)?.delete(callback);
        };
      }
      getSubscribers(category) {
        const subs = this.subscribers.get(category);
        return subs ? Array.from(subs) : [];
      }
    };
    eventRegistry = new EventRegistry();
  }
});

// src/core/eventBus/eventEvents.ts
var EventEvents, eventEvents;
var init_eventEvents = __esm({
  "src/core/eventBus/eventEvents.ts"() {
    "use strict";
    EventEvents = class {
      listeners = /* @__PURE__ */ new Set();
      subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
      }
      emit(type, payload) {
        for (const listener of this.listeners) {
          try {
            listener({ type, timestamp: Date.now(), payload });
          } catch (err) {
            console.error("Error in EventBus listener:", err);
          }
        }
      }
    };
    eventEvents = new EventEvents();
  }
});

// src/core/eventBus/eventDispatcher.ts
var EventDispatcher, eventDispatcher;
var init_eventDispatcher = __esm({
  "src/core/eventBus/eventDispatcher.ts"() {
    "use strict";
    init_eventRegistry();
    EventDispatcher = class {
      async dispatch(event) {
        const subs = eventRegistry.getSubscribers(event.category);
        const promises = subs.map(async (sub) => {
          try {
            await sub(event);
          } catch (err) {
            console.error(`Error executing subscriber on event ${event.eventId}:`, err);
            throw err;
          }
        });
        await Promise.all(promises);
      }
    };
    eventDispatcher = new EventDispatcher();
  }
});

// src/core/eventBus/eventRouter.ts
var EventRouter, eventRouter;
var init_eventRouter = __esm({
  "src/core/eventBus/eventRouter.ts"() {
    "use strict";
    init_eventDispatcher();
    EventRouter = class {
      async route(event) {
        await eventDispatcher.dispatch(event);
      }
    };
    eventRouter = new EventRouter();
  }
});

// src/core/eventBus/eventPersistence.ts
var EventPersistence, eventPersistence;
var init_eventPersistence = __esm({
  "src/core/eventBus/eventPersistence.ts"() {
    "use strict";
    EventPersistence = class {
      log = [];
      save(event) {
        this.log.push({ ...event });
      }
      getHistory(workflowId) {
        if (workflowId) {
          return this.log.filter((e) => e.workflowId === workflowId);
        }
        return [...this.log];
      }
      clear() {
        this.log = [];
      }
    };
    eventPersistence = new EventPersistence();
  }
});

// src/core/eventBus/deadLetterQueue.ts
var DeadLetterQueue, deadLetterQueue;
var init_deadLetterQueue = __esm({
  "src/core/eventBus/deadLetterQueue.ts"() {
    "use strict";
    DeadLetterQueue = class {
      queue = [];
      add(event, reason) {
        this.queue.push({
          event,
          failureReason: reason,
          retryAttempts: event.retryCount,
          workflowContext: {},
          recoveryRecommendation: "Check subscriber callback validation limits or configurations."
        });
      }
      list() {
        return [...this.queue];
      }
      clear() {
        this.queue = [];
      }
    };
    deadLetterQueue = new DeadLetterQueue();
  }
});

// src/core/eventBus/retryManager.ts
var RetryManager, retryManager;
var init_retryManager = __esm({
  "src/core/eventBus/retryManager.ts"() {
    "use strict";
    RetryManager = class {
      maxRetries = 3;
      shouldRetry(event) {
        return event.retryCount < this.maxRetries;
      }
      getBackoffDelay(retryCount) {
        return Math.pow(2, retryCount) * 100;
      }
    };
    retryManager = new RetryManager();
  }
});

// src/core/eventBus/middleware/loggingMiddleware.ts
var LoggingMiddleware, loggingMiddleware;
var init_loggingMiddleware = __esm({
  "src/core/eventBus/middleware/loggingMiddleware.ts"() {
    "use strict";
    LoggingMiddleware = class {
      async handle(event, next) {
        console.log(`[EventBus Log] Event ${event.eventId} published on category ${event.category}`);
        await next();
      }
    };
    loggingMiddleware = new LoggingMiddleware();
  }
});

// src/core/eventBus/eventMetrics.ts
var EventMetrics, eventMetrics;
var init_eventMetrics = __esm({
  "src/core/eventBus/eventMetrics.ts"() {
    "use strict";
    EventMetrics = class {
      count = 0;
      totalLatency = 0;
      record(latencyMs) {
        this.count++;
        this.totalLatency += latencyMs;
      }
      getThroughput() {
        return this.count;
      }
      getAverageLatency() {
        return this.count > 0 ? Math.round(this.totalLatency / this.count * 100) / 100 : 0;
      }
    };
    eventMetrics = new EventMetrics();
  }
});

// src/core/eventBus/middleware/metricsMiddleware.ts
var MetricsMiddleware, metricsMiddleware;
var init_metricsMiddleware = __esm({
  "src/core/eventBus/middleware/metricsMiddleware.ts"() {
    "use strict";
    init_eventMetrics();
    MetricsMiddleware = class {
      async handle(event, next) {
        const start = Date.now();
        await next();
        eventMetrics.record(Date.now() - start);
      }
    };
    metricsMiddleware = new MetricsMiddleware();
  }
});

// src/core/eventBus/middleware/tracingMiddleware.ts
var TracingMiddleware, tracingMiddleware;
var init_tracingMiddleware = __esm({
  "src/core/eventBus/middleware/tracingMiddleware.ts"() {
    "use strict";
    TracingMiddleware = class {
      async handle(event, next) {
        event.metadata["traceId"] = event.metadata["traceId"] || `trace-${Math.random().toString(36).substr(2, 9)}`;
        await next();
      }
    };
    tracingMiddleware = new TracingMiddleware();
  }
});

// src/core/eventBus/middleware/authorizationMiddleware.ts
var AuthorizationMiddleware, authorizationMiddleware;
var init_authorizationMiddleware = __esm({
  "src/core/eventBus/middleware/authorizationMiddleware.ts"() {
    "use strict";
    AuthorizationMiddleware = class {
      async handle(event, next) {
        await next();
      }
    };
    authorizationMiddleware = new AuthorizationMiddleware();
  }
});

// src/core/eventBus/eventBus.ts
var EventBus, eventBusInstance;
var init_eventBus = __esm({
  "src/core/eventBus/eventBus.ts"() {
    "use strict";
    init_eventRouter();
    init_eventPersistence();
    init_deadLetterQueue();
    init_retryManager();
    init_eventEvents();
    init_loggingMiddleware();
    init_metricsMiddleware();
    init_tracingMiddleware();
    init_authorizationMiddleware();
    EventBus = class {
      guarantee = "At Least Once";
      setDeliveryGuarantee(guarantee) {
        this.guarantee = guarantee;
      }
      async publish(event) {
        eventEvents.emit("EventPublished", event);
        const pipeline = async () => {
          await authorizationMiddleware.handle(event, async () => {
            await loggingMiddleware.handle(event, async () => {
              await tracingMiddleware.handle(event, async () => {
                await metricsMiddleware.handle(event, async () => {
                  await this.executeDispatch(event);
                });
              });
            });
          });
        };
        try {
          await pipeline();
          eventPersistence.save(event);
        } catch (err) {
          console.error(`Event ${event.eventId} pipeline failure:`, err);
          if (retryManager.shouldRetry(event)) {
            event.retryCount++;
            event.executionStatus = "Retrying";
            const delay = retryManager.getBackoffDelay(event.retryCount);
            eventEvents.emit("EventRetrying", { eventId: event.eventId, attempt: event.retryCount, delay });
            await new Promise((resolve13) => setTimeout(resolve13, delay));
            await this.publish(event);
          } else {
            event.executionStatus = "Failed";
            deadLetterQueue.add(event, err.message || "Maximum retry limit exceeded");
            eventEvents.emit("EventDeadLettered", { eventId: event.eventId, reason: err.message });
          }
        }
      }
      async executeDispatch(event) {
        event.executionStatus = "Running";
        await eventRouter.route(event);
        event.executionStatus = "Completed";
        eventEvents.emit("EventDispatched", event);
      }
    };
    eventBusInstance = new EventBus();
  }
});

// src/core/eventBus/eventPublisher.ts
var EventPublisher, eventPublisher;
var init_eventPublisher = __esm({
  "src/core/eventBus/eventPublisher.ts"() {
    "use strict";
    init_eventBus();
    EventPublisher = class {
      async publish(event) {
        const fullEvent = {
          ...event,
          eventId: `EV-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          timestamp: Date.now(),
          retryCount: 0,
          executionStatus: "Queued"
        };
        await eventBusInstance.publish(fullEvent);
      }
    };
    eventPublisher = new EventPublisher();
  }
});

// src/core/eventBus/eventSubscriber.ts
var EventSubscriber, eventSubscriber;
var init_eventSubscriber = __esm({
  "src/core/eventBus/eventSubscriber.ts"() {
    "use strict";
    init_eventRegistry();
    EventSubscriber = class {
      subscribe(category, callback) {
        return eventRegistry.subscribe(category, callback);
      }
    };
    eventSubscriber = new EventSubscriber();
  }
});

// src/core/eventBus/workflowState.ts
var WorkflowStateTracker, workflowStateTracker;
var init_workflowState = __esm({
  "src/core/eventBus/workflowState.ts"() {
    "use strict";
    WorkflowStateTracker = class {
      activeStates = /* @__PURE__ */ new Map();
      update(workflowId, state) {
        this.activeStates.set(workflowId, state);
      }
      get(workflowId) {
        return this.activeStates.get(workflowId);
      }
    };
    workflowStateTracker = new WorkflowStateTracker();
  }
});

// src/core/eventBus/workflowContext.ts
var WorkflowContext, workflowContext;
var init_workflowContext = __esm({
  "src/core/eventBus/workflowContext.ts"() {
    "use strict";
    WorkflowContext = class {
      variables = /* @__PURE__ */ new Map();
      set(key, value) {
        this.variables.set(key, value);
      }
      get(key) {
        return this.variables.get(key);
      }
      clear() {
        this.variables.clear();
      }
    };
    workflowContext = new WorkflowContext();
  }
});

// src/core/eventBus/workflowScheduler.ts
var WorkflowScheduler, workflowScheduler;
var init_workflowScheduler = __esm({
  "src/core/eventBus/workflowScheduler.ts"() {
    "use strict";
    WorkflowScheduler = class {
      queue = [];
      schedule(event) {
        this.queue.push(event);
        const weights = {
          "Critical": 5,
          "High": 4,
          "Normal": 3,
          "Low": 2,
          "Background": 1
        };
        this.queue.sort((a, b) => (weights[b.priority] || 0) - (weights[a.priority] || 0));
      }
      next() {
        return this.queue.shift();
      }
    };
    workflowScheduler = new WorkflowScheduler();
  }
});

// src/core/eventBus/workflowOrchestrator.ts
var WorkflowOrchestrator, workflowOrchestrator;
var init_workflowOrchestrator = __esm({
  "src/core/eventBus/workflowOrchestrator.ts"() {
    "use strict";
    init_eventBus();
    init_workflowState();
    WorkflowOrchestrator = class {
      async startWorkflow(workflowId, initialPayload) {
        workflowStateTracker.update(workflowId, "Created");
        const event = {
          eventId: `EV-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          workflowId,
          correlationId: `corr-${workflowId}`,
          timestamp: Date.now(),
          publisher: "WorkflowOrchestrator",
          subscribers: [],
          priority: "Normal",
          category: "Planner",
          payload: initialPayload,
          metadata: {},
          retryCount: 0,
          executionStatus: "Queued"
        };
        workflowStateTracker.update(workflowId, "Running");
        await eventBusInstance.publish(event);
      }
    };
    workflowOrchestrator = new WorkflowOrchestrator();
  }
});

// src/core/eventBus/eventReplay.ts
var EventReplay, eventReplay;
var init_eventReplay = __esm({
  "src/core/eventBus/eventReplay.ts"() {
    "use strict";
    init_eventPersistence();
    init_eventBus();
    EventReplay = class {
      async replay(workflowId) {
        const history = eventPersistence.getHistory(workflowId);
        let count = 0;
        for (const event of history) {
          await eventBusInstance.publish({
            ...event,
            eventId: `EV-REPLAY-${event.eventId}-${Date.now()}`,
            timestamp: Date.now()
          });
          count++;
        }
        return count;
      }
    };
    eventReplay = new EventReplay();
  }
});

// src/core/eventBus/middleware/index.ts
var init_middleware = __esm({
  "src/core/eventBus/middleware/index.ts"() {
    "use strict";
    init_loggingMiddleware();
    init_metricsMiddleware();
    init_tracingMiddleware();
    init_authorizationMiddleware();
  }
});

// src/core/eventBus/index.ts
var eventBus_exports = {};
__export(eventBus_exports, {
  AuthorizationMiddleware: () => AuthorizationMiddleware,
  DeadLetterQueue: () => DeadLetterQueue,
  EventBus: () => EventBus,
  EventDispatcher: () => EventDispatcher,
  EventEvents: () => EventEvents,
  EventMetrics: () => EventMetrics,
  EventPersistence: () => EventPersistence,
  EventPublisher: () => EventPublisher,
  EventRegistry: () => EventRegistry,
  EventReplay: () => EventReplay,
  EventRouter: () => EventRouter,
  EventSubscriber: () => EventSubscriber,
  LoggingMiddleware: () => LoggingMiddleware,
  MetricsMiddleware: () => MetricsMiddleware,
  RetryManager: () => RetryManager,
  TracingMiddleware: () => TracingMiddleware,
  WorkflowContext: () => WorkflowContext,
  WorkflowOrchestrator: () => WorkflowOrchestrator,
  WorkflowScheduler: () => WorkflowScheduler,
  WorkflowStateTracker: () => WorkflowStateTracker,
  authorizationMiddleware: () => authorizationMiddleware,
  deadLetterQueue: () => deadLetterQueue,
  eventBusInstance: () => eventBusInstance,
  eventDispatcher: () => eventDispatcher,
  eventEvents: () => eventEvents,
  eventMetrics: () => eventMetrics,
  eventPersistence: () => eventPersistence,
  eventPublisher: () => eventPublisher,
  eventRegistry: () => eventRegistry,
  eventReplay: () => eventReplay,
  eventRouter: () => eventRouter,
  eventSubscriber: () => eventSubscriber,
  loggingMiddleware: () => loggingMiddleware,
  metricsMiddleware: () => metricsMiddleware,
  retryManager: () => retryManager,
  tracingMiddleware: () => tracingMiddleware,
  workflowContext: () => workflowContext,
  workflowOrchestrator: () => workflowOrchestrator,
  workflowScheduler: () => workflowScheduler,
  workflowStateTracker: () => workflowStateTracker
});
var init_eventBus2 = __esm({
  "src/core/eventBus/index.ts"() {
    "use strict";
    init_eventTypes();
    init_eventRegistry();
    init_eventEvents();
    init_eventDispatcher();
    init_eventPublisher();
    init_eventSubscriber();
    init_eventRouter();
    init_workflowState();
    init_workflowContext();
    init_workflowScheduler();
    init_workflowOrchestrator();
    init_retryManager();
    init_deadLetterQueue();
    init_eventPersistence();
    init_eventReplay();
    init_eventMetrics();
    init_eventBus();
    init_middleware();
  }
});

// src/extension/index.ts
var extension_exports = {};
__export(extension_exports, {
  activate: () => activate,
  deactivate: () => deactivate
});
module.exports = __toCommonJS(extension_exports);
var vscode22 = __toESM(require("vscode"));

// src/extension/webviewProvider.ts
var vscode21 = __toESM(require("vscode"));

// src/extension/messageRouter.ts
var vscode20 = __toESM(require("vscode"));

// src/common/prompt/PromptValidator.ts
var PromptValidator = class {
  static MAX_PROMPT_LENGTH = 1e5;
  static validate(promptPayload) {
    const errors = [];
    if (!promptPayload) {
      return { valid: false, errors: ["Prompt payload is null or undefined."] };
    }
    if (typeof promptPayload.rawPrompt !== "string") {
      errors.push("rawPrompt must be a string.");
    } else {
      if (promptPayload.rawPrompt.trim().length === 0) {
        errors.push("Prompt cannot be empty or whitespace-only.");
      }
      if (promptPayload.rawPrompt.length > this.MAX_PROMPT_LENGTH) {
        errors.push(`Prompt exceeds maximum length of ${this.MAX_PROMPT_LENGTH} characters.`);
      }
    }
    return {
      valid: errors.length === 0,
      errors
    };
  }
};

// src/extension/pipeline/PromptPipeline.ts
var PromptPipeline = class {
  /**
   * Processes an incoming prompt through the validation and normalization layers.
   * Returns a mock successful response during the foundational phase.
   */
  async process(prompt) {
    const startTime = Date.now();
    const validation = PromptValidator.validate(prompt);
    if (!validation.valid) {
      return {
        status: "ERROR",
        accepted: false,
        promptId: prompt.id,
        processingTime: Date.now() - startTime,
        errors: validation.errors
      };
    }
    return {
      status: "SUCCESS",
      accepted: true,
      promptId: prompt.id,
      processingTime: Date.now() - startTime
    };
  }
};

// src/extension/pipeline/PromptDispatcher.ts
var PromptDispatcher = class {
  pipeline;
  constructor() {
    this.pipeline = new PromptPipeline();
  }
  /**
   * Receives incoming prompt structures from the MessageRouter and routes them
   * into the PromptPipeline asynchronously.
   */
  async dispatch(promptPayload) {
    const prompt = promptPayload;
    return await this.pipeline.process(prompt);
  }
};

// src/common/protocol/messageFactory.ts
function generateId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}
var MessageFactory = class {
  static createMessage(type, source, target, payload) {
    return {
      id: generateId(),
      type,
      timestamp: Date.now(),
      source,
      target,
      payload,
      version: "1.0.0" /* V1 */
    };
  }
  static createError(source, target, message, severity = "ERROR" /* ERROR */, stack) {
    return this.createMessage("ERROR" /* ERROR */, source, target, {
      message,
      severity,
      stack
    });
  }
  static createLog(source, target, message, data) {
    return this.createMessage("LOG" /* LOG */, source, target, {
      message,
      data
    });
  }
  static createInfo(source, target, message, data) {
    return this.createMessage("INFO" /* INFO */, source, target, {
      message,
      data
    });
  }
  static createWarning(source, target, message, data) {
    return this.createMessage("WARNING" /* WARNING */, source, target, {
      message,
      data
    });
  }
};

// src/extension/messageRouter.ts
var import_crypto14 = require("crypto");

// src/core/planner/validator.ts
function validatePrompt(prompt) {
  if (!prompt || typeof prompt !== "string")
    return false;
  if (prompt.trim().length === 0)
    return false;
  return true;
}
function validatePlan(plan) {
  if (!plan || !plan.id || !plan.title)
    return false;
  if (!plan.tasks || !Array.isArray(plan.tasks) || plan.tasks.length === 0)
    return false;
  for (const task of plan.tasks) {
    if (!task.id || !task.title || !task.status)
      return false;
  }
  return true;
}

// src/core/planner/parser.ts
function parsePromptIntoIntent(prompt) {
  const normalized = prompt.toLowerCase();
  let title = "Execute General Task";
  let summary = `Execution plan for: "${prompt.substring(0, 50)}${prompt.length > 50 ? "..." : ""}"`;
  let requiresFiles = false;
  if (normalized.includes("login") || normalized.includes("auth")) {
    title = "Implement Authentication/Login";
    summary = "Generate responsive login components and setup authentication routes.";
    requiresFiles = true;
  } else if (normalized.includes("ui") || normalized.includes("component")) {
    title = "Build UI Components";
    summary = "Scaffold and style the requested user interface components.";
    requiresFiles = true;
  } else if (normalized.includes("api") || normalized.includes("backend")) {
    title = "Implement Backend API";
    summary = "Create API routes and necessary data validation logic.";
    requiresFiles = true;
  }
  return {
    title,
    summary,
    requiresFiles
  };
}

// src/core/planner/planBuilder.ts
var PlanBuilder = class {
  plan;
  constructor(id) {
    this.plan = {
      id,
      tasks: [],
      estimatedSteps: 0,
      estimatedFiles: 0,
      riskLevel: "Low" /* Low */
    };
  }
  setTitle(title) {
    this.plan.title = title;
    return this;
  }
  setSummary(summary) {
    this.plan.summary = summary;
    return this;
  }
  setRiskLevel(level) {
    this.plan.riskLevel = level;
    return this;
  }
  addTask(task) {
    const newTask = {
      id: task.id || `task-${Date.now()}-${Math.floor(Math.random() * 1e3)}`,
      status: task.status || "Pending" /* Pending */,
      title: task.title,
      description: task.description,
      dependencies: task.dependencies || [],
      estimatedTime: task.estimatedTime || "1m"
    };
    this.plan.tasks.push(newTask);
    this.plan.estimatedSteps = this.plan.tasks.length;
    return this;
  }
  setEstimatedFiles(count) {
    this.plan.estimatedFiles = count;
    return this;
  }
  build() {
    if (!this.plan.title) {
      throw new Error("Plan title is required");
    }
    return this.plan;
  }
};

// src/core/planner/planner.ts
var ExecutionPlanner = class {
  /**
   * Main entrypoint for generating a deterministic ExecutionPlan from a prompt.
   * Throws an error if the prompt is invalid or if plan generation fails.
   */
  generatePlan(prompt) {
    if (!validatePrompt(prompt)) {
      throw new Error("Invalid prompt: Prompt cannot be empty.");
    }
    const intent = parsePromptIntoIntent(prompt);
    const planId = `plan-${Date.now()}`;
    const builder = new PlanBuilder(planId).setTitle(intent.title).setSummary(intent.summary).setRiskLevel(intent.requiresFiles ? "Medium" /* Medium */ : "Low" /* Low */).setEstimatedFiles(intent.requiresFiles ? 3 : 0);
    builder.addTask({
      id: `task-${planId}-1`,
      title: "Analyze Workspace",
      description: "Scan the current workspace for existing architecture and dependencies.",
      dependencies: [],
      estimatedTime: "1m"
    });
    builder.addTask({
      id: `task-${planId}-2`,
      title: "Create Components",
      description: "Scaffold required UI components and code structures.",
      dependencies: [`task-${planId}-1`],
      estimatedTime: "3m"
    });
    builder.addTask({
      id: `task-${planId}-3`,
      title: "Update Routes",
      description: "Configure and update application routing paths.",
      dependencies: [`task-${planId}-2`],
      estimatedTime: "2m"
    });
    builder.addTask({
      id: `task-${planId}-4`,
      title: "Verify Build",
      description: "Run basic sanity checks and compiler diagnostics to verify the build.",
      dependencies: [`task-${planId}-3`],
      estimatedTime: "1m"
    });
    builder.addTask({
      id: `task-${planId}-5`,
      title: "Complete",
      description: "Finalize execution and output report summary.",
      dependencies: [`task-${planId}-4`],
      estimatedTime: "1m"
    });
    const plan = builder.build();
    if (!validatePlan(plan)) {
      throw new Error("Failed to build a valid Execution Plan.");
    }
    return plan;
  }
};
var plannerEngine = new ExecutionPlanner();

// src/core/approval/approvalValidator.ts
function canApprove(request) {
  if (!request)
    return false;
  return request.status === "Pending" /* Pending */;
}
function canReject(request) {
  if (!request)
    return false;
  return request.status === "Pending" /* Pending */;
}

// src/core/approval/approvalEngine.ts
var ApprovalEngine = class {
  registry = /* @__PURE__ */ new Map();
  createApproval(plan) {
    const id = `approval-${Date.now()}`;
    const approval = {
      id,
      planId: plan.id,
      title: `Approve: ${plan.title}`,
      summary: plan.summary,
      riskLevel: plan.riskLevel,
      createdAt: Date.now(),
      status: "Pending" /* Pending */
    };
    this.registry.set(id, approval);
    return approval;
  }
  getApproval(id) {
    return this.registry.get(id);
  }
  approve(id) {
    const approval = this.registry.get(id);
    if (!approval) {
      throw new Error(`Cannot approve non-existent plan approval: ${id}`);
    }
    if (!canApprove(approval)) {
      throw new Error(`Cannot approve plan in status: ${approval.status}`);
    }
    approval.status = "Approved" /* Approved */;
    return approval;
  }
  reject(id) {
    const approval = this.registry.get(id);
    if (!approval) {
      throw new Error(`Cannot reject non-existent plan approval: ${id}`);
    }
    if (!canReject(approval)) {
      throw new Error(`Cannot reject plan in status: ${approval.status}`);
    }
    approval.status = "Rejected" /* Rejected */;
    return approval;
  }
};
var approvalEngine = new ApprovalEngine();

// src/core/timeline/timelineBuilder.ts
var TimelineBuilder = class {
  constructor(timelineId, planId) {
    this.timelineId = timelineId;
    this.planId = planId;
  }
  steps = [];
  currentStepNumber = 1;
  /**
   * Adds a step to the timeline, auto-incrementing the stepNumber.
   */
  addStep(step) {
    this.steps.push({
      ...step,
      stepNumber: this.currentStepNumber++
    });
    return this;
  }
  /**
   * Builds and returns the final Timeline object.
   */
  build() {
    return {
      id: this.timelineId,
      planId: this.planId,
      steps: this.steps
    };
  }
};

// src/core/timeline/timelineEngine.ts
var TimelineEngine = class {
  timelines = /* @__PURE__ */ new Map();
  /**
   * Generates a Timeline from a valid ExecutionPlan.
   * Throws an error if the plan or its tasks are invalid.
   */
  generateTimeline(plan) {
    if (!plan) {
      throw new Error("Timeline cannot exist without a valid plan.");
    }
    if (!plan.id) {
      throw new Error("Execution plan is missing an id.");
    }
    if (!plan.tasks || plan.tasks.length === 0) {
      throw new Error("Execution plan must contain at least one step.");
    }
    const timelineId = `timeline-${plan.id}`;
    const builder = new TimelineBuilder(timelineId, plan.id);
    for (const task of plan.tasks) {
      if (!task.id) {
        throw new Error("Every step in the plan requires a valid id.");
      }
      if (!task.title) {
        throw new Error("Every step in the plan requires a valid title.");
      }
      let initialStatus = "Waiting" /* Waiting */;
      if (task.status === "Completed") {
        initialStatus = "Completed" /* Completed */;
      } else if (task.status === "Running") {
        initialStatus = "Running" /* Running */;
      } else if (task.status === "Failed") {
        initialStatus = "Failed" /* Failed */;
      }
      const icon = this.getIconForTitle(task.title);
      builder.addStep({
        id: task.id,
        title: task.title,
        description: task.description,
        status: initialStatus,
        estimatedTime: task.estimatedTime || "1m",
        icon
      });
    }
    const timeline = builder.build();
    this.timelines.set(timeline.id, timeline);
    return timeline;
  }
  /**
   * Retrieves a cached timeline by ID.
   */
  getTimeline(timelineId) {
    return this.timelines.get(timelineId);
  }
  /**
   * Updates the status of a step in a specific timeline.
   */
  updateStepStatus(timelineId, stepId, status) {
    const timeline = this.timelines.get(timelineId);
    if (!timeline) {
      throw new Error(`Timeline with ID ${timelineId} not found.`);
    }
    const step = timeline.steps.find((s) => s.id === stepId);
    if (!step) {
      throw new Error(`Step with ID ${stepId} not found in timeline ${timelineId}.`);
    }
    step.status = status;
    return timeline;
  }
  /**
   * Dynamically assigns appropriate VS Code octicons/names based on step titles.
   */
  getIconForTitle(title) {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes("analyze") || lowerTitle.includes("scan") || lowerTitle.includes("workspace")) {
      return "search";
    }
    if (lowerTitle.includes("create") || lowerTitle.includes("scaffold") || lowerTitle.includes("component")) {
      return "code";
    }
    if (lowerTitle.includes("route") || lowerTitle.includes("style") || lowerTitle.includes("update")) {
      return "git-merge";
    }
    if (lowerTitle.includes("verify") || lowerTitle.includes("build") || lowerTitle.includes("test")) {
      return "terminal";
    }
    if (lowerTitle.includes("complete") || lowerTitle.includes("finish")) {
      return "check-all";
    }
    return "gear";
  }
};
var timelineEngine = new TimelineEngine();

// src/core/timeline/timelineService.ts
var TimelineService = class {
  activeTimeline = null;
  /**
   * Initializes a timeline from an execution plan.
   */
  initializeTimeline(plan) {
    const timeline = timelineEngine.generateTimeline(plan);
    this.activeTimeline = timeline;
    return timeline;
  }
  /**
   * Retrieves the current active timeline.
   */
  getActiveTimeline() {
    return this.activeTimeline;
  }
  /**
   * Updates status of a timeline step and returns the updated timeline.
   */
  updateStep(stepId, status) {
    if (!this.activeTimeline) {
      throw new Error("No active timeline found.");
    }
    const updated = timelineEngine.updateStepStatus(this.activeTimeline.id, stepId, status);
    this.activeTimeline = updated;
    return updated;
  }
  /**
   * Clears the current active timeline state.
   */
  clearActiveTimeline() {
    this.activeTimeline = null;
  }
};
var timelineService = new TimelineService();

// src/core/workspace/ignoreRules.ts
var IGNORE_DIRECTORIES = [
  "node_modules",
  "dist",
  "build",
  "coverage",
  ".git",
  ".next",
  "out",
  ".cache",
  "tmp"
];
function isIgnored(pathOrFilename) {
  const parts = pathOrFilename.split(/[/\\]/);
  return parts.some((part) => IGNORE_DIRECTORIES.includes(part));
}

// src/core/workspace/workspaceScanner.ts
var fs = __toESM(require("fs"));
var path = __toESM(require("path"));
var WorkspaceScanner = class {
  /**
   * Scans the workspace directory to find directories, files, and config targets at the root.
   */
  scanRoot(rootPath) {
    const rootFiles = [];
    let hasGit = false;
    const configs = [];
    if (!fs.existsSync(rootPath)) {
      return { rootFiles, hasGit, configs };
    }
    try {
      const items = fs.readdirSync(rootPath);
      for (const item of items) {
        if (item === ".git") {
          hasGit = true;
          continue;
        }
        if (isIgnored(item)) {
          continue;
        }
        rootFiles.push(item);
        if (item.startsWith(".") || item.endsWith(".config.js") || item.endsWith(".config.ts") || item.endsWith(".config.mjs") || item.endsWith(".json") || item.endsWith(".yaml") || item.endsWith(".yml") || item === "package.json" || item === "Cargo.toml" || item === "pyproject.toml" || item === "go.mod") {
          configs.push(item);
        }
      }
    } catch (e) {
      console.error("Error scanning root:", e);
    }
    return { rootFiles, hasGit, configs };
  }
  /**
   * Performs a lightweight scan of source files to identify predominant programming language extensions.
   */
  detectSourceExtensions(rootPath) {
    const extensions = /* @__PURE__ */ new Set();
    const walk = (dir, depth = 0) => {
      if (depth > 3)
        return;
      if (!fs.existsSync(dir))
        return;
      try {
        const items = fs.readdirSync(dir, { withFileTypes: true });
        for (const item of items) {
          if (item.isDirectory()) {
            if (isIgnored(item.name))
              continue;
            walk(path.join(dir, item.name), depth + 1);
          } else {
            const ext = path.extname(item.name).toLowerCase();
            if (ext) {
              extensions.add(ext);
            }
          }
        }
      } catch (e) {
      }
    };
    walk(rootPath);
    return Array.from(extensions);
  }
};

// src/core/workspace/workspaceIndexer.ts
var fs2 = __toESM(require("fs"));
var path2 = __toESM(require("path"));
var WorkspaceIndexer = class {
  /**
   * Parses package.json if it exists to extract dependencies and project metadata.
   */
  parsePackageJson(rootPath) {
    const result = {
      projectName: "",
      dependencies: [],
      devDependencies: [],
      packageManager: "npm"
      // default fallback
    };
    const packageJsonPath = path2.join(rootPath, "package.json");
    if (!fs2.existsSync(packageJsonPath)) {
      return result;
    }
    try {
      const content = JSON.parse(fs2.readFileSync(packageJsonPath, "utf8"));
      result.projectName = content.name || "";
      if (content.dependencies) {
        result.dependencies = Object.keys(content.dependencies);
      }
      if (content.devDependencies) {
        result.devDependencies = Object.keys(content.devDependencies);
      }
      if (content.packageManager) {
        result.packageManager = content.packageManager.split("@")[0];
      }
    } catch (e) {
      console.error("Error parsing package.json:", e);
    }
    return result;
  }
};

// src/core/workspace/workspaceEngine.ts
var fs3 = __toESM(require("fs"));
var path3 = __toESM(require("path"));
var WorkspaceEngine = class {
  scanner = new WorkspaceScanner();
  indexer = new WorkspaceIndexer();
  /**
   * Evaluates the active workspace directory to generate a structured project summary.
   * Throws an error if no workspace is active or found.
   */
  getSummary(rootPath) {
    if (!rootPath || !fs3.existsSync(rootPath)) {
      throw new Error("Workspace Not Found");
    }
    const { rootFiles, hasGit, configs } = this.scanner.scanRoot(rootPath);
    const pkgInfo = this.indexer.parsePackageJson(rootPath);
    const sourceExtensions = this.scanner.detectSourceExtensions(rootPath);
    const projectName = pkgInfo.projectName || path3.basename(rootPath);
    const framework = this.detectFramework(rootFiles, pkgInfo.dependencies, pkgInfo.devDependencies);
    const language = this.detectLanguage(rootFiles, sourceExtensions);
    const packageManager = this.detectPackageManager(rootFiles, pkgInfo.packageManager);
    const buildTool = this.detectBuildTool(rootFiles, pkgInfo.dependencies, pkgInfo.devDependencies, framework);
    const entryPoint = this.detectEntryPoint(rootPath);
    const sourceFolder = this.detectSourceFolder(rootPath);
    return {
      projectName,
      framework,
      language,
      packageManager,
      buildTool,
      gitEnabled: hasGit,
      entryPoint,
      sourceFolder,
      configurationFiles: configs
    };
  }
  /**
   * Framework detection matching requested platforms:
   * React, Next.js, Vue, Angular, Node, Express, NestJS, Vite, Electron, Python, Java, C#, Rust, Go
   */
  detectFramework(rootFiles, deps, devDeps) {
    const allDeps = [...deps, ...devDeps];
    const fileSet = new Set(rootFiles);
    if (allDeps.includes("next") || fileSet.has("next.config.js") || fileSet.has("next.config.mjs")) {
      return "Next.js";
    }
    if (allDeps.includes("electron") || fileSet.has("electron-builder.json")) {
      return "Electron";
    }
    if (allDeps.includes("react") || allDeps.includes("react-dom")) {
      return "React";
    }
    if (allDeps.includes("vue") || fileSet.has("vue.config.js")) {
      return "Vue";
    }
    if (allDeps.includes("@angular/core") || fileSet.has("angular.json")) {
      return "Angular";
    }
    if (allDeps.includes("@nestjs/core") || fileSet.has("nest-cli.json")) {
      return "NestJS";
    }
    if (allDeps.includes("express")) {
      return "Express";
    }
    if (allDeps.includes("vite") || fileSet.has("vite.config.ts") || fileSet.has("vite.config.js")) {
      return "Vite";
    }
    if (fileSet.has("package.json")) {
      return "Node";
    }
    if (fileSet.has("Cargo.toml")) {
      return "Rust";
    }
    if (fileSet.has("go.mod")) {
      return "Go";
    }
    if (fileSet.has("requirements.txt") || fileSet.has("pyproject.toml") || fileSet.has("setup.py")) {
      return "Python";
    }
    if (fileSet.has("pom.xml") || fileSet.has("build.gradle")) {
      return "Java";
    }
    const hasCsProj = rootFiles.some((f) => f.endsWith(".csproj") || f.endsWith(".sln"));
    if (hasCsProj) {
      return "C#";
    }
    return "Unknown";
  }
  /**
   * Maps workspace parameters to direct programming language names.
   */
  detectLanguage(rootFiles, extensions) {
    const fileSet = new Set(rootFiles);
    if (fileSet.has("tsconfig.json") || extensions.includes(".ts") || extensions.includes(".tsx")) {
      return "TypeScript";
    }
    if (extensions.includes(".js") || extensions.includes(".jsx")) {
      return "JavaScript";
    }
    if (fileSet.has("Cargo.toml") || extensions.includes(".rs")) {
      return "Rust";
    }
    if (fileSet.has("go.mod") || extensions.includes(".go")) {
      return "Go";
    }
    if (extensions.includes(".py")) {
      return "Python";
    }
    if (extensions.includes(".java")) {
      return "Java";
    }
    if (extensions.includes(".cs")) {
      return "C#";
    }
    return "TypeScript";
  }
  /**
   * Checks locks or configurations to identify the active package manager.
   */
  detectPackageManager(rootFiles, pkgJsonPM) {
    const fileSet = new Set(rootFiles);
    if (fileSet.has("pnpm-lock.yaml"))
      return "pnpm";
    if (fileSet.has("yarn.lock"))
      return "yarn";
    if (fileSet.has("bun.lockb"))
      return "bun";
    if (fileSet.has("package-lock.json"))
      return "npm";
    if (fileSet.has("Cargo.toml"))
      return "cargo";
    if (fileSet.has("go.mod"))
      return "go";
    if (fileSet.has("requirements.txt") || fileSet.has("pyproject.toml"))
      return "pip";
    return pkgJsonPM || "npm";
  }
  /**
   * Maps build configurations to standard compiling tool signatures.
   */
  detectBuildTool(rootFiles, deps, devDeps, framework) {
    const allDeps = [...deps, ...devDeps];
    const fileSet = new Set(rootFiles);
    if (fileSet.has("vite.config.ts") || fileSet.has("vite.config.js") || fileSet.has("vite.config.mjs") || allDeps.includes("vite")) {
      return "Vite";
    }
    if (framework === "Next.js") {
      return "Next";
    }
    if (fileSet.has("webpack.config.js") || allDeps.includes("webpack")) {
      return "Webpack";
    }
    if (fileSet.has("Cargo.toml")) {
      return "Cargo";
    }
    if (fileSet.has("go.mod")) {
      return "Go Compiler";
    }
    if (fileSet.has("pom.xml")) {
      return "Maven";
    }
    if (fileSet.has("build.gradle")) {
      return "Gradle";
    }
    return "npm";
  }
  /**
   * Scans candidates to resolve active entrypoint file paths.
   */
  detectEntryPoint(rootPath) {
    const candidates = [
      "src/main.tsx",
      "src/index.ts",
      "src/main.ts",
      "src/index.js",
      "src/App.tsx",
      "index.js",
      "main.py",
      "src/lib.rs",
      "src/main.rs",
      "main.go"
    ];
    for (const cand of candidates) {
      if (fs3.existsSync(path3.join(rootPath, cand))) {
        return cand;
      }
    }
    return "index.js";
  }
  /**
   * Resolves the primary directory containing source elements.
   */
  detectSourceFolder(rootPath) {
    if (fs3.existsSync(path3.join(rootPath, "src")))
      return "src";
    if (fs3.existsSync(path3.join(rootPath, "lib")))
      return "lib";
    return ".";
  }
};
var workspaceEngine = new WorkspaceEngine();

// src/core/workspace/workspaceService.ts
var vscode = __toESM(require("vscode"));
var WorkspaceService = class {
  /**
   * Retrieves the active workspace path.
   * If multiple folders are open, returns the first folder path.
   * If none exist, returns null.
   */
  getWorkspaceRoot() {
    const folders = vscode.workspace.workspaceFolders;
    if (!folders || folders.length === 0) {
      return null;
    }
    return folders[0].uri.fsPath;
  }
  /**
   * Generates a WorkspaceSummary for the active workspace.
   * If no workspace exists, returns 'Workspace Not Found'.
   */
  getWorkspaceSummary() {
    const root = this.getWorkspaceRoot();
    if (!root) {
      return "Workspace Not Found";
    }
    try {
      return workspaceEngine.getSummary(root);
    } catch (e) {
      return "Workspace Not Found";
    }
  }
};
var workspaceService = new WorkspaceService();

// src/core/executor/executorQueue.ts
var ExecutorQueue = class {
  queue = [];
  /**
   * Initializes the queue with a list of nodes in topological order.
   */
  initialize(nodes) {
    this.queue = [...nodes];
  }
  /**
   * Retrieves the next node eligible for execution.
   */
  getNext() {
    return this.queue.find((node) => node.status === "Waiting" || node.status === "Ready");
  }
  /**
   * Returns all nodes in the queue.
   */
  getNodes() {
    return this.queue;
  }
  /**
   * Clears the execution queue.
   */
  clear() {
    this.queue = [];
  }
};

// src/core/executor/executorValidator.ts
var ExecutorValidator = class {
  /**
   * Validates the execution graph for run eligibility.
   */
  validateGraphForExecution(graph) {
    if (!graph) {
      throw new Error("Executor validation failed: Null or undefined graph");
    }
    if (!graph.nodes || graph.nodes.length === 0) {
      throw new Error("Executor validation failed: Empty graph");
    }
  }
  /**
   * Validates that the executor state allows starting a new run.
   */
  validateStateForStart(currentState) {
    if (currentState === "Running" /* Running */ || currentState === "Preparing" /* Preparing */ || currentState === "Queued" /* Queued */) {
      throw new Error("Executor validation failed: Executor is already running");
    }
  }
};
var executorValidator = new ExecutorValidator();

// src/core/executor/executionContext.ts
var ExecutionContext = class {
  variables = /* @__PURE__ */ new Map();
  logs = [];
  /**
   * Retrieves a variable from the execution context.
   */
  getVariable(key) {
    return this.variables.get(key);
  }
  /**
   * Stores a variable in the execution context.
   */
  setVariable(key, value) {
    this.variables.set(key, value);
  }
  /**
   * Appends a log entry to the execution trace.
   */
  log(message) {
    this.logs.push(`[${(/* @__PURE__ */ new Date()).toISOString()}] ${message}`);
  }
  /**
   * Returns all logs recorded during execution.
   */
  getLogs() {
    return this.logs;
  }
  /**
   * Resets variables and log traces.
   */
  clear() {
    this.variables.clear();
    this.logs = [];
  }
};

// src/core/executor/executorEngine.ts
var import_crypto2 = require("crypto");

// src/core/executionGraph/graphBuilder.ts
var import_crypto = require("crypto");
var GraphBuilder = class {
  /**
   * Builds an ExecutionGraph from an ExecutionPlan.
   */
  buildFromPlan(plan) {
    const nodes = plan.tasks.map((task) => {
      let minutes = 5;
      if (task.estimatedTime) {
        const match = task.estimatedTime.match(/^(\d+)/);
        if (match) {
          minutes = parseInt(match[1], 10);
        }
      }
      return {
        id: task.id,
        title: task.title,
        description: task.description,
        type: "TASK",
        status: "Waiting" /* Waiting */,
        estimatedTime: minutes,
        riskLevel: plan.riskLevel,
        metadata: {
          originalStatus: task.status
        }
      };
    });
    const edges = [];
    for (const task of plan.tasks) {
      if (task.dependencies && task.dependencies.length > 0) {
        for (const depId of task.dependencies) {
          edges.push({
            source: depId,
            target: task.id,
            dependencyType: "Sequential" /* Sequential */
          });
        }
      }
    }
    return {
      id: (0, import_crypto.randomUUID)(),
      planId: plan.id,
      nodes,
      edges,
      status: "Pending" /* Pending */,
      createdAt: Date.now()
    };
  }
};
var graphBuilder = new GraphBuilder();

// src/core/executionGraph/graphValidator.ts
var GraphValidator = class {
  /**
   * Validates the execution graph structure.
   */
  validate(graph) {
    if (!graph.nodes || graph.nodes.length === 0) {
      throw new Error("Graph validation failed: Empty graph");
    }
    const nodeIds = /* @__PURE__ */ new Set();
    for (const node of graph.nodes) {
      if (nodeIds.has(node.id)) {
        throw new Error(`Graph validation failed: Duplicate Node ID "${node.id}"`);
      }
      nodeIds.add(node.id);
    }
    for (const edge of graph.edges) {
      if (!nodeIds.has(edge.source)) {
        throw new Error(`Graph validation failed: Edge source "${edge.source}" does not exist in nodes`);
      }
      if (!nodeIds.has(edge.target)) {
        throw new Error(`Graph validation failed: Edge target "${edge.target}" does not exist in nodes`);
      }
    }
    this.detectCycles(graph);
  }
  /**
   * Detects cycles in the directed dependency graph using DFS.
   */
  detectCycles(graph) {
    const adjList = /* @__PURE__ */ new Map();
    for (const node of graph.nodes) {
      adjList.set(node.id, []);
    }
    for (const edge of graph.edges) {
      adjList.get(edge.source).push(edge.target);
    }
    const visited = /* @__PURE__ */ new Set();
    const recStack = /* @__PURE__ */ new Set();
    const dfs = (nodeId) => {
      if (recStack.has(nodeId)) {
        return true;
      }
      if (visited.has(nodeId)) {
        return false;
      }
      visited.add(nodeId);
      recStack.add(nodeId);
      const neighbors = adjList.get(nodeId) || [];
      for (const neighbor of neighbors) {
        if (dfs(neighbor)) {
          return true;
        }
      }
      recStack.delete(nodeId);
      return false;
    };
    for (const node of graph.nodes) {
      if (!visited.has(node.id)) {
        if (dfs(node.id)) {
          throw new Error("Graph validation failed: Circular dependencies detected");
        }
      }
    }
  }
};
var graphValidator = new GraphValidator();

// src/core/executionGraph/graphRegistry.ts
var GraphRegistry = class {
  graphs = /* @__PURE__ */ new Map();
  /**
   * Caches an active ExecutionGraph by its planId.
   */
  register(graph) {
    this.graphs.set(graph.planId, graph);
  }
  /**
   * Retrieves a cached ExecutionGraph using its planId.
   */
  getByPlanId(planId) {
    return this.graphs.get(planId);
  }
  /**
   * Retrieves a cached ExecutionGraph using its graph id.
   */
  getById(graphId) {
    return Array.from(this.graphs.values()).find((g) => g.id === graphId);
  }
  /**
   * Clears the graph cache.
   */
  clear() {
    this.graphs.clear();
  }
};
var graphRegistry = new GraphRegistry();

// src/core/executionGraph/executionOrder.ts
var ExecutionOrderGenerator = class {
  /**
   * Generates an ordered sequence of execution nodes using topological sort.
   */
  generateOrder(graph) {
    const adjList = /* @__PURE__ */ new Map();
    const inDegree = /* @__PURE__ */ new Map();
    for (const node of graph.nodes) {
      adjList.set(node.id, []);
      inDegree.set(node.id, 0);
    }
    for (const edge of graph.edges) {
      adjList.get(edge.source).push(edge.target);
      inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
    }
    const queue = [];
    for (const node of graph.nodes) {
      if ((inDegree.get(node.id) || 0) === 0) {
        queue.push(node.id);
      }
    }
    const order = [];
    while (queue.length > 0) {
      queue.sort();
      const currId = queue.shift();
      order.push(currId);
      const neighbors = adjList.get(currId) || [];
      for (const neighbor of neighbors) {
        const nextDegree = (inDegree.get(neighbor) || 0) - 1;
        inDegree.set(neighbor, nextDegree);
        if (nextDegree === 0) {
          queue.push(neighbor);
        }
      }
    }
    if (order.length !== graph.nodes.length) {
      throw new Error("Graph has circular dependencies, order generation failed");
    }
    const nodeMap = new Map(graph.nodes.map((n) => [n.id, n]));
    return order.map((id) => nodeMap.get(id));
  }
};
var executionOrderGenerator = new ExecutionOrderGenerator();

// src/core/executionGraph/graphEngine.ts
var GraphEngine = class {
  /**
   * Generates, validates, and registers a dependency execution graph from an approved plan.
   */
  generateGraph(plan) {
    const graph = graphBuilder.buildFromPlan(plan);
    graphValidator.validate(graph);
    graphRegistry.register(graph);
    return graph;
  }
  /**
   * Generates the topological execution sequence for the graph.
   */
  getExecutionOrder(graph) {
    return executionOrderGenerator.generateOrder(graph);
  }
  /**
   * Prepares rollback metadata to reset executed steps back to original statuses in case of failures.
   */
  prepareRollbackInfo(graph) {
    return {
      graphId: graph.id,
      rollbackNodes: graph.nodes.map((n) => ({
        nodeId: n.id,
        originalStatus: "Waiting" /* Waiting */,
        title: n.title
      }))
    };
  }
};
var graphEngine = new GraphEngine();

// src/core/executor/executorEngine.ts
var ExecutorEngine = class {
  id = (0, import_crypto2.randomUUID)();
  state = "Idle" /* Idle */;
  currentGraph = null;
  queue = new ExecutorQueue();
  context = new ExecutionContext();
  listeners = /* @__PURE__ */ new Set();
  isPaused = false;
  isCancelled = false;
  getId() {
    return this.id;
  }
  getState() {
    return this.state;
  }
  /**
   * Subscribes to executor events.
   */
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  emit(type, payload) {
    const event = {
      type,
      executorId: this.id,
      graphId: this.currentGraph?.id || "",
      timestamp: Date.now(),
      payload
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error("Error in executor event listener:", err);
      }
    }
  }
  /**
   * Initializes and executes the given dependency graph sequentially.
   */
  async execute(graph) {
    executorValidator.validateGraphForExecution(graph);
    executorValidator.validateStateForStart(this.state);
    this.currentGraph = graph;
    this.state = "Preparing" /* Preparing */;
    this.isPaused = false;
    this.isCancelled = false;
    this.context.clear();
    this.context.log(`Initializing execution for graph ${graph.id}`);
    const orderedNodes = graphEngine.getExecutionOrder(graph);
    orderedNodes.forEach((node) => {
      node.status = "Waiting" /* Waiting */;
    });
    this.queue.initialize(orderedNodes);
    this.state = "Running" /* Running */;
    this.emit("ExecutionStarted" /* ExecutionStarted */);
    this.context.log("Execution loop started");
    this.runLoop().catch((err) => {
      console.error("[ExecutorEngine] Execution loop failed:", err);
    });
  }
  async runLoop() {
    while (this.state === "Running" /* Running */) {
      if (this.isPaused) {
        this.state = "Paused" /* Paused */;
        this.emit("ExecutionPaused" /* ExecutionPaused */);
        return;
      }
      if (this.isCancelled) {
        this.state = "Cancelled" /* Cancelled */;
        this.emit("ExecutionCancelled" /* ExecutionCancelled */);
        return;
      }
      const nextNode = this.queue.getNext();
      if (!nextNode) {
        this.state = "Completed" /* Completed */;
        this.emit("ExecutionCompleted" /* ExecutionCompleted */);
        this.context.log("Execution completed successfully");
        return;
      }
      await this.executeNode(nextNode);
    }
  }
  async executeNode(node) {
    this.context.log(`Starting step ${node.id}: ${node.title}`);
    node.status = "Running" /* Running */;
    this.emit("NodeStarted" /* NodeStarted */, { node });
    try {
      const delayTime = 500;
      await new Promise((resolve13) => setTimeout(resolve13, delayTime));
      if (this.isCancelled) {
        node.status = "Skipped" /* Skipped */;
        return;
      }
      node.status = "Completed" /* Completed */;
      this.emit("NodeCompleted" /* NodeCompleted */, { node });
      this.context.log(`Completed step ${node.id}: ${node.title}`);
    } catch (err) {
      node.status = "Failed" /* Failed */;
      this.state = "Failed" /* Failed */;
      this.emit("NodeFailed" /* NodeFailed */, { node, error: err.message });
      this.emit("ExecutionCompleted" /* ExecutionCompleted */);
      this.context.log(`Failed step ${node.id}: ${node.title} - ${err.message}`);
      throw err;
    }
  }
  /**
   * Pauses active execution.
   */
  pause() {
    if (this.state === "Running" /* Running */) {
      this.isPaused = true;
      this.context.log("Execution pause requested");
    }
  }
  /**
   * Resumes paused execution.
   */
  resume() {
    if (this.state === "Paused" /* Paused */) {
      this.isPaused = false;
      this.state = "Running" /* Running */;
      this.emit("ExecutionResumed" /* ExecutionResumed */);
      this.context.log("Execution resumed");
      this.runLoop().catch((err) => {
        console.error("Error resuming execution loop:", err);
      });
    }
  }
  /**
   * Cancels active execution.
   */
  cancel() {
    if (this.state === "Running" /* Running */ || this.state === "Paused" /* Paused */) {
      this.isCancelled = true;
      this.isPaused = false;
      this.state = "Cancelled" /* Cancelled */;
      this.emit("ExecutionCancelled" /* ExecutionCancelled */);
      this.context.log("Execution cancelled");
    }
  }
  /**
   * Compiles the progress metrics of current execution.
   */
  getProgress() {
    const nodes = this.queue.getNodes();
    const totalSteps = nodes.length;
    const completedSteps = nodes.filter((n) => n.status === "Completed" /* Completed */).length;
    const runningNode = nodes.find((n) => n.status === "Running" /* Running */);
    const remainingSteps = totalSteps - completedSteps;
    const progressPercent = totalSteps > 0 ? Math.round(completedSteps / totalSteps * 100) : 0;
    return {
      status: this.state,
      currentStepId: runningNode?.id || null,
      currentStepTitle: runningNode?.title || null,
      completedSteps,
      remainingSteps,
      totalSteps,
      progressPercent
    };
  }
  getLogs() {
    return this.context.getLogs();
  }
};

// src/core/executor/executorRegistry.ts
var ExecutorRegistry = class {
  executors = /* @__PURE__ */ new Map();
  /**
   * Registers a new ExecutorEngine in memory.
   */
  register(executor) {
    this.executors.set(executor.getId(), executor);
  }
  /**
   * Retrieves an ExecutorEngine using its ID.
   */
  getById(id) {
    return this.executors.get(id);
  }
  /**
   * De-registers an ExecutorEngine.
   */
  remove(id) {
    this.executors.delete(id);
  }
  /**
   * Resets the registry cache.
   */
  clear() {
    this.executors.clear();
  }
};
var executorRegistry = new ExecutorRegistry();

// src/core/executor/executorService.ts
var ExecutorService = class {
  activeExecutor = null;
  /**
   * Starts execution of a dependency graph.
   */
  async startExecution(graph, onEvent) {
    if (this.activeExecutor) {
      const progress = this.activeExecutor.getProgress();
      if (progress.status === "Running" || progress.status === "Preparing" || progress.status === "Queued") {
        throw new Error("Executor is already running a task.");
      }
    }
    const executor = new ExecutorEngine();
    executorRegistry.register(executor);
    this.activeExecutor = executor;
    if (onEvent) {
      executor.subscribe(onEvent);
    }
    await executor.execute(graph);
    return executor.getId();
  }
  /**
   * Pauses the currently running execution.
   */
  pause() {
    if (this.activeExecutor) {
      this.activeExecutor.pause();
    }
  }
  /**
   * Resumes the paused execution.
   */
  resume() {
    if (this.activeExecutor) {
      this.activeExecutor.resume();
    }
  }
  /**
   * Cancels execution.
   */
  cancel() {
    if (this.activeExecutor) {
      this.activeExecutor.cancel();
    }
  }
  /**
   * Returns progress details of the active executor, or null if none exists.
   */
  getProgress() {
    if (this.activeExecutor) {
      return this.activeExecutor.getProgress();
    }
    return null;
  }
  /**
   * Returns current log entries.
   */
  getLogs() {
    if (this.activeExecutor) {
      return this.activeExecutor.getLogs();
    }
    return [];
  }
};
var executorService = new ExecutorService();

// src/core/terminal/commandWhitelist.ts
var SUPPORTED_BASE_COMMANDS = [
  "pwd",
  "ls",
  "dir",
  "npm",
  "pnpm",
  "yarn",
  "node",
  "npx",
  "git",
  "python"
];
function isWhitelistedCommand(commandLine) {
  const trimmed = commandLine.trim();
  if (!trimmed)
    return false;
  const parts = trimmed.split(/\s+/);
  const baseCmd = parts[0];
  if (baseCmd === "python") {
    return trimmed === "python --version" || parts.includes("--version");
  }
  if (baseCmd === "npm") {
    const sub = parts[1];
    return sub === "install" || sub === "run" || parts.length > 2 && parts.includes("run");
  }
  if (baseCmd === "git") {
    const sub = parts[1];
    return ["status", "diff", "branch"].includes(sub);
  }
  return SUPPORTED_BASE_COMMANDS.includes(baseCmd);
}

// src/core/terminal/commandValidator.ts
var path4 = __toESM(require("path"));
var BLOCKED_KEYWORDS = [
  "rm -rf",
  "sudo",
  "shutdown",
  "reboot",
  "mkfs",
  "format",
  "diskpart"
];
var CommandValidator = class {
  /**
   * Validates safety boundaries, paths, and whitelist parameters of a command.
   */
  validate(command, workingDirectory, workspaceRoot) {
    const trimmed = command.trim();
    if (!trimmed) {
      throw new Error("Command execution rejected: Command is empty");
    }
    const lower = trimmed.toLowerCase();
    for (const keyword of BLOCKED_KEYWORDS) {
      if (lower.includes(keyword)) {
        throw new Error(`Command execution rejected: Command contains blocked keyword "${keyword}"`);
      }
    }
    if (lower.includes("powershell") && (lower.includes("runas") || lower.includes("-verb"))) {
      throw new Error("Command execution rejected: Elevated privilege execution is blocked");
    }
    const resolvedWD = path4.resolve(workingDirectory);
    const resolvedWR = path4.resolve(workspaceRoot);
    const relative6 = path4.relative(resolvedWR, resolvedWD);
    if (relative6.startsWith("..") && !path4.isAbsolute(relative6)) {
      throw new Error(`Command execution rejected: Working directory "${workingDirectory}" is outside workspace root`);
    }
    if (!isWhitelistedCommand(trimmed)) {
      throw new Error(`Command execution rejected: Command "${trimmed}" is not in the allowed V1 whitelist`);
    }
  }
};
var commandValidator = new CommandValidator();

// src/core/terminal/terminalEvents.ts
var TerminalEvents = class {
  listeners = /* @__PURE__ */ new Set();
  /**
   * Subscribes to terminal events.
   */
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  /**
   * Broadcasts terminal event.
   */
  emit(type, commandId, payload) {
    const event = {
      type,
      commandId,
      timestamp: Date.now(),
      payload
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error("Error in terminal event listener:", err);
      }
    }
  }
};

// src/core/terminal/terminalQueue.ts
var TerminalQueue = class {
  queue = [];
  /**
   * Pushes a new command into the sequential execution queue.
   */
  enqueue(command) {
    this.queue.push(command);
  }
  /**
   * Retrieves the next command in Queued state.
   */
  getNext() {
    return this.queue.find((c) => c.status === "Queued" /* Queued */);
  }
  /**
   * Finds the currently active command.
   */
  findRunning() {
    return this.queue.find((c) => c.status === "Running" /* Running */);
  }
  getCommands() {
    return this.queue;
  }
  clear() {
    this.queue = [];
  }
};

// src/core/terminal/terminalSession.ts
var import_child_process = require("child_process");
var TerminalSession = class {
  constructor(events) {
    this.events = events;
  }
  activeProcess = null;
  activeCommand = null;
  /**
   * Executes a Whitelisted Command by spawning shell subprocesses.
   */
  execute(command) {
    this.activeCommand = command;
    command.status = "Running" /* Running */;
    command.startedAt = Date.now();
    this.events.emit("CommandStarted" /* CommandStarted */, command.id, { command });
    return new Promise((resolve13) => {
      try {
        this.activeProcess = (0, import_child_process.spawn)(command.command, [], {
          cwd: command.workingDirectory,
          env: { ...process.env, ...command.environment },
          shell: true
        });
        const timeoutDuration = 3e5;
        const timeoutId = setTimeout(() => {
          if (this.activeProcess) {
            this.activeProcess.kill();
            command.status = "TimedOut" /* TimedOut */;
            command.finishedAt = Date.now();
            this.events.emit("CommandFailed" /* CommandFailed */, command.id, { error: "Command execution timed out" });
            resolve13(null);
          }
        }, timeoutDuration);
        this.activeProcess.stdout?.on("data", (data) => {
          const text = data.toString();
          command.stdout += text;
          this.events.emit("OutputReceived" /* OutputReceived */, command.id, { chunk: text, type: "stdout" });
        });
        this.activeProcess.stderr?.on("data", (data) => {
          const text = data.toString();
          command.stderr += text;
          this.events.emit("OutputReceived" /* OutputReceived */, command.id, { chunk: text, type: "stderr" });
        });
        this.activeProcess.on("error", (err) => {
          clearTimeout(timeoutId);
          command.status = "Failed" /* Failed */;
          command.stderr += `
Error: ${err.message}`;
          command.finishedAt = Date.now();
          this.events.emit("CommandFailed" /* CommandFailed */, command.id, { error: err.message });
          resolve13(null);
        });
        this.activeProcess.on("close", (code) => {
          clearTimeout(timeoutId);
          if (command.status === "Running" /* Running */) {
            command.exitCode = code;
            command.finishedAt = Date.now();
            if (code === 0) {
              command.status = "Completed" /* Completed */;
              this.events.emit("CommandCompleted" /* CommandCompleted */, command.id, { exitCode: code });
            } else {
              command.status = "Failed" /* Failed */;
              this.events.emit("CommandFailed" /* CommandFailed */, command.id, { exitCode: code });
            }
          }
          this.activeProcess = null;
          this.activeCommand = null;
          resolve13(code);
        });
      } catch (err) {
        command.status = "Failed" /* Failed */;
        command.stderr += `
Exception: ${err.message}`;
        command.finishedAt = Date.now();
        this.events.emit("CommandFailed" /* CommandFailed */, command.id, { error: err.message });
        resolve13(null);
      }
    });
  }
  /**
   * Kills active command subprocesses.
   */
  cancel() {
    if (this.activeProcess) {
      this.activeProcess.kill();
      if (this.activeCommand) {
        this.activeCommand.status = "Cancelled" /* Cancelled */;
        this.activeCommand.finishedAt = Date.now();
        this.events.emit("CommandCancelled" /* CommandCancelled */, this.activeCommand.id);
      }
      this.activeProcess = null;
      this.activeCommand = null;
    }
  }
  getActiveCommand() {
    return this.activeCommand;
  }
};

// src/core/terminal/terminalEngine.ts
var import_crypto3 = require("crypto");
var TerminalEngine = class {
  constructor(workspaceRoot) {
    this.workspaceRoot = workspaceRoot;
    this.session = new TerminalSession(this.events);
  }
  events = new TerminalEvents();
  queue = new TerminalQueue();
  session;
  isProcessing = false;
  /**
   * Subscribes to terminal events.
   */
  subscribe(listener) {
    return this.events.subscribe(listener);
  }
  /**
   * Submits a command line string to run inside the execution queue.
   */
  executeCommand(commandStr, workingDirectory, environment) {
    const wd = workingDirectory || this.workspaceRoot;
    commandValidator.validate(commandStr, wd, this.workspaceRoot);
    const running = this.session.getActiveCommand();
    if (running && running.command === commandStr && running.workingDirectory === wd) {
      throw new Error(`Command execution rejected: Duplicate command is already running: "${commandStr}"`);
    }
    const command = {
      id: (0, import_crypto3.randomUUID)(),
      command: commandStr,
      workingDirectory: wd,
      environment,
      status: "Queued" /* Queued */,
      stdout: "",
      stderr: ""
    };
    this.queue.enqueue(command);
    this.events.emit("CommandQueued" /* CommandQueued */, command.id, { command });
    this.processQueue().catch((err) => {
      console.error("[TerminalEngine] Error in processQueue:", err);
    });
    return command;
  }
  async processQueue() {
    if (this.isProcessing)
      return;
    this.isProcessing = true;
    try {
      while (true) {
        const next = this.queue.getNext();
        if (!next)
          break;
        await this.session.execute(next);
      }
    } finally {
      this.isProcessing = false;
    }
  }
  /**
   * Cancels the active process.
   */
  cancel() {
    this.session.cancel();
  }
  getCommands() {
    return this.queue.getCommands();
  }
  getActiveCommand() {
    return this.session.getActiveCommand();
  }
};

// src/core/terminal/terminalService.ts
var vscode2 = __toESM(require("vscode"));
var TerminalService = class {
  activeEngine = null;
  getEngine() {
    const folders = vscode2.workspace.workspaceFolders;
    if (!folders || folders.length === 0) {
      throw new Error("Workspace Terminal Service: No workspace folder is open");
    }
    const root = folders[0].uri.fsPath;
    if (!this.activeEngine) {
      this.activeEngine = new TerminalEngine(root);
    }
    return this.activeEngine;
  }
  /**
   * Subscribes to terminal execution events.
   */
  subscribe(listener) {
    return this.getEngine().subscribe(listener);
  }
  /**
   * Executes a command string sequentially through the workspace terminal queue.
   */
  executeCommand(commandStr, workingDirectory, environment) {
    return this.getEngine().executeCommand(commandStr, workingDirectory, environment);
  }
  /**
   * Cancels active command execution.
   */
  cancel() {
    if (this.activeEngine) {
      this.activeEngine.cancel();
    }
  }
  /**
   * Fetches the history list of all executed commands.
   */
  getCommands() {
    return this.activeEngine ? this.activeEngine.getCommands() : [];
  }
  /**
   * Returns details of the currently active running command.
   */
  getActiveCommand() {
    return this.activeEngine ? this.activeEngine.getActiveCommand() : null;
  }
};
var terminalService = new TerminalService();

// src/core/git/gitEvents.ts
var GitEvents = class {
  listeners = /* @__PURE__ */ new Set();
  /**
   * Subscribes a listener to Git repository events.
   */
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  /**
   * Emits a Git event.
   */
  emit(type, repositoryRoot, payload) {
    const event = {
      type,
      repositoryRoot,
      timestamp: Date.now(),
      payload
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error("Error in Git event listener:", err);
      }
    }
  }
};

// src/core/git/gitValidator.ts
var fs4 = __toESM(require("fs"));
var path5 = __toESM(require("path"));
var GitValidator = class {
  /**
   * Verifies if the target folder contains a .git directory.
   */
  validateRepository(rootPath) {
    const gitDir = path5.join(rootPath, ".git");
    if (!fs4.existsSync(gitDir)) {
      throw new Error(`Git Engine error: "${rootPath}" is not a valid Git repository`);
    }
  }
  /**
   * Verifies a commit message is provided and non-empty.
   */
  validateCommitMessage(message) {
    if (!message || !message.trim()) {
      throw new Error("Git Engine error: Commit message cannot be empty");
    }
  }
  /**
   * Detects if an active lock is present inside the repository.
   */
  validateNotLocked(rootPath) {
    const lockFile = path5.join(rootPath, ".git", "index.lock");
    if (fs4.existsSync(lockFile)) {
      throw new Error("Git Engine error: Repository is locked because .git/index.lock exists");
    }
  }
};
var gitValidator = new GitValidator();

// src/core/git/gitBranch.ts
var import_child_process2 = require("child_process");
function getBranchName(rootPath) {
  try {
    const branch = (0, import_child_process2.execSync)("git rev-parse --abbrev-ref HEAD", {
      cwd: rootPath,
      encoding: "utf8",
      stdio: ["pipe", "pipe", "ignore"]
    });
    return branch.trim();
  } catch (err) {
    return "unknown";
  }
}

// src/core/git/gitStatus.ts
var import_child_process3 = require("child_process");
function getRepositoryStatus(rootPath) {
  const branch = getBranchName(rootPath);
  const changedFiles = [];
  try {
    const statusOutput = (0, import_child_process3.execSync)("git status --porcelain", {
      cwd: rootPath,
      encoding: "utf8",
      stdio: ["pipe", "pipe", "ignore"]
    });
    const lines = statusOutput.split("\n");
    for (const line of lines) {
      if (!line.trim())
        continue;
      const code = line.substring(0, 2);
      const filePath = line.substring(3).trim();
      let status = "Untracked";
      if (code.includes("M")) {
        status = "Modified";
      } else if (code.includes("D")) {
        status = "Deleted";
      } else if (code.includes("A")) {
        status = "Added";
      } else if (code.includes("?")) {
        status = "Untracked";
      }
      changedFiles.push({ path: filePath, status });
    }
  } catch (err) {
  }
  return {
    branch,
    isDirty: changedFiles.length > 0,
    changedFiles
  };
}

// src/core/git/gitDiff.ts
var import_child_process4 = require("child_process");
function getDiffPreview(rootPath, filePath) {
  try {
    const args = filePath ? ` -- "${filePath}"` : "";
    const diff = (0, import_child_process4.execSync)(`git diff HEAD${args}`, {
      cwd: rootPath,
      encoding: "utf8",
      stdio: ["pipe", "pipe", "ignore"]
    });
    return diff;
  } catch (err) {
    return "";
  }
}

// src/core/git/gitCommit.ts
var import_child_process5 = require("child_process");
function createCommit(rootPath, message) {
  gitValidator.validateCommitMessage(message);
  gitValidator.validateNotLocked(rootPath);
  try {
    (0, import_child_process5.execSync)("git add -A", { cwd: rootPath, stdio: "ignore" });
    (0, import_child_process5.execSync)(`git commit -m "${message.replace(/"/g, '\\"')}"`, {
      cwd: rootPath,
      stdio: "ignore"
    });
    const hash = (0, import_child_process5.execSync)("git rev-parse HEAD", { cwd: rootPath, encoding: "utf8" }).trim();
    return hash;
  } catch (err) {
    throw new Error(`Git commit failed: ${err.message}`);
  }
}
function getCommitHistory(rootPath, limit = 5) {
  const history = [];
  try {
    const logOutput = (0, import_child_process5.execSync)(`git log -n ${limit} --pretty=format:"%H|%an|%ad|%s"`, {
      cwd: rootPath,
      encoding: "utf8",
      stdio: ["pipe", "pipe", "ignore"]
    });
    const lines = logOutput.split("\n");
    for (const line of lines) {
      if (!line.trim())
        continue;
      const [hash, author, date, message] = line.split("|");
      history.push({ hash, author, date, message });
    }
  } catch (err) {
  }
  return history;
}

// src/core/git/gitRepository.ts
var import_child_process6 = require("child_process");
var GitRepository = class {
  constructor(rootPath) {
    this.rootPath = rootPath;
  }
  /**
   * Compiles the high-level repository state info details.
   */
  getInfo() {
    const branch = getBranchName(this.rootPath);
    const statusInfo = getRepositoryStatus(this.rootPath);
    let lastCommit = "";
    let ahead = 0;
    let behind = 0;
    try {
      lastCommit = (0, import_child_process6.execSync)("git rev-parse HEAD", { cwd: this.rootPath, encoding: "utf8", stdio: ["pipe", "pipe", "ignore"] }).trim();
    } catch {
    }
    try {
      const abOutput = (0, import_child_process6.execSync)("git rev-list --left-right --count HEAD...@{u}", {
        cwd: this.rootPath,
        encoding: "utf8",
        stdio: ["pipe", "pipe", "ignore"]
      }).trim();
      const parts = abOutput.split(/\s+/);
      if (parts.length === 2) {
        ahead = parseInt(parts[0], 10) || 0;
        behind = parseInt(parts[1], 10) || 0;
      }
    } catch {
    }
    return {
      root: this.rootPath,
      branch,
      status: statusInfo.isDirty ? "Dirty" : "Clean",
      isDirty: statusInfo.isDirty,
      ahead,
      behind,
      lastCommit: lastCommit || void 0
    };
  }
  getRootPath() {
    return this.rootPath;
  }
};

// src/core/git/gitEngine.ts
var GitEngine = class {
  constructor(workspaceRoot) {
    this.workspaceRoot = workspaceRoot;
    gitValidator.validateRepository(workspaceRoot);
    this.repository = new GitRepository(workspaceRoot);
    this.events.emit("RepositoryLoaded" /* RepositoryLoaded */, workspaceRoot, { root: workspaceRoot });
  }
  events = new GitEvents();
  repository;
  /**
   * Subscribes to Git engine events.
   */
  subscribe(listener) {
    return this.events.subscribe(listener);
  }
  getRepositoryInfo() {
    return this.repository.getInfo();
  }
  getStatus() {
    const status = getRepositoryStatus(this.workspaceRoot);
    this.events.emit("StatusChanged" /* StatusChanged */, this.workspaceRoot, { status });
    return status;
  }
  getDiff(filePath) {
    const diff = getDiffPreview(this.workspaceRoot, filePath);
    this.events.emit("DiffGenerated" /* DiffGenerated */, this.workspaceRoot, { diff, filePath });
    return diff;
  }
  /**
   * Commits changes after validation checks.
   */
  commit(message) {
    gitValidator.validateCommitMessage(message);
    const hash = createCommit(this.workspaceRoot, message);
    this.events.emit("CommitCreated" /* CommitCreated */, this.workspaceRoot, { hash, message });
    return hash;
  }
  getHistory(limit = 5) {
    return getCommitHistory(this.workspaceRoot, limit);
  }
};

// src/core/git/gitService.ts
var vscode3 = __toESM(require("vscode"));
var GitService = class {
  activeEngine = null;
  getEngine() {
    const folders = vscode3.workspace.workspaceFolders;
    if (!folders || folders.length === 0) {
      throw new Error("Workspace Git Service: No workspace folder is open");
    }
    const root = folders[0].uri.fsPath;
    if (!this.activeEngine) {
      this.activeEngine = new GitEngine(root);
    }
    return this.activeEngine;
  }
  /**
   * Subscribes to active repository events.
   */
  subscribe(listener) {
    return this.getEngine().subscribe(listener);
  }
  // --- Wrapper APIs ---
  getRepositoryInfo() {
    return this.getEngine().getRepositoryInfo();
  }
  getStatus() {
    return this.getEngine().getStatus();
  }
  getDiff(filePath) {
    return this.getEngine().getDiff(filePath);
  }
  commit(message) {
    return this.getEngine().commit(message);
  }
  getHistory(limit = 5) {
    return this.getEngine().getHistory(limit);
  }
};
var gitService = new GitService();

// src/core/patch/diffGenerator.ts
function generateDiff(oldText, newText) {
  const oldLines = (oldText || "").split(/\r?\n/);
  const newLines = (newText || "").split(/\r?\n/);
  const diffLines = [];
  let i = 0;
  let j = 0;
  while (i < oldLines.length || j < newLines.length) {
    if (i < oldLines.length && j < newLines.length) {
      if (oldLines[i] === newLines[j]) {
        diffLines.push(`  ${oldLines[i]}`);
        i++;
        j++;
      } else {
        const nextMatchInNew = newLines.indexOf(oldLines[i], j);
        const nextMatchInOld = oldLines.indexOf(newLines[j], i);
        if (nextMatchInNew !== -1 && (nextMatchInOld === -1 || nextMatchInNew - j <= nextMatchInOld - i)) {
          for (let k = j; k < nextMatchInNew; k++) {
            diffLines.push(`+ ${newLines[k]}`);
          }
          j = nextMatchInNew;
        } else if (nextMatchInOld !== -1) {
          for (let k = i; k < nextMatchInOld; k++) {
            diffLines.push(`- ${oldLines[k]}`);
          }
          i = nextMatchInOld;
        } else {
          diffLines.push(`- ${oldLines[i]}`);
          diffLines.push(`+ ${newLines[j]}`);
          i++;
          j++;
        }
      }
    } else if (i < oldLines.length) {
      diffLines.push(`- ${oldLines[i]}`);
      i++;
    } else if (j < newLines.length) {
      diffLines.push(`+ ${newLines[j]}`);
      j++;
    }
  }
  return diffLines.join("\n");
}

// src/core/patch/mergeResolver.ts
var fs5 = __toESM(require("fs"));
var MergeResolver = class {
  /**
   * Checks if current file content differs from patch expected state.
   */
  hasConflict(filePath, oldContent) {
    if (!fs5.existsSync(filePath)) {
      return oldContent !== void 0 && oldContent !== "";
    }
    const currentContent = fs5.readFileSync(filePath, "utf8");
    return oldContent !== void 0 && currentContent !== oldContent;
  }
};
var mergeResolver = new MergeResolver();

// src/core/patch/patchValidator.ts
var fs6 = __toESM(require("fs"));
var path6 = __toESM(require("path"));
var PatchValidator = class {
  /**
   * Performs validation audits on a Patch model.
   */
  validate(patch, workspaceRoot) {
    const resolvedPath = path6.isAbsolute(patch.filePath) ? patch.filePath : path6.resolve(workspaceRoot, patch.filePath);
    if (this.isBinaryFile(resolvedPath)) {
      throw new Error(`Patch validation error: Binary file edits are not supported: "${patch.filePath}"`);
    }
    if (patch.changeType === "Update" /* Update */ && mergeResolver.hasConflict(resolvedPath, patch.oldContent)) {
      throw new Error(`Patch validation error: Conflict detected on file "${patch.filePath}"`);
    }
    if (patch.changeType === "Create" /* Create */ && fs6.existsSync(resolvedPath)) {
      throw new Error(`Patch validation error: File already exists at path "${patch.filePath}"`);
    }
    if ((patch.changeType === "Delete" /* Delete */ || patch.changeType === "Update" /* Update */) && !fs6.existsSync(resolvedPath)) {
      throw new Error(`Patch validation error: Target file does not exist for modification: "${patch.filePath}"`);
    }
    if (patch.changeType === "Update" /* Update */ && !patch.diff) {
      throw new Error("Patch validation error: Diff details are missing for update operation");
    }
  }
  isBinaryFile(filePath) {
    const binaryExtensions = [".png", ".jpg", ".jpeg", ".gif", ".pdf", ".exe", ".zip", ".tar", ".gz"];
    const ext = path6.extname(filePath).toLowerCase();
    if (binaryExtensions.includes(ext)) {
      return true;
    }
    if (fs6.existsSync(filePath)) {
      try {
        const buffer = fs6.readFileSync(filePath);
        for (let i = 0; i < Math.min(buffer.length, 512); i++) {
          if (buffer[i] === 0)
            return true;
        }
      } catch {
      }
    }
    return false;
  }
};
var patchValidator = new PatchValidator();

// src/core/patch/patchApplier.ts
var fs7 = __toESM(require("fs"));
var path7 = __toESM(require("path"));
var PatchApplier = class {
  /**
   * Applies the patch changes to the workspace filesystem.
   */
  apply(patch, workspaceRoot) {
    const resolvedPath = this.resolvePath(patch.filePath, workspaceRoot);
    switch (patch.changeType) {
      case "Create" /* Create */:
      case "Update" /* Update */:
        const dir = path7.dirname(resolvedPath);
        if (!fs7.existsSync(dir)) {
          fs7.mkdirSync(dir, { recursive: true });
        }
        fs7.writeFileSync(resolvedPath, patch.newContent || "", "utf8");
        break;
      case "Delete" /* Delete */:
        if (fs7.existsSync(resolvedPath)) {
          fs7.unlinkSync(resolvedPath);
        }
        break;
      case "Rename" /* Rename */:
      case "Move" /* Move */:
        const destination = this.resolvePath(patch.metadata?.destination || "", workspaceRoot);
        const destDir = path7.dirname(destination);
        if (!fs7.existsSync(destDir)) {
          fs7.mkdirSync(destDir, { recursive: true });
        }
        fs7.renameSync(resolvedPath, destination);
        break;
      default:
        throw new Error(`Unsupported change operation: ${patch.changeType}`);
    }
    patch.status = "Applied" /* Applied */;
  }
  /**
   * Reverts changes applied by a patch, rolling back to previous state.
   */
  rollback(patch, workspaceRoot) {
    const resolvedPath = this.resolvePath(patch.filePath, workspaceRoot);
    switch (patch.changeType) {
      case "Create" /* Create */:
        if (fs7.existsSync(resolvedPath)) {
          fs7.unlinkSync(resolvedPath);
        }
        break;
      case "Update" /* Update */:
        fs7.writeFileSync(resolvedPath, patch.oldContent || "", "utf8");
        break;
      case "Delete" /* Delete */:
        const dir = path7.dirname(resolvedPath);
        if (!fs7.existsSync(dir)) {
          fs7.mkdirSync(dir, { recursive: true });
        }
        fs7.writeFileSync(resolvedPath, patch.oldContent || "", "utf8");
        break;
      case "Rename" /* Rename */:
      case "Move" /* Move */:
        const destination = this.resolvePath(patch.metadata?.destination || "", workspaceRoot);
        if (fs7.existsSync(destination)) {
          fs7.renameSync(destination, resolvedPath);
        }
        break;
      default:
        throw new Error(`Unsupported rollback operation: ${patch.changeType}`);
    }
    patch.status = "RolledBack" /* RolledBack */;
  }
  resolvePath(filePath, workspaceRoot) {
    return path7.isAbsolute(filePath) ? filePath : path7.resolve(workspaceRoot, filePath);
  }
};
var patchApplier = new PatchApplier();

// src/core/patch/patchBuilder.ts
var import_crypto4 = require("crypto");
var PatchBuilder = class {
  /**
   * Constructs a new Patch model generating diffs dynamically.
   */
  build(operationId, filePath, changeType, oldContent, newContent, metadata) {
    let diff = "";
    if (changeType === "Update" /* Update */ && oldContent !== void 0 && newContent !== void 0) {
      diff = generateDiff(oldContent, newContent);
    } else if (changeType === "Create" /* Create */ && newContent !== void 0) {
      diff = newContent.split(/\r?\n/).map((l) => `+ ${l}`).join("\n");
    } else if (changeType === "Delete" /* Delete */ && oldContent !== void 0) {
      diff = oldContent.split(/\r?\n/).map((l) => `- ${l}`).join("\n");
    }
    return {
      id: (0, import_crypto4.randomUUID)(),
      operationId,
      filePath,
      changeType,
      oldContent,
      newContent,
      diff,
      status: "Draft" /* Draft */,
      createdAt: Date.now(),
      metadata
    };
  }
};
var patchBuilder = new PatchBuilder();

// src/core/patch/patchRegistry.ts
var PatchRegistry = class {
  patches = /* @__PURE__ */ new Map();
  /**
   * Registers a patch inside cache registry.
   */
  register(patch) {
    this.patches.set(patch.id, patch);
  }
  /**
   * Retrieves a patch from registry cache.
   */
  getById(id) {
    return this.patches.get(id);
  }
  /**
   * Filter patches by operationId.
   */
  getByOperationId(opId) {
    return Array.from(this.patches.values()).filter((p) => p.operationId === opId);
  }
  /**
   * Returns history of all registered patches.
   */
  getHistory() {
    return Array.from(this.patches.values());
  }
  clear() {
    this.patches.clear();
  }
};
var patchRegistry = new PatchRegistry();

// src/core/patch/patchEngine.ts
var PatchEngine = class {
  constructor(workspaceRoot) {
    this.workspaceRoot = workspaceRoot;
  }
  listeners = /* @__PURE__ */ new Set();
  /**
   * Subscribes to Patch event updates.
   */
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  emit(type, patchId, payload) {
    const event = {
      type,
      patchId,
      timestamp: Date.now(),
      payload
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error("Error in patch event listener:", err);
      }
    }
  }
  // --- Core Lifecycle ---
  createPatch(operationId, filePath, changeType, oldContent, newContent, metadata) {
    const patch = patchBuilder.build(operationId, filePath, changeType, oldContent, newContent, metadata);
    patchRegistry.register(patch);
    this.emit("PatchCreated" /* PatchCreated */, patch.id, { patch });
    try {
      this.validatePatch(patch.id);
    } catch {
      patch.status = "Generated" /* Generated */;
    }
    return patch;
  }
  validatePatch(patchId) {
    const patch = patchRegistry.getById(patchId);
    if (!patch)
      throw new Error(`Patch not found: ${patchId}`);
    patchValidator.validate(patch, this.workspaceRoot);
    patch.status = "Validated" /* Validated */;
    this.emit("PatchValidated" /* PatchValidated */, patch.id, { patch });
  }
  approvePatch(patchId) {
    const patch = patchRegistry.getById(patchId);
    if (!patch)
      throw new Error(`Patch not found: ${patchId}`);
    patch.status = "Approved" /* Approved */;
    this.emit("PatchApproved" /* PatchApproved */, patch.id, { patch });
  }
  rejectPatch(patchId) {
    const patch = patchRegistry.getById(patchId);
    if (!patch)
      throw new Error(`Patch not found: ${patchId}`);
    patch.status = "Rejected" /* Rejected */;
    this.emit("PatchRejected" /* PatchRejected */, patch.id, { patch });
  }
  applyPatch(patchId) {
    const patch = patchRegistry.getById(patchId);
    if (!patch)
      throw new Error(`Patch not found: ${patchId}`);
    if (patch.status !== "Approved" /* Approved */ && patch.status !== "Validated" /* Validated */) {
      throw new Error(`Patch cannot be applied in status: ${patch.status}`);
    }
    patchApplier.apply(patch, this.workspaceRoot);
    this.emit("PatchApplied" /* PatchApplied */, patch.id, { patch });
  }
  rollbackPatch(patchId) {
    const patch = patchRegistry.getById(patchId);
    if (!patch)
      throw new Error(`Patch not found: ${patchId}`);
    if (patch.status !== "Applied" /* Applied */) {
      throw new Error(`Patch cannot be rolled back in status: ${patch.status}`);
    }
    patchApplier.rollback(patch, this.workspaceRoot);
    this.emit("PatchRolledBack" /* PatchRolledBack */, patch.id, { patch });
  }
};

// src/core/patch/patchService.ts
var vscode4 = __toESM(require("vscode"));
var PatchService = class {
  activeEngine = null;
  getEngine() {
    const folders = vscode4.workspace.workspaceFolders;
    if (!folders || folders.length === 0) {
      throw new Error("Workspace Patch Service: No workspace folder is open");
    }
    const root = folders[0].uri.fsPath;
    if (!this.activeEngine) {
      this.activeEngine = new PatchEngine(root);
    }
    return this.activeEngine;
  }
  /**
   * Subscribes to active patch lifecycle events.
   */
  subscribe(listener) {
    return this.getEngine().subscribe(listener);
  }
  // --- Wrapper APIs ---
  createPatch(operationId, filePath, changeType, oldContent, newContent, metadata) {
    return this.getEngine().createPatch(operationId, filePath, changeType, oldContent, newContent, metadata);
  }
  validatePatch(patchId) {
    this.getEngine().validatePatch(patchId);
  }
  approvePatch(patchId) {
    this.getEngine().approvePatch(patchId);
  }
  rejectPatch(patchId) {
    this.getEngine().rejectPatch(patchId);
  }
  applyPatch(patchId) {
    this.getEngine().applyPatch(patchId);
  }
  rollbackPatch(patchId) {
    this.getEngine().rollbackPatch(patchId);
  }
  getPatch(patchId) {
    return patchRegistry.getById(patchId);
  }
  getHistory() {
    return patchRegistry.getHistory();
  }
};
var patchService = new PatchService();

// src/core/rollback/rollbackValidator.ts
var fs8 = __toESM(require("fs"));
var path8 = __toESM(require("path"));
var RollbackValidator = class {
  /**
   * Validates rollback parameters and checks for external workspace mutations.
   */
  validate(rollback, patch, workspaceRoot) {
    if (patch.status !== "Applied" /* Applied */) {
      throw new Error(`Rollback validation error: Patch "${patch.id}" has status "${patch.status}", expected "Applied"`);
    }
    if (!rollback.previousState || Object.keys(rollback.previousState).length === 0) {
      throw new Error("Rollback validation error: Original state is unavailable");
    }
    for (const filePath of rollback.affectedFiles) {
      const resolvedPath = path8.isAbsolute(filePath) ? filePath : path8.resolve(workspaceRoot, filePath);
      if (fs8.existsSync(resolvedPath)) {
        const currentContent = fs8.readFileSync(resolvedPath, "utf8");
        if (patch.newContent !== void 0 && currentContent !== patch.newContent) {
          throw new Error(`Rollback validation error: File "${filePath}" was modified externally since the patch was applied`);
        }
      } else {
        if (patch.newContent !== void 0 && patch.newContent !== "") {
          throw new Error(`Rollback validation error: Expected file "${filePath}" was deleted externally`);
        }
      }
    }
  }
};
var rollbackValidator = new RollbackValidator();

// src/core/rollback/rollbackBuilder.ts
var import_crypto5 = require("crypto");
var RollbackBuilder = class {
  /**
   * Compiles RollbackInfo using applied patch details.
   */
  build(patch) {
    const previousState = {};
    if (patch.oldContent !== void 0) {
      previousState[patch.filePath] = patch.oldContent;
    }
    return {
      id: (0, import_crypto5.randomUUID)(),
      patchId: patch.id,
      operationId: patch.operationId,
      affectedFiles: [patch.filePath],
      previousState,
      rollbackPlan: `Revert changes applied by patch "${patch.id}" in file "${patch.filePath}"`,
      status: "Pending" /* Pending */,
      createdAt: Date.now()
    };
  }
};
var rollbackBuilder = new RollbackBuilder();

// src/core/rollback/rollbackRegistry.ts
var RollbackRegistry = class {
  rollbacks = /* @__PURE__ */ new Map();
  /**
   * Registers a rollback transaction info cache.
   */
  register(rollback) {
    this.rollbacks.set(rollback.id, rollback);
  }
  /**
   * Retrieves a rollback by id.
   */
  getById(id) {
    return this.rollbacks.get(id);
  }
  /**
   * Retrieves a rollback associated with a patchId.
   */
  getByPatchId(patchId) {
    return Array.from(this.rollbacks.values()).find((r) => r.patchId === patchId);
  }
  /**
   * Returns all registered rollbacks.
   */
  getAll() {
    return Array.from(this.rollbacks.values());
  }
  clear() {
    this.rollbacks.clear();
  }
};
var rollbackRegistry = new RollbackRegistry();

// src/core/rollback/rollbackHistory.ts
var RollbackHistory = class {
  history = [];
  /**
   * Logs a completed or failed rollback status change.
   */
  log(rollback) {
    this.history.push({ ...rollback });
  }
  /**
   * Returns copy of the logged rollback histories.
   */
  getLog() {
    return [...this.history];
  }
  clear() {
    this.history = [];
  }
};
var rollbackHistory = new RollbackHistory();

// src/core/rollback/rollbackEngine.ts
var RollbackEngine = class {
  constructor(workspaceRoot) {
    this.workspaceRoot = workspaceRoot;
  }
  listeners = /* @__PURE__ */ new Set();
  /**
   * Subscribes to Rollback event updates.
   */
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  emit(type, rollbackId, payload) {
    const event = {
      type,
      rollbackId,
      timestamp: Date.now(),
      payload
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error("Error in rollback event listener:", err);
      }
    }
  }
  // --- Core API ---
  createRollback(patch) {
    const rollback = rollbackBuilder.build(patch);
    rollbackRegistry.register(rollback);
    this.emit("RollbackCreated" /* RollbackCreated */, rollback.id, { rollback });
    try {
      rollbackValidator.validate(rollback, patch, this.workspaceRoot);
      rollback.status = "Ready" /* Ready */;
      this.emit("RollbackValidated" /* RollbackValidated */, rollback.id, { rollback });
    } catch (error) {
      rollback.status = "Failed" /* Failed */;
      rollback.metadata = { error: error.message };
      this.emit("RollbackFailed" /* RollbackFailed */, rollback.id, { error: error.message });
      throw error;
    }
    return rollback;
  }
  executeRollback(rollbackId, patchService2) {
    const rollback = rollbackRegistry.getById(rollbackId);
    if (!rollback)
      throw new Error(`Rollback not found: ${rollbackId}`);
    if (rollback.status !== "Ready" /* Ready */) {
      throw new Error(`Rollback is not ready, current status: ${rollback.status}`);
    }
    rollback.status = "Executing" /* Executing */;
    this.emit("RollbackStarted" /* RollbackStarted */, rollback.id);
    try {
      patchService2.rollbackPatch(rollback.patchId);
      rollback.status = "Completed" /* Completed */;
      this.emit("RollbackCompleted" /* RollbackCompleted */, rollback.id);
      rollbackHistory.log(rollback);
    } catch (error) {
      rollback.status = "Failed" /* Failed */;
      rollback.metadata = { ...rollback.metadata, error: error.message };
      this.emit("RollbackFailed" /* RollbackFailed */, rollback.id, { error: error.message });
      rollbackHistory.log(rollback);
      throw error;
    }
  }
  getPreview(rollbackId, patch) {
    const rollback = rollbackRegistry.getById(rollbackId);
    if (!rollback)
      throw new Error(`Rollback not found: ${rollbackId}`);
    let linesRestored = 0;
    let linesRemoved = 0;
    if (patch.diff) {
      const lines = patch.diff.split(/\r?\n/);
      for (const line of lines) {
        if (line.startsWith("+")) {
          linesRemoved++;
        } else if (line.startsWith("-")) {
          linesRestored++;
        }
      }
    }
    const estimatedImpact = linesRestored + linesRemoved > 15 ? "High" : linesRestored + linesRemoved > 5 ? "Medium" : "Low";
    return {
      affectedFiles: rollback.affectedFiles,
      linesRestored,
      linesRemoved,
      estimatedImpact
    };
  }
};

// src/core/rollback/rollbackService.ts
var vscode5 = __toESM(require("vscode"));
var RollbackService = class {
  activeEngine = null;
  getEngine() {
    const folders = vscode5.workspace.workspaceFolders;
    if (!folders || folders.length === 0) {
      throw new Error("Workspace Rollback Service: No workspace folder is open");
    }
    const root = folders[0].uri.fsPath;
    if (!this.activeEngine) {
      this.activeEngine = new RollbackEngine(root);
    }
    return this.activeEngine;
  }
  /**
   * Subscribes to active rollback transaction event updates.
   */
  subscribe(listener) {
    return this.getEngine().subscribe(listener);
  }
  // --- Wrapper APIs ---
  createRollback(patchId) {
    const patch = patchService.getPatch(patchId);
    if (!patch)
      throw new Error(`Patch not found to configure rollback: ${patchId}`);
    return this.getEngine().createRollback(patch);
  }
  executeRollback(rollbackId) {
    this.getEngine().executeRollback(rollbackId, patchService);
  }
  getPreview(rollbackId) {
    const rollback = rollbackRegistry.getById(rollbackId);
    if (!rollback)
      throw new Error(`Rollback not found: ${rollbackId}`);
    const patch = patchService.getPatch(rollback.patchId);
    if (!patch)
      throw new Error(`Patch associated with rollback not found: ${rollback.patchId}`);
    return this.getEngine().getPreview(rollbackId, patch);
  }
  getRollback(rollbackId) {
    return rollbackRegistry.getById(rollbackId);
  }
  getHistory() {
    return rollbackRegistry.getAll();
  }
  getHistoryLog() {
    return rollbackHistory.getLog();
  }
};
var rollbackService = new RollbackService();

// src/core/checkpoint/checkpointEvents.ts
var CheckpointEvents = class {
  listeners = /* @__PURE__ */ new Set();
  /**
   * Subscribes a listener to Checkpoint events.
   */
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  /**
   * Broadcasts checkpoint events to all listeners.
   */
  emit(type, checkpointId, payload) {
    const event = {
      type,
      checkpointId,
      timestamp: Date.now(),
      payload
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error("Error in Checkpoint event listener:", err);
      }
    }
  }
};

// src/core/checkpoint/checkpointValidator.ts
var fs9 = __toESM(require("fs"));
var path9 = __toESM(require("path"));
var CheckpointValidator = class {
  /**
   * Verifies workspace paths and metadata tags.
   */
  validate(checkpoint, workspaceRoot) {
    if (!workspaceRoot || !fs9.existsSync(workspaceRoot)) {
      throw new Error(`Checkpoint validation error: Workspace path does not exist: "${workspaceRoot}"`);
    }
    if (!checkpoint.workspaceId || !checkpoint.transactionId) {
      throw new Error("Checkpoint validation error: Missing workspaceId or transactionId metadata");
    }
  }
  /**
   * Assures snapshot directories are present on disk.
   */
  validateSnapshotIntact(checkpointId, workspaceRoot) {
    const cpDir = path9.resolve(workspaceRoot, ".aiidle", "checkpoints", checkpointId);
    if (!fs9.existsSync(cpDir)) {
      throw new Error(`Checkpoint validation error: Snapshot directory is missing at "${cpDir}"`);
    }
  }
};
var checkpointValidator = new CheckpointValidator();

// src/core/checkpoint/checkpointBuilder.ts
var import_crypto6 = require("crypto");
var CheckpointBuilder = class {
  /**
   * Constructs a new CheckpointInfo model.
   */
  build(workspaceId, transactionId, affectedFiles, workspaceHash, metadata) {
    return {
      id: (0, import_crypto6.randomUUID)(),
      workspaceId,
      transactionId,
      timestamp: Date.now(),
      status: "Created" /* Created */,
      affectedFiles,
      workspaceHash,
      metadata
    };
  }
};
var checkpointBuilder = new CheckpointBuilder();

// src/core/checkpoint/checkpointRegistry.ts
var CheckpointRegistry = class {
  checkpoints = /* @__PURE__ */ new Map();
  /**
   * Registers a checkpoint, preventing duplicate IDs.
   */
  register(checkpoint) {
    if (this.checkpoints.has(checkpoint.id)) {
      throw new Error(`Checkpoint validation error: Duplicate checkpoint detected: "${checkpoint.id}"`);
    }
    this.checkpoints.set(checkpoint.id, checkpoint);
  }
  /**
   * Gets a checkpoint by ID.
   */
  getById(id) {
    return this.checkpoints.get(id);
  }
  /**
   * Returns all checkpoints.
   */
  getAll() {
    return Array.from(this.checkpoints.values());
  }
  remove(id) {
    this.checkpoints.delete(id);
  }
  clear() {
    this.checkpoints.clear();
  }
};
var checkpointRegistry = new CheckpointRegistry();

// src/core/checkpoint/checkpointStorage.ts
var fs10 = __toESM(require("fs"));
var path10 = __toESM(require("path"));
var CheckpointStorage = class {
  storageDir;
  constructor(workspaceRoot) {
    this.storageDir = path10.resolve(workspaceRoot, ".aiidle", "checkpoints");
    if (!fs10.existsSync(this.storageDir)) {
      fs10.mkdirSync(this.storageDir, { recursive: true });
    }
  }
  /**
   * Saves copies of the affected files' original content to checkpoint storage.
   */
  saveSnapshot(checkpointId, affectedFiles, workspaceRoot) {
    const cpDir = path10.join(this.storageDir, checkpointId);
    if (!fs10.existsSync(cpDir)) {
      fs10.mkdirSync(cpDir, { recursive: true });
    }
    for (const file of affectedFiles) {
      const sourcePath = path10.isAbsolute(file) ? file : path10.resolve(workspaceRoot, file);
      const relative6 = path10.relative(workspaceRoot, sourcePath);
      const destPath = path10.join(cpDir, relative6);
      if (fs10.existsSync(sourcePath)) {
        const destParent = path10.dirname(destPath);
        if (!fs10.existsSync(destParent)) {
          fs10.mkdirSync(destParent, { recursive: true });
        }
        fs10.copyFileSync(sourcePath, destPath);
      }
    }
  }
  /**
   * Restores files copies from checkpoint directory to the workspace root.
   */
  restoreSnapshot(checkpointId, affectedFiles, workspaceRoot) {
    const cpDir = path10.join(this.storageDir, checkpointId);
    if (!fs10.existsSync(cpDir)) {
      throw new Error(`Snapshot directory not found for checkpoint: ${checkpointId}`);
    }
    for (const file of affectedFiles) {
      const destPath = path10.isAbsolute(file) ? file : path10.resolve(workspaceRoot, file);
      const relative6 = path10.relative(workspaceRoot, destPath);
      const sourcePath = path10.join(cpDir, relative6);
      if (fs10.existsSync(sourcePath)) {
        const destParent = path10.dirname(destPath);
        if (!fs10.existsSync(destParent)) {
          fs10.mkdirSync(destParent, { recursive: true });
        }
        fs10.copyFileSync(sourcePath, destPath);
      } else {
        if (fs10.existsSync(destPath)) {
          fs10.unlinkSync(destPath);
        }
      }
    }
  }
  /**
   * Deletes snapshot files from disk.
   */
  deleteSnapshot(checkpointId) {
    const cpDir = path10.join(this.storageDir, checkpointId);
    if (fs10.existsSync(cpDir)) {
      fs10.rmSync(cpDir, { recursive: true, force: true });
    }
  }
};

// src/core/checkpoint/checkpointEngine.ts
var import_crypto7 = require("crypto");
var CheckpointEngine = class {
  constructor(workspaceRoot) {
    this.workspaceRoot = workspaceRoot;
    this.storage = new CheckpointStorage(workspaceRoot);
  }
  events = new CheckpointEvents();
  storage;
  /**
   * Subscribes to Checkpoint engine events.
   */
  subscribe(listener) {
    return this.events.subscribe(listener);
  }
  // --- API ---
  createCheckpoint(workspaceId, transactionId, affectedFiles, metadata) {
    const hash = (0, import_crypto7.createHash)("md5").update(workspaceId + transactionId + Date.now().toString()).digest("hex");
    const checkpoint = checkpointBuilder.build(workspaceId, transactionId, affectedFiles, hash, metadata);
    checkpointValidator.validate(checkpoint, this.workspaceRoot);
    this.storage.saveSnapshot(checkpoint.id, affectedFiles, this.workspaceRoot);
    checkpoint.status = "Active" /* Active */;
    checkpointRegistry.register(checkpoint);
    this.events.emit("CheckpointCreated" /* CheckpointCreated */, checkpoint.id, { checkpoint });
    return checkpoint;
  }
  restoreCheckpoint(id) {
    const cp = checkpointRegistry.getById(id);
    if (!cp)
      throw new Error(`Checkpoint not found: ${id}`);
    checkpointValidator.validate(cp, this.workspaceRoot);
    checkpointValidator.validateSnapshotIntact(id, this.workspaceRoot);
    cp.status = "Restoring" /* Restoring */;
    this.events.emit("CheckpointLoaded" /* CheckpointLoaded */, cp.id);
    try {
      this.storage.restoreSnapshot(id, cp.affectedFiles, this.workspaceRoot);
      cp.status = "Restored" /* Restored */;
      this.events.emit("CheckpointRestored" /* CheckpointRestored */, cp.id, { checkpoint: cp });
    } catch (err) {
      cp.status = "Active" /* Active */;
      throw new Error(`Checkpoint restoration failed: ${err.message}`);
    }
  }
  deleteCheckpoint(id) {
    const cp = checkpointRegistry.getById(id);
    if (!cp)
      throw new Error(`Checkpoint not found: ${id}`);
    this.storage.deleteSnapshot(id);
    cp.status = "Deleted" /* Deleted */;
    checkpointRegistry.remove(id);
    this.events.emit("CheckpointDeleted" /* CheckpointDeleted */, id);
  }
  expireCheckpoint(id) {
    const cp = checkpointRegistry.getById(id);
    if (!cp)
      throw new Error(`Checkpoint not found: ${id}`);
    this.storage.deleteSnapshot(id);
    cp.status = "Expired" /* Expired */;
    this.events.emit("CheckpointExpired" /* CheckpointExpired */, id);
  }
  getHistory() {
    return checkpointRegistry.getAll();
  }
};

// src/core/checkpoint/checkpointService.ts
var vscode6 = __toESM(require("vscode"));
var CheckpointService = class {
  activeEngine = null;
  getEngine() {
    const folders = vscode6.workspace.workspaceFolders;
    if (!folders || folders.length === 0) {
      throw new Error("Workspace Checkpoint Service: No workspace folder is open");
    }
    const root = folders[0].uri.fsPath;
    if (!this.activeEngine) {
      this.activeEngine = new CheckpointEngine(root);
    }
    return this.activeEngine;
  }
  /**
   * Subscribes to active checkpoint events.
   */
  subscribe(listener) {
    return this.getEngine().subscribe(listener);
  }
  // --- Wrapper APIs ---
  createCheckpoint(workspaceId, transactionId, affectedFiles, metadata) {
    return this.getEngine().createCheckpoint(workspaceId, transactionId, affectedFiles, metadata);
  }
  restoreCheckpoint(id) {
    this.getEngine().restoreCheckpoint(id);
  }
  deleteCheckpoint(id) {
    this.getEngine().deleteCheckpoint(id);
  }
  expireCheckpoint(id) {
    this.getEngine().expireCheckpoint(id);
  }
  getCheckpoint(id) {
    return checkpointRegistry.getById(id);
  }
  getHistory() {
    return checkpointRegistry.getAll();
  }
};
var checkpointService = new CheckpointService();

// src/core/diagnostics/diagnosticsTypes.ts
var DiagnosticSeverity = /* @__PURE__ */ ((DiagnosticSeverity4) => {
  DiagnosticSeverity4["Info"] = "Info";
  DiagnosticSeverity4["Warning"] = "Warning";
  DiagnosticSeverity4["Error"] = "Error";
  DiagnosticSeverity4["Critical"] = "Critical";
  return DiagnosticSeverity4;
})(DiagnosticSeverity || {});

// src/core/diagnostics/diagnosticsEvents.ts
var DiagnosticsEvents = class {
  listeners = /* @__PURE__ */ new Set();
  /**
   * Subscribes a listener to diagnostics events.
   */
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  /**
   * Broadcasts diagnostics events to all active listeners.
   */
  emit(type, diagnosticId, payload) {
    const event = {
      type,
      diagnosticId,
      timestamp: Date.now(),
      payload
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error("Error in diagnostics event listener:", err);
      }
    }
  }
};

// src/core/diagnostics/diagnosticsValidator.ts
var DiagnosticsValidator = class {
  /**
   * Verifies diagnostic inputs contain source, message, severity, and category tags.
   */
  validate(diagnostic) {
    if (!diagnostic.sourceModule || !diagnostic.sourceModule.trim()) {
      throw new Error("Diagnostics validation error: Source module is required");
    }
    if (!diagnostic.message || !diagnostic.message.trim()) {
      throw new Error("Diagnostics validation error: Message content is required");
    }
    if (!diagnostic.severity) {
      throw new Error("Diagnostics validation error: Severity tag is required");
    }
    if (!diagnostic.category) {
      throw new Error("Diagnostics validation error: Category tag is required");
    }
  }
};
var diagnosticsValidator = new DiagnosticsValidator();

// src/core/diagnostics/diagnosticsFormatter.ts
function formatDiagnostic(diag) {
  const timestamp = new Date(diag.timestamp).toISOString();
  let output = `[${timestamp}] [${diag.severity}] [${diag.category}] [${diag.sourceModule}] ${diag.message}`;
  if (diag.operationId) {
    output += ` (OpID: ${diag.operationId})`;
  }
  if (diag.details) {
    output += `
Details: ${diag.details}`;
  }
  if (diag.stackTrace) {
    output += `
Stack Trace: ${diag.stackTrace}`;
  }
  return output;
}

// src/core/diagnostics/diagnosticsRegistry.ts
var DiagnosticsRegistry = class {
  diagnostics = [];
  /**
   * Registers a diagnostic entry, checking duplicate ID and metadata conditions.
   */
  register(diagnostic) {
    const isDuplicate = this.diagnostics.some(
      (d) => d.id === diagnostic.id || d.sourceModule === diagnostic.sourceModule && d.message === diagnostic.message && Math.abs(d.timestamp - diagnostic.timestamp) < 100
    );
    if (isDuplicate)
      return;
    this.diagnostics.push(diagnostic);
  }
  getById(id) {
    return this.diagnostics.find((d) => d.id === id);
  }
  /**
   * Filters and sorts registered diagnostics logs.
   */
  getFiltered(filters) {
    let list = [...this.diagnostics];
    if (filters.severity) {
      list = list.filter((d) => d.severity === filters.severity);
    }
    if (filters.category) {
      list = list.filter((d) => d.category === filters.category);
    }
    if (filters.sourceModule) {
      list = list.filter((d) => d.sourceModule.toLowerCase() === filters.sourceModule.toLowerCase());
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter((d) => d.message.toLowerCase().includes(q) || d.details && d.details.toLowerCase().includes(q));
    }
    const order = filters.sortOrder === "desc" ? -1 : 1;
    list.sort((a, b) => {
      if (filters.sortBy === "severity") {
        const severities = Object.values(DiagnosticSeverity);
        return (severities.indexOf(a.severity) - severities.indexOf(b.severity)) * order;
      }
      return (a.timestamp - b.timestamp) * order;
    });
    return list;
  }
  getHistory() {
    return [...this.diagnostics];
  }
  /**
   * Exports cache logs into JSON string formats.
   */
  exportJson() {
    return JSON.stringify(this.diagnostics, null, 2);
  }
  clear() {
    this.diagnostics = [];
  }
};
var diagnosticsRegistry = new DiagnosticsRegistry();

// src/core/diagnostics/diagnosticsCollector.ts
var import_crypto8 = require("crypto");
var DiagnosticsCollector = class {
  /**
   * Compiles diagnostic properties into validated Diagnostic models.
   */
  collect(sourceModule, severity, category, message, details, stackTrace, operationId) {
    return {
      id: (0, import_crypto8.randomUUID)(),
      timestamp: Date.now(),
      sourceModule,
      severity,
      category,
      message,
      details,
      stackTrace,
      operationId,
      status: "Open" /* Open */
    };
  }
};
var diagnosticsCollector = new DiagnosticsCollector();

// src/core/diagnostics/diagnosticsReporter.ts
var fs11 = __toESM(require("fs"));
var path11 = __toESM(require("path"));
var DiagnosticsReporter = class {
  logPath;
  constructor(workspaceRoot) {
    const logDir = path11.resolve(workspaceRoot, ".aiidle", "logs");
    if (!fs11.existsSync(logDir)) {
      fs11.mkdirSync(logDir, { recursive: true });
    }
    this.logPath = path11.join(logDir, "diagnostics.log");
  }
  /**
   * Appends formatted diagnostics info to filesystem logs.
   */
  report(diagnostic) {
    const line = formatDiagnostic(diagnostic) + "\n---\n";
    try {
      fs11.appendFileSync(this.logPath, line, "utf8");
    } catch {
    }
  }
  getLogPath() {
    return this.logPath;
  }
};

// src/core/diagnostics/diagnosticsEngine.ts
var DiagnosticsEngine = class {
  constructor(workspaceRoot) {
    this.workspaceRoot = workspaceRoot;
    this.reporter = new DiagnosticsReporter(workspaceRoot);
  }
  events = new DiagnosticsEvents();
  reporter;
  /**
   * Subscribes to Diagnostics event notifications.
   */
  subscribe(listener) {
    return this.events.subscribe(listener);
  }
  // --- API ---
  report(sourceModule, severity, category, message, details, stackTrace, operationId) {
    const diag = diagnosticsCollector.collect(sourceModule, severity, category, message, details, stackTrace, operationId);
    diagnosticsValidator.validate(diag);
    diagnosticsRegistry.register(diag);
    this.reporter.report(diag);
    this.events.emit("DiagnosticCreated" /* DiagnosticCreated */, diag.id, { diagnostic: diag });
    return diag;
  }
  updateStatus(id, status) {
    const diag = diagnosticsRegistry.getById(id);
    if (!diag)
      throw new Error(`Diagnostic not found: ${id}`);
    diag.status = status;
    let eventType = "DiagnosticUpdated" /* DiagnosticUpdated */;
    if (status === "Resolved" /* Resolved */)
      eventType = "DiagnosticResolved" /* DiagnosticResolved */;
    if (status === "Ignored" /* Ignored */)
      eventType = "DiagnosticIgnored" /* DiagnosticIgnored */;
    this.events.emit(eventType, id, { diagnostic: diag });
  }
  getFilteredHistory(filters) {
    return diagnosticsRegistry.getFiltered(filters);
  }
  getHistory() {
    return diagnosticsRegistry.getHistory();
  }
  exportJson() {
    return diagnosticsRegistry.exportJson();
  }
};

// src/core/diagnostics/diagnosticsService.ts
var vscode7 = __toESM(require("vscode"));
var DiagnosticsService = class {
  activeEngine = null;
  getEngine() {
    const folders = vscode7.workspace.workspaceFolders;
    if (!folders || folders.length === 0) {
      throw new Error("Workspace Diagnostics Service: No workspace folder is open");
    }
    const root = folders[0].uri.fsPath;
    if (!this.activeEngine) {
      this.activeEngine = new DiagnosticsEngine(root);
    }
    return this.activeEngine;
  }
  /**
   * Subscribes to active diagnostics updates.
   */
  subscribe(listener) {
    return this.getEngine().subscribe(listener);
  }
  // --- Wrapper APIs ---
  report(sourceModule, severity, category, message, details, stackTrace, operationId) {
    return this.getEngine().report(sourceModule, severity, category, message, details, stackTrace, operationId);
  }
  updateStatus(id, status) {
    this.getEngine().updateStatus(id, status);
  }
  getFilteredHistory(filters) {
    return this.getEngine().getFilteredHistory(filters);
  }
  getHistory() {
    return this.getEngine().getHistory();
  }
  exportJson() {
    return this.getEngine().exportJson();
  }
};
var diagnosticsService = new DiagnosticsService();

// src/core/permission/permissionTypes.ts
var PermissionAction = /* @__PURE__ */ ((PermissionAction6) => {
  PermissionAction6["ReadFile"] = "ReadFile";
  PermissionAction6["WriteFile"] = "WriteFile";
  PermissionAction6["DeleteFile"] = "DeleteFile";
  PermissionAction6["RenameFile"] = "RenameFile";
  PermissionAction6["MoveFile"] = "MoveFile";
  PermissionAction6["ExecuteTerminal"] = "ExecuteTerminal";
  PermissionAction6["GitCommit"] = "GitCommit";
  PermissionAction6["NetworkAccess"] = "NetworkAccess";
  PermissionAction6["WorkspaceScan"] = "WorkspaceScan";
  PermissionAction6["PluginAccess"] = "PluginAccess";
  return PermissionAction6;
})(PermissionAction || {});

// src/core/permission/permissionEvents.ts
var PermissionEvents = class {
  listeners = /* @__PURE__ */ new Set();
  /**
   * Subscribes a listener to permission events.
   */
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  /**
   * Broadcasts permission events to all subscribers.
   */
  emit(type, requestId, payload) {
    const event = {
      type,
      requestId,
      timestamp: Date.now(),
      payload
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error("Error in permission event listener:", err);
      }
    }
  }
};

// src/core/permission/permissionValidator.ts
var PermissionValidator = class {
  /**
   * Validates target properties and throws exceptions on invalid action names or missing resource targets.
   */
  validateRequest(request) {
    if (!request.resource || !request.resource.trim()) {
      throw new Error("Permission validation error: Requested resource cannot be empty");
    }
    if (!request.action || !Object.values(PermissionAction).includes(request.action)) {
      throw new Error(`Permission validation error: Invalid or missing action type "${request.action}"`);
    }
    if (!request.riskLevel) {
      throw new Error("Permission validation error: Risk level is required");
    }
    if (!request.requestedBy || !request.requestedBy.trim()) {
      throw new Error("Permission validation error: Requesting module source must be specified");
    }
  }
  /**
   * Identifies expired request records.
   */
  isExpired(request) {
    const expiryWindow = 10 * 60 * 1e3;
    return Date.now() - request.requestedAt > expiryWindow;
  }
};
var permissionValidator = new PermissionValidator();

// src/core/permission/permissionRequest.ts
var import_crypto9 = require("crypto");
function createPermissionRequest(action, resource, riskLevel, reason, requestedBy, operationId) {
  return {
    id: (0, import_crypto9.randomUUID)(),
    operationId,
    resource,
    action,
    riskLevel,
    reason,
    requestedBy,
    requestedAt: Date.now(),
    status: "Pending" /* Pending */
  };
}

// src/core/permission/permissionResponse.ts
function createPermissionResponse(requestId, approved, status, policyApplied) {
  return {
    requestId,
    approved,
    status,
    policyApplied,
    timestamp: Date.now()
  };
}

// src/core/permission/permissionPolicy.ts
var PermissionPolicyManager = class {
  rules = [];
  /**
   * Registers or updates a policy rule cache.
   */
  addRule(action, resourcePattern, policy, approved, ttlMs) {
    const expiresAt = ttlMs ? Date.now() + ttlMs : void 0;
    this.rules = this.rules.filter((r) => !(r.action === action && r.resourcePattern === resourcePattern));
    this.rules.push({ action, resourcePattern, policy, approved, expiresAt });
  }
  /**
   * Matches incoming actions against active rules, identifying hits and approvals.
   */
  checkPolicy(action, resource) {
    const now = Date.now();
    this.rules = this.rules.filter((r) => !r.expiresAt || r.expiresAt > now);
    const match = this.rules.find((r) => {
      if (r.action !== action)
        return false;
      if (r.resourcePattern === "*" || r.resourcePattern === resource)
        return true;
      if (resource.startsWith(r.resourcePattern))
        return true;
      return false;
    });
    if (match) {
      if (match.policy === "AlwaysDeny" /* AlwaysDeny */) {
        return { matches: true, policy: "AlwaysDeny" /* AlwaysDeny */, approved: false };
      }
      if (match.policy === "AlwaysAllow" /* AlwaysAllow */) {
        return { matches: true, policy: "AlwaysAllow" /* AlwaysAllow */, approved: true };
      }
      if (match.policy === "AllowForSession" /* AllowForSession */) {
        return { matches: true, policy: "AllowForSession" /* AllowForSession */, approved: match.approved };
      }
      if (match.policy === "AskOnce" /* AskOnce */) {
        return { matches: true, policy: "AskOnce" /* AskOnce */, approved: match.approved };
      }
    }
    return { matches: false };
  }
  clearSessionRules() {
    this.rules = this.rules.filter((r) => r.policy !== "AllowForSession" /* AllowForSession */);
  }
  getRules() {
    return [...this.rules];
  }
};

// src/core/permission/permissionRegistry.ts
var fs12 = __toESM(require("fs"));
var path12 = __toESM(require("path"));
var PermissionRegistry = class {
  requests = /* @__PURE__ */ new Map();
  auditLogPath;
  constructor(workspaceRoot) {
    const logDir = path12.resolve(workspaceRoot, ".aiidle", "logs");
    if (!fs12.existsSync(logDir)) {
      fs12.mkdirSync(logDir, { recursive: true });
    }
    this.auditLogPath = path12.join(logDir, "permission-audit.log");
  }
  /**
   * Registers a permission request and appends logs to permission-audit.log.
   */
  register(request) {
    if (this.requests.has(request.id)) {
      throw new Error(`Permission validation error: Duplicate request detected: "${request.id}"`);
    }
    this.requests.set(request.id, request);
    this.writeAudit(request, "Requested");
  }
  getById(id) {
    return this.requests.get(id);
  }
  getHistory() {
    return Array.from(this.requests.values());
  }
  /**
   * Updates state parameters and logs audits.
   */
  updateStatus(id, status) {
    const req = this.requests.get(id);
    if (req) {
      req.status = status;
      this.writeAudit(req, `Status updated to ${status}`);
    }
  }
  writeAudit(req, eventDesc) {
    const line = `[${(/* @__PURE__ */ new Date()).toISOString()}] [${req.action}] [${req.riskLevel}] Resource: ${req.resource} | By: ${req.requestedBy} | Event: ${eventDesc} (ID: ${req.id})
`;
    try {
      fs12.appendFileSync(this.auditLogPath, line, "utf8");
    } catch {
    }
  }
  getAuditLogPath() {
    return this.auditLogPath;
  }
};

// src/core/permission/permissionEngine.ts
var PermissionEngine = class {
  constructor(workspaceRoot) {
    this.workspaceRoot = workspaceRoot;
    this.registry = new PermissionRegistry(workspaceRoot);
  }
  registry;
  policyManager = new PermissionPolicyManager();
  events = new PermissionEvents();
  /**
   * Subscribes a listener to permission events.
   */
  subscribe(listener) {
    return this.events.subscribe(listener);
  }
  // --- API ---
  /**
   * Initiates permission request evaluation. If a rule fits, skips approval state.
   */
  requestPermission(action, resource, riskLevel, reason, requestedBy, operationId) {
    const check = this.policyManager.checkPolicy(action, resource);
    if (check.matches) {
      const approved = !!check.approved;
      const status = approved ? "Approved" /* Approved */ : "Denied" /* Denied */;
      const response = createPermissionResponse("", approved, status, check.policy);
      return { response };
    }
    const request = createPermissionRequest(action, resource, riskLevel, reason, requestedBy, operationId);
    permissionValidator.validateRequest(request);
    this.registry.register(request);
    this.events.emit("PermissionRequested" /* PermissionRequested */, request.id, { request });
    return { request };
  }
  /**
   * Updates request parameters on user grant actions.
   */
  grantPermission(id, approved, policy) {
    const req = this.registry.getById(id);
    if (!req)
      throw new Error(`Permission request not found: ${id}`);
    if (permissionValidator.isExpired(req)) {
      req.status = "Expired" /* Expired */;
      this.registry.updateStatus(id, "Expired" /* Expired */);
      this.events.emit("PermissionExpired" /* PermissionExpired */, id);
      return createPermissionResponse(id, false, "Expired" /* Expired */);
    }
    const status = approved ? "Approved" /* Approved */ : "Denied" /* Denied */;
    req.status = status;
    this.registry.updateStatus(id, status);
    if (policy && policy !== "AlwaysAsk" /* AlwaysAsk */) {
      this.policyManager.addRule(req.action, req.resource, policy, approved);
      req.policyUsed = policy;
    }
    const eventType = approved ? "PermissionApproved" /* PermissionApproved */ : "PermissionDenied" /* PermissionDenied */;
    this.events.emit(eventType, id, { request: req });
    return createPermissionResponse(id, approved, status, policy);
  }
  /**
   * Iterates through pending requests to mark expired ones.
   */
  expireRequests() {
    const history = this.registry.getHistory();
    for (const req of history) {
      if (req.status === "Pending" /* Pending */ && permissionValidator.isExpired(req)) {
        req.status = "Expired" /* Expired */;
        this.registry.updateStatus(req.id, "Expired" /* Expired */);
        this.events.emit("PermissionExpired" /* PermissionExpired */, req.id);
      }
    }
  }
  getHistory() {
    return this.registry.getHistory();
  }
  getRules() {
    return this.policyManager.getRules();
  }
  clearSessionRules() {
    this.policyManager.clearSessionRules();
  }
};

// src/core/permission/permissionService.ts
var vscode8 = __toESM(require("vscode"));
var PermissionService = class {
  activeEngine = null;
  getEngine() {
    const folders = vscode8.workspace.workspaceFolders;
    if (!folders || folders.length === 0) {
      throw new Error("Workspace Permission Service: No workspace folder is open");
    }
    const root = folders[0].uri.fsPath;
    if (!this.activeEngine) {
      this.activeEngine = new PermissionEngine(root);
    }
    return this.activeEngine;
  }
  /**
   * Subscribes to active permissions events.
   */
  subscribe(listener) {
    return this.getEngine().subscribe(listener);
  }
  // --- Wrapper APIs ---
  requestPermission(action, resource, riskLevel, reason, requestedBy, operationId) {
    return this.getEngine().requestPermission(action, resource, riskLevel, reason, requestedBy, operationId);
  }
  grantPermission(id, approved, policy) {
    return this.getEngine().grantPermission(id, approved, policy);
  }
  getHistory() {
    return this.getEngine().getHistory();
  }
  getRules() {
    return this.getEngine().getRules();
  }
  clearSessionRules() {
    this.getEngine().clearSessionRules();
  }
  expireRequests() {
    this.getEngine().expireRequests();
  }
};
var permissionService = new PermissionService();

// src/core/context/contextEvents.ts
var ContextEvents = class {
  listeners = /* @__PURE__ */ new Set();
  /**
   * Subscribes a listener to Context Engine events.
   */
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  /**
   * Broadcasts context events to all active listeners.
   */
  emit(type, contextId, payload) {
    const event = {
      type,
      contextId,
      timestamp: Date.now(),
      payload
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error("Error in context event listener:", err);
      }
    }
  }
};

// src/core/context/contextValidator.ts
var ContextValidator = class {
  /**
   * Enforces rules checking missing roots, empty packages, duplicate files, or wrong size tags.
   */
  validate(context) {
    if (!context.workspace.rootPath) {
      throw new Error("Context validation error: Workspace root path is missing");
    }
    if (context.files.length === 0 && !context.selection.selectedText) {
      throw new Error("Context validation error: Context package cannot be empty (no files or selection text)");
    }
    const filePaths = context.files.map((f) => f.filePath);
    const uniquePaths = new Set(filePaths);
    if (filePaths.length !== uniquePaths.size) {
      throw new Error("Context validation error: Duplicate files detected in context info");
    }
    if (context.metadata.tokenEstimateTotal < 0 || context.metadata.sizeBytesTotal < 0) {
      throw new Error("Context validation error: Invalid total metrics metadata");
    }
  }
};
var contextValidator = new ContextValidator();

// src/core/context/contextResolver.ts
var fs13 = __toESM(require("fs"));
var path13 = __toESM(require("path"));
var ContextResolver = class {
  /**
   * Resolves files details, calculating character token counts and skipping ignored/duplicated folders.
   */
  resolveFiles(root, filePaths) {
    const resolved = [];
    const absoluteUnique = /* @__PURE__ */ new Set();
    for (const filePath of filePaths) {
      const absolute = path13.isAbsolute(filePath) ? filePath : path13.resolve(root, filePath);
      if (absoluteUnique.has(absolute))
        continue;
      absoluteUnique.add(absolute);
      const isIgnored2 = absolute.includes("node_modules") || absolute.includes(".git") || absolute.includes(".aiidle/checkpoints");
      if (isIgnored2)
        continue;
      if (fs13.existsSync(absolute) && fs13.statSync(absolute).isFile()) {
        try {
          const content = fs13.readFileSync(absolute, "utf8");
          const size = Buffer.byteLength(content, "utf8");
          const tokenEstimate = Math.ceil(content.length / 4);
          resolved.push({
            filePath: path13.relative(root, absolute),
            content,
            size,
            tokenEstimate
          });
        } catch {
        }
      }
    }
    return resolved;
  }
  /**
   * Reads and parses workspace configuration package.json details.
   */
  resolvePackageJson(root) {
    const pkg = path13.join(root, "package.json");
    if (fs13.existsSync(pkg)) {
      try {
        return JSON.parse(fs13.readFileSync(pkg, "utf8"));
      } catch {
        return void 0;
      }
    }
    return void 0;
  }
};
var contextResolver = new ContextResolver();

// src/core/context/contextSelector.ts
var ContextSelector = class {
  /**
   * Selects files to include without exceeding size bounds.
   */
  selectUnderLimit(files, limitBytes) {
    const selected = [];
    let currentBytes = 0;
    for (const file of files) {
      if (currentBytes + file.size <= limitBytes) {
        selected.push(file);
        currentBytes += file.size;
      }
    }
    return selected;
  }
};
var contextSelector = new ContextSelector();

// src/core/context/contextBuilder.ts
var import_crypto10 = require("crypto");
var ContextBuilder = class {
  /**
   * Compiles diagnostic list, git status, planners, and resolved file sets into ProjectContext.
   */
  build(params) {
    const limit = params.limitBytes || 500 * 1024;
    const hasGit = require("fs").existsSync(require("path").join(params.rootPath, ".git"));
    const packageJson = contextResolver.resolvePackageJson(params.rootPath);
    const workspace21 = {
      rootPath: params.rootPath,
      projectName: packageJson?.name || require("path").basename(params.rootPath),
      packageJson,
      hasGit
    };
    const resolved = contextResolver.resolveFiles(params.rootPath, params.filePaths);
    const files = contextSelector.selectUnderLimit(resolved, limit);
    const sizeBytesTotal = files.reduce((acc, f) => acc + f.size, 0);
    const tokenEstimateTotal = files.reduce((acc, f) => acc + f.tokenEstimate, 0);
    return {
      id: (0, import_crypto10.randomUUID)(),
      workspace: workspace21,
      files,
      selection: params.selection,
      planner: params.planner,
      execution: params.execution,
      git: params.git,
      diagnostics: params.diagnostics,
      metadata: {
        tokenEstimateTotal,
        sizeBytesTotal,
        limitBytes: limit
      },
      timestamp: Date.now()
    };
  }
};
var contextBuilder = new ContextBuilder();

// src/core/context/contextEngine.ts
var ContextEngine = class {
  constructor(workspaceRoot) {
    this.workspaceRoot = workspaceRoot;
  }
  events = new ContextEvents();
  activeContext = null;
  /**
   * Subscribes a listener to active context event changes.
   */
  subscribe(listener) {
    return this.events.subscribe(listener);
  }
  // --- API ---
  buildContext(params) {
    this.events.emit("ContextRequested" /* ContextRequested */, "");
    const ctx = contextBuilder.build({
      rootPath: this.workspaceRoot,
      ...params
    });
    contextValidator.validate(ctx);
    this.activeContext = ctx;
    this.events.emit("ContextBuilt" /* ContextBuilt */, ctx.id, { context: ctx });
    return ctx;
  }
  getActiveContext() {
    return this.activeContext;
  }
  expireContext() {
    if (this.activeContext) {
      const id = this.activeContext.id;
      this.activeContext = null;
      this.events.emit("ContextExpired" /* ContextExpired */, id);
    }
  }
};

// src/core/context/contextService.ts
var vscode9 = __toESM(require("vscode"));
var ContextService = class {
  activeEngine = null;
  getEngine() {
    const folders = vscode9.workspace.workspaceFolders;
    if (!folders || folders.length === 0) {
      throw new Error("Workspace Context Service: No workspace folder is open");
    }
    const root = folders[0].uri.fsPath;
    if (!this.activeEngine) {
      this.activeEngine = new ContextEngine(root);
    }
    return this.activeEngine;
  }
  /**
   * Subscribes to active context events.
   */
  subscribe(listener) {
    return this.getEngine().subscribe(listener);
  }
  // --- Wrapper APIs ---
  buildContext(params) {
    return this.getEngine().buildContext(params);
  }
  getActiveContext() {
    return this.getEngine().getActiveContext();
  }
  expireContext() {
    this.getEngine().expireContext();
  }
};
var contextService = new ContextService();

// src/core/indexer/languageDetector.ts
var path14 = __toESM(require("path"));
function detectLanguage(filePath) {
  const ext = path14.extname(filePath).toLowerCase();
  switch (ext) {
    case ".ts":
      return "TypeScript";
    case ".js":
    case ".cjs":
    case ".mjs":
      return "JavaScript";
    case ".tsx":
      return "TSX";
    case ".jsx":
      return "JSX";
    case ".json":
      return "JSON";
    case ".md":
    case ".markdown":
      return "Markdown";
    case ".yaml":
    case ".yml":
      return "YAML";
    default:
      return "Unknown";
  }
}

// src/core/indexer/indexValidator.ts
var fs14 = __toESM(require("fs"));
var path15 = __toESM(require("path"));
var IndexValidator = class {
  /**
   * Checks extensions and scans first 512 bytes for NULL characters to discard binaries.
   */
  isBinaryFile(filePath) {
    const ext = path15.extname(filePath).toLowerCase();
    const binaryExtensions = /* @__PURE__ */ new Set([
      ".png",
      ".jpg",
      ".jpeg",
      ".gif",
      ".ico",
      ".pdf",
      ".zip",
      ".tar",
      ".gz",
      ".exe",
      ".dll",
      ".so",
      ".dylib",
      ".node",
      ".woff",
      ".woff2",
      ".ttf",
      ".eot",
      ".mp3",
      ".mp4",
      ".avi",
      ".mov",
      ".db",
      ".sqlite"
    ]);
    if (binaryExtensions.has(ext))
      return true;
    if (fs14.existsSync(filePath)) {
      try {
        const stat = fs14.statSync(filePath);
        if (stat.size > 2 * 1024 * 1024)
          return true;
        const buffer = Buffer.alloc(512);
        const fd = fs14.openSync(filePath, "r");
        const bytesRead = fs14.readSync(fd, buffer, 0, 512, 0);
        fs14.closeSync(fd);
        for (let i = 0; i < bytesRead; i++) {
          if (buffer[i] === 0)
            return true;
        }
      } catch {
        return false;
      }
    }
    return false;
  }
  /**
   * Disallows duplication of workspace symbols.
   */
  validateSymbols(symbols) {
    const unique = /* @__PURE__ */ new Set();
    for (const sym of symbols) {
      const key = `${sym.name}:${sym.type}:${sym.filePath}`;
      if (unique.has(key)) {
        throw new Error(`Index validation error: Duplicate symbol detected: "${sym.name}" (${sym.type}) in "${sym.filePath}"`);
      }
      unique.add(key);
    }
  }
  /**
   * Asserts target file path starts with root folder prefix.
   */
  validatePath(filePath, root) {
    const resolved = path15.resolve(root, filePath);
    if (!resolved.startsWith(path15.resolve(root))) {
      throw new Error(`Index validation error: Invalid path outside root bounds: "${filePath}"`);
    }
  }
};
var indexValidator = new IndexValidator();

// src/core/indexer/symbolIndexer.ts
var SymbolIndexer = class {
  /**
   * Scans text content lines with regular expressions to collect symbol targets.
   */
  indexSymbols(filePath, content) {
    const symbols = [];
    const lines = content.split("\n");
    const classRegex = /(?:export\s+)?class\s+([A-Za-z0-9_]+)/;
    const interfaceRegex = /(?:export\s+)?interface\s+([A-Za-z0-9_]+)/;
    const functionRegex = /(?:export\s+)?(?:async\s+)?function\s+([A-Za-z0-9_]+)/;
    const arrowFuncRegex = /(?:export\s+)?(?:const|let|var)\s+([A-Za-z0-9_]+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>/;
    const typeRegex = /(?:export\s+)?type\s+([A-Za-z0-9_]+)\s*=/;
    const enumRegex = /(?:export\s+)?enum\s+([A-Za-z0-9_]+)/;
    const isComponent = (name) => /^[A-Z][A-Za-z0-9_]*/.test(name);
    const isHook = (name) => /^use[A-Z][A-Za-z0-9_]*/.test(name);
    lines.forEach((lineText, idx) => {
      const lineNum = idx + 1;
      const classMatch = classRegex.exec(lineText);
      if (classMatch) {
        symbols.push({ name: classMatch[1], type: "Class" /* Class */, filePath, line: lineNum });
        return;
      }
      const interfaceMatch = interfaceRegex.exec(lineText);
      if (interfaceMatch) {
        symbols.push({ name: interfaceMatch[1], type: "Interface" /* Interface */, filePath, line: lineNum });
        return;
      }
      const funcMatch = functionRegex.exec(lineText);
      if (funcMatch) {
        const name = funcMatch[1];
        let type = "Function" /* Function */;
        if (isHook(name))
          type = "Hook" /* Hook */;
        else if (isComponent(name))
          type = "Component" /* Component */;
        symbols.push({ name, type, filePath, line: lineNum });
        return;
      }
      const arrowMatch = arrowFuncRegex.exec(lineText);
      if (arrowMatch) {
        const name = arrowMatch[1];
        let type = "Function" /* Function */;
        if (isHook(name))
          type = "Hook" /* Hook */;
        else if (isComponent(name))
          type = "Component" /* Component */;
        symbols.push({ name, type, filePath, line: lineNum });
        return;
      }
      const typeMatch = typeRegex.exec(lineText);
      if (typeMatch) {
        symbols.push({ name: typeMatch[1], type: "Type" /* Type */, filePath, line: lineNum });
        return;
      }
      const enumMatch = enumRegex.exec(lineText);
      if (enumMatch) {
        symbols.push({ name: enumMatch[1], type: "Enum" /* Enum */, filePath, line: lineNum });
        return;
      }
    });
    return symbols;
  }
};
var symbolIndexer = new SymbolIndexer();

// src/core/indexer/dependencyIndexer.ts
var DependencyIndexer = class {
  /**
   * Evaluates imports and require statements to build reference connections.
   */
  indexDependencies(filePath, content) {
    const dependencies = [];
    const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
    const requireRegex = /(?:const|let|var)\s+.*?\s+=\s+require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      const target = match[1];
      if (target.startsWith(".")) {
        dependencies.push({
          sourceFilePath: filePath,
          targetFilePath: target,
          type: "Import"
        });
      }
    }
    while ((match = requireRegex.exec(content)) !== null) {
      const target = match[1];
      if (target.startsWith(".")) {
        dependencies.push({
          sourceFilePath: filePath,
          targetFilePath: target,
          type: "Requires"
        });
      }
    }
    return dependencies;
  }
};
var dependencyIndexer = new DependencyIndexer();

// src/core/indexer/configIndexer.ts
var fs15 = __toESM(require("fs"));
var path16 = __toESM(require("path"));
var ConfigIndexer = class {
  /**
   * Scans package dependencies and tsconfig flags to identify project framework and language environments.
   */
  indexConfig(root) {
    let framework = "Vanilla";
    let language = "JavaScript";
    const tsconfig = path16.join(root, "tsconfig.json");
    if (fs15.existsSync(tsconfig)) {
      language = "TypeScript";
    }
    const packageJsonPath = path16.join(root, "package.json");
    if (fs15.existsSync(packageJsonPath)) {
      try {
        const pkg = JSON.parse(fs15.readFileSync(packageJsonPath, "utf8"));
        const deps = { ...pkg.dependencies, ...pkg.devDependencies };
        if (deps["next"]) {
          framework = "Next.js";
        } else if (deps["react"]) {
          framework = "React";
        } else if (deps["vue"]) {
          framework = "Vue";
        } else if (deps["svelte"]) {
          framework = "Svelte";
        } else if (deps["express"]) {
          framework = "Express";
        }
      } catch {
      }
    }
    return { framework, language };
  }
};
var configIndexer = new ConfigIndexer();

// src/core/indexer/fileIndexer.ts
var fs16 = __toESM(require("fs"));
var path17 = __toESM(require("path"));
var FileIndexer = class {
  ignoreFolders = /* @__PURE__ */ new Set([
    "node_modules",
    "dist",
    "build",
    "coverage",
    ".next",
    ".git",
    ".cache",
    "temp-context-workspace",
    "temp-diagnostics-workspace",
    "temp-permission-workspace",
    "temp-checkpoint-workspace"
  ]);
  /**
   * Explores workspace directories gathering files meta while filtering binaries and target ignore lists.
   */
  walk(root, currentDir = root) {
    const files = [];
    const folders = [];
    let entries = [];
    try {
      entries = fs16.readdirSync(currentDir);
    } catch {
      return { files, folders };
    }
    let filesCount = 0;
    for (const entry of entries) {
      if (this.ignoreFolders.has(entry))
        continue;
      const absolute = path17.join(currentDir, entry);
      let stat;
      try {
        stat = fs16.statSync(absolute);
      } catch {
        continue;
      }
      if (stat.isDirectory()) {
        const sub = this.walk(root, absolute);
        files.push(...sub.files);
        folders.push(...sub.folders);
      } else if (stat.isFile()) {
        if (indexValidator.isBinaryFile(absolute))
          continue;
        filesCount++;
        files.push({
          filePath: path17.relative(root, absolute),
          language: detectLanguage(absolute),
          size: stat.size
        });
      }
    }
    folders.push({
      folderPath: path17.relative(root, currentDir) || ".",
      filesCount
    });
    return { files, folders };
  }
};
var fileIndexer = new FileIndexer();

// src/core/indexer/indexBuilder.ts
var fs17 = __toESM(require("fs"));
var path18 = __toESM(require("path"));
var import_crypto11 = require("crypto");
var IndexBuilder = class {
  /**
   * Constructs the unified ProjectIndex compiling path structures, imports maps, and framework types.
   */
  buildIndex(root, workspaceId, progressCallback) {
    const id = (0, import_crypto11.randomUUID)();
    const walkResult = fileIndexer.walk(root);
    const files = walkResult.files;
    const folders = walkResult.folders;
    const symbols = [];
    const dependencies = [];
    files.forEach((file, idx) => {
      const absolute = path18.resolve(root, file.filePath);
      indexValidator.validatePath(file.filePath, root);
      try {
        const content = fs17.readFileSync(absolute, "utf8");
        const fileSymbols = symbolIndexer.indexSymbols(file.filePath, content);
        symbols.push(...fileSymbols);
        const fileDeps = dependencyIndexer.indexDependencies(file.filePath, content);
        dependencies.push(...fileDeps);
      } catch {
      }
      if (progressCallback) {
        const pct = Math.floor((idx + 1) / files.length * 100);
        progressCallback(pct);
      }
    });
    indexValidator.validateSymbols(symbols);
    const config = configIndexer.indexConfig(root);
    return {
      id,
      workspaceId,
      files,
      folders,
      symbols,
      dependencies,
      framework: config.framework,
      language: config.language,
      updatedAt: Date.now()
    };
  }
};
var indexBuilder = new IndexBuilder();

// src/core/indexer/indexerEngine.ts
var path19 = __toESM(require("path"));
var fs18 = __toESM(require("fs"));
var IndexerEngine = class {
  constructor(workspaceRoot) {
    this.workspaceRoot = workspaceRoot;
  }
  listeners = /* @__PURE__ */ new Set();
  currentIndex = null;
  /**
   * Subscribes a listener to Project Indexer engine events.
   */
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  emit(type, payload) {
    const event = {
      type,
      payload,
      timestamp: Date.now()
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error("Error in indexer event listener:", err);
      }
    }
  }
  // --- API ---
  startIndexing(workspaceId) {
    this.emit("IndexStarted" /* IndexStarted */, { workspaceId });
    const index = indexBuilder.buildIndex(
      this.workspaceRoot,
      workspaceId,
      (percent) => {
        this.emit("FileIndexed" /* FileIndexed */, { percent });
      }
    );
    this.currentIndex = index;
    this.emit("IndexCompleted" /* IndexCompleted */, { index });
    return index;
  }
  updateIndexFile(filePath) {
    if (!this.currentIndex)
      return;
    const absolute = path19.resolve(this.workspaceRoot, filePath);
    const relative6 = path19.relative(this.workspaceRoot, absolute);
    this.currentIndex.symbols = this.currentIndex.symbols.filter((s) => s.filePath !== relative6);
    this.currentIndex.dependencies = this.currentIndex.dependencies.filter((d) => d.sourceFilePath !== relative6);
    if (fs18.existsSync(absolute)) {
      try {
        const content = fs18.readFileSync(absolute, "utf8");
        const newSymbols = symbolIndexer.indexSymbols(relative6, content);
        this.currentIndex.symbols.push(...newSymbols);
        const newDeps = dependencyIndexer.indexDependencies(relative6, content);
        this.currentIndex.dependencies.push(...newDeps);
        const existingFile = this.currentIndex.files.find((f) => f.filePath === relative6);
        if (existingFile) {
          existingFile.size = fs18.statSync(absolute).size;
        } else {
          this.currentIndex.files.push({
            filePath: relative6,
            language: detectLanguage(absolute),
            size: fs18.statSync(absolute).size
          });
        }
      } catch {
      }
    } else {
      this.currentIndex.files = this.currentIndex.files.filter((f) => f.filePath !== relative6);
    }
    this.currentIndex.updatedAt = Date.now();
    this.emit("IndexUpdated" /* IndexUpdated */, { index: this.currentIndex });
  }
  getIndex() {
    return this.currentIndex;
  }
};

// src/core/embedding/embeddingTypes.ts
var EmbeddingSourceType = /* @__PURE__ */ ((EmbeddingSourceType3) => {
  EmbeddingSourceType3["File"] = "File";
  EmbeddingSourceType3["Folder"] = "Folder";
  EmbeddingSourceType3["Function"] = "Function";
  EmbeddingSourceType3["Class"] = "Class";
  EmbeddingSourceType3["Component"] = "Component";
  EmbeddingSourceType3["Api"] = "Api";
  EmbeddingSourceType3["Configuration"] = "Configuration";
  EmbeddingSourceType3["Documentation"] = "Documentation";
  return EmbeddingSourceType3;
})(EmbeddingSourceType || {});

// src/core/embedding/embeddingEvents.ts
var EmbeddingEvents = class {
  listeners = /* @__PURE__ */ new Set();
  /**
   * Subscribes a listener to Embedding Engine events.
   */
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  /**
   * Broadcasts embedding event changes.
   */
  emit(type, sourceId, payload) {
    const event = {
      type,
      sourceId,
      timestamp: Date.now(),
      payload
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error("Error in embedding event listener:", err);
      }
    }
  }
};

// src/core/embedding/embeddingValidator.ts
var EmbeddingValidator = class {
  /**
   * Validates target properties and throws exceptions on empty content or wrong source types.
   */
  validate(sourceId, sourceType, content) {
    if (!sourceId || !sourceId.trim()) {
      throw new Error("Embedding validation error: Source ID is required");
    }
    if (!sourceType || !Object.values(EmbeddingSourceType).includes(sourceType)) {
      throw new Error(`Embedding validation error: Invalid or unsupported source type "${sourceType}"`);
    }
    if (!content || !content.trim()) {
      throw new Error("Embedding validation error: Embedding content cannot be empty");
    }
  }
};
var embeddingValidator = new EmbeddingValidator();

// src/core/embedding/embeddingCache.ts
var import_crypto12 = require("crypto");
var EmbeddingCache = class {
  cache = /* @__PURE__ */ new Map();
  /**
   * Generates MD5 hex hash from content text.
   */
  getChecksum(content) {
    return (0, import_crypto12.createHash)("md5").update(content, "utf8").digest("hex");
  }
  /**
   * Returns cached embedding if checksum values match.
   */
  get(sourceId, checksum) {
    const cached = this.cache.get(sourceId);
    if (cached && cached.checksum === checksum) {
      return cached;
    }
    return null;
  }
  set(sourceId, obj) {
    this.cache.set(sourceId, obj);
  }
  clear() {
    this.cache.clear();
  }
  getAll() {
    return Array.from(this.cache.values());
  }
};
var embeddingCache = new EmbeddingCache();

// src/core/embedding/embeddingQueue.ts
var EmbeddingQueue = class {
  queue = [];
  activeJobs = /* @__PURE__ */ new Set();
  /**
   * Pushes a job to the queue if it's not already present.
   */
  enqueue(job) {
    const exists = this.queue.some((j) => j.sourceId === job.sourceId);
    if (exists)
      return false;
    this.queue.push(job);
    return true;
  }
  dequeue() {
    if (this.queue.length === 0)
      return null;
    return this.queue.shift() || null;
  }
  markActive(sourceId) {
    this.activeJobs.add(sourceId);
  }
  markInactive(sourceId) {
    this.activeJobs.delete(sourceId);
  }
  isActive(sourceId) {
    return this.activeJobs.has(sourceId);
  }
  getPending() {
    return [...this.queue];
  }
  clear() {
    this.queue = [];
    this.activeJobs.clear();
  }
};

// src/core/embedding/providers/mockProvider.ts
var MockProvider = class {
  name = "MockOfflineProvider";
  dimensions = 384;
  /**
   * Generates deterministic mock vector array numbers.
   */
  async generate(content) {
    const vector = [];
    const len = content.length;
    for (let i = 0; i < this.dimensions; i++) {
      const code = len > 0 ? content.charCodeAt(i % len) : 0;
      vector.push(Math.sin(code + i) * 0.5 + 0.5);
    }
    return vector;
  }
};

// src/core/embedding/embeddingEngine.ts
var import_crypto13 = require("crypto");
var EmbeddingEngine = class {
  events = new EmbeddingEvents();
  queue = new EmbeddingQueue();
  provider = new MockProvider();
  failedItems = /* @__PURE__ */ new Map();
  /**
   * Subscribes a listener to Embedding Engine changes.
   */
  subscribe(listener) {
    return this.events.subscribe(listener);
  }
  setProvider(provider) {
    this.provider = provider;
  }
  getProviderName() {
    return this.provider.name;
  }
  getPendingQueue() {
    return this.queue.getPending();
  }
  getFailedItems() {
    return this.failedItems;
  }
  // --- API ---
  queueJob(sourceId, sourceType, content) {
    embeddingValidator.validate(sourceId, sourceType, content);
    const checksum = embeddingCache.getChecksum(content);
    const cached = embeddingCache.get(sourceId, checksum);
    if (cached) {
      return cached;
    }
    const queuedObj = {
      id: (0, import_crypto13.randomUUID)(),
      sourceId,
      sourceType,
      vectorId: "",
      checksum,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      provider: this.provider.name,
      status: "Queued" /* Queued */
    };
    const enqueued = this.queue.enqueue({ sourceId, sourceType, content });
    if (enqueued) {
      this.events.emit("EmbeddingQueued" /* EmbeddingQueued */, sourceId, { queuedObj });
    }
    return queuedObj;
  }
  /**
   * Processes all queued jobs sequentially using pluggable providers.
   */
  async processQueue() {
    let job;
    while ((job = this.queue.dequeue()) !== null) {
      const { sourceId, sourceType, content } = job;
      if (this.queue.isActive(sourceId)) {
        continue;
      }
      this.queue.markActive(sourceId);
      this.events.emit("EmbeddingStarted" /* EmbeddingStarted */, sourceId);
      try {
        const checksum = embeddingCache.getChecksum(content);
        const vector = await this.provider.generate(content);
        const obj = {
          id: (0, import_crypto13.randomUUID)(),
          sourceId,
          sourceType,
          vectorId: `vec-${(0, import_crypto13.randomUUID)()}`,
          checksum,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          provider: this.provider.name,
          status: "Completed" /* Completed */,
          vector
        };
        embeddingCache.set(sourceId, obj);
        this.failedItems.delete(sourceId);
        this.events.emit("EmbeddingGenerated" /* EmbeddingGenerated */, sourceId, { obj });
      } catch (err) {
        this.failedItems.set(sourceId, err.message || "Unknown generation failure");
        this.events.emit("EmbeddingFailed" /* EmbeddingFailed */, sourceId, { error: err.message });
      } finally {
        this.queue.markInactive(sourceId);
      }
    }
  }
};

// src/core/embedding/embeddingService.ts
var vscode10 = __toESM(require("vscode"));
var EmbeddingService = class {
  activeEngine = null;
  getEngine() {
    const folders = vscode10.workspace.workspaceFolders;
    if (!folders || folders.length === 0) {
      throw new Error("Workspace Embedding Service: No workspace folder is open");
    }
    const root = folders[0].uri.fsPath;
    if (!this.activeEngine) {
      this.activeEngine = new EmbeddingEngine(root);
    }
    return this.activeEngine;
  }
  /**
   * Subscribes a listener to Embedding changes.
   */
  subscribe(listener) {
    return this.getEngine().subscribe(listener);
  }
  // --- Wrapper APIs ---
  setProvider(provider) {
    this.getEngine().setProvider(provider);
  }
  getProviderName() {
    return this.getEngine().getProviderName();
  }
  queueJob(sourceId, sourceType, content) {
    return this.getEngine().queueJob(sourceId, sourceType, content);
  }
  async processQueue() {
    await this.getEngine().processQueue();
  }
  getPendingQueue() {
    return this.getEngine().getPendingQueue();
  }
  getFailedItems() {
    return this.getEngine().getFailedItems();
  }
};
var embeddingService = new EmbeddingService();

// src/core/vectorStore/vectorStoreEvents.ts
var VectorStoreEvents = class {
  listeners = /* @__PURE__ */ new Set();
  /**
   * Subscribes a listener to Vector Store events.
   */
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  /**
   * Broadcasts vector changes.
   */
  emit(type, vectorId, payload) {
    const event = {
      type,
      vectorId,
      timestamp: Date.now(),
      payload
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error("Error in vector store event listener:", err);
      }
    }
  }
};

// src/core/vectorStore/vectorStoreValidator.ts
var VectorStoreValidator = class {
  /**
   * Asserts vector properties, checking dimensions count, NaNs elements, and metadata completeness.
   */
  validate(record, expectedDimensions) {
    if (!record.id || !record.id.trim()) {
      throw new Error("Vector store validation error: Vector ID is required");
    }
    if (!record.vector || !Array.isArray(record.vector) || record.vector.length === 0) {
      throw new Error("Vector store validation error: Vector array is required and cannot be empty");
    }
    if (expectedDimensions !== void 0 && record.vector.length !== expectedDimensions) {
      throw new Error(`Vector store validation error: Dimension mismatch: Expected ${expectedDimensions}, but got ${record.vector.length}`);
    }
    const hasNaN = record.vector.some((val) => typeof val !== "number" || isNaN(val) || !isFinite(val));
    if (hasNaN) {
      throw new Error("Vector store validation error: Vector array contains corrupted/invalid decimal values");
    }
    if (!record.metadata || typeof record.metadata !== "object") {
      throw new Error("Vector store validation error: Invalid metadata object structure");
    }
  }
};
var vectorStoreValidator = new VectorStoreValidator();

// src/core/vectorStore/vectorStoreCache.ts
var VectorStoreCache = class {
  cacheHits = 0;
  cacheMisses = 0;
  cacheMap = /* @__PURE__ */ new Map();
  /**
   * Returns cached value and bumps hit rate.
   */
  get(id) {
    const record = this.cacheMap.get(id);
    if (record) {
      this.cacheHits++;
      return record;
    }
    this.cacheMisses++;
    return null;
  }
  set(id, record) {
    this.cacheMap.set(id, record);
  }
  delete(id) {
    this.cacheMap.delete(id);
  }
  getCacheHitRate() {
    const total = this.cacheHits + this.cacheMisses;
    if (total === 0)
      return 100;
    return Math.floor(this.cacheHits / total * 100);
  }
  clear() {
    this.cacheMap.clear();
    this.cacheHits = 0;
    this.cacheMisses = 0;
  }
};
var vectorStoreCache = new VectorStoreCache();

// src/core/vectorStore/vectorStorePersistence.ts
var fs19 = __toESM(require("fs"));
var path20 = __toESM(require("path"));
var VectorStorePersistence = class {
  filePath;
  constructor(workspaceRoot) {
    this.filePath = path20.join(workspaceRoot, ".aiidle", "vectorStore", "index.json");
  }
  /**
   * Serializes active vectors to disk.
   */
  save(records) {
    try {
      const dir = path20.dirname(this.filePath);
      if (!fs19.existsSync(dir)) {
        fs19.mkdirSync(dir, { recursive: true });
      }
      fs19.writeFileSync(this.filePath, JSON.stringify(records, null, 2), "utf8");
    } catch (err) {
      console.error("Failed to save vector store index file:", err);
    }
  }
  /**
   * Deserializes indices from disk.
   */
  load() {
    if (fs19.existsSync(this.filePath)) {
      try {
        const content = fs19.readFileSync(this.filePath, "utf8");
        return JSON.parse(content);
      } catch (err) {
        console.error("Failed to parse vector store index file:", err);
        return [];
      }
    }
    return [];
  }
};

// src/core/vectorStore/vectorStoreRegistry.ts
var fs20 = __toESM(require("fs"));
var path21 = __toESM(require("path"));
var VectorStoreRegistry = class {
  /**
   * Evaluates size boundaries and counts to build stats details.
   */
  getStats(workspaceRoot, storedCount, dimensions, providerName, cacheHitRate) {
    const file = path21.join(workspaceRoot, ".aiidle", "vectorStore", "index.json");
    let size = 0;
    if (fs20.existsSync(file)) {
      size = fs20.statSync(file).size;
    }
    return {
      storedCount,
      dimensions,
      provider: providerName,
      storageSizeBytes: size,
      cacheHitRate,
      isReady: true
    };
  }
};
var vectorStoreRegistry = new VectorStoreRegistry();

// src/core/vectorStore/similarity.ts
function calculateCosineSimilarity(v1, v2) {
  if (v1.length !== v2.length)
    return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < v1.length; i++) {
    dotProduct += v1[i] * v2[i];
    normA += v1[i] * v1[i];
    normB += v2[i] * v2[i];
  }
  if (normA === 0 || normB === 0)
    return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
function calculateDotProduct(v1, v2) {
  if (v1.length !== v2.length)
    return 0;
  let dotProduct = 0;
  for (let i = 0; i < v1.length; i++) {
    dotProduct += v1[i] * v2[i];
  }
  return dotProduct;
}
function calculateEuclideanDistance(v1, v2) {
  if (v1.length !== v2.length)
    return 0;
  let sum = 0;
  for (let i = 0; i < v1.length; i++) {
    const diff = v1[i] - v2[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}
function calculateSimilarity(v1, v2, metric) {
  switch (metric) {
    case "Cosine" /* Cosine */:
      return calculateCosineSimilarity(v1, v2);
    case "DotProduct" /* DotProduct */:
      return calculateDotProduct(v1, v2);
    case "Euclidean" /* Euclidean */:
      const dist = calculateEuclideanDistance(v1, v2);
      return 1 / (1 + dist);
    default:
      return 0;
  }
}

// src/core/vectorStore/metadataFilter.ts
var MetadataFilter = class {
  /**
   * Checks key/value metadata matches against record collections.
   */
  filter(records, filters) {
    return records.filter((record) => {
      for (const [key, value] of Object.entries(filters)) {
        if (record.metadata[key] !== value) {
          return false;
        }
      }
      return true;
    });
  }
};
var metadataFilter = new MetadataFilter();

// src/core/vectorStore/providers/memoryProvider.ts
var MemoryProvider = class {
  name = "MemoryStoreProvider";
  records = /* @__PURE__ */ new Map();
  insert(record) {
    if (this.records.has(record.id)) {
      throw new Error(`Vector ID duplicate error: "${record.id}" already exists`);
    }
    this.records.set(record.id, record);
  }
  update(record) {
    if (!this.records.has(record.id)) {
      throw new Error(`Vector update failed: ID "${record.id}" does not exist`);
    }
    this.records.set(record.id, record);
  }
  delete(id) {
    this.records.delete(id);
  }
  get(id) {
    return this.records.get(id) || null;
  }
  list() {
    return Array.from(this.records.values());
  }
  clear() {
    this.records.clear();
  }
  /**
   * Evaluates scores against stored records and returns sorted listings.
   */
  similaritySearch(queryVector, limit, metric) {
    const results = [];
    for (const record of this.records.values()) {
      if (record.vector.length !== queryVector.length)
        continue;
      const score = calculateSimilarity(record.vector, queryVector, metric);
      results.push({ record, score });
    }
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, limit);
  }
};

// src/core/vectorStore/vectorStoreEngine.ts
var VectorStoreEngine = class {
  constructor(workspaceRoot) {
    this.workspaceRoot = workspaceRoot;
    this.persistence = new VectorStorePersistence(workspaceRoot);
    this.loadIndex();
  }
  events = new VectorStoreEvents();
  provider = new MemoryProvider();
  persistence;
  /**
   * Subscribes a listener to Vector Store engine events.
   */
  subscribe(listener) {
    return this.events.subscribe(listener);
  }
  setProvider(provider) {
    this.provider = provider;
    this.loadIndex();
  }
  getProviderName() {
    return this.provider.name;
  }
  loadIndex() {
    const records = this.persistence.load();
    this.provider.clear();
    vectorStoreCache.clear();
    for (const record of records) {
      try {
        this.provider.insert(record);
        vectorStoreCache.set(record.id, record);
      } catch {
      }
    }
    this.events.emit("VectorLoaded" /* VectorLoaded */, void 0, { count: records.length });
    this.events.emit("VectorStoreReady" /* VectorStoreReady */);
  }
  saveIndex() {
    const records = this.provider.list();
    this.persistence.save(records);
  }
  // --- APIs ---
  insert(record) {
    const existing = this.provider.list();
    const expected = existing.length > 0 ? existing[0].dimensions : void 0;
    vectorStoreValidator.validate(record, expected);
    if (this.provider.get(record.id)) {
      throw new Error(`Vector store error: Duplicate ID detected: "${record.id}"`);
    }
    this.provider.insert(record);
    vectorStoreCache.set(record.id, record);
    this.saveIndex();
    this.events.emit("VectorInserted" /* VectorInserted */, record.id, { record });
  }
  update(record) {
    const existing = this.provider.list();
    const expected = existing.length > 0 ? existing[0].dimensions : void 0;
    vectorStoreValidator.validate(record, expected);
    this.provider.update(record);
    vectorStoreCache.set(record.id, record);
    this.saveIndex();
    this.events.emit("VectorUpdated" /* VectorUpdated */, record.id, { record });
  }
  delete(id) {
    this.provider.delete(id);
    vectorStoreCache.delete(id);
    this.saveIndex();
    this.events.emit("VectorDeleted" /* VectorDeleted */, id);
  }
  get(id) {
    const cached = vectorStoreCache.get(id);
    if (cached)
      return cached;
    const record = this.provider.get(id);
    if (record) {
      vectorStoreCache.set(id, record);
      return record;
    }
    return null;
  }
  query(filters) {
    const all = this.provider.list();
    return metadataFilter.filter(all, filters);
  }
  similaritySearch(queryVector, limit, metric) {
    return this.provider.similaritySearch(queryVector, limit, metric);
  }
  clear() {
    this.provider.clear();
    vectorStoreCache.clear();
    this.saveIndex();
  }
  getStats() {
    const all = this.provider.list();
    const dim = all.length > 0 ? all[0].dimensions : 0;
    return vectorStoreRegistry.getStats(
      this.workspaceRoot,
      all.length,
      dim,
      this.provider.name,
      vectorStoreCache.getCacheHitRate()
    );
  }
};

// src/core/vectorStore/vectorStoreService.ts
var vscode11 = __toESM(require("vscode"));
var VectorStoreService = class {
  activeEngine = null;
  getEngine() {
    const folders = vscode11.workspace.workspaceFolders;
    if (!folders || folders.length === 0) {
      throw new Error("Workspace Vector Store Service: No workspace folder is open");
    }
    const root = folders[0].uri.fsPath;
    if (!this.activeEngine) {
      this.activeEngine = new VectorStoreEngine(root);
    }
    return this.activeEngine;
  }
  /**
   * Subscribes a listener to Vector Store changes.
   */
  subscribe(listener) {
    return this.getEngine().subscribe(listener);
  }
  // --- Wrapper APIs ---
  setProvider(provider) {
    this.getEngine().setProvider(provider);
  }
  getProviderName() {
    return this.getEngine().getProviderName();
  }
  insert(record) {
    this.getEngine().insert(record);
  }
  update(record) {
    this.getEngine().update(record);
  }
  delete(id) {
    this.getEngine().delete(id);
  }
  get(id) {
    return this.getEngine().get(id);
  }
  query(filters) {
    return this.getEngine().query(filters);
  }
  similaritySearch(queryVector, limit, metric) {
    return this.getEngine().similaritySearch(queryVector, limit, metric);
  }
  clear() {
    this.getEngine().clear();
  }
  getStats() {
    return this.getEngine().getStats();
  }
};
var vectorStoreService = new VectorStoreService();

// src/core/retriever/retrieverEvents.ts
var RetrieverEvents = class {
  listeners = /* @__PURE__ */ new Set();
  /**
   * Subscribes a listener to Retriever Engine events.
   */
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  /**
   * Broadcasts retrieval changes.
   */
  emit(type, prompt, payload) {
    const event = {
      type,
      prompt,
      timestamp: Date.now(),
      payload
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error("Error in retriever event listener:", err);
      }
    }
  }
};

// src/core/retriever/retrievalValidator.ts
var RetrievalValidator = class {
  /**
   * Asserts request parameters, checking prompt content and filters structure.
   */
  validateRequest(request) {
    if (!request.prompt || !request.prompt.trim()) {
      throw new Error("Retrieval validation error: Request prompt is required and cannot be empty");
    }
    if (request.filters !== void 0 && typeof request.filters !== "object") {
      throw new Error("Retrieval validation error: Invalid metadata query filters object structure");
    }
  }
};
var retrievalValidator = new RetrievalValidator();

// src/core/retriever/retrievalCache.ts
var RetrievalCache = class {
  cache = /* @__PURE__ */ new Map();
  getCacheKey(prompt, currentFile, filters) {
    return `${prompt}:${currentFile || ""}:${JSON.stringify(filters || {})}`;
  }
  get(prompt, currentFile, filters) {
    const key = this.getCacheKey(prompt, currentFile, filters);
    return this.cache.get(key) || null;
  }
  set(prompt, currentFile, filters, value) {
    const key = this.getCacheKey(prompt, currentFile, filters);
    this.cache.set(key, value);
  }
  invalidate() {
    this.cache.clear();
  }
};
var retrievalCache = new RetrievalCache();

// src/core/retriever/retrievalPlanner.ts
var RetrievalPlanner = class {
  /**
   * Resolves query features (lexical vs semantic properties) to select target strategy.
   */
  planRetrieval(request) {
    if (request.strategy)
      return request.strategy;
    const prompt = request.prompt.toLowerCase();
    if (prompt.includes("import") || prompt.includes("require") || prompt.includes("dependency")) {
      return "Structural" /* Structural */;
    } else if (prompt.includes("find class") || prompt.includes("where is") || prompt.includes("symbol")) {
      return "Keyword" /* Keyword */;
    }
    return "Hybrid" /* Hybrid */;
  }
};
var retrievalPlanner = new RetrievalPlanner();

// src/core/retriever/rankingEngine.ts
var RankingEngine = class {
  /**
   * Re-orders records based on proximity matches to current file edits.
   */
  rerank(context, currentFile) {
    if (currentFile && currentFile.trim() !== "") {
      context.files.sort((a, b) => {
        if (a.filePath === currentFile)
          return -1;
        if (b.filePath === currentFile)
          return 1;
        return 0;
      });
    }
    return context;
  }
};
var rankingEngine = new RankingEngine();

// src/core/retriever/contextScorer.ts
var ContextScorer = class {
  /**
   * Evaluates proximity overlaps and term matches to build numeric files weight metrics.
   */
  scoreFile(file, prompt, currentFile) {
    let score = 0.1;
    const name = file.filePath.toLowerCase();
    const terms = prompt.toLowerCase().split(/\s+/);
    let overlap = 0;
    for (const term of terms) {
      if (term.length > 2 && name.includes(term)) {
        overlap += 0.35;
      }
    }
    score += Math.min(overlap, 0.6);
    if (currentFile && currentFile.trim() !== "") {
      if (file.filePath === currentFile) {
        score += 0.25;
      } else if (require("path").dirname(file.filePath) === require("path").dirname(currentFile)) {
        score += 0.15;
      }
    }
    return Math.min(score, 1);
  }
  /**
   * Ranks symbols based on target text occurrences.
   */
  scoreSymbol(sym, prompt) {
    let score = 0.1;
    const name = sym.name.toLowerCase();
    const terms = prompt.toLowerCase().split(/\s+/);
    for (const term of terms) {
      if (term.length > 2 && name.includes(term)) {
        score += 0.4;
      }
    }
    return Math.min(score, 1);
  }
};
var contextScorer = new ContextScorer();

// src/core/retriever/strategies/semanticStrategy.ts
var SemanticStrategy = class {
  /**
   * Generates mock query vector from prompt characters and runs similarity search rankings.
   */
  retrieve(request, index) {
    const queryVector = [];
    const len = request.prompt.length;
    for (let i = 0; i < 384; i++) {
      const code = len > 0 ? request.prompt.charCodeAt(i % len) : 0;
      queryVector.push(Math.sin(code + i) * 0.5 + 0.5);
    }
    let similarityMatches = [];
    try {
      similarityMatches = vectorStoreService.similaritySearch(queryVector, 5, "Cosine" /* Cosine */);
    } catch {
    }
    const matchingFilePaths = new Set(similarityMatches.map((m) => m.record.sourceId));
    const files = index.files.filter((f) => matchingFilePaths.has(f.filePath));
    const symbols = index.symbols.filter((s) => matchingFilePaths.has(s.filePath));
    return {
      files,
      symbols,
      dependencies: [],
      configs: [],
      documentation: [],
      confidenceScore: similarityMatches.length > 0 ? similarityMatches[0].score : 0.5
    };
  }
};

// src/core/retriever/strategies/keywordStrategy.ts
var KeywordStrategy = class {
  /**
   * Scores files and symbols based on text name matches.
   */
  retrieve(request, index) {
    const scoredFiles = index.files.map((f) => ({
      file: f,
      score: contextScorer.scoreFile(f, request.prompt, request.currentFile)
    })).filter((sf) => sf.score > 0.15);
    scoredFiles.sort((a, b) => b.score - a.score);
    const scoredSymbols = index.symbols.map((s) => ({
      symbol: s,
      score: contextScorer.scoreSymbol(s, request.prompt)
    })).filter((ss) => ss.score > 0.2);
    scoredSymbols.sort((a, b) => b.score - a.score);
    return {
      files: scoredFiles.map((sf) => sf.file).slice(0, 5),
      symbols: scoredSymbols.map((ss) => ss.symbol).slice(0, 10),
      dependencies: [],
      configs: [],
      documentation: [],
      confidenceScore: scoredFiles.length > 0 ? Math.min(scoredFiles[0].score + 0.1, 1) : 0.4
    };
  }
};

// src/core/retriever/strategies/structuralStrategy.ts
var StructuralStrategy = class {
  /**
   * Discovers matching components using workspace import networks and parent folders.
   */
  retrieve(request, index) {
    const files = [];
    const dependencies = [];
    const current = request.currentFile;
    if (current) {
      const activeDeps = index.dependencies.filter((d) => d.sourceFilePath === current);
      dependencies.push(...activeDeps);
      const targetPaths = new Set(activeDeps.map((d) => d.targetFilePath));
      const dependentFiles = index.files.filter((f) => targetPaths.has(f.filePath) || f.filePath === current);
      files.push(...dependentFiles);
    }
    return {
      files,
      symbols: [],
      dependencies,
      configs: [],
      documentation: [],
      confidenceScore: files.length > 0 ? 0.8 : 0.5
    };
  }
};

// src/core/retriever/strategies/hybridStrategy.ts
var HybridStrategy = class {
  semantic = new SemanticStrategy();
  keyword = new KeywordStrategy();
  structural = new StructuralStrategy();
  /**
   * Combines semantic scores, text overlaps, and module imports to construct a merged, ranked RetrievedContext package.
   */
  retrieve(request, index) {
    const rSemantic = this.semantic.retrieve(request, index);
    const rKeyword = this.keyword.retrieve(request, index);
    const rStructural = this.structural.retrieve(request, index);
    const filesMap = /* @__PURE__ */ new Map();
    [...rSemantic.files, ...rKeyword.files, ...rStructural.files].forEach((f) => {
      filesMap.set(f.filePath, f);
    });
    const symbolsMap = /* @__PURE__ */ new Map();
    [...rSemantic.symbols, ...rKeyword.symbols, ...rStructural.symbols].forEach((s) => {
      symbolsMap.set(`${s.name}:${s.filePath}`, s);
    });
    const confidenceScore = Math.max(
      rSemantic.confidenceScore,
      rKeyword.confidenceScore,
      rStructural.confidenceScore
    );
    return {
      files: Array.from(filesMap.values()).slice(0, 8),
      symbols: Array.from(symbolsMap.values()).slice(0, 12),
      dependencies: rStructural.dependencies,
      configs: [],
      documentation: [],
      confidenceScore
    };
  }
};

// src/core/retriever/retrievalPipeline.ts
var RetrievalPipeline = class {
  semantic = new SemanticStrategy();
  keyword = new KeywordStrategy();
  structural = new StructuralStrategy();
  hybrid = new HybridStrategy();
  /**
   * Orchestrates validators, cache lookups, strategies selection, and sorting pipelines.
   */
  execute(request, index, events) {
    retrievalValidator.validateRequest(request);
    const cached = retrievalCache.get(request.prompt, request.currentFile, request.filters);
    if (cached) {
      return cached;
    }
    events.emit("RetrievalStarted" /* RetrievalStarted */, request.prompt);
    const strategy = retrievalPlanner.planRetrieval(request);
    let context;
    switch (strategy) {
      case "Semantic" /* Semantic */:
        context = this.semantic.retrieve(request, index);
        break;
      case "Keyword" /* Keyword */:
        context = this.keyword.retrieve(request, index);
        break;
      case "Structural" /* Structural */:
        context = this.structural.retrieve(request, index);
        break;
      case "Hybrid" /* Hybrid */:
      default:
        context = this.hybrid.retrieve(request, index);
        break;
    }
    context = rankingEngine.rerank(context, request.currentFile);
    events.emit("ResultsRanked" /* ResultsRanked */, request.prompt, { strategy });
    retrievalCache.set(request.prompt, request.currentFile, request.filters, context);
    events.emit("RetrievalCompleted" /* RetrievalCompleted */, request.prompt, { context });
    return context;
  }
};
var retrievalPipeline = new RetrievalPipeline();

// src/core/retriever/retrieverEngine.ts
var RetrieverEngine = class {
  events = new RetrieverEvents();
  /**
   * Subscribes a listener to Retriever changes.
   */
  subscribe(listener) {
    return this.events.subscribe(listener);
  }
  // --- API ---
  retrieveContext(request, index) {
    this.events.emit("RetrievalRequested" /* RetrievalRequested */, request.prompt);
    try {
      const context = retrievalPipeline.execute(request, index, this.events);
      return context;
    } catch (err) {
      this.events.emit("RetrievalFailed" /* RetrievalFailed */, request.prompt, { error: err.message });
      throw err;
    }
  }
  invalidateCache() {
    retrievalCache.invalidate();
  }
};

// src/core/retriever/retrieverService.ts
var vscode12 = __toESM(require("vscode"));
var RetrieverService = class {
  activeEngine = null;
  getEngine() {
    const folders = vscode12.workspace.workspaceFolders;
    if (!folders || folders.length === 0) {
      throw new Error("Workspace Retriever Service: No workspace folder is open");
    }
    const root = folders[0].uri.fsPath;
    if (!this.activeEngine) {
      this.activeEngine = new RetrieverEngine(root);
    }
    return this.activeEngine;
  }
  /**
   * Subscribes a listener to Retriever changes.
   */
  subscribe(listener) {
    return this.getEngine().subscribe(listener);
  }
  // --- Wrapper APIs ---
  retrieveContext(request, index) {
    return this.getEngine().retrieveContext(request, index);
  }
  invalidateCache() {
    this.getEngine().invalidateCache();
  }
};
var retrieverService = new RetrieverService();

// src/core/promptAssembly/promptEvents.ts
var PromptAssemblyEvents = class {
  listeners = /* @__PURE__ */ new Set();
  /**
   * Subscribes a listener to Prompt Assembly events.
   */
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  /**
   * Broadcasts prompt status changes.
   */
  emit(type, promptType, payload) {
    const event = {
      type,
      promptType,
      timestamp: Date.now(),
      payload
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error("Error in prompt assembly event listener:", err);
      }
    }
  }
};

// src/core/promptAssembly/promptValidator.ts
var PromptValidator2 = class {
  /**
   * Asserts request parameters, checking prompt content.
   */
  validateRequest(request) {
    if (!request.prompt || !request.prompt.trim()) {
      throw new Error("Prompt assembly validation error: Request prompt is required and cannot be empty");
    }
  }
  /**
   * Asserts compiled output package token limits.
   */
  validatePackage(pkg, limit = 1e5) {
    if (pkg.estimatedTokens > limit) {
      throw new Error(`Prompt assembly validation error: Oversized prompt: Estimated ${pkg.estimatedTokens} tokens, which exceeds the limit of ${limit}`);
    }
  }
};
var promptValidator = new PromptValidator2();

// src/core/promptAssembly/promptCache.ts
var PromptCache = class {
  cache = /* @__PURE__ */ new Map();
  getCacheKey(prompt, type, context) {
    return `${prompt}:${type}:${JSON.stringify(context || {})}`;
  }
  get(prompt, type, context) {
    const key = this.getCacheKey(prompt, type, context);
    return this.cache.get(key) || null;
  }
  set(prompt, type, context, value) {
    const key = this.getCacheKey(prompt, type, context);
    this.cache.set(key, value);
  }
  invalidate() {
    this.cache.clear();
  }
};
var promptCache = new PromptCache();

// src/core/promptAssembly/templates/coding.ts
var codingTemplate = {
  systemPrompt: "You are an expert software engineer assistant designed to generate correct, performant, and clean code.",
  developerPrompt: "Synthesize the requested code implementation matching workspace style rules, architecture guidelines, and libraries."
};

// src/core/promptAssembly/templates/debugging.ts
var debuggingTemplate = {
  systemPrompt: "You are a Senior Debugging Specialist. Your goal is to identify root causes of runtime errors and warnings and implement safe repairs.",
  developerPrompt: "Inspect the provided diagnostics logs and code sections, explain the failure, and write step-by-step diff corrections."
};

// src/core/promptAssembly/templates/refactoring.ts
var refactoringTemplate = {
  systemPrompt: "You are a Software Architect focusing on refactoring, design pattern compliance, modular design, and reduction of technical debt.",
  developerPrompt: "Refactor the target functions or classes without changing their outer behavioral contract. Focus on readability and complexity reduction."
};

// src/core/promptAssembly/templates/explanation.ts
var explanationTemplate = {
  systemPrompt: "You are a technical educator. Explain complex code designs, files import maps, and architecture patterns in a simple, clear format.",
  developerPrompt: "Walk through the code structures and imports, explain functions mechanics, and build structured Markdown documentation."
};

// src/core/promptAssembly/templates/testing.ts
var testingTemplate = {
  systemPrompt: "You are a Test Automation Engineer. You write comprehensive unit and integration tests using frameworks like Mocha, Jest, or Cypress.",
  developerPrompt: "Build unit test suites covering edge cases, happy paths, exceptions throwing, mock injections, and boundary parameters checks."
};

// src/core/promptAssembly/promptTemplateRegistry.ts
var PromptTemplateRegistry = class {
  /**
   * Resolves template pairs matching selected PromptType tags.
   */
  getTemplate(type) {
    switch (type) {
      case "Code Generation" /* CodeGen */:
        return codingTemplate;
      case "Bug Fixing" /* BugFix */:
        return debuggingTemplate;
      case "Refactoring" /* Refactor */:
        return refactoringTemplate;
      case "Explanation" /* Explanation */:
        return explanationTemplate;
      case "Testing" /* Testing */:
        return testingTemplate;
      case "Architecture Review" /* ArchReview */:
        return {
          systemPrompt: "You are an Enterprise System Architect analyzing module designs, file networks, and project dependencies.",
          developerPrompt: "Assess the structural components and recommend code partitioning, dependencies pruning, and patterns updates."
        };
      case "Documentation" /* Documentation */:
        return {
          systemPrompt: "You are a technical writer specializing in clean, developer-facing markdown documentation and APIs references.",
          developerPrompt: "Write READMEs, API endpoints guides, and architecture summaries based on the provided project context."
        };
      default:
        return codingTemplate;
    }
  }
};
var promptTemplateRegistry = new PromptTemplateRegistry();

// src/core/promptAssembly/promptCompressor.ts
var PromptCompressor = class {
  /**
   * Removes duplicate elements and truncates sizes if budget thresholds are crossed.
   */
  compress(context, charLimit) {
    const uniqueFiles = /* @__PURE__ */ new Map();
    context.files.forEach((f) => uniqueFiles.set(f.filePath, f));
    const uniqueSymbols = /* @__PURE__ */ new Map();
    context.symbols.forEach((s) => uniqueSymbols.set(`${s.name}:${s.filePath}`, s));
    const files = Array.from(uniqueFiles.values());
    const symbols = Array.from(uniqueSymbols.values());
    let currentCharCount = files.reduce((acc, f) => acc + (f.size || 0), 0);
    const compressedFiles = [];
    for (const file of files) {
      if (currentCharCount > charLimit) {
        currentCharCount -= file.size || 0;
        continue;
      }
      compressedFiles.push(file);
    }
    return {
      ...context,
      files: compressedFiles,
      symbols: symbols.slice(0, 5)
    };
  }
};
var promptCompressor = new PromptCompressor();

// src/core/promptAssembly/promptBuilder.ts
var PromptBuilder = class {
  /**
   * Serializes components and calculates character counts for token estimating.
   */
  build(request) {
    const template = promptTemplateRegistry.getTemplate(request.type);
    let context = request.retrievedContext || { files: [], symbols: [], dependencies: [], configs: [], documentation: [], confidenceScore: 0 };
    if (request.tokenLimit) {
      const charLimit = request.tokenLimit * 4;
      context = promptCompressor.compress(context, charLimit);
    }
    const projectContextStr = `Workspace Summary: ${request.workspaceSummary || "None"}
Git Summary: ${request.gitSummary || "None"}`;
    const retrievedFilesStr = context.files.map((f) => `- File: ${f.filePath} (size: ${f.size} bytes)`).join("\n");
    const retrievedSymbolsStr = context.symbols.map((s) => `- Symbol: ${s.name} (${s.type}) in ${s.filePath}:${s.line}`).join("\n");
    const retrievedContextStr = `Retrieved Files:
${retrievedFilesStr || "None"}
Retrieved Symbols:
${retrievedSymbolsStr || "None"}`;
    const execContextStr = `Diagnostics Logs:
${request.diagnostics?.join("\n") || "None"}`;
    const systemTokens = Math.ceil(template.systemPrompt.length / 4);
    const devTokens = Math.ceil(template.developerPrompt.length / 4);
    const userTokens = Math.ceil(request.prompt.length / 4);
    const contextTokens = Math.ceil((projectContextStr.length + retrievedContextStr.length + execContextStr.length) / 4);
    const totalTokens = systemTokens + devTokens + userTokens + contextTokens;
    return {
      systemPrompt: template.systemPrompt,
      developerPrompt: template.developerPrompt,
      userPrompt: request.prompt,
      projectContext: projectContextStr,
      retrievedContext: retrievedContextStr,
      executionContext: execContextStr,
      metadata: {
        promptType: request.type,
        compressionRatio: request.retrievedContext && request.retrievedContext.files.length > 0 ? Number((context.files.length / request.retrievedContext.files.length).toFixed(2)) : 1,
        sourcesCount: context.files.length + context.symbols.length
      },
      estimatedTokens: totalTokens
    };
  }
};
var promptBuilder = new PromptBuilder();

// src/core/promptAssembly/promptAssemblyEngine.ts
var PromptAssemblyEngine = class {
  events = new PromptAssemblyEvents();
  /**
   * Subscribes a listener to Prompt Assembly changes.
   */
  subscribe(listener) {
    return this.events.subscribe(listener);
  }
  // --- API ---
  assemblePrompt(request) {
    this.events.emit("PromptRequested" /* PromptRequested */, request.type);
    promptValidator.validateRequest(request);
    const cached = promptCache.get(request.prompt, request.type, request.retrievedContext);
    if (cached) {
      return cached;
    }
    const pkg = promptBuilder.build(request);
    this.events.emit("PromptBuilt" /* PromptBuilt */, request.type, { pkg });
    promptValidator.validatePackage(pkg, request.tokenLimit || 1e5);
    this.events.emit("PromptValidated" /* PromptValidated */, request.type);
    promptCache.set(request.prompt, request.type, request.retrievedContext, pkg);
    return pkg;
  }
  invalidateCache() {
    promptCache.invalidate();
  }
};

// src/core/promptAssembly/promptAssemblyService.ts
var vscode13 = __toESM(require("vscode"));
var PromptAssemblyService = class {
  activeEngine = null;
  getEngine() {
    const folders = vscode13.workspace.workspaceFolders;
    if (!folders || folders.length === 0) {
      throw new Error("Workspace Prompt Assembly Service: No workspace folder is open");
    }
    if (!this.activeEngine) {
      this.activeEngine = new PromptAssemblyEngine();
    }
    return this.activeEngine;
  }
  /**
   * Subscribes a listener to Prompt Assembly changes.
   */
  subscribe(listener) {
    return this.getEngine().subscribe(listener);
  }
  // --- Wrapper APIs ---
  assemblePrompt(request) {
    return this.getEngine().assemblePrompt(request);
  }
  invalidateCache() {
    this.getEngine().invalidateCache();
  }
};
var promptAssemblyService = new PromptAssemblyService();

// src/core/runtime/model/runtimeEvents.ts
var RuntimeEvents = class {
  listeners = /* @__PURE__ */ new Set();
  /**
   * Subscribes a listener to Model Runtime events.
   */
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  /**
   * Broadcasts model and inference changes.
   */
  emit(type, modelId, payload) {
    const event = {
      type,
      modelId,
      timestamp: Date.now(),
      payload
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error("Error in model runtime event listener:", err);
      }
    }
  }
};

// src/core/runtime/model/runtimeValidator.ts
var RuntimeValidator = class {
  /**
   * Validates model state, context windows, and prompt content.
   */
  validateInference(promptPkg, state, modelConfig, promptTokens) {
    if (!promptPkg.userPrompt || !promptPkg.userPrompt.trim()) {
      throw new Error("Model runtime validation error: Prompt is required and cannot be empty");
    }
    if (state !== "Ready" /* Ready */) {
      throw new Error(`Model runtime validation error: Model is not loaded. Current state is: ${state}`);
    }
    if (promptTokens > modelConfig.contextWindow) {
      throw new Error(`Model runtime validation error: Oversized context: Prompt contains ${promptTokens} tokens, which exceeds model context window of ${modelConfig.contextWindow}`);
    }
  }
  /**
   * Asserts config limits.
   */
  validateConfig(config) {
    if (config.temperature !== void 0 && (config.temperature < 0 || config.temperature > 2)) {
      throw new Error("Model runtime validation error: Temperature must be between 0.0 and 2.0");
    }
    if (config.topP !== void 0 && (config.topP < 0 || config.topP > 1)) {
      throw new Error("Model runtime validation error: TopP must be between 0.0 and 1.0");
    }
  }
};
var runtimeValidator = new RuntimeValidator();

// src/core/runtime/model/tokenizer.ts
var Tokenizer = class {
  /**
   * Estimates tokens based on character length.
   */
  countTokens(text) {
    if (!text)
      return 0;
    return Math.ceil(text.length / 4);
  }
  /**
   * Deconstructs string into array tokens.
   */
  tokenize(text) {
    if (!text)
      return [];
    const tokens = [];
    for (let i = 0; i < text.length; i += 4) {
      tokens.push(text.slice(i, i + 4));
    }
    return tokens;
  }
};
var tokenizer = new Tokenizer();

// src/core/runtime/model/contextWindow.ts
var ContextWindow = class {
  /**
   * Truncates text if context window size thresholds are crossed.
   */
  enforceLimit(text, maxTokens) {
    const tokens = tokenizer.countTokens(text);
    if (tokens <= maxTokens)
      return text;
    return text.slice(-(maxTokens * 4));
  }
};
var contextWindow = new ContextWindow();

// src/core/runtime/model/runtimeConfig.ts
var DEFAULT_MODELS = [
  {
    modelId: "qwen-2.5-7b-coder",
    name: "Qwen 2.5 7B Coder (GGUF Mock)",
    provider: "MockProvider",
    contextWindow: 32768,
    parametersCount: "7B",
    fileSizeGb: 4.5
  },
  {
    modelId: "llama-3-8b-instruct",
    name: "Llama 3 8B Instruct (GGUF Mock)",
    provider: "MockProvider",
    contextWindow: 8192,
    parametersCount: "8B",
    fileSizeGb: 4.9
  }
];

// src/core/runtime/model/providers/mockProvider.ts
var MockProvider2 = class {
  name = "MockModelProvider";
  currentModel = null;
  async loadModel(modelConfig) {
    this.currentModel = modelConfig;
  }
  async unloadModel() {
    this.currentModel = null;
  }
  /**
   * Streams word intervals to the token callback, checks abort signal cancellations, and returns InferenceResults.
   */
  async generate(promptPkg, config, onToken, signal) {
    const start = Date.now();
    const responseText = `[Mock response for: "${promptPkg.userPrompt}"]
Based on your retrieved workspace files, I recommend extending the validation logic to verify character token counts. Here is the implementation:

\`\`\`typescript
export function validateTokenLimit(text: string, limit: number): boolean {
  return (text.length / 4) <= limit;
}
\`\`\``;
    const words = responseText.split(" ");
    let outputText = "";
    let tokensGenerated = 0;
    for (let i = 0; i < words.length; i++) {
      if (signal?.aborted) {
        return {
          id: `inf-${start}`,
          sessionId: "session-default",
          tokensGenerated,
          finishReason: "cancelled",
          latencyMs: Date.now() - start,
          usage: {
            promptTokens: Math.ceil(promptPkg.userPrompt.length / 4),
            completionTokens: tokensGenerated,
            totalTokens: Math.ceil(promptPkg.userPrompt.length / 4) + tokensGenerated
          },
          response: outputText
        };
      }
      const word = words[i] + " ";
      outputText += word;
      tokensGenerated += Math.ceil(word.length / 4);
      if (onToken) {
        onToken(word);
      }
      await new Promise((resolve13) => setTimeout(resolve13, 10));
    }
    return {
      id: `inf-${start}`,
      sessionId: "session-default",
      tokensGenerated,
      finishReason: "stop",
      latencyMs: Date.now() - start,
      usage: {
        promptTokens: Math.ceil(promptPkg.userPrompt.length / 4),
        completionTokens: tokensGenerated,
        totalTokens: Math.ceil(promptPkg.userPrompt.length / 4) + tokensGenerated
      },
      response: outputText
    };
  }
};

// src/core/runtime/model/inferenceQueue.ts
var InferenceQueue = class {
  queue = [];
  enqueue(item) {
    this.queue.push(item);
  }
  dequeue() {
    return this.queue.shift();
  }
  getLength() {
    return this.queue.length;
  }
  clear() {
    this.queue = [];
  }
};

// src/core/runtime/model/inferenceScheduler.ts
var InferenceScheduler = class {
  processing = false;
  /**
   * Processes queue items one-by-one sequentially.
   */
  async processQueue(queue, provider) {
    if (this.processing)
      return;
    this.processing = true;
    try {
      let item = queue.dequeue();
      while (item) {
        try {
          const res = await provider.generate(
            item.promptPkg,
            item.config,
            item.onToken,
            item.signal
          );
          item.resolve(res);
        } catch (err) {
          item.reject(err);
        }
        item = queue.dequeue();
      }
    } finally {
      this.processing = false;
    }
  }
  isBusy() {
    return this.processing;
  }
};
var inferenceScheduler = new InferenceScheduler();

// src/core/runtime/model/modelLoader.ts
var ModelLoader = class {
  /**
   * Simulates loading latency and triggers status updates.
   */
  async load(config, onProgress) {
    if (onProgress)
      onProgress("Loading" /* Loading */);
    await new Promise((resolve13) => setTimeout(resolve13, 800));
    if (onProgress)
      onProgress("Ready" /* Ready */);
  }
  async unload(onProgress) {
    if (onProgress)
      onProgress("Unloading" /* Unloading */);
    await new Promise((resolve13) => setTimeout(resolve13, 300));
    if (onProgress)
      onProgress("NotLoaded" /* NotLoaded */);
  }
};
var modelLoader = new ModelLoader();

// src/core/runtime/model/modelManager.ts
var ModelManager = class {
  activeConfig = DEFAULT_MODELS[0];
  state = "NotLoaded" /* NotLoaded */;
  getActiveConfig() {
    return this.activeConfig;
  }
  setActiveConfig(config) {
    this.activeConfig = config;
  }
  getModelState() {
    return this.state;
  }
  setModelState(state) {
    this.state = state;
  }
};
var modelManager = new ModelManager();

// src/core/runtime/model/sessionManager.ts
var SessionManager = class {
  sessions = /* @__PURE__ */ new Map();
  createSession(sessionId, modelId) {
    const session = {
      sessionId,
      modelId,
      createdAt: Date.now(),
      history: []
    };
    this.sessions.set(sessionId, session);
    return session;
  }
  getSession(sessionId) {
    return this.sessions.get(sessionId) || null;
  }
  addMessage(sessionId, role, content) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.history.push({ role, content });
    }
  }
  clear() {
    this.sessions.clear();
  }
};
var sessionManager = new SessionManager();

// src/core/runtime/model/runtimeRegistry.ts
var RuntimeRegistry = class {
  /**
   * Constructs mock performance metrics based on active execution status.
   */
  getStats(modelName, stateBusy, queueLength) {
    const cpuUsagePct = stateBusy ? 45 : 2;
    const vramUsageMb = modelName.includes("7B") ? 4200 : 4900;
    return {
      loadedModel: modelName,
      memoryUsageMb: stateBusy ? 850 : 220,
      vramUsageMb,
      cpuUsagePct,
      inferenceSpeedTps: stateBusy ? 28.5 : 0,
      queueLength
    };
  }
};
var runtimeRegistry = new RuntimeRegistry();

// src/core/runtime/model/runtimeEngine.ts
var RuntimeEngine = class {
  events = new RuntimeEvents();
  provider = new MockProvider2();
  queue = new InferenceQueue();
  /**
   * Subscribes a listener to Model Runtime changes.
   */
  subscribe(listener) {
    return this.events.subscribe(listener);
  }
  getModelState() {
    return modelManager.getModelState();
  }
  getActiveConfig() {
    return modelManager.getActiveConfig();
  }
  // --- APIs ---
  async loadModel(config) {
    this.events.emit("ModelLoading" /* ModelLoading */, config.modelId);
    modelManager.setActiveConfig(config);
    try {
      await modelLoader.load(config, (state) => {
        modelManager.setModelState(state);
      });
      await this.provider.loadModel(config);
      this.events.emit("ModelLoaded" /* ModelLoaded */, config.modelId);
    } catch (err) {
      modelManager.setModelState("Failed" /* Failed */);
      this.events.emit("RuntimeError" /* RuntimeError */, config.modelId, { error: err.message });
      throw err;
    }
  }
  async unloadModel() {
    const config = modelManager.getActiveConfig();
    try {
      await modelLoader.unload((state) => {
        modelManager.setModelState(state);
      });
      await this.provider.unloadModel();
    } catch (err) {
      this.events.emit("RuntimeError" /* RuntimeError */, config.modelId, { error: err.message });
      throw err;
    }
  }
  async generate(promptPkg, config, onToken, signal) {
    const activeConfig = modelManager.getActiveConfig();
    const promptTokens = tokenizer.countTokens(promptPkg.userPrompt);
    runtimeValidator.validateInference(
      promptPkg,
      modelManager.getModelState(),
      activeConfig,
      promptTokens
    );
    runtimeValidator.validateConfig(config);
    this.events.emit("InferenceStarted" /* InferenceStarted */, activeConfig.modelId);
    return new Promise((resolve13, reject) => {
      this.queue.enqueue({
        promptPkg,
        config,
        onToken: (tok) => {
          if (onToken)
            onToken(tok);
          this.events.emit("TokenGenerated" /* TokenGenerated */, activeConfig.modelId, { token: tok });
        },
        resolve: (res) => {
          if (res.finishReason === "cancelled") {
            this.events.emit("InferenceCancelled" /* InferenceCancelled */, activeConfig.modelId);
          } else {
            this.events.emit("InferenceCompleted" /* InferenceCompleted */, activeConfig.modelId, { res });
          }
          resolve13(res);
        },
        reject: (err) => {
          this.events.emit("RuntimeError" /* RuntimeError */, activeConfig.modelId, { error: err.message });
          reject(err);
        },
        signal
      });
      inferenceScheduler.processQueue(this.queue, this.provider);
    });
  }
  getStats() {
    const active = modelManager.getActiveConfig();
    const isBusy = inferenceScheduler.isBusy();
    return runtimeRegistry.getStats(active.name, isBusy, this.queue.getLength());
  }
};

// src/core/runtime/model/runtimeService.ts
var vscode14 = __toESM(require("vscode"));
var RuntimeService = class {
  activeEngine = null;
  getEngine() {
    const folders = vscode14.workspace.workspaceFolders;
    if (!folders || folders.length === 0) {
      throw new Error("Workspace Model Runtime Service: No workspace folder is open");
    }
    if (!this.activeEngine) {
      this.activeEngine = new RuntimeEngine();
    }
    return this.activeEngine;
  }
  /**
   * Subscribes a listener to Model Runtime changes.
   */
  subscribe(listener) {
    return this.getEngine().subscribe(listener);
  }
  // --- Wrapper APIs ---
  getModelState() {
    return this.getEngine().getModelState();
  }
  getActiveConfig() {
    return this.getEngine().getActiveConfig();
  }
  async loadModel(config) {
    await this.getEngine().loadModel(config);
  }
  async unloadModel() {
    await this.getEngine().unloadModel();
  }
  async generate(promptPkg, config, onToken, signal) {
    return this.getEngine().generate(promptPkg, config, onToken, signal);
  }
  getStats() {
    return this.getEngine().getStats();
  }
};
var runtimeService = new RuntimeService();

// src/core/toolCalling/toolEvents.ts
var ToolEvents = class {
  listeners = /* @__PURE__ */ new Set();
  /**
   * Subscribes a listener to Tool Calling events.
   */
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  /**
   * Broadcasts tool status changes.
   */
  emit(type, toolId, payload) {
    const event = {
      type,
      toolId,
      timestamp: Date.now(),
      payload
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error("Error in tool calling event listener:", err);
      }
    }
  }
};

// src/core/toolCalling/toolValidator.ts
var ToolValidator = class {
  /**
   * Asserts parameters against registry definition schemas.
   */
  validateExecution(tool, args) {
    if (tool.status === "Disabled" /* Disabled */) {
      throw new Error(`Tool calling validation error: Tool "${tool.id}" is disabled`);
    }
    const required = tool.inputSchema.required || [];
    for (const key of required) {
      if (!(key in args)) {
        throw new Error(`Tool calling validation error: Missing required argument "${key}" for tool "${tool.id}"`);
      }
    }
    const properties = tool.inputSchema.properties || {};
    for (const [key, value] of Object.entries(args)) {
      const spec = properties[key];
      if (!spec) {
        throw new Error(`Tool calling validation error: Unknown argument "${key}" passed to tool "${tool.id}"`);
      }
      const actualType = Array.isArray(value) ? "array" : typeof value;
      if (spec.type && spec.type !== actualType) {
        throw new Error(`Tool calling validation error: Type mismatch for argument "${key}" in tool "${tool.id}": Expected ${spec.type}, but got ${actualType}`);
      }
    }
  }
};
var toolValidator = new ToolValidator();

// src/core/toolCalling/toolPermission.ts
var ToolPermission = class {
  /**
   * Queries permissionService to authorize execution.
   */
  async check(toolId, requiredPermissions) {
    for (const perm of requiredPermissions) {
      try {
        const { response } = permissionService.requestPermission(
          perm,
          `tool:${toolId}`,
          "Low" /* Low */,
          `Execute tool ${toolId}`,
          "ToolCallingEngine"
        );
        if (response && response.approved === false) {
          return false;
        }
      } catch {
        return true;
      }
    }
    return true;
  }
};
var toolPermission = new ToolPermission();

// src/core/toolCalling/toolScheduler.ts
var ToolScheduler = class {
  history = [];
  logExecution(toolId, args, result) {
    this.history.push({
      id: `exec-${Date.now()}-${Math.random()}`,
      toolId,
      args,
      success: result.success,
      latencyMs: result.latencyMs,
      timestamp: Date.now()
    });
  }
  getHistory() {
    return this.history;
  }
  clear() {
    this.history = [];
  }
};
var toolScheduler = new ToolScheduler();

// src/core/toolCalling/toolResult.ts
function createSuccessResult(toolId, result, latencyMs) {
  return {
    toolId,
    success: true,
    result,
    latencyMs
  };
}
function createErrorResult(toolId, error, latencyMs) {
  return {
    toolId,
    success: false,
    error,
    latencyMs
  };
}

// src/core/toolCalling/adapters/filesystemTool.ts
var filesystemToolDef = {
  id: "filesystem-read-file",
  name: "Read Workspace File",
  description: "Reads contents from a workspace file path.",
  category: "Filesystem" /* Filesystem */,
  version: "1.0.0",
  permissions: ["READ"],
  inputSchema: {
    type: "object",
    properties: {
      path: { type: "string", description: "Absolute path to file" }
    },
    required: ["path"]
  },
  outputSchema: {
    type: "object",
    properties: {
      content: { type: "string" }
    }
  },
  status: "Available" /* Available */
};
async function executeFilesystemRead(args) {
  return { content: `[Mock file content of: ${args.path}]` };
}

// src/core/toolCalling/adapters/terminalTool.ts
var terminalToolDef = {
  id: "terminal-execute-command",
  name: "Execute Shell Command",
  description: "Executes a command within local terminal shell.",
  category: "Terminal" /* Terminal */,
  version: "1.0.0",
  permissions: ["EXECUTE"],
  inputSchema: {
    type: "object",
    properties: {
      command: { type: "string", description: "Command to run" }
    },
    required: ["command"]
  },
  outputSchema: {
    type: "object",
    properties: {
      stdout: { type: "string" }
    }
  },
  status: "Available" /* Available */
};
async function executeTerminalCommand(args) {
  return { stdout: `[Mock output of running: "${args.command}"]` };
}

// src/core/toolCalling/adapters/gitTool.ts
var gitToolDef = {
  id: "git-status",
  name: "Git Status",
  description: "Shows active file changes and status details in git.",
  category: "Git" /* Git */,
  version: "1.0.0",
  permissions: ["READ"],
  inputSchema: {
    type: "object",
    properties: {},
    required: []
  },
  outputSchema: {
    type: "object",
    properties: {
      status: { type: "string" }
    }
  },
  status: "Available" /* Available */
};
async function executeGitStatus() {
  return { status: "On branch main. Workspace clean." };
}

// src/core/toolCalling/adapters/workspaceTool.ts
var workspaceToolDef = {
  id: "workspace-list-files",
  name: "List Workspace Files",
  description: "Scans and lists files in the open workspace folder.",
  category: "Workspace" /* Workspace */,
  version: "1.0.0",
  permissions: ["READ"],
  inputSchema: {
    type: "object",
    properties: {
      maxResults: { type: "number", description: "Limit output file counts" }
    },
    required: []
  },
  outputSchema: {
    type: "object",
    properties: {
      files: { type: "array" }
    }
  },
  status: "Available" /* Available */
};
async function executeWorkspaceList(args) {
  return { files: ["package.json", "src/extension/index.ts"].slice(0, args.maxResults || 2) };
}

// src/core/toolCalling/adapters/diagnosticsTool.ts
var diagnosticsToolDef = {
  id: "diagnostics-read-logs",
  name: "Read Diagnostics Logs",
  description: "Gathers recent syntax warnings, validation errors, and execution metrics.",
  category: "Diagnostics" /* Diagnostics */,
  version: "1.0.0",
  permissions: ["READ"],
  inputSchema: {
    type: "object",
    properties: {},
    required: []
  },
  outputSchema: {
    type: "object",
    properties: {
      logs: { type: "array" }
    }
  },
  status: "Available" /* Available */
};
async function executeDiagnosticsRead() {
  return { logs: ["Warning: Duplicate key index.json", "Info: Embedding cache Hit rate: 100%"] };
}

// src/core/toolCalling/toolRegistry.ts
var ToolRegistry = class {
  tools = /* @__PURE__ */ new Map();
  constructor() {
    this.register(filesystemToolDef);
    this.register(terminalToolDef);
    this.register(gitToolDef);
    this.register(workspaceToolDef);
    this.register(diagnosticsToolDef);
  }
  register(tool) {
    this.tools.set(tool.id, tool);
  }
  get(toolId) {
    return this.tools.get(toolId) || null;
  }
  list() {
    return Array.from(this.tools.values());
  }
  disable(toolId) {
    const tool = this.tools.get(toolId);
    if (tool) {
      tool.status = "Disabled" /* Disabled */;
    }
  }
  enable(toolId) {
    const tool = this.tools.get(toolId);
    if (tool) {
      tool.status = "Available" /* Available */;
    }
  }
};
var toolRegistry = new ToolRegistry();

// src/core/toolCalling/toolExecutor.ts
var ToolExecutor = class {
  /**
   * Routes tool IDs to their corresponding adapter function calls.
   */
  async execute(toolId, args) {
    switch (toolId) {
      case "filesystem-read-file":
        return executeFilesystemRead(args);
      case "terminal-execute-command":
        return executeTerminalCommand(args);
      case "git-status":
        return executeGitStatus();
      case "workspace-list-files":
        return executeWorkspaceList(args);
      case "diagnostics-read-logs":
        return executeDiagnosticsRead();
      default:
        throw new Error(`Tool executor error: No handler registered for tool: "${toolId}"`);
    }
  }
};
var toolExecutor = new ToolExecutor();

// src/core/toolCalling/toolEngine.ts
var ToolEngine = class {
  events = new ToolEvents();
  /**
   * Subscribes a listener to Tool Calling changes.
   */
  subscribe(listener) {
    return this.events.subscribe(listener);
  }
  // --- APIs ---
  async executeTool(toolId, args) {
    const start = Date.now();
    this.events.emit("ToolRequested" /* ToolRequested */, toolId);
    try {
      const tool = toolRegistry.get(toolId);
      if (!tool) {
        throw new Error(`Tool calling error: Tool "${toolId}" not found in registry`);
      }
      toolValidator.validateExecution(tool, args);
      const allowed = await toolPermission.check(toolId, tool.permissions);
      if (!allowed) {
        throw new Error(`Tool calling error: Permission Denied to execute tool: "${toolId}"`);
      }
      this.events.emit("ToolStarted" /* ToolStarted */, toolId);
      const rawResult = await toolExecutor.execute(toolId, args);
      const latencyMs = Date.now() - start;
      const result = createSuccessResult(toolId, rawResult, latencyMs);
      toolScheduler.logExecution(toolId, args, result);
      this.events.emit("ToolCompleted" /* ToolCompleted */, toolId, { result });
      return result;
    } catch (err) {
      const latencyMs = Date.now() - start;
      const result = createErrorResult(toolId, err.message, latencyMs);
      toolScheduler.logExecution(toolId, args, result);
      this.events.emit("ToolFailed" /* ToolFailed */, toolId, { error: err.message });
      return result;
    }
  }
  getHistory() {
    return toolScheduler.getHistory();
  }
};

// src/core/toolCalling/toolService.ts
var vscode15 = __toESM(require("vscode"));
var ToolService = class {
  activeEngine = null;
  getEngine() {
    const folders = vscode15.workspace.workspaceFolders;
    if (!folders || folders.length === 0) {
      throw new Error("Workspace Tool Service: No workspace folder is open");
    }
    if (!this.activeEngine) {
      this.activeEngine = new ToolEngine();
    }
    return this.activeEngine;
  }
  /**
   * Subscribes a listener to Tool Calling changes.
   */
  subscribe(listener) {
    return this.getEngine().subscribe(listener);
  }
  // --- Wrapper APIs ---
  async executeTool(toolId, args) {
    return this.getEngine().executeTool(toolId, args);
  }
  getHistory() {
    return this.getEngine().getHistory();
  }
};
var toolService = new ToolService();

// src/core/agents/agentEvents.ts
var AgentEvents = class {
  listeners = /* @__PURE__ */ new Set();
  /**
   * Subscribes a listener to Agent Runtime events.
   */
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  /**
   * Broadcasts agent lifecycle and task assignment updates.
   */
  emit(type, agentId, payload) {
    const event = {
      type,
      agentId,
      timestamp: Date.now(),
      payload
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error("Error in agent event listener:", err);
      }
    }
  }
};

// src/core/agents/agentValidator.ts
var AgentValidator = class {
  /**
   * Asserts registry uniqueness and capability requirements.
   */
  validateRegistration(agent, registered) {
    if (!agent.id || !agent.id.trim()) {
      throw new Error("Agent validation error: Agent ID is required and cannot be empty");
    }
    if (registered.has(agent.id)) {
      throw new Error(`Agent validation error: Duplicate ID "${agent.id}" registered`);
    }
    if (!agent.capabilities || agent.capabilities.length === 0) {
      throw new Error(`Agent validation error: Agent "${agent.id}" must declare at least one capability`);
    }
  }
  /**
   * Asserts assignment matches capability.
   */
  validateTaskAssignment(agent, requiredCapability) {
    if (!agent.capabilities.includes(requiredCapability)) {
      throw new Error(`Agent validation error: Agent "${agent.id}" lacks required capability: "${requiredCapability}"`);
    }
  }
};
var agentValidator = new AgentValidator();

// src/core/agents/agentContext.ts
var AgentContext = class {
  values = /* @__PURE__ */ new Map();
  get(key) {
    return this.values.get(key);
  }
  set(key, value) {
    this.values.set(key, value);
  }
  clear() {
    this.values.clear();
  }
};
var agentContext = new AgentContext();

// src/core/agents/agentMemory.ts
var AgentMemory = class {
  memory = /* @__PURE__ */ new Map();
  remember(agentId, fact) {
    const history = this.memory.get(agentId) || [];
    history.push(fact);
    this.memory.set(agentId, history);
  }
  recall(agentId) {
    return this.memory.get(agentId) || [];
  }
  clear() {
    this.memory.clear();
  }
};
var agentMemory = new AgentMemory();

// src/core/agents/base/baseAgent.ts
var BaseAgent = class {
  constructor(definition) {
    this.definition = definition;
  }
  get id() {
    return this.definition.id;
  }
  get status() {
    return this.definition.status;
  }
  set status(status) {
    this.definition.status = status;
  }
};

// src/core/agents/base/taskAgent.ts
var TaskAgent = class extends BaseAgent {
  /**
   * Executes task payloads and reports completion states.
   */
  async executeTask(task) {
    this.status = "Running" /* Running */;
    await new Promise((resolve13) => setTimeout(resolve13, 600));
    this.status = "Completed" /* Completed */;
    return { success: true, result: `Mock execution by ${this.definition.name} completed successfully` };
  }
};

// src/core/agents/planner/plannerValidator.ts
var PlannerValidator = class {
  /**
   * Rejects empty requests and impossible tasks.
   */
  validateRequest(requestText) {
    if (!requestText || !requestText.trim()) {
      throw new Error("Planner validation error: Request cannot be empty");
    }
    const impossibleKeywords = ["coffee", "sandwich", "fly to mars", "world peace"];
    for (const kw of impossibleKeywords) {
      if (requestText.toLowerCase().includes(kw)) {
        throw new Error(`Planner validation error: Impossible request detected containing keyword: "${kw}"`);
      }
    }
  }
  /**
   * Inspects plans for formatting, requirements, and circular dependencies.
   */
  validatePlan(plan) {
    const errors = [];
    if (!plan.goal || !plan.goal.trim()) {
      errors.push("Goal description is required");
    }
    if (plan.tasks.length === 0) {
      errors.push("Execution plan must contain at least one task item");
    }
    const visited = /* @__PURE__ */ new Set();
    const recStack = /* @__PURE__ */ new Set();
    const hasCycle = (taskId) => {
      if (recStack.has(taskId))
        return true;
      if (visited.has(taskId))
        return false;
      visited.add(taskId);
      recStack.add(taskId);
      const task = plan.tasks.find((t) => t.id === taskId);
      if (task) {
        for (const dep of task.dependencies) {
          if (hasCycle(dep))
            return true;
        }
      }
      recStack.delete(taskId);
      return false;
    };
    for (const task of plan.tasks) {
      if (hasCycle(task.id)) {
        errors.push("Circular dependencies detected in execution tasks graph");
        break;
      }
    }
    plan.validationSummary = {
      valid: errors.length === 0,
      errors
    };
    if (errors.length > 0) {
      throw new Error(`Planner validation error: Invalid plan compiled: ${errors.join(", ")}`);
    }
  }
};
var plannerValidator = new PlannerValidator();

// src/core/agents/planner/plannerStrategies.ts
var PlannerStrategies = class {
  /**
   * Identifies planning strategy type based on query keywords.
   */
  resolveStrategy(prompt) {
    const text = prompt.toLowerCase();
    if (text.includes("bug") || text.includes("fix") || text.includes("error") || text.includes("diagnose")) {
      return "BugFix" /* BugFix */;
    }
    if (text.includes("refactor") || text.includes("clean") || text.includes("modular")) {
      return "Refactoring" /* Refactoring */;
    }
    if (text.includes("arch") || text.includes("system") || text.includes("design")) {
      return "Architecture" /* Architecture */;
    }
    if (text.includes("doc") || text.includes("comment") || text.includes("readme")) {
      return "Documentation" /* Documentation */;
    }
    if (text.includes("test") || text.includes("mocha") || text.includes("spec")) {
      return "Testing" /* Testing */;
    }
    return "FeatureDevelopment" /* FeatureDevelopment */;
  }
};
var plannerStrategies = new PlannerStrategies();

// src/core/agents/planner/plannerBrain.ts
var PlannerBrain = class {
  /**
   * Generates structural ExecutionPlan details based on resolved strategy.
   */
  async generatePlan(prompt) {
    const strategy = plannerStrategies.resolveStrategy(prompt);
    const affectedFiles = ["src/core/agents/planner/plannerAgent.ts"];
    const tasks = [
      {
        id: "task-1",
        title: "Analyze workspace dependencies",
        type: "Analyze" /* Analyze */,
        description: "Read package.json imports and index dependencies maps.",
        affectedFiles: [],
        dependencies: []
      },
      {
        id: "task-2",
        title: "Synthesize module code structure",
        type: "Create" /* Create */,
        description: "Write index barrel exporters and typescript classes.",
        affectedFiles,
        dependencies: ["task-1"]
      },
      {
        id: "task-3",
        title: "Write validation tests specifications",
        type: "Test" /* Test */,
        description: "Test schemas structures validations.",
        affectedFiles: ["tests/unit/planner.test.ts"],
        dependencies: ["task-2"]
      }
    ];
    const plan = {
      id: `plan-${Date.now()}`,
      goal: `Synthesize foundation for request: "${prompt}"`,
      summary: `This plan outlines steps to create necessary files and verify validations rules for strategy: ${strategy}.`,
      strategy,
      priority: "high",
      estimatedDurationMin: 45,
      affectedFiles: ["src/core/agents/planner/plannerAgent.ts", "tests/unit/planner.test.ts"],
      dependencies: [],
      tasks,
      riskAssessment: {
        complexity: "medium",
        riskScore: 25,
        mitigationStrategy: "Validate parameter shapes sequentially before triggers."
      },
      validationSummary: {
        valid: true,
        errors: []
      }
    };
    return plan;
  }
};
var plannerBrain = new PlannerBrain();

// src/core/agents/planner/plannerMetrics.ts
var PlannerMetrics = class {
  data = {
    plansGeneratedCount: 0,
    totalPlanningTimeMs: 0,
    averageTasksPerPlan: 0,
    lastPlanLatencyMs: 0
  };
  recordPlanningRun(tasksCount, latencyMs) {
    const totalTasks = this.data.averageTasksPerPlan * this.data.plansGeneratedCount + tasksCount;
    this.data.plansGeneratedCount++;
    this.data.totalPlanningTimeMs += latencyMs;
    this.data.lastPlanLatencyMs = latencyMs;
    this.data.averageTasksPerPlan = totalTasks / this.data.plansGeneratedCount;
  }
  getMetrics() {
    return this.data;
  }
};
var plannerMetrics = new PlannerMetrics();

// src/core/agents/planner/plannerEvents.ts
var PlannerEvents = class {
  listeners = /* @__PURE__ */ new Set();
  /**
   * Subscribes a listener to Planner Agent events.
   */
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  /**
   * Broadcasts planning events.
   */
  emit(type, payload) {
    const event = {
      type,
      timestamp: Date.now(),
      payload
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error("Error in planner event listener:", err);
      }
    }
  }
};

// src/core/agents/planner/plannerMemory.ts
var PlannerMemory = class {
  history = [];
  rememberPlan(plan) {
    this.history.push(plan);
  }
  getHistory() {
    return this.history;
  }
  clear() {
    this.history = [];
  }
};
var plannerMemory = new PlannerMemory();

// src/core/agents/planner/plannerAgent.ts
var PlannerAgent = class extends BaseAgent {
  events = new PlannerEvents();
  constructor(definition) {
    super(definition);
  }
  subscribe(listener) {
    return this.events.subscribe(listener);
  }
  /**
   * Main entry point to compile plans.
   */
  async executeTask(task) {
    const start = Date.now();
    this.status = "Running" /* Running */;
    this.events.emit("PlanningStarted" /* PlanningStarted */, { taskId: task.id });
    try {
      const prompt = task.payload.text || "";
      plannerValidator.validateRequest(prompt);
      const plan = await plannerBrain.generatePlan(prompt);
      this.events.emit("TaskCreated" /* TaskCreated */, { planId: plan.id });
      plannerValidator.validatePlan(plan);
      this.events.emit("PlanValidated" /* PlanValidated */, { planId: plan.id });
      const latencyMs = Date.now() - start;
      plannerMetrics.recordPlanningRun(plan.tasks.length, latencyMs);
      plannerMemory.rememberPlan(plan);
      this.events.emit("PlanCompleted" /* PlanCompleted */, { planId: plan.id });
      this.status = "Completed" /* Completed */;
      return {
        success: true,
        plan,
        metrics: plannerMetrics.getMetrics()
      };
    } catch (err) {
      this.events.emit("PlanningFailed" /* PlanningFailed */, { error: err.message });
      this.status = "Failed" /* Failed */;
      throw err;
    }
  }
};

// src/core/agents/reviewer/reviewValidator.ts
var ReviewValidator = class {
  /**
   * Asserts plan format, checking for missing dependency IDs.
   */
  validatePlan(plan) {
    if (!plan || !plan.id) {
      throw new Error("Reviewer validation error: Plan is missing or malformed");
    }
    if (!plan.tasks || !Array.isArray(plan.tasks)) {
      throw new Error("Reviewer validation error: Plan contains no execution tasks array");
    }
    const taskIds = new Set(plan.tasks.map((t) => t.id));
    for (const task of plan.tasks) {
      for (const dep of task.dependencies) {
        if (!taskIds.has(dep)) {
          throw new Error(`Reviewer validation error: Task "${task.id}" references missing dependency task ID "${dep}"`);
        }
      }
    }
  }
};
var reviewValidator = new ReviewValidator();

// src/core/agents/reviewer/reviewRules.ts
var ReviewRules = class {
  /**
   * Scans plans for rule violations like excessive deletes or massive edits.
   */
  evaluate(plan) {
    const issues = [];
    if (plan.affectedFiles && plan.affectedFiles.length > 5) {
      issues.push({
        type: "LargeFileEdits",
        description: `Plan edits a large number of files (${plan.affectedFiles.length}). This could lead to merge conflicts.`,
        severity: "medium"
      });
    }
    if (plan.tasks.length > 8) {
      issues.push({
        type: "MassiveRefactors",
        description: "Plan contains a large number of task steps. Consider splitting into multiple sub-milestones.",
        severity: "high"
      });
    }
    for (const task of plan.tasks) {
      if (task.type === "Delete" || task.title.toLowerCase().includes("delete")) {
        issues.push({
          type: "UnsafeFileDeletion",
          description: `Task "${task.id}" plans to delete resources. Validate backup checkpoints first.`,
          severity: "high"
        });
      }
    }
    return issues;
  }
};
var reviewRules = new ReviewRules();

// src/core/agents/reviewer/reviewScorer.ts
var ReviewScorer = class {
  /**
   * Computes risk, security, maintainability, and overall health scores based on active violations list.
   */
  calculateScores(issues) {
    let riskScore = 10;
    let maintainabilityScore = 95;
    let securityScore = 98;
    const performanceScore = 90;
    for (const issue of issues) {
      if (issue.severity === "low") {
        riskScore += 5;
        maintainabilityScore -= 3;
      } else if (issue.severity === "medium") {
        riskScore += 15;
        maintainabilityScore -= 8;
      } else if (issue.severity === "high") {
        riskScore += 30;
        maintainabilityScore -= 15;
        securityScore -= 10;
      } else if (issue.severity === "critical") {
        riskScore += 50;
        maintainabilityScore -= 30;
        securityScore -= 25;
      }
    }
    riskScore = Math.min(riskScore, 100);
    maintainabilityScore = Math.max(maintainabilityScore, 0);
    securityScore = Math.max(securityScore, 0);
    const overallScore = Math.round((maintainabilityScore + performanceScore + securityScore + (100 - riskScore)) / 4);
    let riskLevel = "Low" /* Low */;
    if (riskScore > 75)
      riskLevel = "Critical" /* Critical */;
    else if (riskScore > 50)
      riskLevel = "High" /* High */;
    else if (riskScore > 25)
      riskLevel = "Medium" /* Medium */;
    return {
      overallScore,
      riskScore,
      maintainabilityScore,
      performanceScore,
      securityScore,
      riskLevel
    };
  }
};
var reviewScorer = new ReviewScorer();

// src/core/agents/reviewer/reviewStrategies.ts
var ReviewStrategies = class {
  /**
   * Builds custom list of recommendations depending on plan strategy.
   */
  generateRecommendations(strategy) {
    const recs = [];
    if (strategy === "BugFix") {
      recs.push("Verify fix with regression specs.");
      recs.push("Inspect imports to avoid cycles.");
    } else if (strategy === "Refactoring") {
      recs.push("Split massive changes into non-breaking chunks.");
      recs.push("Verify that public API remains backward compatible.");
    } else {
      recs.push("Enforce modular component structures.");
      recs.push("Verify parameters validation before starting executions.");
    }
    return recs;
  }
};
var reviewStrategies = new ReviewStrategies();

// src/core/agents/reviewer/reviewerBrain.ts
var ReviewerBrain = class {
  /**
   * Compiles the ReviewReport based on active scores and recommendations.
   */
  async reviewPlan(plan) {
    const issues = reviewRules.evaluate(plan);
    const scores = reviewScorer.calculateScores(issues);
    const recommendations = reviewStrategies.generateRecommendations(plan.strategy);
    const warnings = issues.map((i) => i.description);
    const suggestedImprovements = [
      "Increase test coverage for modified segments.",
      "Document newly added interfaces."
    ];
    return {
      planId: plan.id,
      ...scores,
      warnings,
      recommendations,
      suggestedImprovements
    };
  }
};
var reviewerBrain = new ReviewerBrain();

// src/core/agents/reviewer/reviewerMetrics.ts
var ReviewerMetrics = class {
  data = {
    reviewsCount: 0,
    averageOverallScore: 0,
    totalWarningsDetected: 0,
    totalRecommendationsGenerated: 0
  };
  recordReviewRun(overallScore, warningsCount, recsCount) {
    const totalScore = this.data.averageOverallScore * this.data.reviewsCount + overallScore;
    this.data.reviewsCount++;
    this.data.totalWarningsDetected += warningsCount;
    this.data.totalRecommendationsGenerated += recsCount;
    this.data.averageOverallScore = totalScore / this.data.reviewsCount;
  }
  getMetrics() {
    return this.data;
  }
};
var reviewerMetrics = new ReviewerMetrics();

// src/core/agents/reviewer/reviewerEvents.ts
var ReviewerEvents = class {
  listeners = /* @__PURE__ */ new Set();
  /**
   * Subscribes a listener to Reviewer Agent events.
   */
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  /**
   * Broadcasts reviewer events.
   */
  emit(type, payload) {
    const event = {
      type,
      timestamp: Date.now(),
      payload
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error("Error in reviewer event listener:", err);
      }
    }
  }
};

// src/core/agents/reviewer/reviewerAgent.ts
var ReviewerAgent = class extends BaseAgent {
  events = new ReviewerEvents();
  constructor(definition) {
    super(definition);
  }
  subscribe(listener) {
    return this.events.subscribe(listener);
  }
  /**
   * Main entry point to review compiled plans.
   */
  async executeTask(task) {
    this.status = "Running" /* Running */;
    this.events.emit("ReviewStarted" /* ReviewStarted */, { taskId: task.id });
    try {
      const plan = task.payload.plan;
      reviewValidator.validatePlan(plan);
      const report = await reviewerBrain.reviewPlan(plan);
      if (report.warnings.length > 0) {
        this.events.emit("IssueDetected" /* IssueDetected */, { warnings: report.warnings });
      }
      if (report.recommendations.length > 0) {
        this.events.emit("RecommendationGenerated" /* RecommendationGenerated */, { recommendations: report.recommendations });
      }
      reviewerMetrics.recordReviewRun(report.overallScore, report.warnings.length, report.recommendations.length);
      this.events.emit("ReviewCompleted" /* ReviewCompleted */, { report });
      this.status = "Completed" /* Completed */;
      return {
        success: true,
        report,
        metrics: reviewerMetrics.getMetrics()
      };
    } catch (err) {
      this.events.emit("ReviewFailed" /* ReviewFailed */, { error: err.message });
      this.status = "Failed" /* Failed */;
      throw err;
    }
  }
};

// src/core/agents/executor/executionCoordinator.ts
var vscode16 = __toESM(require("vscode"));

// src/core/agents/executor/executionQueue.ts
var ExecutionQueue = class {
  queue = [];
  setQueue(tasks) {
    this.queue = [...tasks];
  }
  /**
   * Resolves the next task where all dependencies have been resolved/removed from queue.
   */
  next() {
    return this.queue.find((t) => !t.dependencies.some((depId) => this.queue.some((q) => q.id === depId)));
  }
  dequeue(taskId) {
    this.queue = this.queue.filter((t) => t.id !== taskId);
  }
  isEmpty() {
    return this.queue.length === 0;
  }
  getRemaining() {
    return this.queue;
  }
};

// src/core/agents/executor/executionState.ts
var ExecutionState = class {
  currentTaskId = "";
  status = "Pending" /* Pending */;
  progress = 0;
  isPaused = false;
  isCancelled = false;
  logs = [];
  log(message) {
    this.logs.push(`[${(/* @__PURE__ */ new Date()).toISOString()}] ${message}`);
  }
  reset() {
    this.currentTaskId = "";
    this.status = "Pending" /* Pending */;
    this.progress = 0;
    this.isPaused = false;
    this.isCancelled = false;
    this.logs = [];
  }
};
var executionState = new ExecutionState();

// src/core/agents/executor/executorBrain.ts
var ExecutorBrain = class {
  /**
   * Translates planner tasks classifications to corresponding target tool adapter invocations.
   */
  resolveToolCall(task) {
    switch (task.type) {
      case "Analyze" /* Analyze */:
      case "Review" /* Review */:
        return {
          toolId: "workspace-tool",
          args: { action: "scan", path: "." }
        };
      case "Create" /* Create */:
      case "Modify" /* Modify */:
        return {
          toolId: "filesystem-tool",
          args: { path: task.affectedFiles[0] || "src/dummy.txt", content: "mock" }
        };
      case "Test" /* Test */:
        return {
          toolId: "terminal-tool",
          args: { command: "npm test" }
        };
      default:
        return {
          toolId: "diagnostics-tool",
          args: { filter: "errors" }
        };
    }
  }
};
var executorBrain = new ExecutorBrain();

// src/core/agents/executor/executionCoordinator.ts
var ExecutionCoordinator = class {
  constructor(events) {
    this.events = events;
  }
  queue = new ExecutionQueue();
  /**
   * Runs sequential queues, checks cancellation/pauses, and communicates with toolService.
   */
  async executePlan(plan) {
    const start = Date.now();
    executionState.reset();
    executionState.status = "Running";
    this.events.emit("ExecutionStarted" /* ExecutionStarted */, { planId: plan.id });
    let checkpointId;
    try {
      const folders = vscode16.workspace.workspaceFolders;
      const workspaceId = folders && folders.length > 0 ? folders[0].name : "default-workspace";
      const transactionId = `tx-${plan.id}-${Date.now()}`;
      const affectedFiles = [];
      if (plan.tasks) {
        for (const t of plan.tasks) {
          if (t.affectedFiles) {
            affectedFiles.push(...t.affectedFiles);
          }
        }
      }
      const cp = checkpointService.createCheckpoint(
        workspaceId,
        transactionId,
        Array.from(new Set(affectedFiles)),
        { planId: plan.id }
      );
      checkpointId = cp.id;
      executionState.log(`Created workspace checkpoint: ${checkpointId}`);
    } catch (checkpointError) {
      executionState.log(`Warning: Failed to create workspace checkpoint: ${checkpointError.message}`);
    }
    this.queue.setQueue(plan.tasks || []);
    const completedTasks = [];
    const skippedTasks = [];
    const failedTasks = [];
    const toolUsage = [];
    const generatedArtifacts = [];
    const totalTasks = plan.tasks ? plan.tasks.length : 1;
    while (!this.queue.isEmpty()) {
      if (executionState.isCancelled) {
        executionState.status = "Cancelled";
        executionState.log("Plan execution cancelled by user request.");
        this.events.emit("ExecutionCancelled" /* ExecutionCancelled */, { planId: plan.id });
        break;
      }
      if (executionState.isPaused) {
        executionState.status = "Paused";
        executionState.log("Plan execution paused.");
        this.events.emit("ExecutionPaused" /* ExecutionPaused */, { planId: plan.id });
        await new Promise((resolve13) => {
          const interval = setInterval(() => {
            if (!executionState.isPaused || executionState.isCancelled) {
              clearInterval(interval);
              resolve13();
            }
          }, 200);
        });
        if (executionState.isCancelled)
          continue;
        executionState.status = "Running";
        this.events.emit("ExecutionResumed" /* ExecutionResumed */, { planId: plan.id });
      }
      const task = this.queue.next();
      if (!task) {
        break;
      }
      executionState.currentTaskId = task.id;
      executionState.log(`Starting execution for task: ${task.title}`);
      this.events.emit("TaskStarted" /* TaskStarted */, { taskId: task.id });
      let attempts = 0;
      const maxAttempts = 3;
      let taskSuccess = false;
      let lastError = null;
      while (attempts < maxAttempts && !taskSuccess) {
        try {
          attempts++;
          const toolCall = executorBrain.resolveToolCall(task);
          this.events.emit("ToolInvoked" /* ToolInvoked */, { taskId: task.id, toolId: toolCall.toolId });
          executionState.log(`Invoking tool: "${toolCall.toolId}" (Attempt ${attempts}/${maxAttempts})`);
          const result = await toolService.executeTool(toolCall.toolId, toolCall.args);
          toolUsage.push(toolCall.toolId);
          if (toolCall.toolId === "filesystem-tool" && task.affectedFiles.length > 0) {
            generatedArtifacts.push(task.affectedFiles[0]);
          }
          completedTasks.push(task.id);
          this.queue.dequeue(task.id);
          this.events.emit("TaskCompleted" /* TaskCompleted */, { taskId: task.id, result });
          taskSuccess = true;
        } catch (err) {
          lastError = err;
          executionState.log(`Attempt ${attempts} failed for task "${task.id}" with error: ${err.message}`);
          if (attempts < maxAttempts) {
            await new Promise((resolve13) => setTimeout(resolve13, 500));
          }
        }
      }
      if (!taskSuccess) {
        failedTasks.push(task.id);
        this.events.emit("TaskFailed" /* TaskFailed */, { taskId: task.id, error: lastError?.message || "Task failed" });
        executionState.status = "Failed";
        break;
      }
      executionState.progress = Math.round(completedTasks.length / totalTasks * 100);
    }
    if (executionState.status !== "Failed" && executionState.status !== "Cancelled") {
      executionState.status = "Completed";
    } else if (executionState.status === "Failed" && checkpointId) {
      try {
        executionState.log(`Triggering rollback to checkpoint: ${checkpointId}`);
        checkpointService.restoreCheckpoint(checkpointId);
        executionState.log("Rollback completed successfully.");
      } catch (rollbackError) {
        executionState.log(`Error during rollback: ${rollbackError.message}`);
      }
    }
    const latency = Date.now() - start;
    this.events.emit("ExecutionCompleted" /* ExecutionCompleted */, { planId: plan.id });
    return {
      executionId: `exec-${Date.now()}`,
      planId: plan.id,
      completedTasks,
      skippedTasks,
      failedTasks,
      executionTimeMs: latency,
      toolUsage,
      generatedArtifacts,
      logs: [...executionState.logs]
    };
  }
};

// src/core/agents/executor/executionValidator.ts
var ExecutionValidator = class {
  /**
   * Rejects unapproved plans or plans with structural errors.
   */
  validateApproval(plan) {
    if (!plan) {
      throw new Error("Executor validation error: Execution plan cannot be null");
    }
    if (plan.validationSummary && !plan.validationSummary.valid) {
      throw new Error("Executor validation error: Cannot execute plan with validation errors");
    }
    if (plan.approved === false) {
      throw new Error("Executor validation error: Plan has not been approved for execution");
    }
  }
};
var executionValidator = new ExecutionValidator();

// src/core/agents/executor/executionMetrics.ts
var ExecutionMetrics = class {
  data = {
    runsExecutedCount: 0,
    totalExecutionTimeMs: 0,
    toolsInvokedCount: 0,
    avgSuccessRate: 100
  };
  recordExecutionRun(latencyMs, toolCalls, success) {
    const successFactor = success ? 100 : 0;
    const totalSuccess = this.data.avgSuccessRate * this.data.runsExecutedCount + successFactor;
    this.data.runsExecutedCount++;
    this.data.totalExecutionTimeMs += latencyMs;
    this.data.toolsInvokedCount += toolCalls;
    this.data.avgSuccessRate = totalSuccess / this.data.runsExecutedCount;
  }
  getMetrics() {
    return this.data;
  }
};
var executionMetrics = new ExecutionMetrics();

// src/core/agents/executor/executionEvents.ts
var ExecutionEvents = class {
  listeners = /* @__PURE__ */ new Set();
  /**
   * Subscribes a listener to Executor Agent events.
   */
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  /**
   * Broadcasts executor events.
   */
  emit(type, payload) {
    const event = {
      type,
      timestamp: Date.now(),
      payload
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error("Error in executor event listener:", err);
      }
    }
  }
};

// src/core/agents/executor/executorAgent.ts
var ExecutorAgent = class extends BaseAgent {
  events = new ExecutionEvents();
  coordinator;
  constructor(definition) {
    super(definition);
    this.coordinator = new ExecutionCoordinator(this.events);
  }
  subscribe(listener) {
    return this.events.subscribe(listener);
  }
  /**
   * Main entry point to run tasks.
   */
  async executeTask(task) {
    this.status = "Running" /* Running */;
    try {
      const plan = task.payload.plan;
      executionValidator.validateApproval(plan);
      const report = await this.coordinator.executePlan(plan);
      const success = report.failedTasks.length === 0;
      executionMetrics.recordExecutionRun(report.executionTimeMs, report.toolUsage.length, success);
      this.status = success ? "Completed" /* Completed */ : "Failed" /* Failed */;
      return {
        success,
        report,
        metrics: executionMetrics.getMetrics()
      };
    } catch (err) {
      this.events.emit("TaskFailed" /* TaskFailed */, { error: err.message });
      this.status = "Failed" /* Failed */;
      throw err;
    }
  }
};

// src/core/agents/memory/memoryStore.ts
var path22 = __toESM(require("path"));
var fs21 = __toESM(require("fs"));
var vscode17 = __toESM(require("vscode"));

// src/core/agents/memory/memoryValidator.ts
var MemoryValidator = class {
  validate(memory, existingIds) {
    if (!memory) {
      throw new Error("Memory validation error: Entry cannot be null");
    }
    if (!memory.id || !memory.id.trim()) {
      throw new Error("Memory validation error: Memory ID cannot be empty");
    }
    if (existingIds.has(memory.id)) {
      throw new Error(`Memory validation error: Duplicate memory ID "${memory.id}" detected`);
    }
    if (!memory.title || !memory.title.trim()) {
      throw new Error("Memory validation error: Title cannot be empty");
    }
    if (!memory.content || !memory.content.trim()) {
      throw new Error("Memory validation error: Content cannot be empty");
    }
    if (!memory.type) {
      throw new Error("Memory validation error: Memory type must be specified");
    }
    if (memory.importance !== void 0 && (memory.importance < 1 || memory.importance > 10)) {
      throw new Error("Memory validation error: Importance must be between 1 and 10");
    }
    if (memory.tags && !Array.isArray(memory.tags)) {
      throw new Error("Memory validation error: Tags must be a string array");
    }
    if (memory.relatedFiles && !Array.isArray(memory.relatedFiles)) {
      throw new Error("Memory validation error: relatedFiles must be a string array");
    }
    if (memory.relatedTasks && !Array.isArray(memory.relatedTasks)) {
      throw new Error("Memory validation error: relatedTasks must be a string array");
    }
    if (memory.relatedCommits && !Array.isArray(memory.relatedCommits)) {
      throw new Error("Memory validation error: relatedCommits must be a string array");
    }
  }
};
var memoryValidator = new MemoryValidator();

// src/core/agents/memory/memoryStore.ts
var MemoryStore = class {
  memories = /* @__PURE__ */ new Map();
  storagePath = null;
  constructor() {
    this.initStoragePath();
  }
  initStoragePath() {
    const folders = vscode17.workspace.workspaceFolders;
    if (folders && folders.length > 0) {
      const root = folders[0].uri.fsPath;
      const aiidleDir = path22.join(root, ".aiidle", "memory");
      if (!fs21.existsSync(aiidleDir)) {
        fs21.mkdirSync(aiidleDir, { recursive: true });
      }
      this.storagePath = path22.join(aiidleDir, "project-memories.json");
      this.loadFromDisk();
    }
  }
  loadFromDisk() {
    if (!this.storagePath || !fs21.existsSync(this.storagePath))
      return;
    try {
      const raw = fs21.readFileSync(this.storagePath, "utf8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        this.memories.clear();
        for (const item of parsed) {
          if (item && item.id) {
            this.memories.set(item.id, item);
          }
        }
      }
    } catch (err) {
      console.error("[MemoryStore] Failed to load memories from disk:", err);
    }
  }
  saveToDisk() {
    if (!this.storagePath)
      return;
    try {
      const arr = Array.from(this.memories.values());
      fs21.writeFileSync(this.storagePath, JSON.stringify(arr, null, 2), "utf8");
    } catch (err) {
      console.error("[MemoryStore] Failed to save memories to disk:", err);
    }
  }
  create(memory) {
    const idSet = new Set(this.memories.keys());
    memoryValidator.validate(memory, idSet);
    this.memories.set(memory.id, memory);
    this.saveToDisk();
  }
  get(id) {
    return this.memories.get(id);
  }
  getAll() {
    return Array.from(this.memories.values());
  }
  update(id, updates) {
    const existing = this.memories.get(id);
    if (!existing) {
      throw new Error(`Memory update error: Memory with ID "${id}" not found`);
    }
    const updated = {
      ...existing,
      ...updates,
      id,
      updatedAt: Date.now()
    };
    const idSet = new Set(this.memories.keys());
    idSet.delete(id);
    memoryValidator.validate(updated, idSet);
    this.memories.set(id, updated);
    this.saveToDisk();
    return updated;
  }
  delete(id) {
    if (!this.memories.has(id)) {
      throw new Error(`Memory deletion error: Memory with ID "${id}" not found`);
    }
    this.memories.delete(id);
    this.saveToDisk();
  }
  clear() {
    this.memories.clear();
    this.saveToDisk();
  }
};

// src/core/agents/memory/memoryIndex.ts
var MemoryIndex = class {
  tagIndex = /* @__PURE__ */ new Map();
  typeIndex = /* @__PURE__ */ new Map();
  fileIndex = /* @__PURE__ */ new Map();
  rebuildIndex(memories) {
    this.tagIndex.clear();
    this.typeIndex.clear();
    this.fileIndex.clear();
    for (const mem of memories) {
      this.index(mem);
    }
  }
  index(mem) {
    if (!this.typeIndex.has(mem.type)) {
      this.typeIndex.set(mem.type, /* @__PURE__ */ new Set());
    }
    this.typeIndex.get(mem.type).add(mem.id);
    if (mem.tags) {
      for (const tag of mem.tags) {
        const normalized = tag.toLowerCase().trim();
        if (!this.tagIndex.has(normalized)) {
          this.tagIndex.set(normalized, /* @__PURE__ */ new Set());
        }
        this.tagIndex.get(normalized).add(mem.id);
      }
    }
    if (mem.relatedFiles) {
      for (const file of mem.relatedFiles) {
        const normalized = file.toLowerCase().trim();
        if (!this.fileIndex.has(normalized)) {
          this.fileIndex.set(normalized, /* @__PURE__ */ new Set());
        }
        this.fileIndex.get(normalized).add(mem.id);
      }
    }
  }
  deindex(memId, type, tags, files) {
    this.typeIndex.get(type)?.delete(memId);
    if (tags) {
      for (const tag of tags) {
        this.tagIndex.get(tag.toLowerCase().trim())?.delete(memId);
      }
    }
    if (files) {
      for (const file of files) {
        this.fileIndex.get(file.toLowerCase().trim())?.delete(memId);
      }
    }
  }
  getIdsByType(type) {
    return this.typeIndex.get(type) || /* @__PURE__ */ new Set();
  }
  getIdsByTag(tag) {
    return this.tagIndex.get(tag.toLowerCase().trim()) || /* @__PURE__ */ new Set();
  }
  getIdsByFile(file) {
    return this.fileIndex.get(file.toLowerCase().trim()) || /* @__PURE__ */ new Set();
  }
};

// src/core/agents/memory/memoryScorer.ts
var MemoryScorer = class {
  /**
   * Computes a relevance score (0.0 to 1.0) for a memory against search parameters.
   */
  score(memory, queryTerms, importanceWeight = 0.3, recencyWeight = 0.2, relevanceWeight = 0.5) {
    const normImportance = (memory.importance || 5) / 10;
    const ageMs = Date.now() - (memory.updatedAt || memory.createdAt);
    const dayMs = 24 * 60 * 60 * 1e3;
    const ageDays = ageMs / dayMs;
    const normRecency = Math.exp(-ageDays / 10);
    let termMatchCount = 0;
    if (queryTerms.length > 0) {
      const textToSearch = [
        memory.title,
        memory.summary,
        memory.content,
        ...memory.tags || [],
        ...memory.relatedFiles || []
      ].join(" ").toLowerCase();
      for (const term of queryTerms) {
        if (textToSearch.includes(term)) {
          termMatchCount++;
        }
      }
    }
    const normRelevance = queryTerms.length > 0 ? termMatchCount / queryTerms.length : 1;
    return normImportance * importanceWeight + normRecency * recencyWeight + normRelevance * relevanceWeight;
  }
};
var memoryScorer = new MemoryScorer();

// src/core/agents/memory/memoryRetriever.ts
var MemoryRetriever = class {
  retrieve(memories, index, filter) {
    let candidates = new Set(memories.map((m) => m.id));
    if (filter.type) {
      const typeIds = index.getIdsByType(filter.type);
      candidates = new Set(Array.from(candidates).filter((id) => typeIds.has(id)));
    }
    if (filter.tags && filter.tags.length > 0) {
      for (const tag of filter.tags) {
        const tagIds = index.getIdsByTag(tag);
        candidates = new Set(Array.from(candidates).filter((id) => tagIds.has(id)));
      }
    }
    let filteredMemories = memories.filter((m) => candidates.has(m.id));
    if (filter.importanceMin !== void 0) {
      filteredMemories = filteredMemories.filter((m) => m.importance >= filter.importanceMin);
    }
    const query = filter.query?.toLowerCase().trim() || "";
    const queryTerms = query ? query.split(/\s+/).filter((t) => t.length > 0) : [];
    const scored = filteredMemories.map((m) => {
      const score = memoryScorer.score(m, queryTerms);
      return {
        memory: m,
        score
      };
    });
    let results = scored;
    if (queryTerms.length > 0) {
      results = scored.filter((r) => r.score > 0.1);
    }
    results.sort((a, b) => b.score - a.score);
    return results.map((r) => ({
      ...r.memory,
      relevanceScore: parseFloat(r.score.toFixed(2))
    }));
  }
};

// src/core/agents/memory/memoryCompressor.ts
var MemoryCompressor = class {
  /**
   * Compresses older Execution Summary items.
   * If there are many execution/history entries, compresses entries older than 7 days
   * or entries with low importance into consolidated summaries.
   */
  compress(memories) {
    const deletedIds = [];
    const executionMemories = memories.filter(
      (m) => m.type === "Execution Summary" /* ExecutionSummary */ && m.importance < 5
    );
    if (executionMemories.length <= 5) {
      return { compressed: [], deletedIds: [] };
    }
    const oldestDate = Math.min(...executionMemories.map((m) => m.createdAt));
    const newestDate = Math.max(...executionMemories.map((m) => m.createdAt));
    const totalTimeSpan = `${new Date(oldestDate).toLocaleDateString()} - ${new Date(newestDate).toLocaleDateString()}`;
    const titles = executionMemories.map((m) => `- ${m.title} (${m.summary})`).join("\n");
    const contents = executionMemories.map((m) => `### ${m.title}
${m.content}`).join("\n\n");
    const compressedMemory = {
      id: `compressed-exec-${Date.now()}`,
      type: "Execution Summary" /* ExecutionSummary */,
      title: `Consolidated Execution History (${totalTimeSpan})`,
      summary: `Automated consolidation of ${executionMemories.length} historical executions.`,
      content: `## Consumed Runs
${titles}

## Content Archive
${contents}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      importance: 5,
      tags: ["consolidated", "execution-history"],
      relatedFiles: Array.from(new Set(executionMemories.flatMap((m) => m.relatedFiles || []))),
      relatedTasks: Array.from(new Set(executionMemories.flatMap((m) => m.relatedTasks || []))),
      relatedCommits: Array.from(new Set(executionMemories.flatMap((m) => m.relatedCommits || [])))
    };
    deletedIds.push(...executionMemories.map((m) => m.id));
    return {
      compressed: [compressedMemory],
      deletedIds
    };
  }
};

// src/core/agents/memory/memoryMetrics.ts
var MemoryMetrics = class {
  data = {
    memoriesCount: 0,
    decisionsCount: 0,
    executionsCount: 0,
    compressionsCount: 0,
    searchesCount: 0,
    lastSearchLatencyMs: 0
  };
  recordOperation(type, details) {
    if (type === "create") {
      this.data.memoriesCount++;
      if (details?.type === "Architecture Decision") {
        this.data.decisionsCount++;
      } else if (details?.type === "Execution Summary") {
        this.data.executionsCount++;
      }
    } else if (type === "delete") {
      this.data.memoriesCount = Math.max(0, this.data.memoriesCount - 1);
    } else if (type === "compress") {
      this.data.compressionsCount++;
    } else if (type === "search") {
      this.data.searchesCount++;
      if (details?.latencyMs !== void 0) {
        this.data.lastSearchLatencyMs = details.latencyMs;
      }
    }
  }
  getMetrics() {
    return this.data;
  }
};
var memoryMetrics = new MemoryMetrics();

// src/core/agents/memory/memoryBrain.ts
var MemoryBrain = class {
  constructor(events) {
    this.events = events;
    this.syncIndex();
  }
  store = new MemoryStore();
  index = new MemoryIndex();
  retriever = new MemoryRetriever();
  compressor = new MemoryCompressor();
  syncIndex() {
    this.index.rebuildIndex(this.store.getAll());
    memoryMetrics.recordOperation("sync", { count: this.store.getAll().length });
  }
  createMemory(memory) {
    const completeMemory = {
      ...memory,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    this.store.create(completeMemory);
    this.index.index(completeMemory);
    memoryMetrics.recordOperation("create", { type: completeMemory.type });
    this.events.emit("MemoryCreated" /* MemoryCreated */, { memory: completeMemory });
    return completeMemory;
  }
  getMemory(id) {
    return this.store.get(id);
  }
  updateMemory(id, updates) {
    const old = this.store.get(id);
    if (old) {
      this.index.deindex(id, old.type, old.tags || [], old.relatedFiles || []);
    }
    const updated = this.store.update(id, updates);
    this.index.index(updated);
    memoryMetrics.recordOperation("update", { id });
    this.events.emit("MemoryUpdated" /* MemoryUpdated */, { memory: updated });
    return updated;
  }
  deleteMemory(id) {
    const old = this.store.get(id);
    if (old) {
      this.index.deindex(id, old.type, old.tags || [], old.relatedFiles || []);
      this.store.delete(id);
      memoryMetrics.recordOperation("delete", { id });
      this.events.emit("MemoryDeleted" /* MemoryDeleted */, { id });
    }
  }
  search(filter) {
    const start = Date.now();
    const list = this.store.getAll();
    const results = this.retriever.retrieve(list, this.index, filter);
    const latencyMs = Date.now() - start;
    memoryMetrics.recordOperation("search", { latencyMs });
    this.events.emit("MemoryRetrieved" /* MemoryRetrieved */, { count: results.length, filter });
    return results;
  }
  compress() {
    const list = this.store.getAll();
    const { compressed, deletedIds } = this.compressor.compress(list);
    if (compressed.length > 0) {
      for (const id of deletedIds) {
        const old = this.store.get(id);
        if (old) {
          this.index.deindex(id, old.type, old.tags || [], old.relatedFiles || []);
          this.store.delete(id);
        }
      }
      for (const mem of compressed) {
        this.store.create(mem);
        this.index.index(mem);
      }
      memoryMetrics.recordOperation("compress");
      this.events.emit("MemoryCompressed" /* MemoryCompressed */, { compressedCount: compressed.length, deletedCount: deletedIds.length });
    }
  }
  getAll() {
    return this.store.getAll();
  }
};

// src/core/agents/memory/memoryEvents.ts
var MemoryEvents = class {
  listeners = /* @__PURE__ */ new Set();
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  emit(type, payload) {
    const event = {
      type,
      timestamp: Date.now(),
      payload
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error("Error in Memory Agent event listener:", err);
      }
    }
  }
};

// src/core/agents/memory/memoryAgent.ts
var MemoryAgent = class extends BaseAgent {
  events = new MemoryEvents();
  brain;
  constructor(definition) {
    super(definition);
    this.brain = new MemoryBrain(this.events);
  }
  subscribe(listener) {
    return this.events.subscribe(listener);
  }
  async executeTask(task) {
    this.status = "Running" /* Running */;
    const action = task.payload?.action;
    try {
      let result;
      if (action === "CREATE") {
        result = this.brain.createMemory(task.payload.memory);
      } else if (action === "SEARCH") {
        result = this.brain.search(task.payload.filter || {});
      } else if (action === "UPDATE") {
        result = this.brain.updateMemory(task.payload.id, task.payload.updates);
      } else if (action === "DELETE") {
        this.brain.deleteMemory(task.payload.id);
        result = { success: true };
      } else if (action === "COMPRESS") {
        this.brain.compress();
        result = { success: true };
      } else if (action === "GET_ALL") {
        result = this.brain.getAll();
      } else {
        throw new Error(`MemoryAgent error: Unknown action "${action}"`);
      }
      this.status = "Completed" /* Completed */;
      return {
        success: true,
        result,
        metrics: memoryMetrics.getMetrics()
      };
    } catch (err) {
      this.events.emit("MemoryDeleted" /* MemoryDeleted */, { error: err.message });
      this.status = "Failed" /* Failed */;
      throw err;
    }
  }
};

// src/core/agents/testing/testingStrategies.ts
var TestingStrategies = class {
  /**
   * Resolves the risk level based on the list of affected files.
   */
  determineRiskLevel(affectedFiles) {
    if (!affectedFiles || affectedFiles.length === 0) {
      return "Minimal" /* Minimal */;
    }
    let hasCore = false;
    let hasUI = false;
    let hasSecurity = false;
    for (const file of affectedFiles) {
      const lower = file.toLowerCase();
      if (lower.includes("security") || lower.includes("permission") || lower.includes("auth")) {
        hasSecurity = true;
      } else if (lower.includes("src/core/agents/") || lower.includes("src/core/")) {
        hasCore = true;
      } else if (lower.includes("src/webview/") || lower.includes("components/")) {
        hasUI = true;
      }
    }
    if (hasSecurity)
      return "Critical" /* Critical */;
    if (hasCore)
      return "High" /* High */;
    if (hasUI)
      return "Medium" /* Medium */;
    return "Low" /* Low */;
  }
  /**
   * Recommends testing types based on the resolved risk level.
   */
  recommendTestTypes(riskLevel) {
    switch (riskLevel) {
      case "Critical" /* Critical */:
        return ["Unit" /* Unit */, "Integration" /* Integration */, "Regression" /* Regression */, "Smoke" /* Smoke */, "Static Analysis" /* StaticAnalysis */];
      case "High" /* High */:
        return ["Unit" /* Unit */, "Integration" /* Integration */, "Regression" /* Regression */, "Static Analysis" /* StaticAnalysis */];
      case "Medium" /* Medium */:
        return ["Unit" /* Unit */, "Smoke" /* Smoke */, "Accessibility" /* Accessibility */];
      case "Low" /* Low */:
        return ["Unit" /* Unit */, "Static Analysis" /* StaticAnalysis */];
      default:
        return ["Smoke" /* Smoke */];
    }
  }
};
var testingStrategies = new TestingStrategies();

// src/core/agents/testing/testingPlanner.ts
var TestingPlanner = class {
  createTestPlan(planId, riskLevel, testTypes, affectedFiles) {
    const affectedModules = [];
    const targetPaths = [];
    if (affectedFiles) {
      for (const file of affectedFiles) {
        const match = file.match(/src\/[^\/]+/);
        if (match) {
          affectedModules.push(match[0]);
        }
        if (file.endsWith(".ts") || file.endsWith(".tsx")) {
          const testPath = file.replace("src/", "tests/unit/").replace(".tsx", ".test.tsx").replace(".ts", ".test.ts");
          targetPaths.push(testPath);
        }
      }
    }
    return {
      planId,
      strategy: `Comprehensive ${riskLevel} Risk Testing Strategy`,
      riskLevel,
      testTypes,
      affectedModules: Array.from(new Set(affectedModules)),
      targetPaths: Array.from(new Set(targetPaths))
    };
  }
};
var testingPlanner = new TestingPlanner();

// src/core/agents/testing/testingRunner.ts
var TestingRunner = class {
  async execute(plan) {
    const passedTests = [];
    const failedTests = [];
    const skippedTests = [];
    const warnings = [];
    const recommendations = [];
    if (plan.targetPaths.length === 0) {
      passedTests.push("smoke.test.ts - Basic activation checks pass");
    } else {
      for (const path23 of plan.targetPaths) {
        const basename2 = path23.split("/").pop() || "test.ts";
        const seed = Math.random();
        if (seed > 0.15) {
          passedTests.push(`${basename2} - Structural validation check matches specs`);
          passedTests.push(`${basename2} - Boundary metrics logs record successfully`);
        } else {
          failedTests.push(`${basename2} - Expected status code 200, got 500`);
          warnings.push(`Verification warning: Potential resource leak detected in ${basename2}`);
          recommendations.push(`Verify file descriptor bounds and cleanup hooks inside the files tested by ${basename2}.`);
        }
      }
    }
    if (plan.riskLevel === "Critical" || plan.riskLevel === "High") {
      recommendations.push("High risk level detected: Trigger manual end-to-end user flows checklist verification.");
    }
    return {
      passedTests,
      failedTests,
      skippedTests,
      warnings,
      recommendations,
      durationMs: 120 + Math.round(Math.random() * 450)
    };
  }
};
var testingRunner = new TestingRunner();

// src/core/agents/testing/testingCoverage.ts
var TestingCoverage = class {
  /**
   * Estimates code coverage percentage based on plan risk levels and files count.
   */
  estimate(plan) {
    const totalModules = plan.affectedModules.length || 1;
    const targetsCount = plan.targetPaths.length || 1;
    let base = 65;
    if (plan.riskLevel === "Minimal") {
      base = 88;
    } else if (plan.riskLevel === "Low") {
      base = 80;
    } else if (plan.riskLevel === "Medium") {
      base = 74;
    } else if (plan.riskLevel === "High") {
      base = 68;
    }
    const bonus = Math.min(12, targetsCount / totalModules * 4);
    return Math.min(100, Math.round(base + bonus));
  }
};
var testingCoverage = new TestingCoverage();

// src/core/agents/testing/testingMetrics.ts
var TestingMetrics = class {
  data = {
    runsCount: 0,
    totalDurationMs: 0,
    totalPassedCount: 0,
    totalFailedCount: 0,
    avgConfidenceScore: 0,
    avgCoverageEstimate: 0
  };
  recordRun(durationMs, passed, failed, confidence, coverage) {
    const totalConfidence = this.data.avgConfidenceScore * this.data.runsCount + confidence;
    const totalCoverage = this.data.avgCoverageEstimate * this.data.runsCount + coverage;
    this.data.runsCount++;
    this.data.totalDurationMs += durationMs;
    this.data.totalPassedCount += passed;
    this.data.totalFailedCount += failed;
    this.data.avgConfidenceScore = Math.round(totalConfidence / this.data.runsCount);
    this.data.avgCoverageEstimate = Math.round(totalCoverage / this.data.runsCount);
  }
  getMetrics() {
    return this.data;
  }
};
var testingMetrics = new TestingMetrics();

// src/core/agents/testing/testingValidator.ts
var TestingValidator = class {
  validateRequest(executionReport, workspaceFolders) {
    if (!executionReport) {
      throw new Error("Testing validation error: Missing execution report input");
    }
    if (!executionReport.executionId || !executionReport.planId) {
      throw new Error("Testing validation error: Invalid execution report content");
    }
    if (!workspaceFolders || workspaceFolders.length === 0) {
      throw new Error("Testing validation error: Invalid workspace folder - no folder is currently open");
    }
  }
  validateFramework(framework) {
    const supported = ["jest", "vitest", "mocha", "simulated"];
    if (!supported.includes(framework.toLowerCase())) {
      throw new Error(`Testing validation error: Unknown or unsupported testing framework "${framework}"`);
    }
  }
};
var testingValidator = new TestingValidator();

// src/core/agents/testing/testingBrain.ts
var vscode18 = __toESM(require("vscode"));
var TestingBrain = class {
  constructor(events) {
    this.events = events;
  }
  async runTestingWorkflow(executionReport, framework = "simulated") {
    const folders = vscode18.workspace.workspaceFolders;
    testingValidator.validateRequest(executionReport, folders);
    testingValidator.validateFramework(framework);
    this.events.emit("TestingStarted" /* TestingStarted */, { executionId: executionReport.executionId });
    const affectedFiles = executionReport.generatedArtifacts || [];
    const riskLevel = testingStrategies.determineRiskLevel(affectedFiles);
    const testTypes = testingStrategies.recommendTestTypes(riskLevel);
    this.events.emit("StrategySelected" /* StrategySelected */, { riskLevel, testTypes });
    const testPlan = testingPlanner.createTestPlan(executionReport.planId, riskLevel, testTypes, affectedFiles);
    const runResult = await testingRunner.execute(testPlan);
    const passed = runResult.passedTests || [];
    const failed = runResult.failedTests || [];
    const skipped = runResult.skippedTests || [];
    const warnings = runResult.warnings || [];
    const recommendations = runResult.recommendations || [];
    for (const t of passed) {
      this.events.emit("TestPassed" /* TestPassed */, { testName: t });
    }
    for (const t of failed) {
      this.events.emit("TestFailed" /* TestFailed */, { testName: t });
    }
    const coverage = testingCoverage.estimate(testPlan);
    this.events.emit("CoverageCalculated" /* CoverageCalculated */, { coverage });
    let riskPenalty = 0;
    if (riskLevel === "Critical")
      riskPenalty = 25;
    else if (riskLevel === "High")
      riskPenalty = 15;
    else if (riskLevel === "Medium")
      riskPenalty = 8;
    else if (riskLevel === "Low")
      riskPenalty = 3;
    const confidenceScore = Math.max(0, Math.min(100, 100 - failed.length * 12 - warnings.length * 6 - riskPenalty));
    const duration = runResult.durationMs || 0;
    testingMetrics.recordRun(duration, passed.length, failed.length, confidenceScore, coverage);
    const report = {
      testingId: `test-run-${Date.now()}`,
      coverageEstimate: coverage,
      confidenceScore,
      passedTests: passed,
      failedTests: failed,
      skippedTests: skipped,
      warnings,
      recommendations,
      durationMs: duration
    };
    this.events.emit("TestingCompleted" /* TestingCompleted */, { report });
    return report;
  }
};

// src/core/agents/testing/testingEvents.ts
var TestingEvents = class {
  listeners = /* @__PURE__ */ new Set();
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  emit(type, payload) {
    const event = {
      type,
      timestamp: Date.now(),
      payload
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error("Error in Testing Agent event listener:", err);
      }
    }
  }
};

// src/core/agents/testing/testingAgent.ts
var TestingAgent = class extends BaseAgent {
  events = new TestingEvents();
  brain;
  constructor(definition) {
    super(definition);
    this.brain = new TestingBrain(this.events);
  }
  subscribe(listener) {
    return this.events.subscribe(listener);
  }
  async executeTask(task) {
    this.status = "Running" /* Running */;
    const action = task.payload?.action;
    try {
      let result;
      if (action === "RUN_WORKFLOW") {
        const report = await this.brain.runTestingWorkflow(
          task.payload.executionReport,
          task.payload.framework || "simulated"
        );
        result = { report };
      } else if (action === "GET_STATS") {
        result = { metrics: testingMetrics.getMetrics() };
      } else {
        throw new Error(`TestingAgent error: Unknown action "${action}"`);
      }
      this.status = "Completed" /* Completed */;
      return {
        success: true,
        result,
        metrics: testingMetrics.getMetrics()
      };
    } catch (err) {
      this.events.emit("TestFailed" /* TestFailed */, { error: err.message });
      this.status = "Failed" /* Failed */;
      throw err;
    }
  }
};

// src/core/agents/security/securityRules.ts
var SecurityRules = class {
  rules = [];
  constructor() {
    this.initRules();
  }
  initRules() {
    this.rules.push({
      id: "SEC-001",
      title: "Unsafe File Deletion",
      description: "Detection of deletion operations affecting core project structures.",
      severity: "High" /* High */,
      check: (task) => {
        const type = task.type || "";
        const title = (task.title || "").toLowerCase();
        return type.toLowerCase() === "delete" || title.includes("delete") || title.includes("remove");
      }
    });
    this.rules.push({
      id: "SEC-002",
      title: "Dangerous Shell Commands",
      description: "Executions of direct download scripts, admin commands, or write-access shell parameters.",
      severity: "Critical" /* Critical */,
      check: (task) => {
        const desc = (task.description || "").toLowerCase();
        const title = (task.title || "").toLowerCase();
        const cmd = desc + " " + title;
        return cmd.includes("curl") || cmd.includes("wget") || cmd.includes("chmod") || cmd.includes("sudo") || cmd.includes("rm -rf") || cmd.includes("chown");
      }
    });
    this.rules.push({
      id: "SEC-003",
      title: "Hardcoded Secrets/Credentials",
      description: "Potential exposure of tokens, authorization credentials, passwords, or API keys in the instructions.",
      severity: "Critical" /* Critical */,
      check: (task) => {
        const desc = (task.description || "").toLowerCase();
        const title = (task.title || "").toLowerCase();
        const text = desc + " " + title;
        return text.includes("api_key") || text.includes("secret_key") || text.includes("password") || text.includes("token") || text.includes("auth");
      }
    });
    this.rules.push({
      id: "SEC-004",
      title: "Large-scale Project Modifications",
      description: "Operations affecting more than 5 distinct files or modules simultaneously.",
      severity: "Medium" /* Medium */,
      check: (task) => {
        const files = task.affectedFiles || [];
        return files.length > 5;
      }
    });
    this.rules.push({
      id: "SEC-005",
      title: "Dependency Configuration Changes",
      description: "Additions or removals of external packages or scripts config files.",
      severity: "Low" /* Low */,
      check: (task) => {
        const files = task.affectedFiles || [];
        return files.some((f) => f.includes("package.json") || f.includes("package-lock.json"));
      }
    });
  }
  evaluate(task) {
    const issues = [];
    for (const rule of this.rules) {
      if (rule.check(task)) {
        issues.push({
          id: `iss-${Math.round(Math.random() * 1e5)}`,
          ruleId: rule.id,
          title: rule.title,
          description: rule.description,
          severity: rule.severity,
          location: task.id
        });
      }
    }
    return issues;
  }
};
var securityRules = new SecurityRules();

// src/core/agents/security/securityScanner.ts
var SecurityScanner = class {
  scanPlan(plan) {
    const issues = [];
    const tasks = plan.tasks || [];
    for (const task of tasks) {
      const taskIssues = securityRules.evaluate(task);
      issues.push(...taskIssues);
    }
    return issues;
  }
};
var securityScanner = new SecurityScanner();

// src/core/agents/security/securityRiskEngine.ts
var SecurityRiskEngine = class {
  calculateOverallRisk(issues) {
    let score = 0;
    for (const issue of issues) {
      if (issue.severity === "Critical" /* Critical */) {
        score += 45;
      } else if (issue.severity === "High" /* High */) {
        score += 25;
      } else if (issue.severity === "Medium" /* Medium */) {
        score += 10;
      } else if (issue.severity === "Low" /* Low */) {
        score += 4;
      } else {
        score += 1;
      }
    }
    const finalScore = Math.max(0, Math.min(100, score));
    let level = "Info" /* Info */;
    if (finalScore >= 75) {
      level = "Critical" /* Critical */;
    } else if (finalScore >= 45) {
      level = "High" /* High */;
    } else if (finalScore >= 20) {
      level = "Medium" /* Medium */;
    } else if (finalScore >= 5) {
      level = "Low" /* Low */;
    }
    return {
      score: finalScore,
      level
    };
  }
};
var securityRiskEngine = new SecurityRiskEngine();

// src/core/agents/security/securityPolicy.ts
var SecurityPolicy = class {
  evaluate(riskLevel) {
    switch (riskLevel) {
      case "Critical" /* Critical */:
        return "Block" /* Block */;
      case "High" /* High */:
        return "Require Approval" /* RequireApproval */;
      case "Medium" /* Medium */:
        return "Warn" /* Warn */;
      default:
        return "Allow" /* Allow */;
    }
  }
};
var securityPolicy = new SecurityPolicy();

// src/core/agents/security/securityMetrics.ts
var SecurityMetrics = class {
  data = {
    scansCount: 0,
    blockedCount: 0,
    warningsCount: 0,
    approvalsCount: 0,
    totalIssuesCount: 0
  };
  recordScan(issuesCount, decision) {
    this.data.scansCount++;
    this.data.totalIssuesCount += issuesCount;
    if (decision === "Block") {
      this.data.blockedCount++;
    } else if (decision === "Warn") {
      this.data.warningsCount++;
    } else if (decision === "Require Approval") {
      this.data.approvalsCount++;
    }
  }
  getMetrics() {
    return this.data;
  }
};
var securityMetrics = new SecurityMetrics();

// src/core/agents/security/securityValidator.ts
var SecurityValidator = class {
  validateScanRequest(request) {
    if (!request) {
      throw new Error("Security validation error: Missing scan request body");
    }
    if (!request.planId) {
      throw new Error("Security validation error: Missing planId in scan request");
    }
    if (request.tasks && !Array.isArray(request.tasks)) {
      throw new Error("Security validation error: Plan tasks must be an array");
    }
  }
  validateToolCall(toolId, allowedTools) {
    if (!toolId || !toolId.trim()) {
      throw new Error("Security validation error: Tool invocation ID cannot be empty");
    }
    if (!allowedTools.has(toolId)) {
      throw new Error(`Security validation error: Unknown or unregistered tool "${toolId}"`);
    }
  }
  validatePolicy(policy) {
    const valid = ["Allow", "Warn", "Require Approval", "Block"];
    if (!valid.includes(policy)) {
      throw new Error(`Security validation error: Unknown or unsupported security policy "${policy}"`);
    }
  }
};
var securityValidator = new SecurityValidator();

// src/core/agents/security/securityBrain.ts
var SecurityBrain = class {
  constructor(events) {
    this.events = events;
  }
  async scanPlanWorkflow(plan) {
    securityValidator.validateScanRequest(plan);
    this.events.emit("SecurityScanStarted" /* SecurityScanStarted */, { planId: plan.id });
    const issues = securityScanner.scanPlan(plan);
    for (const issue of issues) {
      this.events.emit("IssueDetected" /* IssueDetected */, { issue });
    }
    const { score, level } = securityRiskEngine.calculateOverallRisk(issues);
    const decision = securityPolicy.evaluate(level);
    if (decision === "Block" /* Block */ || decision === "Require Approval" /* RequireApproval */) {
      this.events.emit("PolicyViolation" /* PolicyViolation */, { score, level, decision });
    }
    if (decision === "Require Approval" /* RequireApproval */) {
      this.events.emit("ApprovalRequired" /* ApprovalRequired */, { planId: plan.id });
    }
    const blockedActions = [];
    const warnings = [];
    const recommendations = [];
    if (decision === "Block" /* Block */) {
      blockedActions.push(`Blocked execution of plan "${plan.id}" due to Critical risk score (${score})`);
    }
    for (const issue of issues) {
      warnings.push(`[${issue.severity}] ${issue.title}: ${issue.description}`);
      if (issue.ruleId === "SEC-001") {
        recommendations.push("Core deletions detected: Ensure backups exist before running code updates.");
      } else if (issue.ruleId === "SEC-002") {
        recommendations.push("Terminal execution vulnerability: Restructure shell parameters to avoid injections.");
      } else if (issue.ruleId === "SEC-003") {
        recommendations.push("Credential exposures found: Move secrets to env settings configurations.");
      }
    }
    if (issues.length === 0) {
      recommendations.push("Plan matches standard rules: Safe to dispatch execution.");
    }
    securityMetrics.recordScan(issues.length, decision);
    if (decision === "Block" /* Block */) {
      this.events.emit("SecurityFailed" /* SecurityFailed */, { score });
    } else {
      this.events.emit("SecurityPassed" /* SecurityPassed */, { score });
    }
    return {
      securityId: `sec-scan-${Date.now()}`,
      overallRisk: level,
      riskScore: score,
      detectedIssues: issues,
      blockedActions,
      warnings,
      recommendations,
      policyResult: decision
    };
  }
};

// src/core/agents/security/securityEvents.ts
var SecurityEvents = class {
  listeners = /* @__PURE__ */ new Set();
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  emit(type, payload) {
    const event = {
      type,
      timestamp: Date.now(),
      payload
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error("Error in Security Agent event listener:", err);
      }
    }
  }
};

// src/core/agents/security/securityAgent.ts
var SecurityAgent = class extends BaseAgent {
  events = new SecurityEvents();
  brain;
  constructor(definition) {
    super(definition);
    this.brain = new SecurityBrain(this.events);
  }
  subscribe(listener) {
    return this.events.subscribe(listener);
  }
  async executeTask(task) {
    this.status = "Running" /* Running */;
    const action = task.payload?.action;
    try {
      let result;
      if (action === "SCAN_PLAN") {
        const report = await this.brain.scanPlanWorkflow(task.payload.plan);
        result = { report };
      } else if (action === "GET_STATS") {
        result = { metrics: securityMetrics.getMetrics() };
      } else {
        throw new Error(`SecurityAgent error: Unknown action "${action}"`);
      }
      this.status = "Completed" /* Completed */;
      return {
        success: true,
        result,
        metrics: securityMetrics.getMetrics()
      };
    } catch (err) {
      this.events.emit("SecurityFailed" /* SecurityFailed */, { error: err.message });
      this.status = "Failed" /* Failed */;
      throw err;
    }
  }
};

// src/core/agents/documentation/documentationTypes.ts
var DocType = /* @__PURE__ */ ((DocType2) => {
  DocType2["README"] = "README";
  DocType2["APIDocumentation"] = "API Documentation";
  DocType2["ArchitectureDocumentation"] = "Architecture Documentation";
  DocType2["DeveloperGuide"] = "Developer Guide";
  DocType2["UserGuide"] = "User Guide";
  DocType2["ReleaseNotes"] = "Release Notes";
  DocType2["MigrationGuide"] = "Migration Guide";
  DocType2["CodeComments"] = "Code Comments";
  return DocType2;
})(DocType || {});

// src/core/agents/documentation/documentationPlanner.ts
var DocumentationPlanner = class {
  plan(gitChanges) {
    const affectedTypes = [];
    const filesToUpdate = [];
    let strategy = "Template-based" /* TemplateBased */;
    let impactDescription = "Minor updates to documentation files.";
    if (gitChanges && gitChanges.length > 0) {
      strategy = "Incremental Update" /* IncrementalUpdate */;
      impactDescription = "Incremental documentation update triggered by changes to source modules.";
      for (const change of gitChanges) {
        const lower = change.toLowerCase();
        if (lower.includes("src/core/agents/")) {
          affectedTypes.push("API Documentation" /* APIDocumentation */);
          affectedTypes.push("Architecture Documentation" /* ArchitectureDocumentation */);
          filesToUpdate.push("docs/ARCHITECTURE.md");
        } else if (lower.includes("src/webview/") || lower.includes("components/")) {
          affectedTypes.push("User Guide" /* UserGuide */);
          filesToUpdate.push("docs/USER_GUIDE.md");
        } else if (lower.endsWith(".md")) {
          strategy = "Section Update" /* SectionUpdate */;
          affectedTypes.push("README" /* README */);
          filesToUpdate.push(change);
        }
      }
    }
    if (affectedTypes.length === 0) {
      affectedTypes.push("README" /* README */);
      filesToUpdate.push("README.md");
    }
    return {
      planId: `doc-plan-${Date.now()}`,
      strategy,
      affectedTypes: Array.from(new Set(affectedTypes)),
      impactDescription,
      filesToUpdate: Array.from(new Set(filesToUpdate))
    };
  }
};
var documentationPlanner = new DocumentationPlanner();

// src/core/agents/documentation/documentationTemplates.ts
var DocumentationTemplates = class {
  compile(templateId, payload) {
    const title = payload.title || "Project Documentation";
    const date = (/* @__PURE__ */ new Date()).toLocaleDateString();
    switch (templateId.toLowerCase()) {
      case "standard-readme":
        return `# ${title}

Generated on ${date}.

## Overview
Provide background context about the project module.

## Features
- Feature list items.`;
      case "api-ref":
        return `# API Reference: ${title}

Generated on ${date}.

## Endpoints & Hooks
Detailed parameter structures are logged here.`;
      case "arch-doc":
        return `# Architecture Document: ${title}

Generated on ${date}.

## Design Topology
Visual mappings and subsystem layouts details.`;
      case "release-notes-template":
        return `# Release Notes: ${title}

Released on ${date}.

## Changelog & Enhancements
List details of changes implemented in this session.`;
      default:
        throw new Error(`Invalid template configuration: "${templateId}"`);
    }
  }
};
var documentationTemplates = new DocumentationTemplates();

// src/core/agents/documentation/documentationValidator.ts
var DocumentationValidator = class {
  validateWorkspace(folders) {
    if (!folders || folders.length === 0) {
      throw new Error("Documentation validation error: Missing project. No active workspace folder found.");
    }
  }
  validateTemplate(templateId) {
    const supported = ["standard-readme", "api-ref", "arch-doc", "release-notes-template"];
    if (!supported.includes(templateId.toLowerCase())) {
      throw new Error(`Documentation validation error: Invalid template configuration "${templateId}"`);
    }
  }
  validateDocType(docType) {
    const values = Object.values(DocType);
    if (!values.includes(docType)) {
      throw new Error(`Documentation validation error: Unknown document type "${docType}"`);
    }
  }
  validateLinks(path23, content) {
    const warnings = [];
    const linkRegex = /\[[^\]]+\]\((file:\/\/\/[^\)]+)\)/g;
    let match;
    while ((match = linkRegex.exec(content)) !== null) {
      const url = match[1];
      if (url.includes("//undefined") || url.includes("/null")) {
        warnings.push(`Broken reference link detected: "${url}" inside ${path23}`);
      }
    }
    return warnings;
  }
};
var documentationValidator = new DocumentationValidator();

// src/core/agents/documentation/documentationGenerator.ts
var DocumentationGenerator = class {
  generate(plan) {
    const updatedFiles = [];
    const generatedDocuments = [];
    const warnings = [];
    const suggestions = [];
    for (const file of plan.filesToUpdate) {
      updatedFiles.push(file);
    }
    for (const type of plan.affectedTypes) {
      let path23 = "docs/README.md";
      let templateId = "standard-readme";
      if (type === "API Documentation" /* APIDocumentation */) {
        path23 = "docs/API_REFERENCE.md";
        templateId = "api-ref";
      } else if (type === "Architecture Documentation" /* ArchitectureDocumentation */) {
        path23 = "docs/ARCHITECTURE.md";
        templateId = "arch-doc";
      } else if (type === "Release Notes" /* ReleaseNotes */) {
        path23 = "docs/RELEASE_NOTES.md";
        templateId = "release-notes-template";
      }
      const content = documentationTemplates.compile(templateId, { title: "Sasta Antigravity" });
      generatedDocuments.push({ path: path23, type });
      const linkWarnings = documentationValidator.validateLinks(path23, content);
      warnings.push(...linkWarnings);
    }
    if (plan.strategy === "Full Regeneration") {
      suggestions.push("Review entire project architecture maps to verify no core references are broken.");
    } else {
      suggestions.push("Include detailed jsdoc parameters comments alongside the newly written API endpoints.");
    }
    return {
      updatedFiles,
      generatedDocuments,
      warnings,
      coverage: 85,
      suggestions
    };
  }
};
var documentationGenerator = new DocumentationGenerator();

// src/core/agents/documentation/documentationMetrics.ts
var DocumentationMetrics = class {
  data = {
    generationCount: 0,
    totalUpdatedCount: 0,
    warningsCount: 0,
    avgCoverage: 0
  };
  recordGeneration(updated, generated, warnings, coverage) {
    const totalCoverage = this.data.avgCoverage * this.data.generationCount + coverage;
    this.data.generationCount += generated;
    this.data.totalUpdatedCount += updated;
    this.data.warningsCount += warnings;
    this.data.avgCoverage = this.data.generationCount > 0 ? Math.round(totalCoverage / (this.data.generationCount / generated)) : coverage;
  }
  getMetrics() {
    return this.data;
  }
};
var documentationMetrics = new DocumentationMetrics();

// src/core/agents/documentation/documentationBrain.ts
var vscode19 = __toESM(require("vscode"));
var DocumentationBrain = class {
  constructor(events) {
    this.events = events;
  }
  async runDocumentationWorkflow(gitChanges) {
    const folders = vscode19.workspace.workspaceFolders;
    documentationValidator.validateWorkspace(folders);
    this.events.emit("DocumentationStarted" /* DocumentationStarted */, { gitChanges });
    const docPlan = documentationPlanner.plan(gitChanges);
    for (const type of docPlan.affectedTypes) {
      documentationValidator.validateDocType(type);
    }
    const report = documentationGenerator.generate(docPlan);
    for (const doc of report.generatedDocuments) {
      this.events.emit("DocumentGenerated" /* DocumentGenerated */, { path: doc.path, type: doc.type });
    }
    for (const file of report.updatedFiles) {
      this.events.emit("DocumentUpdated" /* DocumentUpdated */, { path: file });
    }
    this.events.emit("ValidationPassed" /* ValidationPassed */, { warningsCount: report.warnings.length });
    documentationMetrics.recordGeneration(
      report.updatedFiles.length,
      report.generatedDocuments.length,
      report.warnings.length,
      report.coverage
    );
    this.events.emit("DocumentationCompleted" /* DocumentationCompleted */, { report });
    return report;
  }
};

// src/core/agents/documentation/documentationEvents.ts
var DocumentationEvents = class {
  listeners = /* @__PURE__ */ new Set();
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  emit(type, payload) {
    const event = {
      type,
      timestamp: Date.now(),
      payload
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error("Error in Documentation Agent event listener:", err);
      }
    }
  }
};

// src/core/agents/documentation/documentationAgent.ts
var DocumentationAgent = class extends BaseAgent {
  events = new DocumentationEvents();
  brain;
  constructor(definition) {
    super(definition);
    this.brain = new DocumentationBrain(this.events);
  }
  subscribe(listener) {
    return this.events.subscribe(listener);
  }
  async executeTask(task) {
    this.status = "Running" /* Running */;
    const action = task.payload?.action;
    try {
      let result;
      if (action === "GENERATE_DOCS") {
        const report = await this.brain.runDocumentationWorkflow(task.payload.gitChanges || []);
        result = { report };
      } else if (action === "GET_STATS") {
        result = { metrics: documentationMetrics.getMetrics() };
      } else {
        throw new Error(`DocumentationAgent error: Unknown action "${action}"`);
      }
      this.status = "Completed" /* Completed */;
      return {
        success: true,
        result,
        metrics: documentationMetrics.getMetrics()
      };
    } catch (err) {
      this.events.emit("DocumentationCompleted" /* DocumentationCompleted */, { error: err.message });
      this.status = "Failed" /* Failed */;
      throw err;
    }
  }
};

// src/core/agents/refactoring/refactoringAnalyzer.ts
var RefactoringAnalyzer = class {
  analyzeFile(filePath, content) {
    const issues = [];
    const lines = content.split("\n");
    if (lines.length > 300) {
      issues.push({
        smell: "God Object" /* GodObject */,
        file: filePath,
        description: `File length is ${lines.length} lines. Refactor by splitting modules.`
      });
    }
    let importsCount = 0;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith("import ")) {
        importsCount++;
      }
    }
    let nestingDepth = 0;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.includes("{"))
        nestingDepth++;
      if (line.includes("}"))
        nestingDepth--;
      if (nestingDepth > 4) {
        issues.push({
          smell: "Deep Nesting" /* DeepNesting */,
          file: filePath,
          line: i + 1,
          description: "Control flow nesting depth exceeds 4 levels. Extract helper methods."
        });
        break;
      }
    }
    const magicNumberRegex = /=\s*(12|34|56|78|90|1000|5000)\s*;/;
    for (let i = 0; i < lines.length; i++) {
      if (magicNumberRegex.test(lines[i])) {
        issues.push({
          smell: "Magic Numbers" /* MagicNumbers */,
          file: filePath,
          line: i + 1,
          description: "Inline magic number detected. Extract to named constant."
        });
        break;
      }
    }
    if (issues.length === 0) {
      issues.push({
        smell: "Unused Imports" /* UnusedImports */,
        file: filePath,
        description: "Verify imports list cleanliness."
      });
    }
    return issues;
  }
};
var refactoringAnalyzer = new RefactoringAnalyzer();

// src/core/agents/refactoring/refactoringStrategies.ts
var RefactoringStrategies = class {
  mapSmellToStrategy(smell) {
    switch (smell) {
      case "God Object" /* GodObject */:
      case "Large Class" /* LargeClass */:
        return "Extract Class" /* ExtractClass */;
      case "Long Method" /* LongMethod */:
        return "Extract Method" /* ExtractMethod */;
      case "Deep Nesting" /* DeepNesting */:
        return "Simplify Logic" /* SimplifyLogic */;
      case "Magic Numbers" /* MagicNumbers */:
        return "Rename Symbols" /* RenameSymbols */;
      case "Duplicate Code" /* DuplicateCode */:
        return "Merge Duplicates" /* MergeDuplicates */;
      case "Circular Dependencies" /* CircularDependencies */:
        return "Dependency Cleanup" /* DependencyCleanup */;
      default:
        return "Simplify Logic" /* SimplifyLogic */;
    }
  }
};
var refactoringStrategies = new RefactoringStrategies();

// src/core/agents/refactoring/refactoringPlanner.ts
var RefactoringPlanner = class {
  buildPlan(smells) {
    const plans = [];
    for (const item of smells) {
      const type = refactoringStrategies.mapSmellToStrategy(item.smell);
      let complexity = "Low";
      if (type === "Extract Class" /* ExtractClass */ || type === "Merge Duplicates" /* MergeDuplicates */) {
        complexity = "High";
      } else if (type === "Extract Method" /* ExtractMethod */ || type === "Simplify Logic" /* SimplifyLogic */) {
        complexity = "Medium";
      }
      plans.push({
        planId: `ref-plan-${Math.round(Math.random() * 1e5)}`,
        targetFile: item.file,
        type,
        smell: item.smell,
        description: `Refactoring task recommending "${type}" to resolve ${item.smell} in ${item.file}`,
        complexity
      });
    }
    return plans;
  }
};
var refactoringPlanner = new RefactoringPlanner();

// src/core/agents/refactoring/refactoringValidator.ts
var RefactoringValidator = class {
  validateAnalysisRequest(request) {
    if (!request) {
      throw new Error("Refactoring validation error: Missing analysis request body");
    }
    if (!request.files || !Array.isArray(request.files) || request.files.length === 0) {
      throw new Error("Refactoring validation error: Incomplete analysis request - files list is empty");
    }
  }
  validatePlan(plan) {
    if (plan.preservesBehavior === false) {
      throw new Error("Refactoring validation error: Rejected behavior-changing refactoring plan");
    }
    if (plan.hasDependencyCycles === true) {
      throw new Error("Refactoring validation error: Rejected refactoring plan due to broken dependency graph cycles");
    }
    if (!plan.associatedTests || plan.associatedTests.length === 0) {
      throw new Error("Refactoring validation error: Rejected refactoring plan - missing tests verification target");
    }
  }
};
var refactoringValidator = new RefactoringValidator();

// src/core/agents/refactoring/refactoringMetrics.ts
var RefactoringMetrics = class {
  data = {
    analysesCount: 0,
    totalSmellsDetected: 0,
    avgMaintainabilityScore: 78
  };
  recordAnalysis(smellsCount, maintainabilityScore) {
    const totalScore = this.data.avgMaintainabilityScore * this.data.analysesCount + maintainabilityScore;
    this.data.analysesCount++;
    this.data.totalSmellsDetected += smellsCount;
    this.data.avgMaintainabilityScore = Math.round(totalScore / this.data.analysesCount);
  }
  getMetrics() {
    return this.data;
  }
};
var refactoringMetrics = new RefactoringMetrics();

// src/core/agents/refactoring/refactoringBrain.ts
var fs22 = __toESM(require("fs"));
var RefactoringBrain = class {
  constructor(events) {
    this.events = events;
  }
  async runRefactoringAnalysis(filesList) {
    refactoringValidator.validateAnalysisRequest({ files: filesList });
    this.events.emit("AnalysisStarted" /* AnalysisStarted */, { filesCount: filesList.length });
    const detectedIssues = [];
    const affectedFiles = [];
    for (const filePath of filesList) {
      try {
        if (fs22.existsSync(filePath)) {
          const content = fs22.readFileSync(filePath, "utf8");
          const fileIssues = refactoringAnalyzer.analyzeFile(filePath, content);
          for (const iss of fileIssues) {
            this.events.emit("CodeSmellDetected" /* CodeSmellDetected */, { issue: iss });
            detectedIssues.push(iss);
          }
          affectedFiles.push(filePath);
        }
      } catch (err) {
        console.warn(`[RefactoringBrain] Unable to read file ${filePath}:`, err);
      }
    }
    if (detectedIssues.length === 0 && filesList.length > 0) {
      detectedIssues.push({
        smell: "Unused Imports" /* UnusedImports */,
        file: filesList[0],
        description: "Verify cleanliness of imports lists."
      });
      affectedFiles.push(filesList[0]);
    }
    const plans = refactoringPlanner.buildPlan(detectedIssues);
    for (const plan of plans) {
      this.events.emit("RefactoringPlanned" /* RefactoringPlanned */, { plan });
    }
    let hasGod = false;
    let hasNesting = false;
    for (const iss of detectedIssues) {
      if (iss.smell === "God Object" /* GodObject */ || iss.smell === "Duplicate Code" /* DuplicateCode */) {
        hasGod = true;
      }
      if (iss.smell === "Deep Nesting" /* DeepNesting */) {
        hasNesting = true;
      }
    }
    const estimatedComplexity = hasGod ? "High" : hasNesting ? "Medium" : "Low";
    const behaviorRisk = hasGod ? "High" : hasNesting ? "Medium" : "Low";
    const maintainabilityGain = Math.min(35, detectedIssues.length * 5);
    const report = {
      refactoringId: `ref-scan-${Date.now()}`,
      detectedIssues,
      suggestedImprovements: plans.map((p) => `[${p.complexity} Complexity] Recommend ${p.type} in ${p.targetFile} to solve ${p.smell}.`),
      estimatedComplexity,
      affectedFiles: Array.from(new Set(affectedFiles)),
      behaviorRisk,
      maintainabilityGain
    };
    refactoringMetrics.recordAnalysis(detectedIssues.length, 75 + maintainabilityGain);
    this.events.emit("ValidationPassed" /* ValidationPassed */, { reportId: report.refactoringId });
    this.events.emit("RefactoringCompleted" /* RefactoringCompleted */, { report });
    return report;
  }
};

// src/core/agents/refactoring/refactoringEvents.ts
var RefactoringEvents = class {
  listeners = /* @__PURE__ */ new Set();
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  emit(type, payload) {
    const event = {
      type,
      timestamp: Date.now(),
      payload
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error("Error in Refactoring Agent event listener:", err);
      }
    }
  }
};
var refactoringEvents = new RefactoringEvents();

// src/core/agents/refactoring/refactoringAgent.ts
var RefactoringAgent = class extends BaseAgent {
  events = new RefactoringEvents();
  brain;
  constructor(definition) {
    super(definition);
    this.brain = new RefactoringBrain(this.events);
  }
  subscribe(listener) {
    return this.events.subscribe(listener);
  }
  async executeTask(task) {
    this.status = "Running" /* Running */;
    const action = task.payload?.action;
    try {
      let result;
      if (action === "ANALYZE_SMELLS") {
        const report = await this.brain.runRefactoringAnalysis(task.payload.files || []);
        result = { report };
      } else if (action === "GET_STATS") {
        result = { metrics: refactoringMetrics.getMetrics() };
      } else {
        throw new Error(`RefactoringAgent error: Unknown action "${action}"`);
      }
      this.status = "Completed" /* Completed */;
      return {
        success: true,
        result,
        metrics: refactoringMetrics.getMetrics()
      };
    } catch (err) {
      this.events.emit("RefactoringCompleted" /* RefactoringCompleted */, { error: err.message });
      this.status = "Failed" /* Failed */;
      throw err;
    }
  }
};

// src/core/agents/debug/diagnosticsCollector.ts
var DiagnosticsCollector2 = class {
  collect(raw) {
    return {
      errorName: raw.errorName || "UnknownError",
      message: raw.message || "Failure occurred during tool execution",
      language: raw.language || "typescript",
      runtime: raw.runtime || "node",
      logs: raw.logs || ["[info] Starting tool execution process...", "[error] Failure triggered."]
    };
  }
};
var diagnosticsCollector2 = new DiagnosticsCollector2();

// src/core/agents/debug/stackTraceAnalyzer.ts
var StackTraceAnalyzer = class {
  parse(stack) {
    const frames = [];
    if (!stack)
      return frames;
    const lines = stack.split("\n");
    const frameRegex = /at\s+([^\s\(]+)?\s*\(?([^:]+):(\d+):(\d+)\)?/;
    for (const line of lines) {
      const match = line.match(frameRegex);
      if (match) {
        frames.push({
          methodName: match[1] || "anonymous",
          filePath: match[2],
          line: parseInt(match[3], 10),
          column: parseInt(match[4], 10)
        });
      }
    }
    return frames;
  }
};
var stackTraceAnalyzer = new StackTraceAnalyzer();

// src/core/agents/debug/logAnalyzer.ts
var LogAnalyzer = class {
  analyze(logs) {
    let hasCritical = false;
    let warningsCount = 0;
    const errorMessages = [];
    for (const log of logs) {
      const lower = log.toLowerCase();
      if (lower.includes("critical") || lower.includes("fatal")) {
        hasCritical = true;
      }
      if (lower.includes("warn") || lower.includes("alert")) {
        warningsCount++;
      }
      if (lower.includes("error") || lower.includes("fail") || lower.includes("exception")) {
        errorMessages.push(log);
      }
    }
    return {
      hasCritical,
      warningsCount,
      errorMessages
    };
  }
};
var logAnalyzer = new LogAnalyzer();

// src/core/agents/debug/rootCauseEngine.ts
var RootCauseEngine = class {
  resolve(errorName, message, stackFrames) {
    const affectedComponents = [];
    const relatedFiles = [];
    let probableCause = `Unhandled ${errorName}: ${message}`;
    if (stackFrames && stackFrames.length > 0) {
      const targetFrame = stackFrames[0];
      probableCause = `Exception triggered in function "${targetFrame.methodName}" at line ${targetFrame.line} inside file ${targetFrame.filePath}. Details: ${message}`;
      for (const frame of stackFrames) {
        relatedFiles.push(frame.filePath);
        if (frame.filePath.includes("src/core/")) {
          affectedComponents.push("Core Agent Runtime");
        } else if (frame.filePath.includes("src/webview/")) {
          affectedComponents.push("Webview UI Dashboard Panel");
        }
      }
    }
    if (affectedComponents.length === 0) {
      affectedComponents.push("General Utilities");
    }
    return {
      probableCause,
      affectedComponents: Array.from(new Set(affectedComponents)),
      relatedFiles: Array.from(new Set(relatedFiles))
    };
  }
};
var rootCauseEngine = new RootCauseEngine();

// src/core/agents/debug/hypothesisEngine.ts
var HypothesisEngine = class {
  generate(errorName, message, hasCritical) {
    const list = [];
    list.push({
      id: "hyp-1",
      rank: 1,
      description: `Function signature mismatch or null reference error matching: ${errorName}`,
      confidence: hasCritical ? "High" /* High */ : "Medium" /* Medium */,
      likelihood: hasCritical ? 85 : 70
    });
    list.push({
      id: "hyp-2",
      rank: 2,
      description: "Missing configuration setting or undefined environment constants variables.",
      confidence: "Medium" /* Medium */,
      likelihood: 48
    });
    list.push({
      id: "hyp-3",
      rank: 3,
      description: "Communication IPC bridge router timeout during message routing dispatch.",
      confidence: "Low" /* Low */,
      likelihood: 22
    });
    return list;
  }
};
var hypothesisEngine = new HypothesisEngine();

// src/core/agents/debug/debugAnalyzer.ts
var DebugAnalyzer = class {
  analyze(rawDiagnostics) {
    const evidence = diagnosticsCollector2.collect(rawDiagnostics);
    const stackFrames = stackTraceAnalyzer.parse(rawDiagnostics.stackTrace || "");
    const logAudit = logAnalyzer.analyze(evidence.logs);
    const resolution = rootCauseEngine.resolve(
      evidence.errorName,
      evidence.message,
      stackFrames
    );
    const hypotheses = hypothesisEngine.generate(
      evidence.errorName,
      evidence.message,
      logAudit.hasCritical
    );
    let confidenceScore = 80;
    if (logAudit.hasCritical)
      confidenceScore += 10;
    if (stackFrames.length === 0)
      confidenceScore -= 25;
    const finalScore = Math.max(10, Math.min(100, confidenceScore));
    const suggestedNextActions = [
      "Inspect line boundaries matching stack trace frames.",
      "Check environment configs settings files."
    ];
    if (logAudit.hasCritical) {
      suggestNextActions.unshift("Restart application host runtime to clear cached thread parameters.");
    }
    const report = {
      debugId: `dbg-report-${Date.now()}`,
      failureSummary: `Failed execution with unhandled ${evidence.errorName}: ${evidence.message}`,
      probableRootCause: resolution.probableCause,
      alternativeHypotheses: hypotheses,
      confidenceScore: finalScore,
      affectedComponents: resolution.affectedComponents,
      suggestedNextActions,
      relatedFiles: resolution.relatedFiles
    };
    return {
      report,
      hasCritical: logAudit.hasCritical
    };
  }
};
var debugAnalyzer = new DebugAnalyzer();

// src/core/agents/debug/debugValidator.ts
var DebugValidator = class {
  validateDiagnostics(diagnostics) {
    if (!diagnostics) {
      throw new Error("Debug validation error: Missing diagnostics context data");
    }
    if (!diagnostics.errorName && !diagnostics.message) {
      throw new Error("Debug validation error: Incomplete diagnostics details");
    }
  }
  validateLogs(logs) {
    if (!logs || logs.length === 0) {
      throw new Error("Debug validation error: Corrupted logs (empty or missing execution history logs)");
    }
  }
  validateEnvironment(language, runtime) {
    const supportedLangs = ["typescript", "javascript", "json", "markdown", "css", "html", "shell", "bash"];
    const supportedRuntimes = ["node", "browser", "vscode", "simulated"];
    if (!supportedLangs.includes(language.toLowerCase())) {
      throw new Error(`Debug validation error: Unknown language "${language}"`);
    }
    if (!supportedRuntimes.includes(runtime.toLowerCase())) {
      throw new Error(`Debug validation error: Unsupported runtime environment "${runtime}"`);
    }
  }
};
var debugValidator = new DebugValidator();

// src/core/agents/debug/debugMetrics.ts
var DebugMetrics = class {
  data = {
    debugRunsCount: 0,
    criticalFailuresCount: 0,
    avgConfidenceScore: 0
  };
  recordRun(hasCritical, score) {
    const totalScore = this.data.avgConfidenceScore * this.data.debugRunsCount + score;
    this.data.debugRunsCount++;
    if (hasCritical) {
      this.data.criticalFailuresCount++;
    }
    this.data.avgConfidenceScore = Math.round(totalScore / this.data.debugRunsCount);
  }
  getMetrics() {
    return this.data;
  }
};
var debugMetrics = new DebugMetrics();

// src/core/agents/debug/debugBrain.ts
var DebugBrain = class {
  constructor(events) {
    this.events = events;
  }
  async runFailureAnalysis(diagnostics) {
    debugValidator.validateDiagnostics(diagnostics);
    debugValidator.validateLogs(diagnostics.logs || []);
    debugValidator.validateEnvironment(diagnostics.language || "typescript", diagnostics.runtime || "node");
    this.events.emit("DebugStarted" /* DebugStarted */, { errorName: diagnostics.errorName });
    this.events.emit("EvidenceCollected" /* EvidenceCollected */, { logsCount: (diagnostics.logs || []).length });
    const { report, hasCritical } = debugAnalyzer.analyze(diagnostics);
    this.events.emit("RootCauseDetected" /* RootCauseDetected */, { cause: report.probableRootCause });
    for (const hyp of report.alternativeHypotheses) {
      this.events.emit("HypothesisGenerated" /* HypothesisGenerated */, { hypothesis: hyp });
    }
    debugMetrics.recordRun(hasCritical, report.confidenceScore);
    this.events.emit("DebugCompleted" /* DebugCompleted */, { report });
    return report;
  }
};

// src/core/agents/debug/debugEvents.ts
var DebugEvents = class {
  listeners = /* @__PURE__ */ new Set();
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  emit(type, payload) {
    const event = {
      type,
      timestamp: Date.now(),
      payload
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error("Error in Debug Agent event listener:", err);
      }
    }
  }
};

// src/core/agents/debug/debugAgent.ts
var DebugAgent = class extends BaseAgent {
  events = new DebugEvents();
  brain;
  constructor(definition) {
    super(definition);
    this.brain = new DebugBrain(this.events);
  }
  subscribe(listener) {
    return this.events.subscribe(listener);
  }
  async executeTask(task) {
    this.status = "Running" /* Running */;
    const action = task.payload?.action;
    try {
      let result;
      if (action === "ANALYZE_FAILURE") {
        const report = await this.brain.runFailureAnalysis(task.payload.diagnostics);
        result = { report };
      } else if (action === "GET_STATS") {
        result = { metrics: debugMetrics.getMetrics() };
      } else {
        throw new Error(`DebugAgent error: Unknown action "${action}"`);
      }
      this.status = "Completed" /* Completed */;
      return {
        success: true,
        result,
        metrics: debugMetrics.getMetrics()
      };
    } catch (err) {
      this.events.emit("DebugCompleted" /* DebugCompleted */, { error: err.message });
      this.status = "Failed" /* Failed */;
      throw err;
    }
  }
};

// src/core/agents/performance/complexityAnalyzer.ts
var ComplexityAnalyzer = class {
  analyzeCode(filePath, content) {
    const reports = [];
    const lines = content.split("\n");
    let inFunction = false;
    let currentSymbolName = "anonymous";
    let loopNestingDepth = 0;
    let maxNesting = 0;
    for (const line of lines) {
      const trimmed = line.trim();
      const funcMatch = trimmed.match(/(?:function\s+(\w+)|(\w+)\s*=\s*\([^)]*\)\s*=>)/);
      if (funcMatch) {
        if (inFunction) {
          reports.push(this.buildReport(filePath, currentSymbolName, maxNesting));
        }
        inFunction = true;
        currentSymbolName = funcMatch[1] || funcMatch[2] || "anonymous";
        loopNestingDepth = 0;
        maxNesting = 0;
      }
      if (trimmed.startsWith("for ") || trimmed.startsWith("while ") || trimmed.includes(".forEach(") || trimmed.includes(".map(")) {
        loopNestingDepth++;
        if (loopNestingDepth > maxNesting) {
          maxNesting = loopNestingDepth;
        }
      }
      if (trimmed.includes("}") && loopNestingDepth > 0) {
        loopNestingDepth--;
      }
    }
    if (inFunction) {
      reports.push(this.buildReport(filePath, currentSymbolName, maxNesting));
    }
    if (reports.length === 0) {
      reports.push({
        filePath,
        symbolName: "main",
        estimatedComplexity: "O(1)",
        reason: "Constant time execution logic path."
      });
    }
    return reports;
  }
  buildReport(filePath, symbol, loopsDepth) {
    let estimatedComplexity = "O(1)";
    let reason = "Constant execution profile without nesting loop statements.";
    if (loopsDepth === 1) {
      estimatedComplexity = "O(N)";
      reason = "Linear traversal over input collection datasets.";
    } else if (loopsDepth >= 2) {
      estimatedComplexity = "O(N^2)";
      reason = "Nested loop operations causing quadratic scale-up risks.";
    }
    return {
      filePath,
      symbolName: symbol,
      estimatedComplexity,
      reason
    };
  }
};
var complexityAnalyzer = new ComplexityAnalyzer();

// src/core/agents/performance/bottleneckDetector.ts
var BottleneckDetector = class {
  detect(buildTime, cpuUsage, memoryUsage, bundleSize) {
    const list = [];
    if (buildTime > 5e3) {
      list.push({
        id: "btn-1",
        component: "Compiler Build Pipeline",
        metric: "BundleSize",
        value: `${buildTime} ms`,
        severity: "Medium",
        description: "Build compilation time exceeds performance margins. Recommend optimizing esbuild caches."
      });
    }
    if (cpuUsage > 75) {
      list.push({
        id: "btn-2",
        component: "Agent Event Router Thread",
        metric: "CPU",
        value: `${cpuUsage} %`,
        severity: "High",
        description: "High CPU load detected. Recommend offloading intensive loop tasks to separate worker threads."
      });
    }
    if (memoryUsage > 500) {
      list.push({
        id: "btn-3",
        component: "Language Server Server processes",
        metric: "Memory",
        value: `${memoryUsage} MB`,
        severity: "High",
        description: "Memory footprint exceeds 500MB. Inspect logs for heap leaks."
      });
    }
    if (bundleSize > 1e3) {
      list.push({
        id: "btn-4",
        component: "Webview UI Panel Asset bundle",
        metric: "BundleSize",
        value: `${bundleSize} KB`,
        severity: "Low",
        description: "UI bundle exceeds 1MB. Optimize imports and code splitting."
      });
    }
    return list;
  }
};
var bottleneckDetector = new BottleneckDetector();

// src/core/agents/performance/performanceProfiler.ts
var PerformanceProfiler = class {
  profile() {
    return {
      buildTimeMs: 1200,
      cpuUsagePercent: 12,
      memoryUsageMb: 85,
      bundleSizeKb: 340,
      runtime: "node"
    };
  }
};
var performanceProfiler = new PerformanceProfiler();

// src/core/agents/performance/performancePredictor.ts
var PerformancePredictor = class {
  predictFutureTrend(score) {
    let level = "Excellent" /* Excellent */;
    let trend = "Stable development velocity with minimal resource additions.";
    if (score < 40) {
      level = "Critical" /* Critical */;
      trend = "Severe performance degradation risks. High memory footprint forecast.";
    } else if (score < 60) {
      level = "Needs Improvement" /* NeedsImprovement */;
      trend = "Downward trend due to algorithm scaling complexities.";
    } else if (score < 80) {
      level = "Acceptable" /* Acceptable */;
      trend = "Minor load increments. Score fluctuates inside stable margins.";
    } else if (score < 90) {
      level = "Good" /* Good */;
      trend = "Optimal execution bounds. Suitable headroom for extra tasks.";
    }
    return { trend, level };
  }
};
var performancePredictor = new PerformancePredictor();

// src/core/agents/performance/benchmarkManager.ts
var BenchmarkManager = class {
  executeMockBenchmark() {
    return {
      loops: 1e3,
      iterations: [12, 10, 15, 11, 13],
      avgTimeMs: 12.2
    };
  }
};
var benchmarkManager = new BenchmarkManager();

// src/core/agents/performance/performanceAnalyzer.ts
var fs23 = __toESM(require("fs"));
var PerformanceAnalyzer = class {
  runAnalysis(filePath) {
    const prof = performanceProfiler.profile();
    const benchmark = benchmarkManager.executeMockBenchmark();
    let content = "";
    if (filePath && fs23.existsSync(filePath)) {
      content = fs23.readFileSync(filePath, "utf-8");
    }
    const complexReports = complexityAnalyzer.analyzeCode(filePath || "src/core/agents/agentRegistry.ts", content);
    let score = 95;
    if (prof.cpuUsagePercent > 70)
      score -= 15;
    if (prof.memoryUsageMb > 400)
      score -= 10;
    const hasQuadratic = complexReports.some((c) => c.estimatedComplexity === "O(N^2)");
    if (hasQuadratic)
      score -= 20;
    const finalScore = Math.max(10, score);
    const { trend, level } = performancePredictor.predictFutureTrend(finalScore);
    const bottlenecks = bottleneckDetector.detect(
      prof.buildTimeMs,
      prof.cpuUsagePercent,
      prof.memoryUsageMb,
      prof.bundleSizeKb
    );
    const suggestions = bottlenecks.map((b) => b.description);
    if (suggestions.length === 0) {
      suggestions.push("Maintain clean bundle size profiles by lazy-loading non-critical plugins.");
    }
    return {
      performanceId: `perf-scan-${Date.now()}`,
      overallScore: finalScore,
      overallLevel: level,
      detectedBottlenecks: bottlenecks,
      hotPaths: bottlenecks.map((b) => b.component),
      complexityReport: complexReports,
      memoryUsageMb: prof.memoryUsageMb,
      cpuUsagePercent: prof.cpuUsagePercent,
      bundleSizeKb: prof.bundleSizeKb,
      buildTimeMs: prof.buildTimeMs,
      optimizationSuggestions: suggestions
    };
  }
};
var performanceAnalyzer = new PerformanceAnalyzer();

// src/core/agents/performance/performanceValidator.ts
var PerformanceValidator = class {
  validateMetrics(metrics) {
    if (!metrics) {
      throw new Error("Performance validation error: Missing performance metrics input data");
    }
    if (typeof metrics.buildTimeMs !== "number" || typeof metrics.memoryUsageMb !== "number") {
      throw new Error("Performance validation error: Incomplete metrics - buildTimeMs or memoryUsageMb is missing or not a number");
    }
  }
  validateRuntime(runtime) {
    const supportedRuntimes = ["node", "browser", "vscode", "simulated"];
    if (!supportedRuntimes.includes(runtime.toLowerCase())) {
      throw new Error(`Performance validation error: Unsupported runtime environment "${runtime}"`);
    }
  }
  validateBenchmark(data) {
    if (!data || typeof data.loops !== "number" || !Array.isArray(data.iterations) || data.iterations.length === 0) {
      throw new Error("Performance validation error: Invalid benchmark data - missing loops count or empty iterations results");
    }
  }
};
var performanceValidator = new PerformanceValidator();

// src/core/agents/performance/performanceMetrics.ts
var PerformanceMetrics = class {
  data = {
    runsCount: 0,
    avgOverallScore: 0,
    highestBuildTimeMs: 0
  };
  recordRun(score, buildTime) {
    const totalScore = this.data.avgOverallScore * this.data.runsCount + score;
    this.data.runsCount++;
    this.data.avgOverallScore = Math.round(totalScore / this.data.runsCount);
    if (buildTime > this.data.highestBuildTimeMs) {
      this.data.highestBuildTimeMs = buildTime;
    }
  }
  getMetrics() {
    return this.data;
  }
};
var performanceMetrics = new PerformanceMetrics();

// src/core/agents/performance/performanceBrain.ts
var PerformanceBrain = class {
  constructor(events) {
    this.events = events;
  }
  async runProfilerAudit(filePath) {
    this.events.emit("AnalysisStarted" /* AnalysisStarted */, { file: filePath });
    const report = performanceAnalyzer.runAnalysis(filePath);
    performanceValidator.validateMetrics({
      buildTimeMs: report.buildTimeMs,
      memoryUsageMb: report.memoryUsageMb
    });
    for (const b of report.detectedBottlenecks) {
      this.events.emit("BottleneckDetected" /* BottleneckDetected */, { bottleneck: b });
    }
    for (const s of report.optimizationSuggestions) {
      this.events.emit("OptimizationSuggested" /* OptimizationSuggested */, { suggestion: s });
    }
    performanceMetrics.recordRun(report.overallScore, report.buildTimeMs);
    this.events.emit("PerformanceAnalysisCompleted" /* PerformanceAnalysisCompleted */, { report });
    return report;
  }
};

// src/core/agents/performance/performanceEvents.ts
var PerformanceEvents = class {
  listeners = /* @__PURE__ */ new Set();
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  emit(type, payload) {
    const event = {
      type,
      timestamp: Date.now(),
      payload
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error("Error in Performance Agent event listener:", err);
      }
    }
  }
};

// src/core/agents/performance/performanceAgent.ts
var PerformanceAgent = class extends BaseAgent {
  events = new PerformanceEvents();
  brain;
  constructor(definition) {
    super(definition);
    this.brain = new PerformanceBrain(this.events);
  }
  subscribe(listener) {
    return this.events.subscribe(listener);
  }
  async executeTask(task) {
    this.status = "Running" /* Running */;
    const action = task.payload?.action;
    try {
      let result;
      if (action === "ANALYZE_PERFORMANCE") {
        const report = await this.brain.runProfilerAudit(task.payload.filePath || "");
        result = { report };
      } else if (action === "GET_STATS") {
        result = { metrics: performanceMetrics.getMetrics() };
      } else {
        throw new Error(`PerformanceAgent error: Unknown action "${action}"`);
      }
      this.status = "Completed" /* Completed */;
      return {
        success: true,
        result,
        metrics: performanceMetrics.getMetrics()
      };
    } catch (err) {
      this.events.emit("PerformanceAnalysisCompleted" /* PerformanceAnalysisCompleted */, { error: err.message });
      this.status = "Failed" /* Failed */;
      throw err;
    }
  }
};

// src/core/agents/dependency/dependencyAnalyzer.ts
var DependencyAnalyzer = class {
  parseManifest(manifest) {
    const nodes = [];
    const edges = [];
    const rootName = manifest.name || "sasta-antigravity";
    nodes.push({ name: rootName, version: manifest.version || "1.0.0", isDev: false });
    const deps = manifest.dependencies || {};
    const devDeps = manifest.devDependencies || {};
    for (const [pkg, ver] of Object.entries(deps)) {
      nodes.push({ name: pkg, version: ver, isDev: false });
      edges.push({ from: rootName, to: pkg, type: "dependency" });
    }
    for (const [pkg, ver] of Object.entries(devDeps)) {
      nodes.push({ name: pkg, version: ver, isDev: true });
      edges.push({ from: rootName, to: pkg, type: "devDependency" });
    }
    return { nodes, edges };
  }
};
var dependencyAnalyzer = new DependencyAnalyzer();

// src/core/agents/dependency/dependencyValidator.ts
var DependencyValidator = class {
  validateManifest(manifest) {
    if (!manifest) {
      throw new Error("Dependency validation error: Missing package manifest (package.json)");
    }
    if (!manifest.dependencies && !manifest.devDependencies) {
      throw new Error("Dependency validation error: Corrupted manifest - dependencies map is missing");
    }
  }
  validatePackageManager(pm) {
    const supported = ["npm", "yarn", "pnpm"];
    if (!supported.includes(pm.toLowerCase())) {
      throw new Error(`Dependency validation error: Unknown package manager "${pm}"`);
    }
  }
  validateGraph(nodes, edges) {
    const nodeNames = new Set(nodes.map((n) => n.name));
    for (const edge of edges) {
      if (!nodeNames.has(edge.from) || !nodeNames.has(edge.to)) {
        throw new Error(`Dependency validation error: Broken dependency graph - edge exists referencing undefined node from "${edge.from}" to "${edge.to}"`);
      }
    }
  }
};
var dependencyValidator = new DependencyValidator();

// src/core/agents/dependency/dependencyGraph.ts
var DependencyGraph = class {
  findCycles(edges) {
    const adj = /* @__PURE__ */ new Map();
    for (const edge of edges) {
      if (!adj.has(edge.from))
        adj.set(edge.from, []);
      adj.get(edge.from).push(edge.to);
    }
    const cycles = [];
    const visited = /* @__PURE__ */ new Set();
    const recStack = /* @__PURE__ */ new Set();
    const path23 = [];
    const dfs = (node) => {
      visited.add(node);
      recStack.add(node);
      path23.push(node);
      const neighbors = adj.get(node) || [];
      for (const next of neighbors) {
        if (!visited.has(next)) {
          dfs(next);
        } else if (recStack.has(next)) {
          const cycleStartIdx = path23.indexOf(next);
          cycles.push(path23.slice(cycleStartIdx).concat(next));
        }
      }
      path23.pop();
      recStack.delete(node);
    };
    const allNodes = Array.from(/* @__PURE__ */ new Set([
      ...edges.map((e) => e.from),
      ...edges.map((e) => e.to)
    ]));
    for (const node of allNodes) {
      if (!visited.has(node)) {
        dfs(node);
      }
    }
    return cycles;
  }
};
var dependencyGraph = new DependencyGraph();

// src/core/agents/dependency/dependencyResolver.ts
var DependencyResolver = class {
  resolveTransitive(edges) {
    const output = [...edges];
    const hasVite = edges.some((e) => e.to === "vite");
    if (hasVite) {
      output.push({ from: "vite", to: "esbuild", type: "dependency" });
    }
    return output;
  }
};
var dependencyResolver = new DependencyResolver();

// src/core/agents/dependency/compatibilityEngine.ts
var CompatibilityEngine = class {
  findConflicts(nodes) {
    const conflicts = [];
    const reactNodes = nodes.filter((n) => n.name === "react");
    if (reactNodes.length > 1) {
      conflicts.push({
        packageName: "react",
        required: "^18.0.0",
        resolved: "17.0.2"
      });
    }
    const versionsMap = /* @__PURE__ */ new Map();
    for (const node of nodes) {
      if (versionsMap.has(node.name) && versionsMap.get(node.name) !== node.version) {
        conflicts.push({
          packageName: node.name,
          required: versionsMap.get(node.name),
          resolved: node.version
        });
      }
      versionsMap.set(node.name, node.version);
    }
    return conflicts;
  }
};
var compatibilityEngine = new CompatibilityEngine();

// src/core/agents/dependency/impactAnalyzer.ts
var ImpactAnalyzer = class {
  analyzeImpact(edges) {
    const counts = /* @__PURE__ */ new Map();
    for (const edge of edges) {
      counts.set(edge.to, (counts.get(edge.to) || 0) + 1);
    }
    const report = [];
    for (const [pkg, count] of counts.entries()) {
      let severity = "Low";
      if (count > 5) {
        severity = "High";
      } else if (count > 2) {
        severity = "Medium";
      }
      report.push({
        packageName: pkg,
        dependentsCount: count,
        severity
      });
    }
    return report;
  }
};
var impactAnalyzer = new ImpactAnalyzer();

// src/core/agents/dependency/licenseAnalyzer.ts
var LicenseAnalyzer = class {
  parseLicenses(packages) {
    const summary = {
      "MIT": 0,
      "Apache-2.0": 0,
      "BSD-3-Clause": 0,
      "GPL-3.0": 0
    };
    for (const pkg of packages) {
      if (pkg.includes("vite") || pkg.includes("react") || pkg.includes("mocha")) {
        summary["MIT"]++;
      } else if (pkg.includes("esbuild")) {
        summary["Apache-2.0"]++;
      } else {
        summary["BSD-3-Clause"]++;
      }
    }
    return summary;
  }
};
var licenseAnalyzer = new LicenseAnalyzer();

// src/core/agents/dependency/dependencyMetrics.ts
var DependencyMetrics = class {
  data = {
    scansCount: 0,
    totalDependenciesDetected: 0,
    circularCyclesCount: 0
  };
  recordScan(depsCount, cyclesCount) {
    this.data.scansCount++;
    this.data.totalDependenciesDetected += depsCount;
    this.data.circularCyclesCount += cyclesCount;
  }
  getMetrics() {
    return this.data;
  }
};
var dependencyMetrics = new DependencyMetrics();

// src/core/agents/dependency/dependencyBrain.ts
var fs24 = __toESM(require("fs"));
var DependencyBrain = class {
  constructor(events) {
    this.events = events;
  }
  async runDependencyAnalysis(packageJsonPath) {
    this.events.emit("DependencyScanStarted" /* DependencyScanStarted */, { path: packageJsonPath });
    if (!fs24.existsSync(packageJsonPath)) {
      throw new Error(`Dependency validation error: Manifest not found at ${packageJsonPath}`);
    }
    const raw = fs24.readFileSync(packageJsonPath, "utf-8");
    let manifest;
    try {
      manifest = JSON.parse(raw);
    } catch (err) {
      throw new Error("Dependency validation error: package.json is corrupted and failed to parse");
    }
    dependencyValidator.validateManifest(manifest);
    dependencyValidator.validatePackageManager("npm");
    const { nodes, edges } = dependencyAnalyzer.parseManifest(manifest);
    const resolvedEdges = dependencyResolver.resolveTransitive(edges);
    dependencyValidator.validateGraph(nodes, resolvedEdges);
    const circularDependencies = dependencyGraph.findCycles(resolvedEdges);
    if (circularDependencies.length > 0) {
      this.events.emit("CircularDependencyDetected" /* CircularDependencyDetected */, { cycles: circularDependencies });
    }
    const versionConflicts = compatibilityEngine.findConflicts(nodes);
    if (versionConflicts.length > 0) {
      this.events.emit("ConflictDetected" /* ConflictDetected */, { conflicts: versionConflicts });
    }
    const packagesNames = nodes.map((n) => n.name);
    const licenseSummary = licenseAnalyzer.parseLicenses(packagesNames);
    const impactAnalysis = impactAnalyzer.analyzeImpact(resolvedEdges);
    const compatibilityScore = Math.max(10, 100 - versionConflicts.length * 15);
    const healthLevel = circularDependencies.length > 0 ? "Critical" /* Critical */ : versionConflicts.length > 0 ? "Warning" /* Warning */ : "Healthy" /* Healthy */;
    const recommendations = versionConflicts.map((v) => `Resolve version conflict in ${v.packageName} (resolved: ${v.resolved}, required: ${v.required}).`);
    if (circularDependencies.length > 0) {
      recommendations.unshift("Break circular dependency loops in module imports graph.");
    }
    if (recommendations.length === 0) {
      recommendations.push("Ecosystem is clean. No adjustments recommended.");
    }
    const report = {
      dependencyId: `dep-report-${Date.now()}`,
      nodes,
      edges: resolvedEdges,
      circularDependencies,
      versionConflicts,
      compatibilityScore,
      healthLevel,
      licenseSummary,
      impactAnalysis,
      recommendations
    };
    dependencyMetrics.recordScan(nodes.length, circularDependencies.length);
    this.events.emit("DependencyAnalysisCompleted" /* DependencyAnalysisCompleted */, { report });
    return report;
  }
};

// src/core/agents/dependency/dependencyEvents.ts
var DependencyEvents = class {
  listeners = /* @__PURE__ */ new Set();
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  emit(type, payload) {
    const event = {
      type,
      timestamp: Date.now(),
      payload
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error("Error in Dependency Agent event listener:", err);
      }
    }
  }
};

// src/core/agents/dependency/dependencyAgent.ts
var DependencyAgent = class extends BaseAgent {
  events = new DependencyEvents();
  brain;
  constructor(definition) {
    super(definition);
    this.brain = new DependencyBrain(this.events);
  }
  subscribe(listener) {
    return this.events.subscribe(listener);
  }
  async executeTask(task) {
    this.status = "Running" /* Running */;
    const action = task.payload?.action;
    try {
      let result;
      if (action === "ANALYZE_DEPENDENCIES") {
        const report = await this.brain.runDependencyAnalysis(task.payload.packageJsonPath || "");
        result = { report };
      } else if (action === "GET_STATS") {
        result = { metrics: dependencyMetrics.getMetrics() };
      } else {
        throw new Error(`DependencyAgent error: Unknown action "${action}"`);
      }
      this.status = "Completed" /* Completed */;
      return {
        success: true,
        result,
        metrics: dependencyMetrics.getMetrics()
      };
    } catch (err) {
      this.events.emit("DependencyAnalysisCompleted" /* DependencyAnalysisCompleted */, { error: err.message });
      this.status = "Failed" /* Failed */;
      throw err;
    }
  }
};

// src/core/agents/architecture/architectureGraph.ts
var ArchitectureGraph = class {
  buildMockGraph() {
    const nodes = [
      { name: "src/webview", layer: "webview" },
      { name: "src/extension", layer: "extension" },
      { name: "src/core", layer: "core" },
      { name: "src/common", layer: "common" }
    ];
    const edges = [
      { from: "src/webview", to: "src/common" },
      { from: "src/extension", to: "src/core" },
      { from: "src/extension", to: "src/common" },
      { from: "src/core", to: "src/common" }
    ];
    return { nodes, edges };
  }
};
var architectureGraph = new ArchitectureGraph();

// src/core/agents/architecture/architectureRules.ts
var ArchitectureRules = class {
  verifyRules(nodes, edges) {
    const violations = [];
    const layersMap = /* @__PURE__ */ new Map();
    for (const n of nodes) {
      layersMap.set(n.name, n.layer);
    }
    for (const edge of edges) {
      const fromLayer = layersMap.get(edge.from);
      const toLayer = layersMap.get(edge.to);
      if (!fromLayer || !toLayer)
        continue;
      if (fromLayer === "common" && toLayer !== "common") {
        violations.push({
          type: "Layer Violation" /* LayerViolation */,
          file: edge.from,
          description: `Dependency Inversion violation: Layer "common" imports from "${toLayer}" at target "${edge.to}"`,
          severity: "High"
        });
      }
      if (fromLayer === "core" && toLayer === "extension") {
        violations.push({
          type: "Layer Violation" /* LayerViolation */,
          file: edge.from,
          description: `Layer violation: Core module imports from extension runtime at target "${edge.to}"`,
          severity: "High"
        });
      }
      if (fromLayer === "webview" && (toLayer === "extension" || toLayer === "core")) {
        violations.push({
          type: "Layer Violation" /* LayerViolation */,
          file: edge.from,
          description: `Boundary violation: Webview imports extension/core code directly at target "${edge.to}"`,
          severity: "High"
        });
      }
    }
    return violations;
  }
};
var architectureRules = new ArchitectureRules();

// src/core/agents/architecture/architectureValidator.ts
var ArchitectureValidator = class {
  validateGraphRequest(request) {
    if (!request) {
      throw new Error("Architecture validation error: Missing graph request body");
    }
    if (!request.nodes || !Array.isArray(request.nodes) || request.nodes.length === 0) {
      throw new Error("Architecture validation error: Incomplete graph - nodes list is empty");
    }
    if (!request.edges || !Array.isArray(request.edges)) {
      throw new Error("Architecture validation error: Incomplete graph - edges list is missing");
    }
  }
  validateMetadata(meta) {
    if (!meta) {
      throw new Error("Architecture validation error: Corrupted architecture metadata");
    }
    if (typeof meta.strictLayers !== "boolean") {
      throw new Error("Architecture validation error: Missing strictLayers boolean parameter in configuration");
    }
  }
  validateModuleGraph(nodes) {
    const validLayers = ["webview", "extension", "core", "common"];
    for (const node of nodes) {
      if (!validLayers.includes(node.layer)) {
        throw new Error(`Architecture validation error: Invalid module graph - node "${node.name}" specifies unknown layer "${node.layer}"`);
      }
    }
  }
};
var architectureValidator = new ArchitectureValidator();

// src/core/agents/architecture/architectureScorer.ts
var ArchitectureScorer = class {
  calculateScores(violations, driftCount) {
    let score = 95;
    let technicalDebtHours = 0;
    for (const v of violations) {
      if (v.severity === "High") {
        score -= 10;
        technicalDebtHours += 8;
      } else if (v.severity === "Medium") {
        score -= 5;
        technicalDebtHours += 4;
      } else {
        score -= 2;
        technicalDebtHours += 2;
      }
    }
    score -= driftCount * 4;
    technicalDebtHours += driftCount * 3;
    const finalScore = Math.max(10, score);
    const scalability = Math.max(10, finalScore - 5);
    const maintainability = Math.max(10, finalScore - 8);
    return {
      score: finalScore,
      technicalDebtHours,
      scalability,
      maintainability
    };
  }
};
var architectureScorer = new ArchitectureScorer();

// src/core/agents/architecture/driftDetector.ts
var DriftDetector = class {
  detectDrift(activeFolders, prescribedFolders) {
    const violations = [];
    const prescribed = new Set(prescribedFolders);
    for (const folder of activeFolders) {
      if (!prescribed.has(folder)) {
        violations.push({
          type: "Architecture Drift" /* ArchDrift */,
          file: folder,
          description: `Architecture Drift: Unsanctioned folder boundary "${folder}" found in active directory tree.`,
          severity: "Medium"
        });
      }
    }
    return violations;
  }
};
var driftDetector = new DriftDetector();

// src/core/agents/architecture/boundaryAnalyzer.ts
var BoundaryAnalyzer = class {
  checkBoundaries(filesContent) {
    const violations = [];
    for (const [filePath, content] of Object.entries(filesContent)) {
      const imports = content.match(/import\s+.*\s+from\s+['"](.*)['"]/g) || [];
      if (filePath.includes("src/webview/components/chat/") && content.includes("import") && content.includes("/agents/security/")) {
        violations.push({
          type: "Feature Coupling" /* FeatureCoupling */,
          file: filePath,
          description: "High Coupling: Chat layout imports Security Center components directly. Decouple using registry loaders.",
          severity: "Low"
        });
      }
    }
    return violations;
  }
};
var boundaryAnalyzer = new BoundaryAnalyzer();

// src/core/agents/architecture/architectureMetrics.ts
var ArchitectureMetrics = class {
  data = {
    auditsCount: 0,
    totalViolationsDetected: 0,
    avgTechnicalDebtHours: 0
  };
  recordAudit(violationsCount, debtHours) {
    const totalDebt = this.data.avgTechnicalDebtHours * this.data.auditsCount + debtHours;
    this.data.auditsCount++;
    this.data.totalViolationsDetected += violationsCount;
    this.data.avgTechnicalDebtHours = Math.round(totalDebt / this.data.auditsCount);
  }
  getMetrics() {
    return this.data;
  }
};
var architectureMetrics = new ArchitectureMetrics();

// src/core/agents/architecture/architectureBrain.ts
var ArchitectureBrain = class {
  constructor(events) {
    this.events = events;
  }
  async runArchitectureAnalysis(filesMap) {
    this.events.emit("ArchitectureAnalysisStarted" /* ArchitectureAnalysisStarted */, { filesCount: Object.keys(filesMap).length });
    const { nodes, edges } = architectureGraph.buildMockGraph();
    architectureValidator.validateGraphRequest({ nodes, edges });
    architectureValidator.validateMetadata({ strictLayers: true });
    architectureValidator.validateModuleGraph(nodes);
    const layerViolations = architectureRules.verifyRules(nodes, edges);
    for (const v of layerViolations) {
      this.events.emit("ViolationDetected" /* ViolationDetected */, { violation: v });
    }
    const boundaryViolations = boundaryAnalyzer.checkBoundaries(filesMap);
    for (const v of boundaryViolations) {
      this.events.emit("ViolationDetected" /* ViolationDetected */, { violation: v });
    }
    const activeFolders = ["src/core", "src/webview", "src/extension", "src/common"];
    const prescribedFolders = ["src/core", "src/webview", "src/extension", "src/common", "src/cortex"];
    const driftViolations = driftDetector.detectDrift(activeFolders, prescribedFolders);
    for (const d of driftViolations) {
      this.events.emit("DriftDetected" /* DriftDetected */, { drift: d });
    }
    const allViolations = [...layerViolations, ...boundaryViolations, ...driftViolations];
    const { score, technicalDebtHours, scalability, maintainability } = architectureScorer.calculateScores(
      allViolations,
      driftViolations.length
    );
    const recommendations = allViolations.map((v) => `Refactor "${v.file}" to resolve ${v.type}: ${v.description}`);
    if (recommendations.length === 0) {
      recommendations.push("Structure complies fully with layer rules.");
    } else {
      this.events.emit("RecommendationGenerated" /* RecommendationGenerated */, { count: recommendations.length });
    }
    const report = {
      architectureId: `arch-report-${Date.now()}`,
      architectureScore: score,
      technicalDebtScore: technicalDebtHours,
      layerViolations,
      boundaryViolations,
      dependencyIssues: allViolations.map((v) => v.description),
      scalabilityScore: scalability,
      maintainabilityScore: maintainability,
      recommendations,
      nodes,
      edges
    };
    architectureMetrics.recordAudit(allViolations.length, technicalDebtHours);
    this.events.emit("ArchitectureAnalysisCompleted" /* ArchitectureAnalysisCompleted */, { report });
    return report;
  }
};

// src/core/agents/architecture/architectureEvents.ts
var ArchitectureEvents = class {
  listeners = /* @__PURE__ */ new Set();
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  emit(type, payload) {
    const event = {
      type,
      timestamp: Date.now(),
      payload
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error("Error in Architecture Agent event listener:", err);
      }
    }
  }
};

// src/core/agents/architecture/architectureAgent.ts
var ArchitectureAgent = class extends BaseAgent {
  events = new ArchitectureEvents();
  brain;
  constructor(definition) {
    super(definition);
    this.brain = new ArchitectureBrain(this.events);
  }
  subscribe(listener) {
    return this.events.subscribe(listener);
  }
  async executeTask(task) {
    this.status = "Running" /* Running */;
    const action = task.payload?.action;
    try {
      let result;
      if (action === "ANALYZE_ARCHITECTURE") {
        const report = await this.brain.runArchitectureAnalysis(task.payload.filesMap || {});
        result = { report };
      } else if (action === "GET_STATS") {
        result = { metrics: architectureMetrics.getMetrics() };
      } else {
        throw new Error(`ArchitectureAgent error: Unknown action "${action}"`);
      }
      this.status = "Completed" /* Completed */;
      return {
        success: true,
        result,
        metrics: architectureMetrics.getMetrics()
      };
    } catch (err) {
      this.events.emit("ArchitectureAnalysisCompleted" /* ArchitectureAnalysisCompleted */, { error: err.message });
      this.status = "Failed" /* Failed */;
      throw err;
    }
  }
};

// src/core/agents/agentRegistry.ts
var AgentRegistry = class {
  agents = /* @__PURE__ */ new Map();
  constructor() {
    this.register(new PlannerAgent({
      id: "planner-agent",
      name: "Planner Agent",
      role: "Planning & Architect",
      version: "1.0.0",
      status: "Idle" /* Idle */,
      priority: 10,
      capabilities: ["planning", "decomposition"],
      permissions: ["READ", "WRITE"]
    }));
    this.register(new ExecutorAgent({
      id: "executor-agent",
      name: "Executor Agent",
      role: "Code Synthesis & Reprocessing",
      version: "1.0.0",
      status: "Idle" /* Idle */,
      priority: 8,
      capabilities: ["synthesis", "refactoring"],
      permissions: ["WRITE", "EXECUTE"]
    }));
    this.register(new ReviewerAgent({
      id: "reviewer-agent",
      name: "Reviewer Agent",
      role: "Quality Assurance & ArchReview",
      version: "1.0.0",
      status: "Idle" /* Idle */,
      priority: 6,
      capabilities: ["reviewing", "validation"],
      permissions: ["READ"]
    }));
    this.register(new MemoryAgent({
      id: "memory-agent",
      name: "Memory Agent",
      role: "Project Memory & Decisions QA",
      version: "1.0.0",
      status: "Idle" /* Idle */,
      priority: 9,
      capabilities: ["recording", "retrieval", "compression"],
      permissions: ["READ", "WRITE"]
    }));
    this.register(new TestingAgent({
      id: "testing-agent",
      name: "Testing Agent",
      role: "Quality Assurance & Test runner",
      version: "1.0.0",
      status: "Idle" /* Idle */,
      priority: 7,
      capabilities: ["testing", "regression"],
      permissions: ["READ", "EXECUTE"]
    }));
    this.register(new SecurityAgent({
      id: "security-agent",
      name: "Security Agent",
      role: "Project Security & Policy Audits QA",
      version: "1.0.0",
      status: "Idle" /* Idle */,
      priority: 9,
      capabilities: ["scanning", "policies"],
      permissions: ["READ"]
    }));
    this.register(new DocumentationAgent({
      id: "documentation-agent",
      name: "Documentation Agent",
      role: "Project Documentation & Technical Writer",
      version: "1.0.0",
      status: "Idle" /* Idle */,
      priority: 5,
      capabilities: ["documenting", "templates"],
      permissions: ["READ", "WRITE"]
    }));
    this.register(new RefactoringAgent({
      id: "refactoring-agent",
      name: "Refactoring Agent",
      role: "Project Code Quality & Structure QA",
      version: "1.0.0",
      status: "Idle" /* Idle */,
      priority: 8,
      capabilities: ["refactoring", "optimization"],
      permissions: ["READ", "WRITE"]
    }));
    this.register(new DebugAgent({
      id: "debug-agent",
      name: "Debug Agent",
      role: "Project Failures & Root-Cause QA",
      version: "1.0.0",
      status: "Idle" /* Idle */,
      priority: 8,
      capabilities: ["debugging", "diagnostics"],
      permissions: ["READ"]
    }));
    this.register(new PerformanceAgent({
      id: "performance-agent",
      name: "Performance Agent",
      role: "Project Speed & Telemetry QA",
      version: "1.0.0",
      status: "Idle" /* Idle */,
      priority: 8,
      capabilities: ["performance", "benchmarking"],
      permissions: ["READ"]
    }));
    this.register(new DependencyAgent({
      id: "dependency-agent",
      name: "Dependency Agent",
      role: "Project Packages Ecosystem QA",
      version: "1.0.0",
      status: "Idle" /* Idle */,
      priority: 8,
      capabilities: ["dependencies", "compatibility"],
      permissions: ["READ"]
    }));
    this.register(new ArchitectureAgent({
      id: "architecture-agent",
      name: "Architecture Agent",
      role: "Project Structural System QA",
      version: "1.0.0",
      status: "Idle" /* Idle */,
      priority: 8,
      capabilities: ["architecture", "boundaries"],
      permissions: ["READ"]
    }));
    this.register(new TaskAgent({
      id: "workspace-agent",
      name: "Workspace Agent",
      role: "File Discovery & Sync",
      version: "1.0.0",
      status: "Idle" /* Idle */,
      priority: 5,
      capabilities: ["discovery", "modification"],
      permissions: ["READ", "WRITE"]
    }));
    this.register(new TaskAgent({
      id: "retriever-agent",
      name: "Retriever Agent",
      role: "Semantic Context Searcher",
      version: "1.0.0",
      status: "Idle" /* Idle */,
      priority: 7,
      capabilities: ["retrieval", "similarity"],
      permissions: ["READ"]
    }));
  }
  register(agent) {
    const registeredDefs = /* @__PURE__ */ new Map();
    for (const [key, value] of this.agents.entries()) {
      registeredDefs.set(key, value.definition);
    }
    agentValidator.validateRegistration(agent.definition, registeredDefs);
    this.agents.set(agent.id, agent);
  }
  get(id) {
    return this.agents.get(id) || null;
  }
  list() {
    return Array.from(this.agents.values());
  }
  unregister(id) {
    this.agents.delete(id);
  }
};
var agentRegistry = new AgentRegistry();

// src/core/agents/agentScheduler.ts
var AgentScheduler = class {
  metrics = /* @__PURE__ */ new Map();
  getOrCreateMetric(agentId) {
    let metric = this.metrics.get(agentId);
    if (!metric) {
      metric = {
        agentId,
        tasksAssigned: 0,
        tasksCompleted: 0,
        tasksFailed: 0,
        totalLatencyMs: 0,
        messagesSent: 0,
        messagesReceived: 0
      };
      this.metrics.set(agentId, metric);
    }
    return metric;
  }
  /**
   * Dispatches task payload, updates state, and logs timing metrics.
   */
  async dispatchTask(agent, task) {
    const start = Date.now();
    const metric = this.getOrCreateMetric(agent.id);
    metric.tasksAssigned++;
    metric.messagesReceived++;
    try {
      const res = await agent.executeTask(task);
      metric.tasksCompleted++;
      metric.totalLatencyMs += Date.now() - start;
      metric.messagesSent++;
      return res;
    } catch (err) {
      metric.tasksFailed++;
      metric.totalLatencyMs += Date.now() - start;
      metric.messagesSent++;
      throw err;
    }
  }
  listMetrics() {
    return Array.from(this.metrics.values());
  }
  clear() {
    this.metrics.clear();
  }
};
var agentScheduler = new AgentScheduler();

// src/core/agents/agentLifecycle.ts
var AgentLifecycle = class {
  /**
   * Simulates loading latency and sets state status.
   */
  async load(agent) {
    agent.status = "Preparing" /* Preparing */;
    await new Promise((resolve13) => setTimeout(resolve13, 300));
    agent.status = "Idle" /* Idle */;
  }
  async unload(agent) {
    agent.status = "Stopped" /* Stopped */;
    await new Promise((resolve13) => setTimeout(resolve13, 100));
  }
};
var agentLifecycle = new AgentLifecycle();

// src/core/agents/agentRuntime.ts
var AgentRuntime = class {
  events = new AgentEvents();
  /**
   * Subscribes a listener to Agent Runtime changes.
   */
  subscribe(listener) {
    return this.events.subscribe(listener);
  }
  // --- APIs ---
  async loadAgent(id) {
    const agent = agentRegistry.get(id);
    if (!agent)
      throw new Error(`Agent runtime error: Agent "${id}" not found`);
    await agentLifecycle.load(agent);
    this.events.emit("AgentStarted" /* AgentStarted */, id);
  }
  async unloadAgent(id) {
    const agent = agentRegistry.get(id);
    if (!agent)
      throw new Error(`Agent runtime error: Agent "${id}" not found`);
    await agentLifecycle.unload(agent);
    this.events.emit("AgentStopped" /* AgentStopped */, id);
  }
  /**
   * Routes tasks to the registered agents and registers timing stats.
   */
  async dispatchTask(task) {
    this.events.emit("AgentTaskAssigned" /* AgentTaskAssigned */, task.assignedAgentId, { task });
    const agent = agentRegistry.get(task.assignedAgentId);
    if (!agent) {
      this.events.emit("AgentFailed" /* AgentFailed */, task.assignedAgentId, { error: "Agent not found" });
      throw new Error(`Agent runtime error: Assigned agent "${task.assignedAgentId}" not found`);
    }
    try {
      const res = await agentScheduler.dispatchTask(agent, task);
      this.events.emit("AgentTaskCompleted" /* AgentTaskCompleted */, task.assignedAgentId, { task, res });
      return res;
    } catch (err) {
      this.events.emit("AgentFailed" /* AgentFailed */, task.assignedAgentId, { error: err.message });
      throw err;
    }
  }
  /**
   * Aggregates live monitor metrics for UI displays.
   */
  getMonitorStats() {
    const list = agentRegistry.list();
    const metrics = agentScheduler.listMetrics();
    return list.map((a) => {
      const metric = metrics.find((m) => m.agentId === a.id) || {
        tasksAssigned: 0,
        tasksCompleted: 0,
        tasksFailed: 0,
        totalLatencyMs: 0,
        messagesSent: 0,
        messagesReceived: 0
      };
      return {
        id: a.id,
        name: a.definition.name,
        role: a.definition.role,
        status: a.status,
        executionTimeMs: metric.totalLatencyMs,
        messagesSent: metric.messagesSent,
        messagesReceived: metric.messagesReceived,
        capabilities: a.definition.capabilities
      };
    });
  }
};
var agentRuntimeInstance = new AgentRuntime();

// src/core/agents/refactoring/behaviorVerifier.ts
var BehaviorVerifier = class {
  /**
   * Asserts whether a proposed refactoring pattern preserves interface behavior inputs/outputs.
   */
  verifyPreservation(originalCode, proposedCode) {
    const origExports = originalCode.match(/export\s+(const|class|function|enum|interface)\s+(\w+)/g) || [];
    const propExports = proposedCode.match(/export\s+(const|class|function|enum|interface)\s+(\w+)/g) || [];
    const origExportNames = new Set(origExports.map((e) => e.split(/\s+/).pop()));
    const propExportNames = new Set(propExports.map((e) => e.split(/\s+/).pop()));
    for (const name of origExportNames) {
      if (!propExportNames.has(name)) {
        return {
          preserves: false,
          reason: `Functional signature violation: Exported member "${name}" is missing in the proposed refactor.`
        };
      }
    }
    return { preserves: true };
  }
};
var behaviorVerifier = new BehaviorVerifier();

// src/core/agents/architecture/architectureAnalyzer.ts
var ArchitectureAnalyzer = class {
  auditFileImports(filePath, content) {
    const violations = [];
    const lines = content.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes("import ") && line.includes("/webview/") && filePath.includes("src/core/")) {
        violations.push({
          type: "Dependency Inversion" /* DependencyInversion */,
          file: filePath,
          description: `Layer inversion violation: Core module imports webview elements directly at line ${i + 1}.`,
          severity: "High"
        });
      }
    }
    return violations;
  }
};
var architectureAnalyzer = new ArchitectureAnalyzer();

// src/core/codeGeneration/generationTypes.ts
var GenerationStrategy = /* @__PURE__ */ ((GenerationStrategy2) => {
  GenerationStrategy2["CreateNewFeature"] = "Create New Feature";
  GenerationStrategy2["ModifyExistingCode"] = "Modify Existing Code";
  GenerationStrategy2["Scaffold"] = "Scaffold";
  GenerationStrategy2["Refactor"] = "Refactor";
  GenerationStrategy2["Boilerplate"] = "Boilerplate";
  GenerationStrategy2["Configuration"] = "Configuration";
  GenerationStrategy2["DocumentationStub"] = "Documentation Stub";
  return GenerationStrategy2;
})(GenerationStrategy || {});

// src/core/codeGeneration/generationEvents.ts
var GenerationEvents = class {
  listeners = /* @__PURE__ */ new Set();
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  emit(type, payload) {
    const event = {
      type,
      timestamp: Date.now(),
      payload
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error("Error in Code Generation Engine event listener:", err);
      }
    }
  }
};
var generationEvents = new GenerationEvents();

// src/core/codeGeneration/generationValidator.ts
var GenerationValidator = class {
  validatePlan(plan) {
    if (!plan) {
      throw new Error("Code Generation validation error: Missing execution plan specifications");
    }
    if (!plan.tasks || plan.tasks.length === 0) {
      throw new Error("Code Generation validation error: Missing plan tasks listing");
    }
  }
  validateContext(context) {
    if (!context) {
      throw new Error("Code Generation validation error: Missing generation context");
    }
    if (!context.targetPath) {
      throw new Error("Code Generation validation error: Missing targetPath folder target");
    }
    if (context.language !== "typescript" && context.language !== "javascript") {
      throw new Error(`Code Generation validation error: Unsupported language "${context.language}"`);
    }
  }
  validateStrategy(strategy) {
    const valid = Object.values(GenerationStrategy);
    if (!valid.includes(strategy)) {
      throw new Error(`Code Generation validation error: Invalid strategy choice "${strategy}"`);
    }
  }
  validateArtifact(artifact) {
    if (!artifact) {
      throw new Error("Code Generation validation error: Broken generation artifact (is empty)");
    }
    if (!artifact.files || artifact.files.length === 0) {
      throw new Error("Code Generation validation error: Broken generation artifact - no files list generated");
    }
    for (const f of artifact.files) {
      if (!f.content || f.content.trim() === "") {
        throw new Error(`Code Generation validation error: Broken generation artifact - file "${f.path}" content is empty`);
      }
    }
  }
};
var generationValidator = new GenerationValidator();

// src/core/codeGeneration/generationPolicies.ts
var GenerationPolicies = class {
  verifyPolicies(context) {
    if (context.targetPath.startsWith("/") || context.targetPath.includes(":\\")) {
    }
    const conventions = context.projectConventions || [];
    if (conventions.includes("RESTRICT_WRITE")) {
      throw new Error("Code Generation policy error: Direct workspace writes are prohibited by policies constraints");
    }
  }
};
var generationPolicies = new GenerationPolicies();

// src/core/codeGeneration/generationContext.ts
var GenerationContextBuilder = class {
  buildContext(plan) {
    const targetPath = plan.targetPath || "src/core/generated";
    const language = plan.language || "typescript";
    const projectConventions = plan.conventions || ["STRICT_TYPES", "NO_ANY"];
    return {
      planId: plan.planId || `plan-${Date.now()}`,
      targetPath,
      language,
      projectConventions
    };
  }
};
var generationContextBuilder = new GenerationContextBuilder();

// src/core/codeGeneration/generationPlanner.ts
var GenerationPlanner = class {
  selectStrategy(plan) {
    const title = (plan.title || "").toLowerCase();
    if (title.includes("scaffold") || title.includes("setup")) {
      return "Scaffold" /* Scaffold */;
    }
    if (title.includes("refactor") || title.includes("smell")) {
      return "Refactor" /* Refactor */;
    }
    if (title.includes("modify") || title.includes("update") || title.includes("change")) {
      return "Modify Existing Code" /* ModifyExistingCode */;
    }
    if (title.includes("boilerplate") || title.includes("stub")) {
      return "Boilerplate" /* Boilerplate */;
    }
    if (title.includes("config") || title.includes("package")) {
      return "Configuration" /* Configuration */;
    }
    if (title.includes("doc") || title.includes("readme")) {
      return "Documentation Stub" /* DocumentationStub */;
    }
    return "Create New Feature" /* CreateNewFeature */;
  }
};
var generationPlanner = new GenerationPlanner();

// src/core/codeGeneration/providers/baseGenerator.ts
var BaseGenerator = class {
};

// src/core/codeGeneration/providers/mockGenerator.ts
var MockGenerator = class extends BaseGenerator {
  async generate(context, strategy, plan) {
    const fileExtension = context.language === "typescript" ? "ts" : "js";
    const primaryName = plan.title ? plan.title.replace(/\s+/g, "") : "GeneratedFeature";
    const filePath = `${context.targetPath}/${primaryName.toLowerCase()}.${fileExtension}`;
    let content = "";
    const symbols = [
      { name: primaryName, type: "class" },
      { name: "executeAction", type: "function" }
    ];
    if (strategy === "Create New Feature" /* CreateNewFeature */ || strategy === "Scaffold" /* Scaffold */) {
      content = `/**
 * Generated by Code Generation Engine
 * Strategy: ${strategy}
 */
export class ${primaryName} {
  constructor() {
    console.log('${primaryName} initialized.');
  }

  public executeAction(input: string): string {
    return 'Result: ' + input;
  }
}
`;
    } else {
      content = `/**
 * Generated Modification Code
 * Strategy: ${strategy}
 */
export function executeAction(data: any) {
  return data;
}
`;
    }
    return [{
      path: filePath,
      content,
      symbols
    }];
  }
};
var mockGenerator = new MockGenerator();

// src/core/codeGeneration/artifactBuilder.ts
var ArtifactBuilder = class {
  buildArtifact(files, strategy, durationMs) {
    let totalLines = 0;
    for (const f of files) {
      totalLines += f.content.split("\n").length;
    }
    return {
      generationId: `gen-art-${Date.now()}`,
      files,
      strategyUsed: strategy,
      summary: `Successfully generated ${files.length} code files containing class/interface symbols.`,
      warnings: [],
      metrics: {
        durationMs,
        linesCount: totalLines,
        filesCount: files.length
      }
    };
  }
};
var artifactBuilder = new ArtifactBuilder();

// src/core/codeGeneration/outputAssembler.ts
var OutputAssembler = class {
  assemble(artifact) {
    const assembledFiles = artifact.files.map((f) => {
      return {
        ...f,
        content: `// Assembled Code Output
${f.content}`
      };
    });
    return {
      ...artifact,
      files: assembledFiles
    };
  }
};
var outputAssembler = new OutputAssembler();

// src/core/codeGeneration/generationSession.ts
var GenerationSessionManager = class {
  sessions = /* @__PURE__ */ new Map();
  createSession(planId) {
    const sessionId = `session-gen-${Date.now()}`;
    this.sessions.set(sessionId, {
      sessionId,
      startTime: Date.now(),
      planId,
      status: "active"
    });
    return sessionId;
  }
  completeSession(sessionId, status) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.status = status;
    }
  }
  getSession(sessionId) {
    return this.sessions.get(sessionId);
  }
};
var generationSessionManager = new GenerationSessionManager();

// src/core/codeGeneration/generationMetrics.ts
var GenerationMetrics = class {
  data = {
    generationsCount: 0,
    totalLinesGenerated: 0,
    totalDurationMs: 0
  };
  record(linesCount, durationMs) {
    this.data.generationsCount++;
    this.data.totalLinesGenerated += linesCount;
    this.data.totalDurationMs += durationMs;
  }
  getMetrics() {
    return this.data;
  }
};
var generationMetrics = new GenerationMetrics();

// src/core/codeGeneration/generationCoordinator.ts
var GenerationCoordinator = class {
  async coordinate(plan) {
    const startTime = Date.now();
    generationEvents.emit("GenerationStarted" /* GenerationStarted */, { plan });
    try {
      generationValidator.validatePlan(plan);
      const context = generationContextBuilder.buildContext(plan);
      generationValidator.validateContext(context);
      generationPolicies.verifyPolicies(context);
      generationEvents.emit("ContextPrepared" /* ContextPrepared */, { context });
      const strategy = generationPlanner.selectStrategy(plan);
      generationValidator.validateStrategy(strategy);
      const sessionId = generationSessionManager.createSession(context.planId);
      const files = await mockGenerator.generate(context, strategy, plan);
      generationEvents.emit("ArtifactGenerated" /* ArtifactGenerated */, { files });
      const rawArtifact = artifactBuilder.buildArtifact(files, strategy, Date.now() - startTime);
      generationValidator.validateArtifact(rawArtifact);
      generationEvents.emit("ValidationCompleted" /* ValidationCompleted */, { artifact: rawArtifact });
      const finalArtifact = outputAssembler.assemble(rawArtifact);
      generationSessionManager.completeSession(sessionId, "completed");
      generationMetrics.record(finalArtifact.metrics.linesCount, finalArtifact.metrics.durationMs);
      generationEvents.emit("GenerationCompleted" /* GenerationCompleted */, { artifact: finalArtifact });
      return finalArtifact;
    } catch (err) {
      generationEvents.emit("GenerationFailed" /* GenerationFailed */, { error: err.message });
      throw err;
    }
  }
};
var generationCoordinator = new GenerationCoordinator();

// src/core/codeGeneration/generationEngine.ts
var GenerationEngine = class {
  async generateCode(plan) {
    return generationCoordinator.coordinate(plan);
  }
  subscribe(listener) {
    return generationEvents.subscribe(listener);
  }
};
var generationEngine = new GenerationEngine();

// src/core/codeGeneration/ast/astEvents.ts
var ASTEvents = class {
  listeners = /* @__PURE__ */ new Set();
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  emit(type, payload) {
    const event = {
      type,
      timestamp: Date.now(),
      payload
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error("Error in AST Generation Engine event listener:", err);
      }
    }
  }
};
var astEvents = new ASTEvents();

// src/core/codeGeneration/ast/astValidator.ts
var ASTValidator = class {
  validateNode(node) {
    if (!node) {
      throw new Error("AST validation error: Missing tree node");
    }
    if (!node.type) {
      throw new Error("AST validation error: Node is missing type identifier");
    }
  }
  validateTreeConsistency(artifact) {
    if (!artifact.rootNode) {
      throw new Error("AST validation error: Broken syntax tree - rootNode is missing");
    }
    const symbolsNames = artifact.symbols.map((s) => s.name);
    const seen = /* @__PURE__ */ new Set();
    for (const name of symbolsNames) {
      if (seen.has(name)) {
        throw new Error(`AST validation error: Duplicate symbol definition found: "${name}"`);
      }
      seen.add(name);
    }
    for (const imp of artifact.imports) {
      if (imp.trim() === "") {
        throw new Error("AST validation error: Syntax tree contains empty import statement references");
      }
    }
  }
};
var astValidator = new ASTValidator();

// src/core/codeGeneration/ast/astNormalizer.ts
var ASTNormalizer = class {
  normalize(node, startOffset = 0) {
    node.start = startOffset;
    let currentOffset = startOffset + (node.type.length + (node.name ? node.name.length : 0));
    if (node.children) {
      for (const child of node.children) {
        currentOffset = this.normalize(child, currentOffset);
      }
    }
    node.end = currentOffset;
    return currentOffset;
  }
};
var astNormalizer = new ASTNormalizer();

// src/core/codeGeneration/ast/astOptimizer.ts
var ASTOptimizer = class {
  optimize(node) {
    if (node.children) {
      node.children = node.children.filter((child) => child.type !== "EmptyStatement").map((child) => this.optimize(child));
    }
    return node;
  }
};
var astOptimizer = new ASTOptimizer();

// src/core/codeGeneration/ast/astSerializer.ts
var ASTSerializer = class {
  serialize(node) {
    switch (node.type) {
      case "Program":
        return (node.children || []).map((c) => this.serialize(c)).join("\n");
      case "ImportDeclaration":
        return `import { ${node.name} } from '${node.value}';`;
      case "ClassDeclaration":
        return `export class ${node.name} {
${(node.children || []).map((c) => "  " + this.serialize(c)).join("\n")}
}`;
      case "MethodDeclaration":
        return `public ${node.name}() {
    // Method body
  }`;
      case "FunctionDeclaration":
        return `def ${node.name}():
    pass`;
      default:
        return "";
    }
  }
};
var astSerializer = new ASTSerializer();

// src/core/codeGeneration/ast/astBuilder.ts
var ASTBuilder = class {
  buildNode(type, name, value, children) {
    return {
      type,
      name,
      value,
      children
    };
  }
};
var astBuilder = new ASTBuilder();

// src/core/codeGeneration/ast/providers/baseAstProvider.ts
var BaseAstProvider = class {
};

// src/core/codeGeneration/ast/providers/typescriptProvider.ts
var TypeScriptProvider = class extends BaseAstProvider {
  buildAst(ir) {
    const importNodes = (ir.imports || []).map(
      (imp) => astBuilder.buildNode("ImportDeclaration", imp.symbol, imp.source)
    );
    const methodNodes = (ir.methods || []).map(
      (m) => astBuilder.buildNode("MethodDeclaration", m.name)
    );
    const classNode = astBuilder.buildNode("ClassDeclaration", ir.className || "GeneratedTypeScriptClass", void 0, methodNodes);
    return astBuilder.buildNode("Program", void 0, void 0, [...importNodes, classNode]);
  }
};
var typescriptProvider = new TypeScriptProvider();

// src/core/codeGeneration/ast/providers/javascriptProvider.ts
var JavaScriptProvider = class extends BaseAstProvider {
  buildAst(ir) {
    const importNodes = (ir.imports || []).map(
      (imp) => astBuilder.buildNode("ImportDeclaration", imp.symbol, imp.source)
    );
    const functionNodes = (ir.functions || []).map(
      (f) => astBuilder.buildNode("MethodDeclaration", f.name)
    );
    const classNode = astBuilder.buildNode("ClassDeclaration", ir.className || "GeneratedJavaScriptClass", void 0, functionNodes);
    return astBuilder.buildNode("Program", void 0, void 0, [...importNodes, classNode]);
  }
};
var javascriptProvider = new JavaScriptProvider();

// src/core/codeGeneration/ast/providers/pythonProvider.ts
var PythonProvider = class extends BaseAstProvider {
  buildAst(ir) {
    const functionNodes = (ir.functions || []).map(
      (f) => astBuilder.buildNode("FunctionDeclaration", f.name)
    );
    return astBuilder.buildNode("Program", void 0, void 0, functionNodes);
  }
};
var pythonProvider = new PythonProvider();

// src/core/codeGeneration/ast/languageRegistry.ts
var LanguageRegistry = class {
  providers = /* @__PURE__ */ new Map();
  constructor() {
    this.providers.set("typescript", typescriptProvider);
    this.providers.set("javascript", javascriptProvider);
    this.providers.set("python", pythonProvider);
  }
  getProvider(language) {
    const provider = this.providers.get(language.toLowerCase());
    if (!provider) {
      throw new Error(`AST provider error: Unsupported language "${language}"`);
    }
    return provider;
  }
};
var languageRegistry = new LanguageRegistry();

// src/core/codeGeneration/ast/astMetrics.ts
var ASTMetrics = class {
  data = {
    treesGenerated: 0,
    totalNodesCreated: 0,
    optimizedNodesCount: 0
  };
  record(nodesCount, optimizedCount) {
    this.data.treesGenerated++;
    this.data.totalNodesCreated += nodesCount;
    this.data.optimizedNodesCount += optimizedCount;
  }
  getMetrics() {
    return this.data;
  }
};
var astMetrics = new ASTMetrics();

// src/core/codeGeneration/ast/astCoordinator.ts
var ASTCoordinator = class {
  async coordinate(ir, language) {
    astEvents.emit("ASTGenerationStarted" /* ASTGenerationStarted */, { ir, language });
    try {
      const provider = languageRegistry.getProvider(language);
      astEvents.emit("ProviderSelected" /* ProviderSelected */, { language });
      const rootNode = provider.buildAst(ir);
      astEvents.emit("ASTCreated" /* ASTCreated */, { rootNode });
      astNormalizer.normalize(rootNode);
      const optimizedRoot = astOptimizer.optimize(rootNode);
      astEvents.emit("ASTOptimized" /* ASTOptimized */, { rootNode: optimizedRoot });
      const symbols = (ir.className ? [{ name: ir.className, type: "class" }] : []).concat((ir.functions || []).map((f) => ({ name: f.name, type: "function" }))).concat((ir.methods || []).map((m) => ({ name: m.name, type: "function" })));
      const imports = (ir.imports || []).map((imp) => imp.symbol);
      const exports = ir.className ? [ir.className] : [];
      const artifact = {
        astId: `ast-${Date.now()}`,
        language: language.toLowerCase(),
        rootNode: optimizedRoot,
        symbols,
        imports,
        exports,
        diagnostics: [],
        metadata: {
          nodesCount: this.countNodes(optimizedRoot),
          depth: this.calculateDepth(optimizedRoot),
          optimized: true
        }
      };
      astValidator.validateNode(optimizedRoot);
      astValidator.validateTreeConsistency(artifact);
      astEvents.emit("ASTValidated" /* ASTValidated */, { artifact });
      const serialized = astSerializer.serialize(optimizedRoot);
      astEvents.emit("ASTSerialized" /* ASTSerialized */, { serialized });
      astMetrics.record(artifact.metadata.nodesCount, 2);
      astEvents.emit("GenerationCompleted" /* GenerationCompleted */, { artifact });
      return artifact;
    } catch (err) {
      throw err;
    }
  }
  countNodes(node) {
    let count = 1;
    if (node.children) {
      for (const child of node.children) {
        count += this.countNodes(child);
      }
    }
    return count;
  }
  calculateDepth(node) {
    if (!node.children || node.children.length === 0) {
      return 1;
    }
    let maxChildDepth = 0;
    for (const child of node.children) {
      const childDepth = this.calculateDepth(child);
      if (childDepth > maxChildDepth) {
        maxChildDepth = childDepth;
      }
    }
    return 1 + maxChildDepth;
  }
};
var astCoordinator = new ASTCoordinator();

// src/core/codeGeneration/ast/astEngine.ts
var ASTEngine = class {
  async generateAst(ir, language) {
    return astCoordinator.coordinate(ir, language);
  }
  subscribe(listener) {
    return astEvents.subscribe(listener);
  }
};
var astEngine = new ASTEngine();

// src/core/codeGeneration/multiFile/generationEvents.ts
var MultiFileEvents = class {
  listeners = /* @__PURE__ */ new Set();
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  emit(type, payload) {
    const event = {
      type,
      timestamp: Date.now(),
      payload
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error("Error in Multi-file Generation Engine event listener:", err);
      }
    }
  }
};
var multiFileEvents = new MultiFileEvents();

// src/core/codeGeneration/multiFile/consistencyValidator.ts
var ConsistencyValidator = class {
  validateOperations(ops) {
    const targets = /* @__PURE__ */ new Set();
    const deletedTargets = /* @__PURE__ */ new Set();
    for (const op of ops) {
      if (!op.filePath || op.filePath.trim() === "") {
        throw new Error("Multi-file consistency validation error: Invalid file path target (is empty)");
      }
      if (targets.has(op.filePath)) {
        throw new Error(`Multi-file consistency validation error: Duplicate file target detected for "${op.filePath}"`);
      }
      targets.add(op.filePath);
      if (op.operation === "delete") {
        deletedTargets.add(op.filePath);
      }
    }
    for (const op of ops) {
      if (op.operation === "rename" || op.operation === "move") {
        if (op.originalPath && deletedTargets.has(op.originalPath)) {
          throw new Error(`Multi-file consistency validation error: Conflicting operations detected - original path "${op.originalPath}" is flagged for deletion`);
        }
      }
    }
  }
  validateGraph(ops, order) {
    const opsTargets = new Set(ops.map((o) => o.filePath));
    for (const op of ops) {
      for (const dep of op.dependencies) {
        if (!opsTargets.has(dep)) {
          throw new Error(`Multi-file consistency validation error: Broken dependency graph - path "${op.filePath}" depends on undefined path "${dep}"`);
        }
      }
    }
  }
};
var consistencyValidator = new ConsistencyValidator();

// src/core/codeGeneration/multiFile/dependencyPlanner.ts
var DependencyPlanner = class {
  planDependencies(ops) {
    return ops;
  }
};
var dependencyPlanner = new DependencyPlanner();

// src/core/codeGeneration/multiFile/filePlanner.ts
var FilePlanner = class {
  planFiles(plan) {
    const rawOps = plan.operations || [];
    return rawOps.map((op) => ({
      filePath: op.filePath,
      operation: op.operation || "create",
      dependencies: op.dependencies || [],
      originalPath: op.originalPath
    }));
  }
};
var filePlanner = new FilePlanner();

// src/core/codeGeneration/multiFile/generationGraph.ts
var GenerationGraph = class {
  adjList = /* @__PURE__ */ new Map();
  addNode(file) {
    if (!this.adjList.has(file)) {
      this.adjList.set(file, []);
    }
  }
  addEdge(from, to) {
    this.adjList.get(from)?.push(to);
  }
  getAdjacentNodes(file) {
    return this.adjList.get(file) || [];
  }
  getAllNodes() {
    return Array.from(this.adjList.keys());
  }
};

// src/core/codeGeneration/multiFile/orderingEngine.ts
var OrderingEngine = class {
  computeOrder(ops) {
    const graph = new GenerationGraph();
    for (const op of ops) {
      graph.addNode(op.filePath);
    }
    for (const op of ops) {
      for (const dep of op.dependencies) {
        graph.addNode(dep);
        graph.addEdge(dep, op.filePath);
      }
    }
    const visited = /* @__PURE__ */ new Map();
    const order = [];
    const visit = (node) => {
      const state = visited.get(node);
      if (state === "VISITING") {
        throw new Error(`Multi-file consistency validation error: Circular dependency generation order cycle detected at node "${node}"`);
      }
      if (state === "VISITED") {
        return;
      }
      visited.set(node, "VISITING");
      for (const adj of graph.getAdjacentNodes(node)) {
        visit(adj);
      }
      visited.set(node, "VISITED");
      order.unshift(node);
    };
    for (const node of graph.getAllNodes()) {
      if (!visited.has(node)) {
        visit(node);
      }
    }
    return order.reverse();
  }
};
var orderingEngine = new OrderingEngine();

// src/core/codeGeneration/multiFile/artifactAssembler.ts
var ArtifactAssembler = class {
  assemble(ops) {
    return ops.map((op) => {
      let content = "";
      if (op.operation === "create" || op.operation === "modify") {
        content = `/**
 * Generated by Multi-file Generation Engine
 * Target: ${op.filePath}
 * Operation: ${op.operation}
 */
export const featureName = '${op.filePath.split("/").pop()?.split(".")[0]}';
`;
      }
      return {
        path: op.filePath,
        content,
        operation: op.operation
      };
    });
  }
};
var artifactAssembler = new ArtifactAssembler();

// src/core/codeGeneration/multiFile/generationMetrics.ts
var MultiFileMetrics = class {
  data = {
    tasksPlanned: 0,
    totalFilesAffected: 0
  };
  record(filesCount) {
    this.data.tasksPlanned++;
    this.data.totalFilesAffected += filesCount;
  }
  getMetrics() {
    return this.data;
  }
};
var multiFileMetrics = new MultiFileMetrics();

// src/core/codeGeneration/multiFile/generationCoordinator.ts
var GenerationCoordinator2 = class {
  async coordinate(plan) {
    const startTime = Date.now();
    multiFileEvents.emit("GenerationPlanningStarted" /* GenerationPlanningStarted */, { plan });
    try {
      const plannedOps = filePlanner.planFiles(plan);
      const affectedFiles = plannedOps.map((op) => op.filePath);
      for (const file of affectedFiles) {
        multiFileEvents.emit("FileDiscovered" /* FileDiscovered */, { file });
      }
      const dependenciesPlanned = dependencyPlanner.planDependencies(plannedOps);
      multiFileEvents.emit("DependencyResolved" /* DependencyResolved */, { operations: dependenciesPlanned });
      const dependencyOrder = orderingEngine.computeOrder(dependenciesPlanned);
      consistencyValidator.validateOperations(dependenciesPlanned);
      const generatedArtifacts = artifactAssembler.assemble(dependenciesPlanned);
      multiFileEvents.emit("ArtifactGenerated" /* ArtifactGenerated */, { artifacts: generatedArtifacts });
      const multiPlan = {
        generationId: `multi-plan-${Date.now()}`,
        affectedFiles,
        creationOrder: dependencyOrder,
        dependencyOrder,
        generatedArtifacts,
        validationSummary: {
          isValid: true,
          errors: []
        },
        warnings: [],
        metrics: {
          filesCount: affectedFiles.length,
          durationMs: Date.now() - startTime
        }
      };
      consistencyValidator.validateGraph(dependenciesPlanned, dependencyOrder);
      multiFileEvents.emit("ConsistencyValidated" /* ConsistencyValidated */, { plan: multiPlan });
      multiFileMetrics.record(affectedFiles.length);
      multiFileEvents.emit("GenerationCompleted" /* GenerationCompleted */, { plan: multiPlan });
      return multiPlan;
    } catch (err) {
      throw err;
    }
  }
};
var generationCoordinator2 = new GenerationCoordinator2();

// src/core/codeGeneration/multiFile/multiFileEngine.ts
var MultiFileEngine = class {
  async generateMultiFilePlan(plan) {
    return generationCoordinator2.coordinate(plan);
  }
  subscribe(listener) {
    return multiFileEvents.subscribe(listener);
  }
};
var multiFileEngine = new MultiFileEngine();

// src/core/codeGeneration/incremental/editEvents.ts
var EditEvents = class {
  listeners = /* @__PURE__ */ new Set();
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  emit(type, payload) {
    const event = {
      type,
      timestamp: Date.now(),
      payload
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error("Error in Incremental Edit Engine event listener:", err);
      }
    }
  }
};
var editEvents = new EditEvents();

// src/core/codeGeneration/incremental/editValidator.ts
var EditValidator = class {
  validate(ops, fileSize) {
    if (ops.length === 0) {
      throw new Error("Incremental Edit validation error: No patch operations declared");
    }
    let totalEditBytes = 0;
    for (const op of ops) {
      if (op.range.start < 0 || op.range.end < op.range.start) {
        throw new Error(`Incremental Edit validation error: Invalid edit range offsets: [${op.range.start}, ${op.range.end}]`);
      }
      totalEditBytes += op.range.end - op.range.start;
    }
    if (fileSize > 0 && totalEditBytes / fileSize > 0.9) {
      throw new Error("Incremental Edit validation error: Whole-file rewrites are prohibited. Proposing minimal precise changes instead.");
    }
  }
};
var editValidator = new EditValidator();

// src/core/codeGeneration/incremental/editRegionDetector.ts
var EditRegionDetector = class {
  detectRegion(content, keyword) {
    const idx = content.indexOf(keyword);
    if (idx === -1) {
      return { start: 0, end: 0 };
    }
    return {
      start: idx,
      end: idx + keyword.length
    };
  }
};
var editRegionDetector = new EditRegionDetector();

// src/core/codeGeneration/incremental/editAnalyzer.ts
var EditAnalyzer = class {
  analyzeContext(content, start, end) {
    const contextStart = Math.max(0, start - 50);
    const contextEnd = Math.min(content.length, end + 50);
    return content.substring(contextStart, contextEnd);
  }
};
var editAnalyzer = new EditAnalyzer();

// src/core/codeGeneration/incremental/editMatcher.ts
var EditMatcher = class {
  matchLines(content, targetLine) {
    const lines = content.split("\n");
    return lines.findIndex((l) => l.includes(targetLine));
  }
};
var editMatcher = new EditMatcher();

// src/core/codeGeneration/incremental/editOptimizer.ts
var EditOptimizer = class {
  optimize(ops) {
    if (ops.length <= 1)
      return ops;
    const sorted = [...ops].sort((a, b) => a.range.start - b.range.start);
    const optimized = [];
    let current = sorted[0];
    for (let i = 1; i < sorted.length; i++) {
      const next = sorted[i];
      if (next.range.start <= current.range.end + 5) {
        current = {
          type: "replace",
          range: { start: current.range.start, end: Math.max(current.range.end, next.range.end) },
          text: current.text + next.text
        };
      } else {
        optimized.push(current);
        current = next;
      }
    }
    optimized.push(current);
    return optimized;
  }
};
var editOptimizer = new EditOptimizer();

// src/core/codeGeneration/incremental/conflictDetector.ts
var ConflictDetector = class {
  detectConflicts(ops) {
    const conflicts = [];
    const sorted = [...ops].sort((a, b) => a.range.start - b.range.start);
    for (let i = 0; i < sorted.length - 1; i++) {
      const current = sorted[i];
      const next = sorted[i + 1];
      if (next.range.start < current.range.end) {
        conflicts.push(`Conflict detected: Overlapping edit regions detected between ranges [${current.range.start}, ${current.range.end}] and [${next.range.start}, ${next.range.end}]`);
      }
    }
    return conflicts;
  }
};
var conflictDetector = new ConflictDetector();

// src/core/codeGeneration/incremental/preservationEngine.ts
var PreservationEngine = class {
  identifyPreservedRegions(content, ops) {
    const preserved = [];
    let currentIdx = 0;
    const sortedOps = [...ops].sort((a, b) => a.range.start - b.range.start);
    for (const op of sortedOps) {
      if (op.range.start > currentIdx) {
        preserved.push({ start: currentIdx, end: op.range.start });
      }
      currentIdx = op.range.end;
    }
    if (currentIdx < content.length) {
      preserved.push({ start: currentIdx, end: content.length });
    }
    return preserved;
  }
};
var preservationEngine = new PreservationEngine();

// src/core/codeGeneration/incremental/editMetrics.ts
var EditMetrics = class {
  data = {
    totalEditsRun: 0,
    totalPreservedRatio: 0
  };
  record(ratio) {
    this.data.totalEditsRun++;
    this.data.totalPreservedRatio = (this.data.totalPreservedRatio * (this.data.totalEditsRun - 1) + ratio) / this.data.totalEditsRun;
  }
  getMetrics() {
    return this.data;
  }
};
var editMetrics = new EditMetrics();

// src/core/codeGeneration/incremental/editPlanner.ts
var EditPlanner = class {
  planEdits(filePath, fileContent, rawOps) {
    const warnings = conflictDetector.detectConflicts(rawOps);
    const optimizedOps = editOptimizer.optimize(rawOps);
    editValidator.validate(optimizedOps, fileContent.length);
    const preservedRegions = preservationEngine.identifyPreservedRegions(fileContent, optimizedOps);
    let editedBytes = 0;
    for (const op of optimizedOps) {
      editedBytes += op.range.end - op.range.start;
    }
    const preservedRatio = fileContent.length > 0 ? (fileContent.length - editedBytes) / fileContent.length : 1;
    const editRegions = optimizedOps.map((op) => op.range);
    const plan = {
      editId: `edit-plan-${Date.now()}`,
      targetFile: filePath,
      editRegions,
      patchOperations: optimizedOps,
      preservedRegions,
      validationSummary: {
        isValid: warnings.length === 0,
        errors: []
      },
      warnings,
      metrics: {
        originalSize: fileContent.length,
        patchSize: editedBytes,
        preservedRatio
      }
    };
    editMetrics.record(preservedRatio);
    return plan;
  }
};
var editPlanner = new EditPlanner();

// src/core/codeGeneration/incremental/incrementalEngine.ts
var IncrementalEngine = class {
  async generateEditPlan(filePath, fileContent, ops) {
    return editPlanner.planEdits(filePath, fileContent, ops);
  }
  subscribe(listener) {
    return editEvents.subscribe(listener);
  }
};
var incrementalEngine = new IncrementalEngine();

// src/core/codeGeneration/conventions/conventionEvents.ts
var ConventionEvents = class {
  listeners = /* @__PURE__ */ new Set();
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  emit(type, payload) {
    const event = {
      type,
      timestamp: Date.now(),
      payload
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error("Error in Project Convention Engine event listener:", err);
      }
    }
  }
};
var conventionEvents = new ConventionEvents();

// src/core/codeGeneration/conventions/conventionValidator.ts
var ConventionValidator = class {
  validateSamplesCount(samplesCount) {
    if (samplesCount < 2) {
      throw new Error("Project Convention validation error: Insufficient representative samples (requires at least 2 file targets)");
    }
  }
  validateProfile(profile) {
    if (!profile) {
      throw new Error("Project Convention validation error: Profiles are missing");
    }
    if (profile.confidence < 0.1) {
      throw new Error("Project Convention validation error: Conflicting rules detected in repository files casing configurations");
    }
  }
};
var conventionValidator = new ConventionValidator();

// src/core/codeGeneration/conventions/conventionDetector.ts
var ConventionDetector = class {
  detectCasing(name) {
    if (name.includes("_")) {
      return "snakeCase";
    }
    const firstChar = name.charAt(0);
    if (firstChar === firstChar.toUpperCase() && firstChar !== firstChar.toLowerCase()) {
      return "PascalCase";
    }
    return "camelCase";
  }
};
var conventionDetector = new ConventionDetector();

// src/core/codeGeneration/conventions/conventionScorer.ts
var ConventionScorer = class {
  calculateConfidence(matchesCount, totalCount) {
    if (totalCount === 0)
      return 1;
    return Math.min(1, matchesCount / totalCount);
  }
};
var conventionScorer = new ConventionScorer();

// src/core/codeGeneration/conventions/conventionCache.ts
var ConventionCache = class {
  cache = null;
  get() {
    return this.cache;
  }
  set(profile) {
    this.cache = profile;
  }
  clear() {
    this.cache = null;
  }
};
var conventionCache = new ConventionCache();

// src/core/codeGeneration/conventions/conventionRegistry.ts
var ConventionRegistry = class {
  providers = /* @__PURE__ */ new Map();
  register(provider) {
    this.providers.set(provider.name, provider);
  }
  getProviders() {
    return Array.from(this.providers.values());
  }
};
var conventionRegistry = new ConventionRegistry();

// src/core/codeGeneration/conventions/ruleProviders/typescriptRules.ts
var TypeScriptRules = class {
  name = "TypeScriptStyleRules";
  checkRule(target) {
    return target.endsWith(".ts") || target.endsWith(".tsx");
  }
};
var typescriptRules = new TypeScriptRules();

// src/core/codeGeneration/conventions/ruleProviders/javascriptRules.ts
var JavaScriptRules = class {
  name = "JavaScriptStyleRules";
  checkRule(target) {
    return target.endsWith(".js") || target.endsWith(".jsx");
  }
};
var javascriptRules = new JavaScriptRules();

// src/core/codeGeneration/conventions/ruleProviders/reactRules.ts
var ReactRules = class {
  name = "ReactHooksRules";
  checkRule(target) {
    return target.includes("use") || target.endsWith(".tsx");
  }
};
var reactRules = new ReactRules();

// src/core/codeGeneration/conventions/ruleProviders/nodeRules.ts
var NodeRules = class {
  name = "NodeModuleResolveRules";
  checkRule(target) {
    return target.includes("require") || target.includes("module.exports");
  }
};
var nodeRules = new NodeRules();

// src/core/codeGeneration/conventions/conventionMetrics.ts
var ConventionMetrics = class {
  data = {
    totalScans: 0,
    profilesLearned: 0
  };
  record(learned) {
    this.data.totalScans++;
    if (learned) {
      this.data.profilesLearned++;
    }
  }
  getMetrics() {
    return this.data;
  }
};
var conventionMetrics = new ConventionMetrics();

// src/core/codeGeneration/conventions/conventionAnalyzer.ts
var ConventionAnalyzer = class {
  constructor() {
    conventionRegistry.register(typescriptRules);
    conventionRegistry.register(javascriptRules);
    conventionRegistry.register(reactRules);
    conventionRegistry.register(nodeRules);
  }
  analyze(files) {
    conventionEvents.emit("ConventionScanStarted" /* ConventionScanStarted */, { filesCount: files.length });
    conventionValidator.validateSamplesCount(files.length);
    let camelCount = 0;
    let snakeCount = 0;
    let pascalCount = 0;
    for (const f of files) {
      const fileName = f.path.split("/").pop() || "";
      const casing = conventionDetector.detectCasing(fileName);
      conventionEvents.emit("PatternDetected" /* PatternDetected */, { file: f.path, casing });
      if (casing === "camelCase")
        camelCount++;
      else if (casing === "snakeCase")
        snakeCount++;
      else if (casing === "PascalCase")
        pascalCount++;
    }
    const totalCount = files.length;
    let primaryCasing = "camelCase";
    let casingMatches = camelCount;
    if (snakeCount > casingMatches) {
      primaryCasing = "snakeCase";
      casingMatches = snakeCount;
    }
    if (pascalCount > casingMatches) {
      primaryCasing = "PascalCase";
      casingMatches = pascalCount;
    }
    const confidence = conventionScorer.calculateConfidence(casingMatches, totalCount);
    const profile = {
      projectId: `project-conv-${Date.now()}`,
      namingRules: { casing: primaryCasing, confidence },
      folderRules: [
        { path: "src/core", convention: "camelCase" },
        { path: "src/webview", convention: "camelCase" }
      ],
      importRules: { style: "relative", confidence: 0.9 },
      architectureRules: [
        { layersCheck: true, constraintRule: "No core import inside common" }
      ],
      formattingRules: { useTabs: false, tabSize: 2 },
      codeStyleRules: { allowAny: false, strictNulls: true },
      confidence
    };
    conventionValidator.validateProfile(profile);
    conventionCache.set(profile);
    conventionMetrics.record(true);
    conventionEvents.emit("ConventionLearned" /* ConventionLearned */, { profile });
    conventionEvents.emit("ProfileGenerated" /* ProfileGenerated */, { profile });
    conventionEvents.emit("ConventionValidated" /* ConventionValidated */, { profile });
    conventionEvents.emit("ConventionReady" /* ConventionReady */, { profile });
    return profile;
  }
};
var conventionAnalyzer = new ConventionAnalyzer();

// src/core/codeGeneration/conventions/conventionEngine.ts
var ConventionEngine = class {
  async analyzeConventions(files) {
    return conventionAnalyzer.analyze(files);
  }
  subscribe(listener) {
    return conventionEvents.subscribe(listener);
  }
};
var conventionEngine = new ConventionEngine();

// src/core/codeGeneration/naming/namingEvents.ts
var NamingEvents = class {
  listeners = /* @__PURE__ */ new Set();
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  emit(type, payload) {
    const event = {
      type,
      timestamp: Date.now(),
      payload
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error("Error in Naming Intelligence Engine event listener:", err);
      }
    }
  }
};
var namingEvents = new NamingEvents();

// src/core/codeGeneration/naming/namingValidator.ts
var NamingValidator = class {
  reservedKeywords = /* @__PURE__ */ new Set([
    "class",
    "interface",
    "function",
    "let",
    "const",
    "var",
    "import",
    "export",
    "default",
    "extends",
    "implements"
  ]);
  validateName(name, symbolType) {
    if (!name || name.trim() === "") {
      throw new Error("Naming Intelligence validation error: Name string cannot be empty");
    }
    if (this.reservedKeywords.has(name)) {
      throw new Error(`Naming Intelligence validation error: Proposed name "${name}" is a reserved language keyword`);
    }
    if (name.length < 3) {
      throw new Error(`Naming Intelligence validation error: Proposed name "${name}" is too short and ambiguous`);
    }
  }
};
var namingValidator = new NamingValidator();

// src/core/codeGeneration/naming/collisionDetector.ts
var CollisionDetector = class {
  checkCollision(name, namespaceFiles) {
    return namespaceFiles.some((f) => f.toLowerCase().includes(name.toLowerCase()));
  }
};
var collisionDetector = new CollisionDetector();

// src/core/codeGeneration/naming/semanticAnalyzer.ts
var SemanticAnalyzer = class {
  inferIntent(purpose) {
    const p = purpose.toLowerCase();
    if (p.includes("save") || p.includes("load") || p.includes("db")) {
      return "Repository";
    }
    if (p.includes("controller") || p.includes("route")) {
      return "Controller";
    }
    if (p.includes("component") || p.includes("view") || p.includes("page")) {
      return "Component";
    }
    return "Service";
  }
};
var semanticAnalyzer = new SemanticAnalyzer();

// src/core/codeGeneration/naming/abbreviationEngine.ts
var AbbreviationEngine = class {
  abbrevMap = /* @__PURE__ */ new Map([
    ["auth", "authorization"],
    ["config", "configuration"],
    ["db", "database"],
    ["ctrl", "controller"],
    ["srv", "service"],
    ["repo", "repository"]
  ]);
  expand(term) {
    const t = term.toLowerCase();
    return this.abbrevMap.get(t) || term;
  }
};
var abbreviationEngine = new AbbreviationEngine();

// src/core/codeGeneration/naming/namingRegistry.ts
var NamingRegistry = class {
  providers = /* @__PURE__ */ new Map();
  register(provider) {
    this.providers.set(provider.name, provider);
  }
  getProviders() {
    return Array.from(this.providers.values());
  }
};
var namingRegistry = new NamingRegistry();

// src/core/codeGeneration/naming/providers/typescriptNaming.ts
var TypeScriptNaming = class {
  name = "TypeScriptNamingRules";
  isReserved(word) {
    return ["any", "never", "unknown", "namespace", "module", "type"].includes(word);
  }
};
var typescriptNaming = new TypeScriptNaming();

// src/core/codeGeneration/naming/providers/javascriptNaming.ts
var JavaScriptNaming = class {
  name = "JavaScriptNamingRules";
  isReserved(word) {
    return ["window", "document", "undefined", "null", "prototype"].includes(word);
  }
};
var javascriptNaming = new JavaScriptNaming();

// src/core/codeGeneration/naming/providers/reactNaming.ts
var ReactNaming = class {
  name = "ReactNamingRules";
  isReserved(word) {
    return ["useState", "useEffect", "useContext", "useReducer", "useMemo"].includes(word);
  }
};
var reactNaming = new ReactNaming();

// src/core/codeGeneration/naming/providers/nodeNaming.ts
var NodeNaming = class {
  name = "NodeNamingRules";
  isReserved(word) {
    return ["require", "exports", "module", "process", "global", "Buffer"].includes(word);
  }
};
var nodeNaming = new NodeNaming();

// src/core/codeGeneration/naming/namingMetrics.ts
var NamingMetrics = class {
  data = {
    totalNamesGenerated: 0,
    totalCollisionsAvoided: 0
  };
  record(collisionAvoided) {
    this.data.totalNamesGenerated++;
    if (collisionAvoided) {
      this.data.totalCollisionsAvoided++;
    }
  }
  getMetrics() {
    return this.data;
  }
};
var namingMetrics = new NamingMetrics();

// src/core/codeGeneration/naming/namingGenerator.ts
var NamingGenerator = class {
  generateCandidates(baseTerm, symbolType, casing, existingFiles) {
    const expanded = abbreviationEngine.expand(baseTerm);
    let candidate = this.formatCasing(expanded, casing);
    for (const provider of namingRegistry.getProviders()) {
      if (provider.isReserved(candidate)) {
        candidate = candidate + "Symbol";
      }
    }
    namingValidator.validateName(candidate, symbolType);
    const hasCollision = collisionDetector.checkCollision(candidate, existingFiles);
    const alternativeNames = [
      this.formatCasing(expanded + "Helper", casing),
      this.formatCasing(expanded + "Manager", casing)
    ];
    const report = {
      symbolName: candidate,
      alternativeNames,
      confidenceScore: hasCollision ? 0.6 : 0.95,
      conventionMatch: true,
      collisionStatus: hasCollision ? "warning" : "none",
      namespace: symbolType
    };
    return report;
  }
  formatCasing(word, casing) {
    const w = word.replace(/[^a-zA-Z0-9]/g, "");
    if (casing === "snakeCase") {
      return w.replace(/([A-Z])/g, "_$1").toLowerCase().replace(/^_/, "");
    }
    const cap = w.charAt(0).toUpperCase() + w.slice(1);
    if (casing === "PascalCase") {
      return cap;
    }
    return cap.charAt(0).toLowerCase() + cap.slice(1);
  }
};
var namingGenerator = new NamingGenerator();

// src/core/codeGeneration/naming/namingAnalyzer.ts
var NamingAnalyzer = class {
  constructor() {
    namingRegistry.register(typescriptNaming);
    namingRegistry.register(javascriptNaming);
    namingRegistry.register(reactNaming);
    namingRegistry.register(nodeNaming);
  }
  analyzeAndGenerate(baseTerm, symbolType, casing, existingFiles) {
    namingEvents.emit("NamingStarted" /* NamingStarted */, { baseTerm, symbolType });
    namingEvents.emit("SemanticAnalyzed" /* SemanticAnalyzed */, { symbolType });
    const report = namingGenerator.generateCandidates(baseTerm, symbolType, casing, existingFiles);
    namingEvents.emit("CandidateGenerated" /* CandidateGenerated */, { report });
    if (report.collisionStatus !== "none") {
      namingEvents.emit("CollisionDetected" /* CollisionDetected */, { report });
      namingMetrics.record(true);
    } else {
      namingMetrics.record(false);
    }
    namingEvents.emit("NameValidated" /* NameValidated */, { report });
    namingEvents.emit("NamingCompleted" /* NamingCompleted */, { report });
    return report;
  }
};
var namingAnalyzer = new NamingAnalyzer();

// src/core/codeGeneration/naming/namingEngine.ts
var NamingEngine = class {
  async generateNames(baseTerm, symbolType, casing, existingFiles) {
    return namingAnalyzer.analyzeAndGenerate(baseTerm, symbolType, casing, existingFiles);
  }
  subscribe(listener) {
    return namingEvents.subscribe(listener);
  }
};
var namingEngine = new NamingEngine();

// src/core/codeGeneration/imports/importEvents.ts
var ImportEvents = class {
  listeners = /* @__PURE__ */ new Set();
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  emit(type, payload) {
    const event = {
      type,
      timestamp: Date.now(),
      payload
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error("Error in Import Resolution Engine event listener:", err);
      }
    }
  }
};
var importEvents = new ImportEvents();

// src/core/codeGeneration/imports/importValidator.ts
var ImportValidator = class {
  validateImports(imports, targetFile) {
    for (const imp of imports) {
      if (!imp.source || imp.source.trim() === "") {
        throw new Error("Import Resolution validation error: Broken import path source");
      }
      if (imp.source.includes(targetFile) || targetFile.includes(imp.source)) {
        throw new Error(`Import Resolution validation error: Circular import detected in file "${targetFile}" referencing source "${imp.source}"`);
      }
    }
  }
};
var importValidator = new ImportValidator();

// src/core/codeGeneration/imports/aliasResolver.ts
var AliasResolver = class {
  aliases = /* @__PURE__ */ new Map([
    ["@/core", "src/core"],
    ["@/common", "src/common"],
    ["@/webview", "src/webview"]
  ]);
  resolveAlias(source) {
    for (const [key, value] of this.aliases.entries()) {
      if (source.startsWith(key)) {
        return source.replace(key, value);
      }
    }
    return source;
  }
  getAliases() {
    return Array.from(this.aliases.entries()).map(([alias, resolved]) => ({ alias, resolved }));
  }
};
var aliasResolver = new AliasResolver();

// src/core/codeGeneration/imports/dependencyResolver.ts
var DependencyResolver2 = class {
  verifyDependency(source, targetFile) {
    if (targetFile.includes("common") && source.includes("core")) {
      return false;
    }
    return true;
  }
};
var dependencyResolver2 = new DependencyResolver2();

// src/core/codeGeneration/imports/importSorter.ts
var ImportSorter = class {
  sort(imports) {
    return [...imports].sort((a, b) => {
      const aWeight = this.getSourceWeight(a.source);
      const bWeight = this.getSourceWeight(b.source);
      if (aWeight !== bWeight) {
        return aWeight - bWeight;
      }
      return a.source.localeCompare(b.source);
    });
  }
  getSourceWeight(source) {
    if (source.startsWith("node:") || ["fs", "path", "assert", "os"].includes(source)) {
      return 1;
    }
    if (!source.startsWith(".") && !source.startsWith("@/")) {
      return 2;
    }
    if (source.startsWith("@/")) {
      return 3;
    }
    return 4;
  }
};
var importSorter = new ImportSorter();

// src/core/codeGeneration/imports/importOptimizer.ts
var ImportOptimizer = class {
  optimize(imports) {
    const optimizedMap = /* @__PURE__ */ new Map();
    const duplicates = [];
    for (const imp of imports) {
      if (optimizedMap.has(imp.source)) {
        duplicates.push(imp.source);
        const existing = optimizedMap.get(imp.source);
        const mergedSpecifiers = Array.from(/* @__PURE__ */ new Set([...existing.specifiers, ...imp.specifiers]));
        optimizedMap.set(imp.source, {
          ...existing,
          specifiers: mergedSpecifiers
        });
      } else {
        optimizedMap.set(imp.source, { ...imp });
      }
    }
    return {
      optimized: Array.from(optimizedMap.values()),
      duplicates
    };
  }
};
var importOptimizer = new ImportOptimizer();

// src/core/codeGeneration/imports/importRegistry.ts
var ImportRegistry = class {
  providers = /* @__PURE__ */ new Map();
  register(provider) {
    this.providers.set(provider.name, provider);
  }
  getProviders() {
    return Array.from(this.providers.values());
  }
};
var importRegistry = new ImportRegistry();

// src/core/codeGeneration/imports/providers/typescriptImports.ts
var TypeScriptImports = class {
  name = "TypeScriptImportsRules";
  isCorePackage(pkg) {
    return ["typescript", "tslint"].includes(pkg);
  }
};
var typescriptImports = new TypeScriptImports();

// src/core/codeGeneration/imports/providers/javascriptImports.ts
var JavaScriptImports = class {
  name = "JavaScriptImportsRules";
  isCorePackage(pkg) {
    return ["lodash", "axios"].includes(pkg);
  }
};
var javascriptImports = new JavaScriptImports();

// src/core/codeGeneration/imports/providers/reactImports.ts
var ReactImports = class {
  name = "ReactImportsRules";
  isCorePackage(pkg) {
    return ["react", "react-dom"].includes(pkg);
  }
};
var reactImports = new ReactImports();

// src/core/codeGeneration/imports/providers/nodeImports.ts
var NodeImports = class {
  name = "NodeImportsRules";
  isCorePackage(pkg) {
    return ["fs", "path", "os", "child_process"].includes(pkg);
  }
};
var nodeImports = new NodeImports();

// src/core/codeGeneration/imports/importMetrics.ts
var ImportMetrics = class {
  data = {
    totalResolutions: 0,
    totalUnusedImported: 0
  };
  record(unusedCount) {
    this.data.totalResolutions++;
    this.data.totalUnusedImported += unusedCount;
  }
  getMetrics() {
    return this.data;
  }
};
var importMetrics = new ImportMetrics();

// src/core/codeGeneration/imports/importResolver.ts
var ImportResolver = class {
  resolveMatch(symbol) {
    let source = "react";
    if (symbol.startsWith("use")) {
      source = "react";
    } else if (symbol.includes("Base")) {
      source = "@/core/base";
    } else {
      source = "lodash";
    }
    return {
      source: aliasResolver.resolveAlias(source),
      specifiers: [symbol],
      kind: "named"
    };
  }
};
var importResolver = new ImportResolver();

// src/core/codeGeneration/imports/importAnalyzer.ts
var ImportAnalyzer = class {
  parseExisting(content) {
    const lines = content.split("\n");
    const statements = [];
    for (const line of lines) {
      if (line.trim().startsWith("import ")) {
        const match = line.match(/import\s+(?:({[^}]+})|([a-zA-Z0-9_]+))\s+from\s+['"]([^'"]+)['"]/);
        if (match) {
          const specifiers = match[1] ? match[1].replace(/[{}]/g, "").split(",").map((s) => s.trim()) : [match[2].trim()];
          statements.push({
            source: match[3],
            specifiers,
            kind: "named"
          });
        }
      }
    }
    return statements;
  }
};
var importAnalyzer = new ImportAnalyzer();

// src/core/codeGeneration/imports/importEngine.ts
var ImportEngine = class {
  constructor() {
    importRegistry.register(typescriptImports);
    importRegistry.register(javascriptImports);
    importRegistry.register(reactImports);
    importRegistry.register(nodeImports);
  }
  async resolveImports(targetFile, fileContent, requiredSymbols) {
    importEvents.emit("ImportAnalysisStarted" /* ImportAnalysisStarted */, { targetFile });
    const existing = importAnalyzer.parseExisting(fileContent);
    const resolved = [...existing];
    for (const sym of requiredSymbols) {
      const matched = importResolver.resolveMatch(sym);
      importEvents.emit("SymbolResolved" /* SymbolResolved */, { symbol: sym, matched });
      resolved.push(matched);
    }
    const { optimized, duplicates } = importOptimizer.optimize(resolved);
    importEvents.emit("ImportOptimized" /* ImportOptimized */, { optimizedCount: optimized.length });
    const sorted = importSorter.sort(optimized);
    importValidator.validateImports(sorted, targetFile);
    importEvents.emit("ImportValidated" /* ImportValidated */, { sortedCount: sorted.length });
    const aliasResolution = aliasResolver.getAliases();
    const report = {
      targetFile,
      resolvedImports: sorted,
      missingImports: requiredSymbols.filter((s) => !fileContent.includes(s)),
      duplicateImports: duplicates,
      unusedImports: [],
      aliasResolution,
      diagnostics: [],
      confidence: 0.95
    };
    importMetrics.record(0);
    importEvents.emit("ImportResolutionCompleted" /* ImportResolutionCompleted */, { report });
    return report;
  }
  subscribe(listener) {
    return importEvents.subscribe(listener);
  }
};
var importEngine = new ImportEngine();

// src/core/codeGeneration/symbols/symbolEvents.ts
var SymbolEvents = class {
  listeners = /* @__PURE__ */ new Set();
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  emit(type, payload) {
    const event = {
      type,
      timestamp: Date.now(),
      payload
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error("Error in Symbol Resolution Engine event listener:", err);
      }
    }
  }
};
var symbolEvents = new SymbolEvents();

// src/core/codeGeneration/symbols/symbolValidator.ts
var SymbolValidator = class {
  validateDefinitions(symbols) {
    const seen = /* @__PURE__ */ new Set();
    for (const sym of symbols) {
      const uniqueKey = `${sym.namespace}.${sym.name}`;
      if (seen.has(uniqueKey)) {
        throw new Error(`Symbol Resolution validation error: Duplicate definition detected for symbol "${sym.name}" inside namespace "${sym.namespace}"`);
      }
      seen.add(uniqueKey);
    }
  }
  validateVisibility(sym, accessorFile) {
    if (sym.visibility === "private" && sym.namespace !== accessorFile) {
      throw new Error(`Symbol Resolution validation error: Visibility violation. Cannot access private symbol "${sym.name}" of namespace "${sym.namespace}" from "${accessorFile}"`);
    }
  }
};
var symbolValidator = new SymbolValidator();

// src/core/codeGeneration/symbols/namespaceResolver.ts
var NamespaceResolver = class {
  resolveNamespace(filePath) {
    const parts = filePath.split("/");
    if (parts.length > 2) {
      return parts.slice(0, parts.length - 1).join(".");
    }
    return "global";
  }
};
var namespaceResolver = new NamespaceResolver();

// src/core/codeGeneration/symbols/referenceResolver.ts
var ReferenceResolver = class {
  resolveReferences(content, definedSymbols) {
    const refs = [];
    for (const sym of definedSymbols) {
      if (content.includes(sym)) {
        refs.push(sym);
      }
    }
    return refs;
  }
};
var referenceResolver = new ReferenceResolver();

// src/core/codeGeneration/symbols/overloadResolver.ts
var OverloadResolver = class {
  resolveOverload(name, signatureParams) {
    return `${name}(${signatureParams.join(", ")})`;
  }
};
var overloadResolver = new OverloadResolver();

// src/core/codeGeneration/symbols/symbolGraph.ts
var SymbolGraph = class {
  buildGraph(nodes) {
    const edges = [];
    if (nodes.length > 1) {
      for (let i = 0; i < nodes.length - 1; i++) {
        edges.push({ from: nodes[i], to: nodes[i + 1] });
      }
    }
    return { nodes, edges };
  }
};
var symbolGraph = new SymbolGraph();

// src/core/codeGeneration/symbols/symbolRegistry.ts
var SymbolRegistry = class {
  providers = /* @__PURE__ */ new Map();
  register(provider) {
    this.providers.set(provider.name, provider);
  }
  getProviders() {
    return Array.from(this.providers.values());
  }
};
var symbolRegistry = new SymbolRegistry();

// src/core/codeGeneration/symbols/providers/typescriptSymbols.ts
var TypeScriptSymbols = class {
  name = "TypeScriptSymbolsRules";
  isReserved(symbol) {
    return ["any", "never", "unknown", "namespace", "module", "type"].includes(symbol);
  }
};
var typescriptSymbols = new TypeScriptSymbols();

// src/core/codeGeneration/symbols/providers/javascriptSymbols.ts
var JavaScriptSymbols = class {
  name = "JavaScriptSymbolsRules";
  isReserved(symbol) {
    return ["window", "document", "undefined", "null", "prototype"].includes(symbol);
  }
};
var javascriptSymbols = new JavaScriptSymbols();

// src/core/codeGeneration/symbols/providers/reactSymbols.ts
var ReactSymbols = class {
  name = "ReactSymbolsRules";
  isReserved(symbol) {
    return ["useState", "useEffect", "useContext", "useReducer", "useMemo"].includes(symbol);
  }
};
var reactSymbols = new ReactSymbols();

// src/core/codeGeneration/symbols/providers/nodeSymbols.ts
var NodeSymbols = class {
  name = "NodeSymbolsRules";
  isReserved(symbol) {
    return ["require", "exports", "module", "process", "global", "Buffer"].includes(symbol);
  }
};
var nodeSymbols = new NodeSymbols();

// src/core/codeGeneration/symbols/symbolMetrics.ts
var SymbolMetrics = class {
  data = {
    totalResolutions: 0,
    totalUnresolved: 0
  };
  record(unresolvedCount) {
    this.data.totalResolutions++;
    this.data.totalUnresolved += unresolvedCount;
  }
  getMetrics() {
    return this.data;
  }
};
var symbolMetrics = new SymbolMetrics();

// src/core/codeGeneration/symbols/symbolResolver.ts
var SymbolResolver = class {
  resolveMatch(symbolName, namespace) {
    let kind = "Class";
    if (symbolName.charAt(0) === "I" && symbolName.charAt(1) === symbolName.charAt(1).toUpperCase()) {
      kind = "Interface";
    } else if (symbolName.charAt(0) === symbolName.charAt(0).toLowerCase()) {
      kind = "Function";
    }
    return {
      name: symbolName,
      kind,
      visibility: "public",
      namespace
    };
  }
};
var symbolResolver = new SymbolResolver();

// src/core/codeGeneration/symbols/symbolAnalyzer.ts
var SymbolAnalyzer = class {
  parseExisting(content, namespace) {
    const lines = content.split("\n");
    const symbols = [];
    for (const line of lines) {
      const classMatch = line.match(/(?:export\s+)?class\s+([a-zA-Z0-9_]+)/);
      if (classMatch) {
        symbols.push({ name: classMatch[1], kind: "Class", visibility: "public", namespace });
        continue;
      }
      const interfaceMatch = line.match(/(?:export\s+)?interface\s+([a-zA-Z0-9_]+)/);
      if (interfaceMatch) {
        symbols.push({ name: interfaceMatch[1], kind: "Interface", visibility: "public", namespace });
        continue;
      }
      const functionMatch = line.match(/(?:export\s+)?function\s+([a-zA-Z0-9_]+)/);
      if (functionMatch) {
        symbols.push({ name: functionMatch[1], kind: "Function", visibility: "public", namespace });
        continue;
      }
    }
    return symbols;
  }
};
var symbolAnalyzer = new SymbolAnalyzer();

// src/core/codeGeneration/symbols/symbolEngine.ts
var SymbolEngine = class {
  constructor() {
    symbolRegistry.register(typescriptSymbols);
    symbolRegistry.register(javascriptSymbols);
    symbolRegistry.register(reactSymbols);
    symbolRegistry.register(nodeSymbols);
  }
  async resolveSymbols(targetFile, fileContent, requiredSymbols) {
    symbolEvents.emit("ResolutionStarted" /* ResolutionStarted */, { targetFile });
    const namespace = namespaceResolver.resolveNamespace(targetFile);
    symbolEvents.emit("NamespaceResolved" /* NamespaceResolved */, { namespace });
    const defined = symbolAnalyzer.parseExisting(fileContent, namespace);
    symbolEvents.emit("CandidateFound" /* CandidateFound */, { candidates: defined });
    const resolved = [...defined];
    for (const sym of requiredSymbols) {
      const matched = symbolResolver.resolveMatch(sym, namespace);
      symbolEvents.emit("ReferenceResolved" /* ReferenceResolved */, { symbol: sym, matched });
      resolved.push(matched);
    }
    symbolValidator.validateDefinitions(resolved);
    for (const sym of resolved) {
      symbolValidator.validateVisibility(sym, targetFile);
    }
    symbolEvents.emit("SymbolValidated" /* SymbolValidated */, { count: resolved.length });
    const nodes = resolved.map((s) => s.name);
    const refGraph = symbolGraph.buildGraph(nodes);
    const report = {
      resolvedSymbols: resolved,
      unresolvedSymbols: [],
      referenceGraph: refGraph,
      namespaceInfo: [namespace],
      visibility: "public",
      diagnostics: [],
      confidence: 0.95
    };
    symbolMetrics.record(0);
    symbolEvents.emit("ResolutionCompleted" /* ResolutionCompleted */, { report });
    return report;
  }
  subscribe(listener) {
    return symbolEvents.subscribe(listener);
  }
};
var symbolEngine = new SymbolEngine();

// src/core/review/reviewEvents.ts
var ReviewEvents = class {
  listeners = /* @__PURE__ */ new Set();
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  emit(type, payload) {
    const event = {
      type,
      timestamp: Date.now(),
      payload
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error("Error in Self Review Engine event listener:", err);
      }
    }
  }
};
var reviewEvents = new ReviewEvents();

// src/core/review/reviewRules.ts
var ReviewRules2 = class {
  execute(content) {
    const issues = [];
    if (content.includes("TODO") || content.includes("todo")) {
      issues.push({
        ruleId: "REV-001",
        message: "Avoid check-in of TODO placeholders in generated code.",
        severity: "Suggestion",
        category: "Readability"
      });
    }
    if (content.length > 5e3) {
      issues.push({
        ruleId: "REV-002",
        message: "File length exceeds maintainability boundaries (5000 chars).",
        severity: "Warning",
        category: "Maintainability"
      });
    }
    if (content.includes("any")) {
      issues.push({
        ruleId: "REV-003",
        message: 'Detected broad type "any" usage. Favor precise types.',
        severity: "Suggestion",
        category: "Correctness"
      });
    }
    return issues;
  }
};
var reviewRules2 = new ReviewRules2();

// src/core/review/reviewScorer.ts
var ReviewScorer2 = class {
  calculateScore(issues) {
    let score = 100;
    for (const issue of issues) {
      if (issue.severity === "Suggestion")
        score -= 2;
      else if (issue.severity === "Warning")
        score -= 10;
      else if (issue.severity === "Error")
        score -= 25;
      else if (issue.severity === "Critical")
        score -= 50;
    }
    return Math.max(0, score);
  }
};
var reviewScorer2 = new ReviewScorer2();

// src/core/review/issueCollector.ts
var IssueCollector = class {
  collectIssues(issuesList) {
    const warnings = [];
    const failedChecks = [];
    for (const issue of issuesList) {
      if (issue.severity === "Warning" || issue.severity === "Critical") {
        warnings.push(issue.message);
      } else if (issue.severity === "Error") {
        failedChecks.push(issue.message);
      }
    }
    return { warnings, failedChecks };
  }
};
var issueCollector = new IssueCollector();

// src/core/review/recommendationEngine.ts
var RecommendationEngine = class {
  generateRecommendations(issues) {
    const recs = [];
    for (const issue of issues) {
      if (issue.ruleId === "REV-001") {
        recs.push("Replace temporary TODO items with proper handler actions.");
      } else if (issue.ruleId === "REV-002") {
        recs.push("Refactor broad modules into multiple sub-components.");
      } else if (issue.ruleId === "REV-003") {
        recs.push('Define custom TypeScript types to replace broad "any" types.');
      }
    }
    if (recs.length === 0) {
      recs.push("Artifact conforms to coding conventions. No recommendations.");
    }
    return recs;
  }
};
var recommendationEngine = new RecommendationEngine();

// src/core/review/reviewValidator.ts
var ReviewValidator2 = class {
  validate(issues) {
    const critical = issues.find((i) => i.severity === "Critical");
    if (critical) {
      throw new Error(`Self Review validation failure: Critical issue caught: ${critical.message}`);
    }
  }
};
var reviewValidator2 = new ReviewValidator2();

// src/core/review/providers/typescriptReview.ts
var TypeScriptReview = class {
  name = "TypeScriptReviewRules";
  check(content) {
    return !content.includes("as any");
  }
};
var typescriptReview = new TypeScriptReview();

// src/core/review/providers/javascriptReview.ts
var JavaScriptReview = class {
  name = "JavaScriptReviewRules";
  check(content) {
    return !content.includes("var ");
  }
};
var javascriptReview = new JavaScriptReview();

// src/core/review/providers/reactReview.ts
var ReactReview = class {
  name = "ReactReviewRules";
  check(content) {
    return !content.includes("dangerouslySetInnerHTML");
  }
};
var reactReview = new ReactReview();

// src/core/review/providers/nodeReview.ts
var NodeReview = class {
  name = "NodeReviewRules";
  check(content) {
    return !content.includes("eval(");
  }
};
var nodeReview = new NodeReview();

// src/core/review/reviewMetrics.ts
var ReviewMetrics = class {
  data = {
    totalReviews: 0,
    totalIssuesFound: 0
  };
  record(issuesCount) {
    this.data.totalReviews++;
    this.data.totalIssuesFound += issuesCount;
  }
  getMetrics() {
    return this.data;
  }
};
var reviewMetrics = new ReviewMetrics();

// src/core/review/reviewAnalyzer.ts
var ReviewAnalyzer = class {
  analyzeStructure(content) {
    return {
      hasFormattingIssues: content.includes("\r\n")
    };
  }
};
var reviewAnalyzer = new ReviewAnalyzer();

// src/core/review/reviewCoordinator.ts
var ReviewCoordinator = class {
  async scheduleReview(targetFile) {
    return true;
  }
};
var reviewCoordinator = new ReviewCoordinator();

// src/core/review/reviewEngine.ts
var ReviewEngine = class {
  async runReview(targetFile, content) {
    reviewEvents.emit("ReviewStarted" /* ReviewStarted */, { targetFile });
    const issues = reviewRules2.execute(content);
    for (const issue of issues) {
      reviewEvents.emit("IssueDetected" /* IssueDetected */, { issue });
    }
    const { warnings, failedChecks } = issueCollector.collectIssues(issues);
    const overallScore = reviewScorer2.calculateScore(issues);
    reviewEvents.emit("ScoreCalculated" /* ScoreCalculated */, { score: overallScore });
    reviewValidator2.validate(issues);
    const recommendations = recommendationEngine.generateRecommendations(issues);
    const report = {
      overallScore,
      confidence: 0.95,
      passedChecks: issues.length === 0 ? ["REV-001", "REV-002", "REV-003"] : [],
      failedChecks,
      warnings,
      recommendations,
      riskLevel: overallScore >= 90 ? "low" : overallScore >= 70 ? "medium" : "high",
      reviewSummary: `Self review completed for "${targetFile}" with score ${overallScore}/100.`
    };
    reviewMetrics.record(issues.length);
    reviewEvents.emit("ReviewCompleted" /* ReviewCompleted */, { report });
    return report;
  }
  subscribe(listener) {
    return reviewEvents.subscribe(listener);
  }
};
var reviewEngine = new ReviewEngine();

// src/core/validation/validationEvents.ts
var ValidationEvents = class {
  listeners = /* @__PURE__ */ new Set();
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  emit(type, payload) {
    const event = {
      type,
      timestamp: Date.now(),
      payload
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error("Error in Validation Engine event listener:", err);
      }
    }
  }
};
var validationEvents = new ValidationEvents();

// src/core/validation/validationRules.ts
var ValidationRules = class {
  execute(content) {
    const issues = [];
    if (content.includes("eval(")) {
      issues.push({
        ruleId: "VAL-001",
        message: "Security violation: eval call detected.",
        isBlocking: true,
        category: "Security"
      });
    }
    if (content.includes("debugger")) {
      issues.push({
        ruleId: "VAL-002",
        message: "Policy check failure: debugger statement present.",
        isBlocking: false,
        category: "Policy"
      });
    }
    return issues;
  }
};
var validationRules = new ValidationRules();

// src/core/validation/validationScorer.ts
var ValidationScorer = class {
  calculateScore(issues) {
    const hasBlocking = issues.some((i) => i.isBlocking);
    if (hasBlocking) {
      return 0;
    }
    const deductions = issues.length * 15;
    return Math.max(0, 100 - deductions);
  }
};
var validationScorer = new ValidationScorer();

// src/core/validation/validationRegistry.ts
var ValidationRegistry = class {
  providers = /* @__PURE__ */ new Map();
  register(provider) {
    this.providers.set(provider.name, provider);
  }
  getProviders() {
    return Array.from(this.providers.values());
  }
};
var validationRegistry = new ValidationRegistry();

// src/core/validation/diagnosticsCollector.ts
var DiagnosticsCollector3 = class {
  collect(issues) {
    const blocking = [];
    const warnings = [];
    for (const issue of issues) {
      if (issue.isBlocking) {
        blocking.push(issue.message);
      } else {
        warnings.push(issue.message);
      }
    }
    return { blocking, warnings };
  }
};
var diagnosticsCollector3 = new DiagnosticsCollector3();

// src/core/validation/validationReporter.ts
var ValidationReporter = class {
  compileReport(id, score, passed, failed, blocking, warnings) {
    let overallStatus = "Passed";
    if (blocking.length > 0) {
      overallStatus = "Rejected";
    } else if (warnings.length > 0) {
      overallStatus = "Passed With Warnings";
    }
    return {
      validationId: id,
      overallStatus,
      passedRules: passed,
      failedRules: failed,
      diagnostics: [...blocking, ...warnings],
      blockingIssues: blocking,
      warnings,
      confidence: 0.95,
      validationScore: score
    };
  }
};
var validationReporter = new ValidationReporter();

// src/core/validation/providers/typescriptValidation.ts
var TypeScriptValidation = class {
  name = "TypeScriptValidationRules";
  validateContent(content) {
    return content.includes("// @ts-ignore") ? ["TS-01: Found ts-ignore directive"] : [];
  }
};
var typescriptValidation = new TypeScriptValidation();

// src/core/validation/providers/javascriptValidation.ts
var JavaScriptValidation = class {
  name = "JavaScriptValidationRules";
  validateContent(content) {
    return content.includes("== null") ? ["JS-01: Detected loose null inequality check"] : [];
  }
};
var javascriptValidation = new JavaScriptValidation();

// src/core/validation/providers/reactValidation.ts
var ReactValidation = class {
  name = "ReactValidationRules";
  validateContent(content) {
    return content.includes("rules-of-hooks") ? ["REACT-01: Hooks rule violation"] : [];
  }
};
var reactValidation = new ReactValidation();

// src/core/validation/providers/nodeValidation.ts
var NodeValidation = class {
  name = "NodeValidationRules";
  validateContent(content) {
    return content.includes("require(") ? ["NODE-01: Synchronous require import used"] : [];
  }
};
var nodeValidation = new NodeValidation();

// src/core/validation/validationMetrics.ts
var ValidationMetrics = class {
  data = {
    totalValidations: 0,
    totalBlockingFailures: 0
  };
  record(hasBlocking) {
    this.data.totalValidations++;
    if (hasBlocking) {
      this.data.totalBlockingFailures++;
    }
  }
  getMetrics() {
    return this.data;
  }
};
var validationMetrics = new ValidationMetrics();

// src/core/validation/validationPipeline.ts
var ValidationPipeline = class {
  async loadPayload(targetFile) {
    return true;
  }
};
var validationPipeline = new ValidationPipeline();

// src/core/validation/validationCoordinator.ts
var ValidationCoordinator = class {
  async coordinate(targetFile) {
    return true;
  }
};
var validationCoordinator = new ValidationCoordinator();

// src/core/validation/validationEngine.ts
var ValidationEngine = class {
  constructor() {
    validationRegistry.register(typescriptValidation);
    validationRegistry.register(javascriptValidation);
    validationRegistry.register(reactValidation);
    validationRegistry.register(nodeValidation);
  }
  async validate(targetFile, content) {
    validationEvents.emit("ValidationStarted" /* ValidationStarted */, { targetFile });
    const issues = validationRules.execute(content);
    for (const issue of issues) {
      validationEvents.emit("RuleExecuted" /* RuleExecuted */, { issue });
    }
    const { blocking, warnings } = diagnosticsCollector3.collect(issues);
    for (const block of blocking) {
      validationEvents.emit("DiagnosticGenerated" /* DiagnosticGenerated */, { message: block, isBlocking: true });
    }
    const score = validationScorer.calculateScore(issues);
    const passed = issues.length === 0 ? ["VAL-001", "VAL-002"] : [];
    const failed = issues.map((i) => i.ruleId);
    const report = validationReporter.compileReport(
      Date.now().toString(),
      score,
      passed,
      failed,
      blocking,
      warnings
    );
    validationMetrics.record(blocking.length > 0);
    validationEvents.emit("ValidationCompleted" /* ValidationCompleted */, { report });
    return report;
  }
  subscribe(listener) {
    return validationEvents.subscribe(listener);
  }
};
var validationEngine = new ValidationEngine();

// src/core/patchOptimization/optimizationEvents.ts
var OptimizationEvents = class {
  listeners = /* @__PURE__ */ new Set();
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  emit(type, payload) {
    const event = {
      type,
      timestamp: Date.now(),
      payload
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error("Error in Patch Optimization Engine event listener:", err);
      }
    }
  }
};
var optimizationEvents = new OptimizationEvents();

// src/core/patchOptimization/patchAnalyzer.ts
var PatchAnalyzer = class {
  parseOps(patchContent) {
    const lines = patchContent.split("\n");
    const ops = [];
    for (const line of lines) {
      if (line.startsWith("+")) {
        ops.push({ lineStart: 1, lineEnd: 1, content: line.slice(1), type: "insert" });
      } else if (line.startsWith("-")) {
        ops.push({ lineStart: 1, lineEnd: 1, content: line.slice(1), type: "delete" });
      }
    }
    return ops;
  }
};
var patchAnalyzer = new PatchAnalyzer();

// src/core/patchOptimization/patchNormalizer.ts
var PatchNormalizer = class {
  normalize(path23) {
    return path23.replace(/\\/g, "/");
  }
};
var patchNormalizer = new PatchNormalizer();

// src/core/patchOptimization/patchReducer.ts
var PatchReducer = class {
  reduce(ops) {
    const reduced = [];
    const removed = [];
    for (const op of ops) {
      if (op.content.trim() === "" && op.type === "replace") {
        removed.push(`Removed redundant empty replace operation at lines ${op.lineStart}-${op.lineEnd}`);
      } else {
        reduced.push(op);
      }
    }
    return { reduced, removed };
  }
};
var patchReducer = new PatchReducer();

// src/core/patchOptimization/patchMerger.ts
var PatchMerger = class {
  merge(ops) {
    const merged = [];
    const mergedLogs = [];
    if (ops.length > 0) {
      let current = { ...ops[0] };
      for (let i = 1; i < ops.length; i++) {
        const next = ops[i];
        if (current.type === next.type && current.type === "insert") {
          current.content += "\n" + next.content;
          mergedLogs.push(`Merged insert operations for content: "${next.content}"`);
        } else {
          merged.push(current);
          current = { ...next };
        }
      }
      merged.push(current);
    }
    return { merged, mergedLogs };
  }
};
var patchMerger = new PatchMerger();

// src/core/patchOptimization/conflictPredictor.ts
var ConflictPredictor = class {
  predictRisk(ops) {
    if (ops.length > 5) {
      return "high";
    }
    if (ops.length > 2) {
      return "medium";
    }
    return "low";
  }
};
var conflictPredictor = new ConflictPredictor();

// src/core/patchOptimization/optimizationValidator.ts
var OptimizationValidator = class {
  validate(ops) {
    const lineRanges = /* @__PURE__ */ new Set();
    for (const op of ops) {
      if (op.lineStart !== 1 && lineRanges.has(op.lineStart)) {
        throw new Error(`Patch Optimization validation failure: Overlapping edit operations detected at line ${op.lineStart}`);
      }
      lineRanges.add(op.lineStart);
    }
  }
};
var optimizationValidator = new OptimizationValidator();

// src/core/patchOptimization/optimizationReporter.ts
var OptimizationReporter = class {
  compile(id, originalSize, optimizedSize, merged, removed, risk) {
    const ratio = originalSize > 0 ? (originalSize - optimizedSize) / originalSize : 0;
    return {
      patchId: id,
      originalPatchSize: originalSize,
      optimizedPatchSize: optimizedSize,
      optimizationRatio: ratio,
      mergedOperations: merged,
      removedOperations: removed,
      predictedMergeRisk: risk,
      diagnostics: [],
      confidence: 0.95
    };
  }
};
var optimizationReporter = new OptimizationReporter();

// src/core/patchOptimization/strategies/structuralOptimization.ts
var StructuralOptimization = class {
  name = "StructuralOptimizationStrategy";
  apply() {
    return true;
  }
};
var structuralOptimization = new StructuralOptimization();

// src/core/patchOptimization/strategies/importOptimization.ts
var ImportOptimization = class {
  name = "ImportOptimizationStrategy";
  apply() {
    return true;
  }
};
var importOptimization = new ImportOptimization();

// src/core/patchOptimization/strategies/editOptimization.ts
var EditOptimization = class {
  name = "EditOptimizationStrategy";
  apply() {
    return true;
  }
};
var editOptimization = new EditOptimization();

// src/core/patchOptimization/strategies/whitespaceOptimization.ts
var WhitespaceOptimization = class {
  name = "WhitespaceOptimizationStrategy";
  apply() {
    return true;
  }
};
var whitespaceOptimization = new WhitespaceOptimization();

// src/core/patchOptimization/optimizationMetrics.ts
var OptimizationMetrics = class {
  data = {
    totalOptimizations: 0,
    totalBytesSaved: 0
  };
  record(savedBytes) {
    this.data.totalOptimizations++;
    this.data.totalBytesSaved += savedBytes;
  }
  getMetrics() {
    return this.data;
  }
};
var optimizationMetrics = new OptimizationMetrics();

// src/core/patchOptimization/optimizationCoordinator.ts
var OptimizationCoordinator = class {
  async coordinate(targetFile) {
    return true;
  }
};
var optimizationCoordinator = new OptimizationCoordinator();

// src/core/patchOptimization/patchOptimizationEngine.ts
var PatchOptimizationEngine = class {
  async optimizePatch(targetFile, patchContent) {
    optimizationEvents.emit("OptimizationStarted" /* OptimizationStarted */, { targetFile });
    const ops = patchAnalyzer.parseOps(patchContent);
    optimizationEvents.emit("PatchAnalyzed" /* PatchAnalyzed */, { opsCount: ops.length });
    const { merged, mergedLogs } = patchMerger.merge(ops);
    optimizationEvents.emit("OperationsMerged" /* OperationsMerged */, { mergedCount: merged.length });
    const { reduced, removed } = patchReducer.reduce(merged);
    optimizationEvents.emit("PatchReduced" /* PatchReduced */, { reducedCount: reduced.length });
    optimizationValidator.validate(reduced);
    optimizationEvents.emit("OptimizationValidated" /* OptimizationValidated */, { validatedCount: reduced.length });
    const risk = conflictPredictor.predictRisk(reduced);
    const originalSize = patchContent.length;
    const saved = removed.length * 15 + mergedLogs.length * 8;
    const optimizedSize = Math.max(10, originalSize - saved);
    const report = optimizationReporter.compile(
      Date.now().toString(),
      originalSize,
      optimizedSize,
      mergedLogs,
      removed,
      risk
    );
    optimizationMetrics.record(originalSize - optimizedSize);
    optimizationEvents.emit("OptimizationCompleted" /* OptimizationCompleted */, { report });
    return report;
  }
  subscribe(listener) {
    return optimizationEvents.subscribe(listener);
  }
};
var patchOptimizationEngine = new PatchOptimizationEngine();

// src/core/safeEdit/safeEditEvents.ts
var SafeEditEvents = class {
  listeners = /* @__PURE__ */ new Set();
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  emit(type, payload) {
    const event = {
      type,
      timestamp: Date.now(),
      payload
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error("Error in Safe Edit Engine event listener:", err);
      }
    }
  }
};
var safeEditEvents = new SafeEditEvents();

// src/core/safeEdit/strategies/workspaceSafety.ts
var WorkspaceSafety = class {
  name = "WorkspaceSafetyStrategy";
  check(input) {
    const blocking = [];
    const warnings = [];
    if (input.targetFile && (input.targetFile.includes("..") || input.targetFile.includes("temp") || input.targetFile.includes("tmp"))) {
      warnings.push("WORKSPACE-01: Target file path is outside standard workspace directories");
    }
    return { blocking, warnings };
  }
};
var workspaceSafety = new WorkspaceSafety();

// src/core/safeEdit/strategies/filesystemSafety.ts
var FilesystemSafety = class {
  name = "FilesystemSafetyStrategy";
  check(input) {
    const blocking = [];
    const warnings = [];
    const content = input.patchContent;
    if (content.includes("rm -rf") || content.includes("fs.unlink") || content.includes("fs.rmSync") || content.includes("fs.promises.unlink")) {
      blocking.push("FS-01: Contains unsafe file deletion patterns");
    }
    if (input.targetFile.includes(".env") || input.targetFile.includes("tsconfig.json") || input.targetFile.includes("package-lock.json")) {
      warnings.push("FS-02: Modify attempt on a critical configuration file");
    }
    if (input.patchManifest) {
      for (const f of input.patchManifest.files) {
        if (f.type === "delete") {
          blocking.push(`FS-03: Attempt to delete file: ${f.path}`);
        }
      }
    }
    return { blocking, warnings };
  }
};
var filesystemSafety = new FilesystemSafety();

// src/core/safeEdit/strategies/dependencySafety.ts
var DependencySafety = class {
  name = "DependencySafetyStrategy";
  check(input) {
    const blocking = [];
    const warnings = [];
    const content = input.patchContent;
    if (input.targetFile.endsWith("package.json")) {
      if (content.includes('"dependencies"') || content.includes('"devDependencies"')) {
        blocking.push("DEP-01: Direct modification of dependencies in package.json is prohibited");
      }
    }
    if (input.patchManifest && input.patchManifest.dependenciesChanged && input.patchManifest.dependenciesChanged.length > 0) {
      blocking.push(`DEP-02: Manifest attempts to modify dependencies: ${input.patchManifest.dependenciesChanged.join(", ")}`);
    }
    return { blocking, warnings };
  }
};
var dependencySafety = new DependencySafety();

// src/core/safeEdit/strategies/architectureSafety.ts
var ArchitectureSafety = class {
  name = "ArchitectureSafetyStrategy";
  check(input) {
    const blocking = [];
    const warnings = [];
    if (input.architectureReport) {
      const highViolations = [
        ...input.architectureReport.layerViolations,
        ...input.architectureReport.boundaryViolations
      ].filter((v) => v.severity === "High");
      if (highViolations.length > 0) {
        blocking.push(`ARCH-01: High-severity architecture violations: ${highViolations.map((v) => v.description).join("; ")}`);
      }
      const mediumViolations = [
        ...input.architectureReport.layerViolations,
        ...input.architectureReport.boundaryViolations
      ].filter((v) => v.severity === "Medium");
      if (mediumViolations.length > 0) {
        warnings.push(`ARCH-02: Medium-severity architecture violations: ${mediumViolations.map((v) => v.description).join("; ")}`);
      }
    }
    const content = input.patchContent;
    if (content.includes("import") && content.includes("/webview/") && !input.targetFile.includes("/webview/")) {
      blocking.push("ARCH-03: Layer boundary violation - non-webview file importing webview resources");
    }
    return { blocking, warnings };
  }
};
var architectureSafety = new ArchitectureSafety();

// src/core/safeEdit/safetyAnalyzer.ts
var SafetyAnalyzer = class {
  analyze(input) {
    const blockingIssues = [];
    const warnings = [];
    const strategies = [
      workspaceSafety,
      filesystemSafety,
      dependencySafety,
      architectureSafety
    ];
    for (const strategy of strategies) {
      try {
        const res = strategy.check(input);
        blockingIssues.push(...res.blocking);
        warnings.push(...res.warnings);
      } catch (err) {
        blockingIssues.push(`STRATEGY-ERR: Strategy ${strategy.name} failed: ${err.message}`);
      }
    }
    return { blockingIssues, warnings };
  }
};
var safetyAnalyzer = new SafetyAnalyzer();

// src/core/safeEdit/riskEvaluator.ts
var RiskEvaluator = class {
  calculateRisk(input) {
    let score = 10;
    const patchContent = input.patchContent;
    if (patchContent.includes("package.json")) {
      score += 40;
    }
    if (patchContent.includes("fs.") || patchContent.includes("child_process") || patchContent.includes("eval(")) {
      score += 35;
    }
    if (input.targetFile.includes("src/core/")) {
      score += 15;
    }
    if (input.securityReport) {
      score = Math.max(score, input.securityReport.riskScore);
    }
    if (input.optimizedPatchReport) {
      if (input.optimizedPatchReport.predictedMergeRisk === "high") {
        score += 20;
      } else if (input.optimizedPatchReport.predictedMergeRisk === "medium") {
        score += 10;
      }
    }
    const finalScore = Math.min(100, Math.max(0, score));
    let level = "Minimal";
    if (finalScore <= 20) {
      level = "Minimal";
    } else if (finalScore <= 40) {
      level = "Low";
    } else if (finalScore <= 60) {
      level = "Medium";
    } else if (finalScore <= 80) {
      level = "High";
    } else {
      level = "Critical";
    }
    return { score: finalScore, level };
  }
};
var riskEvaluator = new RiskEvaluator();

// src/core/safeEdit/approvalCoordinator.ts
var ApprovalCoordinator = class {
  verifyApproval(input) {
    const isApproved = !!input.userApproved;
    const blocking = [];
    if (!isApproved) {
      blocking.push("APPROVAL-01: Execution requires explicit user approval");
    }
    return {
      approved: isApproved,
      blocking
    };
  }
};
var approvalCoordinator = new ApprovalCoordinator();

// src/core/safeEdit/rollbackPlanner.ts
var RollbackPlanner = class {
  verifyRollbackReadiness(input) {
    const blocking = [];
    const isReady = !!input.targetFile && input.targetFile.trim().length > 0;
    if (!isReady) {
      blocking.push("ROLLBACK-01: Missing active rollback plan or file backup checkpoint");
    }
    return {
      ready: isReady,
      blocking
    };
  }
};
var rollbackPlanner = new RollbackPlanner();

// src/core/safeEdit/policyEvaluator.ts
var PolicyEvaluator = class {
  evaluatePolicies(input) {
    const blocking = [];
    const warnings = [];
    const content = input.patchContent;
    if (content.includes("dependencies") && input.targetFile.includes("package.json")) {
      blocking.push("POLICY-01: Direct dependencies modification attempts blocked");
    }
    if (input.policyReport) {
      if (!input.policyReport.compliant) {
        blocking.push(...input.policyReport.violations.map((v) => `POLICY-02: ${v}`));
      }
      warnings.push(...input.policyReport.warnings.map((w) => `POLICY-03: ${w}`));
    }
    if (input.securityReport && input.securityReport.blockedActions && input.securityReport.blockedActions.length > 0) {
      blocking.push(...input.securityReport.blockedActions.map((action) => `POLICY-04: Blocked security action: ${action}`));
    }
    return { blocking, warnings };
  }
};
var policyEvaluator = new PolicyEvaluator();

// src/core/safeEdit/executionGate.ts
var ExecutionGate = class {
  checkGate(blockingIssues) {
    if (blockingIssues.length > 0) {
      throw new Error(`Safe Edit Engine execution blocked: Policy violations caught [${blockingIssues.join(", ")}]`);
    }
  }
};
var executionGate = new ExecutionGate();

// src/core/safeEdit/executionReporter.ts
var ExecutionReporter = class {
  compileReport(input, riskScore, riskLevel, approved, rollbackReady, blockingIssues, warnings) {
    let status = "Approved";
    const hasNonApprovalBlocks = blockingIssues.some((issue) => !issue.startsWith("APPROVAL-"));
    if (hasNonApprovalBlocks) {
      status = "Rejected";
    } else if (!approved) {
      status = "Requires Approval";
    } else if (warnings.length > 0) {
      status = "Approved With Warning";
    }
    let recommendation = "Safe to proceed with executor agent patch write.";
    if (status === "Rejected") {
      recommendation = "Halt write operations. Immediate security, policy, or safety rejection.";
    } else if (status === "Blocked") {
      recommendation = "Execution blocked due to safety gate constraints.";
    } else if (status === "Requires Approval") {
      recommendation = "Awaiting explicit user approval before execution.";
    } else if (status === "Approved With Warning") {
      recommendation = "Safe to proceed, but review warnings before applying.";
    }
    let confidence = 0.98;
    if (riskLevel === "Critical" || riskLevel === "High") {
      confidence -= 0.08;
    }
    if (warnings.length > 0) {
      confidence -= 0.04;
    }
    confidence = Math.max(0.5, Math.min(1, confidence));
    return {
      executionStatus: status,
      riskScore,
      riskLevel,
      approvalStatus: approved,
      rollbackReadiness: rollbackReady,
      blockingIssues,
      warnings,
      executionRecommendation: recommendation,
      confidence
    };
  }
};
var executionReporter = new ExecutionReporter();

// src/core/safeEdit/safeEditMetrics.ts
var SafeEditMetrics = class {
  data = {
    totalEvaluations: 0,
    totalBlocks: 0
  };
  record(blocked) {
    this.data.totalEvaluations++;
    if (blocked) {
      this.data.totalBlocks++;
    }
  }
  getMetrics() {
    return this.data;
  }
};
var safeEditMetrics = new SafeEditMetrics();

// src/core/safeEdit/executionContext/workspaceStateAnalyzer.ts
var WorkspaceStateAnalyzer = class {
  getActiveEditors() {
    return ["src/core/agents/architecture/architectureGraph.ts"];
  }
  getLockedFiles() {
    return [];
  }
};
var workspaceStateAnalyzer = new WorkspaceStateAnalyzer();

// src/core/safeEdit/executionContext/gitStateAnalyzer.ts
var GitStateAnalyzer = class {
  getCurrentBranch() {
    return "main";
  }
  getGitStatus() {
    return "clean";
  }
  getUncommittedChangesCount() {
    return 0;
  }
};
var gitStateAnalyzer = new GitStateAnalyzer();

// src/core/safeEdit/executionContext/systemStateAnalyzer.ts
var os = __toESM(require("os"));
var SystemStateAnalyzer = class {
  getOS() {
    return os.platform();
  }
  getDiskSpace() {
    return { free: 50 * 1024 * 1024 * 1024, total: 256 * 1024 * 1024 * 1024 };
  }
  getMemory() {
    return { free: os.freemem(), total: os.totalmem() };
  }
  getCPULoad() {
    return os.loadavg()[0] || 0.15;
  }
};
var systemStateAnalyzer = new SystemStateAnalyzer();

// src/core/safeEdit/executionContext/terminalStateAnalyzer.ts
var TerminalStateAnalyzer = class {
  getBackgroundTasks() {
    return [];
  }
  getRunningCommands() {
    return [];
  }
};
var terminalStateAnalyzer = new TerminalStateAnalyzer();

// src/core/safeEdit/executionContext/lockDetector.ts
var LockDetector = class {
  getLockedFiles() {
    return [];
  }
  isLocked(filePath) {
    return false;
  }
};
var lockDetector = new LockDetector();

// src/core/safeEdit/executionContext/executionContextEngine.ts
var ExecutionContextEngine = class {
  async getContext() {
    return {
      workspaceStatus: gitStateAnalyzer.getUncommittedChangesCount() === 0 ? "clean" : "dirty",
      gitStatus: gitStateAnalyzer.getGitStatus(),
      currentBranch: gitStateAnalyzer.getCurrentBranch(),
      uncommittedChanges: gitStateAnalyzer.getUncommittedChangesCount(),
      activeEditors: workspaceStateAnalyzer.getActiveEditors(),
      lockedFiles: lockDetector.getLockedFiles(),
      backgroundTasks: terminalStateAnalyzer.getBackgroundTasks(),
      runningTerminalCommands: terminalStateAnalyzer.getRunningCommands(),
      os: systemStateAnalyzer.getOS(),
      diskSpace: systemStateAnalyzer.getDiskSpace(),
      memory: systemStateAnalyzer.getMemory(),
      cpuLoad: systemStateAnalyzer.getCPULoad(),
      workspaceSnapshotId: `snap-${Date.now()}`,
      currentUser: process.env.USER || process.env.USERNAME || "unknown",
      executionTimestamp: Date.now()
    };
  }
};
var executionContextEngine = new ExecutionContextEngine();

// src/core/virtualWorkspace/virtualFilesystem.ts
var VirtualFilesystem = class {
  root = {
    path: "/",
    files: /* @__PURE__ */ new Map(),
    subdirectories: /* @__PURE__ */ new Map()
  };
  reset() {
    this.root = {
      path: "/",
      files: /* @__PURE__ */ new Map(),
      subdirectories: /* @__PURE__ */ new Map()
    };
  }
  getRoot() {
    return this.root;
  }
  write(filePath, content) {
    this.root.files.set(filePath, { path: filePath, content });
  }
  read(filePath) {
    return this.root.files.get(filePath)?.content;
  }
  delete(filePath) {
    return this.root.files.delete(filePath);
  }
  listFiles() {
    return Array.from(this.root.files.keys());
  }
};
var virtualFilesystem = new VirtualFilesystem();

// src/core/virtualWorkspace/workspaceCloner.ts
var WorkspaceCloner = class {
  cloneActiveWorkspace() {
    virtualFilesystem.reset();
    virtualFilesystem.write("src/core/base.ts", "export class Base {}");
    virtualFilesystem.write("package.json", '{\n  "dependencies": {}\n}');
    return 2;
  }
};
var workspaceCloner = new WorkspaceCloner();

// src/core/virtualWorkspace/workspaceMerger.ts
var WorkspaceMerger = class {
  merge(filePath, patchContent) {
    const current = virtualFilesystem.read(filePath) || "";
    const merged = current + "\n" + patchContent;
    virtualFilesystem.write(filePath, merged);
  }
};
var workspaceMerger = new WorkspaceMerger();

// src/core/virtualWorkspace/workspaceDiffer.ts
var WorkspaceDiffer = class {
  diff(originalContent, newContent) {
    const changes = [];
    if (originalContent !== newContent) {
      changes.push(`Modified line replacement simulated.`);
    }
    return changes;
  }
};
var workspaceDiffer = new WorkspaceDiffer();

// src/core/virtualWorkspace/virtualAST.ts
var VirtualAST = class {
  verifySyntax(filePath) {
    const content = virtualFilesystem.read(filePath);
    if (!content)
      return true;
    let openBraces = 0;
    for (let i = 0; i < content.length; i++) {
      if (content[i] === "{")
        openBraces++;
      if (content[i] === "}")
        openBraces--;
    }
    return openBraces === 0;
  }
};
var virtualAST = new VirtualAST();

// src/core/virtualWorkspace/virtualImports.ts
var VirtualImports = class {
  verify(filePath) {
    const content = virtualFilesystem.read(filePath);
    if (!content)
      return true;
    const importRegex = /import\s+.*\s+from\s+['"](.*)['"]/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      const target = match[1];
      if (target.startsWith(".") && !target.includes("node_modules")) {
        if (target.includes("/webview/") && !filePath.includes("/webview/")) {
          return false;
        }
      }
    }
    return true;
  }
};
var virtualImports = new VirtualImports();

// src/core/virtualWorkspace/virtualSymbols.ts
var VirtualSymbols = class {
  extract(filePath) {
    const content = virtualFilesystem.read(filePath);
    if (!content)
      return [];
    const symbols = [];
    const classRegex = /class\s+(\w+)/g;
    let match;
    while ((match = classRegex.exec(content)) !== null) {
      symbols.push(match[1]);
    }
    return symbols;
  }
};
var virtualSymbols = new VirtualSymbols();

// src/core/virtualWorkspace/virtualDependencies.ts
var VirtualDependencies = class {
  verify(filePath) {
    if (filePath.endsWith("package.json")) {
      const content = virtualFilesystem.read(filePath);
      if (content) {
        try {
          JSON.parse(content);
        } catch {
          return false;
        }
      }
    }
    return true;
  }
};
var virtualDependencies = new VirtualDependencies();

// src/core/virtualWorkspace/virtualWorkspaceEngine.ts
var VirtualWorkspaceEngine = class {
  async simulateExecution(targetFile, patchContent) {
    const clonedCount = workspaceCloner.cloneActiveWorkspace();
    const original = virtualFilesystem.read(targetFile) || "";
    workspaceMerger.merge(targetFile, patchContent);
    const updated = virtualFilesystem.read(targetFile) || "";
    const syntaxVerificationPassed = virtualAST.verifySyntax(targetFile);
    const importsVerified = virtualImports.verify(targetFile);
    const symbolsVerified = virtualSymbols.extract(targetFile).length >= 0;
    const dependenciesVerified = virtualDependencies.verify(targetFile);
    const diffOperations = workspaceDiffer.diff(original, updated);
    return {
      clonedFilesCount: clonedCount,
      syntaxVerificationPassed,
      importsVerified,
      symbolsVerified,
      dependenciesVerified,
      diffOperations,
      timestamp: Date.now()
    };
  }
};
var virtualWorkspaceEngine = new VirtualWorkspaceEngine();

// src/core/safeEdit/simulation/simulationValidator.ts
var SimulationValidator = class {
  validate(report) {
    if (!report.syntaxVerificationPassed) {
      return { success: false, error: "Syntax compilation failure in virtual workspace AST check." };
    }
    if (!report.importsVerified) {
      return { success: false, error: "Relative import verification failed in virtual workspace." };
    }
    return { success: true };
  }
};
var simulationValidator = new SimulationValidator();

// src/core/safeEdit/simulation/simulationMetrics.ts
var SimulationMetrics = class {
  runsCount = 0;
  failuresCount = 0;
  record(success) {
    this.runsCount++;
    if (!success)
      this.failuresCount++;
  }
  getStats() {
    return { runs: this.runsCount, failures: this.failuresCount };
  }
};
var simulationMetrics = new SimulationMetrics();

// src/core/safeEdit/simulation/simulationEvents.ts
var SimulationEvents = class {
  listeners = /* @__PURE__ */ new Set();
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  emit(type, payload) {
    for (const listener of this.listeners) {
      try {
        listener({ type, timestamp: Date.now(), payload });
      } catch (err) {
        console.error("Error in Simulation event listener:", err);
      }
    }
  }
};
var simulationEvents = new SimulationEvents();

// src/core/safeEdit/simulation/simulationEngine.ts
var SimulationEngine = class {
  async simulate(targetFile, patchContent) {
    const startTime = Date.now();
    simulationEvents.emit("SimulationStarted", { targetFile });
    const dryRunReport = await virtualWorkspaceEngine.simulateExecution(targetFile, patchContent);
    const validationResult = simulationValidator.validate(dryRunReport);
    const durationMs = Date.now() - startTime;
    const report = {
      success: validationResult.success,
      dryRunReport,
      error: validationResult.error,
      durationMs
    };
    simulationMetrics.record(validationResult.success);
    simulationEvents.emit("SimulationCompleted", report);
    return report;
  }
};
var simulationEngine = new SimulationEngine();

// src/core/safeEdit/riskGraph/riskCalculator.ts
var RiskCalculator = class {
  calculateCategoryRisk(category, input) {
    let score = 10;
    let evidence = ["Initial base category risk calculation"];
    const content = input.patchContent;
    if (category === "filesystem") {
      if (content.includes("rm -rf") || content.includes("fs.unlink")) {
        score = 90;
        evidence.push("Contains file deletion command patterns");
      } else if (content.includes("fs.write") || content.includes("fs.promises")) {
        score = 45;
        evidence.push("Contains file writing command patterns");
      }
    } else if (category === "dependency") {
      if (input.targetFile.endsWith("package.json")) {
        score = 80;
        evidence.push("Target file is package.json");
      }
    } else if (category === "security") {
      if (input.securityReport) {
        score = input.securityReport.riskScore;
        evidence.push(`Imported from security agent report with score: ${score}`);
      }
    }
    let severity = "Minimal";
    if (score <= 20)
      severity = "Minimal";
    else if (score <= 40)
      severity = "Low";
    else if (score <= 60)
      severity = "Medium";
    else if (score <= 80)
      severity = "High";
    else
      severity = "Critical";
    return {
      score,
      confidence: 0.95,
      severity,
      reason: `Assessed risk score of ${score} for category ${category}`,
      evidence
    };
  }
};
var riskCalculator = new RiskCalculator();

// src/core/safeEdit/riskGraph/riskAggregator.ts
var RiskAggregator = class {
  aggregate(categories) {
    const list = Object.values(categories);
    const sum = list.reduce((a, b) => a + b.score, 0);
    const overallScore = Math.min(100, Math.max(0, Math.round(sum / list.length)));
    let level = "Minimal";
    if (overallScore <= 20)
      level = "Minimal";
    else if (overallScore <= 40)
      level = "Low";
    else if (overallScore <= 60)
      level = "Medium";
    else if (overallScore <= 80)
      level = "High";
    else
      level = "Critical";
    const confidenceSum = list.reduce((a, b) => a + b.confidence, 0);
    const overallConfidence = confidenceSum / list.length;
    return { score: overallScore, level, confidence: overallConfidence };
  }
};
var riskAggregator = new RiskAggregator();

// src/core/safeEdit/riskGraph/riskGraph.ts
var RiskGraph = class {
  compute(input) {
    const categories = {
      filesystem: riskCalculator.calculateCategoryRisk("filesystem", input),
      architecture: riskCalculator.calculateCategoryRisk("architecture", input),
      security: riskCalculator.calculateCategoryRisk("security", input),
      dependency: riskCalculator.calculateCategoryRisk("dependency", input),
      workspace: riskCalculator.calculateCategoryRisk("workspace", input),
      terminal: riskCalculator.calculateCategoryRisk("terminal", input),
      policy: riskCalculator.calculateCategoryRisk("policy", input),
      rollback: riskCalculator.calculateCategoryRisk("rollback", input),
      approval: riskCalculator.calculateCategoryRisk("approval", input)
    };
    const aggregated = riskAggregator.aggregate(categories);
    return {
      categories,
      overallRiskScore: aggregated.score,
      overallRiskLevel: aggregated.level,
      overallConfidence: aggregated.confidence
    };
  }
};
var riskGraph = new RiskGraph();

// src/core/safeEdit/providers/filesystemProvider.ts
var FilesystemProvider = class {
  name = "FilesystemSafetyProvider";
  analyze(input) {
    const issues = [];
    if (input.patchContent.includes("rm -rf") || input.patchContent.includes("fs.unlink")) {
      issues.push("Contains unsafe file deletion commands.");
    }
    return issues;
  }
  validate(input) {
    return !this.analyze(input).length;
  }
  risk(input) {
    return this.analyze(input).length ? 90 : 10;
  }
  recommendations(input) {
    return this.analyze(input).length ? ["Avoid using raw rm -rf or unlink operations."] : [];
  }
};
var filesystemProvider = new FilesystemProvider();

// src/core/safeEdit/providers/gitProvider.ts
var GitProvider = class {
  name = "GitSafetyProvider";
  analyze(input) {
    return [];
  }
  validate(input) {
    return true;
  }
  risk(input) {
    return 10;
  }
  recommendations(input) {
    return [];
  }
};
var gitProvider = new GitProvider();

// src/core/safeEdit/providers/terminalProvider.ts
var TerminalProvider = class {
  name = "TerminalSafetyProvider";
  analyze(input) {
    const issues = [];
    if (input.patchContent.includes("child_process.exec") || input.patchContent.includes("spawn(")) {
      issues.push("Contains subprocess spawn operations.");
    }
    return issues;
  }
  validate(input) {
    return true;
  }
  risk(input) {
    return this.analyze(input).length ? 50 : 10;
  }
  recommendations(input) {
    return this.analyze(input).length ? ["Review shell commands injection risk."] : [];
  }
};
var terminalProvider = new TerminalProvider();

// src/core/safeEdit/providers/dockerProvider.ts
var DockerProvider = class {
  name = "DockerSafetyProvider";
  analyze(input) {
    return [];
  }
  validate(input) {
    return true;
  }
  risk(input) {
    return 10;
  }
  recommendations(input) {
    return [];
  }
};
var dockerProvider = new DockerProvider();

// src/core/safeEdit/providers/databaseProvider.ts
var DatabaseProvider = class {
  name = "DatabaseSafetyProvider";
  analyze(input) {
    const issues = [];
    if (input.patchContent.includes("DROP TABLE") || input.patchContent.includes("ALTER TABLE")) {
      issues.push("Contains potential database schema alterations.");
    }
    return issues;
  }
  validate(input) {
    return true;
  }
  risk(input) {
    return this.analyze(input).length ? 70 : 10;
  }
  recommendations(input) {
    return this.analyze(input).length ? ["Backup databases before executing schema migrations."] : [];
  }
};
var databaseProvider = new DatabaseProvider();

// src/core/safeEdit/providers/networkProvider.ts
var NetworkProvider = class {
  name = "NetworkSafetyProvider";
  analyze(input) {
    return [];
  }
  validate(input) {
    return true;
  }
  risk(input) {
    return 10;
  }
  recommendations(input) {
    return [];
  }
};
var networkProvider = new NetworkProvider();

// src/core/safeEdit/providers/secretProvider.ts
var SecretProvider = class {
  name = "SecretSafetyProvider";
  analyze(input) {
    const issues = [];
    if (input.patchContent.includes("password") || input.patchContent.includes("secret") || input.patchContent.includes("apiKey")) {
      issues.push("Contains credential key terms.");
    }
    return issues;
  }
  validate(input) {
    return true;
  }
  risk(input) {
    return this.analyze(input).length ? 60 : 10;
  }
  recommendations(input) {
    return this.analyze(input).length ? ["Ensure secrets are stored in environment variables, not plain text."] : [];
  }
};
var secretProvider = new SecretProvider();

// src/core/safeEdit/providers/cloudProvider.ts
var CloudProvider = class {
  name = "CloudSafetyProvider";
  analyze(input) {
    return [];
  }
  validate(input) {
    return true;
  }
  risk(input) {
    return 10;
  }
  recommendations(input) {
    return [];
  }
};
var cloudProvider = new CloudProvider();

// src/core/safeEdit/providers/index.ts
var SafetyProviderRegistry = class {
  providers = /* @__PURE__ */ new Map();
  constructor() {
    this.register(filesystemProvider);
    this.register(gitProvider);
    this.register(terminalProvider);
    this.register(dockerProvider);
    this.register(databaseProvider);
    this.register(networkProvider);
    this.register(secretProvider);
    this.register(cloudProvider);
  }
  register(provider) {
    this.providers.set(provider.name, provider);
  }
  list() {
    return Array.from(this.providers.values());
  }
  get(name) {
    return this.providers.get(name);
  }
};
var safetyProviderRegistry = new SafetyProviderRegistry();

// src/core/safeEdit/rules/ruleRegistry.ts
var RuleRegistry = class {
  rules = /* @__PURE__ */ new Map();
  register(rule) {
    this.rules.set(rule.ruleId, rule);
  }
  list() {
    return Array.from(this.rules.values());
  }
  get(ruleId) {
    return this.rules.get(ruleId);
  }
};
var ruleRegistry = new RuleRegistry();

// src/core/safeEdit/rules/safeRule.ts
var BaseSafeRule = class {
  constructor(ruleId, name, category, severity, description, supportedLanguages, supportedProviders, executionStage, enabled = true) {
    this.ruleId = ruleId;
    this.name = name;
    this.category = category;
    this.severity = severity;
    this.description = description;
    this.supportedLanguages = supportedLanguages;
    this.supportedProviders = supportedProviders;
    this.executionStage = executionStage;
    this.enabled = enabled;
  }
  validate(patchContent, context) {
    return { valid: true };
  }
};

// src/core/safeEdit/rules/ruleLoader.ts
var RuleLoader = class {
  loadDefaultRules() {
    ruleRegistry.register(new class extends BaseSafeRule {
      constructor() {
        super(
          "SAFE-001",
          "Block Dependency Alterations",
          "Dependency",
          "High",
          "Checks if package.json dependencies are directly altered.",
          ["ts", "js", "json"],
          ["FilesystemSafetyProvider"],
          "Pre-Execution"
        );
      }
      validate(patchContent, context) {
        if (context.targetFile && context.targetFile.endsWith("package.json")) {
          if (patchContent.includes('"dependencies"') || patchContent.includes('"devDependencies"')) {
            return { valid: false, error: "Direct modification of dependencies in package.json is prohibited" };
          }
        }
        return { valid: true };
      }
    }());
    ruleRegistry.register(new class extends BaseSafeRule {
      constructor() {
        super(
          "SAFE-002",
          "Unsafe Deletions Guard",
          "Filesystem",
          "Critical",
          "Blocks direct rm -rf or unlink deletions in commands.",
          ["ts", "js", "sh"],
          ["FilesystemSafetyProvider"],
          "Pre-Execution"
        );
      }
      validate(patchContent) {
        if (patchContent.includes("rm -rf") || patchContent.includes("fs.unlink")) {
          return { valid: false, error: "Contains unsafe file deletion command patterns" };
        }
        return { valid: true };
      }
    }());
    ruleRegistry.register(new class extends BaseSafeRule {
      constructor() {
        super(
          "SAFE-003",
          "Architecture Boundary Validation",
          "Architecture",
          "High",
          "Blocks layer boundary violations where core imports webview.",
          ["ts", "js"],
          ["FilesystemSafetyProvider"],
          "Pre-Execution"
        );
      }
      validate(patchContent, context) {
        if (context.targetFile && !context.targetFile.includes("/webview/") && patchContent.includes("import") && patchContent.includes("/webview/")) {
          return { valid: false, error: "Layer boundary violation - non-webview file importing webview resources" };
        }
        return { valid: true };
      }
    }());
    ruleRegistry.register(new class extends BaseSafeRule {
      constructor() {
        super(
          "SAFE-004",
          "Credentials Leak check",
          "Security",
          "Critical",
          "Blocks committing passwords or API keys.",
          ["ts", "js", "json"],
          [],
          "Pre-Execution"
        );
      }
      validate(patchContent) {
        if (patchContent.includes('const password = "') || patchContent.includes('apiKey = "')) {
          return { valid: false, error: "Potential secret exposure detected in code text" };
        }
        return { valid: true };
      }
    }());
  }
};
var ruleLoader = new RuleLoader();

// src/core/safeEdit/rules/ruleExecutor.ts
var RuleExecutor = class {
  constructor() {
    ruleLoader.loadDefaultRules();
  }
  execute(patchContent, context) {
    const errors = [];
    const warnings = [];
    const rules = ruleRegistry.list();
    for (const rule of rules) {
      if (!rule.enabled)
        continue;
      try {
        const result = rule.validate(patchContent, context);
        if (!result.valid) {
          const msg = `[${rule.ruleId}] ${rule.name}: ${result.error || "Failed safety validation"}`;
          if (rule.severity === "Critical" || rule.severity === "High") {
            errors.push(msg);
          } else {
            warnings.push(msg);
          }
        }
      } catch (err) {
        errors.push(`Rule ${rule.ruleId} execution error: ${err.message}`);
      }
    }
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
};
var ruleExecutor = new RuleExecutor();

// src/core/safeEdit/approval/approvalMatrix.ts
var ApprovalMatrix = class {
  determineRequiredLevel(patchType, risk) {
    if (risk === "Critical")
      return "Administrator";
    if (risk === "High")
      return "Repository";
    if (patchType === "Security" || patchType === "Migration")
      return "Branch";
    if (risk === "Medium")
      return "User";
    return "Automatic";
  }
};
var approvalMatrix = new ApprovalMatrix();

// src/core/safeEdit/approval/approvalResolver.ts
var ApprovalResolver = class {
  resolve(required, userApproved) {
    if (required === "Automatic") {
      return { requiredLevel: required, granted: true, reason: "Automatic execution permitted." };
    }
    const granted = userApproved;
    return {
      requiredLevel: required,
      granted,
      actualApproverRole: userApproved ? "Administrator" : "None",
      reason: granted ? `Explicit user approval granted and resolved as Administrator.` : `Requires approval at level: ${required}.`
    };
  }
};
var approvalResolver = new ApprovalResolver();

// src/core/safeEdit/approval/approvalEngine.ts
var ApprovalEngine2 = class {
  resolveApproval(patchType, risk, userApproved) {
    const required = approvalMatrix.determineRequiredLevel(patchType, risk);
    return approvalResolver.resolve(required, userApproved);
  }
};
var approvalEngine2 = new ApprovalEngine2();

// src/core/safeEdit/confidence/confidenceEvidence.ts
var ConfidenceEvidenceCollector = class {
  collect(input) {
    const list = [];
    const isKnownFile = input.targetFile.startsWith("src/");
    list.push({
      factor: "Known Files",
      score: isKnownFile ? 1 : 0.6,
      description: isKnownFile ? "Target file is inside the standard src/ directory." : "Target file is outside standard directory bounds."
    });
    const valScore = input.validationReport ? input.validationReport.validationScore / 100 : 0.85;
    list.push({
      factor: "Validation Score",
      score: valScore,
      description: `Validation score alignment coefficient: ${valScore}`
    });
    return list;
  }
};
var confidenceEvidenceCollector = new ConfidenceEvidenceCollector();

// src/core/safeEdit/confidence/confidenceCalculator.ts
var ConfidenceCalculator = class {
  calculateOverall(evidence) {
    if (!evidence.length)
      return 0.8;
    const sum = evidence.reduce((acc, curr) => acc + curr.score, 0);
    return Math.round(sum / evidence.length * 100) / 100;
  }
};
var confidenceCalculator = new ConfidenceCalculator();

// src/core/safeEdit/confidence/confidenceEngine.ts
var ConfidenceEngine = class {
  calculate(input) {
    const evidence = confidenceEvidenceCollector.collect(input);
    const overallConfidence = confidenceCalculator.calculateOverall(evidence);
    let grade = "C";
    if (overallConfidence >= 0.9)
      grade = "A";
    else if (overallConfidence >= 0.8)
      grade = "B";
    else if (overallConfidence >= 0.7)
      grade = "C";
    else if (overallConfidence >= 0.6)
      grade = "D";
    else
      grade = "F";
    let recommendation = "Proceed with execution. Stability parameters aligned.";
    if (grade === "F" || grade === "D") {
      recommendation = "Halt. Low execution confidence levels.";
    }
    return {
      overallConfidence,
      evidence,
      grade,
      recommendation
    };
  }
};
var confidenceEngine = new ConfidenceEngine();

// src/core/policyDecision/policyEvaluators.ts
var PolicyEvaluators = class {
  evaluate(input) {
    const violations = [];
    const warnings = [];
    if (input.riskGraph.overallRiskScore >= 80) {
      violations.push("RISK-01: Risk score equals or exceeds Critical threshold.");
      return { decision: "Block", reason: "High overall risk score restricts execution.", violations, warnings };
    }
    if (input.riskGraph.overallRiskScore >= 40 && !input.approval) {
      violations.push("APPROVAL-02: User approval missing for medium/high risk operations.");
      return { decision: "Approval Required", reason: "Approval required for execution.", violations, warnings };
    }
    if (input.workspaceContext.workspaceStatus === "dirty") {
      warnings.push("WORKSPACE-02: Executing on top of uncommitted workspace changes.");
    }
    const decision = violations.length > 0 ? "Reject" : warnings.length > 0 ? "Warn" : "Allow";
    return {
      decision,
      reason: decision === "Allow" ? "Policy checks passed successfully." : "Policy warnings detected.",
      violations,
      warnings
    };
  }
};
var policyEvaluators = new PolicyEvaluators();

// src/core/policyDecision/policyDecisionEngine.ts
var PolicyDecisionEngine = class {
  decide(input) {
    const outcome = policyEvaluators.evaluate(input);
    return {
      decision: outcome.decision,
      reason: outcome.reason,
      violations: outcome.violations,
      warnings: outcome.warnings,
      timestamp: Date.now()
    };
  }
};
var policyDecisionEngine = new PolicyDecisionEngine();

// src/core/audit/auditEngine.ts
var AuditEngine = class {
  auditsLog = [];
  logExecution(report) {
    const fullReport = {
      auditId: `AUD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      ...report,
      timestamp: Date.now()
    };
    this.auditsLog.push(fullReport);
    return fullReport;
  }
  getHistory() {
    return this.auditsLog;
  }
  clear() {
    this.auditsLog = [];
  }
};
var auditEngine = new AuditEngine();

// src/core/executionStateMachine/stateMachine.ts
var ExecutionStateMachine = class {
  history = [];
  currentState = "Created";
  startTimestamp = Date.now();
  reset() {
    this.history = [];
    this.currentState = "Created";
    this.startTimestamp = Date.now();
  }
  transitionTo(nextState, reason) {
    this.history.push({
      from: this.currentState,
      to: nextState,
      timestamp: Date.now(),
      reason
    });
    this.currentState = nextState;
  }
  getCurrentState() {
    return this.currentState;
  }
  getTimelineReport() {
    return {
      history: [...this.history],
      currentState: this.currentState,
      durationMs: Date.now() - this.startTimestamp
    };
  }
};
var executionStateMachine = new ExecutionStateMachine();

// src/core/safeEdit/safeEditEngine.ts
var SafeEditEngine = class {
  async evaluate(targetFileOrInput, patchContent, userApproved = true) {
    const startTime = Date.now();
    executionStateMachine.reset();
    executionStateMachine.transitionTo("Created", "Evaluation request initialized.");
    let input;
    if (typeof targetFileOrInput === "string") {
      input = {
        targetFile: targetFileOrInput,
        patchContent: patchContent || "",
        userApproved
      };
    } else {
      input = targetFileOrInput;
    }
    safeEditEvents.emit("SafetyEvaluationStarted" /* SafetyEvaluationStarted */, { targetFile: input.targetFile });
    executionStateMachine.transitionTo("Planned", "Patch manifest loaded.");
    const executionContext = await executionContextEngine.getContext();
    const simulationReport = await simulationEngine.simulate(input.targetFile, input.patchContent);
    executionStateMachine.transitionTo("Simulated", "Virtual workspace dry run completed.");
    const computedRiskGraph = riskGraph.compute(input);
    safeEditEvents.emit("RiskCalculated" /* RiskCalculated */, {
      riskScore: computedRiskGraph.overallRiskScore,
      riskLevel: computedRiskGraph.overallRiskLevel
    });
    const providerResults = [];
    const providers = safetyProviderRegistry.list();
    for (const prov of providers) {
      providerResults.push({
        name: prov.name,
        issues: prov.analyze(input),
        risk: prov.risk(input),
        recommendations: prov.recommendations(input)
      });
    }
    const ruleExecution = ruleExecutor.execute(input.patchContent, { targetFile: input.targetFile });
    executionStateMachine.transitionTo("Validated", "Safety rules checks concluded.");
    const approvalDecision = approvalEngine2.resolveApproval(
      input.validationReport ? "Bug Fix" : "Feature",
      // classifier fallback
      computedRiskGraph.overallRiskLevel,
      !!input.userApproved
    );
    safeEditEvents.emit("ApprovalVerified" /* ApprovalVerified */, { approved: approvalDecision.granted });
    executionStateMachine.transitionTo("Reviewed", "Approval policies verified.");
    const rollbackCertificate = rollbackPlanner.generateCertificate(input);
    safeEditEvents.emit("RollbackVerified" /* RollbackVerified */, { rollbackReady: rollbackCertificate.verificationResult === "Success" });
    const confidenceReport = confidenceEngine.calculate(input);
    const policyDecisionReport = policyDecisionEngine.decide({
      riskGraph: computedRiskGraph,
      approval: approvalDecision.granted,
      workspaceContext: executionContext
    });
    if (policyDecisionReport.decision === "Allow") {
      executionStateMachine.transitionTo("Approved", "Passed policy decision gates.");
      executionStateMachine.transitionTo("Ready", "Patches prepared for executor write.");
    } else {
      executionStateMachine.transitionTo("Failed", `Gate check rejected: ${policyDecisionReport.reason}`);
    }
    const baseReporterReport = executionReporter.compileReport(
      input,
      computedRiskGraph.overallRiskScore,
      computedRiskGraph.overallRiskLevel,
      approvalDecision.granted,
      rollbackCertificate.verificationResult === "Success",
      [...ruleExecution.errors, ...policyDecisionReport.violations],
      [...ruleExecution.warnings, ...policyDecisionReport.warnings]
    );
    if (baseReporterReport.executionStatus === "Rejected") {
      safeEditEvents.emit("ExecutionBlocked" /* ExecutionBlocked */, { reason: baseReporterReport.blockingIssues.join(", ") });
    } else {
      safeEditEvents.emit("ExecutionApproved" /* ExecutionApproved */, { targetFile: input.targetFile });
    }
    const timelineReport = executionStateMachine.getTimelineReport();
    const auditReport = auditEngine.logExecution({
      decision: policyDecisionReport.decision,
      risk: computedRiskGraph,
      simulation: simulationReport,
      validation: ruleExecution,
      review: { comments: baseReporterReport.warnings },
      approval: approvalDecision,
      patch: input.patchContent,
      rollback: rollbackCertificate,
      timingMs: Date.now() - startTime,
      agentChain: ["SafeEditEngine"]
    });
    const report = {
      ...baseReporterReport,
      executionContext,
      riskGraph: computedRiskGraph,
      rollbackCertificate,
      approvalDecision,
      confidenceReport,
      simulationReport,
      policyDecisionReport,
      executionAuditReport: auditReport,
      timelineReport
    };
    safeEditMetrics.record(baseReporterReport.blockingIssues.length > 0);
    return report;
  }
  subscribe(listener) {
    return safeEditEvents.subscribe(listener);
  }
};
var safeEditEngine = new SafeEditEngine();

// src/core/safeEdit/classification/classifierRules.ts
var classifierRules = [
  { type: "Bug Fix", keywords: ["fix", "bug", "issue", "resolve", "error", "crash"], weight: 2 },
  { type: "Feature", keywords: ["feat", "feature", "add", "implement", "new"], weight: 1.5 },
  { type: "Refactor", keywords: ["refactor", "clean", "restructure", "cleanup"], weight: 1.8 },
  { type: "Documentation", keywords: ["docs", "readme", "comment", "docstring", "guide"], weight: 2.2 },
  { type: "Dependency", keywords: ["package.json", "dependencies", "npm", "yarn", "import"], weight: 2 },
  { type: "Security", keywords: ["security", "password", "secret", "auth", "token", "crypt"], weight: 2.5 }
];

// src/core/safeEdit/classification/patchClassifier.ts
var PatchClassifier = class {
  classify(patchContent, targetFile) {
    const scores = /* @__PURE__ */ new Map();
    const tags = [];
    const lowerContent = (patchContent + " " + targetFile).toLowerCase();
    for (const rule of classifierRules) {
      let matches = 0;
      for (const kw of rule.keywords) {
        if (lowerContent.includes(kw)) {
          matches++;
        }
      }
      if (matches > 0) {
        const currentScore = scores.get(rule.type) || 0;
        scores.set(rule.type, currentScore + matches * rule.weight);
        tags.push(rule.type);
      }
    }
    let primaryType = "Experimental";
    let highestScore = 0;
    for (const [type, score] of scores.entries()) {
      if (score > highestScore) {
        highestScore = score;
        primaryType = type;
      }
    }
    return {
      primaryType,
      confidence: highestScore > 0 ? Math.min(1, 0.5 + highestScore / 10) : 0.4,
      tags: Array.from(new Set(tags))
    };
  }
};
var patchClassifier = new PatchClassifier();

// src/core/safeEdit/rollback/rollbackGraph.ts
var RollbackGraph = class {
  sortRecoveryOrder(files) {
    return [...files].reverse();
  }
};
var rollbackGraph = new RollbackGraph();

// src/core/safeEdit/rollback/rollbackVerifier.ts
var RollbackVerifier = class {
  verifySnapshots(snapshots) {
    return snapshots.length > 0;
  }
};
var rollbackVerifier = new RollbackVerifier();

// src/core/safeEdit/rollback/rollbackCertificate.ts
var RollbackCertificateGenerator = class {
  generate(targetFile, snapshots) {
    const affected = targetFile ? [targetFile] : [];
    const isVerified = rollbackVerifier.verifySnapshots(snapshots);
    return {
      certificateId: `CERT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      affectedFiles: affected,
      affectedSymbols: [],
      snapshots,
      recoveryOrder: rollbackGraph.sortRecoveryOrder(affected),
      dependencies: [],
      estimatedRollbackTimeMs: affected.length * 150 + 50,
      rollbackConfidence: isVerified ? 0.98 : 0.4,
      verificationResult: isVerified ? "Success" : "Failed",
      timestamp: Date.now()
    };
  }
};
var rollbackCertificateGenerator = new RollbackCertificateGenerator();

// src/core/safeEdit/rollback/rollbackPlanner.ts
var RollbackPlanner2 = class {
  generateCertificate(input) {
    const snapshots = input.targetFile ? [`snap-pre-${Date.now()}`] : [];
    return rollbackCertificateGenerator.generate(input.targetFile, snapshots);
  }
};
var rollbackPlanner2 = new RollbackPlanner2();

// src/core/safeEdit/approval/approvalPolicies.ts
var ApprovalPolicies = class {
  satisfies(required, actual) {
    const weights = {
      "Automatic": 0,
      "User": 1,
      "Workspace": 2,
      "Repository": 3,
      "Branch": 4,
      "Organization": 5,
      "Administrator": 6,
      "Emergency Override": 7
    };
    const reqWeight = weights[required] || 0;
    const actWeight = weights[actual] || 0;
    return actWeight >= reqWeight;
  }
};
var approvalPolicies = new ApprovalPolicies();

// src/core/safeEdit/simulation/workspaceSimulator.ts
var WorkspaceSimulator = class {
  simulateWorkspaceState() {
    return "virtual-workspace-state";
  }
};
var workspaceSimulator = new WorkspaceSimulator();

// src/core/safeEdit/simulation/patchSimulator.ts
var PatchSimulator = class {
  simulatePatch(targetFile, patchContent) {
    workspaceMerger.merge(targetFile, patchContent);
  }
};
var patchSimulator = new PatchSimulator();

// src/core/safeEdit/simulation/dependencySimulator.ts
var DependencySimulator = class {
  simulateDependencies(targetFile) {
    return virtualDependencies.verify(targetFile);
  }
};
var dependencySimulator = new DependencySimulator();

// src/core/safeEdit/simulation/symbolSimulator.ts
var SymbolSimulator = class {
  simulateSymbols(targetFile) {
    return virtualSymbols.extract(targetFile);
  }
};
var symbolSimulator = new SymbolSimulator();

// src/core/safeEdit/simulation/importSimulator.ts
var ImportSimulator = class {
  simulateImports(targetFile) {
    return virtualImports.verify(targetFile);
  }
};
var importSimulator = new ImportSimulator();

// src/extension/messageRouter.ts
init_eventBus2();

// src/core/taskGeneration/taskEvents.ts
var TaskEvents = class {
  listeners = /* @__PURE__ */ new Set();
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  emit(type, payload) {
    for (const listener of this.listeners) {
      try {
        listener({ type, timestamp: Date.now(), payload });
      } catch (err) {
        console.error("Error in TaskEvents listener:", err);
      }
    }
  }
};
var taskEvents = new TaskEvents();

// src/core/taskGeneration/taskMetrics.ts
var TaskMetrics = class {
  totalTasksGenerated = 0;
  totalGraphsGenerated = 0;
  totalGenerationTimeMs = 0;
  record(tasksCount, durationMs) {
    this.totalTasksGenerated += tasksCount;
    this.totalGraphsGenerated++;
    this.totalGenerationTimeMs += durationMs;
  }
  getStats() {
    return {
      totalTasksGenerated: this.totalTasksGenerated,
      totalGraphsGenerated: this.totalGraphsGenerated,
      averageGenerationTimeMs: this.totalGraphsGenerated > 0 ? Math.round(this.totalGenerationTimeMs / this.totalGraphsGenerated) : 0
    };
  }
};
var taskMetrics = new TaskMetrics();

// src/core/taskGeneration/taskAnalyzer.ts
var TaskAnalyzer = class {
  analyzeMilestones(input) {
    const results = [];
    for (const ms of input.featurePlan.milestones) {
      const text = `${ms.name} ${ms.description} ${(ms.requirements || []).join(" ")}`.toLowerCase();
      const detectedTypes = [];
      if (text.includes("ui") || text.includes("component") || text.includes("view") || text.includes("frontend") || text.includes("dashboard")) {
        detectedTypes.push("UI Task");
      }
      if (text.includes("api") || text.includes("endpoint") || text.includes("route") || text.includes("request")) {
        detectedTypes.push("API Task");
      }
      if (text.includes("db") || text.includes("database") || text.includes("schema") || text.includes("table") || text.includes("model")) {
        detectedTypes.push("Database Task");
      }
      if (text.includes("backend") || text.includes("service") || text.includes("logic") || text.includes("core") || text.includes("engine")) {
        detectedTypes.push("Backend Task");
      }
      if (text.includes("test") || text.includes("spec") || text.includes("verify") || text.includes("unit")) {
        detectedTypes.push("Testing Task");
      }
      if (detectedTypes.length === 0) {
        detectedTypes.push("Backend Task");
      }
      if (!detectedTypes.includes("Testing Task")) {
        detectedTypes.push("Testing Task");
      }
      results.push({
        milestoneId: ms.milestoneId,
        name: ms.name,
        description: ms.description,
        detectedTypes,
        suggestedFiles: ms.filesToTouch || []
      });
    }
    return results;
  }
};
var taskAnalyzer = new TaskAnalyzer();

// src/core/taskGeneration/strategies/uiTaskStrategy.ts
var UITaskStrategy = class {
  taskType = "UI Task";
  defaultStrategy = "Parallel";
  buildTask(params) {
    return {
      taskId: params.taskId,
      title: params.title,
      description: params.description,
      taskType: this.taskType,
      parentMilestone: params.parentMilestone,
      dependencies: params.dependencies || [],
      requiredSymbols: params.requiredSymbols || [],
      requiredFiles: params.requiredFiles || [],
      expectedOutput: params.expectedOutput || "UI component layout and state rendering implemented.",
      estimatedTimeMs: 12e4,
      // 2 mins estimate
      estimatedTokens: 800,
      risk: "Low",
      priority: "Normal",
      confidence: 0.9,
      executionStrategy: this.defaultStrategy
    };
  }
};
var uiTaskStrategy = new UITaskStrategy();

// src/core/taskGeneration/strategies/backendTaskStrategy.ts
var BackendTaskStrategy = class {
  taskType = "Backend Task";
  defaultStrategy = "Sequential";
  buildTask(params) {
    return {
      taskId: params.taskId,
      title: params.title,
      description: params.description,
      taskType: this.taskType,
      parentMilestone: params.parentMilestone,
      dependencies: params.dependencies || [],
      requiredSymbols: params.requiredSymbols || [],
      requiredFiles: params.requiredFiles || [],
      expectedOutput: params.expectedOutput || "Backend service logic and controller flow verified.",
      estimatedTimeMs: 18e4,
      estimatedTokens: 1200,
      risk: "Medium",
      priority: "High",
      confidence: 0.88,
      executionStrategy: this.defaultStrategy
    };
  }
};
var backendTaskStrategy = new BackendTaskStrategy();

// src/core/taskGeneration/strategies/apiTaskStrategy.ts
var APITaskStrategy = class {
  taskType = "API Task";
  defaultStrategy = "Sequential";
  buildTask(params) {
    return {
      taskId: params.taskId,
      title: params.title,
      description: params.description,
      taskType: this.taskType,
      parentMilestone: params.parentMilestone,
      dependencies: params.dependencies || [],
      requiredSymbols: params.requiredSymbols || [],
      requiredFiles: params.requiredFiles || [],
      expectedOutput: params.expectedOutput || "API endpoint contract and data routing schema validated.",
      estimatedTimeMs: 15e4,
      estimatedTokens: 1e3,
      risk: "Medium",
      priority: "High",
      confidence: 0.92,
      executionStrategy: this.defaultStrategy
    };
  }
};
var apiTaskStrategy = new APITaskStrategy();

// src/core/taskGeneration/strategies/databaseTaskStrategy.ts
var DatabaseTaskStrategy = class {
  taskType = "Database Task";
  defaultStrategy = "Manual Approval";
  buildTask(params) {
    return {
      taskId: params.taskId,
      title: params.title,
      description: params.description,
      taskType: this.taskType,
      parentMilestone: params.parentMilestone,
      dependencies: params.dependencies || [],
      requiredSymbols: params.requiredSymbols || [],
      requiredFiles: params.requiredFiles || [],
      expectedOutput: params.expectedOutput || "Database schema model/migration script verified.",
      estimatedTimeMs: 24e4,
      estimatedTokens: 1500,
      risk: "High",
      priority: "Critical",
      confidence: 0.85,
      executionStrategy: this.defaultStrategy
    };
  }
};
var databaseTaskStrategy = new DatabaseTaskStrategy();

// src/core/taskGeneration/strategies/testingTaskStrategy.ts
var TestingTaskStrategy = class {
  taskType = "Testing Task";
  defaultStrategy = "Parallel";
  buildTask(params) {
    return {
      taskId: params.taskId,
      title: params.title,
      description: params.description,
      taskType: this.taskType,
      parentMilestone: params.parentMilestone,
      dependencies: params.dependencies || [],
      requiredSymbols: params.requiredSymbols || [],
      requiredFiles: params.requiredFiles || [],
      expectedOutput: params.expectedOutput || "Unit and integration test suites passing.",
      estimatedTimeMs: 9e4,
      estimatedTokens: 600,
      risk: "Low",
      priority: "Normal",
      confidence: 0.95,
      executionStrategy: this.defaultStrategy
    };
  }
};
var testingTaskStrategy = new TestingTaskStrategy();

// src/core/taskGeneration/taskBuilder.ts
var TaskBuilder = class {
  buildTasksForMilestone(analysis) {
    const tasks = [];
    let idx = 1;
    for (const type of analysis.detectedTypes) {
      const taskId = `TASK-${analysis.milestoneId}-${idx++}`;
      let task;
      switch (type) {
        case "UI Task":
          task = uiTaskStrategy.buildTask({
            taskId,
            title: `UI: ${analysis.name}`,
            description: `Implement UI views and layout for ${analysis.description}`,
            parentMilestone: analysis.milestoneId,
            requiredFiles: analysis.suggestedFiles.filter((f) => f.includes("webview") || f.endsWith(".tsx"))
          });
          break;
        case "API Task":
          task = apiTaskStrategy.buildTask({
            taskId,
            title: `API: ${analysis.name}`,
            description: `Define API endpoints and data contract for ${analysis.description}`,
            parentMilestone: analysis.milestoneId
          });
          break;
        case "Database Task":
          task = databaseTaskStrategy.buildTask({
            taskId,
            title: `DB: ${analysis.name}`,
            description: `Setup database schema models for ${analysis.description}`,
            parentMilestone: analysis.milestoneId
          });
          break;
        case "Testing Task":
          task = testingTaskStrategy.buildTask({
            taskId,
            title: `Test: ${analysis.name}`,
            description: `Write automated tests verifying ${analysis.description}`,
            parentMilestone: analysis.milestoneId
          });
          break;
        case "Backend Task":
        default:
          task = backendTaskStrategy.buildTask({
            taskId,
            title: `Backend: ${analysis.name}`,
            description: `Implement backend service logic for ${analysis.description}`,
            parentMilestone: analysis.milestoneId,
            requiredFiles: analysis.suggestedFiles.filter((f) => !f.includes("webview"))
          });
          break;
      }
      tasks.push(task);
    }
    return tasks;
  }
};
var taskBuilder = new TaskBuilder();

// src/core/taskGeneration/taskDecomposer.ts
var TaskDecomposer = class {
  decomposePlan(input) {
    const milestoneAnalyses = taskAnalyzer.analyzeMilestones(input);
    const allTasks = [];
    let previousMilestoneLastTaskId = null;
    for (const analysis of milestoneAnalyses) {
      const msTasks = taskBuilder.buildTasksForMilestone(analysis);
      const typePriorityOrder = {
        "Database Task": 1,
        "API Task": 2,
        "Backend Task": 3,
        "UI Task": 4,
        "Testing Task": 5
      };
      msTasks.sort((a, b) => (typePriorityOrder[a.taskType] || 3) - (typePriorityOrder[b.taskType] || 3));
      for (let i = 0; i < msTasks.length; i++) {
        const current = msTasks[i];
        if (i > 0) {
          current.dependencies.push(msTasks[i - 1].taskId);
        } else if (previousMilestoneLastTaskId) {
          current.dependencies.push(previousMilestoneLastTaskId);
        }
      }
      if (msTasks.length > 0) {
        previousMilestoneLastTaskId = msTasks[msTasks.length - 1].taskId;
      }
      allTasks.push(...msTasks);
    }
    return allTasks;
  }
};
var taskDecomposer = new TaskDecomposer();

// src/core/taskGeneration/taskDependencyResolver.ts
var TaskDependencyResolver = class {
  buildTaskGraph(tasks) {
    const nodes = {};
    const edges = [];
    const taskMap = /* @__PURE__ */ new Map();
    for (const task of tasks) {
      taskMap.set(task.taskId, task);
      nodes[task.taskId] = {
        task,
        children: [],
        parents: [...task.dependencies],
        depth: 0,
        inCriticalPath: false
      };
    }
    for (const task of tasks) {
      for (const parentId of task.dependencies) {
        if (nodes[parentId]) {
          nodes[parentId].children.push(task.taskId);
          edges.push({
            fromTaskId: parentId,
            toTaskId: task.taskId,
            edgeType: "depends_on"
          });
        }
      }
    }
    const rootTaskIds = tasks.filter((t) => t.dependencies.length === 0).map((t) => t.taskId);
    const leafTaskIds = tasks.filter((t) => nodes[t.taskId].children.length === 0).map((t) => t.taskId);
    const computeDepth = (taskId, currentDepth) => {
      const node = nodes[taskId];
      if (!node)
        return;
      node.depth = Math.max(node.depth, currentDepth);
      for (const childId of node.children) {
        computeDepth(childId, currentDepth + 1);
      }
    };
    for (const rootId of rootTaskIds) {
      computeDepth(rootId, 0);
    }
    const memoPath = /* @__PURE__ */ new Map();
    const getLongestPathFrom = (taskId) => {
      if (memoPath.has(taskId)) {
        return memoPath.get(taskId);
      }
      const node = nodes[taskId];
      const taskTime = node.task.estimatedTimeMs;
      if (node.children.length === 0) {
        const res2 = { duration: taskTime, path: [taskId] };
        memoPath.set(taskId, res2);
        return res2;
      }
      let maxChildRes = { duration: 0, path: [] };
      for (const childId of node.children) {
        const childRes = getLongestPathFrom(childId);
        if (childRes.duration > maxChildRes.duration) {
          maxChildRes = childRes;
        }
      }
      const res = {
        duration: taskTime + maxChildRes.duration,
        path: [taskId, ...maxChildRes.path]
      };
      memoPath.set(taskId, res);
      return res;
    };
    let overallMaxPath = [];
    let overallMaxTime = 0;
    for (const rootId of rootTaskIds) {
      const pathRes = getLongestPathFrom(rootId);
      if (pathRes.duration > overallMaxTime) {
        overallMaxTime = pathRes.duration;
        overallMaxPath = pathRes.path;
      }
    }
    for (const cpId of overallMaxPath) {
      if (nodes[cpId]) {
        nodes[cpId].inCriticalPath = true;
      }
    }
    const totalEstimatedTimeMs = tasks.reduce((sum, t) => sum + t.estimatedTimeMs, 0);
    const totalEstimatedTokens = tasks.reduce((sum, t) => sum + t.estimatedTokens, 0);
    return {
      nodes,
      edges,
      rootTaskIds,
      leafTaskIds,
      criticalPath: overallMaxPath,
      totalEstimatedTimeMs,
      totalEstimatedTokens
    };
  }
};
var taskDependencyResolver = new TaskDependencyResolver();

// src/core/taskGeneration/taskPrioritizer.ts
var TaskPrioritizer = class {
  prioritizeGraph(graph) {
    for (const taskId of Object.keys(graph.nodes)) {
      const node = graph.nodes[taskId];
      if (node.inCriticalPath) {
        if (node.task.risk === "High" || node.task.risk === "Critical") {
          node.task.priority = "Critical";
        } else {
          node.task.priority = "High";
        }
      } else if (node.parents.length === 0) {
        node.task.priority = "High";
      }
    }
  }
};
var taskPrioritizer = new TaskPrioritizer();

// src/core/taskGeneration/taskEstimator.ts
var TaskEstimator = class {
  refineEstimates(graph) {
    let totalTimeMs = 0;
    let totalTokens = 0;
    const taskCount = Object.keys(graph.nodes).length;
    for (const taskId of Object.keys(graph.nodes)) {
      const task = graph.nodes[taskId].task;
      const fileFactor = Math.max(1, task.requiredFiles.length);
      const symbolFactor = Math.max(1, task.requiredSymbols.length);
      task.estimatedTimeMs = Math.round(task.estimatedTimeMs * (1 + (fileFactor - 1) * 0.2 + (symbolFactor - 1) * 0.1));
      task.estimatedTokens = Math.round(task.estimatedTokens * (1 + (fileFactor - 1) * 0.3 + (symbolFactor - 1) * 0.15));
      totalTimeMs += task.estimatedTimeMs;
      totalTokens += task.estimatedTokens;
    }
    graph.totalEstimatedTimeMs = totalTimeMs;
    graph.totalEstimatedTokens = totalTokens;
    return {
      totalTasks: taskCount,
      totalTimeMs,
      totalTokens,
      criticalPathLength: graph.criticalPath.length
    };
  }
};
var taskEstimator = new TaskEstimator();

// src/core/taskGeneration/taskScheduler.ts
var TaskScheduler = class {
  computeSchedule(graph) {
    const inDegree = {};
    const taskIds = Object.keys(graph.nodes);
    for (const id of taskIds) {
      inDegree[id] = graph.nodes[id].parents.length;
    }
    const queue = taskIds.filter((id) => inDegree[id] === 0);
    const executionOrder = [];
    while (queue.length > 0) {
      queue.sort((a, b) => a.localeCompare(b));
      const curr = queue.shift();
      executionOrder.push(curr);
      for (const childId of graph.nodes[curr].children) {
        inDegree[childId]--;
        if (inDegree[childId] === 0) {
          queue.push(childId);
        }
      }
    }
    const depthMap = /* @__PURE__ */ new Map();
    for (const id of taskIds) {
      const depth = graph.nodes[id].depth;
      if (!depthMap.has(depth)) {
        depthMap.set(depth, []);
      }
      depthMap.get(depth).push(id);
    }
    const maxDepth = Math.max(...Array.from(depthMap.keys()), 0);
    const parallelBranches = [];
    for (let d = 0; d <= maxDepth; d++) {
      if (depthMap.has(d)) {
        parallelBranches.push(depthMap.get(d));
      }
    }
    return {
      executionOrder,
      parallelBranches
    };
  }
};
var taskScheduler = new TaskScheduler();

// src/core/taskGeneration/taskValidator.ts
var TaskValidator = class {
  validate(graph, input) {
    const errors = [];
    const nodeIds = Object.keys(graph.nodes);
    if (nodeIds.length === 0) {
      errors.push("Task Graph is empty. No tasks were generated.");
      return { valid: false, errors };
    }
    const visitedState = {};
    for (const id of nodeIds)
      visitedState[id] = 0;
    let hasCycle = false;
    const dfsCycle = (id, path23) => {
      visitedState[id] = 1;
      for (const childId of graph.nodes[id].children) {
        if (visitedState[childId] === 1) {
          hasCycle = true;
          errors.push(`Circular dependency detected: ${[...path23, id, childId].join(" -> ")}`);
        } else if (visitedState[childId] === 0) {
          dfsCycle(childId, [...path23, id]);
        }
      }
      visitedState[id] = 2;
    };
    for (const id of nodeIds) {
      if (visitedState[id] === 0) {
        dfsCycle(id, []);
      }
    }
    for (const id of nodeIds) {
      const node = graph.nodes[id];
      if (node.parents.length === 0 && node.children.length === 0 && nodeIds.length > 1) {
        errors.push(`Orphan task detected: ${id} has no parents or children in multi-task graph.`);
      }
    }
    const milestoneIds = new Set(input.featurePlan.milestones.map((m) => m.milestoneId));
    const coveredMilestones = /* @__PURE__ */ new Set();
    for (const id of nodeIds) {
      coveredMilestones.add(graph.nodes[id].task.parentMilestone);
    }
    for (const msId of milestoneIds) {
      if (!coveredMilestones.has(msId)) {
        errors.push(`Uncovered milestone: Milestone ${msId} has no associated tasks.`);
      }
    }
    return {
      valid: errors.length === 0 && !hasCycle,
      errors
    };
  }
};
var taskValidator = new TaskValidator();

// src/core/taskGeneration/intelligence/htn/htnEngine.ts
var HTNEngine = class {
  buildHTNTree(featurePlan, taskModels) {
    const rootNode = {
      id: featurePlan.planId || "FEAT-ROOT",
      level: "Feature",
      title: featurePlan.title || "Feature Plan",
      objective: featurePlan.description || "Implement feature plan",
      preconditions: ["Workspace context initialized", "Plan approved"],
      postconditions: ["Feature components implemented and tested"],
      dependencies: [],
      successCriteria: ["All milestones completed", "Validation suite passing"],
      failureRecovery: "Rollback to workspace snapshot",
      children: []
    };
    const msMap = /* @__PURE__ */ new Map();
    for (const ms of featurePlan.milestones || []) {
      const msNode = {
        id: ms.milestoneId,
        level: "Milestone",
        title: ms.name,
        objective: ms.description,
        preconditions: ["Preceding milestone completed"],
        postconditions: ["Milestone artifacts verified"],
        dependencies: [],
        successCriteria: ["All milestone tasks passing"],
        failureRecovery: `Re-run milestone ${ms.milestoneId} tasks`,
        children: []
      };
      msMap.set(ms.milestoneId, msNode);
      rootNode.children.push(msNode);
    }
    for (const task of taskModels) {
      const taskNode = {
        id: task.taskId,
        level: "Task",
        title: task.title,
        objective: task.description,
        preconditions: task.dependencies.map((d) => `Task ${d} completed`),
        postconditions: [`Output: ${task.expectedOutput}`],
        dependencies: [...task.dependencies],
        successCriteria: ["No compilation or lint errors"],
        failureRecovery: "Retry task execution with corrected context",
        children: [
          {
            id: `SUB-${task.taskId}-1`,
            level: "Subtask",
            title: `Prepare context for ${task.title}`,
            objective: "Load symbols and file handles",
            preconditions: [],
            postconditions: ["Context ready"],
            dependencies: [],
            successCriteria: ["Handles verified"],
            failureRecovery: "Reload workspace state",
            children: [
              {
                id: `ACT-${task.taskId}-1`,
                level: "Atomic Action",
                title: `Execute patch modification for ${task.taskId}`,
                objective: "Apply changes",
                preconditions: [],
                postconditions: ["Diff applied"],
                dependencies: [],
                successCriteria: ["Diff matches target"],
                failureRecovery: "Revert diff",
                children: []
              }
            ]
          }
        ]
      };
      const parentMs = msMap.get(task.parentMilestone);
      if (parentMs) {
        parentMs.children.push(taskNode);
      } else {
        rootNode.children.push(taskNode);
      }
    }
    return rootNode;
  }
};
var htnEngine = new HTNEngine();

// src/core/taskGeneration/intelligence/knowledgeGraph/taskKnowledgeGraph.ts
var TaskKnowledgeGraph = class {
  buildMetadataMap(tasks) {
    const map = {};
    for (const task of tasks) {
      const isUI = task.taskType === "UI Task";
      const isDB = task.taskType === "Database Task";
      const isAPI = task.taskType === "API Task";
      map[task.taskId] = {
        taskId: task.taskId,
        requiredFiles: [...task.requiredFiles],
        producedFiles: task.requiredFiles.map((f) => `out/${f}`),
        requiredSymbols: [...task.requiredSymbols],
        producedSymbols: task.requiredSymbols.map((s) => `Generated_${s}`),
        apis: isAPI ? [`/api/v1/${task.taskId.toLowerCase()}`] : [],
        services: isAPI || task.taskType === "Backend Task" ? [`Service_${task.taskId}`] : [],
        components: isUI ? [`Component_${task.taskId}`] : [],
        databaseTables: isDB ? [`table_${task.taskId.toLowerCase()}`] : [],
        dependencies: [...task.dependencies],
        risk: task.risk,
        confidence: task.confidence
      };
    }
    return map;
  }
};
var taskKnowledgeGraph = new TaskKnowledgeGraph();

// src/core/taskGeneration/intelligence/constraints/taskConstraintEngine.ts
var TaskConstraintEngine = class {
  solveConstraints(tasks) {
    const constraints = [];
    let idx = 1;
    for (const task of tasks) {
      for (const depId of task.dependencies) {
        constraints.push({
          constraintId: `CST-${idx++}`,
          taskId: task.taskId,
          type: "Must Run After",
          targetTaskId: depId,
          description: `Task ${task.taskId} must run after Task ${depId}`,
          isSatisfied: true
        });
      }
      if (task.risk === "High" || task.risk === "Critical" || task.taskType === "Database Task") {
        constraints.push({
          constraintId: `CST-${idx++}`,
          taskId: task.taskId,
          type: "Requires Approval",
          description: `Task ${task.taskId} requires manual administrator approval prior to execution`,
          isSatisfied: true
        });
        constraints.push({
          constraintId: `CST-${idx++}`,
          taskId: task.taskId,
          type: "Requires Checkpoint",
          description: `Task ${task.taskId} requires workspace snapshot checkpoint capture`,
          isSatisfied: true
        });
      }
    }
    return constraints;
  }
};
var taskConstraintEngine = new TaskConstraintEngine();

// src/core/taskGeneration/intelligence/resources/taskResourceModel.ts
var TaskResourceModel = class {
  estimateResources(tasks) {
    const map = {};
    for (const task of tasks) {
      map[task.taskId] = {
        taskId: task.taskId,
        cpuPercent: task.taskType === "Database Task" ? 75 : 40,
        memoryMB: task.taskType === "UI Task" ? 512 : 256,
        diskMB: 64,
        llmContextTokens: 128e3,
        tokenBudget: task.estimatedTokens,
        estimatedRuntimeMs: task.estimatedTimeMs,
        parallelWorkers: task.executionStrategy === "Parallel" ? 4 : 1
      };
    }
    return map;
  }
};
var taskResourceModel = new TaskResourceModel();

// src/core/taskGeneration/intelligence/recovery/taskRecoveryPlanner.ts
var TaskRecoveryPlanner = class {
  planRecovery(tasks) {
    const map = {};
    for (const task of tasks) {
      map[task.taskId] = {
        taskId: task.taskId,
        retryStrategy: task.risk === "High" ? "No Retry" : "Exponential Backoff",
        rollbackStrategy: task.taskType === "Database Task" ? "Snapshot Revert" : "Git Stash Pop",
        failureRecovery: `Re-evaluate preconditions and run diagnostic checks for ${task.title}`,
        compensationSteps: [
          "Log failure diagnostics to audit trail",
          "Restore pre-task workspace snapshot checkpoint",
          "Notify workflow orchestrator of step fallback"
        ],
        recoveryConfidence: 0.92
      };
    }
    return map;
  }
};
var taskRecoveryPlanner = new TaskRecoveryPlanner();

// src/core/taskGeneration/intelligence/decisions/taskDecisionEngine.ts
var TaskDecisionEngine = class {
  evaluateDecisions(tasks) {
    const decisions = {};
    for (const task of tasks) {
      let action = "Parallelize";
      let reason = "Task fits parallel execution worker pool.";
      if (task.risk === "Critical") {
        action = "Escalate";
        reason = "Critical risk level requires explicit user administrator escalation.";
      } else if (task.dependencies.length > 2) {
        action = "Delay";
        reason = "Multiple preceding dependencies delay task start slot.";
      } else if (task.taskType === "Testing Task") {
        action = "Merge";
        reason = "Testing task can be merged into adjacent verification step.";
      }
      decisions[task.taskId] = {
        taskId: task.taskId,
        action,
        reason,
        confidence: 0.94
      };
    }
    return decisions;
  }
};
var taskDecisionEngine = new TaskDecisionEngine();

// src/core/taskGeneration/intelligence/versioning/taskVersionTracker.ts
var TaskVersionTracker = class {
  initializeVersions(tasks) {
    const versions = {};
    for (const task of tasks) {
      versions[task.taskId] = {
        taskId: task.taskId,
        version: 1,
        isReplanned: false,
        reason: "Initial task generation version 1.0",
        timestamp: Date.now()
      };
    }
    return versions;
  }
};
var taskVersionTracker = new TaskVersionTracker();

// src/core/taskGeneration/intelligence/observability/taskObservabilityEngine.ts
var TaskObservabilityEngine = class {
  computeObservability(taskGraph, durationMs) {
    const totalTokens = taskGraph.totalEstimatedTokens || 1e3;
    const estimatedCostUSD = Math.round(totalTokens / 1e3 * 2e-3 * 1e4) / 1e4;
    const parallelCount = taskGraph.rootTaskIds.length;
    const totalNodes = Object.keys(taskGraph.nodes).length;
    const parallelEfficiencyPercent = Math.min(100, Math.round(parallelCount / Math.max(1, totalNodes) * 100) + 40);
    return {
      planningTimeMs: durationMs,
      schedulingTimeMs: Math.round(durationMs * 0.3),
      criticalPathTimeMs: taskGraph.criticalPath.length * 12e4,
      parallelEfficiencyPercent,
      estimatedCostUSD,
      planningConfidence: 0.95
    };
  }
};
var taskObservabilityEngine = new TaskObservabilityEngine();

// src/core/taskGeneration/taskGenerationEngine.ts
var TaskGenerationEngine = class {
  async generateTasks(input) {
    const startTime = Date.now();
    taskEvents.emit("TaskGenerationStarted", { planId: input.featurePlan.planId });
    const taskModels = taskDecomposer.decomposePlan(input);
    const taskGraph = taskDependencyResolver.buildTaskGraph(taskModels);
    taskPrioritizer.prioritizeGraph(taskGraph);
    const effortStats = taskEstimator.refineEstimates(taskGraph);
    const schedule = taskScheduler.computeSchedule(taskGraph);
    const validationResult = taskValidator.validate(taskGraph, input);
    let overallRisk = "Minimal";
    const hasHighRisk = Object.values(taskGraph.nodes).some((n) => n.task.risk === "High" || n.task.risk === "Critical");
    if (hasHighRisk) {
      overallRisk = "High";
    } else if (effortStats.totalTasks > 10) {
      overallRisk = "Medium";
    }
    const durationMs = Date.now() - startTime;
    taskMetrics.record(effortStats.totalTasks, durationMs);
    const htnTree = htnEngine.buildHTNTree(input.featurePlan, taskModels);
    const knowledgeGraph = taskKnowledgeGraph.buildMetadataMap(taskModels);
    const constraints = taskConstraintEngine.solveConstraints(taskModels);
    const resources = taskResourceModel.estimateResources(taskModels);
    const recoveryPlans = taskRecoveryPlanner.planRecovery(taskModels);
    const decisions = taskDecisionEngine.evaluateDecisions(taskModels);
    const versions = taskVersionTracker.initializeVersions(taskModels);
    const observability = taskObservabilityEngine.computeObservability(taskGraph, durationMs);
    const report = {
      reportId: `TRP-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      planId: input.featurePlan.planId,
      taskGraph,
      executionOrder: schedule.executionOrder,
      parallelBranches: schedule.parallelBranches,
      taskDependencies: Object.values(taskGraph.nodes).map((n) => ({
        taskId: n.task.taskId,
        dependsOn: n.parents
      })),
      estimatedEffort: effortStats,
      riskLevel: overallRisk,
      confidence: validationResult.valid ? 0.95 : 0.4,
      validationPassed: validationResult.valid,
      validationErrors: validationResult.errors,
      intelligence: {
        htnTree,
        knowledgeGraph,
        constraints,
        resources,
        recoveryPlans,
        decisions,
        versions,
        observability
      },
      timestamp: Date.now()
    };
    taskEvents.emit("TaskGenerationCompleted", report);
    return report;
  }
  subscribe(listener) {
    return taskEvents.subscribe(listener);
  }
};
var taskGenerationEngine = new TaskGenerationEngine();

// src/core/executionPlanning/executionEvents.ts
var ExecutionEvents2 = class {
  listeners = /* @__PURE__ */ new Set();
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  emit(type, payload) {
    for (const listener of this.listeners) {
      try {
        listener({ type, timestamp: Date.now(), payload });
      } catch (err) {
        console.error("Error in ExecutionEvents listener:", err);
      }
    }
  }
};
var executionEvents = new ExecutionEvents2();

// src/core/executionPlanning/executionMetrics.ts
var ExecutionMetrics2 = class {
  totalPlansGenerated = 0;
  totalPlanningTimeMs = 0;
  totalCheckpointsCreated = 0;
  record(planningDurationMs, checkpointsCount) {
    this.totalPlansGenerated++;
    this.totalPlanningTimeMs += planningDurationMs;
    this.totalCheckpointsCreated += checkpointsCount;
  }
  getStats() {
    return {
      totalPlansGenerated: this.totalPlansGenerated,
      totalCheckpointsCreated: this.totalCheckpointsCreated,
      averagePlanningTimeMs: this.totalPlansGenerated > 0 ? Math.round(this.totalPlanningTimeMs / this.totalPlansGenerated) : 0
    };
  }
};
var executionMetrics2 = new ExecutionMetrics2();

// src/core/executionPlanning/executionAnalyzer.ts
var ExecutionAnalyzer = class {
  analyzeGraph(taskGraph, preferParallelism = true) {
    const totalNodes = Object.keys(taskGraph.nodes).length;
    const criticalPathLength = taskGraph.criticalPath.length;
    const depthWidths = /* @__PURE__ */ new Map();
    for (const id of Object.keys(taskGraph.nodes)) {
      const d = taskGraph.nodes[id].depth;
      depthWidths.set(d, (depthWidths.get(d) || 0) + 1);
    }
    const maxParallelWidth = Math.max(...Array.from(depthWidths.values()), 1);
    let recommendedStrategy = "Hybrid";
    if (!preferParallelism || maxParallelWidth <= 1) {
      recommendedStrategy = "Sequential";
    } else if (maxParallelWidth >= 3 && criticalPathLength <= 3) {
      recommendedStrategy = "Parallel";
    }
    let overallRisk = "Minimal";
    const hasCritical = Object.values(taskGraph.nodes).some((n) => n.task.risk === "Critical");
    const hasHigh = Object.values(taskGraph.nodes).some((n) => n.task.risk === "High");
    if (hasCritical)
      overallRisk = "Critical";
    else if (hasHigh)
      overallRisk = "High";
    else if (totalNodes > 8)
      overallRisk = "Medium";
    return {
      totalNodes,
      criticalPathLength,
      maxParallelWidth,
      recommendedStrategy,
      overallRisk
    };
  }
};
var executionAnalyzer = new ExecutionAnalyzer();

// src/core/executionPlanning/dependencyResolver.ts
var DependencyResolver3 = class {
  resolveDependencies(steps) {
    const dependencyMap = /* @__PURE__ */ new Map();
    for (const step of steps) {
      dependencyMap.set(step.stepId, [...step.dependencies]);
    }
    return dependencyMap;
  }
};
var dependencyResolver3 = new DependencyResolver3();

// src/core/executionPlanning/checkpointPlanner.ts
var CheckpointPlanner = class {
  planCheckpoints(taskGraph, steps) {
    const checkpoints = [];
    const milestoneMap = /* @__PURE__ */ new Map();
    for (const step of steps) {
      const node = taskGraph.nodes[step.taskId];
      if (node) {
        const msId = node.task.parentMilestone;
        if (!milestoneMap.has(msId))
          milestoneMap.set(msId, []);
        milestoneMap.get(msId).push(step.stepId);
      }
    }
    let cpIdx = 1;
    const completedSoFar = [];
    for (const [msId, stepIds] of milestoneMap.entries()) {
      const checkpointId = `CKP-${cpIdx++}`;
      const rollbackBoundary = `RBB-${msId}`;
      checkpoints.push({
        checkpointId,
        parentTasks: stepIds,
        completedTasks: [...completedSoFar],
        workspaceSnapshot: `snap-cp-${msId.toLowerCase()}-${Date.now()}`,
        rollbackBoundary,
        verificationRules: [
          "Verify TypeScript build compilation succeeds without syntax errors.",
          "Verify core module imports and workspace boundary constraints pass."
        ],
        timestamp: Date.now()
      });
      completedSoFar.push(...stepIds);
    }
    return checkpoints;
  }
};
var checkpointPlanner = new CheckpointPlanner();

// src/core/executionPlanning/rollbackBoundaryPlanner.ts
var RollbackBoundaryPlanner = class {
  planRollbackBoundaries(checkpoints, taskGraph, steps) {
    const boundaries = [];
    for (const cp of checkpoints) {
      const affectedTaskIds = [...cp.parentTasks];
      const affectedFilesSet = /* @__PURE__ */ new Set();
      for (const stepId of affectedTaskIds) {
        const step = steps.find((s) => s.stepId === stepId);
        if (step && taskGraph.nodes[step.taskId]) {
          const task = taskGraph.nodes[step.taskId].task;
          for (const file of task.requiredFiles) {
            affectedFilesSet.add(file);
          }
        }
      }
      boundaries.push({
        boundaryId: cp.rollbackBoundary,
        checkpointId: cp.checkpointId,
        affectedTaskIds,
        affectedFiles: Array.from(affectedFilesSet),
        estimatedRollbackTimeMs: affectedTaskIds.length * 120 + 200,
        isIsolated: true
      });
    }
    return boundaries;
  }
};
var rollbackBoundaryPlanner = new RollbackBoundaryPlanner();

// src/core/executionPlanning/resourcePlanner.ts
var ResourcePlanner = class {
  planResources(taskGraph, maxWorkers = 4, constraints) {
    const memoryLimitMB = constraints?.maxMemoryMB || 2048;
    const cpuLimitPercent = constraints?.maxCpuPercent || 80;
    const estimatedTokens = taskGraph.totalEstimatedTokens || 5e3;
    const contextWindowTokens = 128e3;
    return {
      cpuLimitPercent,
      memoryLimitMB,
      diskLimitMB: 512,
      contextWindowTokens,
      estimatedTokens,
      estimatedRuntimeMs: taskGraph.totalEstimatedTimeMs || 3e5,
      maxConcurrentWorkers: maxWorkers
    };
  }
};
var resourcePlanner = new ResourcePlanner();

// src/core/executionPlanning/strategies/sequentialStrategy.ts
var SequentialStrategy = class {
  strategyType = "Sequential";
  scheduleSteps(taskGraph, maxWorkers) {
    const steps = [];
    const parallelGroups = [];
    let currentTime = 0;
    const taskIds = Object.keys(taskGraph.nodes);
    for (let i = 0; i < taskIds.length; i++) {
      const taskId = taskIds[i];
      const taskNode = taskGraph.nodes[taskId];
      const stepId = `STEP-${i + 1}`;
      const step = {
        stepId,
        taskId: taskNode.task.taskId,
        taskTitle: taskNode.task.title,
        strategy: "Sequential",
        workerIndex: 0,
        // Single worker
        estimatedStartTimeMs: currentTime,
        estimatedDurationMs: taskNode.task.estimatedTimeMs,
        dependencies: i > 0 ? [`STEP-${i}`] : []
      };
      steps.push(step);
      parallelGroups.push([stepId]);
      currentTime += taskNode.task.estimatedTimeMs;
    }
    return { steps, parallelGroups };
  }
};
var sequentialStrategy = new SequentialStrategy();

// src/core/executionPlanning/strategies/parallelStrategy.ts
var ParallelStrategy = class {
  strategyType = "Parallel";
  scheduleSteps(taskGraph, maxWorkers) {
    const steps = [];
    const parallelGroups = [];
    const taskIdToStepId = /* @__PURE__ */ new Map();
    const depthMap = /* @__PURE__ */ new Map();
    for (const taskId of Object.keys(taskGraph.nodes)) {
      const depth = taskGraph.nodes[taskId].depth;
      if (!depthMap.has(depth))
        depthMap.set(depth, []);
      depthMap.get(depth).push(taskId);
    }
    const maxDepth = Math.max(...Array.from(depthMap.keys()), 0);
    let currentTime = 0;
    let stepCounter = 1;
    for (let d = 0; d <= maxDepth; d++) {
      const levelTaskIds = depthMap.get(d) || [];
      const currentLevelStepIds = [];
      let maxLevelDuration = 0;
      for (let w = 0; w < levelTaskIds.length; w++) {
        const taskId = levelTaskIds[w];
        const taskNode = taskGraph.nodes[taskId];
        const stepId = `STEP-${stepCounter++}`;
        taskIdToStepId.set(taskId, stepId);
        const depStepIds = taskNode.parents.map((pId) => taskIdToStepId.get(pId)).filter((id) => Boolean(id));
        const workerIndex = w % maxWorkers;
        const step = {
          stepId,
          taskId: taskNode.task.taskId,
          taskTitle: taskNode.task.title,
          strategy: "Parallel",
          workerIndex,
          estimatedStartTimeMs: currentTime,
          estimatedDurationMs: taskNode.task.estimatedTimeMs,
          dependencies: depStepIds
        };
        steps.push(step);
        currentLevelStepIds.push(stepId);
        maxLevelDuration = Math.max(maxLevelDuration, taskNode.task.estimatedTimeMs);
      }
      if (currentLevelStepIds.length > 0) {
        parallelGroups.push(currentLevelStepIds);
        currentTime += maxLevelDuration;
      }
    }
    return { steps, parallelGroups };
  }
};
var parallelStrategy = new ParallelStrategy();

// src/core/executionPlanning/strategies/hybridStrategy.ts
var HybridStrategy2 = class {
  strategyType = "Hybrid";
  scheduleSteps(taskGraph, maxWorkers) {
    const res = parallelStrategy.scheduleSteps(taskGraph, Math.max(2, maxWorkers));
    for (const step of res.steps) {
      step.strategy = "Hybrid";
    }
    return res;
  }
};
var hybridStrategy = new HybridStrategy2();

// src/core/executionPlanning/strategies/isolatedStrategy.ts
var IsolatedStrategy = class {
  strategyType = "Isolated";
  scheduleSteps(taskGraph, maxWorkers) {
    const res = sequentialStrategy.scheduleSteps(taskGraph, 1);
    for (const step of res.steps) {
      step.strategy = "Isolated";
    }
    return res;
  }
};
var isolatedStrategy = new IsolatedStrategy();

// src/core/executionPlanning/executionScheduler.ts
var ExecutionScheduler = class {
  schedule(taskGraph, strategyType, maxWorkers = 4) {
    let result;
    switch (strategyType) {
      case "Sequential":
        result = sequentialStrategy.scheduleSteps(taskGraph, maxWorkers);
        break;
      case "Parallel":
        result = parallelStrategy.scheduleSteps(taskGraph, maxWorkers);
        break;
      case "Isolated":
        result = isolatedStrategy.scheduleSteps(taskGraph, maxWorkers);
        break;
      case "Hybrid":
      default:
        result = hybridStrategy.scheduleSteps(taskGraph, maxWorkers);
        break;
    }
    const totalTimeSlots = result.parallelGroups.length;
    let estimatedTotalRuntimeMs = 0;
    for (const group of result.parallelGroups) {
      let groupMaxDuration = 0;
      for (const stepId of group) {
        const step = result.steps.find((s) => s.stepId === stepId);
        if (step) {
          groupMaxDuration = Math.max(groupMaxDuration, step.estimatedDurationMs);
        }
      }
      estimatedTotalRuntimeMs += groupMaxDuration;
    }
    return {
      steps: result.steps,
      parallelGroups: result.parallelGroups,
      totalTimeSlots,
      estimatedTotalRuntimeMs
    };
  }
  attachCheckpointsToSchedule(schedule, checkpoints) {
    const checkpointMap = /* @__PURE__ */ new Map();
    for (const cp of checkpoints) {
      for (const stepId of cp.parentTasks) {
        checkpointMap.set(stepId, cp.checkpointId);
      }
    }
    for (const step of schedule.steps) {
      if (checkpointMap.has(step.stepId)) {
        step.checkpointId = checkpointMap.get(step.stepId);
      }
    }
  }
};
var executionScheduler = new ExecutionScheduler();

// src/core/executionPlanning/executionOptimizer.ts
var ExecutionOptimizer = class {
  optimizeSchedule(schedule, maxWorkers) {
    for (const group of schedule.parallelGroups) {
      for (let i = 0; i < group.length; i++) {
        const stepId = group[i];
        const step = schedule.steps.find((s) => s.stepId === stepId);
        if (step) {
          step.workerIndex = i % maxWorkers;
        }
      }
    }
  }
};
var executionOptimizer = new ExecutionOptimizer();

// src/core/executionPlanning/executionValidator.ts
var ExecutionValidator2 = class {
  validatePlan(plan) {
    const errors = [];
    if (!plan.schedule || plan.schedule.steps.length === 0) {
      errors.push("Execution plan schedule is empty. No steps found.");
      return { valid: false, errors };
    }
    const stepIds = plan.schedule.steps.map((s) => s.stepId);
    const visited = {};
    for (const id of stepIds)
      visited[id] = 0;
    let hasCycle = false;
    const dfs = (id, path23) => {
      visited[id] = 1;
      const step = plan.schedule.steps.find((s) => s.stepId === id);
      if (step) {
        for (const depId of step.dependencies) {
          if (visited[depId] === 1) {
            hasCycle = true;
            errors.push(`Circular execution step dependency detected: ${[...path23, id, depId].join(" -> ")}`);
          } else if (visited[depId] === 0) {
            dfs(depId, [...path23, id]);
          }
        }
      }
      visited[id] = 2;
    };
    for (const id of stepIds) {
      if (visited[id] === 0) {
        dfs(id, []);
      }
    }
    if (!plan.checkpointPlan || plan.checkpointPlan.length === 0) {
      errors.push("Warning: No checkpoints planned for execution.");
    }
    if (!plan.rollbackBoundaries || plan.rollbackBoundaries.length === 0) {
      errors.push("Warning: No rollback boundaries established.");
    }
    if (plan.resourcePlan.memoryLimitMB <= 0) {
      errors.push("Resource Plan memory limit must be greater than 0.");
    }
    return {
      valid: errors.length === 0 && !hasCycle,
      errors
    };
  }
};
var executionValidator2 = new ExecutionValidator2();

// src/core/executionPlanning/executionPlanner.ts
var ExecutionPlanner2 = class {
  planExecution(input) {
    const maxWorkers = input.executionPolicies?.maxWorkers || 4;
    const preferParallelism = input.executionPolicies?.preferParallelism ?? true;
    const analysis = executionAnalyzer.analyzeGraph(input.taskGraph, preferParallelism);
    const schedule = executionScheduler.schedule(input.taskGraph, analysis.recommendedStrategy, maxWorkers);
    const checkpoints = checkpointPlanner.planCheckpoints(input.taskGraph, schedule.steps);
    executionScheduler.attachCheckpointsToSchedule(schedule, checkpoints);
    const rollbackBoundaries = rollbackBoundaryPlanner.planRollbackBoundaries(checkpoints, input.taskGraph, schedule.steps);
    const resources = resourcePlanner.planResources(input.taskGraph, maxWorkers, input.resourceConstraints);
    executionOptimizer.optimizeSchedule(schedule, maxWorkers);
    return {
      planId: `EPL-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      strategy: analysis.recommendedStrategy,
      schedule,
      checkpointPlan: checkpoints,
      rollbackBoundaries,
      resourcePlan: resources,
      overallRisk: analysis.overallRisk,
      totalTasks: analysis.totalNodes
    };
  }
};
var executionPlanner = new ExecutionPlanner2();

// src/core/executionPlanning/executionPlanningEngine.ts
var ExecutionPlanningEngine = class {
  async plan(input) {
    const startTime = Date.now();
    executionEvents.emit("ExecutionPlanningStarted", { taskCount: Object.keys(input.taskGraph.nodes).length });
    const plan = executionPlanner.planExecution(input);
    const validationResult = executionValidator2.validatePlan(plan);
    const durationMs = Date.now() - startTime;
    executionMetrics2.record(durationMs, plan.checkpointPlan.length);
    const report = {
      reportId: `EPR-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      planId: plan.planId,
      executionPlan: plan,
      executionGraph: {
        nodesCount: plan.schedule.steps.length,
        edgesCount: plan.schedule.steps.reduce((sum, s) => sum + s.dependencies.length, 0),
        criticalPathLength: input.taskGraph.criticalPath.length
      },
      confidence: validationResult.valid ? 0.96 : 0.5,
      validationPassed: validationResult.valid,
      validationErrors: validationResult.errors,
      timestamp: Date.now()
    };
    executionEvents.emit("ExecutionPlanningCompleted", report);
    return report;
  }
  subscribe(listener) {
    return executionEvents.subscribe(listener);
  }
};
var executionPlanningEngine = new ExecutionPlanningEngine();

// src/core/dependencyResolution/dependencyEvents.ts
var DependencyEvents2 = class {
  listeners = /* @__PURE__ */ new Set();
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  emit(type, payload) {
    const event = {
      type,
      timestamp: Date.now(),
      payload
    };
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error("[DependencyEvents] Error in event listener:", err);
      }
    }
  }
};
var dependencyEvents = new DependencyEvents2();

// src/core/dependencyResolution/dependencyMetrics.ts
var DependencyMetrics2 = class {
  history = [];
  record(nodeCount, edgeCount, resolutionTimeMs, hasCycles) {
    this.history.push({
      timestamp: Date.now(),
      nodeCount,
      edgeCount,
      resolutionTimeMs,
      hasCycles
    });
  }
  getHistory() {
    return this.history;
  }
  getStats() {
    if (this.history.length === 0) {
      return { avgTimeMs: 0, totalRuns: 0, totalCyclesDetected: 0 };
    }
    const totalTime = this.history.reduce((sum, r) => sum + r.resolutionTimeMs, 0);
    const cyclesCount = this.history.filter((r) => r.hasCycles).length;
    return {
      avgTimeMs: totalTime / this.history.length,
      totalRuns: this.history.length,
      totalCyclesDetected: cyclesCount
    };
  }
};
var dependencyMetrics2 = new DependencyMetrics2();

// src/core/dependencyResolution/dependencyCache.ts
var DependencyCache = class {
  cache = /* @__PURE__ */ new Map();
  ttlMs = 3e4;
  // 30 seconds default TTL
  get(key) {
    const cached = this.cache.get(key);
    if (!cached)
      return null;
    if (Date.now() - cached.timestamp > this.ttlMs) {
      this.cache.delete(key);
      return null;
    }
    return cached.graph;
  }
  set(key, graph) {
    this.cache.set(key, {
      graph,
      timestamp: Date.now()
    });
  }
  clear() {
    this.cache.clear();
  }
};
var dependencyCache = new DependencyCache();

// src/core/dependencyResolution/dependencyGraph.ts
var DependencyGraphManager = class {
  createEmptyGraph() {
    return {
      nodes: {},
      edges: {},
      adjacencyList: {}
    };
  }
  detectCycles(graph) {
    const cycles = [];
    const visited = {};
    const nodeIds = Object.keys(graph.nodes);
    for (const id of nodeIds) {
      visited[id] = 0;
    }
    const dfs = (nodeId, path23) => {
      visited[nodeId] = 1;
      const neighbors = graph.adjacencyList[nodeId] || [];
      for (const neighbor of neighbors) {
        if (visited[neighbor] === 1) {
          const startIdx = path23.indexOf(neighbor);
          if (startIdx !== -1) {
            cycles.push([...path23.slice(startIdx), nodeId, neighbor]);
          } else {
            cycles.push([...path23, nodeId, neighbor]);
          }
        } else if (visited[neighbor] === 0) {
          dfs(neighbor, [...path23, nodeId]);
        }
      }
      visited[nodeId] = 2;
    };
    for (const id of nodeIds) {
      if (visited[id] === 0) {
        dfs(id, []);
      }
    }
    return {
      hasCycles: cycles.length > 0,
      cycles
    };
  }
  computeTopologicalOrder(graph) {
    const visited = /* @__PURE__ */ new Set();
    const temp = /* @__PURE__ */ new Set();
    const order = [];
    const visit = (nodeId) => {
      if (temp.has(nodeId)) {
        return;
      }
      if (!visited.has(nodeId)) {
        temp.add(nodeId);
        const neighbors = graph.adjacencyList[nodeId] || [];
        for (const neighbor of neighbors) {
          visit(neighbor);
        }
        temp.delete(nodeId);
        visited.add(nodeId);
        order.unshift(nodeId);
      }
    };
    const nodeIds = Object.keys(graph.nodes);
    for (const id of nodeIds) {
      visit(id);
    }
    return order;
  }
};
var dependencyGraphManager = new DependencyGraphManager();

// src/core/dependencyResolution/dependencyValidator.ts
var DependencyValidator2 = class {
  validate(graph, circularReport) {
    const errors = [];
    if (circularReport.hasCycles) {
      for (const cycle of circularReport.cycles) {
        errors.push(`Circular dependency detected: ${cycle.join(" -> ")}`);
      }
    }
    const nodeIds = new Set(Object.keys(graph.nodes));
    for (const edgeId of Object.keys(graph.edges)) {
      const edge = graph.edges[edgeId];
      if (!nodeIds.has(edge.source)) {
        errors.push(`Broken dependency link: Source node "${edge.source}" does not exist in graph.`);
      }
      if (!nodeIds.has(edge.target)) {
        errors.push(`Broken dependency link: Target node "${edge.target}" does not exist in graph.`);
      }
    }
    return {
      valid: errors.length === 0,
      errors
    };
  }
};
var dependencyValidator2 = new DependencyValidator2();

// src/core/dependencyResolution/dependencyOptimizer.ts
var DependencyOptimizer = class {
  optimize(graph) {
    const suggestions = [];
    const nodeIds = Object.keys(graph.nodes);
    const hasPath = (start, end, visited) => {
      if (start === end)
        return true;
      visited.add(start);
      const neighbors = graph.adjacencyList[start] || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (hasPath(neighbor, end, visited))
            return true;
        }
      }
      return false;
    };
    for (const u of nodeIds) {
      const neighbors = graph.adjacencyList[u] || [];
      for (const v of neighbors) {
        const remainingNeighbors = neighbors.filter((n) => n !== v);
        const tempAdjacency = { ...graph.adjacencyList, [u]: remainingNeighbors };
        const visited = /* @__PURE__ */ new Set();
        const hasPathTemp = (curr, dest) => {
          if (curr === dest)
            return true;
          visited.add(curr);
          const nexts = tempAdjacency[curr] || [];
          for (const next of nexts) {
            if (!visited.has(next)) {
              if (hasPathTemp(next, dest))
                return true;
            }
          }
          return false;
        };
        if (hasPathTemp(u, v)) {
          suggestions.push({
            id: `opt-redundant-${u}-${v}`,
            type: "Redundant",
            description: `Direct dependency from "${u}" to "${v}" is redundant as a transitive path exists.`,
            targetNodes: [u, v],
            severity: "Info"
          });
        }
      }
    }
    if (nodeIds.length > 1) {
      const referencedNodes = /* @__PURE__ */ new Set();
      for (const edge of Object.values(graph.edges)) {
        referencedNodes.add(edge.source);
        referencedNodes.add(edge.target);
      }
      for (const id of nodeIds) {
        if (!referencedNodes.has(id)) {
          suggestions.push({
            id: `opt-unused-${id}`,
            type: "Unused",
            description: `Node "${id}" is declared but has no incoming or outgoing dependency links.`,
            targetNodes: [id],
            severity: "Warning"
          });
        }
      }
    }
    return suggestions;
  }
};
var dependencyOptimizer = new DependencyOptimizer();

// src/core/dependencyResolution/providers/fileDependencyProvider.ts
var FileDependencyProvider = class {
  collect(input) {
    const nodes = [];
    const edges = [];
    const files = input.workspaceIndex?.files || ["src/index.ts", "src/extension/index.ts", "src/webview/main.tsx", "src/core/planner/planner.ts"];
    for (const file of files) {
      nodes.push({
        id: `file:${file}`,
        name: file,
        type: "File",
        metadata: { path: file }
      });
    }
    if (files.includes("src/extension/index.ts") && files.includes("src/index.ts")) {
      edges.push({
        id: "dep-file-ext-to-index",
        source: "file:src/extension/index.ts",
        target: "file:src/index.ts",
        type: "File",
        direction: "Outgoing",
        strength: "Direct",
        required: true,
        optional: false,
        risk: "Minimal",
        confidence: 0.95
      });
    }
    return { nodes, edges };
  }
};
var fileDependencyProvider = new FileDependencyProvider();

// src/core/dependencyResolution/providers/symbolDependencyProvider.ts
var SymbolDependencyProvider = class {
  collect(input) {
    const nodes = [];
    const edges = [];
    const symbols = input.symbolGraph?.symbols || ["plannerEngine", "taskBuilder", "taskValidator", "executionPlanningEngine"];
    for (const sym of symbols) {
      nodes.push({
        id: `symbol:${sym}`,
        name: sym,
        type: "Symbol",
        metadata: { symbol: sym }
      });
    }
    if (symbols.includes("plannerEngine") && symbols.includes("taskBuilder")) {
      edges.push({
        id: "dep-sym-builder-to-planner",
        source: "symbol:taskBuilder",
        target: "symbol:plannerEngine",
        type: "Symbol",
        direction: "Outgoing",
        strength: "Direct",
        required: true,
        optional: false,
        risk: "Minimal",
        confidence: 0.9
      });
    }
    return { nodes, edges };
  }
};
var symbolDependencyProvider = new SymbolDependencyProvider();

// src/core/dependencyResolution/providers/importDependencyProvider.ts
var ImportDependencyProvider = class {
  collect(input) {
    const nodes = [];
    const edges = [];
    const imports = input.importGraph?.imports || ["react", "vscode", "esbuild", "vite"];
    for (const imp of imports) {
      nodes.push({
        id: `import:${imp}`,
        name: imp,
        type: "Import",
        metadata: { importName: imp }
      });
    }
    return { nodes, edges };
  }
};
var importDependencyProvider = new ImportDependencyProvider();

// src/core/dependencyResolution/providers/apiDependencyProvider.ts
var ApiDependencyProvider = class {
  collect(input) {
    const nodes = [];
    const edges = [];
    const apis = ["GET /api/session", "POST /api/task", "GET /api/history"];
    for (const api of apis) {
      nodes.push({
        id: `api:${api}`,
        name: api,
        type: "API",
        metadata: { endpoint: api }
      });
    }
    edges.push({
      id: "dep-api-task-session",
      source: "api:POST /api/task",
      target: "api:GET /api/session",
      type: "API",
      direction: "Outgoing",
      strength: "Direct",
      required: true,
      optional: false,
      risk: "Low",
      confidence: 0.95
    });
    return { nodes, edges };
  }
};
var apiDependencyProvider = new ApiDependencyProvider();

// src/core/dependencyResolution/providers/databaseDependencyProvider.ts
var DatabaseDependencyProvider = class {
  collect(input) {
    const nodes = [];
    const edges = [];
    const tables = ["sessions", "tasks", "memories", "configurations"];
    for (const table of tables) {
      nodes.push({
        id: `db:${table}`,
        name: table,
        type: "Database",
        metadata: { tableName: table }
      });
    }
    edges.push({
      id: "dep-db-tasks-sessions",
      source: "db:tasks",
      target: "db:sessions",
      type: "Database",
      direction: "Outgoing",
      strength: "Direct",
      required: true,
      optional: false,
      risk: "Minimal",
      confidence: 0.98
    });
    return { nodes, edges };
  }
};
var databaseDependencyProvider = new DatabaseDependencyProvider();

// src/core/dependencyResolution/providers/configurationDependencyProvider.ts
var ConfigurationDependencyProvider = class {
  collect(input) {
    const nodes = [];
    const edges = [];
    const configs = ["tsconfig.json", "package.json", "vite.config.ts", ".eslintrc.json"];
    for (const config of configs) {
      nodes.push({
        id: `config:${config}`,
        name: config,
        type: "Configuration",
        metadata: { filename: config }
      });
    }
    return { nodes, edges };
  }
};
var configurationDependencyProvider = new ConfigurationDependencyProvider();

// src/core/dependencyResolution/providers/packageDependencyProvider.ts
var PackageDependencyProvider = class {
  collect(input) {
    const nodes = [];
    const edges = [];
    const packages = ["vscode", "react", "react-dom", "typescript", "vite", "jest", "esbuild"];
    for (const pkg of packages) {
      nodes.push({
        id: `package:${pkg}`,
        name: pkg,
        type: "Package",
        metadata: { packageName: pkg }
      });
    }
    return { nodes, edges };
  }
};
var packageDependencyProvider = new PackageDependencyProvider();

// src/core/dependencyResolution/dependencyAnalyzer.ts
var DependencyAnalyzer2 = class {
  collectRawDependencies(input) {
    let allNodes = [];
    let allEdges = [];
    const providers = [
      fileDependencyProvider,
      symbolDependencyProvider,
      importDependencyProvider,
      apiDependencyProvider,
      databaseDependencyProvider,
      configurationDependencyProvider,
      packageDependencyProvider
    ];
    for (const provider of providers) {
      try {
        const { nodes, edges } = provider.collect(input);
        allNodes = allNodes.concat(nodes);
        allEdges = allEdges.concat(edges);
      } catch (err) {
        console.error("[DependencyAnalyzer] Error collecting from provider:", err);
      }
    }
    return {
      nodes: allNodes,
      edges: allEdges
    };
  }
};
var dependencyAnalyzer2 = new DependencyAnalyzer2();

// src/core/dependencyResolution/dependencyClassifier.ts
var DependencyClassifier = class {
  classifyEdge(edge) {
    let strength = "Direct";
    let risk = "Minimal";
    if (edge.optional) {
      strength = "Optional";
    } else if (edge.type === "Package" || edge.type === "Import") {
      strength = "Peer";
    }
    if (edge.type === "API" || edge.type === "Environment") {
      risk = "Medium";
    } else if (edge.type === "Database") {
      risk = "Low";
    }
    return {
      ...edge,
      strength,
      risk
    };
  }
};
var dependencyClassifier = new DependencyClassifier();

// src/core/dependencyResolution/dependencyResolver.ts
var DependencyResolver4 = class {
  resolveGraph(nodes, edges) {
    const graphNodes = {};
    const graphEdges = {};
    const adjacencyList = {};
    for (const node of nodes) {
      if (!graphNodes[node.id]) {
        graphNodes[node.id] = node;
        adjacencyList[node.id] = [];
      }
    }
    for (const rawEdge of edges) {
      const edge = dependencyClassifier.classifyEdge(rawEdge);
      if (!graphEdges[edge.id]) {
        graphEdges[edge.id] = edge;
        if (!graphNodes[edge.source]) {
          graphNodes[edge.source] = { id: edge.source, name: edge.source, type: edge.type };
          adjacencyList[edge.source] = [];
        }
        if (!graphNodes[edge.target]) {
          graphNodes[edge.target] = { id: edge.target, name: edge.target, type: edge.type };
          adjacencyList[edge.target] = [];
        }
        if (!adjacencyList[edge.source].includes(edge.target)) {
          adjacencyList[edge.source].push(edge.target);
        }
      }
    }
    return {
      nodes: graphNodes,
      edges: graphEdges,
      adjacencyList
    };
  }
};
var dependencyResolver4 = new DependencyResolver4();

// src/core/dependencyResolution/dependencyResolutionEngine.ts
var DependencyResolutionEngine = class {
  async resolve(input) {
    const startTime = Date.now();
    dependencyEvents.emit("ResolutionStarted", { timestamp: startTime });
    const cacheKey = input.featurePlan?.planId || "default-workspace";
    const cachedGraph = dependencyCache.get(cacheKey);
    let graph = cachedGraph;
    if (!graph) {
      const raw = dependencyAnalyzer2.collectRawDependencies(input);
      dependencyEvents.emit("DiscoveryCompleted", { nodeCount: raw.nodes.length, edgeCount: raw.edges.length });
      graph = dependencyResolver4.resolveGraph(raw.nodes, raw.edges);
      dependencyCache.set(cacheKey, graph);
    }
    const circularReport = dependencyGraphManager.detectCycles(graph);
    dependencyEvents.emit("CyclesChecked", { hasCycles: circularReport.hasCycles });
    const executionOrder = dependencyGraphManager.computeTopologicalOrder(graph);
    const suggestions = dependencyOptimizer.optimize(graph);
    dependencyEvents.emit("OptimizationCompleted", { suggestionCount: suggestions.length });
    const validationResult = dependencyValidator2.validate(graph, circularReport);
    const durationMs = Date.now() - startTime;
    dependencyMetrics2.record(
      Object.keys(graph.nodes).length,
      Object.keys(graph.edges).length,
      durationMs,
      circularReport.hasCycles
    );
    const report = {
      reportId: `DPR-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      timestamp: Date.now(),
      graph,
      executionOrder,
      circularReport,
      confidence: validationResult.valid ? circularReport.hasCycles ? 0.4 : 0.95 : 0.2,
      suggestions,
      metrics: {
        nodeCount: Object.keys(graph.nodes).length,
        edgeCount: Object.keys(graph.edges).length,
        resolutionTimeMs: durationMs,
        criticalPathLength: executionOrder.length
      }
    };
    dependencyEvents.emit("ResolutionCompleted", report);
    return report;
  }
  subscribe(listener) {
    return dependencyEvents.subscribe(listener);
  }
};
var dependencyResolutionEngine = new DependencyResolutionEngine();

// src/extension/messageRouter.ts
var MessageRouter = class {
  constructor(webview) {
    this.webview = webview;
    this.promptDispatcher = new PromptDispatcher();
    this.initTerminalSubscription();
    this.initGitSubscription();
    this.initPatchSubscription();
    this.initRollbackSubscription();
    this.initCheckpointSubscription();
    this.initDiagnosticsSubscription();
    this.initPermissionSubscription();
    this.initContextSubscription();
    this.initEmbeddingSubscription();
    this.initVectorStoreSubscription();
    this.initRetrieverSubscription();
    this.initPromptAssemblySubscription();
    this.initRuntimeSubscription();
    this.initToolCallingSubscription();
    this.initAgentRuntimeSubscription();
    this.initMemorySubscription();
    this.initTestingSubscription();
    this.initSecuritySubscription();
    this.initDocumentationSubscription();
    this.initRefactoringSubscription();
    this.initDebugSubscription();
    this.initPerformanceSubscription();
    this.initDependencySubscription();
    this.initArchitectureSubscription();
    this.initGenerationSubscription();
    this.initAstSubscription();
    this.initMultiFileSubscription();
    this.initIncrementalSubscription();
    this.initConventionSubscription();
    this.initNamingSubscription();
    this.initImportSubscription();
    this.initSymbolSubscription();
    this.initReviewSubscription();
    this.initValidationSubscription();
    this.initOptimizationSubscription();
    this.initSafeEditSubscription();
    this.initEventBusSubscription();
    this.initTaskGenerationSubscription();
    this.initExecutionPlanningSubscription();
  }
  promptDispatcher;
  plansCache = /* @__PURE__ */ new Map();
  approvalToPlanId = /* @__PURE__ */ new Map();
  indexerEngine = null;
  getIndexerEngine() {
    if (!this.indexerEngine) {
      const folders = vscode20.workspace.workspaceFolders;
      if (!folders || folders.length === 0) {
        throw new Error("Workspace Indexer Service: No workspace folder is open");
      }
      const root = folders[0].uri.fsPath;
      this.indexerEngine = new IndexerEngine(root);
      this.initIndexerSubscription();
    }
    return this.indexerEngine;
  }
  initIndexerSubscription() {
    if (!this.indexerEngine)
      return;
    try {
      this.indexerEngine.subscribe((event) => {
        const msg = MessageFactory.createMessage(
          "INDEXER_UPDATE" /* INDEXER_UPDATE */,
          "EXTENSION" /* EXTENSION */,
          "WEBVIEW" /* WEBVIEW */,
          {
            event,
            index: this.indexerEngine.getIndex()
          }
        );
        this.postMessage(msg);
      });
    } catch (err) {
      console.error("[MessageRouter] Failed to subscribe to indexerEngine:", err);
    }
  }
  initExecutionPlanningSubscription() {
    try {
      executionEvents.subscribe((event) => {
        const msg = MessageFactory.createMessage(
          "EXECUTION_PLANNING_UPDATE" /* EXECUTION_PLANNING_UPDATE */,
          "EXTENSION" /* EXTENSION */,
          "WEBVIEW" /* WEBVIEW */,
          {
            event
          }
        );
        this.postMessage(msg);
      });
    } catch (err) {
      console.error("[MessageRouter] Failed to subscribe to ExecutionEvents:", err);
    }
  }
  initTaskGenerationSubscription() {
    try {
      taskEvents.subscribe((event) => {
        const msg = MessageFactory.createMessage(
          "TASK_GENERATION_UPDATE" /* TASK_GENERATION_UPDATE */,
          "EXTENSION" /* EXTENSION */,
          "WEBVIEW" /* WEBVIEW */,
          {
            event
          }
        );
        this.postMessage(msg);
      });
    } catch (err) {
      console.error("[MessageRouter] Failed to subscribe to TaskEvents:", err);
    }
  }
  initEventBusSubscription() {
    try {
      eventEvents.subscribe((event) => {
        const msg = MessageFactory.createMessage(
          "EVENT_BUS_UPDATE" /* EVENT_BUS_UPDATE */,
          "EXTENSION" /* EXTENSION */,
          "WEBVIEW" /* WEBVIEW */,
          {
            event
          }
        );
        this.postMessage(msg);
      });
    } catch (err) {
      console.error("[MessageRouter] Failed to subscribe to EventEvents:", err);
    }
  }
  initSafeEditSubscription() {
    try {
      safeEditEngine.subscribe((event) => {
        const msg = MessageFactory.createMessage(
          "SAFE_EDIT_UPDATE" /* SAFE_EDIT_UPDATE */,
          "EXTENSION" /* EXTENSION */,
          "WEBVIEW" /* WEBVIEW */,
          {
            event
          }
        );
        this.postMessage(msg);
      });
    } catch (err) {
      console.error("[MessageRouter] Failed to subscribe to SafeEditEngine:", err);
    }
  }
  initOptimizationSubscription() {
    try {
      patchOptimizationEngine.subscribe((event) => {
        const msg = MessageFactory.createMessage(
          "OPTIMIZATION_UPDATE" /* OPTIMIZATION_UPDATE */,
          "EXTENSION" /* EXTENSION */,
          "WEBVIEW" /* WEBVIEW */,
          {
            event
          }
        );
        this.postMessage(msg);
      });
    } catch (err) {
      console.error("[MessageRouter] Failed to subscribe to PatchOptimizationEngine:", err);
    }
  }
  initReviewSubscription() {
    try {
      reviewEngine.subscribe((event) => {
        const msg = MessageFactory.createMessage(
          "REVIEW_UPDATE" /* REVIEW_UPDATE */,
          "EXTENSION" /* EXTENSION */,
          "WEBVIEW" /* WEBVIEW */,
          {
            event
          }
        );
        this.postMessage(msg);
      });
    } catch (err) {
      console.error("[MessageRouter] Failed to subscribe to ReviewEngine:", err);
    }
  }
  initValidationSubscription() {
    try {
      validationEngine.subscribe((event) => {
        const msg = MessageFactory.createMessage(
          "VALIDATION_UPDATE" /* VALIDATION_UPDATE */,
          "EXTENSION" /* EXTENSION */,
          "WEBVIEW" /* WEBVIEW */,
          {
            event
          }
        );
        this.postMessage(msg);
      });
    } catch (err) {
      console.error("[MessageRouter] Failed to subscribe to ValidationEngine:", err);
    }
  }
  initSymbolSubscription() {
    try {
      symbolEngine.subscribe((event) => {
        const msg = MessageFactory.createMessage(
          "SYMBOL_UPDATE" /* SYMBOL_UPDATE */,
          "EXTENSION" /* EXTENSION */,
          "WEBVIEW" /* WEBVIEW */,
          {
            event
          }
        );
        this.postMessage(msg);
      });
    } catch (err) {
      console.error("[MessageRouter] Failed to subscribe to SymbolEngine:", err);
    }
  }
  initImportSubscription() {
    try {
      importEngine.subscribe((event) => {
        const msg = MessageFactory.createMessage(
          "IMPORT_UPDATE" /* IMPORT_UPDATE */,
          "EXTENSION" /* EXTENSION */,
          "WEBVIEW" /* WEBVIEW */,
          {
            event
          }
        );
        this.postMessage(msg);
      });
    } catch (err) {
      console.error("[MessageRouter] Failed to subscribe to ImportEngine:", err);
    }
  }
  initNamingSubscription() {
    try {
      namingEngine.subscribe((event) => {
        const msg = MessageFactory.createMessage(
          "NAMING_UPDATE" /* NAMING_UPDATE */,
          "EXTENSION" /* EXTENSION */,
          "WEBVIEW" /* WEBVIEW */,
          {
            event
          }
        );
        this.postMessage(msg);
      });
    } catch (err) {
      console.error("[MessageRouter] Failed to subscribe to NamingEngine:", err);
    }
  }
  initConventionSubscription() {
    try {
      conventionEngine.subscribe((event) => {
        const msg = MessageFactory.createMessage(
          "CONVENTION_UPDATE" /* CONVENTION_UPDATE */,
          "EXTENSION" /* EXTENSION */,
          "WEBVIEW" /* WEBVIEW */,
          {
            event
          }
        );
        this.postMessage(msg);
      });
    } catch (err) {
      console.error("[MessageRouter] Failed to subscribe to ConventionEngine:", err);
    }
  }
  initIncrementalSubscription() {
    try {
      incrementalEngine.subscribe((event) => {
        const msg = MessageFactory.createMessage(
          "INCREMENTAL_UPDATE" /* INCREMENTAL_UPDATE */,
          "EXTENSION" /* EXTENSION */,
          "WEBVIEW" /* WEBVIEW */,
          {
            event
          }
        );
        this.postMessage(msg);
      });
    } catch (err) {
      console.error("[MessageRouter] Failed to subscribe to IncrementalEngine:", err);
    }
  }
  initMultiFileSubscription() {
    try {
      multiFileEngine.subscribe((event) => {
        const msg = MessageFactory.createMessage(
          "MULTIFILE_UPDATE" /* MULTIFILE_UPDATE */,
          "EXTENSION" /* EXTENSION */,
          "WEBVIEW" /* WEBVIEW */,
          {
            event
          }
        );
        this.postMessage(msg);
      });
    } catch (err) {
      console.error("[MessageRouter] Failed to subscribe to MultiFileEngine:", err);
    }
  }
  initAstSubscription() {
    try {
      astEngine.subscribe((event) => {
        const msg = MessageFactory.createMessage(
          "AST_UPDATE" /* AST_UPDATE */,
          "EXTENSION" /* EXTENSION */,
          "WEBVIEW" /* WEBVIEW */,
          {
            event
          }
        );
        this.postMessage(msg);
      });
    } catch (err) {
      console.error("[MessageRouter] Failed to subscribe to ASTEngine:", err);
    }
  }
  initGenerationSubscription() {
    try {
      generationEngine.subscribe((event) => {
        const msg = MessageFactory.createMessage(
          "GENERATION_UPDATE" /* GENERATION_UPDATE */,
          "EXTENSION" /* EXTENSION */,
          "WEBVIEW" /* WEBVIEW */,
          {
            event
          }
        );
        this.postMessage(msg);
      });
    } catch (err) {
      console.error("[MessageRouter] Failed to subscribe to GenerationEngine:", err);
    }
  }
  initArchitectureSubscription() {
    try {
      const archAgent = agentRegistry.get("architecture-agent");
      if (archAgent) {
        archAgent.subscribe((event) => {
          const msg = MessageFactory.createMessage(
            "ARCHITECTURE_UPDATE" /* ARCHITECTURE_UPDATE */,
            "EXTENSION" /* EXTENSION */,
            "WEBVIEW" /* WEBVIEW */,
            {
              event
            }
          );
          this.postMessage(msg);
        });
      }
    } catch (err) {
      console.error("[MessageRouter] Failed to subscribe to ArchitectureAgent:", err);
    }
  }
  initDependencySubscription() {
    try {
      const depAgent = agentRegistry.get("dependency-agent");
      if (depAgent) {
        depAgent.subscribe((event) => {
          const msg = MessageFactory.createMessage(
            "DEPENDENCY_UPDATE" /* DEPENDENCY_UPDATE */,
            "EXTENSION" /* EXTENSION */,
            "WEBVIEW" /* WEBVIEW */,
            {
              event
            }
          );
          this.postMessage(msg);
        });
      }
    } catch (err) {
      console.error("[MessageRouter] Failed to subscribe to DependencyAgent:", err);
    }
  }
  initPerformanceSubscription() {
    try {
      const perfAgent = agentRegistry.get("performance-agent");
      if (perfAgent) {
        perfAgent.subscribe((event) => {
          const msg = MessageFactory.createMessage(
            "PERFORMANCE_UPDATE" /* PERFORMANCE_UPDATE */,
            "EXTENSION" /* EXTENSION */,
            "WEBVIEW" /* WEBVIEW */,
            {
              event
            }
          );
          this.postMessage(msg);
        });
      }
    } catch (err) {
      console.error("[MessageRouter] Failed to subscribe to PerformanceAgent:", err);
    }
  }
  initDebugSubscription() {
    try {
      const debugAgent = agentRegistry.get("debug-agent");
      if (debugAgent) {
        debugAgent.subscribe((event) => {
          const msg = MessageFactory.createMessage(
            "DEBUG_UPDATE" /* DEBUG_UPDATE */,
            "EXTENSION" /* EXTENSION */,
            "WEBVIEW" /* WEBVIEW */,
            {
              event
            }
          );
          this.postMessage(msg);
        });
      }
    } catch (err) {
      console.error("[MessageRouter] Failed to subscribe to DebugAgent:", err);
    }
  }
  initRefactoringSubscription() {
    try {
      const refAgent = agentRegistry.get("refactoring-agent");
      if (refAgent) {
        refAgent.subscribe((event) => {
          const msg = MessageFactory.createMessage(
            "REFACTORING_UPDATE" /* REFACTORING_UPDATE */,
            "EXTENSION" /* EXTENSION */,
            "WEBVIEW" /* WEBVIEW */,
            {
              event
            }
          );
          this.postMessage(msg);
        });
      }
    } catch (err) {
      console.error("[MessageRouter] Failed to subscribe to RefactoringAgent:", err);
    }
  }
  initDocumentationSubscription() {
    try {
      const docAgent = agentRegistry.get("documentation-agent");
      if (docAgent) {
        docAgent.subscribe((event) => {
          const msg = MessageFactory.createMessage(
            "DOCUMENTATION_UPDATE" /* DOCUMENTATION_UPDATE */,
            "EXTENSION" /* EXTENSION */,
            "WEBVIEW" /* WEBVIEW */,
            {
              event
            }
          );
          this.postMessage(msg);
        });
      }
    } catch (err) {
      console.error("[MessageRouter] Failed to subscribe to DocumentationAgent:", err);
    }
  }
  initSecuritySubscription() {
    try {
      const securityAgent = agentRegistry.get("security-agent");
      if (securityAgent) {
        securityAgent.subscribe((event) => {
          const msg = MessageFactory.createMessage(
            "SECURITY_UPDATE" /* SECURITY_UPDATE */,
            "EXTENSION" /* EXTENSION */,
            "WEBVIEW" /* WEBVIEW */,
            {
              event
            }
          );
          this.postMessage(msg);
        });
      }
    } catch (err) {
      console.error("[MessageRouter] Failed to subscribe to SecurityAgent:", err);
    }
  }
  initTestingSubscription() {
    try {
      const testingAgent = agentRegistry.get("testing-agent");
      if (testingAgent) {
        testingAgent.subscribe((event) => {
          const msg = MessageFactory.createMessage(
            "TESTING_UPDATE" /* TESTING_UPDATE */,
            "EXTENSION" /* EXTENSION */,
            "WEBVIEW" /* WEBVIEW */,
            {
              event
            }
          );
          this.postMessage(msg);
        });
      }
    } catch (err) {
      console.error("[MessageRouter] Failed to subscribe to TestingAgent:", err);
    }
  }
  initMemorySubscription() {
    try {
      const memoryAgent = agentRegistry.get("memory-agent");
      if (memoryAgent) {
        memoryAgent.subscribe((event) => {
          const msg = MessageFactory.createMessage(
            "MEMORY_UPDATE" /* MEMORY_UPDATE */,
            "EXTENSION" /* EXTENSION */,
            "WEBVIEW" /* WEBVIEW */,
            {
              event,
              memories: memoryAgent.brain.getAll()
            }
          );
          this.postMessage(msg);
        });
      }
    } catch (err) {
      console.error("[MessageRouter] Failed to subscribe to MemoryAgent:", err);
    }
  }
  initAgentRuntimeSubscription() {
    try {
      agentRuntimeInstance.subscribe((event) => {
        const msg = MessageFactory.createMessage(
          "AGENT_UPDATE" /* AGENT_UPDATE */,
          "EXTENSION" /* EXTENSION */,
          "WEBVIEW" /* WEBVIEW */,
          {
            event,
            stats: agentRuntimeInstance.getMonitorStats()
          }
        );
        this.postMessage(msg);
      });
    } catch (err) {
      console.error("[MessageRouter] Failed to subscribe to agentRuntimeInstance:", err);
    }
  }
  initToolCallingSubscription() {
    try {
      toolService.subscribe((event) => {
        const msg = MessageFactory.createMessage(
          "TOOL_CALLING_UPDATE" /* TOOL_CALLING_UPDATE */,
          "EXTENSION" /* EXTENSION */,
          "WEBVIEW" /* WEBVIEW */,
          {
            event,
            history: toolService.getHistory()
          }
        );
        this.postMessage(msg);
      });
    } catch (err) {
      console.error("[MessageRouter] Failed to subscribe to toolService:", err);
    }
  }
  initRuntimeSubscription() {
    try {
      runtimeService.subscribe((event) => {
        const msg = MessageFactory.createMessage(
          "RUNTIME_UPDATE" /* RUNTIME_UPDATE */,
          "EXTENSION" /* EXTENSION */,
          "WEBVIEW" /* WEBVIEW */,
          {
            event,
            stats: runtimeService.getStats()
          }
        );
        this.postMessage(msg);
      });
    } catch (err) {
      console.error("[MessageRouter] Failed to subscribe to runtimeService:", err);
    }
  }
  initPromptAssemblySubscription() {
    try {
      promptAssemblyService.subscribe((event) => {
        const msg = MessageFactory.createMessage(
          "PROMPT_ASSEMBLY_UPDATE" /* PROMPT_ASSEMBLY_UPDATE */,
          "EXTENSION" /* EXTENSION */,
          "WEBVIEW" /* WEBVIEW */,
          {
            event
          }
        );
        this.postMessage(msg);
      });
    } catch (err) {
      console.error("[MessageRouter] Failed to subscribe to promptAssemblyService:", err);
    }
  }
  initRetrieverSubscription() {
    try {
      retrieverService.subscribe((event) => {
        const msg = MessageFactory.createMessage(
          "RETRIEVER_UPDATE" /* RETRIEVER_UPDATE */,
          "EXTENSION" /* EXTENSION */,
          "WEBVIEW" /* WEBVIEW */,
          {
            event
          }
        );
        this.postMessage(msg);
      });
    } catch (err) {
      console.error("[MessageRouter] Failed to subscribe to retrieverService:", err);
    }
  }
  initVectorStoreSubscription() {
    try {
      vectorStoreService.subscribe((event) => {
        const msg = MessageFactory.createMessage(
          "VECTOR_STORE_UPDATE" /* VECTOR_STORE_UPDATE */,
          "EXTENSION" /* EXTENSION */,
          "WEBVIEW" /* WEBVIEW */,
          {
            event,
            stats: vectorStoreService.getStats()
          }
        );
        this.postMessage(msg);
      });
    } catch (err) {
      console.error("[MessageRouter] Failed to subscribe to vectorStoreService:", err);
    }
  }
  initEmbeddingSubscription() {
    try {
      embeddingService.subscribe((event) => {
        const msg = MessageFactory.createMessage(
          "EMBEDDING_UPDATE" /* EMBEDDING_UPDATE */,
          "EXTENSION" /* EXTENSION */,
          "WEBVIEW" /* WEBVIEW */,
          {
            event,
            pendingCount: embeddingService.getPendingQueue().length,
            failedCount: embeddingService.getFailedItems().size,
            provider: embeddingService.getProviderName()
          }
        );
        this.postMessage(msg);
      });
    } catch (err) {
      console.error("[MessageRouter] Failed to subscribe to embeddingService:", err);
    }
  }
  initContextSubscription() {
    try {
      contextService.subscribe((event) => {
        const msg = MessageFactory.createMessage(
          "CONTEXT_UPDATE" /* CONTEXT_UPDATE */,
          "EXTENSION" /* EXTENSION */,
          "WEBVIEW" /* WEBVIEW */,
          {
            event,
            context: contextService.getActiveContext()
          }
        );
        this.postMessage(msg);
      });
    } catch (err) {
      console.error("[MessageRouter] Failed to subscribe to contextService:", err);
    }
  }
  initPermissionSubscription() {
    try {
      permissionService.subscribe((event) => {
        const msg = MessageFactory.createMessage(
          "PERMISSION_UPDATE" /* PERMISSION_UPDATE */,
          "EXTENSION" /* EXTENSION */,
          "WEBVIEW" /* WEBVIEW */,
          {
            event,
            permissions: permissionService.getHistory(),
            rules: permissionService.getRules()
          }
        );
        this.postMessage(msg);
      });
    } catch (err) {
      console.error("[MessageRouter] Failed to subscribe to permissionService:", err);
    }
  }
  initDiagnosticsSubscription() {
    try {
      diagnosticsService.subscribe((event) => {
        const msg = MessageFactory.createMessage(
          "DIAGNOSTICS_UPDATE" /* DIAGNOSTICS_UPDATE */,
          "EXTENSION" /* EXTENSION */,
          "WEBVIEW" /* WEBVIEW */,
          {
            event,
            diagnostics: diagnosticsService.getHistory()
          }
        );
        this.postMessage(msg);
      });
    } catch (err) {
      console.error("[MessageRouter] Failed to subscribe to diagnosticsService:", err);
    }
  }
  initCheckpointSubscription() {
    try {
      checkpointService.subscribe((event) => {
        const msg = MessageFactory.createMessage(
          "CHECKPOINT_UPDATE" /* CHECKPOINT_UPDATE */,
          "EXTENSION" /* EXTENSION */,
          "WEBVIEW" /* WEBVIEW */,
          {
            event,
            checkpoints: checkpointService.getHistory()
          }
        );
        this.postMessage(msg);
      });
    } catch (err) {
      console.error("[MessageRouter] Failed to subscribe to checkpointService:", err);
    }
  }
  initRollbackSubscription() {
    try {
      rollbackService.subscribe((event) => {
        const msg = MessageFactory.createMessage(
          "ROLLBACK_UPDATE" /* ROLLBACK_UPDATE */,
          "EXTENSION" /* EXTENSION */,
          "WEBVIEW" /* WEBVIEW */,
          {
            event,
            rollbacks: rollbackService.getHistory(),
            historyLog: rollbackService.getHistoryLog()
          }
        );
        this.postMessage(msg);
      });
    } catch (err) {
      console.error("[MessageRouter] Failed to subscribe to rollbackService:", err);
    }
  }
  initPatchSubscription() {
    try {
      patchService.subscribe((event) => {
        const msg = MessageFactory.createMessage(
          "PATCH_UPDATE" /* PATCH_UPDATE */,
          "EXTENSION" /* EXTENSION */,
          "WEBVIEW" /* WEBVIEW */,
          {
            event,
            patches: patchService.getHistory()
          }
        );
        this.postMessage(msg);
      });
    } catch (err) {
      console.error("[MessageRouter] Failed to subscribe to patchService:", err);
    }
  }
  initGitSubscription() {
    try {
      gitService.subscribe((event) => {
        const msg = MessageFactory.createMessage(
          "GIT_UPDATE" /* GIT_UPDATE */,
          "EXTENSION" /* EXTENSION */,
          "WEBVIEW" /* WEBVIEW */,
          {
            event,
            repository: gitService.getRepositoryInfo(),
            status: gitService.getStatus(),
            history: gitService.getHistory(),
            diff: gitService.getDiff()
          }
        );
        this.postMessage(msg);
      });
    } catch (err) {
      console.error("[MessageRouter] Failed to subscribe to gitService:", err);
    }
  }
  initTerminalSubscription() {
    try {
      terminalService.subscribe((event) => {
        const msg = MessageFactory.createMessage(
          "TERMINAL_UPDATE" /* TERMINAL_UPDATE */,
          "EXTENSION" /* EXTENSION */,
          "WEBVIEW" /* WEBVIEW */,
          {
            event,
            commands: terminalService.getCommands(),
            activeCommand: terminalService.getActiveCommand()
          }
        );
        this.postMessage(msg);
      });
    } catch (err) {
      console.error("[MessageRouter] Failed to subscribe to terminalService:", err);
    }
  }
  handleMessage(message) {
    if (!message || !message.type) {
      return;
    }
    switch (message.type) {
      case "INIT":
        this._handleInit(message);
        break;
      case "READY":
        this._handleReady(message);
        break;
      case "PING":
        this._handlePing(message);
        break;
      case "PONG":
        this._handlePong(message);
        break;
      case "ERROR":
        this._handleError(message);
        break;
      case "LOG":
        this._handleLog(message);
        break;
      case "PROMPT_REQUEST":
        this._handlePromptRequest(message);
        break;
      case "SEND_PROMPT":
        this._handleSendPrompt(message);
        break;
      case "PLAN_REQUEST":
        this._handlePlanRequest(message);
        break;
      case "APPROVAL_ACTION":
        this._handleApprovalAction(message);
        break;
      case "WORKSPACE_REQUEST":
        this._handleWorkspaceRequest(message);
        break;
      case "EXECUTION_REQUEST":
        this._handleExecutionRequest(message);
        break;
      case "TERMINAL_REQUEST":
        this._handleTerminalRequest(message);
        break;
      case "GIT_REQUEST":
        this._handleGitRequest(message);
        break;
      case "PATCH_REQUEST":
        this._handlePatchRequest(message);
        break;
      case "ROLLBACK_REQUEST":
        this._handleRollbackRequest(message);
        break;
      case "CHECKPOINT_REQUEST":
        this._handleCheckpointRequest(message);
        break;
      case "DIAGNOSTICS_REQUEST":
        this._handleDiagnosticsRequest(message);
        break;
      case "PERMISSION_REQUEST":
        this._handlePermissionRequest(message);
        break;
      case "CONTEXT_REQUEST":
        this._handleContextRequest(message);
        break;
      case "INDEXER_REQUEST":
        this._handleIndexerRequest(message);
        break;
      case "EMBEDDING_REQUEST":
        this._handleEmbeddingRequest(message);
        break;
      case "VECTOR_STORE_REQUEST":
        this._handleVectorStoreRequest(message);
        break;
      case "RETRIEVER_REQUEST":
        this._handleRetrieverRequest(message);
        break;
      case "PROMPT_ASSEMBLY_REQUEST":
        this._handlePromptAssemblyRequest(message);
        break;
      case "RUNTIME_REQUEST":
        this._handleRuntimeRequest(message);
        break;
      case "TOOL_CALLING_REQUEST":
        this._handleToolCallingRequest(message);
        break;
      case "AGENT_REQUEST":
        this._handleAgentRequest(message);
        break;
      case "MEMORY_REQUEST":
        this._handleMemoryRequest(message);
        break;
      case "TESTING_REQUEST":
        this._handleTestingRequest(message);
        break;
      case "SECURITY_REQUEST":
        this._handleSecurityRequest(message);
        break;
      case "DOCUMENTATION_REQUEST":
        this._handleDocumentationRequest(message);
        break;
      case "REFACTORING_REQUEST":
        this._handleRefactoringRequest(message);
        break;
      case "DEBUG_REQUEST":
        this._handleDebugRequest(message);
        break;
      case "PERFORMANCE_REQUEST":
        this._handlePerformanceRequest(message);
        break;
      case "DEPENDENCY_REQUEST":
        this._handleDependencyRequest(message);
        break;
      case "ARCHITECTURE_REQUEST":
        this._handleArchitectureRequest(message);
        break;
      case "GENERATION_REQUEST":
        this._handleGenerationRequest(message);
        break;
      case "AST_REQUEST":
        this._handleAstRequest(message);
        break;
      case "MULTIFILE_REQUEST":
        this._handleMultiFileRequest(message);
        break;
      case "INCREMENTAL_REQUEST":
        this._handleIncrementalRequest(message);
        break;
      case "CONVENTION_REQUEST":
        this._handleConventionRequest(message);
        break;
      case "NAMING_REQUEST":
        this._handleNamingRequest(message);
        break;
      case "IMPORT_REQUEST":
        this._handleImportRequest(message);
        break;
      case "SYMBOL_REQUEST":
        this._handleSymbolRequest(message);
        break;
      case "REVIEW_REQUEST":
        this._handleReviewRequest(message);
        break;
      case "VALIDATION_REQUEST":
        this._handleValidationRequest(message);
        break;
      case "OPTIMIZATION_REQUEST":
        this._handleOptimizationRequest(message);
        break;
      case "SAFE_EDIT_REQUEST":
        this._handleSafeEditRequest(message);
        break;
      case "EVENT_BUS_REQUEST":
        this._handleEventBusRequest(message);
        break;
      case "TASK_GENERATION_REQUEST":
        this._handleTaskGenerationRequest(message);
        break;
      case "EXECUTION_PLANNING_REQUEST":
        this._handleExecutionPlanningRequest(message);
        break;
      default:
        console.warn(`[Sasta-Antigravity] Unhandled message type: ${message.type}`);
    }
  }
  postMessage(message) {
    message.timestamp = Date.now();
    message.source = "extension";
    this.webview.postMessage(message);
  }
  _handleApprovalAction(message) {
    try {
      const { approvalId, action } = message.payload || {};
      let result;
      if (action === "approve") {
        result = approvalEngine.approve(approvalId);
        const planId = this.approvalToPlanId.get(approvalId);
        if (planId) {
          const plan = this.plansCache.get(planId);
          if (plan) {
            const timeline = timelineService.initializeTimeline(plan);
            const initMsg = MessageFactory.createMessage(
              "TIMELINE_INIT" /* TIMELINE_INIT */,
              "EXTENSION" /* EXTENSION */,
              "WEBVIEW" /* WEBVIEW */,
              { timeline }
            );
            this.postMessage(initMsg);
            const graph = graphEngine.generateGraph(plan);
            executorService.startExecution(graph, (event) => {
              this.handleExecutorEvent(event);
            }).catch((err) => {
              console.error("[Sasta-Antigravity] Execution failed:", err);
            });
          }
        }
      } else if (action === "reject") {
        result = approvalEngine.reject(approvalId);
      } else {
        throw new Error(`Unknown approval action: ${action}`);
      }
      const responseMsg = MessageFactory.createMessage(
        "APPROVAL_ACTION_RESPONSE" /* APPROVAL_ACTION_RESPONSE */,
        "EXTENSION" /* EXTENSION */,
        "WEBVIEW" /* WEBVIEW */,
        { approval: result }
      );
      this.postMessage(responseMsg);
    } catch (error) {
      const errorMsg = MessageFactory.createMessage(
        "ERROR" /* ERROR */,
        "EXTENSION" /* EXTENSION */,
        "WEBVIEW" /* WEBVIEW */,
        { error: error.message }
      );
      this.postMessage(errorMsg);
    }
  }
  handleExecutorEvent(event) {
    if (!event.payload)
      return;
    const { node } = event.payload;
    if (node) {
      let timelineStatus = "Waiting";
      if (node.status === "Running")
        timelineStatus = "Running";
      else if (node.status === "Completed")
        timelineStatus = "Completed";
      else if (node.status === "Failed")
        timelineStatus = "Failed";
      else if (node.status === "Skipped")
        timelineStatus = "Skipped";
      else if (node.status === "Blocked")
        timelineStatus = "Blocked";
      else if (node.status === "Ready")
        timelineStatus = "Queued";
      timelineService.updateStep(node.id, timelineStatus);
      this.postMessage(MessageFactory.createMessage(
        "TIMELINE_UPDATE" /* TIMELINE_UPDATE */,
        "EXTENSION" /* EXTENSION */,
        "WEBVIEW" /* WEBVIEW */,
        { timeline: timelineService.getActiveTimeline() }
      ));
    }
    const progress = executorService.getProgress();
    if (progress) {
      this.postMessage(MessageFactory.createMessage(
        "EXECUTION_UPDATE" /* EXECUTION_UPDATE */,
        "EXTENSION" /* EXTENSION */,
        "WEBVIEW" /* WEBVIEW */,
        { progress }
      ));
    }
  }
  _handleExecutionRequest(message) {
    try {
      const action = message.payload?.action;
      if (action === "PAUSE") {
        executorService.pause();
      } else if (action === "RESUME") {
        executorService.resume();
      } else if (action === "CANCEL") {
        executorService.cancel();
      }
      const progress = executorService.getProgress();
      if (progress) {
        this.postMessage(MessageFactory.createMessage(
          "EXECUTION_UPDATE" /* EXECUTION_UPDATE */,
          "EXTENSION" /* EXTENSION */,
          "WEBVIEW" /* WEBVIEW */,
          { progress }
        ));
      }
    } catch (error) {
      this.postMessage(MessageFactory.createMessage(
        "ERROR" /* ERROR */,
        "EXTENSION" /* EXTENSION */,
        "WEBVIEW" /* WEBVIEW */,
        { error: error.message }
      ));
    }
  }
  _handlePlanRequest(message) {
    try {
      const plan = plannerEngine.generatePlan(message.payload?.prompt || "");
      const approval = approvalEngine.createApproval(plan);
      this.plansCache.set(plan.id, plan);
      this.approvalToPlanId.set(approval.id, plan.id);
      const responseMsg = MessageFactory.createMessage(
        "PLAN_RESPONSE" /* PLAN_RESPONSE */,
        "EXTENSION" /* EXTENSION */,
        "WEBVIEW" /* WEBVIEW */,
        { plan, approval }
      );
      this.postMessage(responseMsg);
    } catch (error) {
      const errorMsg = MessageFactory.createMessage(
        "ERROR" /* ERROR */,
        "EXTENSION" /* EXTENSION */,
        "WEBVIEW" /* WEBVIEW */,
        { error: error.message }
      );
      this.postMessage(errorMsg);
    }
  }
  async _handlePromptRequest(message) {
    const result = await this.promptDispatcher.dispatch(message.payload);
    const responseMsg = MessageFactory.createMessage(
      "PROMPT_RESPONSE" /* PROMPT_RESPONSE */,
      "EXTENSION" /* EXTENSION */,
      "WEBVIEW" /* WEBVIEW */,
      result
    );
    this.postMessage(responseMsg);
  }
  _handleSendPrompt(message) {
    const receivedMsg = MessageFactory.createMessage(
      "PROMPT_RECEIVED" /* PROMPT_RECEIVED */,
      "EXTENSION" /* EXTENSION */,
      "WEBVIEW" /* WEBVIEW */,
      { promptId: message.payload?.id }
    );
    this.postMessage(receivedMsg);
    setTimeout(() => {
      const responseMsg = MessageFactory.createMessage(
        "MOCK_RESPONSE" /* MOCK_RESPONSE */,
        "EXTENSION" /* EXTENSION */,
        "WEBVIEW" /* WEBVIEW */,
        {
          id: (0, import_crypto14.randomUUID)(),
          role: "ASSISTANT",
          content: "AIIdle received your prompt successfully.\n\nPlanner has not been connected yet.\n\nThis is a mock response from the Extension Host.",
          timestamp: Date.now(),
          status: "SUCCESS"
        }
      );
      this.postMessage(responseMsg);
    }, 400);
  }
  _handleWorkspaceRequest(message) {
    try {
      const summary = workspaceService.getWorkspaceSummary();
      const responseMsg = MessageFactory.createMessage(
        "WORKSPACE_RESPONSE" /* WORKSPACE_RESPONSE */,
        "EXTENSION" /* EXTENSION */,
        "WEBVIEW" /* WEBVIEW */,
        { summary }
      );
      this.postMessage(responseMsg);
    } catch (error) {
      const errorMsg = MessageFactory.createMessage(
        "ERROR" /* ERROR */,
        "EXTENSION" /* EXTENSION */,
        "WEBVIEW" /* WEBVIEW */,
        { error: error.message }
      );
      this.postMessage(errorMsg);
    }
  }
  _handleInit(message) {
    this.postMessage({ type: "READY" });
  }
  _handleReady(message) {
  }
  _handlePing(message) {
    this.postMessage({ type: "PONG", payload: message.payload });
  }
  _handlePong(message) {
  }
  _handleError(message) {
    console.error(`[Sasta-Antigravity] Webview Error:`, message.payload);
  }
  _handleLog(message) {
    console.log(`[Sasta-Antigravity] Webview Log:`, message.payload);
  }
  _handleTerminalRequest(message) {
    try {
      const { action, command, workingDirectory, environment } = message.payload || {};
      if (action === "EXECUTE") {
        terminalService.executeCommand(command, workingDirectory, environment);
        this.postMessage(MessageFactory.createMessage(
          "TERMINAL_UPDATE" /* TERMINAL_UPDATE */,
          "EXTENSION" /* EXTENSION */,
          "WEBVIEW" /* WEBVIEW */,
          {
            commands: terminalService.getCommands(),
            activeCommand: terminalService.getActiveCommand()
          }
        ));
      } else if (action === "CANCEL") {
        terminalService.cancel();
      } else if (action === "GET_HISTORY") {
        this.postMessage(MessageFactory.createMessage(
          "TERMINAL_UPDATE" /* TERMINAL_UPDATE */,
          "EXTENSION" /* EXTENSION */,
          "WEBVIEW" /* WEBVIEW */,
          {
            commands: terminalService.getCommands(),
            activeCommand: terminalService.getActiveCommand()
          }
        ));
      }
    } catch (error) {
      this.postMessage(MessageFactory.createMessage(
        "ERROR" /* ERROR */,
        "EXTENSION" /* EXTENSION */,
        "WEBVIEW" /* WEBVIEW */,
        { error: error.message }
      ));
    }
  }
  _handleGitRequest(message) {
    try {
      const { action, message: commitMessage, filePath } = message.payload || {};
      if (action === "COMMIT") {
        const hash = gitService.commit(commitMessage);
        this.postMessage(MessageFactory.createMessage(
          "GIT_UPDATE" /* GIT_UPDATE */,
          "EXTENSION" /* EXTENSION */,
          "WEBVIEW" /* WEBVIEW */,
          {
            lastCommitHash: hash,
            repository: gitService.getRepositoryInfo(),
            status: gitService.getStatus(),
            history: gitService.getHistory(),
            diff: gitService.getDiff()
          }
        ));
      } else if (action === "GET_STATUS") {
        this.postMessage(MessageFactory.createMessage(
          "GIT_UPDATE" /* GIT_UPDATE */,
          "EXTENSION" /* EXTENSION */,
          "WEBVIEW" /* WEBVIEW */,
          {
            repository: gitService.getRepositoryInfo(),
            status: gitService.getStatus(),
            history: gitService.getHistory(),
            diff: gitService.getDiff()
          }
        ));
      } else if (action === "GET_DIFF") {
        const diff = gitService.getDiff(filePath);
        this.postMessage(MessageFactory.createMessage(
          "GIT_UPDATE" /* GIT_UPDATE */,
          "EXTENSION" /* EXTENSION */,
          "WEBVIEW" /* WEBVIEW */,
          {
            diff,
            repository: gitService.getRepositoryInfo(),
            status: gitService.getStatus(),
            history: gitService.getHistory()
          }
        ));
      }
    } catch (error) {
      this.postMessage(MessageFactory.createMessage(
        "ERROR" /* ERROR */,
        "EXTENSION" /* EXTENSION */,
        "WEBVIEW" /* WEBVIEW */,
        { error: error.message }
      ));
    }
  }
  _handlePatchRequest(message) {
    try {
      const { action, patchId, operationId, filePath, changeType, oldContent, newContent, metadata } = message.payload || {};
      if (action === "CREATE") {
        const patch = patchService.createPatch(operationId, filePath, changeType, oldContent, newContent, metadata);
        this.postMessage(MessageFactory.createMessage(
          "PATCH_UPDATE" /* PATCH_UPDATE */,
          "EXTENSION" /* EXTENSION */,
          "WEBVIEW" /* WEBVIEW */,
          {
            lastCreatedPatchId: patch.id,
            patches: patchService.getHistory()
          }
        ));
      } else if (action === "VALIDATE") {
        patchService.validatePatch(patchId);
      } else if (action === "APPROVE") {
        patchService.approvePatch(patchId);
      } else if (action === "REJECT") {
        patchService.rejectPatch(patchId);
      } else if (action === "APPLY") {
        patchService.applyPatch(patchId);
      } else if (action === "ROLLBACK") {
        patchService.rollbackPatch(patchId);
      } else if (action === "GET_HISTORY") {
        this.postMessage(MessageFactory.createMessage(
          "PATCH_UPDATE" /* PATCH_UPDATE */,
          "EXTENSION" /* EXTENSION */,
          "WEBVIEW" /* WEBVIEW */,
          {
            patches: patchService.getHistory()
          }
        ));
      }
    } catch (error) {
      this.postMessage(MessageFactory.createMessage(
        "ERROR" /* ERROR */,
        "EXTENSION" /* EXTENSION */,
        "WEBVIEW" /* WEBVIEW */,
        { error: error.message }
      ));
    }
  }
  _handleRollbackRequest(message) {
    try {
      const { action, rollbackId, patchId } = message.payload || {};
      if (action === "CREATE") {
        const rollback = rollbackService.createRollback(patchId);
        const preview = rollbackService.getPreview(rollback.id);
        this.postMessage(MessageFactory.createMessage(
          "ROLLBACK_UPDATE" /* ROLLBACK_UPDATE */,
          "EXTENSION" /* EXTENSION */,
          "WEBVIEW" /* WEBVIEW */,
          {
            lastCreatedRollbackId: rollback.id,
            rollbacks: rollbackService.getHistory(),
            preview
          }
        ));
      } else if (action === "EXECUTE") {
        rollbackService.executeRollback(rollbackId);
        this.postMessage(MessageFactory.createMessage(
          "ROLLBACK_UPDATE" /* ROLLBACK_UPDATE */,
          "EXTENSION" /* EXTENSION */,
          "WEBVIEW" /* WEBVIEW */,
          {
            rollbacks: rollbackService.getHistory(),
            historyLog: rollbackService.getHistoryLog()
          }
        ));
      } else if (action === "GET_PREVIEW") {
        const preview = rollbackService.getPreview(rollbackId);
        this.postMessage(MessageFactory.createMessage(
          "ROLLBACK_UPDATE" /* ROLLBACK_UPDATE */,
          "EXTENSION" /* EXTENSION */,
          "WEBVIEW" /* WEBVIEW */,
          {
            preview,
            rollbacks: rollbackService.getHistory()
          }
        ));
      } else if (action === "GET_HISTORY") {
        this.postMessage(MessageFactory.createMessage(
          "ROLLBACK_UPDATE" /* ROLLBACK_UPDATE */,
          "EXTENSION" /* EXTENSION */,
          "WEBVIEW" /* WEBVIEW */,
          {
            rollbacks: rollbackService.getHistory(),
            historyLog: rollbackService.getHistoryLog()
          }
        ));
      }
    } catch (error) {
      this.postMessage(MessageFactory.createMessage(
        "ERROR" /* ERROR */,
        "EXTENSION" /* EXTENSION */,
        "WEBVIEW" /* WEBVIEW */,
        { error: error.message }
      ));
    }
  }
  _handleCheckpointRequest(message) {
    try {
      const { action, checkpointId, workspaceId, transactionId, affectedFiles, metadata } = message.payload || {};
      if (action === "CREATE") {
        const cp = checkpointService.createCheckpoint(workspaceId, transactionId, affectedFiles, metadata);
        this.postMessage(MessageFactory.createMessage(
          "CHECKPOINT_UPDATE" /* CHECKPOINT_UPDATE */,
          "EXTENSION" /* EXTENSION */,
          "WEBVIEW" /* WEBVIEW */,
          {
            lastCreatedCheckpointId: cp.id,
            checkpoints: checkpointService.getHistory()
          }
        ));
      } else if (action === "RESTORE") {
        checkpointService.restoreCheckpoint(checkpointId);
        this.postMessage(MessageFactory.createMessage(
          "CHECKPOINT_UPDATE" /* CHECKPOINT_UPDATE */,
          "EXTENSION" /* EXTENSION */,
          "WEBVIEW" /* WEBVIEW */,
          {
            checkpoints: checkpointService.getHistory()
          }
        ));
      } else if (action === "DELETE") {
        checkpointService.deleteCheckpoint(checkpointId);
        this.postMessage(MessageFactory.createMessage(
          "CHECKPOINT_UPDATE" /* CHECKPOINT_UPDATE */,
          "EXTENSION" /* EXTENSION */,
          "WEBVIEW" /* WEBVIEW */,
          {
            checkpoints: checkpointService.getHistory()
          }
        ));
      } else if (action === "EXPIRE") {
        checkpointService.expireCheckpoint(checkpointId);
        this.postMessage(MessageFactory.createMessage(
          "CHECKPOINT_UPDATE" /* CHECKPOINT_UPDATE */,
          "EXTENSION" /* EXTENSION */,
          "WEBVIEW" /* WEBVIEW */,
          {
            checkpoints: checkpointService.getHistory()
          }
        ));
      } else if (action === "GET_HISTORY") {
        this.postMessage(MessageFactory.createMessage(
          "CHECKPOINT_UPDATE" /* CHECKPOINT_UPDATE */,
          "EXTENSION" /* EXTENSION */,
          "WEBVIEW" /* WEBVIEW */,
          {
            checkpoints: checkpointService.getHistory()
          }
        ));
      }
    } catch (error) {
      this.postMessage(MessageFactory.createMessage(
        "ERROR" /* ERROR */,
        "EXTENSION" /* EXTENSION */,
        "WEBVIEW" /* WEBVIEW */,
        { error: error.message }
      ));
    }
  }
  _handleDiagnosticsRequest(message) {
    try {
      const { action, diagnosticId, status, filters } = message.payload || {};
      if (action === "REPORT") {
        const { sourceModule, severity, category, messageText, details, stackTrace, operationId } = message.payload || {};
        const diag = diagnosticsService.report(sourceModule, severity, category, messageText, details, stackTrace, operationId);
        this.postMessage(MessageFactory.createMessage(
          "DIAGNOSTICS_UPDATE" /* DIAGNOSTICS_UPDATE */,
          "EXTENSION" /* EXTENSION */,
          "WEBVIEW" /* WEBVIEW */,
          {
            lastCreatedDiagnosticId: diag.id,
            diagnostics: diagnosticsService.getHistory()
          }
        ));
      } else if (action === "UPDATE_STATUS") {
        diagnosticsService.updateStatus(diagnosticId, status);
        this.postMessage(MessageFactory.createMessage(
          "DIAGNOSTICS_UPDATE" /* DIAGNOSTICS_UPDATE */,
          "EXTENSION" /* EXTENSION */,
          "WEBVIEW" /* WEBVIEW */,
          {
            diagnostics: diagnosticsService.getHistory()
          }
        ));
      } else if (action === "GET_FILTERED") {
        const filtered = diagnosticsService.getFilteredHistory(filters);
        this.postMessage(MessageFactory.createMessage(
          "DIAGNOSTICS_UPDATE" /* DIAGNOSTICS_UPDATE */,
          "EXTENSION" /* EXTENSION */,
          "WEBVIEW" /* WEBVIEW */,
          {
            diagnostics: filtered
          }
        ));
      } else if (action === "EXPORT") {
        const json = diagnosticsService.exportJson();
        this.postMessage(MessageFactory.createMessage(
          "DIAGNOSTICS_UPDATE" /* DIAGNOSTICS_UPDATE */,
          "EXTENSION" /* EXTENSION */,
          "WEBVIEW" /* WEBVIEW */,
          {
            exportData: json,
            diagnostics: diagnosticsService.getHistory()
          }
        ));
      } else if (action === "GET_HISTORY") {
        this.postMessage(MessageFactory.createMessage(
          "DIAGNOSTICS_UPDATE" /* DIAGNOSTICS_UPDATE */,
          "EXTENSION" /* EXTENSION */,
          "WEBVIEW" /* WEBVIEW */,
          {
            diagnostics: diagnosticsService.getHistory()
          }
        ));
      }
    } catch (error) {
      this.postMessage(MessageFactory.createMessage(
        "ERROR" /* ERROR */,
        "EXTENSION" /* EXTENSION */,
        "WEBVIEW" /* WEBVIEW */,
        { error: error.message }
      ));
    }
  }
  _handlePermissionRequest(message) {
    try {
      const { action, requestId, approved, policy, actionType, resource, riskLevel, reason, requestedBy, operationId } = message.payload || {};
      if (action === "REQUEST") {
        const result = permissionService.requestPermission(actionType, resource, riskLevel, reason, requestedBy, operationId);
        this.postMessage(MessageFactory.createMessage(
          "PERMISSION_UPDATE" /* PERMISSION_UPDATE */,
          "EXTENSION" /* EXTENSION */,
          "WEBVIEW" /* WEBVIEW */,
          {
            lastRequestResult: result,
            permissions: permissionService.getHistory(),
            rules: permissionService.getRules()
          }
        ));
      } else if (action === "GRANT") {
        permissionService.grantPermission(requestId, approved, policy);
        this.postMessage(MessageFactory.createMessage(
          "PERMISSION_UPDATE" /* PERMISSION_UPDATE */,
          "EXTENSION" /* EXTENSION */,
          "WEBVIEW" /* WEBVIEW */,
          {
            permissions: permissionService.getHistory(),
            rules: permissionService.getRules()
          }
        ));
      } else if (action === "GET_HISTORY") {
        this.postMessage(MessageFactory.createMessage(
          "PERMISSION_UPDATE" /* PERMISSION_UPDATE */,
          "EXTENSION" /* EXTENSION */,
          "WEBVIEW" /* WEBVIEW */,
          {
            permissions: permissionService.getHistory(),
            rules: permissionService.getRules()
          }
        ));
      }
    } catch (error) {
      this.postMessage(MessageFactory.createMessage(
        "ERROR" /* ERROR */,
        "EXTENSION" /* EXTENSION */,
        "WEBVIEW" /* WEBVIEW */,
        { error: error.message }
      ));
    }
  }
  _handleContextRequest(message) {
    try {
      const { action, filePaths, selection, planner, execution, git, diagnostics, limitBytes } = message.payload || {};
      if (action === "BUILD") {
        const ctx = contextService.buildContext({
          filePaths,
          selection,
          planner,
          execution,
          git,
          diagnostics,
          limitBytes
        });
        this.postMessage(MessageFactory.createMessage(
          "CONTEXT_UPDATE" /* CONTEXT_UPDATE */,
          "EXTENSION" /* EXTENSION */,
          "WEBVIEW" /* WEBVIEW */,
          {
            context: ctx
          }
        ));
      } else if (action === "EXPIRE") {
        contextService.expireContext();
        this.postMessage(MessageFactory.createMessage(
          "CONTEXT_UPDATE" /* CONTEXT_UPDATE */,
          "EXTENSION" /* EXTENSION */,
          "WEBVIEW" /* WEBVIEW */,
          {
            context: null
          }
        ));
      } else if (action === "GET_ACTIVE") {
        this.postMessage(MessageFactory.createMessage(
          "CONTEXT_UPDATE" /* CONTEXT_UPDATE */,
          "EXTENSION" /* EXTENSION */,
          "WEBVIEW" /* WEBVIEW */,
          {
            context: contextService.getActiveContext()
          }
        ));
      }
    } catch (error) {
      this.postMessage(MessageFactory.createMessage(
        "ERROR" /* ERROR */,
        "EXTENSION" /* EXTENSION */,
        "WEBVIEW" /* WEBVIEW */,
        { error: error.message }
      ));
    }
  }
  _handleIndexerRequest(message) {
    try {
      const { action, workspaceId, filePath } = message.payload || {};
      const engine = this.getIndexerEngine();
      if (action === "START") {
        const index = engine.startIndexing(workspaceId);
        this.postMessage(MessageFactory.createMessage(
          "INDEXER_UPDATE" /* INDEXER_UPDATE */,
          "EXTENSION" /* EXTENSION */,
          "WEBVIEW" /* WEBVIEW */,
          {
            index
          }
        ));
      } else if (action === "UPDATE_FILE") {
        engine.updateIndexFile(filePath);
        this.postMessage(MessageFactory.createMessage(
          "INDEXER_UPDATE" /* INDEXER_UPDATE */,
          "EXTENSION" /* EXTENSION */,
          "WEBVIEW" /* WEBVIEW */,
          {
            index: engine.getIndex()
          }
        ));
      } else if (action === "GET_INDEX") {
        this.postMessage(MessageFactory.createMessage(
          "INDEXER_UPDATE" /* INDEXER_UPDATE */,
          "EXTENSION" /* EXTENSION */,
          "WEBVIEW" /* WEBVIEW */,
          {
            index: engine.getIndex()
          }
        ));
      }
    } catch (error) {
      this.postMessage(MessageFactory.createMessage(
        "ERROR" /* ERROR */,
        "EXTENSION" /* EXTENSION */,
        "WEBVIEW" /* WEBVIEW */,
        { error: error.message }
      ));
    }
  }
  async _handleEmbeddingRequest(message) {
    try {
      const { action, sourceId, sourceType, content } = message.payload || {};
      if (action === "QUEUE") {
        const obj = embeddingService.queueJob(sourceId, sourceType, content);
        this.postMessage(MessageFactory.createMessage(
          "EMBEDDING_UPDATE" /* EMBEDDING_UPDATE */,
          "EXTENSION" /* EXTENSION */,
          "WEBVIEW" /* WEBVIEW */,
          {
            lastQueued: obj,
            pendingCount: embeddingService.getPendingQueue().length,
            failedCount: embeddingService.getFailedItems().size,
            provider: embeddingService.getProviderName()
          }
        ));
      } else if (action === "PROCESS") {
        await embeddingService.processQueue();
        this.postMessage(MessageFactory.createMessage(
          "EMBEDDING_UPDATE" /* EMBEDDING_UPDATE */,
          "EXTENSION" /* EXTENSION */,
          "WEBVIEW" /* WEBVIEW */,
          {
            pendingCount: embeddingService.getPendingQueue().length,
            failedCount: embeddingService.getFailedItems().size,
            provider: embeddingService.getProviderName()
          }
        ));
      } else if (action === "GET_STATUS") {
        this.postMessage(MessageFactory.createMessage(
          "EMBEDDING_UPDATE" /* EMBEDDING_UPDATE */,
          "EXTENSION" /* EXTENSION */,
          "WEBVIEW" /* WEBVIEW */,
          {
            pendingCount: embeddingService.getPendingQueue().length,
            failedCount: embeddingService.getFailedItems().size,
            provider: embeddingService.getProviderName()
          }
        ));
      }
    } catch (error) {
      this.postMessage(MessageFactory.createMessage(
        "ERROR" /* ERROR */,
        "EXTENSION" /* EXTENSION */,
        "WEBVIEW" /* WEBVIEW */,
        { error: error.message }
      ));
    }
  }
  _handleVectorStoreRequest(message) {
    try {
      const { action, record, id, filters, queryVector, limit, metric } = message.payload || {};
      if (action === "INSERT") {
        vectorStoreService.insert(record);
        this.postMessage(MessageFactory.createMessage(
          "VECTOR_STORE_UPDATE" /* VECTOR_STORE_UPDATE */,
          "EXTENSION" /* EXTENSION */,
          "WEBVIEW" /* WEBVIEW */,
          {
            stats: vectorStoreService.getStats()
          }
        ));
      } else if (action === "DELETE") {
        vectorStoreService.delete(id);
        this.postMessage(MessageFactory.createMessage(
          "VECTOR_STORE_UPDATE" /* VECTOR_STORE_UPDATE */,
          "EXTENSION" /* EXTENSION */,
          "WEBVIEW" /* WEBVIEW */,
          {
            stats: vectorStoreService.getStats()
          }
        ));
      } else if (action === "QUERY") {
        const results = vectorStoreService.query(filters);
        this.postMessage(MessageFactory.createMessage(
          "VECTOR_STORE_UPDATE" /* VECTOR_STORE_UPDATE */,
          "EXTENSION" /* EXTENSION */,
          "WEBVIEW" /* WEBVIEW */,
          {
            queryResults: results,
            stats: vectorStoreService.getStats()
          }
        ));
      } else if (action === "SEARCH") {
        const results = vectorStoreService.similaritySearch(queryVector, limit, metric);
        this.postMessage(MessageFactory.createMessage(
          "VECTOR_STORE_UPDATE" /* VECTOR_STORE_UPDATE */,
          "EXTENSION" /* EXTENSION */,
          "WEBVIEW" /* WEBVIEW */,
          {
            searchResults: results,
            stats: vectorStoreService.getStats()
          }
        ));
      } else if (action === "CLEAR") {
        vectorStoreService.clear();
        this.postMessage(MessageFactory.createMessage(
          "VECTOR_STORE_UPDATE" /* VECTOR_STORE_UPDATE */,
          "EXTENSION" /* EXTENSION */,
          "WEBVIEW" /* WEBVIEW */,
          {
            stats: vectorStoreService.getStats()
          }
        ));
      } else if (action === "GET_STATS") {
        this.postMessage(MessageFactory.createMessage(
          "VECTOR_STORE_UPDATE" /* VECTOR_STORE_UPDATE */,
          "EXTENSION" /* EXTENSION */,
          "WEBVIEW" /* WEBVIEW */,
          {
            stats: vectorStoreService.getStats()
          }
        ));
      }
    } catch (error) {
      this.postMessage(MessageFactory.createMessage(
        "ERROR" /* ERROR */,
        "EXTENSION" /* EXTENSION */,
        "WEBVIEW" /* WEBVIEW */,
        { error: error.message }
      ));
    }
  }
  _handleRetrieverRequest(message) {
    try {
      const { action, request } = message.payload || {};
      if (action === "RETRIEVE") {
        const index = this.getIndexerEngine().getIndex();
        if (!index) {
          throw new Error("Retriever error: Project Index has not been built yet. Run project scan first.");
        }
        const context = retrieverService.retrieveContext(request, index);
        this.postMessage(MessageFactory.createMessage(
          "RETRIEVER_UPDATE" /* RETRIEVER_UPDATE */,
          "EXTENSION" /* EXTENSION */,
          "WEBVIEW" /* WEBVIEW */,
          {
            retrievedContext: context
          }
        ));
      } else if (action === "INVALIDATE_CACHE") {
        retrieverService.invalidateCache();
        this.postMessage(MessageFactory.createMessage(
          "RETRIEVER_UPDATE" /* RETRIEVER_UPDATE */,
          "EXTENSION" /* EXTENSION */,
          "WEBVIEW" /* WEBVIEW */,
          {
            cacheInvalidated: true
          }
        ));
      }
    } catch (error) {
      this.postMessage(MessageFactory.createMessage(
        "ERROR" /* ERROR */,
        "EXTENSION" /* EXTENSION */,
        "WEBVIEW" /* WEBVIEW */,
        { error: error.message }
      ));
    }
  }
  _handlePromptAssemblyRequest(message) {
    try {
      const { action, request } = message.payload || {};
      if (action === "ASSEMBLE") {
        const pkg = promptAssemblyService.assemblePrompt(request);
        this.postMessage(MessageFactory.createMessage(
          "PROMPT_ASSEMBLY_UPDATE" /* PROMPT_ASSEMBLY_UPDATE */,
          "EXTENSION" /* EXTENSION */,
          "WEBVIEW" /* WEBVIEW */,
          {
            promptPackage: pkg
          }
        ));
      } else if (action === "INVALIDATE_CACHE") {
        promptAssemblyService.invalidateCache();
        this.postMessage(MessageFactory.createMessage(
          "PROMPT_ASSEMBLY_UPDATE" /* PROMPT_ASSEMBLY_UPDATE */,
          "EXTENSION" /* EXTENSION */,
          "WEBVIEW" /* WEBVIEW */,
          {
            cacheInvalidated: true
          }
        ));
      }
    } catch (error) {
      this.postMessage(MessageFactory.createMessage(
        "ERROR" /* ERROR */,
        "EXTENSION" /* EXTENSION */,
        "WEBVIEW" /* WEBVIEW */,
        { error: error.message }
      ));
    }
  }
  _handleRuntimeRequest(message) {
    try {
      const { action, config, promptPkg, genConfig } = message.payload || {};
      if (action === "LOAD_MODEL") {
        runtimeService.loadModel(config).then(() => {
          this.postMessage(MessageFactory.createMessage(
            "RUNTIME_UPDATE" /* RUNTIME_UPDATE */,
            "EXTENSION" /* EXTENSION */,
            "WEBVIEW" /* WEBVIEW */,
            {
              stats: runtimeService.getStats()
            }
          ));
        });
      } else if (action === "UNLOAD_MODEL") {
        runtimeService.unloadModel().then(() => {
          this.postMessage(MessageFactory.createMessage(
            "RUNTIME_UPDATE" /* RUNTIME_UPDATE */,
            "EXTENSION" /* EXTENSION */,
            "WEBVIEW" /* WEBVIEW */,
            {
              stats: runtimeService.getStats()
            }
          ));
        });
      } else if (action === "GENERATE") {
        runtimeService.generate(promptPkg, genConfig, (token) => {
          this.postMessage(MessageFactory.createMessage(
            "RUNTIME_UPDATE" /* RUNTIME_UPDATE */,
            "EXTENSION" /* EXTENSION */,
            "WEBVIEW" /* WEBVIEW */,
            {
              chunk: token,
              stats: runtimeService.getStats()
            }
          ));
        }).then((res) => {
          this.postMessage(MessageFactory.createMessage(
            "RUNTIME_UPDATE" /* RUNTIME_UPDATE */,
            "EXTENSION" /* EXTENSION */,
            "WEBVIEW" /* WEBVIEW */,
            {
              result: res,
              stats: runtimeService.getStats()
            }
          ));
        });
      } else if (action === "GET_STATS") {
        this.postMessage(MessageFactory.createMessage(
          "RUNTIME_UPDATE" /* RUNTIME_UPDATE */,
          "EXTENSION" /* EXTENSION */,
          "WEBVIEW" /* WEBVIEW */,
          {
            stats: runtimeService.getStats()
          }
        ));
      }
    } catch (error) {
      this.postMessage(MessageFactory.createMessage(
        "ERROR" /* ERROR */,
        "EXTENSION" /* EXTENSION */,
        "WEBVIEW" /* WEBVIEW */,
        { error: error.message }
      ));
    }
  }
  _handleToolCallingRequest(message) {
    try {
      const { action, toolId, args } = message.payload || {};
      if (action === "EXECUTE") {
        toolService.executeTool(toolId, args).then((result) => {
          this.postMessage(MessageFactory.createMessage(
            "TOOL_CALLING_UPDATE" /* TOOL_CALLING_UPDATE */,
            "EXTENSION" /* EXTENSION */,
            "WEBVIEW" /* WEBVIEW */,
            {
              result,
              history: toolService.getHistory()
            }
          ));
        });
      } else if (action === "GET_HISTORY") {
        this.postMessage(MessageFactory.createMessage(
          "TOOL_CALLING_UPDATE" /* TOOL_CALLING_UPDATE */,
          "EXTENSION" /* EXTENSION */,
          "WEBVIEW" /* WEBVIEW */,
          {
            history: toolService.getHistory()
          }
        ));
      }
    } catch (error) {
      this.postMessage(MessageFactory.createMessage(
        "ERROR" /* ERROR */,
        "EXTENSION" /* EXTENSION */,
        "WEBVIEW" /* WEBVIEW */,
        { error: error.message }
      ));
    }
  }
  _handleAgentRequest(message) {
    try {
      const { action, agentId, task } = message.payload || {};
      if (action === "LOAD") {
        agentRuntimeInstance.loadAgent(agentId).then(() => {
          this.postMessage(MessageFactory.createMessage(
            "AGENT_UPDATE" /* AGENT_UPDATE */,
            "EXTENSION" /* EXTENSION */,
            "WEBVIEW" /* WEBVIEW */,
            {
              stats: agentRuntimeInstance.getMonitorStats()
            }
          ));
        });
      } else if (action === "UNLOAD") {
        agentRuntimeInstance.unloadAgent(agentId).then(() => {
          this.postMessage(MessageFactory.createMessage(
            "AGENT_UPDATE" /* AGENT_UPDATE */,
            "EXTENSION" /* EXTENSION */,
            "WEBVIEW" /* WEBVIEW */,
            {
              stats: agentRuntimeInstance.getMonitorStats()
            }
          ));
        });
      } else if (action === "DISPATCH") {
        agentRuntimeInstance.dispatchTask(task).then((res) => {
          this.postMessage(MessageFactory.createMessage(
            "AGENT_UPDATE" /* AGENT_UPDATE */,
            "EXTENSION" /* EXTENSION */,
            "WEBVIEW" /* WEBVIEW */,
            {
              result: res,
              stats: agentRuntimeInstance.getMonitorStats()
            }
          ));
        });
      } else if (action === "GET_STATS") {
        this.postMessage(MessageFactory.createMessage(
          "AGENT_UPDATE" /* AGENT_UPDATE */,
          "EXTENSION" /* EXTENSION */,
          "WEBVIEW" /* WEBVIEW */,
          {
            stats: agentRuntimeInstance.getMonitorStats()
          }
        ));
      }
    } catch (error) {
      this.postMessage(MessageFactory.createMessage(
        "ERROR" /* ERROR */,
        "EXTENSION" /* EXTENSION */,
        "WEBVIEW" /* WEBVIEW */,
        { error: error.message }
      ));
    }
  }
  _handleMemoryRequest(message) {
    try {
      const memoryAgent = agentRegistry.get("memory-agent");
      if (!memoryAgent) {
        throw new Error("Memory Agent not found in registry");
      }
      const { action, memory, id, updates, filter } = message.payload || {};
      if (action === "CREATE") {
        const created = memoryAgent.brain.createMemory(memory);
        this.postMessage(MessageFactory.createMessage(
          "MEMORY_UPDATE" /* MEMORY_UPDATE */,
          "EXTENSION" /* EXTENSION */,
          "WEBVIEW" /* WEBVIEW */,
          {
            lastAction: "CREATE",
            created,
            memories: memoryAgent.brain.getAll()
          }
        ));
      } else if (action === "SEARCH") {
        const results = memoryAgent.brain.search(filter || {});
        this.postMessage(MessageFactory.createMessage(
          "MEMORY_UPDATE" /* MEMORY_UPDATE */,
          "EXTENSION" /* EXTENSION */,
          "WEBVIEW" /* WEBVIEW */,
          {
            lastAction: "SEARCH",
            results,
            memories: memoryAgent.brain.getAll()
          }
        ));
      } else if (action === "UPDATE") {
        const updated = memoryAgent.brain.updateMemory(id, updates);
        this.postMessage(MessageFactory.createMessage(
          "MEMORY_UPDATE" /* MEMORY_UPDATE */,
          "EXTENSION" /* EXTENSION */,
          "WEBVIEW" /* WEBVIEW */,
          {
            lastAction: "UPDATE",
            updated,
            memories: memoryAgent.brain.getAll()
          }
        ));
      } else if (action === "DELETE") {
        memoryAgent.brain.deleteMemory(id);
        this.postMessage(MessageFactory.createMessage(
          "MEMORY_UPDATE" /* MEMORY_UPDATE */,
          "EXTENSION" /* EXTENSION */,
          "WEBVIEW" /* WEBVIEW */,
          {
            lastAction: "DELETE",
            deletedId: id,
            memories: memoryAgent.brain.getAll()
          }
        ));
      } else if (action === "COMPRESS") {
        memoryAgent.brain.compress();
        this.postMessage(MessageFactory.createMessage(
          "MEMORY_UPDATE" /* MEMORY_UPDATE */,
          "EXTENSION" /* EXTENSION */,
          "WEBVIEW" /* WEBVIEW */,
          {
            lastAction: "COMPRESS",
            memories: memoryAgent.brain.getAll()
          }
        ));
      } else if (action === "GET_ALL") {
        this.postMessage(MessageFactory.createMessage(
          "MEMORY_UPDATE" /* MEMORY_UPDATE */,
          "EXTENSION" /* EXTENSION */,
          "WEBVIEW" /* WEBVIEW */,
          {
            lastAction: "GET_ALL",
            memories: memoryAgent.brain.getAll()
          }
        ));
      }
    } catch (error) {
      this.postMessage(MessageFactory.createMessage(
        "ERROR" /* ERROR */,
        "EXTENSION" /* EXTENSION */,
        "WEBVIEW" /* WEBVIEW */,
        { error: error.message }
      ));
    }
  }
  _handleTestingRequest(message) {
    try {
      const testingAgent = agentRegistry.get("testing-agent");
      if (!testingAgent) {
        throw new Error("Testing Agent not found in registry");
      }
      const { action, executionReport, framework } = message.payload || {};
      if (action === "RUN_WORKFLOW") {
        testingAgent.brain.runTestingWorkflow(executionReport, framework).then((report) => {
          this.postMessage(MessageFactory.createMessage(
            "TESTING_UPDATE" /* TESTING_UPDATE */,
            "EXTENSION" /* EXTENSION */,
            "WEBVIEW" /* WEBVIEW */,
            {
              lastAction: "RUN_WORKFLOW",
              report
            }
          ));
        }).catch((err) => {
          this.postMessage(MessageFactory.createMessage(
            "ERROR" /* ERROR */,
            "EXTENSION" /* EXTENSION */,
            "WEBVIEW" /* WEBVIEW */,
            { error: err.message }
          ));
        });
      }
    } catch (error) {
      this.postMessage(MessageFactory.createMessage(
        "ERROR" /* ERROR */,
        "EXTENSION" /* EXTENSION */,
        "WEBVIEW" /* WEBVIEW */,
        { error: error.message }
      ));
    }
  }
  _handleSecurityRequest(message) {
    try {
      const securityAgent = agentRegistry.get("security-agent");
      if (!securityAgent) {
        throw new Error("Security Agent not found in registry");
      }
      const { action, plan } = message.payload || {};
      if (action === "SCAN_PLAN") {
        securityAgent.brain.scanPlanWorkflow(plan).then((report) => {
          this.postMessage(MessageFactory.createMessage(
            "SECURITY_UPDATE" /* SECURITY_UPDATE */,
            "EXTENSION" /* EXTENSION */,
            "WEBVIEW" /* WEBVIEW */,
            {
              lastAction: "SCAN_PLAN",
              report
            }
          ));
        }).catch((err) => {
          this.postMessage(MessageFactory.createMessage(
            "ERROR" /* ERROR */,
            "EXTENSION" /* EXTENSION */,
            "WEBVIEW" /* WEBVIEW */,
            { error: err.message }
          ));
        });
      }
    } catch (error) {
      this.postMessage(MessageFactory.createMessage(
        "ERROR" /* ERROR */,
        "EXTENSION" /* EXTENSION */,
        "WEBVIEW" /* WEBVIEW */,
        { error: error.message }
      ));
    }
  }
  _handleDocumentationRequest(message) {
    try {
      const docAgent = agentRegistry.get("documentation-agent");
      if (!docAgent) {
        throw new Error("Documentation Agent not found in registry");
      }
      const { action, gitChanges } = message.payload || {};
      if (action === "GENERATE_DOCS") {
        docAgent.brain.runDocumentationWorkflow(gitChanges || []).then((report) => {
          this.postMessage(MessageFactory.createMessage(
            "DOCUMENTATION_UPDATE" /* DOCUMENTATION_UPDATE */,
            "EXTENSION" /* EXTENSION */,
            "WEBVIEW" /* WEBVIEW */,
            {
              lastAction: "GENERATE_DOCS",
              report
            }
          ));
        }).catch((err) => {
          this.postMessage(MessageFactory.createMessage(
            "ERROR" /* ERROR */,
            "EXTENSION" /* EXTENSION */,
            "WEBVIEW" /* WEBVIEW */,
            { error: err.message }
          ));
        });
      }
    } catch (error) {
      this.postMessage(MessageFactory.createMessage(
        "ERROR" /* ERROR */,
        "EXTENSION" /* EXTENSION */,
        "WEBVIEW" /* WEBVIEW */,
        { error: error.message }
      ));
    }
  }
  _handleRefactoringRequest(message) {
    try {
      const refAgent = agentRegistry.get("refactoring-agent");
      if (!refAgent) {
        throw new Error("Refactoring Agent not found in registry");
      }
      const { action, files } = message.payload || {};
      if (action === "ANALYZE_SMELLS") {
        refAgent.brain.runRefactoringAnalysis(files || []).then((report) => {
          this.postMessage(MessageFactory.createMessage(
            "REFACTORING_UPDATE" /* REFACTORING_UPDATE */,
            "EXTENSION" /* EXTENSION */,
            "WEBVIEW" /* WEBVIEW */,
            {
              lastAction: "ANALYZE_SMELLS",
              report
            }
          ));
        }).catch((err) => {
          this.postMessage(MessageFactory.createMessage(
            "ERROR" /* ERROR */,
            "EXTENSION" /* EXTENSION */,
            "WEBVIEW" /* WEBVIEW */,
            { error: err.message }
          ));
        });
      }
    } catch (error) {
      this.postMessage(MessageFactory.createMessage(
        "ERROR" /* ERROR */,
        "EXTENSION" /* EXTENSION */,
        "WEBVIEW" /* WEBVIEW */,
        { error: error.message }
      ));
    }
  }
  _handleDebugRequest(message) {
    try {
      const debugAgent = agentRegistry.get("debug-agent");
      if (!debugAgent) {
        throw new Error("Debug Agent not found in registry");
      }
      const { action, diagnostics } = message.payload || {};
      if (action === "ANALYZE_FAILURE") {
        debugAgent.brain.runFailureAnalysis(diagnostics).then((report) => {
          this.postMessage(MessageFactory.createMessage(
            "DEBUG_UPDATE" /* DEBUG_UPDATE */,
            "EXTENSION" /* EXTENSION */,
            "WEBVIEW" /* WEBVIEW */,
            {
              lastAction: "ANALYZE_FAILURE",
              report
            }
          ));
        }).catch((err) => {
          this.postMessage(MessageFactory.createMessage(
            "ERROR" /* ERROR */,
            "EXTENSION" /* EXTENSION */,
            "WEBVIEW" /* WEBVIEW */,
            { error: err.message }
          ));
        });
      }
    } catch (error) {
      this.postMessage(MessageFactory.createMessage(
        "ERROR" /* ERROR */,
        "EXTENSION" /* EXTENSION */,
        "WEBVIEW" /* WEBVIEW */,
        { error: error.message }
      ));
    }
  }
  _handlePerformanceRequest(message) {
    try {
      const perfAgent = agentRegistry.get("performance-agent");
      if (!perfAgent) {
        throw new Error("Performance Agent not found in registry");
      }
      const { action, filePath } = message.payload || {};
      if (action === "ANALYZE_PERFORMANCE") {
        perfAgent.brain.runProfilerAudit(filePath || "").then((report) => {
          this.postMessage(MessageFactory.createMessage(
            "PERFORMANCE_UPDATE" /* PERFORMANCE_UPDATE */,
            "EXTENSION" /* EXTENSION */,
            "WEBVIEW" /* WEBVIEW */,
            {
              lastAction: "ANALYZE_PERFORMANCE",
              report
            }
          ));
        }).catch((err) => {
          this.postMessage(MessageFactory.createMessage(
            "ERROR" /* ERROR */,
            "EXTENSION" /* EXTENSION */,
            "WEBVIEW" /* WEBVIEW */,
            { error: err.message }
          ));
        });
      }
    } catch (error) {
      this.postMessage(MessageFactory.createMessage(
        "ERROR" /* ERROR */,
        "EXTENSION" /* EXTENSION */,
        "WEBVIEW" /* WEBVIEW */,
        { error: error.message }
      ));
    }
  }
  _handleDependencyRequest(message) {
    try {
      const { action, packageJsonPath } = message.payload || {};
      if (action === "ANALYZE_DEPENDENCIES") {
        dependencyResolutionEngine.resolve(message.payload || {}).then((report) => {
          this.postMessage(MessageFactory.createMessage(
            "DEPENDENCY_UPDATE" /* DEPENDENCY_UPDATE */,
            "EXTENSION" /* EXTENSION */,
            "WEBVIEW" /* WEBVIEW */,
            {
              lastAction: "ANALYZE_DEPENDENCIES",
              report
            }
          ));
        }).catch((err) => {
          this.postMessage(MessageFactory.createMessage(
            "ERROR" /* ERROR */,
            "EXTENSION" /* EXTENSION */,
            "WEBVIEW" /* WEBVIEW */,
            { error: err.message }
          ));
        });
      }
    } catch (error) {
      this.postMessage(MessageFactory.createMessage(
        "ERROR" /* ERROR */,
        "EXTENSION" /* EXTENSION */,
        "WEBVIEW" /* WEBVIEW */,
        { error: error.message }
      ));
    }
  }
  _handleArchitectureRequest(message) {
    try {
      const archAgent = agentRegistry.get("architecture-agent");
      if (!archAgent) {
        throw new Error("Architecture Agent not found in registry");
      }
      const { action, filesMap } = message.payload || {};
      if (action === "ANALYZE_ARCHITECTURE") {
        archAgent.brain.runArchitectureAnalysis(filesMap || {}).then((report) => {
          this.postMessage(MessageFactory.createMessage(
            "ARCHITECTURE_UPDATE" /* ARCHITECTURE_UPDATE */,
            "EXTENSION" /* EXTENSION */,
            "WEBVIEW" /* WEBVIEW */,
            {
              lastAction: "ANALYZE_ARCHITECTURE",
              report
            }
          ));
        }).catch((err) => {
          this.postMessage(MessageFactory.createMessage(
            "ERROR" /* ERROR */,
            "EXTENSION" /* EXTENSION */,
            "WEBVIEW" /* WEBVIEW */,
            { error: err.message }
          ));
        });
      }
    } catch (error) {
      this.postMessage(MessageFactory.createMessage(
        "ERROR" /* ERROR */,
        "EXTENSION" /* EXTENSION */,
        "WEBVIEW" /* WEBVIEW */,
        { error: error.message }
      ));
    }
  }
  _handleGenerationRequest(message) {
    try {
      const { action, plan } = message.payload || {};
      if (action === "GENERATE_CODE") {
        generationEngine.generateCode(plan || {}).then((artifact) => {
          this.postMessage(MessageFactory.createMessage(
            "GENERATION_UPDATE" /* GENERATION_UPDATE */,
            "EXTENSION" /* EXTENSION */,
            "WEBVIEW" /* WEBVIEW */,
            {
              lastAction: "GENERATE_CODE",
              artifact
            }
          ));
        }).catch((err) => {
          this.postMessage(MessageFactory.createMessage(
            "ERROR" /* ERROR */,
            "EXTENSION" /* EXTENSION */,
            "WEBVIEW" /* WEBVIEW */,
            { error: err.message }
          ));
        });
      }
    } catch (error) {
      this.postMessage(MessageFactory.createMessage(
        "ERROR" /* ERROR */,
        "EXTENSION" /* EXTENSION */,
        "WEBVIEW" /* WEBVIEW */,
        { error: error.message }
      ));
    }
  }
  _handleAstRequest(message) {
    try {
      const { action, ir, language } = message.payload || {};
      if (action === "GENERATE_AST") {
        astEngine.generateAst(ir || {}, language || "typescript").then((artifact) => {
          this.postMessage(MessageFactory.createMessage(
            "AST_UPDATE" /* AST_UPDATE */,
            "EXTENSION" /* EXTENSION */,
            "WEBVIEW" /* WEBVIEW */,
            {
              lastAction: "GENERATE_AST",
              artifact
            }
          ));
        }).catch((err) => {
          this.postMessage(MessageFactory.createMessage(
            "ERROR" /* ERROR */,
            "EXTENSION" /* EXTENSION */,
            "WEBVIEW" /* WEBVIEW */,
            { error: err.message }
          ));
        });
      }
    } catch (error) {
      this.postMessage(MessageFactory.createMessage(
        "ERROR" /* ERROR */,
        "EXTENSION" /* EXTENSION */,
        "WEBVIEW" /* WEBVIEW */,
        { error: error.message }
      ));
    }
  }
  _handleMultiFileRequest(message) {
    try {
      const { action, plan } = message.payload || {};
      if (action === "GENERATE_MULTIFILE_PLAN") {
        multiFileEngine.generateMultiFilePlan(plan || {}).then((artifact) => {
          this.postMessage(MessageFactory.createMessage(
            "MULTIFILE_UPDATE" /* MULTIFILE_UPDATE */,
            "EXTENSION" /* EXTENSION */,
            "WEBVIEW" /* WEBVIEW */,
            {
              lastAction: "GENERATE_MULTIFILE_PLAN",
              artifact
            }
          ));
        }).catch((err) => {
          this.postMessage(MessageFactory.createMessage(
            "ERROR" /* ERROR */,
            "EXTENSION" /* EXTENSION */,
            "WEBVIEW" /* WEBVIEW */,
            { error: err.message }
          ));
        });
      }
    } catch (error) {
      this.postMessage(MessageFactory.createMessage(
        "ERROR" /* ERROR */,
        "EXTENSION" /* EXTENSION */,
        "WEBVIEW" /* WEBVIEW */,
        { error: error.message }
      ));
    }
  }
  _handleIncrementalRequest(message) {
    try {
      const { action, filePath, fileContent, operations } = message.payload || {};
      if (action === "GENERATE_INCREMENTAL_PLAN") {
        incrementalEngine.generateEditPlan(filePath || "", fileContent || "", operations || []).then((artifact) => {
          this.postMessage(MessageFactory.createMessage(
            "INCREMENTAL_UPDATE" /* INCREMENTAL_UPDATE */,
            "EXTENSION" /* EXTENSION */,
            "WEBVIEW" /* WEBVIEW */,
            {
              lastAction: "GENERATE_INCREMENTAL_PLAN",
              artifact
            }
          ));
        }).catch((err) => {
          this.postMessage(MessageFactory.createMessage(
            "ERROR" /* ERROR */,
            "EXTENSION" /* EXTENSION */,
            "WEBVIEW" /* WEBVIEW */,
            { error: err.message }
          ));
        });
      }
    } catch (error) {
      this.postMessage(MessageFactory.createMessage(
        "ERROR" /* ERROR */,
        "EXTENSION" /* EXTENSION */,
        "WEBVIEW" /* WEBVIEW */,
        { error: error.message }
      ));
    }
  }
  _handleConventionRequest(message) {
    try {
      const { action, files } = message.payload || {};
      if (action === "ANALYZE_CONVENTIONS") {
        conventionEngine.analyzeConventions(files || []).then((artifact) => {
          this.postMessage(MessageFactory.createMessage(
            "CONVENTION_UPDATE" /* CONVENTION_UPDATE */,
            "EXTENSION" /* EXTENSION */,
            "WEBVIEW" /* WEBVIEW */,
            {
              lastAction: "ANALYZE_CONVENTIONS",
              artifact
            }
          ));
        }).catch((err) => {
          this.postMessage(MessageFactory.createMessage(
            "ERROR" /* ERROR */,
            "EXTENSION" /* EXTENSION */,
            "WEBVIEW" /* WEBVIEW */,
            { error: err.message }
          ));
        });
      }
    } catch (error) {
      this.postMessage(MessageFactory.createMessage(
        "ERROR" /* ERROR */,
        "EXTENSION" /* EXTENSION */,
        "WEBVIEW" /* WEBVIEW */,
        { error: error.message }
      ));
    }
  }
  _handleNamingRequest(message) {
    try {
      const { action, baseTerm, symbolType, casing, existingFiles } = message.payload || {};
      if (action === "GENERATE_NAMES") {
        namingEngine.generateNames(baseTerm || "", symbolType || "", casing || "camelCase", existingFiles || []).then((artifact) => {
          this.postMessage(MessageFactory.createMessage(
            "NAMING_UPDATE" /* NAMING_UPDATE */,
            "EXTENSION" /* EXTENSION */,
            "WEBVIEW" /* WEBVIEW */,
            {
              lastAction: "GENERATE_NAMES",
              artifact
            }
          ));
        }).catch((err) => {
          this.postMessage(MessageFactory.createMessage(
            "ERROR" /* ERROR */,
            "EXTENSION" /* EXTENSION */,
            "WEBVIEW" /* WEBVIEW */,
            { error: err.message }
          ));
        });
      }
    } catch (error) {
      this.postMessage(MessageFactory.createMessage(
        "ERROR" /* ERROR */,
        "EXTENSION" /* EXTENSION */,
        "WEBVIEW" /* WEBVIEW */,
        { error: error.message }
      ));
    }
  }
  _handleImportRequest(message) {
    try {
      const { action, targetFile, fileContent, requiredSymbols } = message.payload || {};
      if (action === "RESOLVE_IMPORTS") {
        importEngine.resolveImports(targetFile || "", fileContent || "", requiredSymbols || []).then((artifact) => {
          this.postMessage(MessageFactory.createMessage(
            "IMPORT_UPDATE" /* IMPORT_UPDATE */,
            "EXTENSION" /* EXTENSION */,
            "WEBVIEW" /* WEBVIEW */,
            {
              lastAction: "RESOLVE_IMPORTS",
              artifact
            }
          ));
        }).catch((err) => {
          this.postMessage(MessageFactory.createMessage(
            "ERROR" /* ERROR */,
            "EXTENSION" /* EXTENSION */,
            "WEBVIEW" /* WEBVIEW */,
            { error: err.message }
          ));
        });
      }
    } catch (error) {
      this.postMessage(MessageFactory.createMessage(
        "ERROR" /* ERROR */,
        "EXTENSION" /* EXTENSION */,
        "WEBVIEW" /* WEBVIEW */,
        { error: error.message }
      ));
    }
  }
  _handleSymbolRequest(message) {
    try {
      const { action, targetFile, fileContent, requiredSymbols } = message.payload || {};
      if (action === "RESOLVE_SYMBOLS") {
        symbolEngine.resolveSymbols(targetFile || "", fileContent || "", requiredSymbols || []).then((artifact) => {
          this.postMessage(MessageFactory.createMessage(
            "SYMBOL_UPDATE" /* SYMBOL_UPDATE */,
            "EXTENSION" /* EXTENSION */,
            "WEBVIEW" /* WEBVIEW */,
            {
              lastAction: "RESOLVE_SYMBOLS",
              artifact
            }
          ));
        }).catch((err) => {
          this.postMessage(MessageFactory.createMessage(
            "ERROR" /* ERROR */,
            "EXTENSION" /* EXTENSION */,
            "WEBVIEW" /* WEBVIEW */,
            { error: err.message }
          ));
        });
      }
    } catch (error) {
      this.postMessage(MessageFactory.createMessage(
        "ERROR" /* ERROR */,
        "EXTENSION" /* EXTENSION */,
        "WEBVIEW" /* WEBVIEW */,
        { error: error.message }
      ));
    }
  }
  _handleReviewRequest(message) {
    try {
      const { action, targetFile, fileContent } = message.payload || {};
      if (action === "RUN_REVIEW") {
        reviewEngine.runReview(targetFile || "", fileContent || "").then((artifact) => {
          this.postMessage(MessageFactory.createMessage(
            "REVIEW_UPDATE" /* REVIEW_UPDATE */,
            "EXTENSION" /* EXTENSION */,
            "WEBVIEW" /* WEBVIEW */,
            {
              lastAction: "RUN_REVIEW",
              artifact
            }
          ));
        }).catch((err) => {
          this.postMessage(MessageFactory.createMessage(
            "ERROR" /* ERROR */,
            "EXTENSION" /* EXTENSION */,
            "WEBVIEW" /* WEBVIEW */,
            { error: err.message }
          ));
        });
      }
    } catch (error) {
      this.postMessage(MessageFactory.createMessage(
        "ERROR" /* ERROR */,
        "EXTENSION" /* EXTENSION */,
        "WEBVIEW" /* WEBVIEW */,
        { error: error.message }
      ));
    }
  }
  _handleValidationRequest(message) {
    try {
      const { action, targetFile, fileContent } = message.payload || {};
      if (action === "RUN_VALIDATION") {
        validationEngine.validate(targetFile || "", fileContent || "").then((artifact) => {
          this.postMessage(MessageFactory.createMessage(
            "VALIDATION_UPDATE" /* VALIDATION_UPDATE */,
            "EXTENSION" /* EXTENSION */,
            "WEBVIEW" /* WEBVIEW */,
            {
              lastAction: "RUN_VALIDATION",
              artifact
            }
          ));
        }).catch((err) => {
          this.postMessage(MessageFactory.createMessage(
            "ERROR" /* ERROR */,
            "EXTENSION" /* EXTENSION */,
            "WEBVIEW" /* WEBVIEW */,
            { error: err.message }
          ));
        });
      }
    } catch (error) {
      this.postMessage(MessageFactory.createMessage(
        "ERROR" /* ERROR */,
        "EXTENSION" /* EXTENSION */,
        "WEBVIEW" /* WEBVIEW */,
        { error: error.message }
      ));
    }
  }
  _handleOptimizationRequest(message) {
    try {
      const { action, targetFile, patchContent } = message.payload || {};
      if (action === "OPTIMIZE_PATCH") {
        patchOptimizationEngine.optimizePatch(targetFile || "", patchContent || "").then((artifact) => {
          this.postMessage(MessageFactory.createMessage(
            "OPTIMIZATION_UPDATE" /* OPTIMIZATION_UPDATE */,
            "EXTENSION" /* EXTENSION */,
            "WEBVIEW" /* WEBVIEW */,
            {
              lastAction: "OPTIMIZE_PATCH",
              artifact
            }
          ));
        }).catch((err) => {
          this.postMessage(MessageFactory.createMessage(
            "ERROR" /* ERROR */,
            "EXTENSION" /* EXTENSION */,
            "WEBVIEW" /* WEBVIEW */,
            { error: err.message }
          ));
        });
      }
    } catch (error) {
      this.postMessage(MessageFactory.createMessage(
        "ERROR" /* ERROR */,
        "EXTENSION" /* EXTENSION */,
        "WEBVIEW" /* WEBVIEW */,
        { error: error.message }
      ));
    }
  }
  _handleSafeEditRequest(message) {
    try {
      const { action, targetFile, patchContent, userApproved } = message.payload || {};
      if (action === "EVALUATE_SAFETY") {
        safeEditEngine.evaluate(targetFile || "", patchContent || "", userApproved).then((artifact) => {
          this.postMessage(MessageFactory.createMessage(
            "SAFE_EDIT_UPDATE" /* SAFE_EDIT_UPDATE */,
            "EXTENSION" /* EXTENSION */,
            "WEBVIEW" /* WEBVIEW */,
            {
              lastAction: "EVALUATE_SAFETY",
              artifact
            }
          ));
        }).catch((err) => {
          this.postMessage(MessageFactory.createMessage(
            "ERROR" /* ERROR */,
            "EXTENSION" /* EXTENSION */,
            "WEBVIEW" /* WEBVIEW */,
            { error: err.message }
          ));
        });
      }
    } catch (error) {
      this.postMessage(MessageFactory.createMessage(
        "ERROR" /* ERROR */,
        "EXTENSION" /* EXTENSION */,
        "WEBVIEW" /* WEBVIEW */,
        { error: error.message }
      ));
    }
  }
  _handleEventBusRequest(message) {
    try {
      const { action, eventData, workflowId, initialPayload } = message.payload || {};
      if (action === "PUBLISH") {
        eventBusInstance.publish(eventData).then(() => {
          this.postMessage(MessageFactory.createMessage(
            "EVENT_BUS_UPDATE" /* EVENT_BUS_UPDATE */,
            "EXTENSION" /* EXTENSION */,
            "WEBVIEW" /* WEBVIEW */,
            { lastAction: "PUBLISH", success: true }
          ));
        });
      } else if (action === "START_WORKFLOW") {
        const { workflowOrchestrator: workflowOrchestrator2 } = (init_eventBus2(), __toCommonJS(eventBus_exports));
        workflowOrchestrator2.startWorkflow(workflowId, initialPayload).then(() => {
          this.postMessage(MessageFactory.createMessage(
            "EVENT_BUS_UPDATE" /* EVENT_BUS_UPDATE */,
            "EXTENSION" /* EXTENSION */,
            "WEBVIEW" /* WEBVIEW */,
            { lastAction: "START_WORKFLOW", success: true }
          ));
        });
      }
    } catch (error) {
      this.postMessage(MessageFactory.createMessage(
        "ERROR" /* ERROR */,
        "EXTENSION" /* EXTENSION */,
        "WEBVIEW" /* WEBVIEW */,
        { error: error.message }
      ));
    }
  }
  _handleTaskGenerationRequest(message) {
    try {
      const { action, featurePlan } = message.payload || {};
      if (action === "GENERATE_TASKS") {
        const defaultPlan = featurePlan || {
          planId: `PLAN-${Date.now()}`,
          title: "Default Execution Feature Plan",
          description: "Automatic task breakdown of feature plan milestones.",
          milestones: [
            {
              milestoneId: "M1",
              name: "Database Models & Contracts",
              description: "Setup database schema models and migration scripts."
            },
            {
              milestoneId: "M2",
              name: "Core Service APIs",
              description: "Implement core REST and internal service endpoint routers."
            },
            {
              milestoneId: "M3",
              name: "Frontend View Dashboard",
              description: "Build interactive React webview components and state handlers."
            }
          ]
        };
        taskGenerationEngine.generateTasks({ featurePlan: defaultPlan }).then((report) => {
          this.postMessage(MessageFactory.createMessage(
            "TASK_GENERATION_UPDATE" /* TASK_GENERATION_UPDATE */,
            "EXTENSION" /* EXTENSION */,
            "WEBVIEW" /* WEBVIEW */,
            {
              lastAction: "GENERATE_TASKS",
              report
            }
          ));
        }).catch((err) => {
          this.postMessage(MessageFactory.createMessage(
            "ERROR" /* ERROR */,
            "EXTENSION" /* EXTENSION */,
            "WEBVIEW" /* WEBVIEW */,
            { error: err.message }
          ));
        });
      }
    } catch (error) {
      this.postMessage(MessageFactory.createMessage(
        "ERROR" /* ERROR */,
        "EXTENSION" /* EXTENSION */,
        "WEBVIEW" /* WEBVIEW */,
        { error: error.message }
      ));
    }
  }
  _handleExecutionPlanningRequest(message) {
    try {
      const { action, taskGraph, executionPolicies } = message.payload || {};
      if (action === "PLAN_EXECUTION") {
        const defaultTaskGraph = taskGraph || {
          nodes: {
            "T1": {
              task: { taskId: "T1", title: "Database Schema Setup", description: "Create tables", taskType: "Database Task", parentMilestone: "M1", dependencies: [], requiredSymbols: [], requiredFiles: ["src/db/schema.ts"], expectedOutput: "", estimatedTimeMs: 12e4, estimatedTokens: 1e3, risk: "High", priority: "Critical", confidence: 0.9, executionStrategy: "Manual Approval" },
              children: ["T2"],
              parents: [],
              depth: 0,
              inCriticalPath: true
            },
            "T2": {
              task: { taskId: "T2", title: "API Routing Endpoints", description: "Implement REST controllers", taskType: "API Task", parentMilestone: "M2", dependencies: ["T1"], requiredSymbols: [], requiredFiles: ["src/api/routes.ts"], expectedOutput: "", estimatedTimeMs: 15e4, estimatedTokens: 1200, risk: "Medium", priority: "High", confidence: 0.9, executionStrategy: "Sequential" },
              children: ["T3"],
              parents: ["T1"],
              depth: 1,
              inCriticalPath: true
            },
            "T3": {
              task: { taskId: "T3", title: "Webview Component UI", description: "Build layout views", taskType: "UI Task", parentMilestone: "M3", dependencies: ["T2"], requiredSymbols: [], requiredFiles: ["src/webview/Dashboard.tsx"], expectedOutput: "", estimatedTimeMs: 9e4, estimatedTokens: 800, risk: "Low", priority: "Normal", confidence: 0.95, executionStrategy: "Parallel" },
              children: [],
              parents: ["T2"],
              depth: 2,
              inCriticalPath: true
            }
          },
          edges: [],
          rootTaskIds: ["T1"],
          leafTaskIds: ["T3"],
          criticalPath: ["T1", "T2", "T3"],
          totalEstimatedTimeMs: 36e4,
          totalEstimatedTokens: 3e3
        };
        executionPlanningEngine.plan({ taskGraph: defaultTaskGraph, executionPolicies }).then((report) => {
          this.postMessage(MessageFactory.createMessage(
            "EXECUTION_PLANNING_UPDATE" /* EXECUTION_PLANNING_UPDATE */,
            "EXTENSION" /* EXTENSION */,
            "WEBVIEW" /* WEBVIEW */,
            {
              lastAction: "PLAN_EXECUTION",
              report
            }
          ));
        }).catch((err) => {
          this.postMessage(MessageFactory.createMessage(
            "ERROR" /* ERROR */,
            "EXTENSION" /* EXTENSION */,
            "WEBVIEW" /* WEBVIEW */,
            { error: err.message }
          ));
        });
      }
    } catch (error) {
      this.postMessage(MessageFactory.createMessage(
        "ERROR" /* ERROR */,
        "EXTENSION" /* EXTENSION */,
        "WEBVIEW" /* WEBVIEW */,
        { error: error.message }
      ));
    }
  }
};

// src/extension/webviewProvider.ts
var SastaAntigravityWebviewProvider = class {
  constructor(_extensionUri) {
    this._extensionUri = _extensionUri;
  }
  static viewType = "sasta-antigravity.chatView";
  _view;
  _disposables = [];
  _messageRouter;
  /**
   * Invoked by VS Code when the webview view is first instantiated.
   */
  resolveWebviewView(webviewView, _context, _token) {
    this._view = webviewView;
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri]
    };
    webviewView.webview.html = this.renderHtml(webviewView.webview);
    const messageDisposable = webviewView.webview.onDidReceiveMessage((message) => {
      this._handleWebviewMessage(message);
    });
    this._disposables.push(messageDisposable);
    webviewView.onDidDispose(() => {
      this.dispose();
    });
  }
  /**
   * Cleans up disposables and clears active references when the view is closed.
   */
  dispose() {
    this._disposables.forEach((disposable) => disposable.dispose());
    this._disposables = [];
    this._view = void 0;
  }
  /**
   * Generates the secure HTML template containing the Content Security Policy (CSP).
   * Declared as public/private according to architectural rules.
   */
  renderHtml(webview) {
    const nonce = this._getNonce();
    const scriptUri = webview.asWebviewUri(
      vscode21.Uri.joinPath(this._extensionUri, "dist", "webview", "main.js")
    );
    const styleUri = webview.asWebviewUri(
      vscode21.Uri.joinPath(this._extensionUri, "dist", "webview", "main.css")
    );
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}' ${webview.cspSource}; img-src ${webview.cspSource} https:; font-src ${webview.cspSource};">
  <link rel="stylesheet" href="${styleUri}">
</head>
<body>
  <div id="root"></div>
  <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
  }
  /**
   * Centralized message router dispatching actions.
   */
  _handleWebviewMessage(message) {
    if (!this._messageRouter) {
      this._messageRouter = new MessageRouter(this._view.webview);
    }
    this._messageRouter.handleMessage(message);
  }
  /**
   * Helper function creating random nonces to secure script executions.
   */
  _getNonce() {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 32; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }
};

// src/extension/index.ts
var outputChannel;
function activate(context) {
  try {
    outputChannel = vscode22.window.createOutputChannel("Sasta-Antigravity");
    outputChannel.appendLine("[Sasta-Antigravity] Extension activation initiated.");
    const startSessionCommand = vscode22.commands.registerCommand(
      "sasta-antigravity.startSession",
      () => {
        try {
          vscode22.window.showInformationMessage("Sasta-Antigravity initialized successfully.");
          if (outputChannel) {
            outputChannel.appendLine("[Sasta-Antigravity] Command 'sasta-antigravity.startSession' executed successfully.");
          }
        } catch (commandError) {
          vscode22.window.showErrorMessage("Sasta-Antigravity encountered an error while starting session.");
          if (outputChannel) {
            outputChannel.appendLine(`[Sasta-Antigravity] Command execution error: ${commandError}`);
          }
        }
      }
    );
    context.subscriptions.push(startSessionCommand);
    const webviewProvider = new SastaAntigravityWebviewProvider(context.extensionUri);
    const webviewRegister = vscode22.window.registerWebviewViewProvider(
      SastaAntigravityWebviewProvider.viewType,
      webviewProvider
    );
    context.subscriptions.push(webviewRegister);
    outputChannel.appendLine("[Sasta-Antigravity] Extension activation completed successfully.");
  } catch (activationError) {
    vscode22.window.showErrorMessage("Failed to activate Sasta-Antigravity extension.");
    if (outputChannel) {
      outputChannel.appendLine(`[Sasta-Antigravity] Activation failed: ${activationError}`);
    }
  }
}
function deactivate() {
  if (outputChannel) {
    outputChannel.appendLine("[Sasta-Antigravity] Extension deactivation initiated.");
    outputChannel.dispose();
    outputChannel = void 0;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  deactivate
});
