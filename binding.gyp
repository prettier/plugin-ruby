{
  "targets": [
    {
      "target_name": "parser",
      "sources": ["src/parser.cc"],
      "include_dirs": [
        "<!(ruby -e \"puts RbConfig::CONFIG['rubyhdrdir']\")",
        "<!(ruby -e \"puts RbConfig::CONFIG['rubyarchhdrdir']\")"
      ],
      "link_settings": {
        "libraries": [
          "<!(ruby -e \"puts RbConfig::CONFIG.values_at('libdir', 'LIBRUBY').join('/')\")",
          "<!(ruby -e \"puts RbConfig::CONFIG['INSTALL_STATIC_LIBRARY'] == 'yes' ? RbConfig::CONFIG['MAINLIBS'] : RbConfig::CONFIG['LIBS']\")"
        ]
      }
    }
  ]
}
