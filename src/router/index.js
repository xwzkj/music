import {createRouter,createWebHashHistory} from 'vue-router'
const router = createRouter({
    history:createWebHashHistory(),
    routes:[
        {
            name:'player',
            path:'/player',
            component:()=>import('@/pages/player.vue'),
            props:(route)=>{
                return route.query
            },
            meta:{
                keepAlive:true
            }
        },
        {
            path:'/',
            redirect:'/home'
        },
        {
            name:'root',
            path:'/',
            component:()=>import('@/pages/container.vue'),
            children:[
                {
                    name:'home',
                    path:'home',
                    component:()=>import('@/pages/home.vue'),
                    props:(route)=>{
                        return route.query
                    },
                    meta:{
                        keepAlive:true
                    }

                },
                {
                    name:'search',
                    path:'search',
                    component:()=>import('@/pages/search.vue'),
                    props:(route)=>{
                        return route.query
                    },
                    meta:{
                        keepAlive:true
                    }
                },
                {
                    name:'login',
                    path:'login',
                    component:()=>import('@/pages/login.vue'),
                    props:(route)=>{
                        return route.query
                    }

                },
                {
                    name:'account',
                    path:'account',
                    component:()=>import('@/pages/account.vue'),
                    props:(route)=>{
                        return route.query
                    },
                    meta:{
                        keepAlive:true
                    }

                },
                {
                    name:'playlist',
                    path:'playlist',
                    component:()=>import('@/pages/playlist.vue'),
                    props:(route)=>{
                        return route.query
                    },
                    meta:{
                        keepAlive:true
                    }

                },
                {
                    name:'setting',
                    path:'setting',
                    component:()=>import('@/pages/setting.vue'),
                    props:(route)=>{
                        return route.query
                    },
                    meta:{
                        keepAlive:true
                    }
                },
        
            ]
        }
    ]
})

export default router;