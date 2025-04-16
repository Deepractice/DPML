/**
 * 核心标签定义
 */
import type { TagDefinition } from '@dpml/core';

/**
 * 提示根标签定义
 */
export const promptTagDefinition: TagDefinition = {
  name: 'prompt',
  attributes: {
    id: {
      type: 'string',
      required: false,
    },
    version: {
      type: 'string',
      required: false,
    },
    lang: {
      type: 'string',
      required: false,
    },
    extends: {
      type: 'string',
      required: false,
    },
  },
  allowedChildren: [
    'role',
    'context',
    'thinking',
    'executing',
    'testing',
    'protocol',
    'custom',
  ],
  contentFormat: 'markdown',
};

/**
 * 角色标签定义
 */
export const roleTagDefinition: TagDefinition = {
  name: 'role',
  attributes: {
    id: {
      type: 'string',
      required: false,
    },
    extends: {
      type: 'string',
      required: false,
    },
  },
  allowedChildren: [],
  contentFormat: 'markdown',
};

/**
 * 上下文标签定义
 */
export const contextTagDefinition: TagDefinition = {
  name: 'context',
  attributes: {
    id: {
      type: 'string',
      required: false,
    },
    extends: {
      type: 'string',
      required: false,
    },
  },
  allowedChildren: [],
  contentFormat: 'markdown',
};

/**
 * 思维框架标签定义
 */
export const thinkingTagDefinition: TagDefinition = {
  name: 'thinking',
  attributes: {
    id: {
      type: 'string',
      required: false,
    },
    extends: {
      type: 'string',
      required: false,
    },
  },
  allowedChildren: [],
  contentFormat: 'markdown',
};

/**
 * 执行步骤标签定义
 */
export const executingTagDefinition: TagDefinition = {
  name: 'executing',
  attributes: {
    id: {
      type: 'string',
      required: false,
    },
    extends: {
      type: 'string',
      required: false,
    },
  },
  allowedChildren: [],
  contentFormat: 'markdown',
};

/**
 * 质量检查标签定义
 */
export const testingTagDefinition: TagDefinition = {
  name: 'testing',
  attributes: {
    id: {
      type: 'string',
      required: false,
    },
    extends: {
      type: 'string',
      required: false,
    },
  },
  allowedChildren: [],
  contentFormat: 'markdown',
};

/**
 * 交互协议标签定义
 */
export const protocolTagDefinition: TagDefinition = {
  name: 'protocol',
  attributes: {
    id: {
      type: 'string',
      required: false,
    },
    extends: {
      type: 'string',
      required: false,
    },
  },
  allowedChildren: [],
  contentFormat: 'markdown',
};

/**
 * 自定义内容标签定义
 */
export const customTagDefinition: TagDefinition = {
  name: 'custom',
  attributes: {
    id: {
      type: 'string',
      required: false,
    },
    extends: {
      type: 'string',
      required: false,
    },
  },
  allowedChildren: [],
  contentFormat: 'markdown',
};
