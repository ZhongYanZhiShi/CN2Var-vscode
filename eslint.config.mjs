import antfu from '@antfu/eslint-config'

export default antfu({
  rules: {
    'brace-style': ['error', '1tbs', { allowSingleLine: true }]
  },
})
