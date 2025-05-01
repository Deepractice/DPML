# DPML 不可变数据规范

## 1. 不可变性原则

DPML项目采用函数式编程理念，将不可变性作为核心设计原则。不可变数据具有以下优势：

- **可预测性**：数据状态不会意外改变，减少副作用
- **并发安全**：不可变数据天然线程安全，无需担心竞态条件
- **调试简化**：更容易跟踪数据变化，降低调试难度
- **引用透明性**：函数的输出仅依赖于输入，易于测试和理解

## 2. 不可变数据结构

### 2.1 基本类型
- TypeScript/JavaScript的基本类型（string, number, boolean）天然不可变
- 使用`const`声明变量，表明变量引用不变

### 2.2 复杂数据结构
- 使用`readonly`修饰符标记不可变属性
- 使用`ReadonlyArray<T>`代替`Array<T>`
- 使用`Readonly<T>`创建不可变对象类型

```typescript
// 不可变接口定义
interface User {
  readonly id: string;
  readonly name: string;
  readonly preferences: ReadonlyArray<string>;
}

// 不可变类定义
class ImmutableConfiguration {
  readonly host: string;
  readonly port: number;
  readonly options: Readonly<Options>;
  
  constructor(host: string, port: number, options: Options) {
    this.host = host;
    this.port = port;
    this.options = Object.freeze({...options});
  }
}
```

## 3. 数据转换模式

### 3.1 返回新对象
- 操作应返回新的数据副本，而非修改原数据
- 使用展开操作符创建对象副本

```typescript
// ✅ 正确：返回新对象
function updateUserName(user: User, newName: string): User {
  return { ...user, name: newName };
}

// ❌ 错误：修改原对象
function updateUserName(user: User, newName: string): User {
  user.name = newName; // 违反不可变性原则
  return user;
}
```

### 3.2 数组操作
- 使用不可变数组方法：`map`, `filter`, `reduce`, `concat` 等
- 避免使用可变数组方法：`push`, `pop`, `splice`, `sort` 等

```typescript
// ✅ 正确：使用map返回新数组
function doubleValues(numbers: ReadonlyArray<number>): ReadonlyArray<number> {
  return numbers.map(n => n * 2);
}

// ❌ 错误：使用push修改原数组
function addValue(numbers: number[], value: number): number[] {
  numbers.push(value); // 违反不可变性原则
  return numbers;
}
```

## 4. 不可变数据实现技术

### 4.1 浅拷贝
- 使用对象展开操作符 `{...obj}`
- 使用数组展开操作符 `[...array]`
- 使用`Object.assign({}, obj)`

```typescript
const updatedConfig = { ...config, timeout: 5000 };
const extendedList = [...items, newItem];
```

### 4.2 深拷贝
- 使用结构化克隆（如`JSON.parse(JSON.stringify())`)，但注意其限制
- 考虑使用专用库（如lodash的`cloneDeep`）处理复杂嵌套结构

```typescript
// 简单深拷贝（有限制）
const deepCopy = JSON.parse(JSON.stringify(complexObject));

// 使用第三方库（如需引入）
const deepCopy = _.cloneDeep(complexObject);
```

### 4.3 冻结对象
- 使用`Object.freeze()`防止对象被修改
- 注意`Object.freeze()`仅浅层冻结

```typescript
const frozenConfig = Object.freeze({
  host: 'localhost',
  port: 8080,
  options: { timeout: 3000 } // 嵌套对象仍可修改
});

// 深度冻结
function deepFreeze<T>(obj: T): Readonly<T> {
  Object.freeze(obj);
  Object.getOwnPropertyNames(obj).forEach(prop => {
    if (
      obj[prop] !== null &&
      (typeof obj[prop] === 'object' || typeof obj[prop] === 'function') &&
      !Object.isFrozen(obj[prop])
    ) {
      deepFreeze(obj[prop]);
    }
  });
  return obj as Readonly<T>;
}
```

## 5. 状态管理模式

### 5.1 不可变更新模式
- 使用不可变更新模式处理复杂嵌套数据结构
- 创建数据路径上所有对象的副本

```typescript
// 更新嵌套对象属性
function updateNestedProperty(
  state: Readonly<AppState>,
  userId: string,
  newEmail: string
): Readonly<AppState> {
  return {
    ...state,
    users: state.users.map(user => 
      user.id === userId 
        ? { ...user, contact: { ...user.contact, email: newEmail } }
        : user
    )
  };
}
```

### 5.2 Lens模式
- 使用Lens模式简化复杂数据的不可变更新
- Lens封装了"获取"和"设置"操作，保持不可变性

```typescript
interface Lens<S, A> {
  get: (s: S) => A;
  set: (a: A, s: S) => S;
}

// 创建lens
function createLens<S, A>(getter: (s: S) => A, setter: (a: A, s: S) => S): Lens<S, A> {
  return { get: getter, set: setter };
}

// 使用lens更新数据
function updateWithLens<S, A>(lens: Lens<S, A>, f: (a: A) => A, s: S): S {
  return lens.set(f(lens.get(s)), s);
}
```

## 6. 性能考量

### 6.1 结构共享
- 不可变更新应尽可能共享未变更的结构
- 仅创建修改路径上的新对象，未修改部分保持原引用

### 6.2 内存使用
- 对于大型数据集，考虑使用专用不可变数据结构库
- 在性能关键路径，可考虑有限制地使用可变操作，但需谨慎隔离

### 6.3 批量更新
- 将多次更新合并为单次更新，减少临时对象创建
- 使用批量更新API减少重复创建对象

## 7. 最佳实践

### 7.1 推荐做法
- **默认不可变**：所有数据结构默认设计为不可变
- **类型系统支持**：使用TypeScript的readonly修饰符强制不可变性
- **不可变输入**：函数参数应视为不可变
- **明确接口**：明确区分返回新值和修改原值的函数

### 7.2 避免做法
- **避免可变方法**：避免使用修改原数据的方法
- **避免属性赋值**：避免直接修改对象属性
- **避免副作用**：函数不应修改函数作用域外的数据
- **避免this引用**：避免依赖this上下文的可变性 