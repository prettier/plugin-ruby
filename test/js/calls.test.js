const { ruby } = require("./utils");

describe("calls", () => {
  test("simple calls", () => {
    const content = "posts.active.where('created_at > ?', 1.year.ago)";

    return expect(content).toMatchFormat();
  });

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

  test("tons of calls that fit on one line", () => {
    const content = "a.b.c.d.e.f.g.h.i.j.k.l.m.n.o.p.q.r.s.t.u.v.w.x.y.z";

    return expect(content).toMatchFormat();
  });
});
