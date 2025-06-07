import antfu from '@antfu/eslint-config'

export default antfu({
  rules: {
    'style/brace-style': ['error', '1tbs', { allowSingleLine: true }],
    'brace-style': 'off',
    'style/indent': ['error', 2],
  },
})
