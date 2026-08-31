import useSWR from "swr";
import { refreshToken, YahooTokenCookieKey } from "../services/YahooTokenService";
import { useCookies } from "react-cookie";
import DraftHelper3 from "./DraftHelper3";

export default function LandingSetupPage() {
    const [yahooTokenCookie, setYahooTokenCookie] = useCookies([YahooTokenCookieKey])
    const { data, error } = useSWR('refresh token', _ => refreshToken(yahooTokenCookie, setYahooTokenCookie))

    if (error) return <DraftHelper3 yahooLoggedIn={false} />
    if (!data) return <div><h1>Trying to refresh Yahoo Token...</h1></div>

    return <DraftHelper3 yahooLoggedIn={true} />
}