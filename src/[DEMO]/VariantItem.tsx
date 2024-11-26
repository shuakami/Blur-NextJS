import { memo } from 'react'
import { ShowcaseVariant } from './utils'

export const VariantItem = memo(({ variant }: { variant: ShowcaseVariant }) => (
  <div className="mb-8 last:mb-0">
    <div className="flex items-center justify-between mb-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {variant.name}
        </h3>
        {variant.description && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {variant.description}
          </p>
        )}
      </div>
      <code className="text-xs text-gray-500 dark:text-gray-400 font-mono">
        variant=&quot;{variant.variant}&quot;
      </code>
    </div>
    <div className="px-8 py-12 rounded-xl bg-gray-50/50 dark:bg-gray-900/50 
      divide-y divide-gray-200 dark:divide-gray-800">
      {variant.component}
    </div>
  </div>
))
VariantItem.displayName = 'VariantItem'