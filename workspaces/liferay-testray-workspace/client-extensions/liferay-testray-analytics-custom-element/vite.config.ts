/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import react from '@vitejs/plugin-react-swc';
import path from 'path';
import {defineConfig} from 'vite';

// Output layout mirrors liferay-testray-custom-element exactly: the
// client-extension.yaml `assemble` block copies build/static, and the
// cssURLs/urls globs expect index.*.css and index*.js at that path.

export default defineConfig({
	build: {
		assetsDir: 'static',
		outDir: 'build',
		rollupOptions: {
			output: {
				assetFileNames: 'static/[name].[hash][extname]',
				chunkFileNames: 'static/[name].js',
				entryFileNames: 'static/[name].js',
			},
		},
	},
	plugins: [react()],
	resolve: {
		alias: {
			'~': path.resolve(__dirname, './src/'),
		},
	},
	server: {
		port: 3001,
	},
});
