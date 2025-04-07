/**
 * 平台类型
 */
export declare enum PlatformType {
    WINDOWS = "windows",
    UNIX = "unix"
}
/**
 * 获取当前平台类型
 * @returns 平台类型
 */
export declare function getCurrentPlatform(): PlatformType;
/**
 * 将路径标准化为当前平台格式
 * @param filePath 文件路径
 * @returns 标准化的路径
 */
export declare function normalizePath(filePath: string): string;
/**
 * 将路径转换为特定平台格式
 * @param filePath 文件路径
 * @param platform 目标平台类型
 * @returns 转换后的路径
 */
export declare function convertPathForPlatform(filePath: string, platform: PlatformType): string;
/**
 * 检查路径是否为绝对路径
 * @param filePath 文件路径
 * @returns 是否为绝对路径
 */
export declare function isAbsolutePath(filePath: string): boolean;
/**
 * 解析相对路径
 * @param basePath 基准路径
 * @param relativePath 相对路径
 * @returns 解析后的绝对路径
 */
export declare function resolveRelativePath(basePath: string, relativePath: string): string;
/**
 * 获取路径的文件名部分
 * @param filePath 文件路径
 * @returns 文件名
 */
export declare function getFileName(filePath: string): string;
/**
 * 获取路径的目录部分
 * @param filePath 文件路径
 * @returns 目录路径
 */
export declare function getDirName(filePath: string): string;
/**
 * 获取路径的扩展名
 * @param filePath 文件路径
 * @returns 扩展名（包含.）
 */
export declare function getExtension(filePath: string): string;
/**
 * 将路径转换为文件URL格式
 * @param filePath 文件路径
 * @returns 文件URL
 */
export declare function pathToFileUrl(filePath: string): string;
//# sourceMappingURL=pathUtils.d.ts.map