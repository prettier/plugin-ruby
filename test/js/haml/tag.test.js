import { long, haml } from "../utils";

describe("tag", () => {
  test("class", () => {
    return expect(haml("%p.foo")).toMatchFormat();
  });

  test("class multiple", () => {
    return expect(haml("%p.foo.bar.baz")).toMatchFormat();
  });

  test("id", () => {
    return expect(haml("%p#foo")).toMatchFormat();
  });

  test("classes and id", () => {
    return expect(haml("%p.foo.bar#baz")).toMatchFormat();
  });

  test("self closing", () => {
    return expect(haml("%br/")).toMatchFormat();
  });

  test("whitespace removal left single line", () => {
    return expect(haml('%p>= "Foo\\nBar"')).toMatchFormat();
  });

  test("whitespace removal right single line", () => {
    return expect(haml('%p<= "Foo\\nBar"')).toMatchFormat();
  });

  test("whitespace removal right multi line", () => {
    const content = haml(`
      %blockquote<
        %div
          Foo!
    `);

    return expect(content).toMatchFormat();
  });

  test("dynamic attribute", () => {
    return expect(haml("%span{html_attrs('fr-fr')}")).toMatchFormat();
  });

  test("dynamic attributes (ruby hash)", () => {
    const content = haml(`%div{data: { controller: "lesson-evaluation" }}`);

    return expect(content).toMatchFormat();
  });

  test("dynamic attributes (html-style)", () => {
    const content = haml("%img(title=@title alt=@alt)/");

    return expect(content).toMatchFormat();
  });

  describe("static attributes", () => {
    test("basic", () => {
      return expect(haml("%span(foo)")).toChangeFormat("%span{foo: true}");
    });

    test("hash label, single quote", () => {
      const content = haml(`%section(xml:lang="en" title="title")`);
      const expected = `%section{"xml:lang": "en", title: "title"}`;

      return expect(content).toChangeFormat(expected);
    });

    test("hash label, double quote", () => {
      const content = haml(`%section(xml:lang="en" title="title")`);
      const expected = `%section{"xml:lang": "en", title: "title"}`;

      return expect(content).toChangeFormat(expected);
    });

    test("hash label, single quote, interpolation", () => {
      const content = haml(`%section{title: "#{title}"}`);

      return expect(content).toMatchFormat();
    });

    test("non-strings", () => {
      const content = haml(`%section(foo=1 bar=2)`);
      const expected = `%section(foo=1 bar=2)`;

      return expect(content).toChangeFormat(expected);
    });

    test("attributes prefixed with @", () => {
      return Promise.all([
        expect(haml(`%span{"@click": "open = true"}`)).toMatchFormat(),
        expect(haml(`%span{"@click.outside": "open = true"}`)).toMatchFormat(),
        expect(
          haml(`%span{"@keydown.arrow-up.prevent": "open = true"}`)
        ).toMatchFormat()
      ]);
    });
  });

  test("object reference", () => {
    const content = haml(`
      %div[@user, :greeting]
        %bar[290]/
        Hello!
    `);

    return expect(content).toMatchFormat();
  });

  test("long declaration before text", () => {
    const content = haml(`%button{ data: { current: ${long} } } foo`);
    const expected = haml(`
      %button{
        data: {
          current: ${long}
        }
      }
        foo
    `);

    return expect(content).toChangeFormat(expected);
  });

  test("with quotes in string", () => {
    const content = haml(`%div{title: "escaping quotes, it's annoying"}`);

    return expect(content).toMatchFormat();
  });

  test("with interpolation in the value", () => {
    const content = haml(`%p <small>hello</small>"#{1 + 2} little pigs"`);

    return expect(content).toMatchFormat();
  });
});
