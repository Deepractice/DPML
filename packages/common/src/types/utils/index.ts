/**
 * 工具类型定义
 * 
 * 提供通用的TypeScript工具类型，用于类型转换和处理。
 */

/**
 * 将对象所有属性设为可选
 */
export type Partial<T> = {
  [P in keyof T]?: T[P];
};

/**
 * 将对象所有属性设为必选
 */
export type Required<T> = {
  [P in keyof T]-?: T[P];
};

/**
 * 将对象所有属性设为只读
 */
export type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

/**
 * 深度部分类型（递归将所有属性和子属性设为可选）
 */
export type DeepPartial<T> = T extends object ? { 
  [P in keyof T]?: DeepPartial<T[P]> 
} : T;

/**
 * 深度必选类型（递归将所有属性和子属性设为必选）
 */
export type DeepRequired<T> = T extends object ? {
  [P in keyof T]-?: DeepRequired<T[P]>
} : T;

/**
 * 深度只读类型（递归将所有属性和子属性设为只读）
 */
export type DeepReadonly<T> = T extends object ? {
  readonly [P in keyof T]: DeepReadonly<T[P]>
} : T;

/**
 * 可空类型（T或null）
 */
export type Nullable<T> = T | null;

/**
 * 可选类型（T或undefined）
 */
export type Optional<T> = T | undefined;

/**
 * 排除类型（从T中排除可分配给U的类型）
 */
export type Exclude<T, U> = T extends U ? never : T;

/**
 * 提取类型（从T中提取可分配给U的类型）
 */
export type Extract<T, U> = T extends U ? T : never;

/**
 * 非空类型（排除null和undefined）
 */
export type NonNullable<T> = T extends null | undefined ? never : T;

/**
 * 函数参数类型
 */
export type Parameters<T extends (...args: any) => any> = 
  T extends (...args: infer P) => any ? P : never;

/**
 * 函数返回类型
 */
export type ReturnType<T extends (...args: any) => any> = 
  T extends (...args: any) => infer R ? R : any;

/**
 * 实例类型
 */
export type InstanceType<T extends new (...args: any) => any> = 
  T extends new (...args: any) => infer R ? R : any;

/**
 * 提取对象类型的键
 */
export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never
}[keyof T];

/**
 * 提取对象类型的值
 */
export type ValuesOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? T[K] : never
}[keyof T];

/**
 * 提取对象中键的联合类型
 */
export type ValueOf<T> = T[keyof T];

/**
 * 字符串字面量联合类型
 */
export type StringLiteralUnion<T extends string> = T | string;

/**
 * 确保对象至少包含特定键
 */
export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> =
  Pick<T, Exclude<keyof T, Keys>> & {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>
  }[Keys];

/**
 * 确保对象最多包含一个特定键
 */
export type RequireOnlyOne<T, Keys extends keyof T = keyof T> =
  Pick<T, Exclude<keyof T, Keys>> & {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Record<Exclude<Keys, K>, undefined>>
  }[Keys];

/**
 * 可记录类型，允许索引
 */
export type Recordable<T = any> = Record<string, T>;

/**
 * 函数类型
 */
export type Fn<T = any, R = any> = (...args: T[]) => R;

/**
 * 可等待类型（Promise或原始类型）
 */
export type Awaitable<T> = T | PromiseLike<T>;

/**
 * 将对象键转为指定的联合类型
 */
export type MapToUnion<T, K extends keyof T, U> = {
  [P in K]: U;
} & Omit<T, K>;

/**
 * Promise 或原始类型
 */
export type PromiseOrValue<T> = T | Promise<T>;

/**
 * 异步函数返回类型
 */
export type AsyncReturnType<T extends (...args: any) => Promise<any>> = 
  T extends (...args: any) => Promise<infer R> ? R : any;

/**
 * 合并对象类型
 */
export type Merge<T, U> = Omit<T, keyof U> & U;

/**
 * 递归合并对象类型
 */
export type DeepMerge<T, U> = {
  [K in keyof (T & U)]: K extends keyof T
    ? K extends keyof U
      ? T[K] extends object
        ? U[K] extends object
          ? DeepMerge<T[K], U[K]>
          : U[K]
        : U[K]
      : T[K]
    : K extends keyof U
      ? U[K]
      : never;
};

/**
 * 过滤对象类型中的属性
 */
export type FilterProps<T, U> = {
  [K in keyof T as T[K] extends U ? K : never]: T[K]
};

/**
 * 结果类型（成功或失败）
 */
export type Result<T, E = Error> = Success<T> | Failure<E>;

/**
 * 成功结果类型
 */
export interface Success<T> {
  success: true;
  value: T;
}

/**
 * 失败结果类型
 */
export interface Failure<E> {
  success: false;
  error: E;
}

/**
 * 异步结果类型
 */
export type AsyncResult<T, E = Error> = Promise<Result<T, E>>;

/**
 * 可迭代类型
 */
export interface Iterable<T> {
  [Symbol.iterator](): Iterator<T>;
}

/**
 * 可变类型（移除只读属性）
 */
export type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

/**
 * 转换为联合类型
 */
export type UnionToIntersection<U> = 
  (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;

/**
 * 构造函数类型
 */
export type Constructor<T = any> = new (...args: any[]) => T;

/**
 * 类类型（包含实例和静态部分）
 */
export type Class<T = any> = {
  new(...args: any[]): T;
  prototype: T;
} & Record<string, any>;

/**
 * 移除索引签名
 */
export type RemoveIndexSignature<T> = {
  [K in keyof T as string extends K ? never : number extends K ? never : K]: T[K]
};

/**
 * 结构相容类型（匹配结构而忽略额外属性）
 */
export type Exact<T, U extends T> = U;

/**
 * JSON值类型
 */
export type JsonValue = 
  | string
  | number
  | boolean
  | null
  | JsonObject
  | JsonArray;

/**
 * JSON对象类型
 */
export interface JsonObject {
  [key: string]: JsonValue;
}

/**
 * JSON数组类型
 */
export interface JsonArray extends Array<JsonValue> {}

/**
 * 通用ID类型
 */
export type ID = string | number;

/**
 * 分页参数
 */
export interface PaginationParams {
  /** 页码 */
  page: number;
  /** 每页大小 */
  pageSize: number;
  /** 排序字段 */
  sortBy?: string;
  /** 排序方向 */
  sortOrder?: 'asc' | 'desc';
}

/**
 * 分页结果
 */
export interface PaginatedResult<T> {
  /** 数据列表 */
  items: T[];
  /** 总数 */
  total: number;
  /** 当前页 */
  page: number;
  /** 每页大小 */
  pageSize: number;
  /** 总页数 */
  totalPages: number;
  /** 是否有下一页 */
  hasNext: boolean;
  /** 是否有上一页 */
  hasPrev: boolean;
} 