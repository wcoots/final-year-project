import Vue from 'vue'
import Router from 'vue-router'
import SignUp from '@/components/SignUp'
import Dashboard from '@/components/Dashboard'
import Registered from '@/components/Registered'
import TermsAndConditions from '@/components/TermsAndConditions'
import ForgottenPassword from '@/components/ForgottenPassword'
import ResetPassword from '@/components/ResetPassword'
import ValidateNewAccount from '@/components/ValidateNewAccount'
import ValidateNewEmail from '@/components/ValidateNewEmail'

Vue.use(Router)

export default new Router({
    mode: 'history',
    routes: [
        {
            path: '/',
            name: 'SignUp',
            component: SignUp,
        },
        {
            path: '/dashboard',
            name: 'Dashboard',
            component: Dashboard,
        },
        {
            path: '/registered',
            name: 'Registered',
            component: Registered,
        },
        {
            path: '/termsandconditions',
            name: 'TermsAndConditions',
            component: TermsAndConditions,
        },
        {
            path: '/forgottenpassword',
            name: 'ForgottenPassword',
            component: ForgottenPassword,
        },
        {
            path: '/resetpassword',
            name: 'ResetPassword',
            component: ResetPassword,
        },
        {
            path: '/validatenewaccount',
            name: 'ValidateNewAccount',
            component: ValidateNewAccount,
        },
        {
            path: '/validatenewemail',
            name: 'ValidateNewEmail',
            component: ValidateNewEmail,
        },
    ],
})
