let babel_env = process.env["BABEL_ENV"];
let dev = process.env['npm_lifecycle_event'] !== "umd" ;
let loose = false,
  modules = false,
  useESModules = false;
switch (babel_env) {
  case "commonjs":
    loose = true;
    modules = "cjs";
    useESModules = false;
    break;
  case "es":
    loose = true;
    modules = false;
    useESModules = true;
    break;
  case "umd":
    loose = false;
    modules = false;
    useESModules = false;
    break;
}

module.exports = {
  presets: [
    [
      "@babel/preset-env",
      { loose, modules }
    ],
	"@babel/preset-react",
  ],
  plugins: [
    ["@babel/plugin-transform-runtime", { useESModules }],
    [
      "@babel/plugin-proposal-decorators",
      {
        legacy: true
      }
    ],
    dev ? ["import", { "libraryName": "antd", "style": "css", "libraryDirectory": "es" } ] : null,
    "@babel/plugin-proposal-class-properties",
    "@babel/plugin-proposal-object-rest-spread",
    "@babel/plugin-transform-modules-commonjs"
  ].filter(Boolean)
};
