import { faker } from '@faker-js/faker';

import { createUser } from './user-factory';

import type { UserProfile } from './user-factory';

/**
 * 项目状态
 */
export type ProjectStatus = 'active' | 'archived' | 'draft' | 'deleted';

/**
 * 项目可见性
 */
export type ProjectVisibility = 'public' | 'private' | 'team';

/**
 * 项目类型
 */
export type ProjectType = 'research' | 'production' | 'development' | 'poc';

/**
 * 项目详情
 */
export interface Project {
  /**
   * 项目ID
   */
  id: string;

  /**
   * 项目名称
   */
  name: string;

  /**
   * 项目描述
   */
  description: string;

  /**
   * 项目状态
   */
  status: ProjectStatus;

  /**
   * 项目可见性
   */
  visibility: ProjectVisibility;

  /**
   * 项目类型
   */
  type: ProjectType;

  /**
   * 创建者
   */
  creator: UserProfile;

  /**
   * 项目成员
   */
  members: UserProfile[];

  /**
   * 创建时间
   */
  createdAt: Date;

  /**
   * 更新时间
   */
  updatedAt: Date;

  /**
   * 标签
   */
  tags: string[];

  /**
   * 元数据
   */
  metadata?: Record<string, any>;
}

/**
 * 项目工厂函数参数
 */
export interface ProjectFactoryOptions {
  /**
   * 项目名称
   */
  name?: string;

  /**
   * 项目描述
   */
  description?: string;

  /**
   * 项目状态
   */
  status?: ProjectStatus;

  /**
   * 项目可见性
   */
  visibility?: ProjectVisibility;

  /**
   * 项目类型
   */
  type?: ProjectType;

  /**
   * 创建者
   */
  creator?: UserProfile;

  /**
   * 项目成员
   */
  members?: UserProfile[];

  /**
   * 创建时间
   */
  createdAt?: Date;

  /**
   * 更新时间
   */
  updatedAt?: Date;

  /**
   * 标签
   */
  tags?: string[];

  /**
   * 元数据
   */
  metadata?: Record<string, any>;
}

/**
 * 创建模拟项目
 *
 * @param options 项目选项
 * @returns 项目详情
 */
export function createProject(options: ProjectFactoryOptions = {}): Project {
  const creator = options.creator || createUser();
  const createdAt = options.createdAt || faker.date.past();
  const updatedAt =
    options.updatedAt ||
    faker.date.between({ from: createdAt, to: new Date() });

  return {
    id: faker.string.uuid(),
    name:
      options.name ||
      `${faker.company.name()} ${faker.word.adjective()} Project`,
    description: options.description || faker.lorem.paragraph(),
    status: options.status || 'active',
    visibility: options.visibility || 'private',
    type: options.type || 'development',
    creator,
    members: options.members || [
      creator,
      ...Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, () =>
        createUser()
      ),
    ],
    createdAt,
    updatedAt,
    tags:
      options.tags ||
      Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, () =>
        faker.word.sample()
      ),
    metadata: options.metadata || {},
  };
}

/**
 * 创建公开项目
 *
 * @param options 项目选项
 * @returns 公开项目详情
 */
export function createPublicProject(
  options: Omit<ProjectFactoryOptions, 'visibility'> = {}
): Project {
  return createProject({
    ...options,
    visibility: 'public',
  });
}

/**
 * 创建研究项目
 *
 * @param options 项目选项
 * @returns 研究项目详情
 */
export function createResearchProject(
  options: Omit<ProjectFactoryOptions, 'type'> = {}
): Project {
  return createProject({
    ...options,
    type: 'research',
  });
}

/**
 * 创建多个项目
 *
 * @param count 项目数量
 * @param options 项目选项
 * @returns 项目详情数组
 */
export function createProjects(
  count: number,
  options: ProjectFactoryOptions = {}
): Project[] {
  return Array.from({ length: count }, () => createProject(options));
}

/**
 * 创建归档项目
 *
 * @param options 项目选项
 * @returns 归档项目详情
 */
export function createArchivedProject(
  options: Omit<ProjectFactoryOptions, 'status'> = {}
): Project {
  return createProject({
    ...options,
    status: 'archived',
  });
}
