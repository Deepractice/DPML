import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import {
  createFixtureCollection,
  withFixture,
  withFixtures,
} from '../../../testing/fixtures';

describe('夹具管理模块', () => {
  describe('createFixtureCollection', () => {
    it('应该创建一个空的夹具集合', () => {
      const fixtures = createFixtureCollection();

      expect(fixtures.names()).toEqual([]);
    });

    it('应该能添加和获取夹具', () => {
      const fixtures = createFixtureCollection();
      const fixture = fixtures.add({
        name: 'testFixture',
        data: { value: 42 },
      });

      expect(fixture.name).toBe('testFixture');
      expect(fixture.data).toEqual({ value: 42 });

      const retrieved = fixtures.get('testFixture');

      expect(retrieved).toBe(fixture);
    });

    it('添加重复名称的夹具应该抛出错误', () => {
      const fixtures = createFixtureCollection();

      fixtures.add({
        name: 'testFixture',
        data: { value: 42 },
      });

      expect(() =>
        fixtures.add({
          name: 'testFixture',
          data: { value: 100 },
        })
      ).toThrow('夹具 "testFixture" 已存在');
    });

    it('获取不存在的夹具应该抛出错误', () => {
      const fixtures = createFixtureCollection();

      expect(() => fixtures.get('nonExistent')).toThrow(
        '夹具 "nonExistent" 不存在'
      );
    });

    it('has方法应该正确检测夹具是否存在', () => {
      const fixtures = createFixtureCollection();

      fixtures.add({
        name: 'testFixture',
        data: { value: 42 },
      });

      expect(fixtures.has('testFixture')).toBe(true);
      expect(fixtures.has('nonExistent')).toBe(false);
    });

    it('names方法应该返回所有夹具名称', () => {
      const fixtures = createFixtureCollection();

      fixtures.add({ name: 'fixture1', data: { id: 1 } });
      fixtures.add({ name: 'fixture2', data: { id: 2 } });

      expect(fixtures.names()).toEqual(['fixture1', 'fixture2']);
    });

    it('remove方法应该移除夹具', () => {
      const fixtures = createFixtureCollection();

      fixtures.add({ name: 'fixture1', data: { id: 1 } });

      fixtures.remove('fixture1');
      expect(fixtures.has('fixture1')).toBe(false);
      expect(fixtures.names()).toEqual([]);
    });
  });

  describe('夹具生命周期管理', () => {
    it('应该调用夹具的setup和teardown方法', async () => {
      const setupMock = vi.fn();
      const teardownMock = vi.fn();

      const fixtures = createFixtureCollection();

      fixtures.add({
        name: 'lifecycle',
        data: { value: 1 },
        setup: setupMock,
        teardown: teardownMock,
      });

      await fixtures.setupAll();
      expect(setupMock).toHaveBeenCalledTimes(1);

      await fixtures.teardownAll();
      expect(teardownMock).toHaveBeenCalledTimes(1);
    });

    it('应该调用夹具的reset方法', async () => {
      const resetMock = vi.fn();

      const fixtures = createFixtureCollection();

      fixtures.add({
        name: 'resettable',
        data: { counter: 0 },
        reset: resetMock,
      });

      await fixtures.resetAll();
      expect(resetMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('withFixture', () => {
    it('应该在函数执行前后设置和清理夹具', async () => {
      const setupMock = vi.fn();
      const teardownMock = vi.fn();
      const handlerMock = vi.fn();

      await withFixture(
        {
          name: 'test',
          data: { value: 'test' },
          setup: setupMock,
          teardown: teardownMock,
        },
        async fixture => {
          handlerMock(fixture.data);

          return fixture.data.value;
        }
      );

      expect(setupMock).toHaveBeenCalledTimes(1);
      expect(handlerMock).toHaveBeenCalledWith({ value: 'test' });
      expect(teardownMock).toHaveBeenCalledTimes(1);
    });

    it('即使函数抛出错误也应该清理夹具', async () => {
      const teardownMock = vi.fn();

      await expect(
        withFixture(
          {
            name: 'error',
            data: {},
            teardown: teardownMock,
          },
          async () => {
            throw new Error('测试错误');
          }
        )
      ).rejects.toThrow('测试错误');

      expect(teardownMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('withFixtures', () => {
    it('应该在函数执行前后设置和清理所有夹具', async () => {
      const fixtures = createFixtureCollection();

      const setup1 = vi.fn();
      const setup2 = vi.fn();
      const teardown1 = vi.fn();
      const teardown2 = vi.fn();

      fixtures.add({
        name: 'fixture1',
        data: { id: 1 },
        setup: setup1,
        teardown: teardown1,
      });

      fixtures.add({
        name: 'fixture2',
        data: { id: 2 },
        setup: setup2,
        teardown: teardown2,
      });

      await withFixtures(fixtures, async fixtureCollection => {
        const f1 = fixtureCollection.get('fixture1');
        const f2 = fixtureCollection.get('fixture2');

        expect(f1.data).toEqual({ id: 1 });
        expect(f2.data).toEqual({ id: 2 });
      });

      expect(setup1).toHaveBeenCalledTimes(1);
      expect(setup2).toHaveBeenCalledTimes(1);
      expect(teardown1).toHaveBeenCalledTimes(1);
      expect(teardown2).toHaveBeenCalledTimes(1);
    });
  });

  describe('夹具数据管理', () => {
    it('update方法应该更新夹具数据', () => {
      const fixture = createFixtureCollection().add({
        name: 'updatable',
        data: { count: 0, name: 'initial' },
      });

      fixture.update({ count: 42 });
      expect(fixture.data).toEqual({ count: 42, name: 'initial' });

      fixture.update({ name: 'updated' });
      expect(fixture.data).toEqual({ count: 42, name: 'updated' });
    });
  });
});
