import { long, ruby } from "../../utils";

describe("calls", () => {
  test("simple calls", () => {
    const content = `posts.active.where("created_at > ?", 1.year.ago)`;

    expect(content).toMatchFormat();
  });

  test("short chains", () => {
    expect("foo.bar.baz qux").toMatchFormat();
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

    expect(before).toChangeFormat(after);
  });

  test("chains of methods with one with arguments right at the top", () => {
    const content = ruby(`
      aaa.bbb.ccc.ddd.eee.merge(
        ${long.slice(0, 30)}: "aaa",
        ${long.slice(0, 31)}: "bbb"
      )
    `);

    expect(content).toMatchFormat();
  });

  test("chains of methods with a block right at the top", () => {
    const block = long.slice(0, 60);
    const content = ruby(`
      aaa.bbb.ccc.ddd.eee do
        ${block}
      end
    `);

    expect(content).toMatchFormat();
  });

  test("tons of calls that fit on one line", () => {
    const content = "a.b.c.d.e.f.g.h.i.j.k.l.m.n.o.p.q.r.s.t.u.v.w.x.y.z";

    expect(content).toMatchFormat();
  });

  test("chains which contain a .where.not", () => {
    const content = ruby(`
      Customer
        .active
        .where(foo: "bar")
        .where.not(banned_at: nil)
        .order(created_at: "desc")
        .limit(10)
    `);

    expect(content).toMatchFormat();
  });

  describe("within sig blocks", () => {
    test("basic chains", () => {
      const content = ruby(`
        sig do
          params(contacts: Contact::ActiveRecord_Relation).returns(
            Customer::ActiveRecord_Relation
          )
        end
      `);

      expect(content).toMatchFormat();
    });

    test("chains with other methods", () => {
      const content = ruby(`
        sig do
          overridable
            .params(contacts: Contact::ActiveRecord_Relation)
            .returns(Customer::ActiveRecord_Relation)
        end
      `);

      expect(content).toMatchFormat();
    });
  });

  test("chains with blocks mixed in", () => {
    const content = ruby(`
      Model
        .dataset
        .eager(:table1)
        .join(:second_table_name.as(:table2), %i[album_id artist_id])
        .where(table1__artist_id: artists.map(&:id))
        .where { table1__date > Time.now - 31.days }
        .where { table2__date > table1_date }
        .exclude(table2__album_id: :table1__album_id)
        .select_all(:table1)
    `);

    expect(content).toMatchFormat();
  });

  test("no explicit call doesn't add call", () => {
    expect("a.(1, 2, 3)").toMatchFormat();
  });

  test("explicit call maintains call", () => {
    expect("a.call(1, 2, 3)").toMatchFormat();
  });

  test("double bang with a special operator on a call", () => {
    expect("!!object&.topic_list").toMatchFormat();
  });

  test("bang with a special operator on a command_call", () => {
    expect(`!domain&.include? "@"`).toMatchFormat();
  });

  test("#call shorthand does not eliminate empty parentheses", () => {
    expect("Foo.new.()").toMatchFormat();
  });

  test("methods that look like constants do not eliminate empty parens", () => {
    expect("Foo()").toMatchFormat();
  });

  test("call chains with no indent on the first receiver", () => {
    const item = long.slice(0, 30);
    const content = `result = [${item}, ${item}, ${item}].map(&:foo?).bbb.ccc`;

    const expected = ruby(`
      result = [
        ${item},
        ${item},
        ${item}
      ].map(&:foo?).bbb.ccc
    `);

    expect(content).toChangeFormat(expected);
  });

  test("chained method_add_arg after a block", () => {
    const content = ruby(`
      a.b c do
      end.d e, f
    `);

    expect(content).toMatchFormat();
  });

  test("comments in a method chain get printed correctly", () => {
    // https://github.com/prettier/plugin-ruby/issues/943
    const content = ruby(`
      Organization.includes(
        :users,
        :venues
      )
        .where(id: org_ids)
        .flatten.
        # first remove rows with duplicate names
        uniq { |contact| "#{contact[:first_name]}#{contact[:last_name]}#{contact[:org_name]}" }.
        # then remove remaining rows with duplicate emails
        uniq { |contact| contact[:email] }
        .tap { |res|
          CSV.open(OUTPUT_PATH, "wb") { |csv|
            csv << HEADERS
            res.each { |d| csv << d.values }
          }
        }
    `);

    const expected = ruby(`
      Organization
        .includes(:users, :venues)
        .where(id: org_ids)
        .flatten.
        # first remove rows with duplicate names
        uniq do |contact|
          "#{contact[:first_name]}#{contact[:last_name]}#{contact[:org_name]}"
        end.
        # then remove remaining rows with duplicate emails
        uniq { |contact| contact[:email] }
        .tap do |res|
          CSV.open(OUTPUT_PATH, "wb") do |csv|
            csv << HEADERS
            res.each { |d| csv << d.values }
          end
        end
    `);

    expect(content).toChangeFormat(expected);
  });
});
