const { build } = require("esbuild");

// async function to build the application
async function myBuild() {
  try {
    // build the application
    await build({
      // the entry points of the application
      entryPoints: ["./src/index.tsx"],
      // bundle the application
      bundle: true,
      // the output file
      outdir: "build",
      // define the environment variables for production
      define: {
        "process.env.NODE_ENV": JSON.stringify("production"),
        "process.env.REACT_APP_SEVER_URL": JSON.stringify(
          "https://localhost:3001"
        ),
      },
      // minify the code for production and remove console statements
      minify: true,
      publicPath: "http://localhost:3000",
    });
    // log a success message
    console.log("Build completed successfully.");
  } catch (error) {
    // log an error message
    console.error("Build failed:", error);
  }
}

// call the build function
myBuild();

