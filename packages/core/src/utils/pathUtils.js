/**
 * 路径处理工具类
 *
 * 提供跨平台路径处理的工具函数
 */
import * as path from 'path';
import * as url from 'url';
import * as os from 'os';
/**
 * 平台类型
 */
export var PlatformType;
(function (PlatformType) {
    PlatformType["WINDOWS"] = "windows";
    PlatformType["UNIX"] = "unix";
})(PlatformType || (PlatformType = {}));
/**
 * 获取当前平台类型
 * @returns 平台类型
 */
export function getCurrentPlatform() {
    return os.platform() === 'win32' ? PlatformType.WINDOWS : PlatformType.UNIX;
}
/**
 * 将路径标准化为当前平台格式
 * @param filePath 文件路径
 * @returns 标准化的路径
 */
export function normalizePath(filePath) {
    if (!filePath)
        return filePath;
    // 处理URL格式的路径
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
        return filePath;
    }
    // 处理file:// 协议的URL
    if (filePath.startsWith('file://')) {
        try {
            // 使用URL API解析文件URL
            const fileUrl = new URL(filePath);
            return url.fileURLToPath(fileUrl);
        }
        catch (error) {
            // 如果解析失败，尝试直接移除协议部分
            filePath = filePath.substring(7);
        }
    }
    // 替换反斜杠为正斜杠 (统一为UNIX格式，再让path.normalize根据平台转换)
    filePath = filePath.replace(/\\/g, '/');
    // 使用path.normalize根据当前平台转换路径分隔符
    return path.normalize(filePath);
}
/**
 * 将路径转换为特定平台格式
 * @param filePath 文件路径
 * @param platform 目标平台类型
 * @returns 转换后的路径
 */
export function convertPathForPlatform(filePath, platform) {
    if (!filePath)
        return filePath;
    // 处理URL格式的路径
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
        return filePath;
    }
    // 处理file:// 协议的URL
    if (filePath.startsWith('file://')) {
        try {
            const fileUrl = new URL(filePath);
            filePath = url.fileURLToPath(fileUrl);
        }
        catch (error) {
            filePath = filePath.substring(7);
        }
    }
    // 先统一为UNIX格式
    filePath = filePath.replace(/\\/g, '/');
    // 根据指定平台进行转换
    if (platform === PlatformType.WINDOWS) {
        // 将正斜杠转换为反斜杠
        return filePath.replace(/\//g, '\\');
    }
    else {
        // 保持UNIX格式
        return filePath;
    }
}
/**
 * 检查路径是否为绝对路径
 * @param filePath 文件路径
 * @returns 是否为绝对路径
 */
export function isAbsolutePath(filePath) {
    return path.isAbsolute(filePath) ||
        /^[a-zA-Z]:[\\\/]/i.test(filePath) || // Windows盘符路径
        filePath.startsWith('/') || // Unix绝对路径
        /^([a-zA-Z]+):\/\//.test(filePath); // URL格式路径
}
/**
 * 解析相对路径
 * @param basePath 基准路径
 * @param relativePath 相对路径
 * @returns 解析后的绝对路径
 */
export function resolveRelativePath(basePath, relativePath) {
    if (!relativePath)
        return basePath;
    if (isAbsolutePath(relativePath))
        return normalizePath(relativePath);
    // 处理URL路径
    if (basePath.startsWith('http://') || basePath.startsWith('https://')) {
        try {
            const baseUrl = new URL(basePath);
            const resolvedUrl = new URL(relativePath, baseUrl);
            return resolvedUrl.href;
        }
        catch (error) {
            // 如果解析失败，回退到基本的路径拼接
            return normalizePath(`${basePath}/${relativePath}`);
        }
    }
    // 获取basePath的目录部分
    const baseDir = basePath.endsWith('/') || basePath.endsWith('\\')
        ? basePath
        : path.dirname(normalizePath(basePath));
    // 解析路径
    return normalizePath(path.join(baseDir, relativePath));
}
/**
 * 获取路径的文件名部分
 * @param filePath 文件路径
 * @returns 文件名
 */
export function getFileName(filePath) {
    // 处理URL格式的路径
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
        try {
            const url = new URL(filePath);
            const pathName = url.pathname;
            return path.basename(pathName);
        }
        catch (error) {
            // 如果解析失败，尝试基本的路径处理
            const segments = filePath.split('/');
            return segments[segments.length - 1] || '';
        }
    }
    return path.basename(normalizePath(filePath));
}
/**
 * 获取路径的目录部分
 * @param filePath 文件路径
 * @returns 目录路径
 */
export function getDirName(filePath) {
    // 处理URL格式的路径
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
        try {
            const urlObj = new URL(filePath);
            const pathName = urlObj.pathname;
            const dirPath = path.dirname(pathName);
            return `${urlObj.protocol}//${urlObj.host}${dirPath}`;
        }
        catch (error) {
            // 如果解析失败，尝试基本的路径处理
            const lastSlashIndex = filePath.lastIndexOf('/');
            return lastSlashIndex >= 0 ? filePath.substring(0, lastSlashIndex) : filePath;
        }
    }
    return path.dirname(normalizePath(filePath));
}
/**
 * 获取路径的扩展名
 * @param filePath 文件路径
 * @returns 扩展名（包含.）
 */
export function getExtension(filePath) {
    // 处理URL格式的路径
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
        try {
            const url = new URL(filePath);
            const pathName = url.pathname;
            return path.extname(pathName);
        }
        catch (error) {
            // 如果解析失败，尝试基本的路径处理
            const lastDotIndex = filePath.lastIndexOf('.');
            const lastSlashIndex = filePath.lastIndexOf('/');
            if (lastDotIndex > lastSlashIndex && lastDotIndex >= 0) {
                return filePath.substring(lastDotIndex);
            }
            return '';
        }
    }
    return path.extname(normalizePath(filePath));
}
/**
 * 将路径转换为文件URL格式
 * @param filePath 文件路径
 * @returns 文件URL
 */
export function pathToFileUrl(filePath) {
    // 如果已经是URL格式，直接返回
    if (filePath.startsWith('http://') || filePath.startsWith('https://') || filePath.startsWith('file://')) {
        return filePath;
    }
    // 标准化路径
    const normalizedPath = normalizePath(filePath);
    // 使用URL API转换为file://格式
    try {
        return url.pathToFileURL(normalizedPath).href;
    }
    catch (error) {
        // 手动构建file://URL
        let fileUrl = 'file://';
        // 处理Windows盘符路径
        if (/^[a-zA-Z]:[\\\/]/i.test(normalizedPath)) {
            // 移除盘符中的冒号，确保路径格式正确
            const driveLetter = normalizedPath.charAt(0);
            const restOfPath = normalizedPath.substring(2).replace(/\\/g, '/');
            fileUrl += `/${driveLetter}:${restOfPath}`;
        }
        else {
            // 确保路径以/开头
            fileUrl += normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`;
        }
        return fileUrl;
    }
}
//# sourceMappingURL=pathUtils.js.map