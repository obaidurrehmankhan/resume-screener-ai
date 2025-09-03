import { store } from '@/app/store'
import { authApi } from './authApi'

export const resetAuthState = () => {
    // Clear RTK Query cache
    store.dispatch(authApi.util.resetApiState())
    
    // Force reload the page to ensure clean state
    window.location.reload()
}
