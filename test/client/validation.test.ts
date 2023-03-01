import { hasErrors } from '../../src/client'

describe('validation', () => {
  describe('hasErrors', () => {
    it('should return true when errors are present', () => {
      expect(hasErrors({ errors: { fieldErrors: {} } })).toBe(true)
    })

    it('should return false when errors are not present', () => {
      expect(hasErrors({})).toBe(false)
    })
  })
})
