module.exports = {
  module: {
    rules: [
      {
        test: [/src\/common\/index.ts/i, /src\/hooks\/index.ts/i],
        sideEffects: false,
      },
    ],
  },
};
