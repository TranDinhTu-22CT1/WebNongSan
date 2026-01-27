import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import react from 'eslint-plugin-react' // <--- 1. Mới thêm
import { defineConfig } from 'eslint/config'

export default defineConfig([
  { ignores: ['dist'] },
  {
    files: ['**/*.{js,jsx}'],
    
    plugins: {
      react, 
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    extends: [
      js.configs.recommended,
      reactHooks.configs.recommended || reactHooks.configs.flat.recommended, 
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    
    settings: {
      react: { version: '18.3' }, 
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      
     
      'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx'] }],
      
     
      'react/react-in-jsx-scope': 'off',
      
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
])