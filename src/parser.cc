#include <node.h>
#include <ruby.h>

namespace parser {
  using v8::Context;
  using v8::Isolate;
  using v8::Local;

  using v8::Array;
  using v8::Exception;
  using v8::False;
  using v8::FunctionCallbackInfo;
  using v8::Integer;
  using v8::NewStringType;
  using v8::Null;
  using v8::Object;
  using v8::String;
  using v8::Value;

  VALUE rb_cParser;
  ID rb_parse;

  Local<Value> translate(Isolate *isolate, Local<Context> context, VALUE value) {
    switch (TYPE(value)) {
      case T_SYMBOL:
        return String::NewFromUtf8(isolate, rb_id2name(SYM2ID(value)), NewStringType::kNormal).ToLocalChecked();
      case T_FALSE:
        return False(isolate);
      case T_NIL:
        return Null(isolate);
      case T_FIXNUM:
        return Integer::New(isolate, FIX2LONG(value));
      case T_STRING:
        return String::NewFromUtf8(isolate, StringValueCStr(value), NewStringType::kNormal).ToLocalChecked();
      case T_ARRAY: {
        long size = RARRAY_LEN(value);
        Local<Array> array = Array::New(isolate, size);

        long idx;
        for (idx = 0; idx < size; idx++) {
          (void) array->Set(
            context,
            idx,
            translate(isolate, context, rb_ary_entry(value, idx))
          );
        }

        return array;
      }
      case T_HASH: {
        Local<Object> object = Object::New(isolate);

        VALUE keys = rb_funcall(value, rb_intern("keys"), 0);
        VALUE key;

        long idx;
        long size = RARRAY_LEN(keys);

        for (idx = 0; idx < size; idx++) {
          key = rb_ary_entry(keys, idx);

          (void) object->Set(
            context,
            translate(isolate, context, key),
            translate(isolate, context, rb_hash_aref(value, key))
          );
        }

        return object;
      }
    }

    return Null(isolate);
  }

  void throwException(Isolate *isolate, const char *message) {
    isolate->ThrowException(
      Exception::TypeError(String::NewFromUtf8(isolate, message, NewStringType::kNormal).ToLocalChecked())
    );
  }

  void setup(const FunctionCallbackInfo<Value>& args) {
    Isolate* isolate = args.GetIsolate();
    Local<Context> context = isolate->GetCurrentContext();

    if (args.Length() != 1) {
      return throwException(isolate, "Wrong number of arguments");
    }

    if (!args[0]->IsString()) {
      return throwException(isolate, "Filepath must be a string");
    }

    ruby_init();
    ruby_init_loadpath();

    String::Utf8Value filepath(isolate, args[0]->ToString(context).ToLocalChecked());
    rb_require(*filepath);

    rb_cParser = rb_const_get(rb_cObject, rb_intern("Parser"));
    rb_parse = rb_intern("parse");
  }

  void teardown(const FunctionCallbackInfo<Value>& args) {
    ruby_cleanup(0);
  }

  void parse(const FunctionCallbackInfo<Value>& args) {
    Isolate* isolate = args.GetIsolate();
    Local<Context> context = isolate->GetCurrentContext();

    if (args.Length() != 1) {
      return throwException(isolate, "Wrong number of arguments");
    }

    if (!args[0]->IsString()) {
      return throwException(isolate, "Code must be a string");
    }

    String::Utf8Value code(isolate, args[0]->ToString(context).ToLocalChecked());
    VALUE root = rb_funcall(rb_cParser, rb_parse, 1, rb_str_new2(*code));

    if (root == Qnil) {
      return throwException(isolate, "Invalid Ruby code");
    }

    args.GetReturnValue().Set(translate(isolate, context, root));
  }

  void init(Local<Object> exports) {
    NODE_SET_METHOD(exports, "setup", setup);
    NODE_SET_METHOD(exports, "teardown", teardown);
    NODE_SET_METHOD(exports, "parse", parse);
  }

  NODE_MODULE(NODE_GYP_MODULE_NAME, init);
}
