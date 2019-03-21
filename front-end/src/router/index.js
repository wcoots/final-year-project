import Vue from 'vue'
import Router from 'vue-router'
import SignUp from '@/components/SignUp'
import Home from '@/components/Home'
import AccountSettings from '@/components/AccountSettings'
import DeleteAccount from '@/components/DeleteAccount'
import Registered from '@/components/Registered'
import TermsAndConditions from '@/components/TermsAndConditions'
import ForgottenPassword from '@/components/ForgottenPassword'
import ResetPassword from '@/components/ResetPassword'
import ValidateNewAccount from '@/components/ValidateNewAccount'
import ValidateNewEmail from '@/components/ValidateNewEmail'
import SinglePlayer from '@/components/SinglePlayer'
import MultiPlayer from '@/components/MultiPlayer'
import Game from '@/components/Game'
import GameResults from '@/components/GameResults'

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
            path: '/home',
            name: 'Home',
            component: Home,
        },
        {
            path: '/accountsettings',
            name: 'AccountSettings',
            component: AccountSettings,
        },
        {
            path: '/deleteaccount',
            name: 'DeleteAccount',
            component: DeleteAccount,
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
        {
            path: '/singleplayer',
            name: 'SinglePlayer',
            component: SinglePlayer,
        },
        {
            path: '/multiplayer',
            name: 'MultiPlayer',
            component: MultiPlayer,
        },
        {
            path: '/game',
            name: 'Game',
            component: Game,
        },
        {
            path: '/gameresults',
            name: 'GameResults',
            component: GameResults,
        },
    ],
})
