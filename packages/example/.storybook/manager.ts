import { addons } from 'storybook/manager-api'
import theme from './theme'

addons.setConfig({
  layoutCustomisations: {
    showPanel() {
      return false
    },
  },
  theme: theme,
})
