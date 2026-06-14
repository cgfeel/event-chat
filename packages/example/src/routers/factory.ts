import { createBrowserRouter, createMemoryRouter } from 'react-router'
import { routerPath } from '@/utils/fields'
import routes from './routes'

const basename = routerPath()

export default function createRouter({ strategy, initialPathname = '/' }: CreateRouterProps) {
  return strategy === 'browser'
    ? createBrowserRouter(routes, { basename })
    : createMemoryRouter(routes, { initialEntries: [initialPathname], basename })
}

export type RoutingStrategy = 'browser' | 'memory'

interface CreateRouterProps {
  initialPathname?: string
  strategy?: RoutingStrategy
}
