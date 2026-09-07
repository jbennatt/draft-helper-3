import { updateYahooTeams } from "../services/YahooApiService"
import { reauthorizeUser } from "../services/YahooTokenService"
import { updateSleeperTeams } from "../services/SleeperApiService"

export const supportedNumTeams = [4, 6, 8, 10, 12, 14, 16]
export const ManualModeText = 'Manual'
export const YahooModeText = 'Yahoo'
export const SleeperModeText = 'Sleeper'
export const LoginToYahooText = 'Login to Yahoo'
export const LoginToSleeperText = 'Enter Sleeper Username'

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
    setPlayersTeams, sleeperUsername, setSleeperUsername) {
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
            case SleeperModeText: {
                setInputMode(newValue)
                console.log('setting manual mode to false, sleeper mode')
                setManualMode(false)
                if (sleeperUsername) {
                    updateSleeperTeams(sleeperUsername, setPlayersTeams)
                }
                break;
            }
            case LoginToYahooText: {
                reauthorizeUser(setPkceCookie)
                break;
            }
            case LoginToSleeperText: {
                const username = prompt('Enter your Sleeper username:')
                if (username) {
                    setSleeperUsername(username)
                    setInputMode(SleeperModeText)
                    setManualMode(false)
                    updateSleeperTeams(username, setPlayersTeams)
                }
                break;
            }
        }
    }
}

export function handleTeamSelect(selectionEvent, selectedTeam, teams, setSelectedTeam,
    tokenCookie, setTokenCookie, yahooDraftedPlayerKeys, setYahooDraftedPlayerKeys,
    allPlayers, setDraftedMap, pickNum, setPickNum,
    sleeperDraftedPlayerIds, setSleeperDraftedPlayerIds, inputMode) {
    const newValue = selectionEvent.target.innerText
    if (newValue !== selectedTeam && Object.keys(teams).includes(newValue)) {
        setSelectedTeam(newValue)

        // Note: The actual API calls for getting drafted players are handled in MainPanel.js
        // via the useInterval hook, similar to how Yahoo is handled
    }
}