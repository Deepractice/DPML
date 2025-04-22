/**
 * 定义用户友好的Schema接口，不包含内部实现细节。
 * 应用开发者使用这些接口定义DPML文档的结构。
 */

/**
 * 表示元素的属性定义。
 */
export interface AttributeSchema {
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
  /**
   * 属性值应匹配的正则表达式模式。
   */
  pattern?: string;
  /**
   * 属性的默认值。
   */
  default?: string;
}

/**
 * 表示元素内容的定义。
 */
export interface ContentSchema {
  /**
   * 内容的类型，可以是'text'（纯文本）或'mixed'（混合内容）。
   */
  type: 'text' | 'mixed';
  /**
   * 指示内容是否为必需。
   * @default false
   */
  required?: boolean;
  /**
   * 内容应匹配的正则表达式模式。
   */
  pattern?: string;
}

/**
 * 表示对另一个已定义类型的引用。
 */
export interface TypeReference {
  /**
   * 引用的类型名称。
   * 这通常对应于DocumentSchema的types数组中定义的ElementSchema的element属性。
   */
  $ref: string;
}

/**
 * 表示元素可能包含的子元素集合。
 */
export interface ChildrenSchema {
  /**
   * 允许作为子元素的元素列表。
   * 每个元素可以是直接的ElementSchema定义，也可以是对其他类型的引用。
   */
  elements: (ElementSchema | TypeReference)[];
  /**
   * 指示子元素的顺序是否重要。
   * @default false
   */
  orderImportant?: boolean;
  /**
   * 子元素的最小数量。
   */
  min?: number;
  /**
   * 子元素的最大数量。
   */
  max?: number;
}

/**
 * 表示元素（Element）的结构定义。
 */
export interface ElementSchema {
  /**
   * 元素的名称（标签名）。
   */
  element: string;
  /**
   * 定义此元素允许或要求的属性。
   */
  attributes?: AttributeSchema[];
  /**
   * 定义此元素允许的内容模型。
   */
  content?: ContentSchema;
  /**
   * 定义此元素允许的子元素。
   */
  children?: ChildrenSchema;
}

/**
 * 表示文档（Document）级别的结构定义。
 */
export interface DocumentSchema {
  /**
   * 定义文档的根元素。
   * 可以是直接的元素定义、类型引用或表示纯文本根的字符串。
   */
  root: ElementSchema | TypeReference | string;
  /**
   * 定义可在本文档内部复用的类型（通常是ElementSchema）。
   * 这些类型可以通过TypeReference($ref)在root或其他ElementSchema的children中引用。
   */
  types?: ElementSchema[];
  /**
   * 定义适用于文档内所有元素的全局属性。
   */
  globalAttributes?: AttributeSchema[];
  /**
   * 定义文档可能使用的命名空间。
   */
  namespaces?: string[];
}

/**
 * Schema类型的联合类型，用于简化API参数类型定义。
 */
export type Schema = DocumentSchema | ElementSchema;
