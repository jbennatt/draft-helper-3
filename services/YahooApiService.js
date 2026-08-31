import axios from "axios"
import { getAccessToken } from "./YahooTokenService"
import { parseString } from "xml2js"
import levenshtein from "damerau-levenshtein"
import { filterByPos, filterPlayers } from "../functions/PlayerFunctions"
import { qb, wr, rb, te, pk, dst, qbte } from '../functions/PlayerLabelFunctions'

const YahooFantasyApi = 'https://api.jaredbennatt.com/yahoo-fantasy/fantasy/v2'

const YahooPosToMyPos = {}
YahooPosToMyPos[qb] = qb
YahooPosToMyPos[rb] = rb
YahooPosToMyPos[wr] = wr
YahooPosToMyPos[te] = te
YahooPosToMyPos['DEF'] = dst
YahooPosToMyPos['K'] = pk
YahooPosToMyPos['QB,TE'] = qbte

export function updateYahooTeams(tokenCookie, setTokenCookie, setPlayersTeams) {
    getAccessToken(tokenCookie, setTokenCookie)
        .then(accessToken => {
            axios
                .get(`${YahooFantasyApi}/users;use_login=1/games;game_keys=nfl/leagues/teams`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                })
                .then(response => {
                    const xmlData = response.data
                    parseString(xmlData, (err, result) => {
                        const user = result['fantasy_content']['users'][0]['user'][0]
                        const nflGames = user['games'][0]['game'][0]
                        const leagues = nflGames['leagues'][0]['league']
                        const myTeams = {}

                        leagues.forEach(league => {
                            const leagueKey = league['league_key'][0]
                            // console.log(`league key: ${leagueKey}`)
                            const team = league['teams'][0]['team'][0]['name']
                            // console.log(`team name: ${team}`)
                            myTeams[team] = leagueKey
                        })

                        setPlayersTeams(myTeams)
                    })
                })
        })
}

export async function getDraftedPlayerKeys(tokenCookie, setTokenCookie, leagueKey,
    yahooDraftedPlayerKeys, setYahooDraftedPlayerKeys, allPlayers, draftedMap, setDraftedMap,
    pickNum, setPickNum) {

    const accessToken = await getAccessToken(tokenCookie, setTokenCookie)
    const response = await axios.get(`${YahooFantasyApi}/league/${leagueKey}/draftresults`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    })


    const result = await parseXML(response.data)
    // console.log(result)
    // if (result['fantasy_content']['league'][0]['draft_results'] && result['fantasy_content']['league'][0]['draft_results'].length > 0) 
    {
        const draftResults = result['fantasy_content']['league'][0]['draft_results'][0]['draft_result']


        const playerKeys = draftResults.map(pick =>
            Array.isArray(pick['player_key']) ? pick['player_key'][0] : pick['player_key']
        ).filter(playerKey => playerKey !== undefined)

        const oldPlayerKeys = yahooDraftedPlayerKeys
        const newPlayerKeys = playerKeys.filter(playerKey => !oldPlayerKeys.includes(playerKey))

        const newYahooPlayers = await getPlayersFromPlayerKeys(tokenCookie, setTokenCookie, newPlayerKeys)

        const playersToBeDrafted = newYahooPlayers.map(yahooPlayerPos => {           
            const yahooPlayer = yahooPlayerPos[0]
            const yahooPos = YahooPosToMyPos[yahooPlayerPos[1]]

            if(yahooPlayer.toLowerCase().includes('hollywood')) return 'Marquise Brown'

            const dlSteps = filterPlayers(allPlayers, filterByPos(yahooPos)).map(myPlayer => {
                const dlDist = levenshtein(myPlayer.name, yahooPlayer).steps
                return [myPlayer.name, dlDist]
            })
            const bestFit = [...dlSteps].sort((left, right) => left[1] - right[1])

            return bestFit[0][0]
        })

        playersToBeDrafted.forEach(player => draftedMap.set(player, true))

        setPickNum(pickNum + playersToBeDrafted.length)
        setYahooDraftedPlayerKeys(yahooDraftedPlayerKeys.concat(newPlayerKeys))

        setDraftedMap(new Map(draftedMap))
    }
}

async function getPlayersFromPlayerKeys(tokenCookie, setTokenCookie, playerKeys) {
    if (playerKeys.length === 0)
        return []
    const baseUrl = `${YahooFantasyApi}/players;player_keys=`
    if (playerKeys.length > 10) {
        const firstTen = await getPlayersFromPlayerKeys(tokenCookie, setTokenCookie, playerKeys.slice(0, 10))
        const theRest = await getPlayersFromPlayerKeys(tokenCookie, setTokenCookie, playerKeys.slice(10))
        return firstTen.concat(theRest)
    }

    // make the API call
    const accessToken = await getAccessToken(tokenCookie, setTokenCookie)
    const axiosResponse = await axios
        .get(`${baseUrl}${playerKeys.join(',')}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        })

    const result = await parseXML(axiosResponse.data)

    const players = result['fantasy_content']['players'][0]['player']
        .map(player => {
            return [player['name'][0]['full'][0], player['display_position'][0]]
        })

    return players
}

function parseXML(xml) {
    return new Promise((resolve, reject) => {
        parseString(xml, (err, result) => {
            if (err) reject(err)
            else resolve(result)
        })
    })
}