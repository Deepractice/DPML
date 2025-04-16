/**
 * 测试夹具管理机制
 *
 * 提供测试数据夹具创建、访问和生命周期管理
 */

/**
 * 夹具生命周期回调接口
 */
export interface FixtureLifecycle<T> {
  /**
   * 初始化夹具
   */
  setup?: () => Promise<void> | void;

  /**
   * 清理夹具
   */
  teardown?: () => Promise<void> | void;

  /**
   * 重置夹具状态
   */
  reset?: () => Promise<void> | void;
}

/**
 * 测试夹具接口
 */
export interface Fixture<T> extends FixtureLifecycle<T> {
  /**
   * 夹具数据
   */
  data: T;

  /**
   * 夹具名称
   */
  name: string;

  /**
   * 更新夹具数据
   */
  update: (newData: Partial<T>) => void;
}

/**
 * 夹具创建选项
 */
export interface FixtureOptions<T> extends FixtureLifecycle<T> {
  /**
   * 夹具名称
   */
  name: string;

  /**
   * 初始夹具数据
   */
  data: T;
}

/**
 * 夹具集合接口
 */
export interface FixtureCollection {
  /**
   * 获取夹具
   *
   * @param name 夹具名称
   * @returns 夹具实例
   */
  get<T>(name: string): Fixture<T>;

  /**
   * 添加夹具
   *
   * @param options 夹具选项
   * @returns 夹具实例
   */
  add<T>(options: FixtureOptions<T>): Fixture<T>;

  /**
   * 初始化所有夹具
   */
  setupAll(): Promise<void>;

  /**
   * 清理所有夹具
   */
  teardownAll(): Promise<void>;

  /**
   * 重置所有夹具
   */
  resetAll(): Promise<void>;

  /**
   * 获取所有夹具名称
   */
  names(): string[];

  /**
   * 检查夹具是否存在
   *
   * @param name 夹具名称
   */
  has(name: string): boolean;

  /**
   * 移除夹具
   *
   * @param name 夹具名称
   */
  remove(name: string): void;
}

/**
 * 基础夹具实现
 */
class BaseFixture<T> implements Fixture<T> {
  public name: string;
  public data: T;
  public setup?: () => Promise<void> | void;
  public teardown?: () => Promise<void> | void;
  public reset?: () => Promise<void> | void;

  constructor(options: FixtureOptions<T>) {
    this.name = options.name;
    this.data = { ...options.data } as T;
    this.setup = options.setup;
    this.teardown = options.teardown;
    this.reset = options.reset;
  }

  public update(newData: Partial<T>): void {
    this.data = { ...this.data, ...newData };
  }
}

/**
 * 夹具集合实现
 */
class FixtureCollectionImpl implements FixtureCollection {
  private fixtures: Map<string, Fixture<any>> = new Map();

  /**
   * 获取夹具
   */
  public get<T>(name: string): Fixture<T> {
    const fixture = this.fixtures.get(name);

    if (!fixture) {
      throw new Error(`夹具 "${name}" 不存在`);
    }

    return fixture as Fixture<T>;
  }

  /**
   * 添加夹具
   */
  public add<T>(options: FixtureOptions<T>): Fixture<T> {
    if (this.fixtures.has(options.name)) {
      throw new Error(`夹具 "${options.name}" 已存在`);
    }

    const fixture = new BaseFixture<T>(options);

    this.fixtures.set(options.name, fixture);

    return fixture;
  }

  /**
   * 初始化所有夹具
   */
  public async setupAll(): Promise<void> {
    for (const fixture of this.fixtures.values()) {
      if (fixture.setup) {
        await fixture.setup();
      }
    }
  }

  /**
   * 清理所有夹具
   */
  public async teardownAll(): Promise<void> {
    for (const fixture of this.fixtures.values()) {
      if (fixture.teardown) {
        await fixture.teardown();
      }
    }
  }

  /**
   * 重置所有夹具
   */
  public async resetAll(): Promise<void> {
    for (const fixture of this.fixtures.values()) {
      if (fixture.reset) {
        await fixture.reset();
      }
    }
  }

  /**
   * 获取所有夹具名称
   */
  public names(): string[] {
    return Array.from(this.fixtures.keys());
  }

  /**
   * 检查夹具是否存在
   */
  public has(name: string): boolean {
    return this.fixtures.has(name);
  }

  /**
   * 移除夹具
   */
  public remove(name: string): void {
    this.fixtures.delete(name);
  }
}

/**
 * 创建夹具集合
 *
 * @returns 夹具集合实例
 */
export function createFixtureCollection(): FixtureCollection {
  return new FixtureCollectionImpl();
}

/**
 * 使用夹具运行测试函数
 *
 * @param fixtureOptions 夹具选项
 * @param fn 测试函数
 * @returns 函数返回值的Promise
 */
export async function withFixture<T, R>(
  fixtureOptions: FixtureOptions<T>,
  fn: (fixture: Fixture<T>) => Promise<R>
): Promise<R> {
  const fixture = new BaseFixture<T>(fixtureOptions);

  try {
    if (fixture.setup) {
      await fixture.setup();
    }

    return await fn(fixture);
  } finally {
    if (fixture.teardown) {
      await fixture.teardown();
    }
  }
}

/**
 * 使用多个夹具运行测试函数
 *
 * @param fixtures 夹具集合
 * @param fn 测试函数
 * @returns 函数返回值的Promise
 */
export async function withFixtures<R>(
  fixtures: FixtureCollection,
  fn: (fixtures: FixtureCollection) => Promise<R>
): Promise<R> {
  try {
    await fixtures.setupAll();

    return await fn(fixtures);
  } finally {
    await fixtures.teardownAll();
  }
}
