export function setOrUpdateCookie(set_cookie, cookie_key, cookie_value,
    expires = null) {
    const now = new Date()
    const expiresOrIn5Minutes = expires ?? new Date(now.getTime() + 5 * 60000)

    set_cookie(cookie_key, JSON.stringify(cookie_value), {
        path: '/',
        expires: expiresOrIn5Minutes,
        secure: true
    })
}

export function decodeJsonCookie(cookie, cookie_key, def_rtrn = {}) {
    if (cookie !== undefined && cookie[cookie_key] !== undefined) {
        const rtrn = JSON.parse(JSON.stringify(cookie[cookie_key]))
        // Object.keys(rtrn).forEach(key => console.log(`${key}: ${rtrn[key]}`))
        return rtrn
    }
    else {
        return def_rtrn
    }
}

export function getValueFromJsonCookie(cookie, cookie_key, value_key) {
    return decodeJsonCookie(cookie, cookie_key)[value_key]
}