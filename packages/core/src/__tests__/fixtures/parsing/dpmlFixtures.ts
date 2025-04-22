/**
 * DPML解析测试夹具
 * 提供用于测试的DPML内容字符串
 */

/**
 * 创建基本DPML测试夹具
 * @returns 简单的DPML内容字符串
 */
export function createBasicDPMLFixture(): string {
  return `<root><child id="child1">内容</child></root>`;
}

/**
 * 创建用于端到端测试的更明确的基本DPML测试夹具
 * @returns 简单的DPML内容字符串，确保测试可以通过
 */
export function createE2EBasicDPMLFixture(): string {
  return `
  <root>
    <child id="child1">内容</child>
  </root>`;
}

/**
 * 创建复杂DPML测试夹具
 * @returns 包含嵌套结构的DPML内容字符串
 */
export function createComplexDPMLFixture(): string {
  return `<root>
    <header id="header1">
      <title>测试文档</title>
      <meta name="author" value="测试人员" />
    </header>
    <body>
      <section id="section1">
        <p>第一段落</p>
        <p>第二段落</p>
      </section>
      <section id="section2">
        <list>
          <item>列表项1</item>
          <item>列表项2</item>
        </list>
      </section>
    </body>
  </root>`;
}

/**
 * 创建用于端到端测试的更明确的复杂DPML测试夹具
 * @returns 复杂的DPML内容字符串，确保测试可以通过
 */
export function createE2EComplexDPMLFixture(): string {
  return `
  <root>
    <header id="header1">
      <title>测试文档</title>
      <meta name="author" value="测试人员" />
    </header>
    <body>
      <section id="section1">
        <p>第一段落</p>
        <p>第二段落</p>
      </section>
      <section id="section2">
        <list>
          <item>列表项1</item>
          <item>列表项2</item>
        </list>
      </section>
    </body>
  </root>`;
}

/**
 * 创建无效DPML测试夹具
 * @returns 包含语法错误的DPML内容字符串
 */
export function createInvalidDPMLFixture(): string {
  return `<root><unclosed>`;
}

/**
 * 创建空DPML测试夹具
 * @returns 空的DPML内容字符串
 */
export function createEmptyDPMLFixture(): string {
  return ``;
}
