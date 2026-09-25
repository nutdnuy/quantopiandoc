// Optional authoring step. Uses installed local tooling only; never downloads packages.
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const search=[root,...(process.env.QRL_TOOLING_ROOT?[process.env.QRL_TOOLING_ROOT]:[])];
const esbuild=require(require.resolve('esbuild',{paths:search}));
esbuild.buildSync({entryPoints:[path.join(root,'src/interactions.jsx')],outfile:path.join(root,'public/interactions.js'),bundle:true,minify:true,jsx:'automatic',nodePaths:search.map(p=>path.join(p,'node_modules')),define:{'process.env.NODE_ENV':'"production"'},legalComments:'linked',target:'es2020'});
console.log('Rebuilt the local React interaction bundle.');
