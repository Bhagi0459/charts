module.exports = {
  apps: [
    {
      name: "charts-app",
      script: "node_modules/serve/build/main.js",
      args: "-s dist -l 4173",
      cwd: "D:/MBS/Projects/React/charts",
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};
