'use strict';

const gulp = require('gulp');
const build = require('@microsoft/sp-build-web');
build.addSuppression(`Warning - [sass] The local CSS class 'ms-Grid' is not camelCase and will not be type-safe.`);
build.copyAssets.taskConfig = { excludeHashFromFileNames: true, extsToIgnore:['.map', '.stats.json', '.stats.html', '.json'] }
build.initialize(gulp);
