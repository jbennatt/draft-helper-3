
import axios from "axios"
import { decodeJsonCookie, getValueFromJsonCookie, setOrUpdateCookie } from "./CookieService"
import { getNewPcke, PkceChallengeField } from "./PkceService"

const YahooAuthUrl = 'https://api.login.yahoo.com/oauth2/request_auth'
const YahooTokenApi = 'https://api.jaredbennatt.com/yahoo-login/oauth2/get_token'

const YahooClientId = 'dj0yJmk9dmhNODZtUkY2cm9KJmQ9WVdrOVEyUktkMU5rWjJzbWNHbzlNQT09JnM9Y29uc3VtZXJzZWNyZXQmc3Y9MCZ4PTNi'

export const YahooTokenCookieKey = 'yahoo_token_cookie'
const TokenCreateDateField = 'token_create_date'
const YahooExpiresInField = 'expires_in'
const YahooAccessTokenField = 'access_token'
const YahooRefreshTokenField = 'refresh_token'
const RefreshTokenGrantType = 'refresh_token'

export const YahooPkceCookieKey = 'yahoo_pkce'

const YahooRedirectUri = getYahooRedirectUrl('get-yahoo-token/')

const YahooLongExpirerDate = new Date()
YahooLongExpirerDate.setFullYear(YahooLongExpirerDate.getFullYear() + 1)


export function reauthorizeUser(setPkceCookie) {
    /*
     * replace this with an api call, which creates the pkce challenge and nonce,
     * stores the pkce challenge and verifier in secure httpOnly cookie globally
     * for my website (should probably eventually attempt to limit that).
     * 
     * The api call would return a response containing the challenge and nonce
     * (required for yahoo auth URL).
     * 
     * After logging into yahoo and being redirected back to my site, would make
     * another API call which would set the access token cookie, again to secure
     * and httpOnly.
     * 
     * From that point forward, the access token information should be stored in
     * a useState configuration. Once it's determined a new token is required, 
     * an API call would be required to 1) update the httpOnly cookie and 2) 
     * return the new access token info to update state.
     * 
     * Once the browser exits the access tokens only existed in memory during
     * browser execution and in the secure httpOnly cookie (which should not be
     * capable of being read by the browser).
     * 
     * I could go even further and encrypt the cookie, since it's only
     * accessible via sever-side and then decrypt on server to read.
     */

    const nonce = encodeURIComponent(getNewPcke()[PkceChallengeField])
    const pkce = getNewPcke()

    setOrUpdateCookie(setPkceCookie, YahooPkceCookieKey, pkce)

    const authUrl = `${YahooAuthUrl}?` +
        `client_id=${YahooClientId}` +
        `&redirect_uri=${YahooRedirectUri}` +
        '&response_type=code' +
        `&code_challenge=${pkce[PkceChallengeField]}` +
        `&code_challenge_method=S256` +
        `&nonce=${nonce}`

    window.location.href = authUrl
}

export function refreshToken(tokenCookie, setTokenCookie) {
    const refreshRequest = {
        client_id: YahooClientId,
        redirect_uri: YahooRedirectUri,
        refresh_token: getValueFromJsonCookie(tokenCookie, YahooTokenCookieKey, YahooRefreshTokenField),
        grant_type: RefreshTokenGrantType
    }

    return getAndSetAccessToken(refreshRequest, setTokenCookie)
}

async function getAndSetAccessToken(requestParams, setTokensCookie) {
    const body = getFormUrlEncodedForAxiosBody(requestParams)
    return axios
        .post(YahooTokenApi, body, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
        .then(axiosResponse => {
            const tokens = axiosResponse.data
            tokens[TokenCreateDateField] = new Date()
            setOrUpdateCookie(setTokensCookie, YahooTokenCookieKey, tokens, YahooLongExpirerDate)
            return axiosResponse.data
        })
}

export async function getAccessToken(tokenCookie, setTokenCookie) {
    const currentToken = decodeJsonCookie(tokenCookie, YahooTokenCookieKey)
    const createDate = new Date(currentToken[TokenCreateDateField])
    const expireDate = new Date(createDate.getTime + currentToken[YahooExpiresInField] * 1000)
    const fiveMinutesFromNow = new Date((new Date()).getTime + 5 * 60000)

    let accessToken = getValueFromJsonCookie(tokenCookie, YahooTokenCookieKey, YahooAccessTokenField)

    if (expireDate < fiveMinutesFromNow) {
        accessToken = (await refreshToken(tokenCookie, setTokenCookie))[YahooAccessTokenField]
    }

    return accessToken
}

function getFormUrlEncodedForAxiosBody(jsonObject) {
    return new URLSearchParams(jsonObject)
}

function getYahooRedirectUrl(redirect_path) {
    return `https://jaredbennatt.com/${redirect_path}`
}