interface JSONSchemaObject {
  type?: string;
  properties?: Record<string, unknown>;
  required?: string[];
  additionalProperties?: boolean;
  enum?: string[];
  minimum?: number;
  maximum?: number;
  description?: string;
  items?: JSONSchemaObject;
}

interface ModelContextTool {
  name: string;
  description: string;
  inputSchema: JSONSchemaObject;
  execute: (input: Record<string, unknown>) => unknown | Promise<unknown>;
  annotations?: {
    readOnlyHint?: boolean;
  };
}

interface ModelContextRegisterToolOptions {
  signal?: AbortSignal;
}

interface RegisteredTool {
  name: string;
}

interface ModelContext extends EventTarget {
  registerTool(
    tool: ModelContextTool,
    options?: ModelContextRegisterToolOptions,
  ): Promise<undefined>;
  getTools(): Promise<RegisteredTool[]>;
  executeTool(
    tool: RegisteredTool,
    inputObject?: object | string,
  ): Promise<string>;
}

interface Document {
  modelContext?: ModelContext;
}
