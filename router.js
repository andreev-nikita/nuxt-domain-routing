import Router from 'vue-router'

export function createRouter (ssrContext, createDefaultRouter, routerOptions) {
  const options = routerOptions || createDefaultRouter(ssrContext).options

  let routesDirectory = null

  if (process.server && ssrContext && ssrContext.nuxt && ssrContext.req) {
    const req = ssrContext.req
    // const domainLevel = (req.headers.host.match(/\./g) || []).length + 1
    const subDomainsArr = req.headers.host.split('.').slice(0, -1)
    // Get routes directory by hostname
    routesDirectory = subDomainsArr.length === 0 ? 'root' : subDomainsArr.join('/')
    // Save to the object that will be sent to the client as inline-script
    ssrContext.nuxt.routesDirectory = routesDirectory
  }
  if (process.client) {
    // Get what we saved on SSR
    if (window.__NUXT__ && window.__NUXT__.routesDirectory) {
      routesDirectory = window.__NUXT__.routesDirectory
    }
  }

  let newRoutes = options.routes

  if (routesDirectory) {
    newRoutes = options.routes
      .filter((route) => {
        const path = route.path
        return path.startsWith(`/${routesDirectory}`)
      })
      .map(route => (
        {
          ...route,
          path: route.path.substr(routesDirectory.length + 1) || '/',
          name: route.name || 'index'
        }
      ))
  }

  return new Router({
    ...options,
    routes: newRoutes
  })
}
