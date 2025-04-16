/**
 * @dpml/prompt 格式配置模块
 *
 * 提供灵活的格式配置机制，支持自定义格式模板和部分格式覆盖
 */

/**
 * 格式模板定义
 */
export interface FormatTemplate {
  /**
   * 标题
   */
  title?: string;

  /**
   * 内容前缀
   */
  prefix?: string;

  /**
   * 内容后缀
   */
  suffix?: string;

  /**
   * 包装器函数
   */
  wrapper?: (content: string) => string;
}

/**
 * 格式模板集合
 */
export interface FormatTemplates {
  [tagName: string]: FormatTemplate;
}

/**
 * 默认格式模板
 */
export const defaultFormatTemplates: FormatTemplates = {
  role: {
    title: '## 角色',
    prefix: '你是',
    suffix: '',
    wrapper: content => content,
  },
  context: {
    title: '## 背景',
    prefix: '',
    suffix: '',
    wrapper: content => content,
  },
  thinking: {
    title: '## 思维框架',
    prefix: '',
    suffix: '',
    wrapper: content => content,
  },
  executing: {
    title: '## 执行步骤',
    prefix: '',
    suffix: '',
    wrapper: content => content,
  },
  testing: {
    title: '## 质量检查',
    prefix: '',
    suffix: '',
    wrapper: content => content,
  },
  protocol: {
    title: '## 交互协议',
    prefix: '',
    suffix: '',
    wrapper: content => content,
  },
  custom: {
    title: '', // 默认无标题
    prefix: '',
    suffix: '',
    wrapper: content => content,
  },
};

/**
 * 中文格式模板
 */
export const zhFormatTemplates: FormatTemplates = {
  role: {
    title: '## 角色',
    prefix: '你是',
    suffix: '',
    wrapper: content => content,
  },
  context: {
    title: '## 背景',
    prefix: '',
    suffix: '',
    wrapper: content => content,
  },
  thinking: {
    title: '## 思维框架',
    prefix: '请使用以下思维框架:\n',
    suffix: '',
    wrapper: content => content,
  },
  executing: {
    title: '## 执行步骤',
    prefix: '',
    suffix: '',
    wrapper: content => content,
  },
  testing: {
    title: '## 质量检查',
    prefix: '',
    suffix: '',
    wrapper: content => content,
  },
  protocol: {
    title: '## 交互协议',
    prefix: '',
    suffix: '',
    wrapper: content => content,
  },
  custom: {
    title: '', // 默认无标题
    prefix: '',
    suffix: '',
    wrapper: content => content,
  },
};

/**
 * 语言特定模板映射
 */
export const langSpecificTemplates: Record<string, FormatTemplates> = {
  'zh-CN': zhFormatTemplates,
  'zh-TW': zhFormatTemplates,
  zh: zhFormatTemplates,
};

/**
 * 语言指令映射
 */
export const langDirectives: Record<string, string> = {
  'zh-CN': '请用中文回复',
  'zh-TW': '請用繁體中文回覆',
  zh: '请用中文回复',
  'ja-JP': '日本語で回答してください',
  'en-US': 'Please respond in English',
  en: 'Please respond in English',
};

/**
 * 默认标签顺序
 */
export const defaultTagOrder: string[] = [
  'role',
  'context',
  'thinking',
  'executing',
  'testing',
  'protocol',
  'custom',
];

/**
 * 应用格式模板
 *
 * @param tagName 标签名
 * @param content 内容
 * @param template 格式模板
 * @returns 格式化后的内容
 */
export function applyFormatTemplate(
  tagName: string,
  content: string,
  template: FormatTemplate
): string {
  if (!template) {
    return content;
  }

  // 构建格式化结果
  let result = '';

  // 添加标题
  if (template.title) {
    result += template.title + '\n';
  }

  // 处理角色标签的特殊前缀
  let processedContent = content;

  if (tagName === 'role' && !content.startsWith('你是')) {
    processedContent = '你是' + processedContent;
  }

  // 应用内容包装器
  let formattedContent = processedContent;

  if (template.wrapper && typeof template.wrapper === 'function') {
    formattedContent = template.wrapper(formattedContent);
  }

  // 添加前缀
  if (template.prefix) {
    formattedContent = template.prefix + formattedContent;
  }

  // 添加后缀
  if (template.suffix) {
    formattedContent += template.suffix;
  }

  result += formattedContent;

  return result;
}

/**
 * 获取标签的格式模板
 *
 * @param tagName 标签名
 * @param userTemplates 用户自定义模板
 * @param lang 语言
 * @returns 合并后的格式模板
 */
export function getTemplateForTag(
  tagName: string,
  userTemplates: FormatTemplates = {},
  lang: string = 'en'
): FormatTemplate {
  // 首先检查用户自定义模板
  if (userTemplates[tagName]) {
    return userTemplates[tagName];
  }

  // 然后检查语言特定模板
  const langTemplates = langSpecificTemplates[lang];

  if (langTemplates && langTemplates[tagName]) {
    return langTemplates[tagName];
  }

  // 最后使用默认模板
  return (
    defaultFormatTemplates[tagName] || {
      title: '',
      prefix: '',
      suffix: '',
      wrapper: content => content,
    }
  );
}

/**
 * 排序标签内容
 *
 * @param tagContents 标签内容映射
 * @param tagOrder 自定义标签顺序
 * @returns 排序后的标签内容数组
 */
export function sortTagContents(
  tagContents: Record<string, string>,
  tagOrder: string[] = defaultTagOrder
): string[] {
  const result: string[] = [];

  // 首先添加按顺序包含的标签
  for (const tag of tagOrder) {
    if (tagContents[tag]) {
      result.push(tagContents[tag]);
    }
  }

  // 然后添加未在顺序中指定的标签
  Object.entries(tagContents).forEach(([tag, content]) => {
    if (!tagOrder.includes(tag)) {
      result.push(content);
    }
  });

  return result;
}
