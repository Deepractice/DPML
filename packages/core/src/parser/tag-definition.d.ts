/**
 * 标签定义接口
 * 定义标签的属性规范、嵌套规则和验证规则
 */
export interface TagDefinition {
    /**
     * 允许的属性列表
     * 如果未定义或为空数组，则标签不允许有属性
     */
    attributes?: string[];
    /**
     * 必需的属性列表
     * 如果未定义或为空数组，则标签没有必需属性
     */
    requiredAttributes?: string[];
    /**
     * 允许的子标签列表
     * 如果未定义或为空数组，则标签不允许有子标签
     */
    allowedChildren?: string[];
    /**
     * 是否是自闭合标签（如<hr/>）
     * 默认为false
     */
    selfClosing?: boolean;
    /**
     * 标签验证器函数
     * 可用于实现更复杂的验证逻辑
     */
    validate?: (element: any, context: any) => ValidationResult;
}
/**
 * 验证结果接口
 */
export interface ValidationResult {
    /**
     * 验证是否通过
     */
    valid: boolean;
    /**
     * 验证错误信息
     */
    errors?: ValidationError[];
    /**
     * 验证警告信息
     */
    warnings?: ValidationWarning[];
}
/**
 * 验证错误接口
 */
export interface ValidationError {
    /**
     * 错误码
     */
    code: string;
    /**
     * 错误消息
     */
    message: string;
    /**
     * 出错位置
     */
    position?: any;
}
/**
 * 验证警告接口
 */
export interface ValidationWarning {
    /**
     * 警告码
     */
    code: string;
    /**
     * 警告消息
     */
    message: string;
    /**
     * 警告位置
     */
    position?: any;
}
//# sourceMappingURL=tag-definition.d.ts.map