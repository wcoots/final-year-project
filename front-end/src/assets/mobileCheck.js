export const mobileCheck = () => {
    if (
        typeof window.orientation !== 'undefined' ||
        navigator.userAgent.indexOf('IEMobile') !== -1
    ) {
        return true
    } else {
        return false
    }
}
