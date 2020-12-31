const { long, ruby } = require("../../utils");

describe("calls", () => {
  test("simple calls", () => {
    const content = "posts.active.where('created_at > ?', 1.year.ago)";

    return expect(content).toMatchFormat();
  });

  test("short chains", () => expect("foo.bar.baz qux").toMatchFormat());

  test("chain methods", () => {
    const before = ruby(`
      aaaaaaaaaa.bbbbbbbbbb.cccccccccc.dddddddddd(foo, bar).eeeeeeeeee.ffffffffff.gggggggggg.hhhhhhhhhh
    `);

    const after = ruby(`
      aaaaaaaaaa
        .bbbbbbbbbb
        .cccccccccc
        .dddddddddd(foo, bar)
        .eeeeeeeeee
        .ffffffffff
        .gggggggggg
        .hhhhhhhhhh
    `);

    return expect(before).toChangeFormat(after);
  });

  test("chains of methods with one with arguments right at the top", () => {
    const content = ruby(`
      aaa.bbb.ccc.ddd.eee.merge(
        ${long.slice(0, 30)}: 'aaa',
        ${long.slice(0, 31)}: 'bbb'
      )
    `);

    return expect(content).toMatchFormat();
  });

  test("chains of methods with a block right at the top", () => {
    const block = long.slice(0, 60);
    const content = ruby(`
      aaa.bbb.ccc.ddd.eee do
        ${block}
      end
    `);

    const expected = ruby(`
      aaa
        .bbb
        .ccc
        .ddd
        .eee { ${block} }
    `);

    return expect(content).toChangeFormat(expected);
  });

  test("tons of calls that fit on one line", () => {
    const content = "a.b.c.d.e.f.g.h.i.j.k.l.m.n.o.p.q.r.s.t.u.v.w.x.y.z";

    return expect(content).toMatchFormat();
  });

  test("no explicit call doesn't add call", () =>
    expect("a.(1, 2, 3)").toMatchFormat());

  test("explicit call maintains call", () =>
    expect("a.call(1, 2, 3)").toMatchFormat());

  test("double bang with a special operator on a call", () =>
    expect("!!object&.topic_list").toMatchFormat());

  test("bang with a special operator on a command_call", () =>
    expect("!domain&.include? '@'").toMatchFormat());

  test("#call shorthand does not eliminate empty parentheses", () =>
    expect("Foo.new.()").toMatchFormat());

  test("methods that look like constants do not eliminate empty parens", () =>
    expect("Foo()").toMatchFormat());

  test("call chains with no indent on the first receiver", () => {
    const item = long.slice(0, 30);
    const content = `result = [${item}, ${item}, ${item}].map(&:foo?).bbb.ccc`;

    const expected = ruby(`
      result =
        [
          ${item},
          ${item},
          ${item}
        ]
        .map(&:foo?)
        .bbb
        .ccc
    `);

    return expect(content).toChangeFormat(expected);
  });
});
