import axios from 'axios'

export const apiRequest = async (method, endpoint, data) => {
    // method = 'get' or 'post'
    // endpoint = something like 'forgottenPassword
    // data = { firstName: 'William', lastName: 'Cooter' }

    let url = ''
    if (process.env.NODE_ENV === 'development') {
        url = `http://localhost:8080/${endpoint}`
    } else if (process.env.NODE_ENV === 'production') {
        url = `https://api.werdz.fun/${endpoint}`
    }
    try {
        const res = await axios({
            method,
            url,
            data,
        })
        return res
    } catch (err) {
        console.log(err)
    }
}
