import js from '@eslint/js';

const nodeGlobals = {
	process: 'readonly',
	console: 'readonly',
	fetch: 'readonly',
	URL: 'readonly',
	URLSearchParams: 'readonly',
	AbortController: 'readonly',
	setTimeout: 'readonly',
	clearTimeout: 'readonly',
	globalThis: 'readonly',
};

export default [
	{
		ignores: ['node_modules/**', 'reports/**', 'public/**'],
	},
	js.configs.recommended,
	{
		languageOptions: {
			ecmaVersion: 2023,
			sourceType: 'module',
			globals: nodeGlobals,
		},
		rules: {
			'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
		},
	},
];
