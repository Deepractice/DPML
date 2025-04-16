import { faker } from '@faker-js/faker';

/**
 * 用户角色
 */
export type UserRole = 'admin' | 'user' | 'guest';

/**
 * 用户状态
 */
export type UserStatus = 'active' | 'inactive' | 'pending' | 'blocked';

/**
 * 用户详情
 */
export interface UserProfile {
  /**
   * 用户名
   */
  username: string;
  
  /**
   * 电子邮件
   */
  email: string;
  
  /**
   * 名字
   */
  firstName?: string;
  
  /**
   * 姓氏
   */
  lastName?: string;
  
  /**
   * 头像URL
   */
  avatarUrl?: string;
  
  /**
   * 用户角色
   */
  role: UserRole;
  
  /**
   * 用户状态
   */
  status: UserStatus;
  
  /**
   * 创建时间
   */
  createdAt: Date;
  
  /**
   * 上次登录时间
   */
  lastLoginAt?: Date;
  
  /**
   * 是否已验证邮箱
   */
  isVerified: boolean;
  
  /**
   * 用户首选项
   */
  preferences?: Record<string, any>;
  
  /**
   * 用户元数据
   */
  metadata?: Record<string, any>;
}

/**
 * 用户工厂函数参数
 */
export interface UserFactoryOptions {
  /**
   * 用户角色
   */
  role?: UserRole;
  
  /**
   * 用户状态
   */
  status?: UserStatus;
  
  /**
   * 是否已验证邮箱
   */
  isVerified?: boolean;
  
  /**
   * 创建时间
   */
  createdAt?: Date;
  
  /**
   * 上次登录时间
   */
  lastLoginAt?: Date;
  
  /**
   * 用户首选项
   */
  preferences?: Record<string, any>;
  
  /**
   * 用户元数据
   */
  metadata?: Record<string, any>;
}

/**
 * 创建模拟用户
 * 
 * @param options 用户选项
 * @returns 用户详情
 */
export function createUser(options: UserFactoryOptions = {}): UserProfile {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const username = faker.internet.userName({ firstName, lastName }).toLowerCase();
  
  return {
    username,
    email: faker.internet.email({ firstName, lastName }),
    firstName,
    lastName,
    avatarUrl: faker.image.avatar(),
    role: options.role || 'user',
    status: options.status || 'active',
    createdAt: options.createdAt || faker.date.past(),
    lastLoginAt: options.lastLoginAt,
    isVerified: options.isVerified !== undefined ? options.isVerified : true,
    preferences: options.preferences || {},
    metadata: options.metadata || {}
  };
}

/**
 * 创建管理员用户
 * 
 * @param options 用户选项
 * @returns 管理员用户详情
 */
export function createAdminUser(options: Omit<UserFactoryOptions, 'role'> = {}): UserProfile {
  return createUser({
    ...options,
    role: 'admin'
  });
}

/**
 * 创建访客用户
 * 
 * @param options 用户选项
 * @returns 访客用户详情
 */
export function createGuestUser(options: Omit<UserFactoryOptions, 'role'> = {}): UserProfile {
  return createUser({
    ...options,
    role: 'guest',
    isVerified: options.isVerified !== undefined ? options.isVerified : false
  });
}

/**
 * 创建多个用户
 * 
 * @param count 用户数量
 * @param options 用户选项
 * @returns 用户详情数组
 */
export function createUsers(count: number, options: UserFactoryOptions = {}): UserProfile[] {
  return Array.from({ length: count }, () => createUser(options));
}

/**
 * 创建用户集合
 * 
 * 返回包含不同角色用户的集合，方便测试需要多种角色的场景
 * 
 * @param options 用户选项
 * @returns 用户集合对象
 */
export function createUserSet(options: UserFactoryOptions = {}): {
  admin: UserProfile;
  user: UserProfile;
  guest: UserProfile;
} {
  return {
    admin: createAdminUser(options),
    user: createUser(options),
    guest: createGuestUser(options)
  };
} 