const { long, haml } = require("../utils");

describe("tag", () => {
  test("class", () => expect(haml("%p.foo")).toMatchFormat());

  test("class multiple", () => expect(haml("%p.foo.bar.baz")).toMatchFormat());

  test("id", () => expect(haml("%p#foo")).toMatchFormat());

  test("classes and id", () => expect(haml("%p.foo.bar#baz")).toMatchFormat());

  test("self closing", () => expect(haml("%br/")).toMatchFormat());

  test("whitespace removal left single line", () =>
    expect(haml('%p>= "Foo\\nBar"')).toMatchFormat());

  test("whitespace removal right single line", () =>
    expect(haml('%p<= "Foo\\nBar"')).toMatchFormat());

  test("whitespace removal right multi line", () => {
    const content = haml(`
      %blockquote<
        %div
          Foo!
    `);

    return expect(content).toMatchFormat();
  });

  test("dynamic attribute", () =>
    expect(haml("%span{html_attrs('fr-fr')}")).toMatchFormat());

  test("dynamic attributes (ruby hash)", () => {
    const content = haml("%div{data: { controller: 'lesson-evaluation' }}");

    return expect(content).toMatchFormat();
  });

  test("dynamic attributes (html-style)", () => {
    const content = haml("%img(title=@title alt=@alt)/");

    return expect(content).toMatchFormat();
  });

  test("static attributes", () =>
    expect(haml("%span(foo)")).toChangeFormat("%span{foo: true}"));

  test("static attributes (hash label, single quote)", () => {
    const content = haml(`%section(xml:lang="en" title="title")`);
    const expected = "%section{'xml:lang': 'en', title: 'title'}";

    return expect(content).toChangeFormat(expected);
  });

  test("static attributes (hash label, double quote)", () => {
    const content = haml(`%section(xml:lang="en" title="title")`);
    const expected = `%section{"xml:lang": "en", title: "title"}`;

    return expect(content).toChangeFormat(expected, { rubySingleQuote: false });
  });

  test("static attributes (hash rocket, single quote)", () => {
    const content = haml(`%section(xml:lang="en" title="title")`);
    const expected = `%section{:'xml:lang' => 'en', :title => 'title'}`;

    return expect(content).toChangeFormat(expected, { rubyHashLabel: false });
  });

  test("static attributes (hash rocket, double quote)", () => {
    const content = haml(`%section(xml:lang="en" title="title")`);
    const expected = '%section{:"xml:lang" => "en", :title => "title"}';

    return expect(content).toChangeFormat(expected, {
      rubyHashLabel: false,
      rubySingleQuote: false
    });
  });

  test("static attributes (non-strings)", () => {
    const content = haml(`%section(foo=1 bar=2)`);
    const expected = `%section(foo=1 bar=2)`;

    return expect(content).toChangeFormat(expected);
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
});
