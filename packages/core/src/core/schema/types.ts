/**
 * 定义 Schema Meta 模型的基础接口。
 * 所有具体的 Meta 类型都应扩展此接口。
 */
export interface Meta {
  /**
   * Meta 类型的唯一标识符。
   */
  metaType: string;

  /**
   * 可选的自定义验证器函数。
   * @param this 指向当前的 Meta 对象实例。
   * @returns 如果验证通过则返回 true，否则返回 false。
   */
  validator?: <T extends Meta>(this: T) => boolean;
}

/**
 * 表示对另一个已定义类型的引用。
 * 通常用于在 Schema 中复用类型定义。
 */
export interface TypeReference {
  /**
   * 引用的类型名称。
   * 这通常对应于 `DocumentMeta` 的 `types` 数组中定义的 `ElementMeta` 的 `element` 属性，
   * 或者是全局注册的类型名称。
   */
  $ref: string;
}

/**
 * 定义元素的属性（Attribute）的 Meta 规则。
 */
export interface AttributeMeta {
  /**
   * 属性的名称。
   */
  name: string;
  /**
   * 属性值的预期类型 (例如：'string', 'number', 'boolean')。
   * 如果未指定，可能表示任何类型或需要根据上下文推断。
   */
  type?: string;
  /**
   * 指示此属性是否为必需。
   * @default false
   */
  required?: boolean;
  /**
   * 如果属性值是枚举类型，则定义允许的值列表。
   */
  enum?: string[];
  // 可以根据需要添加其他验证规则，如 pattern, minLength, maxLength 等
}

/**
 * 定义元素内容（Content）的 Meta 规则。
 */
export interface ContentMeta {
  /**
   * 内容的预期类型 (例如：'text', 'html', 'markdown', 或特定元素的混合模型)。
   */
  type: string;
  /**
   * 指示内容是否为必需。
   * @default false
   */
  required?: boolean;
  // 可以根据需要添加其他约束，如允许的 HTML 标签等
}

/**
 * 定义元素的子元素（Children）的 Meta 规则。
 */
export interface ChildrenMeta {
  /**
   * 允许作为子元素的元素列表。
   * 每个元素可以是直接的 `ElementMeta` 定义，也可以是对其他类型的 `TypeReference`。
   */
  elements: (ElementMeta | TypeReference)[];
  /**
   * 指示子元素的顺序是否重要。
   * @default false
   */
  orderImportant?: boolean;
  // 可以根据需要添加其他约束，如数量限制（min/max）等
}

/**
 * 定义元素（Element）的 Meta 结构。
 * 描述 DPML 元素的结构规则。
 */
export interface ElementMeta extends Meta {
  /**
   * 标识此 Meta 类型为 'element'。
   */
  metaType: 'element';
  /**
   * 元素的名称（标签名）。
   */
  element: string;
  /**
   * 定义此元素允许或要求的属性。
   */
  attributes?: AttributeMeta[];
  /**
   * 定义此元素允许的子元素。
   */
  children?: ChildrenMeta;
  /**
   * 定义此元素允许的内容模型。
   */
  content?: ContentMeta;
}

/**
 * 定义文档（Document）级别的 Meta 结构。
 * 描述 DPML 文档的整体结构规则。
 */
export interface DocumentMeta extends Meta {
  /**
   * 标识此 Meta 类型为 'document'。
   */
  metaType: 'document';
  /**
   * 定义文档的根元素。
   * 可以是直接的元素定义、类型引用或表示纯文本根的字符串。
   */
  root: ElementMeta | TypeReference | string;
  /**
   * 定义可在本文档内部复用的类型（通常是 ElementMeta）。
   * 这些类型可以通过 `TypeReference` (`$ref`) 在 `root` 或其他 `ElementMeta` 的 `children` 中引用。
   */
  types?: ElementMeta[];
  /**
   * 定义适用于文档内所有元素的全局属性。
   */
  globalAttributes?: AttributeMeta[];
  /**
   * 定义文档可能使用的命名空间。
   */
  namespaces?: string[];
}
