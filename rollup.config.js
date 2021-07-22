import livereload from "rollup-plugin-livereload";
import scss from "rollup-plugin-scss";

const PORT = (Math.random() * (65535 - 1024) + 1024).toFixed(0);

let renderer;
let server;

function exit() {
  if (renderer) renderer.kill(0);
  if (server) server.kill(0);
  process.exit(0);
}

function render() {
  return {
    writeBundle() {
      if (renderer) return;
      renderer = require("child_process").spawn(
        "yarn",
        [
          "tauri",
          "dev",
          `--config={"build": {"devPath": "http://localhost:${PORT}"}}`,
        ],
        {
          stdio: [process.stdin, process.stdout, process.stderr],
        }
      );
    },
  };
}

function serve() {
  return {
    writeBundle() {
      if (server) return;
      server = require("child_process").spawn(
        "yarn",
        ["sirv", "--dev", `--port=${PORT}`, "--no-clear", "dist"],
        {
          stdio: [process.stdin, process.stdout, process.stderr],
        }
      );

      server.on("exit", exit);
      process.on("SIGTERM", exit);
      process.on("exit", exit);
    },
  };
}

export default {
  input: "index.scss",

  output: {
      dir: "dist",
  },

  plugins: [
    scss({ output: "dist/index.css" }),
    serve(),
    livereload("dist"),
    render(),
  ],

  watch: {
    clearScreen: false,
  },
};

