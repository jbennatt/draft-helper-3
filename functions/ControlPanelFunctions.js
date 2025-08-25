import { updateYahooTeams } from "../services/YahooApiService"
import { reauthorizeUser } from "../services/YahooTokenService"

export const supportedNumTeams = [8, 10, 12, 14, 16]
export const ManualModeText = 'Manual'
export const YahooModeText = 'Yahoo'
export const LoginToYahooText = 'Login to Yahoo'

export function computeRound(pickNum, numTeams) {
    return Math.floor((pickNum - 1) / numTeams) + 1
}

export function computePickInRound(pickNum, numTeams) {
    return ((pickNum - 1) % numTeams) + 1
}

export function updateIntegerEvent(selectionEvent, setValue, oldValue, validValues = null) {
    const newValue = parseInt(selectionEvent.target.innerText)
    if (newValue && newValue !== oldValue &&
        (!validValues || validValues.includes(newValue)))
        setValue(newValue)
}

export function updateStringEvent(selectionEvent, setValue, oldValue, validValues = null) {
    const newValue = selectionEvent.target.innerText
    if (newValue && newValue !== oldValue &&
        (!validValues || validValues.includes(newValue)))
        setValue(newValue)
}

export function incrementPickNum(currPick, setPickNum, inc) {
    const newPickNum = currPick + inc
    if (inc !== 0 && newPickNum > 0) setPickNum(newPickNum)
}

export function handleInputMode(selectionEvent, inputMode, setInputMode,
    setManualMode, setPkceCookie, yahooTokenCookie, setYahooTokenCookie,
    setPlayersTeams) {
    const newValue = selectionEvent.target.innerText
    if (inputMode !== newValue) {
        switch (newValue) {
            case ManualModeText: {
                console.log('setting manual mode to true')
                setInputMode(newValue)
                setManualMode(true)
                break;
            }
            case YahooModeText: {
                setInputMode(newValue)
                console.log('setting manual mode to false')
                setManualMode(false)
                updateYahooTeams(yahooTokenCookie, setYahooTokenCookie, setPlayersTeams)
                break;
            }
            case LoginToYahooText: {
                reauthorizeUser(setPkceCookie)
                break;
            }
        }
    }
}

export function handleTeamSelect(selectionEvent, selectedTeam, teams, setSelectedTeam,
    tokenCookie, setTokenCookie, yahooDraftedPlayerKeys, setYahooDraftedPlayerKeys,
    allPlayers, setDraftedMap, pickNum, setPickNum) {
    const newValue = selectionEvent.target.innerText
    if (newValue !== selectedTeam && Object.keys(teams).includes(newValue)) {
        setSelectedTeam(newValue)

        // getDraftedPlayerKeys(tokenCookie, setTokenCookie, teams[newValue],
        //     yahooDraftedPlayerKeys, setYahooDraftedPlayerKeys, allPlayers,
        //     setDraftedMap, pickNum, setPickNum)
    }
}