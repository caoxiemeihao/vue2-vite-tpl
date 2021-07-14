import { DEFAULT_EXTENSIONS } from '../vite-plugins/utils'

console.log(DEFAULT_EXTENSIONS)

const dynamicVar = 'dynamic'

export const routes = [
  {
    path: '/home',
    component: require('@/views/home'),
  },
  {
    path: '/news',
    component: require('@/views/news.vue'),
  },
  {
    path: '/dynamic',
    component: () => {


      const res = import(`@/views/${dynamicVar}`)
      const res2 = import(`@/views/${dynamicVar}/index`)
      const res3 = import(`@/views/${dynamicVar}` + '/index')
      const res4 = import('@/views/dynamic')

      console.log(res, res2, res3, res4)


      return res
    },
  },
]
