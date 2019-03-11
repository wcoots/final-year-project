export const redirect = async (endpoint, token = null) => {
    try {
        if (!token) {
            this.$router.push({ name: endpoint })
        } else {
            let url = ''
            if (process.env.NODE_ENV === 'development') {
                url = `http://localhost:3000/${endpoint}?token=${token}`
            } else if (process.env.NODE_ENV === 'production') {
                url = `https://werdz.fun/${endpoint}?token=${token}`
            }
            this.$router.push({ name: url })
        }
    } catch (error) {
        console.log(error)
    }
}
