import Vue from 'vue'
import Router from 'vue-router'
import SignUp from '../components/SignUp'
import Home from '../components/Home'
import AccountSettings from '../components/AccountSettings'
import DeleteAccount from '../components/DeleteAccount'
import Registered from '../components/Registered'
import TermsAndConditions from '../components/TermsAndConditions'
import ForgottenPassword from '../components/ForgottenPassword'
import ResetPassword from '../components/ResetPassword'
import ValidateNewAccount from '../components/ValidateNewAccount'
import ValidateNewEmail from '../components/ValidateNewEmail'
import SingleplayerGame from '../components/SingleplayerGame'
import SingleplayerMenu from '../components/SingleplayerMenu'
import SingleplayerResults from '../components/SingleplayerResults'
import MultiplayerGame from '../components/MultiplayerGame'
import MultiplayerMenu from '../components/MultiplayerMenu'
import MultiplayerResults from '../components/MultiplayerResults'
import MobileRedirect from '../components/MobileRedirect'

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
            path: '/singleplayergame',
            name: 'SingleplayerGame',
            component: SingleplayerGame,
        },
        {
            path: '/singleplayermenu',
            name: 'SingleplayerMenu',
            component: SingleplayerMenu,
        },
        {
            path: '/singleplayerresults',
            name: 'SingleplayerResults',
            component: SingleplayerResults,
        },
        {
            path: '/multiplayergame',
            name: 'MultiplayerGame',
            component: MultiplayerGame,
        },
        {
            path: '/multiplayermenu',
            name: 'MultiplayerMenu',
            component: MultiplayerMenu,
        },
        {
            path: '/multiplayerresults',
            name: 'MultiplayerResults',
            component: MultiplayerResults,
        },
        {
            path: '/Mobileredirect',
            name: 'MobileRedirect',
            component: MobileRedirect,
        },
    ],
})
