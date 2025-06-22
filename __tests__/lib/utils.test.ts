import { cn } from '@/lib/utils'

describe('utils', () => {
  describe('cn', () => {
    it('should combine multiple class names', () => {
      const result = cn('bg-red-500', 'text-white', 'p-4')
      expect(result).toBe('bg-red-500 text-white p-4')
    })

    it('should handle conditional classes', () => {
      const isActive = true
      const result = cn('base-class', isActive && 'active-class')
      expect(result).toBe('base-class active-class')
    })

    it('should handle false conditional classes', () => {
      const isActive = false
      const result = cn('base-class', isActive && 'active-class')
      expect(result).toBe('base-class')
    })

    it('should handle undefined and null values', () => {
      const result = cn('base-class', undefined, null, 'valid-class')
      expect(result).toBe('base-class valid-class')
    })

    it('should handle empty strings', () => {
      const result = cn('base-class', '', 'valid-class')
      expect(result).toBe('base-class valid-class')
    })

    it('should handle arrays of classes', () => {
      const result = cn('base-class', ['nested-class', 'another-class'])
      expect(result).toBe('base-class nested-class another-class')
    })

    it('should handle objects with boolean values', () => {
      const result = cn('base-class', {
        'conditional-class': true,
        'false-class': false
      })
      expect(result).toBe('base-class conditional-class')
    })

    it('should handle conflicting Tailwind classes', () => {
      const result = cn('bg-red-500', 'bg-blue-500')
      // The last class should take precedence due to twMerge
      expect(result).toBe('bg-blue-500')
    })

    it('should handle complex combinations', () => {
      const isActive = true
      const isDisabled = false
      const result = cn(
        'base-class',
        isActive && 'active-class',
        isDisabled && 'disabled-class',
        ['array-class-1', 'array-class-2'],
        {
          'object-class': true,
          'false-object-class': false
        }
      )
      expect(result).toBe('base-class active-class array-class-1 array-class-2 object-class')
    })
  })
}) 