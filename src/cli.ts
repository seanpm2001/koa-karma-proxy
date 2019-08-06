/**
 * @license
 * Copyright (c) 2019 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */

import {start} from './karma-proxy';
import karma = require('karma');
import {resolve} from 'path';
import {extractArgv} from './utils';

console.log('Karma Proxy wrapper for Karma CLI');
let upstreamProxyServerFactory;

const karmaProxyConfigFile =
    resolve(extractArgv('--proxyFile', process.argv) || './karma.proxy.js');

const {process: processKarmaArgs} = require('karma/lib/cli');
const karmaConfig: karma.ConfigOptions = processKarmaArgs();
const showUsageInfo = () => console.info(
    `You can override the default proxy config file path of "./karma.proxy.js" by adding the option:\n` +
    `${process.argv[1]} ${process.argv[2]} --proxyFile <path>\n`);

try {
  upstreamProxyServerFactory = require(karmaProxyConfigFile);
} catch (err) {
  console.error(
      `Unable to load proxy server config file "${
          karmaProxyConfigFile}" due to`,
      err);
  showUsageInfo();
  process.exit(1);
}

(async () => {
  const {upstreamProxyPort, karmaPort} =
      await start(upstreamProxyServerFactory, {
        karmaConfig,
        karmaExitCallback: (exitCode: number) => process.exit(exitCode)
      });
  console.log(
      `[karma-proxy] Upstream Proxy Server started at ` +
      `http://0.0.0.0:${upstreamProxyPort}/ and proxying to karma port ${
          karmaPort}`);
})();