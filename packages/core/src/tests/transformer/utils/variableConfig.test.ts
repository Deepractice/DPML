import { describe, it, expect } from 'vitest';

import {
  DefaultVariableResolver,
  resolveVariables,
  getVariables,
  mergeVariables,
  applyVariablesToContext,
} from '../../../transformer/utils/variableConfig';

import type { TransformContext } from '../../../transformer/interfaces/transformContext';
import type { TransformOptions } from '../../../transformer/interfaces/transformOptions';

describe('VariableConfig', () => {
  // 创建一个基础上下文用于测试
  const createBaseContext = (): TransformContext => ({
    document: {} as any,
    options: {} as TransformOptions,
    output: {},
    variables: {},
    path: [],
    parentResults: [],
  });

  describe('DefaultVariableResolver', () => {
    it('应该能解析基本变量引用', () => {
      const resolver = new DefaultVariableResolver();
      const variables = {
        name: 'John',
        age: 30,
        isActive: true,
      };

      expect(resolver.resolve('Hello, ${name}!', variables)).toBe(
        'Hello, John!'
      );
      expect(resolver.resolve('Age: ${age}', variables)).toBe('Age: 30');
      expect(resolver.resolve('Active: ${isActive}', variables)).toBe(
        'Active: true'
      );
    });

    it('应该能解析嵌套变量引用', () => {
      const resolver = new DefaultVariableResolver();
      const variables = {
        user: {
          name: 'John',
          profile: {
            avatar: 'john.jpg',
            settings: {
              theme: 'dark',
            },
          },
        },
      };

      expect(resolver.resolve('User: ${user.name}', variables)).toBe(
        'User: John'
      );
      expect(
        resolver.resolve('Avatar: ${user.profile.avatar}', variables)
      ).toBe('Avatar: john.jpg');
      expect(
        resolver.resolve('Theme: ${user.profile.settings.theme}', variables)
      ).toBe('Theme: dark');
    });

    it('应该保留未定义变量的原始引用', () => {
      const resolver = new DefaultVariableResolver();
      const variables = {
        name: 'John',
      };

      expect(resolver.resolve('Hello, ${unknown}!', variables)).toBe(
        'Hello, ${unknown}!'
      );
      expect(resolver.resolve('Theme: ${user.settings.theme}', variables)).toBe(
        'Theme: ${user.settings.theme}'
      );
    });

    it('应该处理非字符串值', () => {
      const resolver = new DefaultVariableResolver();
      const variables = {};

      // 非字符串值应原样返回
      expect(resolver.resolve(123 as any, variables)).toBe(123 as any);
      expect(resolver.resolve(true as any, variables)).toBe(true as any);
      expect(resolver.resolve(null as any, variables)).toBe(null as any);
    });
  });

  describe('resolveVariables', () => {
    it('应该递归解析对象中的变量引用', () => {
      const variables = {
        name: 'John',
        domain: 'example.com',
        year: 2023,
      };

      const obj = {
        title: 'Welcome ${name}',
        url: 'https://${domain}/profile',
        footer: `Copyright ${variables.year}`,
        settings: {
          email: '${name}@${domain}',
          greeting: 'Hello, ${name}!',
        },
        tags: ['user-${name}', 'year-${year}'],
      };

      const result = resolveVariables(obj, variables);

      expect(result.title).toBe('Welcome John');
      expect(result.url).toBe('https://example.com/profile');
      expect(result.footer).toBe('Copyright 2023');
      expect(result.settings.email).toBe('John@example.com');
      expect(result.settings.greeting).toBe('Hello, John!');
      expect(result.tags[0]).toBe('user-John');
      expect(result.tags[1]).toBe('year-2023');
    });

    it('应该处理空值和基本类型', () => {
      const variables = { name: 'John' };

      expect(resolveVariables(null, variables)).toBe(null);
      expect(resolveVariables(undefined, variables)).toBe(undefined);
      expect(resolveVariables(123, variables)).toBe(123);
      expect(resolveVariables(true, variables)).toBe(true);
    });
  });

  describe('getVariables', () => {
    it('应该从选项中提取变量', () => {
      const options: TransformOptions = {
        variables: {
          name: 'John',
          age: 30,
        },
      };

      const variables = getVariables(options);

      expect(variables).toEqual({
        name: 'John',
        age: 30,
      });
    });

    it('应该在无变量时返回空对象', () => {
      const options: TransformOptions = {};

      expect(getVariables(options)).toEqual({});

      // 未提供选项
      expect(getVariables()).toEqual({});
    });
  });

  describe('mergeVariables', () => {
    it('应该合并两个变量集合', () => {
      const target = {
        name: 'John',
        age: 30,
      };

      const source = {
        age: 31,
        role: 'admin',
      };

      const result = mergeVariables(target, source);

      expect(result).toEqual({
        name: 'John',
        age: 31,
        role: 'admin',
      });
    });

    it('应该支持深度合并', () => {
      const target = {
        user: {
          name: 'John',
          settings: {
            theme: 'light',
            notifications: true,
          },
        },
      };

      const source = {
        user: {
          settings: {
            theme: 'dark',
            language: 'en',
          },
        },
      };

      // 深度合并
      const deepResult = mergeVariables(target, source, true);

      expect(deepResult.user.name).toBe('John');
      expect(deepResult.user.settings.theme).toBe('dark');
      expect(deepResult.user.settings.notifications).toBe(true);
      expect(deepResult.user.settings.language).toBe('en');

      // 浅合并
      const shallowResult = mergeVariables(target, source, false);

      expect(shallowResult.user.name).toBeUndefined();
      expect(shallowResult.user.settings.theme).toBe('dark');
      expect(shallowResult.user.settings.language).toBe('en');
      expect(shallowResult.user.settings.notifications).toBeUndefined();
    });

    it('应该正确处理数组', () => {
      const target = {
        tags: ['tag1', 'tag2'],
        user: {
          roles: ['user'],
        },
      };

      const source = {
        tags: ['tag3'],
        user: {
          roles: ['admin'],
        },
      };

      // 数组应该被替换，而不是合并
      const result = mergeVariables(target, source, true);

      expect(result.tags).toEqual(['tag3']);
      expect(result.user.roles).toEqual(['admin']);
    });
  });

  describe('applyVariablesToContext', () => {
    it('应该将变量应用到上下文', () => {
      const context = createBaseContext();

      context.variables = {
        name: 'John',
        settings: {
          theme: 'light',
        },
      };

      const newVariables = {
        age: 30,
        settings: {
          language: 'en',
        },
      };

      const newContext = applyVariablesToContext(context, newVariables);

      // 原始上下文不应该被修改
      expect(context.variables.age).toBeUndefined();
      expect(context.variables.settings.language).toBeUndefined();

      // 新上下文应该包含合并的变量
      expect(newContext.variables.name).toBe('John');
      expect(newContext.variables.age).toBe(30);
      expect(newContext.variables.settings.theme).toBe('light');
      expect(newContext.variables.settings.language).toBe('en');
    });

    it('应该支持控制深度合并行为', () => {
      const context = createBaseContext();

      context.variables = {
        user: {
          name: 'John',
          settings: {
            theme: 'light',
          },
        },
      };

      const newVariables = {
        user: {
          role: 'admin',
          settings: {
            language: 'en',
          },
        },
      };

      // 深度合并
      const deepContext = applyVariablesToContext(context, newVariables, true);

      expect(deepContext.variables.user.name).toBe('John');
      expect(deepContext.variables.user.role).toBe('admin');
      expect(deepContext.variables.user.settings.theme).toBe('light');
      expect(deepContext.variables.user.settings.language).toBe('en');

      // 浅合并
      const shallowContext = applyVariablesToContext(
        context,
        newVariables,
        false
      );

      expect(shallowContext.variables.user.name).toBeUndefined();
      expect(shallowContext.variables.user.role).toBe('admin');
      expect(shallowContext.variables.user.settings.language).toBe('en');
      expect(shallowContext.variables.user.settings.theme).toBeUndefined();
    });
  });
});
